---
id: edge-accents
topic: layout
summary: No contrasting strip on only the left or top edge of a card, notice, row, or navigation item, including the current navigation item.
keywords: [fingernail, left border, left border on active nav item, accent bar, accent rail, stripe, edge accent, border-left, inset shadow, pseudo-element, active indicator, selected row border, callout border]
requires: [hierarchy]
related: [navigation, signature-elements, accessibility]
---

# Edge Accents

A "fingernail" accent is a contrasting strip on only the left edge or the top edge of an element. Do not use it.

## The Rule

- Do not put a contrasting strip on only the left or the top edge of a card, a notice, a navigation item, or a selected row.
- The rule also prohibits the equivalents: a rail, a stripe, a pseudo-element, and an inset shadow.
- The rule applies in light and dark themes.

Use spacing, a quiet surface, and text weight for hierarchy and selection.

## Current Navigation Item

Never mark the current navigation item with a left-edge border, rail, stripe, pseudo-element, or inset shadow. This applies to navigation bars, sidebars, and navigation lists.

Use a surface change and a typography change with `aria-current`. [[navigation#active-state]] gives the treatment.

## What The Rule Permits

- Functional dividers between items.
- A uniform outline on all edges of an element.
- An accessible focus ring.
- A signature element from the domain, such as the stub of a ticket or the edge of a repair tag. It must not mark selection or the current item. [[signature-elements]] gives the rules.
