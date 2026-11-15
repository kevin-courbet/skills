---
id: grouped-values
topic: data
summary: Give each separate entity its own element, and never join entities into one string with a middle dot, a bullet, or a vertical bar.
keywords: [middle dot, middle dot separator, separator, bullet separator, vertical bar, pipe, interpunct, metadata line, meta line, count on a tab, count badge, label and value, status summary, join facts, dense string]
requires: [hierarchy]
related: [dashboards, typography, form-fields]
---

# Grouped Values And Metadata

Do not join separate entities into one string with a middle dot, a bullet, or a vertical bar. A separator makes the line shorter, but the reader must then do the parsing work. Dense text is difficult to read.

## Examples To Avoid

- `Q3 2026 · YTD Sep`
- `4 to validate · 2 late · 63 of 69 blocks validated`
- `To validate · 4`
- `Required · 200 characters max`
- `Step 2 of 4 · Billing`

## Give Each Entity An Element

- Give each separate entity its own element and role. This applies to labels, metadata, counts, and concepts.
- Use whitespace and type roles to separate peers on one line. Give the identifying value the primary role and the qualifier a quieter role. Then `Q3 2026` and `YTD Sep` need only a gap.

## Counts

Show a count on a heading or a tab as a count badge: `To validate` followed by a `4` badge, not `To validate · 4`.

## Status Summaries

- Show a status summary as separate figures. Put each value above its short label: `4` above `to validate`, `2` above `late`, `63 of 69` above `blocks validated`.
- Add a meter when the progress toward a total is important.
- When a figure needs attention, add a status color and a text cue.

## Labelled Metadata

Show labelled metadata, such as owners, versions, and key dates, as label and value pairs.

## Running Text

- When several facts must stay in running text, write a complete sentence, not a chain of fragments.
- Text that cannot use layout uses natural language with ordinary punctuation. Examples are native `<option>` labels, tooltips, and accessible names: `Target: 60`, `Competitor A (AML, marketed)`.

## Ranges

Keep the en dash in a numeric or date range, such as `2024–2026` or `Q1–Q3`. A range is one value, not a list of separate entities.

## A Separator Is A Warning

If you want to add a separator, examine the structure first. Usually the structure does not show the relationship, or the surface shows details that the reader does not need. Improve the structure or remove the details.
