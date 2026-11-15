---
id: color
topic: color
summary: Build color by role with controlled shade scales, subtle neutrals, and an accent that keeps its force.
keywords: [color, colour, color system, brand color, accent color, primary color, neutral, gray, grey, tinted neutrals, shade scale, palette structure, 60-30-10, oklch, hsl, hue, chroma, saturation, tint, color-mix, light-dark]
requires: [semantic-tokens, contrast]
related: [palettes, dark-theme, charts]
---

# Color

Color supports the hierarchy. It never carries meaning alone: [[accessibility#color-is-never-the-only-signal]] gives the rule.

## Roles And Scales

- Build colors by role: primary, neutral, semantic, and surface.
- Use a controlled shade scale. Do not choose each color independently.
- Map the scales to semantic tokens. [[semantic-tokens]] gives the rules.
- To start from a bundled palette, use [[palettes]].

A complete system needs these roles:

| Role | Purpose | Size |
| --- | --- | --- |
| Primary | Brand, calls to action, and key actions | 1 color, 3 to 5 shades |
| Neutral | Text, backgrounds, and borders | 9 to 11 shades |
| Semantic | Success, error, warning, and information | 4 colors, 2 or 3 shades each |
| Surface | Cards, modals, and overlays | 2 or 3 elevation levels |

- Do not add secondary or tertiary colors unless the product needs them. Most apps work with one accent color. More accents add noise and more decisions.
- Distribute the visual weight approximately 60-30-10: 60% neutral backgrounds, white space, and base surfaces; 30% text, borders, and inactive states; 10% accent for calls to action, highlights, and focus. The rule is about visual weight, not pixel count.

## Neutrals

- Pure gray can feel disconnected from the product. Then give the neutrals a subtle cast toward the product temperature.
- Keep the cast subtle. A chroma of 0.005 to 0.01 in OKLCH is sufficient. A strong brand tint across all surfaces makes the interface look muddy.
- Graphite keeps its surfaces neutral. Do not tint them. [[graphite]] gives the rule.

## Color Space And Hue

- Use OKLCH for new web palettes when the project supports it. It gives more predictable perceptual steps than HSL or HSB.
- Limit hue rotation when you change brightness. Large rotations can change the perceived color identity.
- Reduce chroma near white and near black. High chroma at extreme lightness looks garish. A light blue at 85% lightness needs approximately 0.08 chroma, not the 0.15 of the base color:

```css
--color-primary: oklch(60% 0.15 250);
--color-primary-light: oklch(85% 0.08 250);
--color-primary-dark: oklch(35% 0.12 250);
```

- Use the modern CSS color functions, such as `oklch()`, `color-mix()`, and `light-dark()`, when the project supports them.
- On colored surfaces, derive secondary text from the surface hue. Do not use a muddy neutral gray.

## Accent And Semantic Color

- Use the accent color sparingly, so that it keeps its visual force.
- Limit brand color to actions, selection, focus, charts, and deliberate emphasis.
- Use semantic colors for meaning, not decoration.
- Reduce chroma on large colored surfaces. Keep stronger chroma for small, high-emphasis elements.
- Verify each foreground and background pair. [[contrast]] gives the limits.
