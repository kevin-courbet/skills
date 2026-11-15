---
id: color
topic: color
summary: Build color by role with controlled shade scales, subtle neutrals, and an accent that keeps its force.
keywords: [color, colour, color system, brand color, accent color, primary color, neutral, gray, grey, shade scale, oklch, hsl, hue, chroma, saturation, tint]
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

## Neutrals

- Pure gray can feel disconnected from the product. Then give the neutrals a subtle cast toward the product temperature.
- Keep the cast subtle. A strong brand tint across all surfaces makes the interface look muddy.
- Graphite keeps its surfaces neutral. Do not tint them. [[graphite]] gives the rule.

## Color Space And Hue

- Use OKLCH for new web palettes when the project supports it. It gives more predictable perceptual steps than HSL or HSB.
- Limit hue rotation when you change brightness. Large rotations can change the perceived color identity.
- On colored surfaces, derive secondary text from the surface hue. Do not use a muddy neutral gray.

## Accent And Semantic Color

- Use the accent color sparingly, so that it keeps its visual force.
- Limit brand color to actions, selection, focus, charts, and deliberate emphasis.
- Use semantic colors for meaning, not decoration.
- Reduce chroma on large colored surfaces. Keep stronger chroma for small, high-emphasis elements.
- Verify each foreground and background pair. [[contrast]] gives the limits.
