import type { ThemeChoice } from "@/lib/theme";

/**
 * The theme for someone without a saved choice. "system" follows the device setting.
 * "light" or "dark" fixes the theme until the person picks another one in the theme switch.
 */
export const defaultTheme: ThemeChoice = "system";
