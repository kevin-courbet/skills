---
id: method
topic: process
summary: The design method from user priorities to structure, build, finishing passes, and review.
keywords: [design process, workflow, method, steps, where to start, user priorities, low fidelity, wireframe, iterate, existing design system, motion, animation]
requires: [hierarchy, review]
related: [patterns, spacing, responsive]
---

# Design Method

Use this method to design or refactor content pages, application screens, dashboards, tables, settings, and complex forms. First make the interface understandable. Then make it distinctive.

## Establish Users And Priorities

Establish user priorities before you style components.

1. Start with one real feature, not the application shell.
2. Identify the users of the feature and the task that they must complete.
3. List the content, actions, and decisions that the feature requires.
4. Rank what users must notice first, compare next, and inspect only when needed.

For a form, also establish the field relationships, the validation model, and the action priority. [[forms]] gives the form process.

## Build The Structure

1. Build a low-fidelity structure with real content before you add polish.
2. Establish hierarchy with size, weight, contrast, position, and space. [[hierarchy]] gives the rules.
3. Establish relationships with proximity and alignment. [[spacing]] gives the rules.
4. Choose component boundaries only after the information structure is clear. [[patterns]] helps you select a structure.

Use hierarchy, proximity, and alignment before you add containers or decoration.

## Build In Short Cycles

- Build the smallest useful version.
- Do not design every future screen before the core feature works.
- Iterate in short cycles, so that the implementation can show bad assumptions early.

## Finish In Passes

Add color, depth, imagery, and detail as controlled finishing passes, after the structure works.

1. Set color by role. [[color]] gives the rules.
2. Separate regions with surfaces and elevation. [[depth]] gives the rules.
3. Add images, empty states, and details. [[finishing-details]] gives the rules.
4. Adapt the information and arrangement for narrow screens. [[responsive]] gives the rules.
5. Test scanning, reading, interaction states, contrast, and keyboard use. [[review]] gives the questions.

## Respect The Product System

- Respect the existing product design system unless the user requests a new direction.
- If another skill provides project design context, use that context. The method stays the same.
- A product skill can join this graph and set narrower values. In that product, its rule wins. [[graph-membership]] gives the contract.
- Treat bundled palettes and external icon libraries as starting resources, not automatic design decisions. [[palettes]] and [[icons]] give the rules.

## Keep Motion Separate

Keep motion and interaction-polish work separate unless the request includes it.
