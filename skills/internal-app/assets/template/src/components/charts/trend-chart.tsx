import * as stylex from "@stylexjs/stylex";
import {
  ChartToolbar,
  ChartWidget,
  LineChart,
  type TimeSeriesDatum,
  chartData,
} from "@kevin-courbet/aperture";
import { chartHost } from "./chart-host";

export interface TrendChartProps {
  readonly title: string;
  readonly description: string;
  readonly unit: string;
  readonly source: string;
  readonly series: ReadonlyArray<{ readonly date: string; readonly value: number }>;
}

/**
 * One Aperture widget: title, toolbar, plot, and the exact-value table.
 * The host owns data access and aggregation. Aperture owns interaction and the
 * widget layout, which the bridge maps to app tokens.
 */
export function TrendChart({ title, description, unit, source, series }: TrendChartProps) {
  const data: ReadonlyArray<TimeSeriesDatum> = series.map((point) => ({
    id: point.date,
    date: new Date(point.date),
    value: { kind: "value", value: point.value },
  }));
  // The widget and the chart are separate Aperture roots. Each re-declares the variables, so each needs the bridge.
  const host = stylex.props(chartHost.root);
  return (
    <ChartWidget.Root
      ariaLabel={title}
      exactValues="available"
      className={host.className}
      style={host.style}
    >
      <ChartWidget.Header>
        <ChartWidget.Title>{title}</ChartWidget.Title>
        <ChartWidget.Description>{description}</ChartWidget.Description>
      </ChartWidget.Header>
      <ChartToolbar dataTableControl="visible" />
      <ChartWidget.Plot>
        <LineChart
          ariaLabel={title}
          ariaDescription={description}
          state={chartData(data)}
          yLabel={unit}
          rendering={{ kind: "svg" }}
          className={host.className}
          style={host.style}
          height={240}
          initialWidth={720}
        />
      </ChartWidget.Plot>
      <ChartWidget.Footer>Source: {source}</ChartWidget.Footer>
    </ChartWidget.Root>
  );
}
