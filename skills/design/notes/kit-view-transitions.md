---
id: kit-view-transitions
topic: kit
summary: Why the kit uses view transitions for single discrete moves, when not to use one, how keyboard moves and pointer drops behave, and the code for a change in a view transition with withViewTransition and useHasChanged.
keywords: [view transition, view transitions, withViewTransition, viewTransitionName, useDropTransition, useHasChanged, discrete change, approve animation, card moves lane, pointer drop, keyboard move, root cross-fade, startViewTransition]
specializes: [motion-performance]
related: [kit-motion, kit-composition]
---

# Kit View Transitions

[[motion-performance#view-transitions]] keeps view transitions for navigation between views. The kit uses them for one more case: a single discrete change that one press starts, such as Approve or a card that goes to the next lane. The browser moves the few named items without code that measures them.

- Use a view transition only for that case. Do not use it for a drag, for typing, or for a change that people repeat quickly. Use a CSS transition for these.
- Only the named items move. `app.css` stops the cross-fade of `root`, so the rest of the page changes at once.
- While a view transition runs, the page does not take pointer input. Keep it at `motion.move`.
- A keyboard move in `Kanban` keeps its motion, because the motion shows where the card went. The rule against motion on keyboard actions in [[motion]] is about a tool that people open many times each day, such as the command palette.
- An item that people drop with the pointer is already at its new place. `useDropTransition` gives it no name, so that it does not fly back to its start.
- For a move that saves to the server, see [[kit-composition#moves]].

## Example

The first function removes a closed ticket from a queue in a view transition. The second component shows a short motion when the status of a ticket changes.

```tsx
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
