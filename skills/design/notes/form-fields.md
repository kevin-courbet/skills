---
id: form-fields
topic: forms
summary: Visible labels close to their controls, inputs sized to the expected answer, optional fields marked, and placeholders only for examples.
keywords: [form fields, input, text field, label, labels, field label, optional field marker, required field asterisk, placeholder, input width, field size, postal code, hint text, help text]
requires: [forms]
related: [form-layout, form-choices, accessibility, density]
---

# Form Fields

Each field asks one question. Its label, its size, and its hint make the question clear.

## Labels

- Give every form control a visible label.
- Keep each label visibly associated with its control.
- Keep each label closer to its own control than to the preceding control.
- Keep the accessible name of each control, also when the visible label is short. [[accessibility#semantics-and-names]] gives the rules.

## Size And Length

- Use the input length as an affordance. A postal code field must not look as long as an address field.
- Size each input to its expected answer.
- For the control height, use [[density#control-size]].

## Optional And Required

Mark the optional fields, not the required ones.

## Placeholders

- Use a placeholder only for an example answer that starts with "e.g.".
- Do not use a placeholder as the label or as the only hint.
- A placeholder is text and needs text contrast. [[contrast#text]] gives the limit.

## Native Behavior

Keep native semantics and keyboard behavior when you replace browser-default visuals. [[accessibility#native-behavior]] gives the rules.
