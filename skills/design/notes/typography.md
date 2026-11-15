---
id: typography
topic: type
summary: Paragraph measure, line height, a deliberate type scale, text roles, links, and numerals for readable content.
keywords: [typography, line height, line-height, paragraph width, measure, line length, type scale, modular scale, font size, body text size, rem, fluid type, clamp, vertical rhythm, text roles, muted text, links, underline, tabular numerals, tabular nums, opentype features, list spacing]
requires: [hierarchy]
related: [font-selection, contrast, accessibility]
---

# Typography And Content

Type carries most of the hierarchy in an information-dense interface. To select a typeface, use [[font-selection]].

## Measure And Line Height

- Make paragraphs approximately 45 to 75 characters wide. A maximum width in `ch` is a practical web implementation.
- Treat 20 to 35 `em` as a rough measure range, not a universal token.
- Start body line-height near 1.4 to 1.7. Increase it for long lines. Decrease it as type becomes larger.
- Use a tighter line-height for large headings. Do not apply one line-height to all text.
- Light text on a dark background needs more line height. [[dark-theme#dark-text]] gives the values.

## Vertical Rhythm

Use the line height of the body text as the base unit for vertical spacing. With `line-height: 1.5` on 16px type, the line is 24px, so the vertical spaces are multiples of 24px. Text and space then share one measure. [[spacing#spacing-scale]] gives the scale for the other spaces.

## Type Scale

Use fewer sizes with more contrast between them. Sizes that are too close, such as 14, 15, 16, and 18px, make the hierarchy unclear. Five sizes are sufficient for most products:

| Role | Size | Use |
| --- | --- | --- |
| xs | 0.75rem | Captions and legal text |
| sm | 0.875rem | Secondary UI and metadata |
| base | 1rem | Body text |
| lg | 1.25 to 1.5rem | Subheadings and lead text |
| xl and larger | 2 to 4rem | Headlines and hero text |

- Select one ratio for the scale and keep it: 1.25 (major third), 1.333 (perfect fourth), or 1.5 (perfect fifth).
- Use `rem` or `em` for font sizes, so that the browser settings of the user apply. Never use `px` for body text.
- Use 16px (1rem) body text as the default. Use a smaller size only when the product system defines it and the text stays readable.
- Use stable `rem` tokens for application UI, dashboards, and dense data. Body text is fixed also on marketing pages.
- Use fluid type with `clamp(min, preferred, max)` only for headings and display text on marketing and content pages. The `vw` part of the middle value sets the scaling rate. Add a `rem` offset, so that the text does not collapse on small screens.
- Name type tokens by role, such as `--text-body` and `--text-heading`, not by value, such as `--font-size-16`. Put the font stacks, sizes, weights, line heights, and letter spacing in the tokens.
- Recalibrate sizes and weights when you change fonts. Weight names do not look equal across families.

## Text Roles

- Three text roles are often sufficient for one surface: primary, secondary, and low priority. This does not limit the full palette to three colors.
- Use no more text levels than the content hierarchy needs.
- Do not apply muted text to most of the interface. Too much muted text makes the complete page look disabled.

## Links

- Do not make every link compete through accent color.
- Give inline links an underline or another cue that is not color. Give hover and focus an equivalent treatment.

## Numbers And Lists

- Use tabular numerals where numeric comparison matters.
- Keep list items separate enough to scan. For loose content lists, a gap near twice the font size is a useful starting point.

## OpenType Features

Use the features of the font for polish. Check which features a font supports with [Wakamai Fondue](https://wakamaifondue.com/).

```css
/* Tabular numbers align data. */
.data-table { font-variant-numeric: tabular-nums; }

/* Real fractions. */
.recipe-amount { font-variant-numeric: diagonal-fractions; }

/* Small capitals for abbreviations. */
abbr { font-variant-caps: all-small-caps; }

/* No ligatures in code. */
code { font-variant-ligatures: none; }

/* Kerning is usually on. Set it explicitly. */
body { font-kerning: normal; }
```
