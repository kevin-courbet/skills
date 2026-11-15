import * as stylex from "@stylexjs/stylex";
import { darkBrand, lightBrand } from "./brand.stylex";
import { darkPalette, lightPalette } from "./palette.stylex";

const DARK = "@media (prefers-color-scheme: dark)";

/** Semantic color roles. Components use only these, never palette values. */
export const color = stylex.defineVars({
  scheme: { default: lightPalette.scheme, [DARK]: darkPalette.scheme },
  frame: { default: lightBrand.frame, [DARK]: darkBrand.frame },
  frameHover: { default: lightBrand.frameHover, [DARK]: darkBrand.frameHover },
  frameSelected: { default: lightBrand.frameSelected, [DARK]: darkBrand.frameSelected },
  page: { default: lightBrand.page, [DARK]: darkBrand.page },
  subtle: { default: lightBrand.subtle, [DARK]: darkBrand.subtle },
  raised: { default: lightBrand.raised, [DARK]: darkBrand.raised },
  overlay: { default: lightBrand.overlay, [DARK]: darkBrand.overlay },
  inset: { default: lightBrand.inset, [DARK]: darkBrand.inset },
  text: { default: lightBrand.text, [DARK]: darkBrand.text },
  textMuted: { default: lightBrand.textMuted, [DARK]: darkBrand.textMuted },
  textFaint: { default: lightBrand.textFaint, [DARK]: darkBrand.textFaint },
  textInverse: { default: lightBrand.textInverse, [DARK]: darkBrand.textInverse },
  borderSubtle: { default: lightBrand.borderSubtle, [DARK]: darkBrand.borderSubtle },
  border: { default: lightBrand.border, [DARK]: darkBrand.border },
  borderStrong: { default: lightBrand.borderStrong, [DARK]: darkBrand.borderStrong },
  accent: { default: lightBrand.accent, [DARK]: darkBrand.accent },
  accentHover: { default: lightBrand.accentHover, [DARK]: darkBrand.accentHover },
  accentStrong: { default: lightBrand.accentStrong, [DARK]: darkBrand.accentStrong },
  accentText: { default: lightBrand.accentText, [DARK]: darkBrand.accentText },
  accentMuted: { default: lightBrand.accentMuted, [DARK]: darkBrand.accentMuted },
  accentBorder: { default: lightBrand.accentBorder, [DARK]: darkBrand.accentBorder },
  onAccent: { default: lightBrand.onAccent, [DARK]: darkBrand.onAccent },
  selected: { default: lightBrand.selected, [DARK]: darkBrand.selected },
  focus: { default: lightBrand.focus, [DARK]: darkBrand.focus },
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
  /** Wordmarks only. Headings and labels stay at semibold. */
  bold: "700",
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
  /** The box of a checkbox and the circle of a radio. */
  toggle: "1rem",
  /** The check or the dash inside a checkbox. */
  toggleMark: "0.75rem",
  switchWidth: "1.75rem",
  switchHeight: "1rem",
  sliderThumb: "1rem",
  /** Height of the slider track area that takes the pointer. */
  sliderTrack: "1.25rem",
  /**
   * Space above and below a checkbox, a radio, or a switch row. Touch density
   * sets it so that a one-line row reaches the 44px touch target.
   */
  togglePadding: "0px",
  sidebar: "15rem",
  topbar: "3rem",
  /** Gap between the sidebar frame and the content panel. */
  frameGap: "0.5rem",
  contentMax: "90rem",
  readingMax: "72ch",
  /**
   * Field control widths that show the expected length of the answer. Pick
   * one with the `width` prop of a field, not with a style.
   */
  fieldXs: "6rem",
  fieldSm: "11rem",
  fieldMd: "17rem",
  fieldLg: "26rem",
});

/**
 * The values of touch density, for a page that people tap and read from arm's
 * length. `touchDensity` in themes.ts applies them to a touch page, and the app
 * shell gives them to its top bar while a touch page is open. Only these two
 * read the values. Other components read `size` and `font`.
 */
export const touchSize = stylex.defineConsts({
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
  topbar: "4rem",
  fieldXs: "8rem",
  fieldSm: "14rem",
  fieldMd: "22rem",
  fieldLg: "34rem",
});

export const touchFont = stylex.defineConsts({
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

/** Build-time constants. Use as media-query keys, z-index values, and motion values. */
export const media = stylex.defineConsts({
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
  belowMd: "@media (max-width: 767.98px)",
  belowLg: "@media (max-width: 1023.98px)",
  /**
   * A mouse or a trackpad. Put hover-only feedback, such as an underline,
   * under this key: a touch screen keeps the hover state after a tap.
   */
  finePointer: "@media (hover: hover) and (pointer: fine)",
  /** A touch screen. A tablet or a phone matches it at every width. */
  coarsePointer: "@media (pointer: coarse)",
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

/**
 * Durations and easing curves. Run `design read internal-app-motion` for
 * what to animate. Every animation also sets a `media.reducedMotion` override.
 */
export const motion = stylex.defineConsts({
  /** Feedback on the control that people touch: a press, a hover, a focus ring. */
  fast: "120ms",
  /** Surfaces that open and close, such as a popover or a dialog. */
  normal: "180ms",
  slow: "260ms",
  /**
   * An object that moves to a new place, such as a card that changes lanes.
   * The view transition rules in `app.css` repeat this value.
   */
  move: "240ms",
  ease: "cubic-bezier(0.2, 0, 0, 1)",
  /** Enter motion: a fast start that settles softly. */
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  /**
   * Motion of an object from one place to another: a slow start and a slow
   * end, so the eye can follow it. The view transition rules in `app.css`
   * repeat this value.
   */
  easeInOut: "cubic-bezier(0.77, 0, 0.175, 1)",
});
