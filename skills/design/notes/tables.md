---
id: tables
topic: data
summary: Table alignment, quiet headings, row rules only between rows, its own surface, and narrow-screen behavior.
keywords: [table, tables, data table, grid, table row hover, row hover, zebra striping, striped rows, table border, table header, column alignment, numeric columns, horizontal scroll, sticky header]
requires: [hierarchy]
related: [graphite, dashboards, responsive, typography]
---

# Tables

A table lets users compare records. Keep the data dominant.

## Alignment

- Left-align ordinary text.
- Right-align numeric values. Use tabular numerals, so that magnitudes and decimals compare cleanly.

## Rows And Headings

- Give rows enough vertical space to scan.
- De-emphasize headings, so that the data stays dominant.
- Use alignment and spacing before you add grid lines.
- Remove borders that do not show a boundary. The surface and the row rules below are the exception.
- Use a subtle row background, zebra striping, or a row hover background only when it improves tracking.

## Table Surfaces

Give each table its own surface. The surface separates the table from the page and from other content.

- Put the table in a container with a 1px border in the subtle rule color and an 8px radius.
- Use a raised surface for the container.
- Give the header row a band in a different tone from the container.
- Keep headings quiet. Use `0.75rem`, uppercase, `0.06em` letter-spacing, weight 600, and the muted text color.
- Use the product font for headings, not a monospace font.
- Give cells `14px 16px` padding.
- Put rules only between rows. Do not put a rule after the last row. Do not add column rules.
- Keep the data dominant. The surface and the header band frame the data. They must not compete with it.

| Role | Light example | Dark example with Graphite |
| --- | --- | --- |
| Container | `#FFFFFF`, the raised surface | `#202124` (`--surface`) |
| Header band | `#F0F5FC`, a pale surface | `#17181a` (`--bg`) |
| Border and row rules | The subtle rule color | `#383a40` (`--rule`) |
| Headings | The muted text color | `#a9acb3` (`--muted`) |

In both examples, the header band is a little darker than the container. [[graphite]] gives the Graphite tokens and their measured contrast.

## Narrow Screens

- If the screen is for overview, remove low-priority columns. Do not force the full desktop table onto mobile.
- When a table scrolls horizontally on a narrow screen, keep a visible cue that it scrolls.
- Make the scroll container focusable with the keyboard, give it an accessible name, and show its focus clearly.
