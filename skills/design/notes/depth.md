---
id: depth
topic: layout
summary: Surfaces, borders, and one small elevation scale separate regions without decoration.
keywords: [depth, elevation, shadow, drop shadow, box shadow, surface, raised, inset, border, borders, radius, corner radius, layering, z-index, z-index scale, stacking order, sidebar color, navigation surface, content panel, app shell]
requires: [spacing]
related: [dark-theme, color, finishing-details]
---

# Depth And Surfaces

Separate regions with space and surfaces first. Add depth only when it explains a layer.

## Borders

- Reduce borders before you add more decoration.
- Remove a border when it does not show a boundary. Then check that the structure stays clear.
- Separate regions with surface color, spacing, or a subtle shadow.

## Elevation Scale

- Define a small elevation scale. Do not make one shadow for each component.
- Offset shadows vertically. This implies one light source above the page.
- Use larger, softer shadows for higher elevation. Use smaller, tighter shadows near the surface.
- Consider a two-part shadow: one broad soft shadow and one short sharp shadow.
- Change elevation for interaction only when it explains press, lift, or drag behavior.
- Keep shadows subtle. If you clearly see a shadow, it is probably too strong.

## Stacking Order

Define a semantic z-index scale, not arbitrary numbers. From low to high: dropdown, sticky, modal backdrop, modal, toast, and tooltip.

On a dark theme, shadows are weak. [[dark-theme#surface-hierarchy]] gives the rules.

## App Shell Surfaces

- Make the navigation frame darker than the content panel, in the light theme and in the dark theme. The content is the work, so it comes forward. The navigation stays behind it.
- Make the content panel the lightest base surface. Do not put white controls on a gray panel. They look pasted on, and the panel looks dull.

## Inset And Raised Surfaces

- Use inset surfaces for quiet groups. Use raised surfaces for content that must come forward.
- Put related read-only values in a quiet inset surface when a raised card would give them too much weight. An example is a group of read-only facts in a form.

## Coherence

Keep corner radii, icon style, and control treatment coherent across components.
