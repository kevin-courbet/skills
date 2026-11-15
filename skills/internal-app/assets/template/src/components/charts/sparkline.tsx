/**
 * A small line chart of one series for the `chart` slot of a `StatTile`.
 *
 * @layer primitive
 * @keywords sparkline, small chart, trend in a stat tile, mini chart, inline trend, kpi trend
 * @related TrendChart, Layout, ChartHost
 * @notes charts, dashboards
 *
 * Use it to show the shape of a measure under its value in a `StatTile`. Do
 * not use it as a chart on its own: use `TrendChart`. Do not add it as
 * decoration. The tile value and label name the measure; the sparkline only
 * shows its shape.
 *
 * ## Behavior
 * - It has no axes, grid lines, legend, or controls. The tooltip and the
 *   collapsed table of exact values keep every value available.
 * - It is a line, not an area, because an area must start at zero, and that
 *   flattens small changes in a large value.
 * - It applies `chartHost` and renders SVG.
 *
 * ## Example
 * ```tsx
 * <StatTile
 *   label="Jobs"
 *   value="1,284"
 *   chart={
 *     <Sparkline
 *       label="Jobs per day"
 *       description="Jobs per day for the last 12 days."
 *       series={jobsPerDay}
 *     />
 *   }
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { LineChart, type TimeSeriesDatum, chartData } from "@kevin-courbet/aperture";
import { chartHost } from "./chart-host";

export interface SparklineProps {
  /** Names the measure, such as "Jobs per day". */
  readonly label: string;
  /** States the period and the unit, such as "Jobs per day for the last 12 days." */
  readonly description: string;
  /** The points in date order: an ISO date and a number for each point. */
  readonly series: ReadonlyArray<{ readonly date: string; readonly value: number }>;
}

/**
 * Trend for the StatTile `chart` slot: a compact Aperture line chart without
 * axes, legend, or controls. The tooltip and the collapsed exact-value table
 * keep every value available. A line, unlike an area, need not start at zero,
 * so small changes in a large value stay visible.
 */
export function Sparkline({ label, description, series }: SparklineProps) {
  const data: ReadonlyArray<TimeSeriesDatum> = series.map((point) => ({
    id: point.date,
    date: new Date(point.date),
    value: { kind: "value", value: point.value },
  }));
  const host = stylex.props(chartHost.root);
  return (
    <LineChart
      compact
      ariaLabel={label}
      ariaDescription={description}
      state={chartData(data)}
      crosshair
      rendering={{ kind: "svg" }}
      className={host.className}
      style={host.style}
      height={48}
      initialWidth={240}
    />
  );
}
