export type TaskStatus = "active" | "done" | "dropped";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO timestamp
  resolvedAt: string | null; // when it became done/dropped
  rewardId: string | null; // reward earned, only set when status === "done"
}

export interface RewardDefinition {
  id: string; // slug derived from the image filename
  name: string; // display name derived from the image filename
  imageUrl: string;
}

export interface UserRewardEntry {
  rewardId: string;
  quantity: number;
}

export interface UserProfile {
  displayName: string;
  level: number;
  avatarEmoji: string;
}

export interface AudioSettings {
  volume: number; // 0-100
  muted: boolean;
}

export type AppTab = "home" | "gallery" | "log" | "settings";
