---
name: form-design
description: Design, review, or refactor forms, field groups, labels, controls, validation feedback, multi-step flows, accessibility, and responsive behavior. Use for sign-in, checkout, settings, data-entry, survey, onboarding, and complex forms.
---

# Form Design

Apply the hierarchy-first UI method to forms, data-entry tasks, and multi-step flows.

## Required Workflow

1. Read `references/method.md` before design or implementation. Focus on the complex-form, responsive, and review sections.
2. Read `references/component-patterns.md` before selecting controls, field groups, error treatment, or page structure.
3. Establish the user task, field relationships, validation model, and action priority before styling controls.

Resolve all paths relative to this skill directory. Use the support directory printed by `skills use` when the skill is loaded on demand.

## Non-Negotiables

- Group fields by user intent, not by storage structure.
- Preserve semantic HTML, accessible names, native behavior, and keyboard operation.
- Design default, focus, selected, disabled, invalid, error, success, and loading states.
- Put field errors near their controls and provide an error summary when users must locate multiple errors.
- Adapt the information and action order for small screens. Do not only stack the desktop form.
- Respect the existing product design system unless the user requests a new direction.
