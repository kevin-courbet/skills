---
id: accessibility
topic: accessibility
summary: Semantic HTML, accessible names, native behavior, keyboard use, zoom, every interaction state, and no meaning by color only.
keywords: [accessibility, a11y, wcag, semantic html, aria, accessible name, screen reader, keyboard, focus, focus ring, zoom, 200% zoom, color blind, interaction states, hover state, disabled state, loading state, native controls]
related: [contrast, form-fields, icons, edge-accents]
---

# Accessibility

Accessibility is part of the design, not a final check. Contrast values are in [[contrast]].

## Semantics And Names

- Keep semantic HTML and accessible names, also when you reduce the visible labels.
- Use the correct HTML element for its meaning. Then style it for its role.
- Give an icon-only control an accessible name. [[icons#accessibility]] gives the rules.

## Native Behavior

- Keep native semantics, native behavior, and keyboard operation when you replace browser-default visuals.
- Keep familiar control behavior when the visual treatment changes.
- Improve default controls and icons only when the custom result keeps the semantics, the accessibility, and the familiar behavior.

## Color Is Never The Only Signal

- Use color as support, never as the only signal for status or selection.
- Pair a status color with text, an icon, or a shape.
- Show selection with more than color, such as a check, a weight change, or a boundary.

## Interaction States

- Design every state that the control can have: default, hover, active, focus, selected, disabled, invalid, error, success, and loading.
- Make focus, selected, invalid, disabled, and loading states visible.
- Keep disabled controls understandable.

## Keyboard And Focus

- Make every control operable with the keyboard, in the order of the page.
- Keep a visible focus indicator around the complete interactive target.
- Use a focus ring that works on every surface where the control can appear.

## Zoom And User Settings

- Keep body text at a readable size.
- Respect browser zoom and user font settings.
- Make sure that the interface still works at 200% zoom.
- Test `prefers-contrast` and forced-colors behavior when the product supports these user preferences.
