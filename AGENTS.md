# Agent Skills Guide

Use ASD-STE100 Simplified Technical English for user-facing text and docs.

- Keep each skill self-contained under `skills/<name>/`.
- Resolve support files with paths relative to the skill directory.
- Develop `design` and `internal-app` in this repository. `design` is the only design skill. Add design rules to its notes, not to a new design skill.
- `skills/internal-app/assets/template` is the verified starter and the source of every kit file listed in `skills/internal-app/assets/kit.json`. Change it in a scaffolded working copy (`bun skills/internal-app/scripts/internal-app new <dir>`), verify there, then copy the changes back. Keep `kit.json` in sync with the template; `validate-skills` installs, builds, typechecks, lints, and checks a fresh scaffold.
- The notes in `skills/design/notes/` are the only source of design rules. Do not copy a rule into another skill. Link to its note with `design read <id>` or `[[id]]`. The `note-format` note gives the format.
- Do not generate or sync copies of design notes or design assets. Other skills point to a note by id. A skill that narrows the design rules joins the graph with `design-graph.json`, as the `graph-membership` note describes.
- After a change to the design notes, run `bun skills/design/scripts/design graph --check` and `bun test skills/design/tests`.
- Do not edit `skills/create-data-visualizations/` here. The catalog workflow publishes it from Aperture.
- Run `bash scripts/validate-skills` before completion.
