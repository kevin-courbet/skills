import * as stylex from "@stylexjs/stylex";

/**
 * The app's brand: neutral surfaces, text, borders, and the accent. The app owns this
 * file. Semantic tokens in tokens.stylex.ts and the explicit themes in themes.ts read
 * from it. Components never import it.
 * OKLCH keeps perceptual steps even; the hue 260 gives neutrals a slight cool cast.
 * Dark neutrals keep chroma near 0.003 so large surfaces read as neutral, not blue.
 *
 * Surface order, from recessed to raised: frame, inset, page, raised, subtle, overlay.
 * The sidebar frame is the darkest base surface in both themes, so the content panel
 * comes forward and the navigation stays quiet behind it. Inset wells sit below the
 * panel, and cards sit on it with a border in light and a lighter fill in dark.
 * Keep that order and the accent contrast when you change the values.
 */
export const lightBrand = stylex.defineConsts({
  frame: "oklch(0.958 0.004 260)",
  frameHover: "oklch(0.928 0.005 260)",
  frameSelected: "oklch(0.905 0.006 260)",
  page: "oklch(0.995 0.001 260)",
  subtle: "oklch(0.965 0.003 260)",
  raised: "oklch(1 0 0)",
  overlay: "oklch(1 0 0)",
  inset: "oklch(0.962 0.003 260)",
  text: "oklch(0.18 0.012 260)",
  textMuted: "oklch(0.44 0.014 260)",
  textFaint: "oklch(0.5 0.012 260)",
  textInverse: "oklch(0.988 0.002 260)",
  borderSubtle: "oklch(0.91 0.005 260)",
  border: "oklch(0.86 0.008 260)",
  borderStrong: "oklch(0.74 0.012 260)",
  accent: "oklch(0.52 0.2 262)",
  accentHover: "oklch(0.46 0.2 262)",
  accentStrong: "oklch(0.42 0.2 262)",
  accentText: "oklch(0.45 0.19 262)",
  accentMuted: "oklch(0.95 0.03 262)",
  accentBorder: "oklch(0.86 0.07 262)",
  onAccent: "oklch(0.995 0 0)",
  selected: "oklch(0.945 0.028 262)",
  focus: "oklch(0.6 0.19 262)",
});

export const darkBrand = stylex.defineConsts({
  frame: "oklch(0.13 0.002 260)",
  frameHover: "oklch(0.18 0.003 260)",
  frameSelected: "oklch(0.215 0.004 260)",
  page: "oklch(0.17 0.003 260)",
  subtle: "oklch(0.245 0.004 260)",
  raised: "oklch(0.205 0.003 260)",
  overlay: "oklch(0.245 0.005 260)",
  inset: "oklch(0.145 0.003 260)",
  text: "oklch(0.965 0.003 260)",
  textMuted: "oklch(0.75 0.006 260)",
  textFaint: "oklch(0.67 0.006 260)",
  textInverse: "oklch(0.13 0.002 260)",
  borderSubtle: "oklch(0.255 0.004 260)",
  border: "oklch(0.3 0.005 260)",
  borderStrong: "oklch(0.42 0.007 260)",
  accent: "oklch(0.7 0.15 262)",
  accentHover: "oklch(0.76 0.14 262)",
  accentStrong: "oklch(0.56 0.17 262)",
  accentText: "oklch(0.8 0.11 262)",
  accentMuted: "oklch(0.27 0.06 262)",
  accentBorder: "oklch(0.35 0.08 262)",
  onAccent: "oklch(0.15 0.03 262)",
  selected: "oklch(0.26 0.04 262)",
  focus: "oklch(0.74 0.15 262)",
});
