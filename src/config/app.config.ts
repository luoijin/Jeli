/**
 * Jeli — Application Configuration
 * ----------------------------------
 * Every value here was previously hardcoded inline across components,
 * the store, and the audio manager. This file is now the single place
 * to change branding, business rules, defaults, and copy — nothing
 * downstream should re-declare these numbers/strings itself.
 *
 * NOTE on files this config can't reach: `index.html` (page <title>,
 * theme-color meta) and `capacitor.config.ts` read a few of these same
 * conceptual values but live outside Vite's module graph in ways that
 * make a live import impractical (raw static HTML) or risky (the
 * Capacitor CLI's own config loader). `capacitor.config.ts` *does*
 * import `APP_IDENTITY` below. `index.html` does not — if you rename
 * the app, update its <title> and meta theme-color by hand too. See
 * docs/CONFIGURATION.md for the full list of these edge cases.
 */

// ---------------------------------------------------------------------------
// Identity & branding
// ---------------------------------------------------------------------------

export const APP_IDENTITY = {
  /** Short display name, e.g. shown on the intro screen and About section. */
  name: "Jeli",
  /** Full title used in docs, package metadata, and page titles. */
  fullName: "Jeli — Quest Journal",
  /** Subtitle shown under the wordmark on the intro screen. */
  tagline: "QUEST JOURNAL",
  /** Semver string surfaced in Settings > About. Keep in sync with package.json. */
  version: "1.0.0",
  /** Native app id (reverse-DNS). Used by capacitor.config.ts. */
  bundleId: "com.jeli.questjournal",
  /** Copyright line footer text (year is appended automatically). */
  copyrightHolder: "Jeli Quest Journal",
} as const;

export const MASCOT = {
  src: "/jeli-mascot.png",
  alt: "Jeli",
} as const;

// ---------------------------------------------------------------------------
// Core gameplay / business rules
// ---------------------------------------------------------------------------

export const GAME_RULES = {
  /** Hard cap on simultaneously active quests shown on Home. */
  maxActiveTasks: 5,
  /** Max characters accepted for a quest title. */
  taskTitleMaxLength: 60,
  /** Max characters accepted for a quest description. */
  taskDescriptionMaxLength: 200,
  /** Max characters accepted for the profile display name. */
  profileNameMaxLength: 20,
} as const;

export const DEFAULT_PROFILE = {
  displayName: "Adventurer",
  level: 1,
  avatarEmoji: "🫐",
} as const;

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export const AUDIO_CONFIG = {
  defaultVolume: 70,
  minVolume: 0,
  maxVolume: 100,
  defaultMuted: false,
  /**
   * Looping background bed for the "Café Jazz" theme — a soft ii-V-I vamp
   * that plays continuously under the SFX above. Started once on the
   * intro screen's first tap (see `audioManager.unlock()`), since mobile
   * browsers require a user gesture before any audio — including a
   * background loop — can start.
   */
  ambientSource: "/audio/ambient.mp3",
  /** Ambient sits under SFX in the mix rather than matching it 1:1, so a
   *  quest-complete chime still cuts through the background loop. Applied
   *  on top of the master volume, not instead of it. */
  ambientGain: 0.55,
} as const;

// ---------------------------------------------------------------------------
// Persistence keys
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  /** zustand/persist key for the main app store (tasks, rewards, profile, audio). */
  store: "jeli-app-storage",
  /** Legacy pre-store audio settings key, still read once as a migration fallback. */
  legacyAudio: "jeli-audio-settings",
} as const;

// ---------------------------------------------------------------------------
// Navigation & screen copy
// ---------------------------------------------------------------------------

export const SCREEN_TITLES = {
  home: "JELI QUEST",
  gallery: "TROPHY GALLERY",
  log: "QUEST LOG",
  settings: "SETTINGS",
} as const;

export const NAV_LABELS = {
  home: "Home",
  gallery: "Gallery",
  log: "Log",
  settings: "Settings",
  add: "Add quest",
} as const;

export const LOG_TAB_LABELS = {
  done: "DONE",
  dropped: "DROPPED",
} as const;

// ---------------------------------------------------------------------------
// Layout & timing
// ---------------------------------------------------------------------------

export const LAYOUT_CONFIG = {
  /** Fixed header height in px (excludes safe-area inset). Every screen's
   *  scroll container reserves exactly this much top offset. */
  headerHeightPx: 52,
} as const;

export const TIMINGS = {
  /** Intro screen tap-out fade/scale duration, in ms. */
  introExitAnimationMs: 500,
  /** Delay before mounting the Home screen after the intro tap, in ms. */
  introEnterDelayMs: 550,
  /** How long a TaskCard's collapse animation takes to visually settle, in ms. */
  taskCollapseMs: 200,
} as const;
