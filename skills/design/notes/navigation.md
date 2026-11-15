---
id: navigation
topic: components
summary: Breadcrumbs, pagination, continuous loading, grouped navigation, and an active state with a surface, typography, and aria-current.
keywords: [navigation, nav, sidebar, menu, breadcrumbs, breadcrumbs pagination, pagination, infinite scroll, load more, active nav item, current page, selected nav item, aria-current, tabs, settings navigation]
requires: [hierarchy]
related: [edge-accents, accessibility, responsive]
---

# Navigation

Navigation tells people where they are and where they can go.

## Breadcrumbs

Use breadcrumbs for hierarchy, not as a substitute for primary navigation.

## Pagination And Continuous Loading

- Use pagination when users need a stable location or direct access to a page.
- Use continuous loading only when the exact position and the total count are not important.

## Active State

- Keep the active state visible without relying only on color.
- Use a subtle selected surface and clear typography.
- Add `aria-current="page"` to the link of the current page.
- Never use a left-edge border or an accent rail. [[edge-accents#current-navigation-item]] gives the rule.

## Grouping

Group long vertical navigation by user goal.
