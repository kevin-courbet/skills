# Agent Skills Guide

Use ASD-STE100 Simplified Technical English for user-facing text and docs.

- Keep each skill self-contained under `skills/<name>/`.
- Resolve support files with paths relative to the skill directory.
- Develop `ui-design`, the `form-design` entry skill, and `internal-app` in this repository.
- `skills/internal-app/assets/template` is the verified starter and the source of every kit file listed in `skills/internal-app/assets/kit.json`. Change it in a scaffolded working copy (`bun skills/internal-app/scripts/internal-app new <dir>`), verify there, then copy the changes back. Keep `kit.json` in sync with the template; `validate-skills` installs, builds, typechecks, lints, and checks a fresh scaffold.
- Keep copied references canonical under `ui-design`. Run `scripts/sync-form-design` after changes to those references.
- Do not edit generated files under `skills/form-design/references/`.
- Do not edit `skills/create-data-visualizations/` here. The catalog workflow publishes it from Aperture.
- Run `bash scripts/validate-skills` before completion.
