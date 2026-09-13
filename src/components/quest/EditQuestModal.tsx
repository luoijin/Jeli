import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useJeliStore } from "../../store/useJeliStore";
import { GAME_RULES } from "../../config";
import type { Task } from "../../types";
import { cx } from "../../lib/cx";
import styles from "./EditQuestModal.module.css";

interface EditQuestModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function EditQuestModal({ task, onClose }: EditQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const editTask = useJeliStore((s) => s.editTask);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  function handleSave() {
    if (!task || !title.trim()) return;
    editTask(task.id, title, description);
    onClose();
  }

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cx("pixel-panel", styles.panel)}
          >
            <button type="button" aria-label="Close" onClick={onClose} className={cx("pixel-btn", styles.closeButton)}>
              <X size={16} strokeWidth={3} />
            </button>

            <h2 className={styles.heading}>EDIT QUEST</h2>

            <div className={styles.form}>
              {/* Preserves exactly whatever case the player types — see the
                  matching note in AddQuestModal.tsx. */}
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
                onClick={handleSave}
                disabled={!title.trim()}
                className={cx("pixel-btn-purple", styles.saveButton)}
              >
                SAVE CHANGES
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
