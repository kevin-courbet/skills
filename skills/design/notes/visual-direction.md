---
id: visual-direction
topic: process
summary: Choose one clear aesthetic direction for a new product, a marketing page, or a content page, apply it inside the house rules, and keep the existing product system unless the user asks for a new direction.
keywords: [visual direction, aesthetic direction, aesthetic, art direction, bold design, distinctive design, brand feel, look and feel, style, tone, mood, landing page design, marketing page, editorial, brutalist, minimal, maximalist, memorable, generic design]
requires: [method]
related: [project-context, ai-slop-test, signature-elements, font-selection, palettes, motion]
---

# Visual Direction

A visual direction is one clear aesthetic idea that the whole interface follows. Bold maximalism and refined minimalism both work. The important thing is intent, not intensity.

## When To Choose A Direction

| Situation | Decision |
| --- | --- |
| A new product without a design system | Choose a direction. |
| A marketing page, a landing page, or a content page | Choose a direction. |
| The user asks for a new look | Choose a direction. |
| A change in a product with a design system | Keep the product system. [[method#respect-the-product-system]] gives the rule. |
| A functional app that needs character | Keep the system, and add one or two [[signature-elements]]. |

The existing product design system wins unless the user asks for a new direction. [[project-context]] gives the context to collect before you choose.

## Define The Direction

Answer these four questions before you write code:

- **Purpose.** What problem does the interface solve, and who uses it?
- **Tone.** Select one clear tone, and make it your own. Examples are brutally minimal, maximalist, retro-futuristic, organic, luxury and refined, playful, editorial, brutalist, art deco, soft and pastel, and industrial.
- **Constraints.** The framework, the performance budget, and the accessibility level.
- **Differentiation.** What is the one thing that people will remember?

Write the answers in `DESIGN.md`. [[project-context#what-design-md-contains]] gives the sections.

## Apply It Inside The House Rules

- Choose the direction early, but apply it after the structure works. Hierarchy, spacing, contrast, and accessibility rules stay in force. [[method#build-the-structure]] gives the order.
- Express the direction through tokens: the font pair, the palette, the radii, the depth, and the motion. [[font-selection]], [[palettes]], [[depth]], and [[motion#match-the-motion-to-the-product]] give the rules.
- Use a dominant color with sharp accents. A timid palette with evenly distributed colors is forgettable. [[color#accent-and-semantic-color]] gives the limits.
- On marketing and content pages, asymmetry and unexpected compositions are permitted. Break the grid on purpose for emphasis, not by accident. Left-aligned text with an asymmetric layout looks more designed than a page where everything is centered.
- Vary the spacing to make a rhythm: tight groups and generous separations. [[spacing#proximity]] gives the rule.
- In a functional app, the direction lives in the tokens and in the [[signature-elements]]. It does not change the structure of the workflow.

## Match The Code To The Direction

- A maximalist direction needs elaborate code, with many effects and much animation. [[motion]] still decides what animates.
- A minimal or refined direction needs restraint and precision in spacing, typography, and small details.

## Do Not Repeat A Direction By Habit

- Across separate projects, do not converge on the same font, palette, theme, or layout. Each direction comes from its context.
- Vary light and dark themes, fonts, and aesthetics between projects when the context permits it.
- Test the result with [[ai-slop-test]].
