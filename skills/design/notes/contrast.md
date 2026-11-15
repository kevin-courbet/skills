---
id: contrast
topic: color
summary: WCAG 2.2 contrast limits for text, placeholders, controls, focus, and states, measured on the real pairs in both themes.
keywords: [contrast, contrast ratio, contrast ratio for muted text, wcag, aaa, 4.5:1, 3:1, 7:1, non-text contrast, placeholder contrast, muted text, secondary text, focus indicator, color blindness, red green, contrast checker, transparency, alpha, apca, lightness, legibility]
requires: [accessibility]
related: [color, dark-theme, graphite, typography]
---

# Contrast

Use WCAG 2.2 for conformance. Measure each real foreground and background pair. Do not trust palette values, shade numbers, or visual judgment alone.

## Text

- Keep normal-size text at `4.5:1` or more.
- Keep large text at `3:1` or more. WCAG defines large text as approximately `24px`, or `18.5px` bold.
- For the AAA level, keep normal-size text at `7:1` or more and large text at `4.5:1` or more.
- Make secondary text visibly quieter, but keep it at `4.5:1` or more at normal size.
- Evaluate placeholder text as text. It also needs `4.5:1` at normal size.
- Do not use a light shade for text without a contrast test.
- Test each pair at its real size and weight.

## Lightness, Not Hue

Do not rely on hue alone. Keep a readable lightness contrast, and add a signal that is not color.

## Risky Pairs

These pairs often fail contrast or are hard to read:

- Light gray text on white. This is the most frequent failure.
- Gray text on a colored background. It looks washed out. [[color#color-space-and-hue]] gives the fix.
- Red text on green, or green text on red. Approximately 8% of men cannot distinguish these colors.
- Blue text on red. The colors vibrate.
- Yellow text on white. It almost always fails.
- Thin, light text on images. The contrast is not predictable. [[finishing-details#images]] gives the fix.

## Controls, Icons, And Focus

- Give required control boundaries, icons, states, and focus indicators at least `3:1` contrast against the adjacent colors.
- Do not depend on a subtle background shift to show selection or keyboard focus.
- WCAG exempts inactive controls from the minimum contrast. Keep disabled controls understandable all the same.

## States

- Test default, hover, active, selected, focus, invalid, and disabled states in both themes.
- Choose one interaction direction for each control family. Do not mix lighter and darker hover behavior without a purpose.

## Gradients And Transparency

- Test the part of each meaningful gradient that has the least contrast.
- Avoid stacked transparent fills. Their final contrast changes with every parent surface.
- Much transparency, such as many `rgba()` values, usually shows an incomplete palette. Define explicit overlay colors for each context. Transparency is correct for focus rings and for interaction states that must show what is below them.

## Test With Tools

Do not trust your eyes. Use a tool:

- The [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- The vision deficiency emulation in the Rendering panel of the browser developer tools. Test for color blindness.
- [Polypane](https://polypane.app/) for tests while you work.

## APCA

APCA can give extra evidence about readability. It is not a WCAG 2 conformance method.
