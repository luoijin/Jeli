import { AnimatePresence } from "framer-motion";
import { useJeliStore } from "../../store/useJeliStore";
import type { Task } from "../../types";
import { SCREEN_TITLES } from "../../config";
import ScreenHeader, { HEADER_OFFSET_STYLE } from "../layout/ScreenHeader";
import QuestCapacityBar from "./QuestCapacityBar";
import TaskCard from "./TaskCard";
import screenLayout from "../../styles/screenLayout.module.css";
import styles from "./HomeScreen.module.css";

interface HomeScreenProps {
  onEditTask: (task: Task) => void;
}

export default function HomeScreen({ onEditTask }: HomeScreenProps) {
  const activeTasks = useJeliStore((s) => s.getActiveTasks());
  const completeTask = useJeliStore((s) => s.completeTask);

  return (
    <div className={screenLayout.screenBody} style={HEADER_OFFSET_STYLE}>
      <ScreenHeader title={SCREEN_TITLES.home} />

      <div className={styles.content}>
        <QuestCapacityBar count={activeTasks.length} />

        <div className={styles.taskList}>
          <AnimatePresence mode="popLayout">
            {activeTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onEdit={onEditTask} onComplete={completeTask} />
            ))}
          </AnimatePresence>

          {activeTasks.length === 0 && (
            <div className={`pixel-panel ${styles.emptyState}`}>
              <p className={styles.emptyTitle}>NO ACTIVE QUESTS</p>
              <p className={styles.emptyHint}>Tap the + button to start one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
