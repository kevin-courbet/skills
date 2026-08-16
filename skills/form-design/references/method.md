---
updated: 2026-08-15
---

# UI Design

Use this method to design or refactor content pages, application screens, dashboards, tables, settings, and complex forms. First make the interface understandable. Then make it distinctive.

## Working Method

1. Start with one real feature, not the application shell.
2. List the content, actions, and decisions that the feature requires.
3. Rank what users must notice first, compare next, and inspect only when needed.
4. Build a low-fidelity structure with real content before adding polish.
5. Establish hierarchy with size, weight, contrast, position, and space.
6. Establish relationships with proximity and alignment.
7. Choose component boundaries only after the information structure is clear.
8. Add color, depth, imagery, and detail as controlled finishing passes.
9. Adapt the information and arrangement for narrow screens.
10. Test scanning, reading, interaction states, contrast, and keyboard use.

Build the smallest useful version. Do not design every future screen before the core feature works. Iterate in short cycles so implementation can expose bad assumptions early.

## Hierarchy

- Give the highest visual weight to the information or action that matters most to the user.
- De-emphasize supporting content before making the primary content larger.
- Combine two or three hierarchy tools. Size alone creates weak hierarchy.
- Keep labels quieter than values. Keep section headings quieter than the content when the content is the real focus.
- Separate document semantics from visual importance. Use the correct HTML element, then style it for its role.
- Treat action importance separately from action meaning. Destructive does not always mean primary.
- Usually provide one primary action, a small number of secondary actions, and quiet tertiary actions.
- Use visible labels for form controls. For displayed data, omit a label only when context and formatting make the meaning clear.
- Make the identifying value dominant and supporting values quieter.
- Balance visual weight as well as contrast. Large or solid icons often need softer color than nearby text.

Use a squint test: blur the page or step back. The primary element, secondary element, and major groups must remain clear.

## Proximity And Spacing

- Put related elements close together and separate unrelated groups with more space.
- Avoid equal space above and below a heading when it makes the heading affiliation unclear.
- Use liberal outer spacing before adding borders or cards.
- Use a constrained spacing scale. Adjacent values must differ enough to show intent; differences near 25% or more are easier to perceive.
- Start with more white space than seems necessary, then reduce it where the content relationship requires it.
- Do not fill available width only to avoid empty space.
- Do not make every width fluid. Use fixed or maximum widths when content has an intended size.
- Align mixed text sizes by baseline when they belong on one line.
- Use cards only for distinct, comparable, or actionable groups. Do not wrap every section in a card.

## Typography And Content

- Make paragraphs approximately 45 to 75 characters wide. Use a `ch`-based maximum width as a practical web implementation.
- Treat 20 to 35 `em` as a rough measure range, not a universal token.
- Start body line-height near 1.4 to 1.7. Increase it for long lines and decrease it as type becomes larger.
- Use tighter line-height for large headings. Do not apply one line-height to all text.
- Use a deliberate type scale with clearly different steps. Use stable `rem` tokens for application UI.
- Keep body text at a readable size and respect browser zoom and user font settings.
- Choose typefaces that remain legible at small sizes. Prefer a useful weight range, neutral proportions, and a clear x-height for application UI.
- Recalibrate sizes and weights when changing fonts. Weight names do not look equal across families.
- Use one strong family before adding a second. Add a contrasting family only when it gives content a distinct voice.
- Do not make every link compete through accent color. Give inline links an underline or another non-color cue, with equivalent hover and focus treatment.
- Use tabular numerals where numeric comparison matters.
- Keep list items separate enough to scan. A gap near twice the font size is a useful starting point for loose content lists.

Three text roles are often enough for one surface: primary, secondary, and low-priority. This does not limit the full design palette to three colors.

## Dashboards And Data

- Organize data by user task, not by database fields.
- Put overview values where users can read them at a glance.
- Let labels support values instead of competing with them.
- Convert raw values into forms that reduce mental work, such as relative or human-readable dates when exact dates are not required.
- Use recent or important records for a rich summary and a denser table for deeper inspection only when both views serve different tasks.
- Consolidate secondary fields when sorting or independent scanning is not required.
- Keep identifiers, important values, and high-severity states visible when space is limited.
- Use color to enrich status, not to carry status alone. Pair it with text, icon, or shape.
- Prefer dark text on a soft status background when a saturated badge would overpower the page.

### Tables

- Left-align ordinary text.
- Right-align numeric values and use tabular numerals so magnitudes and decimals compare cleanly.
- Give rows enough vertical space to scan.
- De-emphasize headings so data remains dominant.
- Use alignment and spacing before adding grid lines.
- Remove borders that do not clarify a boundary. Use subtle row backgrounds or zebra striping only when they improve tracking.
- Preserve a visible cue when a narrow-screen table scrolls horizontally. Make the scroll container keyboard-focusable, give it an accessible name, and show focus clearly.
- If the screen is for overview, remove low-priority columns instead of forcing the full desktop table onto mobile.

## Complex Forms

- Group related fields into named sections such as profile, account, billing, or notifications.
- Add section guidance only when it helps users understand the requested information.
- Use input length as an affordance. A postal code field must not look as long as an address field.
- Do not stretch every input across the page. A separate title or guidance column can balance unused width on large screens.
- Use a clear surface difference between controls and the page. White controls on a subtle off-white page are one option.
- Make controls large enough to scan and operate. A 48px control height is a useful starting point, not a fixed law.
- Keep each label closer to its own control than to the preceding control.
- Provide clear default, hover, focus, selected, disabled, invalid, and loading states.
- Keep native semantics and keyboard behavior when replacing browser-default visuals.
- Use richer option cards only when choices contain meaningful values that users must compare.
- In a choice card, emphasize the differentiator, reduce repeated labels, and show selection with more than color.
- Group related read-only values in a quiet inset surface when a raised card would give them too much weight.
- Place workflow actions consistently across the product. On mobile, stacked full-width actions can work; keep the primary action first.

## Color

- Build colors by role: primary, neutral, semantic, and surface.
- Use a controlled shade scale instead of choosing each color independently.
- Tint neutrals toward the product temperature when pure gray feels disconnected.
- Use OKLCH for new web palettes when the project supports it. It gives more predictable perceptual steps than HSL or HSB.
- On colored surfaces, derive secondary text from the surface hue instead of using muddy neutral gray.
- Limit hue rotation when adjusting brightness. Large rotations can change the perceived color identity.
- Verify actual foreground and background pairs with contrast tools. Do not trust palette values or visual judgment alone.
- Do not rely on hue alone. Preserve readable lightness contrast and add a non-color signal.
- Use accent color sparingly so it keeps its visual force.

## Depth And Surfaces

- Reduce borders before adding more decoration.
- Use surface color, spacing, or a subtle shadow to separate regions.
- Define a small elevation scale instead of inventing one shadow per component.
- Offset shadows vertically to imply a consistent light source above the page.
- Use larger, softer shadows for higher elevation and smaller, tighter shadows near the surface.
- Consider a two-part shadow: one broad soft shadow and one short sharp shadow.
- Change elevation for interaction only when it explains press, lift, or drag behavior.
- Use inset surfaces for quiet grouping and raised surfaces for content that must come forward.
- Keep corner radii, icon style, and control treatment coherent across components.

## Images And Finishing Details

- Use images at their intended size. Do not enlarge small assets until they become soft or reduce detailed screenshots until their text becomes unreadable. Use a narrower source capture, a partial capture, or a simplified illustration when the target area is smaller.
- Guarantee text contrast over images with overlays, image treatment, or a controlled text surface.
- Constrain user-uploaded images in fixed containers and account for transparent or matching backgrounds.
- Design empty states as first-use experiences. Remove filters, tabs, or actions that have no purpose before content exists.
- Improve default controls and icons only when the custom result keeps semantics, accessibility, and familiar behavior.
- Add decorative accents only after hierarchy works. A border, quote mark, illustration, or background detail must reinforce the page voice.

## Responsive Adaptation

- Preserve priority and relationships, not desktop geometry.
- Do not scale all type and spacing by one ratio. Large desktop headlines usually need a smaller ratio on mobile.
- Stack sections when columns cause wrapping, but do not stack automatically when it creates excessive scrolling or empty space.
- Recompose component internals to use narrow horizontal space, such as placing comparable prices in one right-aligned column.
- Keep critical actions available. Adapt their layout instead of hiding them.
- Simplify overview screens by removing low-priority detail. Keep detail screens complete through scrolling or another explicit navigation pattern.
- Test at content-driven breakpoints where the layout stops working, not only at device presets.

## Review Checklist

- Can users identify the page purpose and primary value or action in a few seconds?
- Does visual importance match user importance?
- Are labels, metadata, and secondary actions quiet enough?
- Does spacing show which elements belong together?
- Are paragraph measure and line-height comfortable?
- Are numbers easy to compare and statuses easy to interpret?
- Are form fields grouped, correctly sized, and clearly labeled?
- Are focus, selected, invalid, disabled, and loading states visible?
- Can status and selection be understood without color?
- Can borders be removed without losing structure?
- Do shadows and surfaces follow one elevation model?
- Does mobile preserve the task while changing the arrangement?
- Does the interface still work at 200% zoom and with keyboard navigation?

## Source Basis

This method condenses the user-provided Refactoring UI package: `Designing Content`, `Designing a Dashboard`, `Designing a Complex Form`, and the companion Refactoring UI book and references. It keeps durable principles, qualifies example-specific values as starting points, and applies current web and accessibility guidance where the older source material needs an update.
