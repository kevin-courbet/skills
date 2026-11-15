---
id: patterns
topic: process
summary: The inventory of page and component patterns and the rules to select one after the priorities are known.
keywords: [component patterns, pattern inventory, which component, layout pattern, page structure, progressive disclosure, gallery, ui patterns]
related: [method, hierarchy, spacing, density]
---

# Component Patterns

Use this inventory to explore a suitable structure after you know the user priorities and the content relationships. It is not a menu of styles to apply without context.

## Pattern Inventory

The source gallery covers:

- Buttons with different emphasis, geometry, depth, and icon placement.
- Inputs, input groups, labels, icons, and error placement.
- Badges for status, counts, and compact metadata.
- Breadcrumbs and pagination for location and sequence.
- Horizontal and vertical navigation, including grouped settings navigation.
- Tables with sparse, bordered, grouped, image, and multi-row treatments.
- Sign-in forms and account-entry layouts.
- Alerts with different severity and information density.
- Pricing cards, comparison tables, and variable-pricing layouts.
- Marketing heroes and feature sections.
- Modals and multi-section or multi-page forms.
- Header navigation, preview cards, and profile cards.
- Application shells with horizontal, vertical, and multi-column navigation.
- Footers, activity feeds, checkout pages, and testimonials.

## Selection Rules

- Start from the task and the information hierarchy, not from the visual treatment.
- Prefer the simplest pattern that keeps all required actions and states.
- Use progressive disclosure when advanced controls would overwhelm the common path.
- Keep familiar control behavior when the visual treatment changes. [[accessibility#native-behavior]] gives the rule.
- Use a container only for a real group or an interaction boundary. [[spacing#containers-and-cards]] gives the rule.
- Keep one dominant action for each decision point. [[hierarchy#actions]] gives the rule.
- Match density to use frequency. [[density]] gives the rule.

## Patterns In Other Notes

- Forms, field groups, choices, and errors: [[forms]].
- Navigation, breadcrumbs, and pagination: [[navigation]].
- Modals, confirmations, and alerts: [[overlays]].
- Tables: [[tables]].
- Dashboards, badges, and status summaries: [[dashboards]].
- Icons in buttons and labels: [[icons]].
