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
 * `design read kit-charts#build-a-widget`.
 *
 * ## Behavior
 * - Aperture owns the widget layout and the interaction: the toolbar, the
 *   full-screen control, the tooltip, and the table of exact values.
 * - It applies `chartHost` to the widget root and to the chart, and it renders
 *   SVG.
 * - The footer reads "Source: " and then `source`.
 * - The time axis shows days or longer periods, never hours. A series of less
 *   than a week has a tick on each day.
 * - A date that is not a day in the form `YYYY-MM-DD`, or a series that is not
 *   in date order, throws an error.
 *
 * ## Rules
 * - The page owns the data access and the aggregation. Give the chart one
 *   point for each day that it shows.
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
  type TimeAxisOptions,
  type TimeSeriesDatum,
  chartData,
} from "@kevin-courbet/aperture";
import { chartHost } from "@/components/helpers/chart-host";

export interface TrendChartProps {
  /** Names the measure, such as "Updated items". It is also the accessible name. */
  readonly title: string;
  /** The question that the chart answers, or how the measure is counted. */
  readonly description: string;
  /** The label of the value axis, such as "Items" or "ms". */
  readonly unit: string;
  /** Where the data comes from, such as "Items service, UTC days". */
  readonly source: string;
  /** One point for each day, in date order: a day such as "2026-11-14" and a number. */
  readonly series: ReadonlyArray<{ readonly date: string; readonly value: number }>;
}

const dayMs = 86_400_000;

const elapsedTime: TimeAxisOptions = { position: "elapsed" };
const eachDay: TimeAxisOptions = {
  position: "elapsed",
  ticks: { kind: "calendar", interval: { unit: "day", step: 1 } },
};

export function TrendChart({ title, description, unit, source, series }: TrendChartProps) {
  const data: ReadonlyArray<TimeSeriesDatum> = series.map((point, index) => {
    const date = new Date(point.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(point.date) || Number.isNaN(date.getTime()))
      throw new Error(`TrendChart: ${point.date} is not a day in the form YYYY-MM-DD.`);
    const previous = series[index - 1];
    if (previous !== undefined && previous.date >= point.date)
      throw new Error(`TrendChart: ${point.date} comes after ${previous.date}. Sort the series.`);
    return { id: point.date, date, value: { kind: "value", value: point.value } };
  });
  const first = data[0];
  const last = data.at(-1);
  const spanDays =
    first === undefined || last === undefined
      ? 0
      : (last.date.getTime() - first.date.getTime()) / dayMs;
  // Aperture shows at most 12 time labels. Thus its automatic ticks go below a day only when the
  // series is shorter than a week, and then a tick on each day fits.
  const timeAxis = spanDays > 0 && spanDays < 7 ? eachDay : elapsedTime;
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
          timeAxis={timeAxis}
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
