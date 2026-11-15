---
id: sources
topic: process
summary: The sources that the design notes condense, with their licenses and credits, and the links for the dark theme, the palettes, and the icons.
keywords: [sources, source basis, references, bibliography, refactoring ui, frontend-design, impeccable, emil kowalski, ibelick, attribution, credits, citations, where do these rules come from, license]
related: [method, dark-theme, palettes, icons, graphite]
---

# Source Basis

The notes keep durable principles from these sources. They qualify example-specific values as starting points. They apply current web and accessibility guidance where the older source material needs an update.

## Refactoring UI

The method condenses the user-provided Refactoring UI package: `Designing Content`, `Designing a Dashboard`, `Designing a Complex Form`, and the companion Refactoring UI book and references. The pattern inventory in [[patterns]] comes from its component gallery.

The bundled palettes come from the same package, Color Palettes JSON version 1.1.0. `assets/palettes/NOTICE.md` records the source. [[palettes]] gives their use.

## Frontend Design

Apache 2.0. Based on Anthropic's frontend-design skill, enhanced by Impeccable (pbakaus). See https://impeccable.style/ for attribution.

These notes condense and modify rules from that skill and its references: [[visual-direction]], [[ai-slop-test]], [[ux-writing]], [[loading-states]], [[reduced-motion]], [[project-context]], [[typography]], [[font-selection]], [[color]], [[contrast]], [[dark-theme]], [[semantic-tokens]], [[spacing]], [[hierarchy]], [[depth]], [[density]], [[responsive]], [[accessibility]], [[overlays]], [[form-errors]], [[patterns]], [[springs-and-gestures#discoverable-gestures]], [[easing-and-duration]], and [[charts]]. Where the house rules disagree with the source, the notes follow the house rules.

## Design Engineering

The motion notes condense the design engineering skill of Emil Kowalski ([emilkowal.ski](https://emilkowal.ski/)): [[motion]], [[easing-and-duration]], [[component-feel]], [[springs-and-gestures]], [[clip-path-animation]], [[motion-performance]], [[reduced-motion]], and the findings format in [[review#findings-format]]. The Sonner principles in [[component-feel#components-that-people-like]] come from his work on Sonner.

## Motion Performance

[[motion-performance]] also condenses the `fixing-motion-performance` skill from ibelick ([ui-skills](https://github.com/ibelick/ui-skills)).

## Dark Theme Sources

[[dark-theme]] condenses these primary sources:

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

Graphite does not come from these sources. [[graphite]] gives its origin.

## Icons

- Lucide documentation: `https://lucide.dev/guide/`
- Lucide license: `https://lucide.dev/license`

## Owner Preferences

The skill owner set these rules as design preferences. They do not come from the sources above.

- No edge accents: [[edge-accents]].
- No separator glyphs between separate entities: [[grouped-values]].
- A preview of the end result: [[form-preview]].
- Signature elements from the domain: [[signature-elements]].
- One control height in a row, and an app frame that page density does not change: [[density]].
- The collection of design context into `DESIGN.md`: [[project-context]].
- Proposals as running previews of the real components: [[proposal-previews]] and [[preview-server]].
