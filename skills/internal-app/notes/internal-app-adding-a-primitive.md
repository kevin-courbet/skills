---
id: internal-app-adding-a-primitive
topic: internal-app
summary: Add a missing control to the kit in this skill, with its doc comment, its showcase, the template checks, kit.json, and a sync into each app, and the controls that the kit leaves out on purpose.
keywords: [add a primitive, new component, missing control, extend the kit, kit component, one-off control, port reui, doc comment, kit.json, showcase, color picker, phone input, rating, emoji picker, signature pad, otp input, carousel, chat, scroll area, menubar, navigation menu]
related: [internal-app-page-patterns, internal-app-composition, method]
---

# Internal App: Add A Primitive

Kit components live in this skill, not in an app. Do not build a one-off control in an app. First run `internal-app components` and `design search "<the need>"`: the kit can already have the control.

## Steps

1. Scaffold a working copy with `new`. Build the component in the folder of its layer, such as `src/components/primitives/`, on the matching react-aria-components component, with StyleX tokens and `renderStyles`.
2. Start the file with its doc comment. `internal-app docs Kanban` shows a complete example. The comment gives a summary sentence, `@layer`, `@keywords`, `@related`, and `@notes`, then the purpose and the alternative, `## Behavior`, `## Rules`, and `## Example`. Give each exported prop a comment. `check` fails without them.
3. Add the component to `KitShowcase` in all its states.
4. Run `bun run build`, `bun run tsc`, `bun run lint`, and `check`, and capture `/design-kit` in both themes.
5. Copy the file into `assets/template/src`, add its path to the `files` of `assets/kit.json`, and run `bash scripts/validate-skills` in the skills repository.
6. In each app, run `sync --write`.

## Ports Of ReUI

Several kit components use the behavior and the design of free ReUI components. `THIRD_PARTY_NOTICES.md` in this skill lists them with the ReUI license. Keep the license line first in a ported file. The skills repository records which ReUI components the kit covers in `docs/reui-coverage.md`.

## Controls The Kit Leaves Out

The kit does not have these controls on purpose. Do not add them. Use the replacement.

| Control | Use instead | Reason |
|---|---|---|
| Color picker | A `Select` of an `intent` | The colors come from tokens. A free color in app data breaks the token rule. |
| Phone input | `TextField` with `type="tel"` | Correct formatting needs a library for phone numbers. |
| Star rating | `RadioGroup` or `Select` for a score | Star ratings are a pattern for consumers. |
| Emoji picker, signature pad | Nothing | Internal tools do not need them. |
| One-time code input | Nothing | Internal apps sign in through single sign-on. |
| Carousel | A list or a grid | Internal pages show all the items. |
| Chat bubbles and message lists | `Timeline` for comments and history, and `FileUpload` with `FileTypeIcon` for files | Internal tools are not chat apps. |
| Questionnaire | The field primitives in a form | Survey flows are not a pattern of internal tools. |
| Scroll area | Native scrolling | It keeps the behavior of the platform. |
| Menubar, navigation menu | `AppShell` for the navigation, and toolbars and menus in pages | The sidebar of the app shell is the navigation. |
| Aspect ratio | The CSS `aspectRatio` property | No primitive is necessary. |
| Isometric icon stack | `IconTile` | It is a decoration. |
