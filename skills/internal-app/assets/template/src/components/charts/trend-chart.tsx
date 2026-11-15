/**
 * A complete chart widget for one series over time, with a title, a toolbar, the plot, and a source.
 *
 * @layer pattern
 * @keywords line chart, trend chart, time series, chart over time, daily activity chart, metric chart, graph
 * @related Sparkline, ChartHost, Layout
 * @notes charts, dashboards
 *
 * Use it for one measure over time on an overview or a detail page. Do not use
 * it inside a `StatTile`: use `Sparkline`. For another chart form, such as bars
 * or several series, build an Aperture widget in the same way. Load the
 * `create-data-visualizations` skill and run
 * `design read internal-app-charts#build-a-widget`.
 *
 * ## Behavior
 * - Aperture owns the widget layout and the interaction: the toolbar, the
 *   full-screen control, the tooltip, and the table of exact values.
 * - It applies `chartHost` to the widget root and to the chart, and it renders
 *   SVG.
 * - The footer reads "Source: " and then `source`.
 *
 * ## Rules
 * - The page owns the data access and the aggregation. Give the chart the
 *   points that it shows.
 * - Put it in a `Section` whose title says what the chart answers.
 *
 * ## Example
 * ```tsx
 * <Section title="Daily activity" description="Items updated per day over the last 30 days.">
 *   <TrendChart
 *     title="Updated items"
 *     description="Count of items updated per day."
 *     unit="Items"
 *     source="Items service, UTC days"
 *     series={data.series}
 *   />
 * </Section>
 * ```
 */
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
  /** Names the measure, such as "Updated items". It is also the accessible name. */
  readonly title: string;
  /** The question that the chart answers, or how the measure is counted. */
  readonly description: string;
  /** The label of the value axis, such as "Items" or "ms". */
  readonly unit: string;
  /** Where the data comes from, such as "Items service, UTC days". */
  readonly source: string;
  /** The points in date order: an ISO date and a number for each point. */
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
