---
id: kit-adding-a-component
topic: kit
summary: Add a missing control to the kit in this skill, with its doc comment, a visual check in the lab, the app checks, kit.json, and a sync into each app, and the controls that the kit leaves out on purpose.
keywords: [add a primitive, add a component, new component, missing control, extend the kit, kit component, one-off control, port reui, port heroui, doc comment, doc comment format, kit.json, lab, recipe, color picker, phone input, rating, emoji picker, signature pad, otp input, carousel, chat, scroll area, menubar, navigation menu]
related: [kit-recipes, kit-composition, kit-update, method]
---

# Add A Kit Component

Kit components live in this skill, in `assets/kit/`, not in an app. Do not build a one-off control in an app. First run `design components` and `design search "<the need>"`: the kit can already have the control.

## Steps

1. Scaffold a working copy with the lab: `design new <dir> --app <use case> --lab`, such as `--app internal-app`. Build the component in the folder of its layer, such as `src/components/primitives/`, on the matching react-aria-components component, with StyleX tokens and `renderStyles`.
2. Start the file with its doc comment. "The Doc Comment" below gives the format. `design docs Kanban` shows a complete example. Give each exported prop a comment. `design check` fails without them.
3. Show the component in each of its states. Use it in the recipe of the page type that needs it ([[kit-recipes]]), or on a route of the working copy that you do not copy back.
4. Run `bun run build`, `bun run tsc`, `bun run lint`, and `design check`, and capture the page of step 3 in both themes.
5. Copy the file into `assets/kit/src/` of this skill at the same path, such as `assets/kit/src/components/primitives/`. Add its path to the `files` of `assets/kit.json`. Run `bash scripts/validate-skills` in the skills repository. Copy a changed recipe back into the lab of its use-case skill.
6. In each app, run `design sync --write`.

## The Doc Comment

A kit file starts with one `/** ... */` comment. Only the license line of a port comes before it. `design docs` and `design search` read the comment, and `design check` fails with the rule `kit-docs` when it is not complete.

1. A summary: one sentence that ends with a period.
2. The tags, one on each line:
   - `@layer`: `primitive`, `pattern`, `shell`, or `helper`. It must agree with the folder of the file, such as `src/components/patterns/` for a pattern.
   - `@keywords`: at least 3 search terms, with the words that a builder types.
   - `@related`: the ids of near kit components.
   - `@notes`: the design notes that the component applies. Name only notes of this skill.
3. An introduction: what the file is for, when not to use it, and the alternative.
4. Optional sections, such as `## Behavior` and `## Rules`, and the required `## Example` section with a code sample.

## Ports Of ReUI And HeroUI

Several kit components use the behavior and the design of free ReUI components (MIT License) or of HeroUI v3 components (Apache License 2.0). `THIRD_PARTY_NOTICES.md` in this skill lists them with the two licenses. Keep the license line first in a ported file. For a new port, add the file to the table of its source in `THIRD_PARTY_NOTICES.md`.

## Controls The Kit Leaves Out

The kit does not have these controls on purpose. Do not add them. Use the replacement.

| Control | Use instead | Reason |
|---|---|---|
| Free color picker | `ColorSwatchPicker` over the category palette | The colors come from tokens. A free color in app data breaks the token rule. The app stores the key of a palette color. |
| Phone input | `TextField` with `type="tel"` | Correct formatting needs a library for phone numbers. |
| Star rating | `RadioGroup` or `Select` for a score | Star ratings are a pattern for consumers. |
| Emoji picker, signature pad | Nothing | Work tools do not need them. |
| One-time code input | Nothing | Work apps sign in through single sign-on. |
| Carousel | A list or a grid | Work pages show all the items. |
| Chat bubbles and message lists | `Timeline` for comments and history, and `FileUpload` with `FileTypeIcon` for files | Work tools are not chat apps. |
| Questionnaire | The field primitives in a form | Survey flows are not a pattern of work tools. |
| Scroll area | Native scrolling, and `ScrollShadow` when the edges must show that more content is out of view | Native scrolling keeps the behavior of the platform. `ScrollShadow` adds only the edge fades. |
| Menubar, navigation menu | `AppShell` for the navigation, and toolbars and menus in pages | The sidebar of the app shell is the navigation. |
| Aspect ratio | The CSS `aspectRatio` property | No primitive is necessary. |
| Isometric icon stack | `IconTile` | It is a decoration. |
