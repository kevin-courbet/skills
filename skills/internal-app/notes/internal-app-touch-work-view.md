---
id: internal-app-touch-work-view
topic: internal-app
summary: When work away from a desk needs a separate touch view, and how to build it with a person picker, a WorkQueue, and large direct actions.
keywords: [touch work view, tablet, work list for a tablet, shared tablet, kiosk, technician, picker, nurse, work away from a desk, my work, queue, touch density, person picker, mobile work]
specializes: [responsive, density]
related: [internal-app-page-patterns, internal-app-composition, loading-states]
---

# Internal App Touch Work View

Some people work away from a desk. A technician, a stock picker, or a nurse holds a tablet or a phone, finishes one item, and then starts the next. A desktop list page in touch density does not help these people. `QueueShowcase` on the `/design-kit/queue` route is the reference. Copy its structure. Read the component with `internal-app docs WorkQueue`.

## When To Make A Touch View

Make a separate touch view when all of these conditions are true:

- People work away from a desk: on a tablet, on a phone, or on a shared screen at a bench or on a wall.
- People work on their own items, one item after the other.
- People change the state of an item, such as start, finish, or wait, more frequently than they edit its fields.

Keep the desktop page for the people who plan, assign, and audit the work. The two pages read the same data. The touch view does not replace the desktop page.

A desktop page on a tablet shows these signs. If a page for work away from a desk shows one of them, make a touch view:

- A `DataTable` that scrolls sideways, or columns that people must read across the screen to find the next item.
- Actions in a row menu, in a toolbar above the list, or behind a hover.
- Filters that people must set each time to see their own items.
- The state is a column value, so people must read each row to find the next step.
- Small controls next to each other, so a tap hits the wrong control.

## Structure

1. Render the route in `Page density="touch"`. On a tablet, `AppShell` then keeps the sidebar in the navigation sheet, so the queue gets the full width. On a desktop with a mouse, the shell keeps its sidebar.
2. If no person is chosen, show a `PageHeader` that asks "Who is working on this tablet?" and a `RadioGroup appearance="cards"` with one card for each person. Show the number of open items of each person in the card `meta`.
3. When a person is chosen, show a `PageHeader` whose title names the person and the amount of work. Put a `RadioGroup appearance="chips"` with the first names in the header `actions`, so that the next person changes the queue in one tap.
4. Show a `WorkQueue` with one `QueueSection` for each next action.
5. Open the full record in a `Sheet` from the card title. Keep the id of the open record in a search param.

## The Person

- Keep the person in the URL, such as `?person=`, so that a reload and a link show the same queue.
- On a shared device, remember the last person of each device in a cookie. Read the cookie in `beforeLoad`, as `getThemeChoice` in `src/lib/theme.ts` reads the theme. Do not read `localStorage` during a render: the server cannot read it, so the server HTML and the first browser render are different.
- If the app has sign-in and the device is personal, the signed-in user is the person. Do not show the picker.

## Sections

- Make one section for each next action, in the order of work: "In progress", then "Up next", then "Waiting for a part", then "Not assigned yet". Name a section with the next action or a state that people know. Do not use an internal status code.
- Sort the items of a section: urgent items first, then by due date. Sort a waiting section by the longest wait first.
- Keep a card short: the title, one `subtitle` line, the tasks as a short list, a quote from the requester, and an `Alert` that says why the item waits. Put all other fields in the `Sheet`.

## Touch Targets

- Do not put an action behind a hover or in a menu. A touch screen has no hover. Put feedback that only a hover shows, such as an underline, under `media.finePointer`, because a touch screen keeps the hover state after a tap.
- Make every target 44px or more. The kit buttons, links, and choices do this in touch density. A `Badge` keeps its size in all densities, so use `Badge size="lg"` on a touch page.

## Moves

- Change the query cache inside `withViewTransition`, then send the request. See Optimistic moves in `references/data.md`.
- If the request fails, restore the item inside `withViewTransition` and show a toast that names the item: "WO-1042 did not change. Try again." The card moves back, so the toast is the only place for the message.
- Do not show a toast when the move succeeds. The card in its new section shows the result.

```tsx
<Page density="touch">
  <PageHeader
    title={`${technician.firstName}, ${greeting(count)}`}
    actions={<RadioGroup label="Work orders of" appearance="chips" options={people} value={person} onChange={setPerson} />}
  />
  <WorkQueue>
    <QueueSection title="In progress" icon={Wrench} emphasis items={queue.inProgress} getItemId={(order) => order.id}
      emptyMessage="Nothing in progress. Start the next work order below." renderItem={(order) => <WorkOrderCard order={order} />} />
    <QueueSection title="Up next" icon={ListTodo} items={queue.next} getItemId={(order) => order.id}
      emptyMessage="Your queue is clear." renderItem={(order) => <WorkOrderCard order={order} />} />
  </WorkQueue>
</Page>
```
