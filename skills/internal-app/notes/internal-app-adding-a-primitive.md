---
id: internal-app-adding-a-primitive
topic: internal-app
summary: Add a missing control to the kit in this skill, with its doc comment, a visual check in the lab, the template checks, kit.json, and a sync into each app, and the controls that the kit leaves out on purpose.
keywords: [add a primitive, new component, missing control, extend the kit, kit component, one-off control, port reui, port heroui, doc comment, kit.json, lab, recipe, color picker, phone input, rating, emoji picker, signature pad, otp input, carousel, chat, scroll area, menubar, navigation menu]
related: [internal-app-page-patterns, internal-app-composition, method]
---

# Internal App: Add A Primitive

Kit components live in this skill, not in an app. Do not build a one-off control in an app. First run `internal-app components` and `design search "<the need>"`: the kit can already have the control.

## Steps

1. Scaffold a working copy with `new --lab`. Build the component in the folder of its layer, such as `src/components/primitives/`, on the matching react-aria-components component, with StyleX tokens and `renderStyles`.
2. Start the file with its doc comment. `internal-app docs Kanban` shows a complete example. The comment gives a summary sentence, `@layer`, `@keywords`, `@related`, and `@notes`, then the purpose and the alternative, `## Behavior`, `## Rules`, and `## Example`. Give each exported prop a comment. `check` fails without them.
3. Show the component in each of its states. Use it in the recipe of the page type that needs it, or on a route of the working copy that you do not copy back.
4. Run `bun run build`, `bun run tsc`, `bun run lint`, and `check`, and capture the page of step 3 in both themes.
5. Copy the file into `assets/template/src`, add its path to the `files` of `assets/kit.json`, and run `bash scripts/validate-skills` in the skills repository. Copy a changed recipe into `assets/lab`.
6. In each app, run `sync --write`.

## Ports Of ReUI And HeroUI

Several kit components use the behavior and the design of free ReUI components (MIT License) or of HeroUI v3 components (Apache License 2.0). `THIRD_PARTY_NOTICES.md` in this skill lists them with the two licenses. Keep the license line first in a ported file. For a new port, add the file to the table of its source in `THIRD_PARTY_NOTICES.md`. The skills repository records which components of each source the kit covers in `docs/reui-coverage.md` and `docs/heroui-coverage.md`.

## Controls The Kit Leaves Out

The kit does not have these controls on purpose. Do not add them. Use the replacement.

| Control | Use instead | Reason |
|---|---|---|
| Free color picker | `ColorSwatchPicker` over the category palette | The colors come from tokens. A free color in app data breaks the token rule. The app stores the key of a palette color. |
| Phone input | `TextField` with `type="tel"` | Correct formatting needs a library for phone numbers. |
| Star rating | `RadioGroup` or `Select` for a score | Star ratings are a pattern for consumers. |
| Emoji picker, signature pad | Nothing | Internal tools do not need them. |
| One-time code input | Nothing | Internal apps sign in through single sign-on. |
| Carousel | A list or a grid | Internal pages show all the items. |
| Chat bubbles and message lists | `Timeline` for comments and history, and `FileUpload` with `FileTypeIcon` for files | Internal tools are not chat apps. |
| Questionnaire | The field primitives in a form | Survey flows are not a pattern of internal tools. |
| Scroll area | Native scrolling, and `ScrollShadow` when the edges must show that more content is out of view | Native scrolling keeps the behavior of the platform. `ScrollShadow` adds only the edge fades. |
| Menubar, navigation menu | `AppShell` for the navigation, and toolbars and menus in pages | The sidebar of the app shell is the navigation. |
| Aspect ratio | The CSS `aspectRatio` property | No primitive is necessary. |
| Isometric icon stack | `IconTile` | It is a decoration. |
