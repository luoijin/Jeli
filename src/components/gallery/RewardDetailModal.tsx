import { AnimatePresence, motion } from "framer-motion";
import type { RewardDefinition } from "../../types";
import { cx } from "../../lib/cx";
import styles from "./RewardDetailModal.module.css";

interface RewardDetailModalProps {
  reward: RewardDefinition | null;
  quantity: number;
  onClose: () => void;
}

/** Full-detail view for a reward the player has already unlocked in the Gallery. */
export default function RewardDetailModal({ reward, quantity, onClose }: RewardDetailModalProps) {
  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cx("pixel-card", styles.panel)}
          >
            <span className={cx("pixel-badge", styles.quantityBadge)}>x{quantity} COLLECTED</span>

            <div className={styles.imageFrame}>
              <img src={reward.imageUrl} alt={reward.name} className={styles.image} />
            </div>

            <h3 className={styles.name}>{reward.name}</h3>

            <button type="button" onClick={onClose} className={cx("pixel-btn", styles.closeButton)}>
              CLOSE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
