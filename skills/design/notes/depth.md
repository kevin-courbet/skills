---
id: depth
topic: layout
summary: Surfaces, borders, and one small elevation scale separate regions without decoration.
keywords: [depth, elevation, shadow, drop shadow, box shadow, surface, raised, inset, border, borders, radius, corner radius, layering, z-index]
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

On a dark theme, shadows are weak. [[dark-theme#surface-hierarchy]] gives the rules.

## Inset And Raised Surfaces

- Use inset surfaces for quiet groups. Use raised surfaces for content that must come forward.
- Put related read-only values in a quiet inset surface when a raised card would give them too much weight. An example is a group of read-only facts in a form.

## Coherence

Keep corner radii, icon style, and control treatment coherent across components.
