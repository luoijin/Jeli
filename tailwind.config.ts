import type { Config } from "tailwindcss";
import {
  THEME_ANIMATIONS,
  THEME_BACKGROUND_IMAGES,
  THEME_BACKGROUND_SIZES,
  THEME_BORDER_RADIUS,
  THEME_COLORS,
  THEME_FONTS,
  THEME_KEYFRAMES,
  THEME_SCREENS,
  THEME_SHADOWS,
} from "./src/config/theme.config";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: THEME_FONTS,
      // Core Jeli token system — see src/config/theme.config.ts
      colors: THEME_COLORS,
      boxShadow: THEME_SHADOWS,
      backgroundImage: THEME_BACKGROUND_IMAGES,
      backgroundSize: THEME_BACKGROUND_SIZES,
      borderRadius: THEME_BORDER_RADIUS,
      screens: THEME_SCREENS,
      keyframes: THEME_KEYFRAMES,
      animation: THEME_ANIMATIONS,
    },
  },
  plugins: [],
} satisfies Config;
