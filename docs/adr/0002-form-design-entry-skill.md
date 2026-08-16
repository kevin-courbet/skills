# ADR 0002: Form Design Entry Skill

## Status

Accepted

## Decision

The public `kevin-courbet/skills` catalog publishes `form-design` as a
standalone entry skill for form-specific requests.

The existing `ui-design` skill remains the broader entry for
information-dense interfaces. Both skills use the same form-design method.

## Consequences

Agents can discover form guidance from requests about forms, data entry,
validation feedback, checkout, onboarding, surveys, settings, and multi-step
flows.

The catalog keeps one source for shared guidance and validates the generated
references in `form-design` against `ui-design`.
