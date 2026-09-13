import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Check, Pencil } from "lucide-react";
import type { Task } from "../../types";
import { cx } from "../../lib/cx";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onComplete: (id: string) => void;
}

/**
 * Shared spring for every open/close transition on this card (the
 * description's height reveal, the hint fading out, the edit button
 * sliding in). A single `MotionConfig` provider — rather than a bespoke
 * `transition` object on each `motion.*` element — is what the Motion.dev
 * Radix Accordion recipe uses to keep an expand/collapse interaction
 * feeling like one cohesive motion instead of several independently-timed
 * ones. `bounce: 0` makes it a critically-damped spring: no overshoot, so
 * the card never jitters past its resting height.
 */
const ACCORDION_TRANSITION = { type: "spring", bounce: 0, duration: 0.35 } as const;

/** Snappy, low-travel feedback for the tap itself — independent of the
 *  slower accordion transition so the press *feels* instant even while
 *  the content underneath eases open. */
const TAP_SCALE = { scale: 0.985 };

/** Roughly how long the collapse (accordion spring + description exit)
 *  takes to visually settle. Drives the hint's reappearance delay below. */
const COLLAPSE_SETTLE_MS = ACCORDION_TRANSITION.duration * 1000;

export default function TaskCard({ task, index, onEdit, onComplete }: TaskCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const hasDescription = Boolean(task.description);

  useEffect(() => {
    if (revealed) {
      // Opening: hide the hint immediately, no need to wait.
      setShowHint(false);
      return;
    }

    // Closing: wait for the collapse animation to visually finish before
    // bringing the hint back, so it never overlaps the shrinking description.
    const timeout = setTimeout(() => setShowHint(true), COLLAPSE_SETTLE_MS);
    return () => clearTimeout(timeout);
  }, [revealed]);

  function toggleRevealed() {
    setRevealed((r) => !r);
  }

  return (
    <MotionConfig transition={ACCORDION_TRANSITION}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileTap={TAP_SCALE}
        onClick={toggleRevealed}
        role="button"
        tabIndex={0}
        aria-expanded={revealed}
        aria-label={`${task.title}. Tap to ${revealed ? "hide" : "show"} details`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleRevealed();
          }
        }}
        className={cx("pixel-card", styles.card)}
      >
        <div className={styles.indexBadge}>{index + 1}</div>

        <div className={styles.body}>
          <h3 className={cx(styles.title, [revealed, styles.titleWrapped], [!revealed, styles.titleTruncated])}>
            {task.title}
          </h3>

          <AnimatePresence initial={false}>
            {!revealed && showHint && (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={styles.hint}
              >
                Tap to view
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {revealed && hasDescription && (
              <motion.div
                key="desc"
                variants={{
                  collapsed: { opacity: 0, height: 0, marginTop: 0 },
                  open: { opacity: 1, height: "auto", marginTop: 4 },
                }}
                initial="collapsed"
                animate="open"
                exit="collapsed"
                className={styles.description}
              >
                {task.description}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.actions}>
          <AnimatePresence initial={false}>
            {revealed && (
              <motion.button
                key="edit"
                type="button"
                aria-label="Edit quest"
                initial={{ opacity: 0, scale: 0.6, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className={styles.editButton}
              >
                <Pencil size={14} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            aria-label="Complete quest"
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            className={styles.completeButton}
          >
            <Check size={16} strokeWidth={3} />
          </motion.button>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
