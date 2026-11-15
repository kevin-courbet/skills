---
id: project-context
topic: process
summary: Read DESIGN.md before design work, and for a new product or direction collect the users, the brand personality, the aesthetic direction, and the principles into DESIGN.md at the project root.
keywords: [design context, DESIGN.md, design md, project context, brand, brand personality, target audience, audience, users, design principles, references, anti-references, design brief, onboarding a project, setup design guidelines]
related: [method, visual-direction, ux-writing]
---

# Project Context

Design without project context gives generic results. `DESIGN.md` at the project root keeps the context for all later sessions.

## Find The Context

Look for the context in this order:

1. The loaded instructions. If they contain a Design Context section, use it.
2. `DESIGN.md` at the project root. If it exists, read it before the first design decision.
3. If neither source has the context, use the rule in [[project-context#when-to-collect-the-context]].

## When To Collect The Context

| Task | Decision |
| --- | --- |
| A new product, a new [[visual-direction]], or a page with a brand voice | Collect the context and write `DESIGN.md` before you design. |
| A change in an existing product | Use the product system and the code. Offer to write `DESIGN.md` after the task. |

## Explore The Code First

Before you ask questions, read what the project already shows:

- The README and the documentation: the purpose, the audience, and the stated goals.
- `package.json` and the configuration files: the stack and the design libraries.
- The components: the patterns, the spacing, and the typography in use.
- The brand assets: logos, favicons, and color values.
- The design tokens and CSS variables: palettes, font stacks, and spacing scales.
- Style guides and brand documentation.

Write down what you learned and what is still not clear. The code shows what the team built. It does not show who uses the product or how the product must feel. Ask the user for that.

## Ask Only What Is Not Clear

Ask the user only the questions that the code does not answer:

- **Users and purpose.** Who uses the product, and in which context? Which task must they complete? Which emotions must the interface give, such as confidence, delight, calm, or urgency?
- **Brand and personality.** Which three words describe the brand? Which sites or apps have the correct feel, and what in each one? What must the product not look like?
- **Aesthetic preferences.** Which visual direction, such as minimal, bold, elegant, playful, technical, or organic? Light theme, dark theme, or both? Which colors must the product use or avoid?
- **Accessibility.** Which WCAG level? Which known user needs, such as reduced motion or color blindness?

## What DESIGN.md Contains

Start from `assets/templates/DESIGN.md`. It has these sections:

- **Users.** Who they are, their context, and their task.
- **Brand Personality.** The voice, the tone, three words, and the emotional goals.
- **Aesthetic Direction.** The visual tone, the references, the anti-references, and the theme.
- **Design Principles.** Three to five principles from the conversation that guide each decision.
- **Design System, Voice, Motion, and Accessibility.** Optional sections for the decisions that override the defaults of this skill.

## Write The File

1. Write `DESIGN.md` at the project root. If it exists, update it in place.
2. Ask the user if the Design Context section must also go into `AGENTS.md`. If yes, add or update the section there.
3. Summarize the design principles that guide the next work.
