import type { RewardDefinition } from "../types";

// Drop any image into src/assets/rewards/ and it automatically becomes a
// collectible reward. The reward's display name is derived straight from
// the filename, e.g. "Seulgi.jpg" -> reward named "Seulgi",
// "gold-crown.png" -> reward named "Gold Crown".
const rewardImageModules = import.meta.glob("../assets/rewards/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nameFromFilename(path: string): string {
  const filename = path.split("/").pop() ?? path;
  const withoutExtension = filename.replace(/\.[^./]+$/, "");
  return withoutExtension
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const REWARD_CATALOG: RewardDefinition[] = Object.entries(rewardImageModules)
  .map(([path, imageUrl]) => {
    const name = nameFromFilename(path);
    return { id: slugify(name), name, imageUrl };
  })
  // stable, predictable ordering for the gallery grid
  .sort((a, b) => a.name.localeCompare(b.name));

/** Every reward currently has equal drop odds — swap in weights here if needed later. */
export function rollRandomReward(): string {
  if (REWARD_CATALOG.length === 0) {
    throw new Error("No reward images found in src/assets/rewards");
  }
  const index = Math.floor(Math.random() * REWARD_CATALOG.length);
  return REWARD_CATALOG[index].id;
}

/**
 * Looks up a reward by id. Returns `undefined` instead of throwing when the
 * id doesn't match anything in the current catalog (e.g. a reward image was
 * renamed/removed after older tasks/history already referenced its id) so
 * that callers like the Quest Log can render gracefully instead of crashing
 * the whole app to a blank screen.
 */
export function getRewardById(id: string): RewardDefinition | undefined {
  return REWARD_CATALOG.find((r) => r.id === id);
}
