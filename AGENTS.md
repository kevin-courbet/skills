# Agent Skills Guide

Use ASD-STE100 Simplified Technical English for user-facing text and docs.

- Keep each skill self-contained under `skills/<name>/`.
- Resolve support files with paths relative to the skill directory.
- Develop `design` and `internal-app` in this repository. `design` is the only design skill. Add design rules to its notes, not to a new design skill.
- `design` owns the kit and the one CLI. `skills/design/assets/kit/` holds every kit file, and `skills/design/assets/kit.json` lists them. A use case, such as `internal-app`, supplies only a template, a lab, notes, and rules through the `app` block of its `design-graph.json`. The `kit-use-cases` note gives the contract.
- Change the kit or a template in a scaffolded working copy (`bun skills/design/scripts/design new <dir> --app internal-app --lab`), verify there, then copy kit files back to `skills/design/assets/kit/` and the other files to the template. Keep `kit.json` in sync with the kit; `validate-skills` installs, builds, typechecks, lints, and checks a fresh scaffold.
- The notes in `skills/design/notes/` are the only source of design rules. Do not copy a rule into another skill. Link to its note with `design read <id>` or `[[id]]`. The `note-format` note gives the format.
- Do not generate or sync copies of design notes or design assets. Other skills point to a note by id. A skill that narrows the design rules joins the graph with `design-graph.json`, as the `graph-membership` note describes.
- After a change to the design notes, run `bun skills/design/scripts/design graph --check` and `bun test skills/design/tests`.
- `docs/` holds the decisions and the records for the maintainers of this repository, such as `docs/reui-coverage.md` and `docs/heroui-coverage.md`. It does not ship with a skill. Do not point a skill to it.
- Do not edit `skills/create-data-visualizations/` here. The catalog workflow publishes it from Aperture.
- Run `bash scripts/validate-skills` before completion.
