---
id: review
topic: process
summary: The review questions for a finished interface, each linked to the note that holds its rule.
keywords: [review, design review, checklist, audit, qa, critique, check my design, before shipping, polish pass, ui review]
requires: [method]
related: [accessibility, contrast, dark-theme]
---

# Review Checklist

Ask each question about the finished screen. When the answer is no, read the linked note.

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
