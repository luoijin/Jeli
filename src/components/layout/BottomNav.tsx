import { Home, Trophy, ScrollText, Settings } from "lucide-react";
import type { AppTab } from "../../types";
import { NAV_LABELS } from "../../config";
import { cx } from "../../lib/cx";
import styles from "./BottomNav.module.css";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  onAdd: () => void;
}

const LEFT_ITEMS: { key: AppTab; label: string; icon: typeof Home }[] = [
  { key: "home", label: NAV_LABELS.home, icon: Home },
  { key: "gallery", label: NAV_LABELS.gallery, icon: Trophy },
];

const RIGHT_ITEMS: { key: AppTab; label: string; icon: typeof Home }[] = [
  { key: "log", label: NAV_LABELS.log, icon: ScrollText },
  { key: "settings", label: NAV_LABELS.settings, icon: Settings },
];

/**
 * Expanded curve path:
 * Widened start points to x=140 / x=260 and dropped center depth to y=42.
 * This gives ample clearance even at the lowest point of the floating animation.
 */
const NAV_BAR_PATH =
  "M 32,0 L 140,0 " +
  "C 160,0 156,42 200,42 " +
  "C 244,42 240,0 260,0 " +
  "L 368,0 " +
  "A 32,32 0 0 1 400,32 " +
  "L 400,32 " +
  "A 32,32 0 0 1 368,64 " +
  "L 32,64 " +
  "A 32,32 0 0 1 0,32 " +
  "L 0,32 " +
  "A 32,32 0 0 1 32,0 Z";

export default function BottomNav({ active, onChange, onAdd }: BottomNavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.barGrid}>
        <svg className={styles.barSvg} viewBox="-2 -2 404 68" preserveAspectRatio="none" aria-hidden>
          <path d={NAV_BAR_PATH} className={styles.barPath} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>

        {LEFT_ITEMS.map((item) => (
          <NavButton key={item.key} item={item} active={active === item.key} onClick={() => onChange(item.key)} />
        ))}

        <div aria-hidden />

        {RIGHT_ITEMS.map((item) => (
          <NavButton key={item.key} item={item} active={active === item.key} onClick={() => onChange(item.key)} />
        ))}

        <div className={styles.fabWrapper}>
          <button
            type="button"
            aria-label={NAV_LABELS.add}
            onClick={onAdd}
            className={cx("pixel-btn-purple", styles.fabButton)}
          >
            <span className={styles.fabGlyph}>+</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { key: AppTab; label: string; icon: typeof Home };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button type="button" aria-label={item.label} onClick={onClick} className={styles.navButton}>
      <Icon size={22} strokeWidth={2.5} className={active ? styles.navIconActive : styles.navIconInactive} />
    </button>
  );
}
