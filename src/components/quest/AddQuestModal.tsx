import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useJeliStore } from "../../store/useJeliStore";
import { GAME_RULES } from "../../config";
import { audioManager } from "../../lib/audioManager";
import { cx } from "../../lib/cx";
import styles from "./AddQuestModal.module.css";

interface AddQuestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddQuestModal({ open, onClose }: AddQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const addTask = useJeliStore((s) => s.addTask);
  const activeCount = useJeliStore((s) => s.getActiveTasks().length);

  const isOverflowing = activeCount >= GAME_RULES.maxActiveTasks;

  function handleClose() {
    setTitle("");
    setDescription("");
    onClose();
  }

  function handleSubmit() {
    if (!title.trim()) return;
    addTask(title, description);
    audioManager.play(isOverflowing ? "drop" : "add");
    handleClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cx("pixel-panel", styles.panel)}
          >
            <button type="button" aria-label="Close" onClick={handleClose} className={cx("pixel-btn", styles.closeButton)}>
              <X size={16} strokeWidth={3} />
            </button>

            <h2 className={styles.heading}>NEW QUEST</h2>

            {isOverflowing && (
              <div className={styles.overflowWarning}>
                ⚠ Quest log is full ({GAME_RULES.maxActiveTasks}/{GAME_RULES.maxActiveTasks}). Adding this will
                randomly drop one active quest to your history.
              </div>
            )}

            <div className={styles.form}>
              {/*
                autoCapitalize/autoCorrect/spellCheck are turned off so a
                quest's default typing case is whatever the player actually
                types — lowercase by default on mobile — instead of the
                device keyboard silently capitalizing the first letter of
                every sentence. Whatever case ends up in `title`/
                `description` is exactly what TaskCard renders later; there
                is no uppercase transform applied anywhere downstream.
              */}
              <input
                className={cx("pixel-input", styles.textInput)}
                placeholder="Quest title"
                value={title}
                maxLength={GAME_RULES.taskTitleMaxLength}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <textarea
                className={cx("pixel-input", styles.textArea)}
                placeholder="Description (optional)"
                value={description}
                maxLength={GAME_RULES.taskDescriptionMaxLength}
                onChange={(e) => setDescription(e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={cx("pixel-btn-purple", styles.submitButton)}
              >
                START QUEST
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
