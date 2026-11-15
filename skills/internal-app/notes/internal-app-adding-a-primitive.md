---
id: internal-app-adding-a-primitive
topic: internal-app
summary: Add a missing control to the kit in this skill, with its doc comment, its showcase, the template checks, kit.json, and a sync into each app.
keywords: [add a primitive, new component, missing control, extend the kit, kit component, one-off control, port reui, doc comment, kit.json, showcase]
related: [internal-app-page-patterns, internal-app-composition, method]
---

# Internal App: Add A Primitive

Kit components live in this skill, not in an app. Do not build a one-off control in an app. First run `internal-app components` and `design search "<the need>"`: the kit can already have the control.

## Steps

1. Scaffold a working copy with `new`. Build the component in `src/components/ui` on the matching react-aria-components component, with StyleX tokens and `renderStyles`.
2. Start the file with its doc comment. `internal-app docs Kanban` shows a complete example. The comment gives a summary sentence, `@layer`, `@keywords`, `@related`, and `@notes`, then the purpose and the alternative, `## Behavior`, `## Rules`, and `## Example`. Give each exported prop a comment. `check` fails without them.
3. Add the component to `KitShowcase` in all its states.
4. Run `bun run build`, `bun run tsc`, `bun run lint`, and `check`, and capture `/design-kit` in both themes.
5. Copy the file into `assets/template/src`, add its path to the `files` of `assets/kit.json`, and run `bash scripts/validate-skills` in the skills repository.
6. In each app, run `sync --write`.

## Ports Of ReUI

Several kit components use the behavior and the design of free ReUI components. `THIRD_PARTY_NOTICES.md` in this skill lists them with the ReUI license. `references/reui-coverage.md` records which ReUI components the kit covers, and why it leaves out the others. Keep the license line first in a ported file.
