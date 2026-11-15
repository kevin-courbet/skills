---
id: internal-app-mutations
topic: internal-app
summary: Write a mutation that invalidates by key prefix and shows its failure where people acted, an optimistic move that writes the cache inside the view transition, and a delete that runs from ConfirmDialog.
keywords: [mutation, useMutation, invalidate queries, optimistic update, optimistic move, rollback, restore on failure, move on a board, delete, destructive action, mutateAsync, setQueryData, cancelQueries, success toast]
specializes: [loading-states]
related: [internal-app-server-functions, internal-app-composition, internal-app-states, internal-app-motion]
---

# Internal App Mutations

A mutation calls a server function of the feature. Run `design read internal-app-server-functions` for the server side.

## Mutations

```ts
const create = useMutation({
  mutationFn: (input: CreateItem) => createItemFn({ data: input }).then(unwrap),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: itemKeys.all }),
});
```

- Invalidate by key prefix. Do not call `router.invalidate()` for query data.
- Show an expected failure inline, where people acted, such as a form error or a row message. Use a toast only when there is no inline place.
- Do not show a success toast when the list, the row, or the closed dialog already shows the result.
- Optimistic updates are optional in an internal tool. Add them for moves on a board or in a queue, where the object must stay where people put it. Add them also for interactions that feel slow.

## Optimistic Moves

A move on a `Kanban`, a `SortableList`, a `Tree`, a `Gantt`, an `EventCalendar`, or a touch work queue changes the screen at once, and saves in the background. Write the query cache synchronously in the update of the view transition.

Do not write the cache in `onMutate`. `onMutate` runs after an await, after the browser captures the new state, so the object jumps and does not move.

```ts
const moveTicket = useMutation({
  mutationFn: (move: TicketMove) => moveTicketFn({ data: move }).then(unwrap),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
});

const move = (next: TicketBoard, change: KanbanMove) => {
  const key = ticketKeys.board(teamId);
  const previous = queryClient.getQueryData<TicketBoard>(key);
  if (previous === undefined) throw new Error("The ticket board is not loaded.");
  void queryClient.cancelQueries({ queryKey: key });
  // Kanban calls onChange inside its view transition. A button outside a
  // board wraps this line in withViewTransition.
  queryClient.setQueryData(key, next);
  moveTicket.mutate(change, {
    onError: () => {
      withViewTransition(() => queryClient.setQueryData(key, previous));
      toast.error("The ticket did not move. Try again.");
    },
  });
};
```

- First cancel the queries of the key, so that a refetch in progress does not overwrite the move.
- A failure puts the object back with the same motion and shows an error toast. The board is the inline place, so the toast is the message.
- `onSettled` invalidates the key, so that the server order replaces the optimistic order.

## Destructive Actions

- Run a destructive mutation from `ConfirmDialog`. Give `mutateAsync` to `onConfirm`. Run `internal-app docs ConfirmDialog`.
- After a delete, remove the detail query, invalidate the list keys, and go to the list:

```ts
const remove = useMutation({
  mutationFn: () => deleteItemFn({ data: { id: itemId } }).then(unwrap),
  onSuccess: async () => {
    queryClient.removeQueries({ queryKey: itemKeys.detail(itemId) });
    await queryClient.invalidateQueries({ queryKey: itemKeys.all });
    await navigate({ to: "/items" });
  },
});
```
