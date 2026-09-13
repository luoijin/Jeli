import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useJeliStore } from "../../store/useJeliStore";
import { getRewardById } from "../../lib/rewards";
import { audioManager } from "../../lib/audioManager";
import { cx } from "../../lib/cx";
import styles from "./RewardModal.module.css";

export default function RewardModal() {
  const pendingReward = useJeliStore((s) => s.pendingReward);
  const acknowledgeReward = useJeliStore((s) => s.acknowledgeReward);
  const rewards = useJeliStore((s) => s.rewards);

  useEffect(() => {
    if (pendingReward) audioManager.play("reward");
  }, [pendingReward]);

  if (!pendingReward) return null;

  const reward = getRewardById(pendingReward.rewardId);

  // Defensive guard: if the reward id somehow doesn't resolve (corrupted
  // state, renamed asset), silently clear the pending reward instead of
  // crashing the whole app on a bad render.
  if (!reward) {
    acknowledgeReward();
    return null;
  }

  const currentQty = rewards.find((r) => r.rewardId === reward.id)?.quantity ?? 0;
  const newQty = currentQty + 1;

  return (
    <AnimatePresence>
      <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className={cx("pixel-card", styles.panel)}
        >
          <p className={styles.eyebrow}>QUEST COMPLETE!</p>
          <p className={styles.taskTitle}>{pendingReward.taskTitle}</p>

          <div className={styles.imageFrame}>
            <img src={reward.imageUrl} alt={reward.name} className={styles.image} />
          </div>

          <h3 className={styles.name}>{reward.name}</h3>
          <p className={styles.quantity}>x{newQty}</p>

          <button type="button" onClick={acknowledgeReward} className={cx("pixel-btn-gold", styles.claimButton)}>
            CLAIM REWARD
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
