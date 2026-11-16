---
id: kit-composition
topic: kit
summary: The rules that join kit components into a page, such as one primary action, quiet labels, status with text, one control height in a row, optimistic moves with a keyboard path, focus that never drops to the page body, and the container for each task.
keywords: [composition, compose a page, primary action, one primary button, status with text, control height, row height, optimistic moves, move, drag and drop keyboard, withViewTransition, focus after delete, focus management, locale numbers, dates, pointer only shortcuts, which container, dialog or sheet, peek, confirm dialog]
specializes: [hierarchy, accessibility, overlays]
related: [kit-recipes, kit-cards, kit-states, kit-writing, kit-motion, tables, density]
---

# Kit Composition

These rules apply on every page that uses the kit. The doc of each component gives its own rules: run `design docs <Id>`. For a complete page of each type, see [[kit-recipes]].

## Hierarchy

- One primary button in a view. Other actions use the `secondary` or the `ghost` intent.
- Labels are quieter than values. Section titles are quieter than content.
- Use a `Card` only for distinct, comparable, or actionable groups. Never nest cards. See [[kit-cards]].
- Status uses a `Badge` with text, or a `StatusDot` in table cells and dense lists. The color only supports the text.
- Steps that run on their own use `Stepper mode="status"` on a detail page and `SegmentedProgress` in cards and rows. Activity and audit history use `Timeline`, which does not color its items as progress.

## One Height In A Row

Controls in one row share one height. The kit controls read the control size of their row, so do not set a size on each control.

- Put a row of filters and view controls in a `Toolbar`. Set `size` on the `Toolbar` only when its default is wrong.
- Before you decide which state of a list lives in the URL, read [[kit-url-filters]].
- Wrap a row that is not a toolbar, such as a card header with a `SegmentedControl` and a `Button`, in `ControlSizeProvider` when it must be `sm`.
- `design check` fails on an explicit `size` on a `Button` inside a `Toolbar`.

## Moves

Moves in `Kanban`, `SortableList`, `Tree`, `Gantt`, `EventCalendar`, and `WorkQueue` are optimistic. The object moves on the screen at once, and the change saves in the background.

- Apply the new value synchronously in the change callback, such as `onChange` of `Kanban`. The component calls it inside its view transition, so the object glides to its new place.
- For a move that a control outside the component starts, such as a button, wrap the update in `withViewTransition` of `src/components/helpers/motion.ts`.
- Never apply the value after an await. The browser then captures the new state before the change, and the object jumps.
- Persist the change, and on failure restore the previous value in `withViewTransition` and show an error toast. The object then glides back. The use-case skill of the app gives the code for its data layer.
- Every drag has a keyboard path. Never add a control that only a drag can use.

## Focus After A Change

A change never leaves the focus on the page body.

- When an action moves or removes the focused item, the focus goes to the next item of the same group. With no item left, it goes to the heading of the group or to the collection.
- When a panel or an inline form closes, the control that opened it takes the focus again.
- `Kanban`, `SortableList`, and `WorkQueue` do this already. For a new collection, use `useFocusAfterRemoval`. Read it with `design docs Focus`.

## Other Rules

- A shortcut for the pointer only, such as a `ContextMenu` or a `HoverCard`, repeats what a visible control or link already gives.
- Numbers and dates use `src/lib/locale.ts`. Relative dates use a reference time that the loader returns.

## Choose The Container

- A short create or edit task, up to about six fields: `Dialog`.
- A detail or an edit that is easier with the list behind it: `Sheet`.
- Records that people read one after another from a list: `Sheet size="peek"` with `navigation` and an "Open page" link to the detail route. Keep the open record in a search param.
- A long form, with more than about six fields, or a record with many sections: a route of its own with `FormLayout`. See [[kit-forms]].
- An irreversible action: `ConfirmDialog`.
