---
id: internal-app-review-checklist
topic: internal-app
summary: The review checklist of an internal app for hierarchy and layout, states and data, accessibility and input, navigation, and code, each item with the kit component or the note that holds its rule.
keywords: [review checklist, review before finishing, checklist, hierarchy, one primary button, card in a card, tables, filters, control height, identifiers, middle dot, states and data, SSR loading state, empty state, route errors, mutation failures, URL state, not found, keyboard, focus after removal, aria-label, contrast, current navigation, breadcrumbs, touch navigation, code rules, no any]
specializes: [review]
related: [internal-app-review, internal-app-composition, internal-app-states]
---

# Internal App Review Checklist

Answer each item about the finished change. When an item is not met, fix it, or report it in the handoff with the reason. [[review]] has the general questions. Run `design read internal-app-review` for the gates and the rendered checks.

## Hierarchy And Layout

- People can identify the purpose of the page and its primary action in a few seconds. [[hierarchy]]
- Each view has one primary button. Secondary actions are quiet.
- Labels are quieter than values. Section titles are quieter than the content. [[hierarchy#labels-and-values]]
- Spacing shows the groups. Cards hold only distinct or actionable groups. No card, framed panel, or bordered box is in a card; `CardSection` lines divide it. `design read internal-app-cards`
- Tables: text on the left, numbers on the right with tabular figures, an announced sort state, and rows that open detail pages with the keyboard and the mouse.
- List filters use a `Toolbar` with `Filters`, above the table or in its frame (`internal-app docs Filters`). Each chip gives its values in words.
- Controls in one row have one height. No button in a `Toolbar` sets its own `size`.
- Record IDs and hashes that people paste in a different place use `Identifier`. Inline code uses `Code`.
- No text joins separate facts with a middle dot, a bullet, or a vertical bar. Each fact has its own element, such as a `MetaLine` item, a count badge, or a pair of a label and a value. [[grouped-values]]
- Activity feeds do not color events as progress. Pipeline steps show their own status and duration.

## States And Data

- Data that SSR loads renders without a loading state.
- An empty state shows only after the data resolved to empty. A filter with no results has a clear-filters action. `design read internal-app-states`
- Errors are visible and give a next action. There is no silent fallback, and no empty plot in place of an error.
- Route errors show recognized expected messages or general retry help. Unexpected diagnostic messages do not show as UI text.
- Mutations show failures inline with `failureMessage`. The UI shows a success, not a toast. `design read internal-app-mutations`
- Search, sort, filter, and page are in the URL, and stay after a reload.
- A missing record shows the not-found page, not a general error.

## Accessibility And Input

- The keyboard gets to each control, and the control shows a visible focus ring.
- After an action moves or removes the focused item, or closes a panel, the focus is not on the page body. It is on the next item of the group, on the group heading, or on the control that opened the panel. Examine `document.activeElement` after each such action.
- Buttons with only an icon have `aria-label`. Decorative icons have `aria-hidden`.
- Status and selection do not depend on color only. [[accessibility#color-is-never-the-only-signal]]
- Text contrast is at least 4.5:1 in the two themes. Controls and focus rings have at least 3:1. [[contrast]]
- Reduced motion stops the enter and exit animations. `design read internal-app-motion#reduced-motion`

## Navigation

- The current item uses a selected surface and `aria-current="page"`. It has no left-edge border, rail, pseudo-element, or inset shadow.
- Breadcrumbs give the location. Detail pages show the name of the record.
- At 400px, the navigation sheet has each sidebar item.
- At 768px, the sidebar is hidden, and the menu button in the top bar opens the sheet.
- On a page with `density="touch"` on a touch device, the sidebar is hidden at each width, and the buttons of the top bar are 44px high. On a desktop with a mouse, the sidebar and the top bar do not change.
- After "Hide sidebar", the top bar shows a "Show sidebar" button.

## Code

- No `any`, no non-null assertions, no nested ternaries, and no console output.
- Routes import only the feature `api.ts`, components, and lib.
- Server functions validate the input with Effect Schema and run through `runServerFn`. A separate backend uses the Effect RPC boundary with schemas: `design read internal-app-rpc`.
- RPC checks use the real HTTP wire protocol, typed failures, and cancellation. SSR does not import the handlers of a remote backend.
- Effect services use `Context.Service` and `Layer`. Errors are tagged and mapped at the boundary.
- Styles use only tokens. Variants are StyleX maps. No kit file is edited.
- Charts use Aperture with the host bridge on each Aperture root, and SVG rendering for SSR. `design read internal-app-charts`
