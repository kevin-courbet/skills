---
id: review
topic: process
summary: The review questions for a finished interface, each linked to the note that holds its rule.
keywords: [review, design review, checklist, audit, qa, critique, check my design, before shipping, polish pass, ui review, review ui code, animation review, findings format, before after table]
requires: [method]
related: [accessibility, contrast, dark-theme, motion, ai-slop-test, proposal-previews]
---

# Review Checklist

Ask each question about the finished screen. When the answer is no, read the linked note. To show a proposal before implementation, use [[proposal-previews]].

## Findings Format

Report the findings about details in one Markdown table with the columns `Before`, `After`, and `Why`, one row for each finding. Quote the exact line or value in `Before`. Give the fix as code or as a concrete value in `After`. Give the reason in one short sentence in `Why`. Never write the findings as a list of separate "Before:" and "After:" lines.

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Name the exact properties. `all` animates more than the intent. |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing in the real world appears from nothing. |
| `ease-in` on a dropdown | `ease-out` with a custom curve | `ease-in` feels slow. `ease-out` gives instant feedback. |
| No `:active` state on a button | `transform: scale(0.97)` on `:active` | A button must respond to the press. |
| `transform-origin: center` on a popover | `transform-origin: var(--radix-popover-content-transform-origin)` | A popover scales from its trigger. A modal stays centered. |

## Structure And Hierarchy

- Can users identify the page purpose and the primary value or action in a few seconds? [[hierarchy]]
- Does visual importance match user importance? [[hierarchy]]
- Are labels, metadata, and secondary actions quiet enough? [[hierarchy#labels-and-values]]
- Does spacing show which elements belong together? [[spacing]]
- Can borders be removed without loss of structure? [[depth#borders]]
- Do shadows and surfaces follow one elevation model? [[depth#elevation-scale]]
- Does the complete screen still have hierarchy in grayscale? [[hierarchy#squint-test]]

## Text And Data

- Are paragraph measure and line-height comfortable? [[typography]]
- Does each label, count, and item of metadata have its own element, with no dot, bullet, or bar between separate entities? [[grouped-values]]
- Are numbers easy to compare and statuses easy to interpret? [[dashboards]]
- Does each table have its own surface, a quiet header band, and rules only between rows? [[tables#table-surfaces]]

## Forms

- Are form fields grouped, correctly sized, and clearly labeled? [[form-layout]] [[form-fields]]
- Do controls in one row have the same height? [[density#one-height-in-a-row]]
- When a form produces a tangible thing, does a preview show that thing in its real shape while people fill in the form? [[form-preview]]
- Does each preview show a real thing, and not a record that lives only in the app? [[form-preview#when-not-to-show-a-preview]]
- Does each signature element come from the domain, use the design tokens, and keep its semantics? [[signature-elements]]

## States And Access

- Are focus, selected, invalid, disabled, and loading states visible? [[accessibility#interaction-states]]
- Can status and selection be understood without color? [[accessibility#color-is-never-the-only-signal]]
- Do all text pairs meet the WCAG limits at their real size and weight? [[contrast#text]]
- Do required controls, icons, boundaries, and focus indicators meet `3:1`? [[contrast#controls-icons-and-focus]]
- Does the interface still work at 200% zoom and with keyboard navigation? [[accessibility#zoom-and-user-settings]]

## Motion

- Does an action that starts from the keyboard, or that people repeat many times each day, have no animation? [[motion#how-often-people-see-it]]
- Does each animation have a purpose? [[motion#purpose]]
- Does each transition name its exact properties, with no `transition: all`? [[motion-performance#choose-the-mechanism]]
- Do entries and exits use `ease-out` or a custom curve, and never `ease-in`? [[easing-and-duration#select-the-easing]]
- Does each UI animation take less than 300ms, and is each exit faster than its entry? [[easing-and-duration#duration]]
- Does each entry start from `scale(0.95)` or more with `opacity: 0`, and never from `scale(0)`? [[component-feel#never-start-from-scale-zero]]
- Does each popover scale from its trigger, while modals stay centered? [[component-feel#origin-aware-popovers]]
- Does each pressable element respond on `:active`? [[component-feel#press-feedback]]
- Do elements that people trigger quickly use transitions, not keyframes? [[component-feel#transitions-for-interruptible-ui]]
- With Motion, does the code use the full `transform` string, not `x` and `y`, where the main thread is busy? [[motion-performance#libraries-and-the-main-thread]]
- Do groups of elements that enter together have a short stagger? [[easing-and-duration#stagger]]
- Are hover animations gated to devices with a fine pointer? [[reduced-motion#hover-on-touch-devices]]
- Does each moving animation have a reduced version? [[reduced-motion]]

## Writing And Direction

- Does each button say what it does, with a verb and an object? [[ux-writing#button-labels]]
- Does each error say what happened and how to fix it? [[ux-writing#error-messages]]
- Does each empty state explain the value and give an action? [[ux-writing#empty-states]]
- Does each concept have one term across the product? [[ux-writing#one-term-for-each-concept]]
- For a new product or a marketing page, does the design follow one clear direction? [[visual-direction]]
- Does the interface pass the AI slop test, with no generated pattern left without a reason? [[ai-slop-test]]

## Small Screens And Density

- Does mobile keep the task while it changes the arrangement? [[responsive]]
- When one page changes density, does the app frame on desktop stay the same? [[density#keep-the-app-frame]]

## Dark Theme

- If the product has no dark theme of its own, does the theme use the Graphite values without changes? [[graphite]]
- Does the primary content come forward while secondary content recedes? [[dark-theme#surface-hierarchy]]
- Can users distinguish the page, grouped regions, raised surfaces, controls, and overlays? [[dark-theme#surface-hierarchy]]
- Are neutral surfaces neutral enough to prevent a colored wash? [[color#neutrals]]
- Does the theme use one restrained accent instead of many competing hues? [[color#accent-and-semantic-color]]
- Do primary and secondary text stay clear during extended reading? [[dark-theme#dark-text]]
- Do hover, active, selected, focus, invalid, and disabled states stay distinct? [[contrast#states]]
- Do gradients and images pass at their weakest meaningful contrast point? [[contrast#gradients-and-transparency]]
- Does the theme work on a dim display and in a normally lit room? [[dark-theme]]
