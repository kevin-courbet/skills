# Dark Theme

Design a dark theme as a separate appearance of the same system. Do not invert the light theme or reuse its values without evaluation.

## Start With The Product

1. Preserve the product hierarchy, brand identity, and component behavior.
2. Identify the page base, grouped regions, raised surfaces, controls, overlays, and status roles.
3. Audit direct colors, alpha utilities, gradients, images, shadows, and third-party content.
4. Compare complete representative screens in both themes. Do not approve a palette from isolated swatches.

## Default Dark Palette: Graphite

Use Graphite when the product does not define its own dark theme. If the product has a dark theme, use it and apply this method to it. `assets/themes/graphite.css` contains the tokens for the system preference and for an explicit `data-theme="dark"` choice.

Graphite supplies dark values only. Keep the light values from the product or its brand kit.

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#17181a` | Page base |
| `--surface` | `#202124` | Raised surface, such as a panel, a table container, or a menu |
| `--inset` | `#111214` | Inset surface, such as a code block or a read-only group |
| `--rule` | `#383a40` | Subtle border and row rule |
| `--rule-strong` | `#757981` | Control boundary and strong divider |
| `--ink` | `#ececee` | Primary text |
| `--muted` | `#a9acb3` | Secondary text, labels, and table headings |
| `--accent` | `#9aaeff` | Links, focus rings, selection, and solid primary actions |
| `--accent-soft` | `#292d3a` | Quiet emphasis surface |
| `--on-accent` | `#17181a` | Text on a solid accent fill |
| `--good` | `#72cf98` | Success text and icons |
| `--good-soft` | `#24322c` | Success surface |
| `--warn` | `#efc35e` | Warning text and icons |
| `--warn-soft` | `#353024` | Warning surface |
| `--bad` | `#ff8480` | Danger text and icons |
| `--bad-soft` | `#372728` | Danger surface |
| `--info` | `#6cc6e2` | Information text and icons |
| `--info-soft` | `#233036` | Information surface |

Set `color-scheme: dark` with the tokens, so that native controls use the dark appearance.

This table gives the measured WCAG 2.2 contrast for the pairs that Graphite expects:

| Foreground | Background | Ratio |
| --- | --- | --- |
| `--ink` | `--bg` | 15.06:1 |
| `--ink` | `--surface` | 13.65:1 |
| `--muted` | `--bg` | 7.82:1 |
| `--muted` | `--surface` | 7.08:1 |
| `--accent` | `--bg` | 8.35:1 |
| `--accent` | `--surface` | 7.57:1 |
| `--ink` | `--accent-soft` | 11.63:1 |
| `--muted` | `--accent-soft` | 6.04:1 |
| `--accent` | `--accent-soft` | 6.45:1 |
| `--on-accent` | `--accent` | 8.35:1 |
| `--good` | `--good-soft` | 7.08:1 |
| `--warn` | `--warn-soft` | 7.90:1 |
| `--bad` | `--bad-soft` | 5.98:1 |
| `--info` | `--info-soft` | 6.99:1 |
| `--rule-strong` | `--bg` | 4.07:1 |
| `--rule-strong` | `--surface` | 3.69:1 |

All text pairs in this table pass `4.5:1`. `--rule-strong` is non-text contrast and passes `3:1` on `--bg` and on `--surface`. `--rule` is `1.56:1` on `--bg` and `1.42:1` on `--surface`, so it cannot identify a required boundary.

- Use the Graphite values without changes. If the product uses other token names, map the values to those names.
- Keep surfaces neutral. Do not tint `--bg`, `--surface`, or `--inset` toward the accent.
- Use `--accent-soft` for quiet emphasis surfaces, such as a key-statement band or a count badge.
- Use `--on-accent` only for text on a solid `--accent` fill.
- Show each status with its pair. Use the status color for text or an icon, and its soft color for the surface. Add text or an icon, so that color is not the only signal.
- Use `--rule-strong` for control boundaries. Use `--rule` only for quiet separation, such as row rules and container borders.
- Graphite does not define hover, active, or disabled values. Derive them from the Graphite values and measure each pair.
- Measure each new pair before you use it. The table above shows only the measured pairs.

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

- If the product has no dark theme of its own, does the theme use the Graphite values without changes?
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

Graphite is the approved default palette of this skill, not a palette from these sources. Its contrast ratios use the WCAG 2.2 relative luminance formula.

The sources disagree about pure black, shadows, and interaction direction. Follow the product platform and content instead of forcing one system's values.

Use WCAG 2.2 for conformance. APCA can provide extra readability evidence, but it is not a WCAG 2 conformance method.
