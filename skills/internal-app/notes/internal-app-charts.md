---
id: internal-app-charts
topic: internal-app
summary: Wire Aperture charts into an internal app, use TrendChart or Sparkline, put a chart in a Section and not in a Card, build a new chart widget with the chart host bridge, and verify the chart in both themes.
keywords: [chart, charts, plot, graph, chart in a dashboard, Aperture, chart widget, ChartWidget, ChartToolbar, LineChart, TrendChart, Sparkline, chart in a card, chart in a section, stat tile chart, chart host, chartHost bridge, ChartProvider, chart theme, SVG rendering, exact values, chartData, time series, verify a chart]
specializes: [charts]
related: [internal-app-tokens, internal-app-themes, internal-app-build-wiring, internal-app-cards, dashboards]
---

# Internal App Charts

Aperture (`@kevin-courbet/aperture`) is the only chart library. It renders typed charts, composable widget slots, controls, and tables of exact values on TanStack Charts. It also has semantic CSS variables for host theming. The `create-data-visualizations` skill owns the chart selection and the data semantics. Load it for each chart that is not trivial. [[charts]] gives the rules for the page around a chart.

## Wiring

The template has this wiring:

1. `src/styles/app.css` imports the stylesheet first: `@import "@kevin-courbet/aperture/styles.css";`. Aperture 0.8.0 and later puts each rule in the `aperture` cascade layer, also in the copy that its browser export loads. The import declares that layer before the reset and StyleX layers, so host overrides win. Do not put the import in a different `layer()`.
2. `src/routes/_app.tsx` wraps the shell in `<ChartProvider locale={appLocale} timeZone={appTimeZone}>`, with the values from `src/lib/locale.ts`.
3. The kit `AppDocument` sets `<html data-theme="light|dark">`. The dark series palette of Aperture uses `[data-theme='dark']`.
4. `src/components/charts/chart-host.ts` maps each `--aperture-*` variable of surface, text, border, accent, radius, spacing, and font to the app tokens. Run `internal-app docs ChartHost`.

The Aperture stylesheet contains IBM Plex Sans as a data URI of about 230 KB. The app font replaces it through the bridge, but the bytes still ship.

## Kit Charts

- `TrendChart` is a full widget for one series over time. Run `internal-app docs TrendChart`.
- `Sparkline` is the trend in the `chart` slot of a `StatTile`. Run `internal-app docs Sparkline`.
- For a different chart, build an Aperture widget in the same way. Propose a widget that other pages can use for the kit.

## A Chart In A Card

A chart widget has its own padding, border, radius, and surface from the bridged variables. Put it in a `Section` whose title tells what the chart answers. Do not put it in a `Card`, because a card never holds a second bordered box. Run `design read internal-app-cards`.

## Build A Widget

```tsx
const host = stylex.props(chartHost.root);

<ChartWidget.Root ariaLabel="Title" exactValues="available" {...host}>
  <ChartWidget.Header>
    <ChartWidget.Title>Title</ChartWidget.Title>
    <ChartWidget.Description>Question the chart answers</ChartWidget.Description>
  </ChartWidget.Header>
  <ChartToolbar dataTableControl="visible" />
  <ChartWidget.Plot>
    <LineChart ariaLabel="..." ariaDescription="..." state={chartData(data)} yLabel="Items" rendering={{ kind: "svg" }} {...host} height={240} initialWidth={720} />
  </ChartWidget.Plot>
  <ChartWidget.Footer>Source: ...</ChartWidget.Footer>
</ChartWidget.Root>
```

- Aperture owns the widget layout. The header and the toolbar share the first row, and the full-screen control applies to the full widget. Do not restyle the widget root with StyleX.
- `ChartToolbar` is a sibling of `ChartWidget.Header`, not a child. It takes no `targetRef`.
- Remove the slots that have no content. Do not add feature flags to one widget.
- Set `exactValues="available"` for a ready chart. Set `"unavailable"` while the chart loads, and when it is empty or failed.
- Set `rendering={{ kind: "svg" }}` when the server HTML must show the chart. A canvas paints after hydration.
- Set `initialWidth` to the expected width of the container, so that the SSR output is deterministic.
- `chartData(rows)` makes the `ready` or the `empty` state. Make `{ status: "loading" }` and `{ status: "error", error }` explicitly. Never hide an error behind an empty plot.
- A time series point is `{ id, date: Date, value: { kind: "value", value } }`. A missing point uses `{ kind: "missing" }`.
- The host owns the data access, the aggregation, the selected ranges, and the toggles. Aperture owns the presentation, the keyboard and pointer interaction, the focus, and the table of exact values.

## Verification

- Build and curl the page. The chart root must have the StyleX host classes, and an `<svg>` for SVG rendering.
- Examine the two themes. The plot background must be `color.raised`, the text `color.text`, and the axis lines `color.border`.
- In the browser, each `[data-aperture-root]` element must give the app font in `--aperture-font-family` and the app surface in `--aperture-color-surface`.
- In the browser, no stylesheet can have Aperture rules outside a cascade layer. Each `document.styleSheets` entry for `aperture/dist/styles.css` must start with `@layer aperture`.
- With the keyboard, people can reach the toolbar buttons and open the table of exact values.
- Run the validation CLI of `create-data-visualizations` for the charts that help people make decisions.
