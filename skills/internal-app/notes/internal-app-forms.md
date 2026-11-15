---
id: internal-app-forms
topic: internal-app
summary: The kit component for each kind of answer, the field widths, the validation and error display with TanStack Form, and the long-form layout.
keywords: [form, kit form, which control, field width, error summary, validation, long form, form route, optional field, placeholder, submit button, success after submit, chips or dropdown]
specializes: [forms, form-choices, form-fields, form-errors, form-layout]
requires: [forms]
related: [internal-app-form-preview, internal-app-page-patterns, internal-app-writing]
---

# Internal App Forms

Run `design read forms` before you design or change a form. This note gives the kit component for each job. For a new long form, start from the PreviewForm recipe: run `internal-app recipe PreviewForm`. [[internal-app-form-submit]] gives the form state and the server call.

## Choose The Control

Show a small closed set of choices on the page. A dropdown hides the options and costs two clicks, so use one only when the list is long or the row has no space.

| Answer | Control |
| --- | --- |
| One choice from 2 to about 7 short labels, such as a building, a status, or a person | `RadioGroup appearance="chips"`. Put a fact that helps the choice in `meta`, such as "3 open". |
| One choice from 2 to about 5 options that people compare, such as a priority or a plan | `RadioGroup appearance="cards"` with a `description` for each option. |
| One choice in a dense panel or a dialog with no space for chips or cards | `RadioGroup` with the `list` appearance. |
| One choice from more than about 7 options | `Select`. Use `ComboBox` when people know the name and type it, such as a customer. Use `Cascader` for a path in a hierarchy. |
| Several choices from a short list | `CheckboxGroup appearance="chips"` for short labels. Use `cards`, the default, when an option needs a description or a `meta`. |
| Several choices from a long list | `MultiSelect`. It has no search. |
| An answer that people may skip, such as the person who takes the work | `noneOption` on the `RadioGroup`, such as "Decide later". Do not make people press a selected chip again to clear it. |
| A date that is usually in the next few days | `DatePicker` with `quickPicks` from `dayQuickPicks`. |
| A date range with common spans, such as the last 30 days | `DateRangePicker` with `presets`. |
| A number | `NumberField`. Use `Slider` only when the exact value is not important. |
| Files | `FileUpload`. The app validates and uploads the files. |
| A setting that applies at once, outside a form | `ToggleGroup` for several on and off options, `SegmentedControl` for one view, `Switch` for one setting. These have no hint and no error, so do not use them for an answer that a form submits. |

## Size And Mark The Fields

Set `width` from the expected answer, not from the column. A short box tells people that the answer is short.

| `width` | Holds about | Use for |
| --- | --- | --- |
| `xs` | 4 characters | A quantity, a floor, a room number. |
| `sm` | 12 characters | A phone number, a date, an amount, a postal code. |
| `md` | 24 characters | A name, a city. |
| `lg` | 40 characters | An email, an address line, a URL. |
| `full` | The column | Free text, a `multiline` description, a title. |

- `full` is the default. `DatePicker` defaults to `sm`. Touch density makes each width larger together with the text.
- Put related short fields on one line in a `FieldRow`, such as a floor and a room.
- Mark the optional fields with `isOptional`, not the required ones. Most fields in a good form are required, so the marker goes where it is rare.
- A `placeholder` is an example answer that starts with "e.g.". Put an instruction in `description`. The placeholder of a `SearchField` is the exception: it names what people can search by, such as "Search by name or owner".
- Set `autoComplete` on name, email, phone, and address fields. Set `autoFocus` on the first field of a form that opens for input.

## Validate And Show Errors

- Spread `formBehavior` into `useForm`, and pass the schema as `validators: { onDynamic: schema }`. Read the helpers with `internal-app docs Form`.
- Show each field message with `fieldError(field, hasSubmitAttempt)`. A message shows after people change a field and leave it, or after a submit attempt. Before a submit attempt, it never shows while people type.
- A message names the field and tells how to fix it: "Enter the floor in 3 characters or fewer, like 12 or B2." Do not write "Invalid value" or "Required".
- Put an `ErrorSummary` first in a `FormLayout`. Its title counts the problems and names the action: "2 things to fix before you send the request". Build the items with `formErrors` in the order of the fields on the page, and give each field the `id` that its item names.
- Do not disable the submit button while the form is invalid, because people then cannot find out what is wrong. Disable it only while the submit runs.

## Lay Out A Long Form

- Use `FormLayout` on its own route for a form with more than about six fields or more than one part. Put a short form in a `Dialog`.
- Make each part a `Section layout="split"`. The title names the part, such as "Where". The description is one sentence that tells what the answers change.
- Give `FormLayout` a `preview` only when the form makes a tangible thing that people see or hold outside the app. When the form only changes a record, such as the details of a contact, do not add a preview. See [[internal-app-form-preview]].
- Give `FormLayout` a `footer`: a `FormFooter` with live facts in `summary`, such as a count or an estimate, then the cancel action and one primary `Button type="submit"` that names the action, such as "Print badge".
- After a successful submit, replace the form with a success `Alert` with `announce="status"`. The title names the new record, the text tells what happens next, and one action starts the next task, such as "Register another visitor".
