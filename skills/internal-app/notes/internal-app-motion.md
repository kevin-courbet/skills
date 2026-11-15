---
id: internal-app-motion
topic: internal-app
summary: What the kit animates and with which helper, what it never animates, the motion tokens for each change, the reduced-motion behavior of the kit, and view transitions for moves, removals, arrivals, and changes in place.
keywords: [motion, animation, animate a move, view transition, withViewTransition, viewTransitionName, useArrivals, useHasChanged, motionStyles, motion tokens, motion.move, easeInOut, easeOut, what to animate, do not animate, reduced motion, prefers-reduced-motion, keyframes, skeleton pulse, spinner, button press scale]
specializes: [motion, easing-and-duration, reduced-motion]
related: [internal-app-mutations, internal-app-stylex, internal-app-tokens]
---

# Internal App Motion

Motion helps people follow an object when the state changes. It is not decoration. Animate a change only when people can lose an object without the animation: a card that goes to a different lane, a row that leaves a list, or a status that changes while people look at a different part of the screen. [[motion]] gives the general method.

`src/components/helpers/motion.ts` has the helpers. Run `internal-app docs Motion`. The overlay, button, `Kanban`, `SortableList`, and `WorkQueue` components already use them. The ApprovalList recipe uses each helper on one page: run `internal-app recipe ApprovalList`.

## What To Animate

| Change | Use | Duration and easing |
|---|---|---|
| A card or a row moves to a different lane, group, or position after an action | `withViewTransition` around the update, and `motionStyles.named(viewTransitionName(scope, kind, id))` on each item that can move | `motion.move` (240ms), `motion.easeInOut` |
| People remove an item or add an item | `withViewTransition`. The item fades out or in, and the other items close or open the gap. | `motion.move`, `motion.easeInOut` |
| An item comes from the server, such as a new ticket after a refetch | `useArrivals(ids)`, and `motionStyles.enter` on each new item | `motion.normal` (180ms), `motion.easeOut` |
| A value changes in place, such as a status badge | `useHasChanged(value)`, `key={value}`, and `motionStyles.changed` | `motion.normal`, `motion.easeOut` |
| A dialog, a sheet, a popover, or a menu opens or closes | The kit component. Do not add motion. | Enter in `motion.normal` with `easeOut`. Exit in `motion.fast` with `ease`. A side sheet enters in `motion.slow`. |
| People press a button | `Button` and `LinkButton` scale to 0.97 while pressed. | `motion.fast` (120ms) |
| Hover, focus, and selection colors | `transitionDuration: motion.fast` | `motion.fast`, `motion.ease` |

## What Not To Animate

- The first render of a page or a list. `useArrivals` returns no keys on the first render.
- A route change. `app.css` stops the cross-fade of the page.
- Rows that a sort, a filter, a search, or a new page replaces. People asked for a new list. They do not follow one row.
- A refetch that changes many items at the same time.
- Numbers that count up, text that types itself, and charts that grow on load.
- Content that loads. Show a `Skeleton` or a `Spinner`. These are the only animations that repeat.
- The page shell, the sidebar, and the layout of a page.

## Durations And Easing

[[easing-and-duration]] gives the general limits. The kit uses these tokens:

- Keep the motion of the user interface at 300ms or less. People wait for a longer motion.
- Make an exit shorter than its enter.
- Use `easeOut` for an element that enters. Use `ease` for an exit and for a change of state. Use `easeInOut` for an object that moves from one place to a different place, so the eye can follow it.
- Do not use `linear`, except for a spinner.
- `::view-transition-group(*)` in `app.css` uses `motion.move` and `motion.easeInOut`. Change the two places together.

## Reduced Motion

With `prefers-reduced-motion: reduce`:

- `withViewTransition` runs the update at once, and `app.css` stops all view-transition animations.
- Each `animationDuration` and each transition of a transform gets `[media.reducedMotion]: "0ms"`, or a `null` transform under `media.reducedMotion`. `motionStyles` already does this.
- The loading animations stop: the spinner, the skeleton pulse, and the indeterminate progress bar. Their shape still shows that work runs.

## View Transitions

```tsx
function TicketList({ tickets }: { readonly tickets: ReadonlyArray<Ticket> }) {
  const scope = useId();
  return tickets.map((ticket) => (
    <Item
      key={ticket.id}
      style={motionStyles.named(viewTransitionName(scope, "ticket", ticket.id))}
      title={ticket.title}
    />
  ));
}

const close = (ticket: Ticket) => {
  withViewTransition(() =>
    queryClient.setQueryData(ticketKeys.queue, (tickets: ReadonlyArray<Ticket> = []) =>
      tickets.filter((candidate) => candidate.id !== ticket.id),
    ),
  );
  closeTicket.mutate(ticket.id);
};

function TicketStatus({ status }: { readonly status: TicketStatus }) {
  const hasChanged = useHasChanged(status);
  return (
    // A transform does not apply to an inline element, so the wrapper is inline-flex.
    <span key={status} {...stylex.props(styles.status, hasChanged && motionStyles.changed)}>
      <Badge intent={statusIntents[status]}>{statusLabels[status]}</Badge>
    </span>
  );
}
```

- `withViewTransition(update)` captures the screen, runs `update`, and moves each named element from its old place to its new place. A named element that is only on one side fades out or in. The rest of the page changes at once.
- While a view transition runs, the page does not take pointer input. Keep the transition at `motion.move`.
- An item that people drop with the pointer is already at its new place. In a drop handler, use `useDropTransition`, so that the item does not fly back to its start. `Kanban` does this.
- `internal-app docs Motion` gives the rules for the update and for the names. Run `design read internal-app-mutations#optimistic-moves` for a move that saves to the server.
