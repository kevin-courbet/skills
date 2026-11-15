# Component Patterns

Use this inventory to explore a suitable structure after user priorities and content relationships are known. It is not a menu of styles to apply without context.

## Pattern Inventory

The source gallery covers:

- Buttons with different emphasis, geometry, depth, and icon placement.
- Inputs, input groups, labels, icons, and error placement.
- Badges for status, counts, and compact metadata.
- Breadcrumbs and pagination for location and sequence.
- Horizontal and vertical navigation, including grouped settings navigation.
- Tables with sparse, bordered, grouped, image, and multi-row treatments.
- Sign-in forms and account-entry layouts.
- Alerts with different severity and information density.
- Pricing cards, comparison tables, and variable-pricing layouts.
- Marketing heroes and feature sections.
- Modals and multi-section or multi-page forms.
- Header navigation, preview cards, and profile cards.
- Application shells with horizontal, vertical, and multi-column navigation.
- Footers, activity feeds, checkout pages, and testimonials.

## Selection Rules

- Start from the task and information hierarchy, not the visual treatment.
- Prefer the simplest pattern that preserves all required actions and states.
- Use containers only when they create a real grouping or interaction boundary.
- Keep one dominant action per decision point.
- Match density to use frequency. Repeated operational tasks need less decoration and tighter paths.
- Keep comparable values aligned.
- Use progressive disclosure when advanced controls would overwhelm the common path.
- Preserve familiar control behavior even when the visual treatment changes.

## Forms

- Group fields by user intent, not storage schema.
- Keep labels visibly associated with controls.
- Show a small closed set of choices on the page. A dropdown hides the options and costs two actions. Use one only for a long list, or in a row that has no space.
  - For one choice from about seven or fewer short labels, use radio chips. For several choices, use checkbox chips that show a check when selected.
  - When users compare the options, use cards with one sentence that states the difference, such as the response time of each priority.
  - Add a quiet fact to a chip when it helps the choice, such as the open work of each person.
- Give an optional single choice an explicit "no value" option, such as "Decide later". Users do not discover that a second press clears a selected chip.
- For a date that is usually in the next few days, show those days as chips and keep a date input for any other day.
- Size each input to its expected answer. Mark the optional fields, not the required ones. Use a placeholder only for an example answer that starts with "e.g.".
- In a long form, put each section title and one sentence about what the answers change in a column beside the fields. Stack the column above the fields on narrow screens.
- When the form produces a tangible thing that users see or hold outside the form, such as a printed tag, an invoice, or an outgoing message, show a live preview of that thing beside the form. Make the preview look like the real thing. Do not preview a record that lives only in the app. "Preview Of The End Result" in `method.md` gives the rules.
- Keep the submit action and a short live summary, such as a count or an estimate, in a footer that stays at the bottom of the window.
- Put errors next to the field when one field caused the error. The message names the field and says how to fix the problem: "Enter the floor in 3 characters or fewer, like 12 or B2."
- Show a message after the user changes a field and leaves it, or after a submit attempt. Do not show it while the user types a first answer.
- Put a summary above the form when users need to locate multiple errors. Its title counts the problems, it takes focus after a failed submit, and each item links to its field.
- Do not disable the submit button while the form is invalid, because users then cannot find the problem. Disable it only while the submit runs.
- After a successful submit, name the new record, say what happens next, and offer the next task.
- Use multi-page forms only when the sections form a meaningful sequence.

## Navigation

- Use breadcrumbs for hierarchy, not as a substitute for primary navigation.
- Use pagination when users need stable location or direct page access.
- Use continuous loading only when exact position and total count are not important.
- Keep active state visible without relying only on color.
- Never use a left-edge border or accent rail to mark the current navigation item. This also prohibits equivalent pseudo-elements and inset shadows.
- Use a subtle selected surface and clear typography. Add `aria-current="page"` to the current page link.
- Group long vertical navigation by user goal.

## Overlays And Alerts

- Use a modal only when the task must interrupt the current context.
- Keep destructive confirmation focused on the affected object and consequence.
- Match alert prominence to severity and required action.
- Do not make informational notices compete with primary page content.

## Responsive Adaptation

- Recompose wide patterns instead of only shrinking them.
- Preserve identifiers, critical values, status, and primary actions.
- Replace multi-column comparison only when the alternative still supports comparison.
- Avoid moving related labels and values so far apart that their relationship becomes unclear.
