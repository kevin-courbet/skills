# Dark Theme

Design a dark theme as a separate appearance of the same system. Do not invert the light theme or reuse its values without evaluation.

## Start With The Product

1. Preserve the product hierarchy, brand identity, and component behavior.
2. Identify the page base, grouped regions, raised surfaces, controls, overlays, and status roles.
3. Audit direct colors, alpha utilities, gradients, images, shadows, and third-party content.
4. Compare complete representative screens in both themes. Do not approve a palette from isolated swatches.

## Use Semantic Tokens

- Keep raw palette values separate from semantic tokens.
- Let components use semantic tokens only.
- Change semantic token values for each theme. Do not change component meaning between themes.
- Add component tokens only when a global role cannot describe the component.
- Define paired foreground and background tokens for accent and status roles.
- Define rest, hover, active, selected, focus, and disabled values for each interactive role.
- Treat direct palette utilities in components as defects unless they represent fixed user content.

At minimum, define these role groups:

- page, subtle, raised, overlay, and inset surfaces;
- primary, secondary, disabled, inverse, and link text;
- subtle, default, strong, interactive, and focus borders;
- accent, success, warning, danger, and information roles;
- separate foreground, muted background, strong background, and border values for each status.

## Build Surface Hierarchy

- Use a near-black, tinted neutral for a typical web application base.
- Use pure black only when the platform, content, or hardware gives a clear reason.
- Make raised dark surfaces lighter than the page base. Shadows alone are weak on dark backgrounds.
- Use a small number of deliberate surface levels. More levels make the page noisy and flatten their meaning.
- Pair close surfaces with a border when users must perceive the boundary.
- Use stronger boundaries for controls and selected states than for quiet content groups.
- Do not put a darker component on a dark base when that makes the component look recessed by accident.
- Test nested surfaces together. A token can work on the page and fail inside a raised panel.

Material, Apple, Carbon, Fluent, Radix, and Primer all use lighter dark surfaces to express hierarchy. Their exact ramps are system-specific.

## Control Color

- Keep neutral surfaces low in chroma. A strong brand tint across all dark surfaces makes the interface look muddy.
- Keep the brand hue as a subtle cast, not a colored wash.
- Limit brand color to actions, selection, focus, charts, and deliberate emphasis.
- Create dark-theme values for accents and status colors. Light-theme values can glare or lose contrast.
- Reduce chroma on large colored surfaces. Reserve stronger chroma for small, high-emphasis elements.
- Use semantic colors for meaning, not decoration.
- Add text, an icon, or a shape when color communicates status.

Linear reduced blue in its neutral calculations to make its themes more neutral. Fluent also limits brand color because broad use weakens hierarchy.

## Keep Text Clear

- Use a high-contrast off-white for primary text.
- Make secondary text visibly quieter, but keep normal-size text at `4.5:1` or more.
- Use no more text levels than the content hierarchy needs.
- Do not apply muted text to most of the interface. Excessive muted text makes the complete page look disabled.
- Increase dark-theme text contrast when thin strokes, small sizes, or anti-aliasing make text look faint.
- Evaluate placeholder text as text. It also needs `4.5:1` contrast at normal sizes.
- Keep large text at `3:1` or more. WCAG defines large text as approximately `24px`, or `18.5px` bold.

Linear made neutral text and icons lighter in dark mode. Apple uses primary through quaternary text roles to express hierarchy.

## Make Controls Perceivable

- Give required control boundaries, icons, states, and focus indicators at least `3:1` contrast against adjacent colors.
- Do not depend on a subtle background shift to identify selection or keyboard focus.
- Use a clear focus ring that works against every surface where the control can appear.
- Test default, hover, active, selected, focus, invalid, and disabled states in both themes.
- Keep disabled controls understandable even though WCAG exempts inactive controls from minimum contrast.
- Choose one interaction direction for each control family. Do not mix lighter and darker hover behavior without purpose.

## Use Effects With Restraint

- Prefer surface lightness and borders over broad shadows for dark-theme depth.
- Keep shadows only when they clarify overlays, menus, drag state, or modal separation.
- Use gradients only when they communicate structure, progress, data, or material behavior.
- Test the least-contrasting part of each meaningful gradient.
- Do not use gradients to repair a weak palette or decorate ordinary text and controls.
- Replace bright image backgrounds with theme-specific assets when they create glare.
- Use transparent image backgrounds only when one asset must serve both themes.
- Avoid stacked transparent fills. Their final contrast changes with every parent surface.

## Implement Theme Selection

- Support the operating-system preference when the product has no explicit saved choice.
- Apply the saved theme before the first render to prevent an incorrect-theme flash.
- Set `color-scheme` so native controls use the selected appearance.
- Consider light, dark, and system choices when users need explicit control.
- Test `prefers-contrast` and forced-colors behavior when the product supports these user preferences.

Tailwind supplies theme selection and state variants. It does not supply a complete dark-theme palette.

## Review Checklist

- Does the primary content advance while secondary content recedes?
- Can users distinguish the page, grouped regions, raised surfaces, controls, and overlays?
- Are neutral surfaces neutral enough to avoid a colored wash?
- Does the theme use one restrained accent instead of many competing hues?
- Do primary and secondary text remain clear during extended reading?
- Do all text pairs meet WCAG contrast limits at their actual size and weight?
- Do required controls, icons, boundaries, and focus indicators meet `3:1`?
- Are status and selection understandable without color?
- Do hover, active, selected, focus, invalid, and disabled states remain distinct?
- Do gradients and images pass at their weakest meaningful contrast point?
- Does the complete screen still have hierarchy when viewed in grayscale?
- Does the theme work on a dim display and in a normally lit room?

## Source Basis

This guide condenses these primary sources:

- [Linear: How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Tailwind CSS: Dark mode](https://tailwindcss.com/docs/dark-mode)
- [Material Design 2: Dark theme](https://m2.material.io/design/color/dark-theme.html)
- [Apple: What's New in iOS Design](https://developer.apple.com/videos/play/wwdc2019/808/)
- [GitHub Primer: Color usage](https://primer.style/product/getting-started/foundations/color-usage/)
- [Radix Colors: Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
- [IBM Carbon: Color usage](https://carbondesignsystem.com/elements/color/usage/)
- [Microsoft Fluent 2: Color](https://fluent2.microsoft.design/color)
- [WCAG 2.2: Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [WCAG 2.2: Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

The sources disagree about pure black, shadows, and interaction direction. Follow the product platform and content instead of forcing one system's values.

Use WCAG 2.2 for conformance. APCA can provide extra readability evidence, but it is not a WCAG 2 conformance method.
