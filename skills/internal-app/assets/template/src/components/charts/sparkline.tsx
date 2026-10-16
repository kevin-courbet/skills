import * as stylex from "@stylexjs/stylex";
import { LineChart, type TimeSeriesDatum, chartData } from "@kevin-courbet/aperture";
import { chartHost } from "./chart-host";

export interface SparklineProps {
  /** Names the measure, such as "Jobs per day". */
  readonly label: string;
  /** States the period and the unit, such as "Jobs per day for the last 12 days." */
  readonly description: string;
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
