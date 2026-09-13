import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AudioSettings, Task, UserProfile, UserRewardEntry } from "../types";
import { REWARD_CATALOG, rollRandomReward } from "../lib/rewards";
import { audioManager } from "../lib/audioManager";
import { AUDIO_CONFIG, DEFAULT_PROFILE, GAME_RULES, STORAGE_KEYS } from "../config";

/** @deprecated import `GAME_RULES.maxActiveTasks` from `../config` instead. Kept for backward compatibility. */
export const MAX_ACTIVE_TASKS = GAME_RULES.maxActiveTasks;

interface PendingReward {
  taskTitle: string;
  rewardId: string;
}

interface JeliState {
  tasks: Task[];
  rewards: UserRewardEntry[];
  profile: UserProfile;
  audio: AudioSettings;
  pendingReward: PendingReward | null;

  // derived-friendly selectors kept as plain functions (not persisted)
  getActiveTasks: () => Task[];
  getDoneTasks: () => Task[];
  getDroppedTasks: () => Task[];

  // actions
  addTask: (title: string, description: string) => void;
  editTask: (id: string, title: string, description: string) => void;
  completeTask: (id: string) => void;
  acknowledgeReward: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setVolume: (value: number) => void;
  setMuted: (muted: boolean) => void;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useJeliStore = create<JeliState>()(
  persist(
    (set, get) => ({
      tasks: [],
      rewards: REWARD_CATALOG.map((r) => ({ rewardId: r.id, quantity: 0 })),
      profile: { ...DEFAULT_PROFILE },
      audio: { volume: AUDIO_CONFIG.defaultVolume, muted: AUDIO_CONFIG.defaultMuted },
      pendingReward: null,

      getActiveTasks: () => get().tasks.filter((t) => t.status === "active"),
      getDoneTasks: () =>
        get()
          .tasks.filter((t) => t.status === "done")
          .sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? "")),
      getDroppedTasks: () =>
        get()
          .tasks.filter((t) => t.status === "dropped")
          .sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? "")),

      /**
       * Core overflow mechanic: if there are already MAX_ACTIVE_TASKS active
       * tasks, one is chosen uniformly at random and moved to "dropped"
       * before the new task is inserted.
       */
      addTask: (title, description) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        set((state) => {
          const active = state.tasks.filter((t) => t.status === "active");
          let tasks = state.tasks;

          if (active.length >= GAME_RULES.maxActiveTasks) {
            const victim = active[Math.floor(Math.random() * active.length)];
            tasks = tasks.map((t) =>
              t.id === victim.id ? { ...t, status: "dropped" as const, resolvedAt: nowIso() } : t
            );
          }

          const newTask: Task = {
            id: uid(),
            title: trimmedTitle,
            description: description.trim(),
            status: "active",
            createdAt: nowIso(),
            resolvedAt: null,
            rewardId: null,
          };

          return { tasks: [...tasks, newTask] };
        });
      },

      editTask: (id, title, description) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, title: trimmedTitle, description: description.trim() } : t
          ),
        }));
      },

      /** Marks a task done, rolls a random reward, and queues the reward popup. */
      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task || task.status !== "active") return;

        const rewardId = rollRandomReward();
        audioManager.play("complete");

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "done" as const, resolvedAt: nowIso(), rewardId } : t
          ),
          pendingReward: { taskTitle: task.title, rewardId },
        }));
      },

      /** Called when the player closes the reward popup — commits it to the gallery. */
      acknowledgeReward: () => {
        const pending = get().pendingReward;
        if (!pending) return;
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.rewardId === pending.rewardId ? { ...r, quantity: r.quantity + 1 } : r
          ),
          pendingReward: null,
        }));
      },

      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),

      setVolume: (value) => {
        const clamped = Math.min(AUDIO_CONFIG.maxVolume, Math.max(AUDIO_CONFIG.minVolume, value));
        set((state) => ({
          audio: { ...state.audio, volume: clamped, muted: clamped === 0 ? state.audio.muted : false },
        }));
      },

      setMuted: (muted) => set((state) => ({ audio: { ...state.audio, muted } })),
    }),
    {
      name: STORAGE_KEYS.store,
      partialize: (state) => ({
        tasks: state.tasks,
        rewards: state.rewards,
        profile: state.profile,
        audio: state.audio,
      }),
      /**
       * Reconciles persisted reward quantities against the *current*
       * REWARD_CATALOG on load. Without this, a reward earned in a
       * previous session can end up with no matching entry after the
       * catalog changes (e.g. a reward image added/renamed), so claiming
       * it silently has nowhere to record the quantity and the Gallery
       * keeps showing it as locked forever, even though it was claimed.
       * This guarantees every catalog item always has a slot, carrying
       * over any quantity already earned for it.
       */
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<JeliState> | undefined) ?? {};
        const persistedRewards = persisted.rewards ?? [];
        const quantityByRewardId = new Map(persistedRewards.map((r) => [r.rewardId, r.quantity]));

        const reconciledRewards = REWARD_CATALOG.map((reward) => ({
          rewardId: reward.id,
          quantity: quantityByRewardId.get(reward.id) ?? 0,
        }));

        return {
          ...currentState,
          ...persisted,
          rewards: reconciledRewards,
        };
      },
    }
  )
);
