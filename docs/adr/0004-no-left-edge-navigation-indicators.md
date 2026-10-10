# ADR 0004: No Left-Edge Navigation Indicators

## Status

Accepted

## Decision

The `ui-design` skill must never use a left-edge border to highlight the current navigation item.
This rule also prohibits equivalent rails, stripes, pseudo-elements, and inset shadows.

## Consequences

Current navigation items use surface and typography changes with appropriate `aria-current` semantics.
The rule applies to navigation bars, sidebars, and navigation lists in both light and dark themes.
