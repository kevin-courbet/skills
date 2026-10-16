import * as stylex from "@stylexjs/stylex";
import { darkPalette, lightPalette } from "./palette.stylex";
import { color, shadow } from "./tokens.stylex";

/**
 * Explicit themes for a saved user choice. Without a choice the tokens follow
 * prefers-color-scheme, so the server never renders the wrong theme.
 */
const lightColor = stylex.createTheme(color, {
  scheme: lightPalette.scheme,
  frame: lightPalette.frame,
  frameHover: lightPalette.frameHover,
  frameSelected: lightPalette.frameSelected,
  page: lightPalette.page,
  subtle: lightPalette.subtle,
  raised: lightPalette.raised,
  overlay: lightPalette.overlay,
  inset: lightPalette.inset,
  text: lightPalette.text,
  textMuted: lightPalette.textMuted,
  textFaint: lightPalette.textFaint,
  textInverse: lightPalette.textInverse,
  borderSubtle: lightPalette.borderSubtle,
  border: lightPalette.border,
  borderStrong: lightPalette.borderStrong,
  accent: lightPalette.accent,
  accentHover: lightPalette.accentHover,
  accentText: lightPalette.accentText,
  accentMuted: lightPalette.accentMuted,
  accentBorder: lightPalette.accentBorder,
  onAccent: lightPalette.onAccent,
  selected: lightPalette.selected,
  focus: lightPalette.focus,
  success: lightPalette.success,
  successMuted: lightPalette.successMuted,
  successBorder: lightPalette.successBorder,
  warning: lightPalette.warning,
  warningMuted: lightPalette.warningMuted,
  warningBorder: lightPalette.warningBorder,
  danger: lightPalette.danger,
  dangerMuted: lightPalette.dangerMuted,
  dangerBorder: lightPalette.dangerBorder,
  info: lightPalette.info,
  infoMuted: lightPalette.infoMuted,
  infoBorder: lightPalette.infoBorder,
  backdrop: lightPalette.backdrop,
});

const lightShadow = stylex.createTheme(shadow, {
  sm: lightPalette.shadowSm,
  md: lightPalette.shadowMd,
  lg: lightPalette.shadowLg,
  frame: lightPalette.shadowFrame,
});

export const lightTheme = [lightColor, lightShadow] as const;

const darkColor = stylex.createTheme(color, {
  scheme: darkPalette.scheme,
  frame: darkPalette.frame,
  frameHover: darkPalette.frameHover,
  frameSelected: darkPalette.frameSelected,
  page: darkPalette.page,
  subtle: darkPalette.subtle,
  raised: darkPalette.raised,
  overlay: darkPalette.overlay,
  inset: darkPalette.inset,
  text: darkPalette.text,
  textMuted: darkPalette.textMuted,
  textFaint: darkPalette.textFaint,
  textInverse: darkPalette.textInverse,
  borderSubtle: darkPalette.borderSubtle,
  border: darkPalette.border,
  borderStrong: darkPalette.borderStrong,
  accent: darkPalette.accent,
  accentHover: darkPalette.accentHover,
  accentText: darkPalette.accentText,
  accentMuted: darkPalette.accentMuted,
  accentBorder: darkPalette.accentBorder,
  onAccent: darkPalette.onAccent,
  selected: darkPalette.selected,
  focus: darkPalette.focus,
  success: darkPalette.success,
  successMuted: darkPalette.successMuted,
  successBorder: darkPalette.successBorder,
  warning: darkPalette.warning,
  warningMuted: darkPalette.warningMuted,
  warningBorder: darkPalette.warningBorder,
  danger: darkPalette.danger,
  dangerMuted: darkPalette.dangerMuted,
  dangerBorder: darkPalette.dangerBorder,
  info: darkPalette.info,
  infoMuted: darkPalette.infoMuted,
  infoBorder: darkPalette.infoBorder,
  backdrop: darkPalette.backdrop,
});

const darkShadow = stylex.createTheme(shadow, {
  sm: darkPalette.shadowSm,
  md: darkPalette.shadowMd,
  lg: darkPalette.shadowLg,
  frame: darkPalette.shadowFrame,
});

export const darkTheme = [darkColor, darkShadow] as const;
