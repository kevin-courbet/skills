# Component Patterns

Use this inventory to explore a suitable structure after user priorities and content relationships are known. It is not a menu of styles to apply without context.

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

- Start from the task and information hierarchy, not the visual treatment.
- Prefer the simplest pattern that preserves all required actions and states.
- Use containers only when they create a real grouping or interaction boundary.
- Keep one dominant action per decision point.
- Match density to use frequency. Repeated operational tasks need less decoration and tighter paths.
- Keep comparable values aligned.
- Use progressive disclosure when advanced controls would overwhelm the common path.
- Preserve familiar control behavior even when the visual treatment changes.

## Forms

- Group fields by user intent, not storage schema.
- Keep labels visibly associated with controls.
- Put errors next to the field when one field caused the error.
- Put a summary above the form when users need to locate multiple errors.
- Use multi-page forms only when the sections form a meaningful sequence.

## Navigation

- Use breadcrumbs for hierarchy, not as a substitute for primary navigation.
- Use pagination when users need stable location or direct page access.
- Use continuous loading only when exact position and total count are not important.
- Keep active state visible without relying only on color.
- Group long vertical navigation by user goal.

## Overlays And Alerts

- Use a modal only when the task must interrupt the current context.
- Keep destructive confirmation focused on the affected object and consequence.
- Match alert prominence to severity and required action.
- Do not make informational notices compete with primary page content.

## Responsive Adaptation

- Recompose wide patterns instead of only shrinking them.
- Preserve identifiers, critical values, status, and primary actions.
- Replace multi-column comparison only when the alternative still supports comparison.
- Avoid moving related labels and values so far apart that their relationship becomes unclear.
