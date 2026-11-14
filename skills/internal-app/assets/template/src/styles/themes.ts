import * as stylex from "@stylexjs/stylex";
import { darkBrand, lightBrand } from "./brand.stylex";
import { darkPalette, lightPalette } from "./palette.stylex";
import { color, shadow } from "./tokens.stylex";

/**
 * Explicit themes for a light or dark choice, saved by the person or set as the app's
 * defaultTheme. For "system" the tokens follow prefers-color-scheme, so the server
 * never renders the wrong theme.
 */
const lightColor = stylex.createTheme(color, {
  scheme: lightPalette.scheme,
  frame: lightBrand.frame,
  frameHover: lightBrand.frameHover,
  frameSelected: lightBrand.frameSelected,
  page: lightBrand.page,
  subtle: lightBrand.subtle,
  raised: lightBrand.raised,
  overlay: lightBrand.overlay,
  inset: lightBrand.inset,
  text: lightBrand.text,
  textMuted: lightBrand.textMuted,
  textFaint: lightBrand.textFaint,
  textInverse: lightBrand.textInverse,
  borderSubtle: lightBrand.borderSubtle,
  border: lightBrand.border,
  borderStrong: lightBrand.borderStrong,
  accent: lightBrand.accent,
  accentHover: lightBrand.accentHover,
  accentStrong: lightBrand.accentStrong,
  accentText: lightBrand.accentText,
  accentMuted: lightBrand.accentMuted,
  accentBorder: lightBrand.accentBorder,
  onAccent: lightBrand.onAccent,
  selected: lightBrand.selected,
  focus: lightBrand.focus,
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
  xl: lightPalette.shadowXl,
  frame: lightPalette.shadowFrame,
});

export const lightTheme = [lightColor, lightShadow] as const;

const darkColor = stylex.createTheme(color, {
  scheme: darkPalette.scheme,
  frame: darkBrand.frame,
  frameHover: darkBrand.frameHover,
  frameSelected: darkBrand.frameSelected,
  page: darkBrand.page,
  subtle: darkBrand.subtle,
  raised: darkBrand.raised,
  overlay: darkBrand.overlay,
  inset: darkBrand.inset,
  text: darkBrand.text,
  textMuted: darkBrand.textMuted,
  textFaint: darkBrand.textFaint,
  textInverse: darkBrand.textInverse,
  borderSubtle: darkBrand.borderSubtle,
  border: darkBrand.border,
  borderStrong: darkBrand.borderStrong,
  accent: darkBrand.accent,
  accentHover: darkBrand.accentHover,
  accentStrong: darkBrand.accentStrong,
  accentText: darkBrand.accentText,
  accentMuted: darkBrand.accentMuted,
  accentBorder: darkBrand.accentBorder,
  onAccent: darkBrand.onAccent,
  selected: darkBrand.selected,
  focus: darkBrand.focus,
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
  xl: darkPalette.shadowXl,
  frame: darkPalette.shadowFrame,
});

export const darkTheme = [darkColor, darkShadow] as const;
