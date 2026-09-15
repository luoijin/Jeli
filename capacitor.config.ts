import type { CapacitorConfig } from "@capacitor/cli";
import { APP_IDENTITY } from "./src/config/app.config";
import { THEME_COLORS } from "./src/config/theme.config";

const config: CapacitorConfig = {
  appId: APP_IDENTITY.bundleId,
  appName: APP_IDENTITY.name,
  webDir: "dist",
  server: {
    androidScheme: "https",
    url: "http://10.0.2.2:5173", // Points to your host machine's localhost
    cleartext: true
  },
  android: {
    backgroundColor: THEME_COLORS.bg.ice,
  },
};

export default config;