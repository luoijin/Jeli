import { GAME_RULES } from "../../config";
import { cx } from "../../lib/cx";
import styles from "./QuestCapacityBar.module.css";

interface QuestCapacityBarProps {
  count: number;
}

/** Segmented pill showing how many of the 5 active-quest slots are filled. */
export default function QuestCapacityBar({ count }: QuestCapacityBarProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {Array.from({ length: GAME_RULES.maxActiveTasks }).map((_, i) => (
          <div
            key={i}
            className={cx(styles.segment, [i < count, styles.segmentFilled], [i >= count, styles.segmentEmpty])}
          />
        ))}
      </div>
      <span className={cx("pixel-badge", styles.badge)}>
        {count}/{GAME_RULES.maxActiveTasks}
      </span>
    </div>
  );
}
