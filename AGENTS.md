# Agent Skills Guide

Use ASD-STE100 Simplified Technical English for user-facing text and docs.

- Keep each skill self-contained under `skills/<name>/`.
- Resolve support files with paths relative to the skill directory.
- Develop `ui-design` and the `form-design` entry skill in this repository.
- Keep copied references canonical under `ui-design`. Run `scripts/sync-form-design` after changes to those references.
- Do not edit generated files under `skills/form-design/references/`.
- Do not edit `skills/create-data-visualizations/` here. The catalog workflow publishes it from Aperture.
- Run `bash scripts/validate-skills` before completion.
