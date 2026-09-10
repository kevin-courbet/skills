# ADR 0003: Frontend Design Source Ownership

## Status

Accepted

## Decision

Develop and distribute the standalone `frontend-design` skill from the public
`kevin-courbet/skills` repository.

The skill includes Markdown guidance and references. It does not own an
executable tool or a machine-specific integration.

Consumers must install or load the catalog copy. They must not keep a second
development source in dotfiles.

## Consequences

The public catalog becomes the only development source for `frontend-design`.
Changes to its guidance and references use the catalog validation and release
workflow.
