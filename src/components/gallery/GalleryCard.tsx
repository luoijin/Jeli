import { Lock } from "lucide-react";
import type { RewardDefinition } from "../../types";
import { cx } from "../../lib/cx";
import styles from "./GalleryCard.module.css";

interface GalleryCardProps {
  reward: RewardDefinition;
  quantity: number;
  onView?: () => void;
}

export default function GalleryCard({ reward, quantity, onView }: GalleryCardProps) {
  const unlocked = quantity > 0;

  return (
    <button
      type="button"
      role={unlocked ? "button" : undefined}
      aria-disabled={!unlocked}
      disabled={!unlocked}
      onClick={unlocked ? onView : undefined}
      className={cx("pixel-card", styles.card, [unlocked, styles.cardUnlocked], [!unlocked, styles.cardLocked])}
    >
      <div className={styles.imageFrame}>
        <img
          src={reward.imageUrl}
          alt={unlocked ? reward.name : "Locked reward"}
          className={cx(styles.image, [!unlocked, styles.imageLocked])}
          style={{ imageRendering: "auto" }}
        />

        {/* <span className={styles.nameTag}>{unlocked ? reward.name : "???"}</span> */}

        {!unlocked && (
          <div className={styles.lockOverlay}>
            <Lock size={22} className="text-slate-500" />
          </div>
        )}
      </div>

      {unlocked && <span className={cx("pixel-badge", styles.quantityBadge)}>x{quantity}</span>}
    </button>
  );
}
