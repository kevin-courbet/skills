---
id: internal-app-form-preview
topic: internal-app
summary: Build the live preview of a printed badge, tag, label, or message from kit tokens in FormPreview, with placeholders, paper colors, and print proportions.
keywords: [form preview, preview of a printed tag, badge preview, label preview, print preview, live preview, tangible result, ticket, invoice preview, FormPreview]
specializes: [form-preview, signature-elements]
requires: [form-preview]
related: [internal-app-forms]
---

# Internal App Form Preview

Run `design read form-preview` and `design read signature-elements` before you build a preview. The PreviewForm recipe shows a preview of a printed visitor badge: run `internal-app recipe PreviewForm`, and `internal-app recipe PreviewForm#files` for the badge. Read the frame with `internal-app docs FormPreview`.

## Rules

- Build the thing as an app component, such as `VisitorBadge` in the PreviewForm recipe, and put it in `FormPreview`. Make it look like the real thing: its proportions, its surface, its type hierarchy, and the position of each value.
- Use kit tokens for every color, font size, space, radius, and shadow. `check` permits a shaped edge with `clipPath`, a small `transform: rotate(...)`, a punched hole with `maskImage`, and `black` or `transparent` in a gradient. It does not permit a color literal.
- Show a quiet placeholder in `color.textFaint` for each empty answer, so that the layout of the thing stays visible.
- When the real thing is printed on white paper, apply `lightTheme` from `src/styles/themes.ts` to its surface. It then stays white in the dark theme.
- When the thing has a fixed print size, set its width in `em` of a font token. It then grows with the text of `Page density="touch"` and keeps its proportions.
- Keep real text as text. Use a `<dl>` for labeled facts and a `<ul>` for a list.
- Use a `DescriptionList` in the preview only when the thing is a record that people read in the app, such as a report. Put computed facts, such as a count or a total, in the `FormFooter` summary.
