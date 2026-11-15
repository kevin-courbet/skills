---
id: graphite
topic: color
summary: Graphite is the default dark palette, with its tokens, measured contrast, and usage rules in assets/themes/graphite.css.
keywords: [graphite, default dark palette, dark palette, dark mode colors, dark tokens, graphite.css, dark theme tokens, data-theme dark, accent-soft, on-accent, rule-strong]
requires: [contrast]
related: [dark-theme, semantic-tokens, tables]
---

# Graphite

Graphite is the default dark palette. Use it when the product does not define its own dark theme. `assets/themes/graphite.css` contains the tokens for the system preference and for an explicit `data-theme="dark"` choice.

Graphite supplies dark values only. Keep the light values from the product or its brand kit. Graphite is the approved palette of this skill. It does not come from the dark-theme sources. The skill owner approved its tokens on 2026-11-10.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#17181a` | Page base |
| `--surface` | `#202124` | Raised surface, such as a panel, a table container, or a menu |
| `--inset` | `#111214` | Inset surface, such as a code block or a read-only group |
| `--rule` | `#383a40` | Subtle border and row rule |
| `--rule-strong` | `#757981` | Control boundary and strong divider |
| `--ink` | `#ececee` | Primary text |
| `--muted` | `#a9acb3` | Secondary text, labels, and table headings |
| `--accent` | `#9aaeff` | Links, focus rings, selection, and solid primary actions |
| `--accent-soft` | `#292d3a` | Quiet emphasis surface |
| `--on-accent` | `#17181a` | Text on a solid accent fill |
| `--good` | `#72cf98` | Success text and icons |
| `--good-soft` | `#24322c` | Success surface |
| `--warn` | `#efc35e` | Warning text and icons |
| `--warn-soft` | `#353024` | Warning surface |
| `--bad` | `#ff8480` | Danger text and icons |
| `--bad-soft` | `#372728` | Danger surface |
| `--info` | `#6cc6e2` | Information text and icons |
| `--info-soft` | `#233036` | Information surface |

Set `color-scheme: dark` with the tokens, so that native controls use the dark appearance.

## Measured Contrast

The measured WCAG 2.2 contrast of the pairs that Graphite expects. The ratios use the WCAG 2.2 relative luminance formula.

| Foreground | Background | Ratio |
| --- | --- | --- |
| `--ink` | `--bg` | 15.06:1 |
| `--ink` | `--surface` | 13.65:1 |
| `--muted` | `--bg` | 7.82:1 |
| `--muted` | `--surface` | 7.08:1 |
| `--accent` | `--bg` | 8.35:1 |
| `--accent` | `--surface` | 7.57:1 |
| `--ink` | `--accent-soft` | 11.63:1 |
| `--muted` | `--accent-soft` | 6.04:1 |
| `--accent` | `--accent-soft` | 6.45:1 |
| `--on-accent` | `--accent` | 8.35:1 |
| `--good` | `--good-soft` | 7.08:1 |
| `--warn` | `--warn-soft` | 7.90:1 |
| `--bad` | `--bad-soft` | 5.98:1 |
| `--info` | `--info-soft` | 6.99:1 |
| `--rule-strong` | `--bg` | 4.07:1 |
| `--rule-strong` | `--surface` | 3.69:1 |

All text pairs in this table pass `4.5:1`. `--rule-strong` is non-text contrast and passes `3:1` on `--bg` and on `--surface`. `--rule` is `1.56:1` on `--bg` and `1.42:1` on `--surface`, so it cannot show a required boundary.

## Usage Rules

- Use the Graphite values without changes. If the product uses other token names, map the values to those names.
- Keep surfaces neutral. Do not tint `--bg`, `--surface`, or `--inset` toward the accent.
- Use `--accent-soft` for quiet emphasis surfaces, such as a key-statement band or a count badge.
- Use `--on-accent` only for text on a solid `--accent` fill.
- Show each status with its pair. Use the status color for text or an icon, and its soft color for the surface. Add text or an icon, so that color is not the only signal.
- Use `--rule-strong` for control boundaries. Use `--rule` only for quiet separation, such as row rules and container borders.
- Graphite does not define hover, active, or disabled values. Derive them from the Graphite values and measure each pair.
- Measure each new pair before you use it. The table above shows only the measured pairs.

## Tables With Graphite

A table container uses `--surface`, the header band uses `--bg`, the border and the row rules use `--rule`, and the headings use `--muted`. [[tables#table-surfaces]] gives the table rules.
