# Global Configuration

```
src/config/
├── index.ts          # barrel export — `import { X } from "../../config"`
├── app.config.ts      # identity, game rules, defaults, copy, timings
└── theme.config.ts    # colors, shadows, fonts, radius, keyframes
```

Import from the barrel in components (`import { SCREEN_TITLES } from
"../../config"`) rather than reaching into the individual files, so the
import path stays stable if the config is ever split further.

## `app.config.ts`

| Export | Contains | Consumed by |
|---|---|---|
| `APP_IDENTITY` | `name`, `fullName`, `tagline`, `version`, `bundleId`, `copyrightHolder` | `IntroScreen`, `SettingsScreen`, `ErrorBoundary`, `capacitor.config.ts` |
| `MASCOT` | `src`, `alt` for the jellyfish artwork | `IntroScreen` |
| `GAME_RULES` | `maxActiveTasks` (5), `taskTitleMaxLength` (60), `taskDescriptionMaxLength` (200), `profileNameMaxLength` (20) | `useJeliStore`, `QuestCapacityBar`, `AddQuestModal`, `EditQuestModal`, `SettingsScreen` |
| `DEFAULT_PROFILE` | Starting `displayName`, `level`, `avatarEmoji` for a new player | `useJeliStore` |
| `AUDIO_CONFIG` | `defaultVolume`, `minVolume`, `maxVolume`, `defaultMuted`, `sources` (sfx key → `.wav` path) | `useJeliStore`, `audioManager`, `SettingsScreen` |
| `STORAGE_KEYS` | `store` (zustand/persist key), `legacyAudio` (pre-store migration key) | `useJeliStore`, `audioManager` |
| `SCREEN_TITLES` | Header text per tab (`home`, `gallery`, `log`, `settings`) | `HomeScreen`, `GalleryScreen`, `LogScreen`, `SettingsScreen` |
| `NAV_LABELS` | Bottom nav button labels/aria-labels | `BottomNav` |
| `LOG_TAB_LABELS` | `done` / `dropped` tab text on the Quest Log | `LogScreen` |
| `LAYOUT_CONFIG` | `headerHeightPx` — the one fixed-header height every screen offsets against | `ScreenHeader` |
| `TIMINGS` | Intro screen and task-card animation durations, in ms | `IntroScreen`, `TaskCard` |

## `theme.config.ts`



| Export | Tailwind theme key | Example classes it powers |
|---|---|---|
| `THEME_COLORS` | `colors` | `bg-cyan-primary`, `border-gold-deep`, `text-ruby-dropped` |
| `THEME_SHADOWS` | `boxShadow` | `shadow-pixel-purple`, `active:shadow-pixel-cyan-active` |
| `THEME_FONTS` | `fontFamily` | `font-pixel` (Press Start 2P), `font-body` (Silkscreen) |
| `THEME_BACKGROUND_IMAGES` / `THEME_BACKGROUND_SIZES` | `backgroundImage` / `backgroundSize` | `bg-grid-ice bg-grid-16` |
| `THEME_BORDER_RADIUS` | `borderRadius` | `rounded-pill` |
| `THEME_SCREENS` | `screens` | `xs:grid-cols-3` on the Gallery grid |
| `THEME_KEYFRAMES` / `THEME_ANIMATIONS` | `keyframes` / `animation` | `animate-float-y` on the FAB, `animate-pop-in` |


## Files the config system can't reach

Two files reference the same conceptual values but live outside the path
a live import can safely reach, so they're kept in sync by hand:

- **`index.html`** — the `<title>` tag and `<meta name="theme-color">`
  duplicate `APP_IDENTITY.fullName` and `THEME_COLORS.bg.ice`. Vite
  doesn't process `<script>`-free static HTML through the module graph
  by default, so there's no live binding here. Update both by hand if
  you rebrand or change the ice-background color.
- **`capacitor.config.ts`** — *does* import `APP_IDENTITY` (for `appId`
  / `appName`) and `THEME_COLORS` (for the Android splash background)
  directly, since the Capacitor CLI's config loader supports local
  relative TS imports. No manual sync needed here, but re-run
  `npx cap sync android` after changing either so the native project
  picks up the new values.

