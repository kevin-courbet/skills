---
id: kit-writing
topic: kit
summary: Sentence case, button labels with a verb, descriptions that state the result, errors with a next action, one element for each fact, and identifiers in Identifier or Code.
keywords: [writing, copy, labels, sentence case, button label, error message, success toast, middle dot, separator, meta line, confirmation text, identifier, microcopy]
specializes: [ux-writing, grouped-values]
related: [kit-composition, kit-states, kit-forms]
---

# Kit Writing

Run `design read ux-writing` for the general rules. These rules narrow them for the kit.

## Rules

- Use sentence case for every label, heading, button, and menu item.
- A button names the action: "Create item", "Save changes", "Delete 3 items".
- A description states the result: "Items appear in the list as soon as they are saved."
- An error states the problem and the next action: "The bank rejected the file. Check the account number and run it again."
- Do not show a success toast when the UI already shows the result.
- A chip `meta` is one fact, such as "3 open". A hint is one sentence.
- A confirmation names the exact object and every effect: "app.example.com serves dpl_rxt8gA84n within a minute. Automatic promotion pauses until you undo the rollback."
- Record ids, hashes, and hosts that people paste into other places use `Identifier`. Inline code and commands use `Code`.

## Separate Facts

Do not join separate facts into one string with a middle dot, a bullet, or a vertical bar. `design check` fails on the separator, with the rule `separator-glyph`. Run `design read grouped-values` for the reason.

- Give each fact its own element and type role. Put peer facts on one line in a `MetaLine`: `<MetaLine items={["Production", "Attempt 2"]} />`.
- Show a count as a count badge, a status summary as figures with labels, and labeled metadata as pairs of a label and a value.
- When the facts must stay in running text, write a full sentence: "Measured from catalog prices".
- Text without layout, such as an accessible name or a native `<option>`, uses ordinary punctuation.
