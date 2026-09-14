import { Preferences } from "@capacitor/preferences";
import type { StateStorage } from "zustand/middleware";

/**
 * On-device storage adapter — the app's entire "database".
 * -----------------------------------------------------------------------
 * Jeli has no backend. `useJeliStore` (via zustand/persist) is the only
 * data store the app has, and this file is what actually puts its bytes
 * on the device.
 *
 * Backed by `@capacitor/preferences`, which writes through to:
 *   - Android: native SharedPreferences (survives app restarts and OS
 *     memory pressure; not cleared by the WebView cache being cleared)
 *   - Web / `npm run dev` preview: `localStorage`, transparently — so the
 *     exact same adapter works in the browser during development and in
 *     the packaged APK without any environment branching here.
 *
 * This replaces calling `localStorage` directly. Reading/writing
 * `localStorage` from inside an Android WebView works, but it lives in
 * the WebView's cache partition, which Android is free to evict under
 * storage pressure — not what you want for quest history a player has
 * earned. SharedPreferences is the OS-level, app-scoped store Android
 * apps are expected to use for exactly this.
 *
 * Implements zustand's `StateStorage` interface, so it drops straight
 * into `persist(..., { storage: createJSONStorage(() => preferencesStorage) })`.
 */
export const preferencesStorage: StateStorage = {
  getItem: async (name) => {
    const { value } = await Preferences.get({ key: name });
    return value ?? null;
  },
  setItem: async (name, value) => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name) => {
    await Preferences.remove({ key: name });
  },
};
