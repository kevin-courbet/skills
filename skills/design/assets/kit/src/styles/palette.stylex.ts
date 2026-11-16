import * as stylex from "@stylexjs/stylex";

/**
 * Raw status, overlay, and shadow values that every app shares. Components never
 * import this file. Semantic tokens in tokens.stylex.ts and the explicit themes in
 * themes.ts read from it. The app's own surfaces, text, borders, and accent live in
 * brand.stylex.ts, which the app owns.
 */
export const lightPalette = stylex.defineConsts({
  scheme: "light",
  success: "oklch(0.5 0.14 155)",
  successMuted: "oklch(0.96 0.04 155)",
  successBorder: "oklch(0.84 0.09 155)",
  warning: "oklch(0.55 0.15 70)",
  warningMuted: "oklch(0.97 0.05 85)",
  warningBorder: "oklch(0.86 0.11 85)",
  danger: "oklch(0.53 0.2 27)",
  dangerMuted: "oklch(0.96 0.03 27)",
  dangerBorder: "oklch(0.86 0.08 27)",
  info: "oklch(0.52 0.13 230)",
  infoMuted: "oklch(0.96 0.03 230)",
  infoBorder: "oklch(0.85 0.07 230)",
  backdrop: "oklch(0.2 0.01 260 / 0.4)",
  shadowSm: "0 1px 2px oklch(0 0 0 / 0.06)",
  shadowMd: "0 2px 6px -1px oklch(0 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.06)",
  shadowLg: "0 12px 32px -8px oklch(0 0 0 / 0.18), 0 2px 6px oklch(0 0 0 / 0.08)",
  shadowXl: "0 28px 64px -18px oklch(0 0 0 / 0.3), 0 4px 12px oklch(0 0 0 / 0.08)",
  shadowFrame: "0 1px 2px oklch(0 0 0 / 0.05)",
});

export const darkPalette = stylex.defineConsts({
  scheme: "dark",
  success: "oklch(0.76 0.14 155)",
  successMuted: "oklch(0.24 0.04 155)",
  successBorder: "oklch(0.36 0.07 155)",
  warning: "oklch(0.8 0.14 80)",
  warningMuted: "oklch(0.25 0.04 80)",
  warningBorder: "oklch(0.38 0.08 80)",
  danger: "oklch(0.74 0.16 25)",
  dangerMuted: "oklch(0.25 0.04 25)",
  dangerBorder: "oklch(0.38 0.08 25)",
  info: "oklch(0.76 0.12 230)",
  infoMuted: "oklch(0.24 0.04 230)",
  infoBorder: "oklch(0.36 0.07 230)",
  backdrop: "oklch(0 0 0 / 0.6)",
  shadowSm: "0 1px 2px oklch(0 0 0 / 0.4)",
  shadowMd: "0 2px 6px -1px oklch(0 0 0 / 0.5), 0 1px 2px oklch(0 0 0 / 0.4)",
  // Several soft layers keep dark overlays separated without a hard halo.
  shadowLg:
    "0 4px 40px oklch(0 0 0 / 0.1), 0 3px 20px oklch(0 0 0 / 0.125), 0 3px 12px oklch(0 0 0 / 0.125), 0 2px 8px oklch(0 0 0 / 0.125), 0 1px 1px oklch(0 0 0 / 0.125)",
  shadowXl: "0 32px 72px -18px oklch(0 0 0 / 0.6), 0 6px 16px oklch(0 0 0 / 0.35)",
  shadowFrame: "0 0.5px 1px 1px oklch(0 0 0 / 0.3)",
});
