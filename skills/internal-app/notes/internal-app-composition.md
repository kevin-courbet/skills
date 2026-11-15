---
id: internal-app-composition
topic: internal-app
summary: The rules that join kit components into a page, such as one primary action, quiet labels, status with text, one control height in a row, optimistic moves with a keyboard path, and focus that never drops to the page body.
keywords: [composition, compose a page, primary action, one primary button, status with text, control height, row height, optimistic moves, drag and drop keyboard, focus after delete, focus management, locale numbers, dates, pointer only shortcuts]
specializes: [hierarchy, accessibility]
related: [internal-app-page-patterns, internal-app-cards, internal-app-states, internal-app-writing, tables, density]
---

# Internal App Composition

These rules apply on every page. The doc of each component gives its own rules: run `internal-app docs <Id>`.

## Hierarchy

- One primary button in a view. Other actions use the `secondary` or the `ghost` intent.
- Labels are quieter than values. Section titles are quieter than content.
- Use a `Card` only for distinct, comparable, or actionable groups. Never nest cards. See [[internal-app-cards]].
- Status uses a `Badge` with text, or a `StatusDot` in table cells and dense lists. The color only supports the text.
- Steps that run on their own use `Stepper mode="status"` on a detail page and `SegmentedProgress` in cards and rows. Activity and audit history use `Timeline`, which does not color its items as progress.

## One Height In A Row

Controls in one row share one height. The kit controls read the control size of their row, so do not set a size on each control.

- Put a row of filters and view controls in a `Toolbar`. Set `size` on the `Toolbar` only when its default is wrong.
- Wrap a row that is not a toolbar, such as a card header with a `SegmentedControl` and a `Button`, in `ControlSizeProvider` when it must be `sm`.
- `check` fails on an explicit `size` on a `Button` inside a `Toolbar`.

## Moves

Moves in `Kanban`, `SortableList`, `Tree`, `Gantt`, and `EventCalendar` are optimistic. Apply the new value at once, persist it with a mutation, and on failure restore the previous value and show an error toast. See Optimistic moves in `references/data.md`. Every drag has a keyboard path. Never add a control that only a drag can use.

## Focus After A Change

A change never leaves the focus on the page body.

- When an action moves or removes the focused item, the focus goes to the next item of the same group. With no item left, it goes to the heading of the group or to the collection.
- When a panel or an inline form closes, the control that opened it takes the focus again.
- `Kanban`, `SortableList`, and `WorkQueue` do this already. For a new collection, use `useFocusAfterRemoval`. Read it with `internal-app docs Focus`.

## Other Rules

- A shortcut for the pointer only, such as a `ContextMenu` or a `HoverCard`, repeats what a visible control or link already gives.
- Numbers and dates use `src/lib/locale.ts`. Relative dates use a reference time that the loader returns.
