# Jeli — Quest Journal

A gamified to-do list with a retro 2D pixel-RPG aesthetic. Complete
quests, earn random loot, and keep your active quest log under control —
only 5 quests can be active at once, so a 6th randomly bumps one to the
Dropped log.

## Quick start

```bash
npm install
npm run dev       
```

## Build for web

```bash
npm run build     
npm run preview  
```

## Configuration

Branding, business rules (like the 5-quest cap), defaults, screen copy,
and the entire color/shadow/font design system live in `src/config/`,
not scattered across components. See
[`docs/CONFIGURATION.md`](./docs/CONFIGURATION.md) before changing any of
these — it documents every config value and the couple of files (like
`index.html`) that are outside the config system's reach and must be
edited by hand.

## Styling

All global CSS — the Tailwind entrypoints, the `:root` color variables,
and the shared `.pixel-*` component classes (buttons, cards, panels,
inputs) used across every screen — lives in
[`src/global.css`](./src/global.css).

## Package for Android

See [`docs/CAPACITOR_BUILD_GUIDE.md`](./docs/CAPACITOR_BUILD_GUIDE.md) for
a full CLI-only (no Android Studio) walkthrough, or run the short version:

```bash
npm run build
npx cap add android      # first time only
npx cap sync android
npm run cap:build:apk
```

## Architecture & schema

- System diagrams, state strategy, and directory layout:
  [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Global configuration reference:
  [`docs/CONFIGURATION.md`](./docs/CONFIGURATION.md)
- Supabase/PostgreSQL DDL (optional cloud sync backend):
  [`supabase/schema.sql`](./supabase/schema.sql)

## Stack

React 18 + Vite + TypeScript · Tailwind CSS (tokens sourced from
`src/config/theme.config.ts`) · Framer Motion · Zustand (local-first,
persisted to `localStorage`) · Capacitor (Android) · Supabase (optional).
