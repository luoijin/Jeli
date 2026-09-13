import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      // Works around Linux's "EMFILE: too many open files" error, which
      // happens when the OS's inotify watch limit is lower than the
      // number of files Vite tries to watch (very common on dev machines
      // with several other file-watching tools/editors already running).
      // Polling checks file mtimes on an interval instead of holding an
      // OS-level watch handle open per file, so it sidesteps the limit
      // entirely — at the cost of slightly higher CPU usage and up to
      // `interval`ms delay before a save is picked up.
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});