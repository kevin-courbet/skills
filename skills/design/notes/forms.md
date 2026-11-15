---
id: forms
topic: forms
summary: The entry note for forms, field groups, controls, validation, previews, and multi-step flows, with the form process and the notes for each part.
keywords: [form, forms, form design, settings page, settings form, sign in, sign-in, login, checkout, data entry, survey, onboarding, wizard, multi-step form, multi-page form, dialog form, input form]
requires: [method, form-layout, form-fields, form-errors]
related: [form-choices, form-preview, accessibility, skill:internal-app]
---

# Forms

Use these notes to design, review, or refactor forms, field groups, labels, controls, validation feedback, and multi-step flows. Examples are sign-in, checkout, settings, data entry, surveys, onboarding, and complex forms.

## Form Process

1. Establish the user task, the field relationships, the validation model, and the action priority before you style controls.
2. Group fields by user intent, not by storage structure. [[form-layout#sections]] gives the rules.
3. Select each control and size it for its answer. [[form-fields]] and [[form-choices]] give the rules.
4. Design the validation feedback and the result after the submit. [[form-errors]] gives the rules.
5. When the form produces a tangible thing, add a preview of that thing. [[form-preview]] gives the rules.
6. Adapt the information and the action order for small screens. Do not only stack the desktop form. [[responsive]] gives the rules.
7. Test focus order, keyboard use, and every state. [[accessibility]] gives the rules.

## Multi-Page Forms

Use a multi-page form only when the sections make a meaningful sequence.

## Forms In An Internal App

In an internal app on the house stack, also follow [[skill:internal-app]]. Its notes specialize the form notes, so `design read` lists them under "Specialized by" when that skill is installed.
