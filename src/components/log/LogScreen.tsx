import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useJeliStore } from "../../store/useJeliStore";
import { LOG_TAB_LABELS, SCREEN_TITLES } from "../../config";
import ScreenHeader, { HEADER_OFFSET_STYLE } from "../layout/ScreenHeader";
import LogItem from "./LogItem";
import { cx } from "../../lib/cx";
import screenLayout from "../../styles/screenLayout.module.css";
import styles from "./LogScreen.module.css";

type LogTab = "done" | "dropped";

export default function LogScreen() {
  const [tab, setTab] = useState<LogTab>("done");
  const doneTasks = useJeliStore((s) => s.getDoneTasks());
  const droppedTasks = useJeliStore((s) => s.getDroppedTasks());

  const items = tab === "done" ? doneTasks : droppedTasks;

  return (
    <div className={screenLayout.screenBody} style={HEADER_OFFSET_STYLE}>
      <ScreenHeader title={SCREEN_TITLES.log} />

      <div className={styles.content}>
        <div className={styles.tabSwitcher}>
          <TabButton label={LOG_TAB_LABELS.done} active={tab === "done"} color="emerald" onClick={() => setTab("done")} />
          <TabButton
            label={LOG_TAB_LABELS.dropped}
            active={tab === "dropped"}
            color="ruby"
            onClick={() => setTab("dropped")}
          />
        </div>

        <AnimatePresence mode="popLayout">
          {items.map((task) => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LogItem task={task} variant={tab} />
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className={cx("pixel-panel", styles.emptyState)}>
            <p className={styles.emptyText}>{tab === "done" ? "NO QUESTS COMPLETED YET" : "NOTHING DROPPED YET"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: "emerald" | "ruby";
  onClick: () => void;
}) {
  const activeClass = color === "emerald" ? styles.tabButtonActiveDone : styles.tabButtonActiveDropped;

  return (
    <button type="button" onClick={onClick} className={cx(styles.tabButton, [active, activeClass])}>
      {label}
    </button>
  );
}
