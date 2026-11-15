---
id: typography
topic: type
summary: Paragraph measure, line height, a deliberate type scale, text roles, links, and numerals for readable content.
keywords: [typography, line height, line-height, paragraph width, measure, line length, type scale, font size, rem, text roles, muted text, links, underline, tabular numerals, tabular nums, list spacing]
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

## Type Scale

- Use a deliberate type scale with clearly different steps.
- Use stable `rem` tokens for application UI.
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
