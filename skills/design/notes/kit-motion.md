---
id: kit-motion
topic: kit
summary: What the kit animates and with which helper and token, what it never animates, the reduced-motion version of each motion, and why the kit uses view transitions for single discrete moves.
keywords: [motion, animation, animate a move, view transition, withViewTransition, viewTransitionName, useArrivals, useHasChanged, useDropTransition, motionStyles, motion tokens, motion.move, motion.drawer, easeInOut, easeOut, what to animate, do not animate, reduced motion, prefers-reduced-motion, tooltip delay, warm tooltip, command palette animation, popover origin, skeleton pulse, spinner, button press scale]
specializes: [motion, easing-and-duration, component-feel, reduced-motion, motion-performance]
related: [kit-view-transitions, kit-composition, kit-stylex, kit-tokens]
---

# Kit Motion

The hub notes give the method: [[motion]], [[easing-and-duration]], [[component-feel]], [[reduced-motion]], and [[motion-performance]]. This note gives the kit tokens and components that apply that method. Do not write a motion that the kit already has.

`src/components/helpers/motion.ts` has the helpers. Run `design docs Motion` for the rules of the update and of the names. The `ApprovalList` recipe of the internal-app lab uses each helper on one page: run `design recipe ApprovalList` ([[kit-recipes]]).

## Tokens

`motion` in `tokens.stylex.ts` holds each duration and each curve. Do not write a duration or a curve in a component.

| Token | Value | Use |
|---|---|---|
| `motion.fast` | 120ms | Press feedback, hover, focus, and the exit of a popover, a menu, or a tooltip |
| `motion.normal` | 180ms | A popover, a menu, or a tooltip that opens. The exit of a dialog or a sheet. |
| `motion.slow` | 260ms | A dialog or a sheet that opens |
| `motion.move` | 240ms | An object that moves to a new place in a view transition |
| `motion.ease` | `ease` | Hover, focus, and color changes |
| `motion.easeOut` | `cubic-bezier(0.23, 1, 0.32, 1)` | An element that enters or exits |
| `motion.easeInOut` | `cubic-bezier(0.77, 0, 0.175, 1)` | An object that moves on the screen, and the switch thumb |
| `motion.drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | A side sheet that slides in or out |

- Each exit is shorter than its entry, at approximately 70% of it.
- `::view-transition-group(*)` in `app.css` repeats `motion.move` and `motion.easeInOut`. Change the two places together.
- Do not use `linear`, except for a spinner.

## What The Kit Already Animates

| Component | Motion |
|---|---|
| `Button`, `LinkButton`, `ToggleButton`, `ToggleGroup` | Scale to 0.97 while pressed, in `motion.fast` with `easeOut`. Colors use `ease`. |
| `Menu`, `Popover`, `Select`, `ComboBox` | Grow from 0.97 and fade in from the point next to the trigger. `overlay` in `helpers/overlay.tsx` uses CSS transitions, so a close during the open turns back from where it is. |
| `Tooltip` | Opens on hover after 600ms. While one tooltip is open, and for 500ms after it closes, the next tooltip opens at once and without motion. |
| `Dialog`, `ConfirmDialog` | Fade and rise from the center of the viewport, with no trigger origin. |
| `Sheet` | A side sheet slides with `motion.drawer`. A `peek` sheet rises with `easeOut`. |
| `CommandPalette` | No motion. People open it from the keyboard many times each day. |
| `Switch` | The thumb slides with `easeInOut`. The track color uses `ease`. |
| Chevrons, such as in `Disclosure`, `Tree`, and `DataTable` | Turn with `easeOut`. |
| `Spinner`, `Skeleton`, `ProgressBar`, `ProgressCircle`, the `isPending` spinner of `Button` | The only motion that repeats. It shows that work runs. |

A new overlay without the popover surface puts `overlay.transition` before `overlay.entering` and `overlay.exiting`. Do not start an entry from `scale(0)`.

## What To Animate In A Feature

| Change | Use |
|---|---|
| A card or a row moves to a different lane, group, or position after one action | `withViewTransition` around the update, and `motionStyles.named(viewTransitionName(scope, kind, id))` on each item that can move |
| People remove an item or add an item | `withViewTransition`. The item fades out or in, and the other items close or open the gap. |
| People drop an item in a board or a sortable list | `useDropTransition`. `Kanban` and `SortableList` already use it. |
| An item comes from the server, such as a new ticket after a refetch | `useArrivals(ids)`, and `motionStyles.enter` on each new item |
| A value changes in place, such as a status badge | `useHasChanged(value)`, `key={value}`, and `motionStyles.changed` |

## What Not To Animate

- The first render of a page or a list. `useArrivals` returns no keys on the first render.
- A route change. People change routes tens of times each day, so the router runs no view transition.
- Rows that a sort, a filter, a search, or a new page replaces. People asked for a new list. They do not follow one row.
- A refetch that changes many items at the same time.
- Numbers that count up, text that types itself, and charts that grow on load.
- The page shell, the sidebar, and the layout of a page.

## Reduced Motion

Under `prefers-reduced-motion: reduce`, nothing moves, but the fades and the functional motion stay:

- Overlays, tooltips, dialogs, and sheets only fade.
- In a view transition, `app.css` stops the group animation. A moved item shows at its new place at once, and its old and new images cross-fade in `motion.normal`. An item that leaves or arrives fades.
- `motionStyles.enter` and `motionStyles.changed` only fade.
- The press scale and the switch thumb stop. Color changes stay.
- The spinner and `ProgressCircle` turn more slowly. The skeleton pulse stays. An indeterminate `ProgressBar` shows a full fill that pulses in place.

Each style that moves an element sets a `[media.reducedMotion]` value: a fade keyframe, a `none` transform, or a `0ms` duration of the transform transition. Do not add a global rule that sets all durations to zero.

## View Transitions

The kit uses view transitions for a single discrete change that one press starts, such as Approve. Run `design read kit-view-transitions` for when to use one and for the code.
