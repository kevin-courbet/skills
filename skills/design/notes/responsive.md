---
id: responsive
topic: layout
summary: Narrow screens keep the task and the priorities but change the information and the arrangement.
keywords: [responsive, mobile, mobile layout, phone, small screen, narrow screen, breakpoint, stack, stacking, adaptive, tablet, media query, container query]
requires: [hierarchy]
related: [density, tables, form-layout]
---

# Responsive Adaptation

Adapt the information and the arrangement for small screens. Do not only shrink or stack the desktop design.

## Keep The Task

- Keep the priorities and the relationships, not the desktop geometry.
- Keep identifiers, critical values, status, and primary actions.
- Keep critical actions available. Change their layout instead of hiding them.
- Do not move related labels and values so far apart that their relationship becomes unclear.

## Recompose

- Recompose wide patterns. Do not only shrink them.
- Stack sections when columns cause wrapping. Do not stack automatically when this causes excessive scrolling or empty space.
- Recompose component internals to use narrow horizontal space. For example, put comparable prices in one right-aligned column.
- Replace a multi-column comparison only when the replacement still supports comparison.
- Do not scale all type and spacing by one ratio. Large desktop headlines usually need a smaller ratio on mobile.

## Overview And Detail

- Simplify overview screens: remove low-priority detail.
- Keep detail screens complete. Use scrolling or another explicit navigation pattern.
- For tables on narrow screens, [[tables#narrow-screens]] gives the rules.

## Breakpoints

Test at the content-driven breakpoints where the layout stops working, not only at device presets.
