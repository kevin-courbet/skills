import * as stylex from "@stylexjs/stylex";
import {
  ChartToolbar,
  ChartWidget,
  LineChart,
  type TimeSeriesDatum,
  chartData,
} from "@kevin-courbet/aperture";
import { useRef } from "react";
import { color, font, space } from "@/styles/tokens.stylex";
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
 * The host owns data access and aggregation. Aperture owns interaction.
 */
export function TrendChart({ title, description, unit, source, series }: TrendChartProps) {
  const rootRef = useRef<HTMLElement>(null);
  const data: ReadonlyArray<TimeSeriesDatum> = series.map((point) => ({
    id: point.date,
    date: new Date(point.date),
    value: { kind: "value", value: point.value },
  }));
  const host = stylex.props(chartHost.root, styles.widget);
  // Each chart is its own Aperture root and re-declares the variables, so it needs the bridge too.
  const chartVars = stylex.props(chartHost.root);
  return (
    <ChartWidget.Root
      ref={rootRef}
      exactValues="available"
      className={host.className}
      style={host.style}
    >
      <ChartWidget.Header {...stylex.props(styles.header)}>
        <div>
          <h2 {...stylex.props(styles.title)}>{title}</h2>
          <p {...stylex.props(styles.description)}>{description}</p>
        </div>
        <ChartToolbar targetRef={rootRef} dataTableControl="visible" />
      </ChartWidget.Header>
      <ChartWidget.Plot>
        <LineChart
          ariaLabel={title}
          ariaDescription={description}
          state={chartData(data)}
          yLabel={unit}
          rendering={{ kind: "svg" }}
          className={chartVars.className}
          style={chartVars.style}
          height={240}
          initialWidth={720}
        />
      </ChartWidget.Plot>
      <ChartWidget.Footer {...stylex.props(styles.footer)}>Source: {source}</ChartWidget.Footer>
    </ChartWidget.Root>
  );
}

const styles = stylex.create({
  widget: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    padding: space.lg,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: "0.5rem",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  title: { fontSize: font.lg, fontWeight: font.semibold, lineHeight: font.leadingTight },
  description: { fontSize: font.sm, color: color.textMuted, marginTop: space.xs },
  footer: { fontSize: font.sm, color: color.textMuted },
});
