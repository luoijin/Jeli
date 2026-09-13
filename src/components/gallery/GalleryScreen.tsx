import { useState } from "react";
import { motion } from "framer-motion";
import { useJeliStore } from "../../store/useJeliStore";
import { REWARD_CATALOG } from "../../lib/rewards";
import type { RewardDefinition } from "../../types";
import { SCREEN_TITLES } from "../../config";
import ScreenHeader, { HEADER_OFFSET_STYLE } from "../layout/ScreenHeader";
import GalleryCard from "./GalleryCard";
import RewardDetailModal from "./RewardDetailModal";
import screenLayout from "../../styles/screenLayout.module.css";
import styles from "./GalleryScreen.module.css";

/**
 * Stagger choreography for the loot grid's reveal. `GalleryScreen` is
 * conditionally rendered in `App.tsx` (mounted fresh every time the player
 * taps the Gallery tab), so this `initial`/`animate` pair replays on every
 * visit instead of only once per app session — the whole point being that
 * loot pops in one card after another, fast, rather than appearing all at
 * once the instant the tab is tapped.
 */
const GRID_VARIANTS = {
  hidden: {},
  shown: {
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.75, y: 10 },
  shown: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
};

export default function GalleryScreen() {
  const rewards = useJeliStore((s) => s.rewards);
  const unlockedCount = rewards.filter((r) => r.quantity > 0).length;
  const [selectedReward, setSelectedReward] = useState<RewardDefinition | null>(null);

  const selectedQuantity = selectedReward
    ? rewards.find((r) => r.rewardId === selectedReward.id)?.quantity ?? 0
    : 0;

  return (
    <div className={screenLayout.screenBody} style={HEADER_OFFSET_STYLE}>
      <ScreenHeader
        title={SCREEN_TITLES.gallery}
        right={
          <span className={styles.headerCount}>
            {unlockedCount}/{REWARD_CATALOG.length}
          </span>
        }
      />

      <motion.div className={styles.lootGrid} variants={GRID_VARIANTS} initial="hidden" animate="shown">
        {REWARD_CATALOG.map((reward) => {
          const quantity = rewards.find((r) => r.rewardId === reward.id)?.quantity ?? 0;
          return (
            <motion.div key={reward.id} variants={CARD_VARIANTS}>
              <GalleryCard reward={reward} quantity={quantity} onView={() => setSelectedReward(reward)} />
            </motion.div>
          );
        })}
      </motion.div>

      <RewardDetailModal
        reward={selectedReward}
        quantity={selectedQuantity}
        onClose={() => setSelectedReward(null)}
      />
    </div>
  );
}
