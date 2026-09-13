import { useEffect, useState } from "react";
import type { AppTab, Task } from "./types";
import BottomNav from "./components/layout/BottomNav";
import HomeScreen from "./components/home/HomeScreen";
import GalleryScreen from "./components/gallery/GalleryScreen";
import LogScreen from "./components/log/LogScreen";
import SettingsScreen from "./components/settings/SettingsScreen";
import AddQuestModal from "./components/quest/AddQuestModal";
import EditQuestModal from "./components/quest/EditQuestModal";
import RewardModal from "./components/reward/RewardModal";
import IntroScreen from "./components/intro/IntroScreen";
import ErrorBoundary from "./components/system/ErrorBoundary";
import { audioManager } from "./lib/audioManager";
import { useJeliStore } from "./store/useJeliStore";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<AppTab>("home");
  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const audio = useJeliStore((s) => s.audio);

  // The Zustand store is the single source of truth for volume/mute (it's
  // what the Settings slider reads and writes). Hydrate the audio manager
  // with it on every change so actual SFX playback always matches what's
  // shown on screen, instead of drifting out of sync with its own state.
  useEffect(() => {
    audioManager.init(audio.volume, audio.muted);
  }, [audio.volume, audio.muted]);

  // Global tactile feedback: every <button> press in the app plays a short
  // click SFX, layered underneath any action-specific sound (reward chime,
  // drop/add cue, etc). Using capture-phase event delegation means new
  // buttons added anywhere in the tree get the sound for free.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("button")) {
        audioManager.play("click");
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!entered) {
    return <IntroScreen onEnter={() => setEntered(true)} />;
  }

  return (
    <div onPointerDown={() => audioManager.unlock()} className="min-h-screen w-full">
      <ErrorBoundary>
        {tab === "home" && <HomeScreen onEditTask={setEditingTask} />}
        {tab === "gallery" && <GalleryScreen />}
        {tab === "log" && <LogScreen />}
        {tab === "settings" && <SettingsScreen />}
      </ErrorBoundary>

      <BottomNav active={tab} onChange={setTab} onAdd={() => setAddOpen(true)} />

      <AddQuestModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditQuestModal task={editingTask} onClose={() => setEditingTask(null)} />
      <RewardModal />
    </div>
  );
}
