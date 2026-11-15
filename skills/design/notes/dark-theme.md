---
id: dark-theme
topic: color
summary: Design a dark theme as a separate appearance of the same system, with lighter raised surfaces, restrained effects, and theme selection before the first render.
keywords: [dark theme, dark mode, dark mode colors, night mode, prefers-color-scheme, color-scheme, theme switch, theme toggle, theme flash, flash of wrong theme, invert colors, dark surfaces, pure black, oled]
requires: [graphite, semantic-tokens, contrast]
related: [color, depth, palettes, sources]
---

# Dark Theme

Design a dark theme as a separate appearance of the same system. Do not invert the light theme. Do not reuse its values without evaluation.

## Start With The Product

1. Keep the product hierarchy, brand identity, and component behavior.
2. Identify the page base, grouped regions, raised surfaces, controls, overlays, and status roles.
3. Audit direct colors, alpha utilities, gradients, images, shadows, and third-party content.
4. Compare complete representative screens in both themes. Do not approve a palette from isolated swatches.

If the product has a dark theme, use it and apply this note to it. If the product has no dark theme, use Graphite. [[graphite]] gives the tokens.

## Surface Hierarchy

- Use a near-black neutral for a typical web application base. A subtle cast is permitted. [[color#neutrals]] gives the limit.
- Use pure black only when the platform, the content, or the hardware gives a clear reason.
- Make raised dark surfaces lighter than the page base. Shadows alone are weak on dark backgrounds.
- Use a small number of deliberate surface levels. More levels make the page noisy and flatten their meaning.
- Pair close surfaces with a border when users must see the boundary.
- Use stronger boundaries for controls and selected states than for quiet content groups.
- Do not put a darker component on a dark base when this makes the component look recessed by accident.
- Test nested surfaces together. A token can work on the page and fail inside a raised panel.

Material, Apple, Carbon, Fluent, Radix, and Primer all use lighter dark surfaces to show hierarchy. Their exact ramps are specific to each system.

## Dark Accent And Status Values

- Make dark-theme values for accents and status colors. Light-theme values can glare or lose contrast.
- Keep neutral surfaces low in chroma. Keep the brand hue as a subtle cast, not a colored wash.

Linear reduced blue in its neutral calculations to make its themes more neutral. Fluent also limits brand color, because broad use weakens hierarchy.

## Dark Text

- Use a high-contrast off-white for primary text.
- Increase the text contrast when thin strokes, small sizes, or anti-aliasing make text look faint.

Linear made neutral text and icons lighter in dark mode. Apple uses primary through quaternary text roles to show hierarchy. The contrast limits are in [[contrast#text]].

## Effects

- Prefer surface lightness and borders over broad shadows for dark-theme depth.
- Keep shadows only when they clarify overlays, menus, drag state, or modal separation.
- Use gradients only when they communicate structure, progress, data, or material behavior.
- Do not use gradients to repair a weak palette or to decorate ordinary text and controls.
- Replace bright image backgrounds with theme-specific assets when they cause glare.
- Use transparent image backgrounds only when one asset must serve both themes.

## Theme Selection

- Follow the operating-system preference when the product has no explicit saved choice.
- Apply the saved theme before the first render. This prevents a flash of the incorrect theme.
- Set `color-scheme`, so that native controls use the selected appearance.
- Consider light, dark, and system choices when users need explicit control.

Tailwind supplies theme selection and state variants. It does not supply a complete dark-theme palette.

## When Sources Disagree

The sources disagree about pure black, shadows, and interaction direction. Follow the product platform and the content. Do not force the values of one system. [[sources#dark-theme-sources]] lists the sources.
