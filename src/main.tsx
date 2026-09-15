import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/**
 * Self-hosted pixel fonts (via @fontsource). Imported here as JS module
 * imports — not a CSS `@import` — so Vite's normal module resolver
 * handles the bare `@fontsource/...` specifiers reliably. Bundled into
 * the build, so there's no network request and it works fully offline
 * in the APK. Only latin + latin-ext subsets are pulled in.
 */
import "@fontsource/press-start-2p/latin.css";
import "@fontsource/press-start-2p/latin-ext.css";
import "@fontsource/silkscreen/latin-400.css";
import "@fontsource/silkscreen/latin-ext-400.css";
import "@fontsource/silkscreen/latin-700.css";
import "@fontsource/silkscreen/latin-ext-700.css";

import "./global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);