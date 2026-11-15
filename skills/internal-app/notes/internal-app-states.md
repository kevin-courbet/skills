---
id: internal-app-states
topic: internal-app
summary: SSR data shows no loading state, skeletons only for slow client loads, quiet refetches, empty states only after data resolved to empty, and visible errors.
keywords: [loading state, skeleton, spinner, empty state, error state, refetch, no results, clear filters, route error, ssr loading, blank table]
specializes: [loading-states]
related: [internal-app-composition, internal-app-writing]
---

# Internal App States

Read the state components with `internal-app docs Feedback`. Route failures use `internal-app docs RouteError`.

## Rules

- Data that the server loaded renders directly. Show no skeleton and no spinner for it.
- Use a `Skeleton` only for a load that the client starts and that takes more than about 300 ms.
- During a quiet refetch, show a small "Updating" text or nothing. Never blank the table.
- Show an `EmptyState` only after the data resolved to zero rows. A filter that gives zero rows gets a "Clear filters" action.
- Show an `ErrorState` for a failure. Route failures render `RouteError`.
