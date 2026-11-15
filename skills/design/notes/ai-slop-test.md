---
id: ai-slop-test
topic: process
summary: The test of whether people would believe that AI made the interface, and the visual patterns that mark generated work.
keywords: [ai slop, ai slop test, generic ai design, looks ai generated, ai aesthetic, template look, generic design, cliche, purple gradient, gradient text, glassmorphism, glow, neon on dark, hero metric, identical card grid, centered everything]
related: [visual-direction, review, hierarchy, spacing]
---

# AI Slop Test

Show the interface to a person and say "AI made this." If they believe it at once, the design has failed. A distinctive interface makes people ask "how was this made?", not "which AI made this?"

## Run The Test

1. Look at the screen as a new visitor.
2. Find each pattern in the lists below.
3. Remove the pattern, or give it a reason that comes from the product or the [[visual-direction]].

## Type And Icons

- An overused font when the direction must be distinctive. [[font-selection#invisible-defaults]] gives the rule.
- A monospace font as a shortcut for a "technical" or "developer" look. [[font-selection#invisible-defaults]] gives the rule.
- A large icon with rounded corners above every heading. [[icons#avoid]] gives the rule.

## Color And Effects

- The AI palette: cyan on a dark background, purple-to-blue gradients, and neon accents on a dark background.
- Gradient text for "impact", mostly on metrics and headings. It is decoration, not meaning.
- A dark theme with glowing accents as the default choice. It looks "cool" but contains no design decision.
- Glassmorphism everywhere: blur effects, glass cards, and glowing borders as decoration.
- Rounded rectangles with a generic drop shadow. Use the elevation scale in [[depth#elevation-scale]].
- A thick colored border on one side of a rounded element. [[edge-accents]] gives the rule.

## Layout

- Cards around everything, and cards in cards. [[spacing#containers-and-cards]] gives the rule.
- A grid of identical cards, each with an icon, a heading, and text, repeated many times.
- The hero metric template: a big number, a small label, supporting statistics, and a gradient accent.
- Everything centered. Use left-aligned text and a deliberate composition. [[visual-direction#apply-it-inside-the-house-rules]] gives the rule.
- The same spacing everywhere, with no rhythm. [[spacing#proximity]] gives the rule.

## Content And Controls

- Sparklines as decoration. [[charts]] gives the rule.
- A modal where a page or an inline section is sufficient. [[overlays#modals]] gives the rule.
- Repeated information: a heading that a subtitle restates. [[ux-writing#say-it-one-time]] gives the rule.
- Every button primary. [[hierarchy#actions]] gives the rule.
