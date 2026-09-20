# Jeli — Quest Journal

A gamified to-do list with a retro 2D pixel-RPG aesthetic. Complete
quests, earn random loot, and keep your active quest log under control —
only 5 quests can be active at once, so a 6th randomly bumps one to the
Dropped log.

## Download Application

Click below to download the latest Android APK directly to your phone:

[![Download Android APK](https://img.shields.io/badge/Download-jeli--quest--journal.apk-7C3AED?style=for-the-badge&logo=android&logoColor=white)](https://github.com/luoijin/Jeli/releases/download/v1.0.0/jeli-quest-journal.apk)

[![Total Downloads](https://img.shields.io/github/downloads/luoijin/Jeli/total?style=for-the-badge&logo=android&logoColor=white&color=7C3AED)](https://github.com/luoijin/Jeli/releases)

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
- Enterprise security baseline & OWASP MASVS controls:
  [`docs/SECURITY.md`](./docs/SECURITY.md)

## Offline, sandboxing & data security

Jeli is **fully offline and air-gapped — there is no backend, no account, and
no network call anywhere in the app.**
- **Zero Permissions:** `AndroidManifest.xml` declares no network or hardware permissions (`android.permission.INTERNET` is omitted).
- **Cleartext Blocked & Cloud Backup Disabled:** `usesCleartextTraffic="false"`, `allowBackup="false"`, and `fullBackupContent="false"` protect local data from unencrypted transmission or cloud drive leaks.
- **On-Device Sandbox:** All quests, rewards, and settings live only in native private internal storage (Android SharedPreferences with `MODE_PRIVATE` via `@capacitor/preferences`, `localStorage` in the web preview).
- **Hardened Release Builds:** Compiled with R8 byte-code optimization, minification, and resource shrinking (`minifyEnabled true`, `shrinkResources true`).
See [`docs/SECURITY.md`](./docs/SECURITY.md) for the complete security specification.

## Stack

React 18 + Vite + TypeScript · Tailwind CSS (tokens sourced from
`src/config/theme.config.ts`) · Framer Motion · Zustand (persisted via
`@capacitor/preferences`) · Capacitor (Android).

## Credits

Reward/loot artwork used in the Gallery collection is from Friendly Rivalry and is not original work — used here for personal, non-commercial project purposes only.

## License

Copyright © 2026 luoijin. All rights reserved.

No part of this project may be copied, distributed, or modified without the express written permission of the author.

