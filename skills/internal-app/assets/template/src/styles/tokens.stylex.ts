import * as stylex from "@stylexjs/stylex";
import { darkPalette, lightPalette } from "./palette.stylex";

const DARK = "@media (prefers-color-scheme: dark)";

/** Semantic color roles. Components use only these, never palette values. */
export const color = stylex.defineVars({
  scheme: { default: lightPalette.scheme, [DARK]: darkPalette.scheme },
  frame: { default: lightPalette.frame, [DARK]: darkPalette.frame },
  frameHover: { default: lightPalette.frameHover, [DARK]: darkPalette.frameHover },
  frameSelected: { default: lightPalette.frameSelected, [DARK]: darkPalette.frameSelected },
  page: { default: lightPalette.page, [DARK]: darkPalette.page },
  subtle: { default: lightPalette.subtle, [DARK]: darkPalette.subtle },
  raised: { default: lightPalette.raised, [DARK]: darkPalette.raised },
  overlay: { default: lightPalette.overlay, [DARK]: darkPalette.overlay },
  inset: { default: lightPalette.inset, [DARK]: darkPalette.inset },
  text: { default: lightPalette.text, [DARK]: darkPalette.text },
  textMuted: { default: lightPalette.textMuted, [DARK]: darkPalette.textMuted },
  textFaint: { default: lightPalette.textFaint, [DARK]: darkPalette.textFaint },
  textInverse: { default: lightPalette.textInverse, [DARK]: darkPalette.textInverse },
  borderSubtle: { default: lightPalette.borderSubtle, [DARK]: darkPalette.borderSubtle },
  border: { default: lightPalette.border, [DARK]: darkPalette.border },
  borderStrong: { default: lightPalette.borderStrong, [DARK]: darkPalette.borderStrong },
  accent: { default: lightPalette.accent, [DARK]: darkPalette.accent },
  accentHover: { default: lightPalette.accentHover, [DARK]: darkPalette.accentHover },
  accentStrong: { default: lightPalette.accentStrong, [DARK]: darkPalette.accentStrong },
  accentText: { default: lightPalette.accentText, [DARK]: darkPalette.accentText },
  accentMuted: { default: lightPalette.accentMuted, [DARK]: darkPalette.accentMuted },
  accentBorder: { default: lightPalette.accentBorder, [DARK]: darkPalette.accentBorder },
  onAccent: { default: lightPalette.onAccent, [DARK]: darkPalette.onAccent },
  selected: { default: lightPalette.selected, [DARK]: darkPalette.selected },
  focus: { default: lightPalette.focus, [DARK]: darkPalette.focus },
  success: { default: lightPalette.success, [DARK]: darkPalette.success },
  successMuted: { default: lightPalette.successMuted, [DARK]: darkPalette.successMuted },
  successBorder: { default: lightPalette.successBorder, [DARK]: darkPalette.successBorder },
  warning: { default: lightPalette.warning, [DARK]: darkPalette.warning },
  warningMuted: { default: lightPalette.warningMuted, [DARK]: darkPalette.warningMuted },
  warningBorder: { default: lightPalette.warningBorder, [DARK]: darkPalette.warningBorder },
  danger: { default: lightPalette.danger, [DARK]: darkPalette.danger },
  dangerMuted: { default: lightPalette.dangerMuted, [DARK]: darkPalette.dangerMuted },
  dangerBorder: { default: lightPalette.dangerBorder, [DARK]: darkPalette.dangerBorder },
  info: { default: lightPalette.info, [DARK]: darkPalette.info },
  infoMuted: { default: lightPalette.infoMuted, [DARK]: darkPalette.infoMuted },
  infoBorder: { default: lightPalette.infoBorder, [DARK]: darkPalette.infoBorder },
  backdrop: { default: lightPalette.backdrop, [DARK]: darkPalette.backdrop },
});

export const shadow = stylex.defineVars({
  sm: { default: lightPalette.shadowSm, [DARK]: darkPalette.shadowSm },
  md: { default: lightPalette.shadowMd, [DARK]: darkPalette.shadowMd },
  lg: { default: lightPalette.shadowLg, [DARK]: darkPalette.shadowLg },
  /** Floating surfaces above the page, such as an item being dragged or a docked panel. */
  xl: { default: lightPalette.shadowXl, [DARK]: darkPalette.shadowXl },
  frame: { default: lightPalette.shadowFrame, [DARK]: darkPalette.shadowFrame },
});

export const font = stylex.defineVars({
  sans: "'Geist Variable', 'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'Geist Mono Variable', 'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
  xs: "0.6875rem",
  sm: "0.75rem",
  md: "0.8125rem",
  lg: "0.875rem",
  xl: "1rem",
  xxl: "1.25rem",
  xxxl: "1.5rem",
  /** Large numerals and labels read from a distance, such as a stat value or a zoomed-out canvas. */
  display: "1.75rem",
  displayLg: "2rem",
  regular: "400",
  medium: "500",
  semibold: "600",
  leadingTight: "1.25",
  leadingNormal: "1.45",
  tracking: "0",
  trackingTight: "-0.01em",
});

/** 4px scale. Adjacent steps differ by at least 25% so intent stays visible. */
export const space = stylex.defineVars({
  none: "0px",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  xxl: "1.5rem",
  xxxl: "2rem",
  section: "2.5rem",
  page: "3rem",
});

export const radius = stylex.defineVars({
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
});

export const size = stylex.defineVars({
  controlSm: "1.75rem",
  controlMd: "2rem",
  controlLg: "2.25rem",
  iconSm: "0.875rem",
  icon: "1rem",
  iconLg: "1.25rem",
  sidebar: "15rem",
  topbar: "3rem",
  /** Gap between the sidebar frame and the content panel. */
  frameGap: "0.5rem",
  contentMax: "90rem",
  readingMax: "72ch",
  fieldMax: "28rem",
});

/** Build-time constants. Use as media-query keys, z-index values, and motion values. */
export const media = stylex.defineConsts({
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
  belowMd: "@media (max-width: 767.98px)",
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
  forcedColors: "@media (forced-colors: active)",
});

/**
 * Container-query keys at the `media` breakpoints. They resolve against the
 * nearest ancestor with `containerType: "inline-size"`, such as the DataTable
 * scroller, so a component adapts to its own width, not to the window.
 */
export const container = stylex.defineConsts({
  belowSm: "@container (max-width: 639.98px)",
  belowMd: "@container (max-width: 767.98px)",
  belowLg: "@container (max-width: 1023.98px)",
});

export const layer = stylex.defineConsts({
  sticky: "20",
  dropdown: "50",
  overlay: "100",
  modal: "110",
  toast: "120",
  tooltip: "130",
});

export const motion = stylex.defineConsts({
  fast: "120ms",
  normal: "180ms",
  slow: "260ms",
  ease: "cubic-bezier(0.2, 0, 0, 1)",
  /** Enter motion: a fast start that settles softly. */
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
});
