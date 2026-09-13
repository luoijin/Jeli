import type { Task } from "../../types";
import { getRewardById } from "../../lib/rewards";
import { cx } from "../../lib/cx";
import styles from "./LogItem.module.css";

interface LogItemProps {
  task: Task;
  variant: "done" | "dropped";
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LogItem({ task, variant }: LogItemProps) {
  const isDone = variant === "done";
  const reward = task.rewardId ? getRewardById(task.rewardId) : undefined;

  return (
    <div className={cx("pixel-card", styles.row, [isDone, styles.rowDone], [!isDone, styles.rowDropped])}>
      <div className={styles.body}>
        <h4 className={cx(styles.title, [isDone, styles.titleDone], [!isDone, styles.titleDropped])}>
          {task.title}
        </h4>
        <p className={styles.timestamp}>{formatTimestamp(task.resolvedAt)}</p>
      </div>

      {isDone && reward && (
        <span className={styles.rewardChip}>
          <img src={reward.imageUrl} alt={reward.name} className={styles.rewardIcon} />
          <span className={styles.rewardCount}>+1</span>
        </span>
      )}
    </div>
  );
}
