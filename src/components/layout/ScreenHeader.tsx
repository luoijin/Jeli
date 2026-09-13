import type { CSSProperties, ReactNode } from "react";
import { LAYOUT_CONFIG } from "../../config";
import styles from "./ScreenHeader.module.css";

/** Fixed header height (excludes safe-area inset). Kept as one constant so
 *  every screen's content wrapper can reserve the exact same top offset —
 *  see `HEADER_OFFSET_STYLE` below. Sourced from LAYOUT_CONFIG.headerHeightPx. */
export const HEADER_HEIGHT_PX = LAYOUT_CONFIG.headerHeightPx;

/**
 * Inline style every screen spreads onto its scroll container's `style`
 * prop so content starts right below the fixed header, on every screen,
 * with identical spacing — that's what makes the header feel "unified"
 * rather than each screen guessing its own top padding.
 *
 * This only ever sets the `--jeli-header-height` CSS custom property; the
 * actual `padding-top` calculation (header height + safe-area inset) lives
 * in `src/styles/screenLayout.module.css`, where it belongs. A JS-driven
 * inline *value* still has to cross the JS/CSS boundary somehow — Tailwind
 * can't do it, because its JIT compiler only emits CSS for class strings
 * it can find literally in the source text, and `HEADER_HEIGHT_PX` is a
 * runtime value from config, not a string Tailwind can scan. A CSS custom
 * property is the narrowest possible way to cross that boundary: one
 * number in, and every real layout rule stays in an actual stylesheet.
 */
export const HEADER_OFFSET_STYLE: CSSProperties = {
  ["--jeli-header-height" as string]: `${HEADER_HEIGHT_PX}px`,
};

interface ScreenHeaderProps {
  /** Main title text, e.g. "JELI", "TROPHY GALLERY". */
  title: string;
  /** Optional small leading icon/mascot shown left of the title. */
  icon?: ReactNode;
  /** Optional trailing content shown right-aligned in the header (e.g. a counter badge). */
  right?: ReactNode;
}

export default function ScreenHeader({ title, icon, right }: ScreenHeaderProps) {
  return (
    <header className={styles.header} style={HEADER_OFFSET_STYLE}>
      <div className={styles.row}>
        {icon && <span className={styles.iconSlot}>{icon}</span>}
        <h1 className={styles.title}>{title}</h1>
        {right && <span className={styles.rightSlot}>{right}</span>}
      </div>
    </header>
  );
}
