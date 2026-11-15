---
id: ux-writing
topic: content
summary: Button labels with a verb and an object, error messages that say what happened and how to fix it, empty-state copy, voice and tone, one term for each concept, and copy that translates.
keywords: [ux writing, microcopy, copy, button copy, button label, button text, cta text, error message, error copy, empty state copy, empty state text, voice, tone, terminology, wording, labels, alt text, link text, translation, localization, i18n, loading message, confirmation text]
related: [form-errors, finishing-details, overlays, accessibility, loading-states]
---

# UX Writing

Each word must have a purpose. The project voice comes first: a brand voice skill or the voice section of `DESIGN.md` overrides the patterns in this note. [[project-context]] gives the file.

## Button Labels

Never use "OK", "Submit", or "Yes" and "No". Use a verb and an object that say what will happen:

| Weak | Specific | Why |
| --- | --- | --- |
| OK | Save changes | Says what will happen. |
| Submit | Create account | Names the result. |
| Yes | Delete message | Confirms the action. |
| Cancel | Keep editing | Says what "cancel" means. |
| Click here | Download PDF | Describes the destination. |

For a destructive action, name the destruction:

- "Delete" for a permanent action. "Remove" for an action that people can reverse.
- Show the count: "Delete 5 items", not "Delete selected".

## Error Messages

Each error message answers three questions: what happened, why, and how to fix it. "This email address needs an @ symbol" is better than "Invalid input". [[form-errors#field-errors]] gives the rules for field errors.

| Situation | Template |
| --- | --- |
| Format | "[Field] needs to be [format]. Example: [example]." |
| Missing value | "Enter [the missing value]." |
| No permission | "You do not have access to [thing]. [What to do instead]." |
| Network | "Could not reach [thing]. Check your connection and [action]." |
| Server | "Something went wrong. [Alternative action]." |

- Do not blame the user. Write "Enter a date in the format MM/DD/YYYY", not "You entered an invalid date".
- Never use humor in an error. People are already frustrated.

## Empty States

Empty-state copy has three parts:

1. Say briefly that the area is empty.
2. Say why it is useful to fill it.
3. Give one clear action.

"No projects yet. Create your first project to get started." is better than "No items". [[finishing-details#empty-states]] gives the layout rules.

## Voice And Tone

The voice is the personality of the brand. It stays the same everywhere. The tone changes with the moment:

| Moment | Tone |
| --- | --- |
| Success | Brief and positive: "Done. Your changes are live." |
| Error | Helpful: "That did not work. Try this:" |
| Loading | Reassuring: "Saving your work..." |
| Destructive confirmation | Serious and clear: "Delete this project? You cannot undo this." |

## Confirmation Dialogs

Prefer undo to a confirmation. [[overlays#destructive-confirmation]] gives the rule. When a confirmation is necessary, name the action, say the consequence, and use specific labels: "Delete project" and "Keep project", not "Yes" and "No".

## Loading And Progress

- Be specific: "Saving your draft...", not "Loading...".
- For a long wait, give the expected time, such as "This usually takes 30 seconds", or show the progress. [[loading-states]] gives the visual rules.

## One Term For Each Concept

Select one term and use it everywhere. Keep a glossary.

| Inconsistent | Consistent |
| --- | --- |
| Delete, Remove, Trash | Delete |
| Settings, Preferences, Options | Settings |
| Sign in, Log in, Enter | Sign in |
| Create, Add, New | Create |

## Say It One Time

- When the heading explains the content, do not add an introduction that repeats it.
- When a button is clear, do not explain it again.
- Do not repeat information that people can already see.
- Explain jargon, or do not use it.

## Fields

- For a field whose purpose is not clear, say why you ask for the value.
- Examples go in the placeholder as "e.g." text. [[form-fields#placeholders]] gives the rule.

## Writing For Accessibility

- Link text has meaning alone: "View pricing plans", not "Click here".
- Alt text gives the information, not a description of the image: "Revenue increased 40% in Q4", not "Chart".
- Use `alt=""` for a decorative image.
- An icon button needs an `aria-label`. [[accessibility#semantics-and-names]] gives the rules.

## Writing For Translation

Plan space for longer text:

| Language | Length compared to English |
| --- | --- |
| German | +30% |
| French | +20% |
| Finnish | +30 to 40% |
| Chinese | −30% characters, at approximately the same width |

- Keep numbers separate from the sentence: "New messages: 3", not "You have 3 new messages".
- Keep each full sentence in one string, because the word order changes between languages.
- Do not abbreviate: "5 minutes ago", not "5 mins ago".
- Tell the translators where each string appears.
