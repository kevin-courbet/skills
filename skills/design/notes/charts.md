---
id: charts
topic: data
summary: Charts use the create-data-visualizations skill for the chart itself and this graph for the page around it.
keywords: [chart, charts, chart colors, graph, plot, data visualization, dataviz, sparkline, line chart, bar chart, legend, axis]
requires: [dashboards]
related: [color, contrast, skill:create-data-visualizations]
---

# Charts

The design of a chart is the scope of another skill. When React and Aperture fit the stack of the project, load [[skill:create-data-visualizations]] with `npx skills use kevin-courbet/aperture@create-data-visualizations` before implementation. It gives the chart form, the encoding, the chart colors, the interaction, the accessibility, and the validation.

- If the project does not use React, or if Aperture conflicts with the stack, keep the stack and use a compatible chart library.
- Do not add React only to use Aperture.

## The Page Around A Chart

- Put a chart on a page only when it serves the task of the page. [[dashboards]] gives the overview rules.
- Charts are one of the permitted places for brand color. [[color#accent-and-semantic-color]] gives the limits.
- A chart must not depend on color only. [[accessibility#color-is-never-the-only-signal]] gives the rule.
- Do not use sparklines as decoration. A small chart that gives no useful information only looks sophisticated.
