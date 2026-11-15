---
id: form-errors
topic: forms
summary: Field errors near their controls with a fix, an error summary for several errors, an enabled submit button, and a clear result after the submit.
keywords: [form errors, validation, error message, error summary, inline validation, field error, disable submit button, disabled submit, when to validate, on blur, success message, after submit, confirmation, invalid field]
requires: [forms]
related: [form-fields, form-layout, accessibility, overlays]
---

# Form Errors And Results

Feedback tells people what went wrong, where, and how to fix it.

## Field Errors

- Put an error next to the field when one field caused the error.
- The message names the field and says how to fix the problem: "Enter the floor in 3 characters or fewer, like 12 or B2."

## When To Show A Message

- Show a message after the user changes a field and leaves it, or after a submit attempt.
- Do not show it while the user types a first answer.

## Error Summary

Put a summary above the form when users must find several errors.

- Its title counts the problems.
- It takes the focus after a failed submit.
- Each item links to its field.

## Submit Button

- Do not disable the submit button while the form is invalid, because users then cannot find the problem.
- Disable it only while the submit runs.

## After A Successful Submit

- Name the new record.
- Say what happens next.
- Offer the next task.
