/**
 * The StyleX bridge that maps the CSS variables of Aperture to the app tokens.
 *
 * @layer helper
 * @keywords chart theme, aperture theme, chart tokens, chart colors, chart styles, chart bridge
 * @related TrendChart, Sparkline
 * @notes charts, semantic-tokens, dark-theme
 *
 * Use it on every Aperture root that a new chart widget renders. Do not use it
 * for a chart that the kit already has: `TrendChart` and `Sparkline` apply it.
 * Run `design read kit-charts` for the wiring of Aperture.
 *
 * ## Rules
 * - Apply it to `ChartWidget.Root` and to each chart component, through
 *   `className` and `style`. Each chart renders its own `[data-aperture-root]`,
 *   where the dark rule of Aperture declares the variables again.
 * - Do not map the series colors. Aperture keeps its own light and dark
 *   palettes, so that the series stay different from each other in both themes.
 *
 * ## Example
 * ```tsx
 * const host = stylex.props(chartHost.root);
 * <LineChart ariaLabel="Jobs" state={chartData(data)} className={host.className} style={host.style} />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { color, font, radius, space } from "@/styles/tokens.stylex";

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
