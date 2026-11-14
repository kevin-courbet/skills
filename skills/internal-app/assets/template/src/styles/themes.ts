import * as stylex from "@stylexjs/stylex";
import { darkBrand, lightBrand } from "./brand.stylex";
import { darkPalette, lightPalette } from "./palette.stylex";
import { color, font, shadow, size } from "./tokens.stylex";

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

const touchSize = stylex.createTheme(size, {
  controlSm: "2.75rem",
  controlMd: "3rem",
  controlLg: "3.5rem",
  iconSm: "1.125rem",
  icon: "1.25rem",
  iconLg: "1.5rem",
  toggle: "1.5rem",
  toggleMark: "1.125rem",
  switchWidth: "2.75rem",
  switchHeight: "1.625rem",
  sliderThumb: "1.75rem",
  sliderTrack: "2.75rem",
  togglePadding: "0.625rem",
  fieldXs: "8rem",
  fieldSm: "14rem",
  fieldMd: "22rem",
  fieldLg: "34rem",
});

const touchFont = stylex.createTheme(font, {
  xs: "0.8125rem",
  sm: "0.9375rem",
  md: "1.0625rem",
  lg: "1.1875rem",
  xl: "1.375rem",
  xxl: "1.625rem",
  xxxl: "1.875rem",
  display: "2.5rem",
  displayLg: "3rem",
});

/**
 * Touch density for a page on a shared tablet or kiosk that people tap and read
 * from arm's length. The smallest control reaches 44px, the minimum touch target,
 * and text grows one step. Checkboxes, radios, switches, and sliders grow with it.
 * `Page density="touch"` applies it to the page region, and `useOverlayDensity`
 * applies it to the overlays that the page opens.
 */
export const touchDensity = [touchSize, touchFont] as const;
