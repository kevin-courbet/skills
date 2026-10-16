# Charts With Aperture

Aperture (`@kevin-courbet/aperture`) is the only chart library. It renders
typed charts, composable widget slots, controls, and exact-value tables on
TanStack Charts, and it ships semantic CSS variables for host theming. The
`create-data-visualizations` skill owns chart selection and data semantics;
load it for any non-trivial chart. This reference covers the integration
into the internal-app stack.

## Wiring

1. `src/styles/app.css` imports the stylesheet first:
   `@import "@kevin-courbet/aperture/styles.css";`
   Aperture (0.8.0 and later) puts every rule in the `aperture` cascade layer,
   including the copy that its browser export loads. The import declares that
   layer before the reset and StyleX layers, so host overrides win. Do not
   wrap the import in another `layer()`. Note: the Aperture stylesheet embeds
   IBM Plex Sans as a data URI (about 230 KB). The app font replaces it
   through the bridge, but the bytes still ship.
2. `src/routes/_app.tsx` wraps the shell in `<ChartProvider locale={appLocale} timeZone={appTimeZone}>` with the values from `src/lib/locale.ts`.
3. `<html data-theme="light|dark">` is set by the kit `AppDocument`. Aperture's dark series palette keys on `[data-theme='dark']`.
4. `src/components/charts/chart-host.ts` maps every `--aperture-*` surface, text, border, accent, radius, spacing, and font variable to app tokens. Apply it to every Aperture root: the widget root and each chart component.

```tsx
const host = stylex.props(chartHost.root);
<ChartWidget.Root ariaLabel="..." exactValues="available" className={host.className} style={host.style}>
  ...
  <LineChart className={host.className} style={host.style} ... />
```

Each chart renders its own `[data-aperture-root]` element. Aperture's dark
rule re-declares the variables on that element, so a bridge on the widget
root alone leaves the plot and the exact-value table in Aperture's navy and
IBM Plex. Series colors stay Aperture's own palette so charts remain
distinguishable and accessible in both themes.

The kit component `TrendChart` (`src/components/charts/trend-chart.tsx`) is a
complete time-series widget with the bridge, toolbar, exact values, SVG
rendering, and a source footer. Use it for a single series over time. Build
other widgets the same way and propose reusable ones for the kit.

The kit component `Sparkline` (`src/components/charts/sparkline.tsx`) is the
trend for the `StatTile` `chart` slot. It renders an Aperture `LineChart` with
`compact`: no axes, grid lines, legend, or standalone controls. The tooltip and
the collapsed exact-value table keep every value available. It carries the
bridge and SVG rendering. It uses a line because an area must start at zero,
which flattens small changes in a large value.

```tsx
<StatTile
  label="Jobs"
  value="1,284"
  chart={<Sparkline label="Jobs per day" description="Jobs per day for the last 12 days." series={jobsPerDay} />}
/>
```

A compact chart shows one series and rejects axis labels, highlights,
references, and standalone table options. Give the tile a value and a label
that name the measure; the sparkline only shows its shape.

## Composition

```tsx
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

- Aperture owns the widget layout: the header and toolbar share the first row, and the full-screen control targets the whole widget. Its padding, border, radius, and surface come from the bridged variables. Do not restyle the widget root with StyleX.
- `ChartToolbar` is a sibling of `ChartWidget.Header`, not a child. It takes no `targetRef`.
- Remove slots that have no content. Do not add feature flags to one widget.
- `exactValues="available"` for a ready chart, `"unavailable"` while loading, empty, or failed.
- `rendering={{ kind: "svg" }}` when server HTML must show the chart. Canvas paints after hydration.
- `initialWidth` equals the expected container width so SSR output is deterministic.
- `chartData(rows)` builds the `ready` or `empty` state. Build `{ status: "loading" }` and `{ status: "error", error }` explicitly; never hide an error behind an empty plot.
- Time series data: `{ id, date: Date, value: { kind: "value", value } }`; missing points use `{ kind: "missing" }`.
- The host owns data access, aggregation, selected ranges, and toggles. Aperture owns presentation, keyboard and pointer interaction, focus, and the exact-value table.

## Verification

- Build and curl the page: the chart root must carry the StyleX host classes and an `<svg>` for SVG rendering.
- Check both themes. The plot background must equal `color.raised`, text `color.text`, and axis lines `color.border`. In the browser, every `[data-aperture-root]` element must report the app font in `--aperture-font-family` and the app surface in `--aperture-color-surface`.
- In the browser, no stylesheet may contain Aperture rules outside a cascade layer. Every `document.styleSheets` entry for `aperture/dist/styles.css` must start with `@layer aperture`.
- Keyboard: the toolbar buttons are reachable, and the exact-value table opens.
- Run the `create-data-visualizations` validation CLI for charts that matter to decisions.
