---
id: spacing
topic: layout
summary: Proximity, a constrained spacing scale, intended widths, alignment, and the rules for containers and cards.
keywords: [spacing, whitespace, white space, proximity, padding, margin, gap, spacing scale, 4pt grid, 8pt grid, spacing tokens, alignment, optical alignment, baseline, card, cards, nested cards, container, wrap sections in cards, css grid, auto-fit, fluid width, max width, grouping, rhythm]
requires: [hierarchy]
related: [depth, density, typography]
---

# Proximity And Spacing

Spacing shows which elements belong together. Use it before you add borders, cards, or decoration.

## Proximity

- Put related elements close together. Separate unrelated groups with more space.
- Do not put equal space above and below a heading when this makes the heading affiliation unclear. Put the heading closer to its content.
- Vary the spacing to make a rhythm: tight groups and generous separations. The same spacing everywhere makes the layout monotonous.
- Keep a label closer to its own value or control than to the preceding one.
- Do not move related labels and values so far apart that their relationship becomes unclear.

## Spacing Scale

- Use a constrained spacing scale on a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, and 96px. An 8px base is too coarse, because 12px is often necessary.
- Do not use values outside the scale.
- Name the spacing tokens by relationship, such as `--space-sm` and `--space-lg`, not by value, such as `--spacing-8`.
- Use `gap` for the space between siblings, not margins. It prevents margin collapse.
- Make adjacent values differ enough to show intent. A difference near 25% or more is easier to see.
- Start with more white space than seems necessary. Then reduce it where the content relationship requires it.
- Use liberal outer spacing before you add borders or cards.
- On marketing and content pages, fluid spacing with `clamp()` can give more space on large screens.

## Widths

- Do not fill the available width only to avoid empty space.
- Do not make every width fluid. Use a fixed or a maximum width when the content has an intended size.
- For a grid of items without breakpoints, use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`. Each column is at least 280px wide, and as many columns as fit go on each row.
- For a complex layout, use named grid areas with `grid-template-areas`, and change the areas at the breakpoints.

## Alignment

- Align mixed text sizes by baseline when they are on one line.
- Keep comparable values aligned, so that users can compare them in one pass.
- Align by eye, not only by geometry. Text at `margin-left: 0` looks indented because of the space in the letterforms. A negative margin of approximately `-0.05em` aligns it. A geometrically centered icon often looks off-center: move a play icon to the right, and move an arrow toward its direction.

## Containers And Cards

- Use a container only when it makes a real group or an interaction boundary.
- Use cards only for distinct, comparable, or actionable groups.
- Do not wrap every section in a card.
- Never put a card inside a card. Inside a card, use spacing, typography, and subtle dividers for the hierarchy.
- Do not repeat a grid of identical cards with an icon, a heading, and text. Vary the layout to match the content.
- A table always has its own surface. [[tables#table-surfaces]] gives the rule.
