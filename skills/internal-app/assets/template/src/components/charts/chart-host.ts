import * as stylex from "@stylexjs/stylex";
import { color, font, radius, space } from "@/styles/tokens.stylex";

/**
 * Maps Aperture's semantic CSS variables to app tokens. Apply it to every
 * Aperture root: ChartWidget.Root and each chart component's className and
 * style. Each chart renders its own [data-aperture-root], where Aperture's
 * dark-theme rule re-declares the variables, so inheritance alone is not enough.
 * Series colors stay Aperture's light and dark palettes, selected by data-theme.
 */
export const chartHost = stylex.create({
  root: {
    "--aperture-font-family": font.sans,
    "--aperture-font-size": font.md,
    "--aperture-font-weight": font.regular,
    "--aperture-font-weight-strong": font.semibold,
    "--aperture-line-height": font.leadingNormal,
    "--aperture-color-background": color.raised,
    "--aperture-color-surface": color.subtle,
    "--aperture-color-text": color.text,
    "--aperture-color-muted": color.textMuted,
    "--aperture-color-border": color.border,
    "--aperture-color-accent": color.accent,
    "--aperture-color-accent-soft": color.accentMuted,
    "--aperture-color-danger": color.danger,
    "--aperture-color-focus": color.focus,
    "--aperture-radius-small": radius.md,
    "--aperture-radius-medium": radius.lg,
    "--aperture-space-1": space.xs,
    "--aperture-space-2": space.sm,
    "--aperture-space-3": space.md,
    "--aperture-space-4": space.lg,
  },
});
