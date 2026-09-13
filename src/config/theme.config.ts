/**
 * Jeli — Design Token Configuration
 * ----------------------------------
 * Single source of truth for every color, shadow, font, and animation
 * curve used by the retro pixel-RPG theme. `tailwind.config.ts` imports
 * this file directly, so changing a hex value here (a rebrand, a
 * contrast fix, a new rarity color) propagates to every `bg-cyan-primary`,
 * `border-gold-deep`, `shadow-pixel-purple`, etc. class in the app without
 * touching a single component.
 *
 * `src/global.css` mirrors the `colors` palette below as CSS custom
 * properties (see the `:root` block there) for the rare cases — raw
 * inline SVG fills, `<canvas>` work, etc. — where a Tailwind utility
 * class isn't an option. Keep the two in sync when editing colors.
 */

export const THEME_COLORS = {
  cyan: {
    primary: "#00C7FF",
    deep: "#0CB4E3",
    soft: "#9ECFF9",
    accent: "#5CDBFF",
    highlight: "#7CE2FF",
  },
  bg: {
    ice: "#DBF7FF",
  },
  purple: {
    fab: "#8B5CF6",
    deep: "#6D28D9",
    highlight: "#C4B5FD",
  },
  emerald: {
    done: "#10B981",
    deep: "#047857",
    soft: "#A7F3D0",
  },
  gold: {
    DEFAULT: "#F5B700",
    deep: "#C98A00",
    highlight: "#FFE38A",
  },
  ruby: {
    dropped: "#EF4444",
    deep: "#B91C1C",
    soft: "#FCA5A5",
  },
} as const;

export const THEME_FONTS = {
  pixel: ["'Press Start 2P'", "cursive"],
  body: ["'Silkscreen'", "monospace"],
} as const;

/** Google Fonts stylesheet link loaded in `index.html` for the families above. */
export const THEME_FONT_STYLESHEET_URL =
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap";

export const THEME_SHADOWS = {
  "pixel-cyan": "0 4px 0 0 #0CB4E3, inset 0 2px 0 0 #7CE2FF",
  "pixel-cyan-active": "0 2px 0 0 #0CB4E3, inset 0 2px 0 0 #0CB4E3",
  "pixel-purple": "0 5px 0 0 #6D28D9, 0 6px 14px rgba(139,92,246,0.55), inset 0 2px 0 0 #C4B5FD",
  "pixel-purple-active": "0 2px 0 0 #6D28D9, 0 3px 8px rgba(139,92,246,0.4), inset 0 2px 0 0 #6D28D9",
  "pixel-gold": "0 4px 0 0 #C98A00, inset 0 2px 0 0 #FFE38A",
  "pixel-gold-active": "0 2px 0 0 #C98A00, inset 0 2px 0 0 #C98A00",
  "pixel-emerald": "0 4px 0 0 #047857, inset 0 2px 0 0 #A7F3D0",
  "pixel-emerald-active": "0 2px 0 0 #047857, inset 0 2px 0 0 #047857",
  "pixel-ruby": "0 4px 0 0 #B91C1C, inset 0 2px 0 0 #FCA5A5",
  "pixel-ruby-active": "0 2px 0 0 #B91C1C, inset 0 2px 0 0 #B91C1C",
  "pixel-card": "0 3px 0 0 rgba(12,180,227,0.35)",
  "pixel-inset": "inset 0 3px 0 0 rgba(12,180,227,0.25)",
} as const;

export const THEME_BACKGROUND_IMAGES = {
  "grid-ice":
    "linear-gradient(rgba(12,180,227,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(12,180,227,0.10) 1px, transparent 1px)",
} as const;

export const THEME_BACKGROUND_SIZES = {
  "grid-16": "16px 16px",
} as const;

export const THEME_BORDER_RADIUS = {
  pill: "999px",
} as const;

/**
 * Extra breakpoints beyond Tailwind's defaults. `xs` steps the Gallery
 * grid from 2 to 3 columns on slightly wider phones before `sm` kicks in.
 */
export const THEME_SCREENS = {
  xs: "480px",
} as const;

export const THEME_KEYFRAMES = {
  "pop-in": {
    "0%": { transform: "scale(0.6)", opacity: "0" },
    "60%": { transform: "scale(1.06)", opacity: "1" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
  "float-y": {
    "0%,100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-4px)" },
  },
} as const;

export const THEME_ANIMATIONS = {
  "pop-in": "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
  "float-y": "float-y 2.4s ease-in-out infinite",
} as const;
