---
id: kit-check-rules
topic: kit
summary: The kit rules that design check enforces in each app on the kit, the literals that it permits, and what the separator-glyph rule catches, permits, and cannot catch.
keywords: [check rules, design check, kit rules, conventions, lint rules, raw-color, font-size-literal, class-name-string, inline-style-object, stylex-shorthand, palette-import, toolbar-control-size, separator-glyph, left-edge-nav, theme-media-query, raw-element, intl-in-component, forbidden-import, forbidden-dependency, kit-folder, kit-docs, kit-layout, recipes, middle dot, bullet, vertical bar, ignore comment]
specializes: [grouped-values]
related: [kit-stylex, kit-tokens, kit-writing, kit-migration-map, kit-update]
---

# Kit Check Rules

Run `design check` in the app root. Each finding gives the rule, the file, and the line. Fix the source. There are no ignore comments.

`design check` runs the kit rules of this note in each app on the kit. The use case of the app can add its own rules, such as rules for its server code. The skill of the use case gives them.

## Rules

| Rule | Fails on |
|---|---|
| `forbidden-dependency` | A replaced library in `package.json`. [[kit-migration-map#libraries]] gives each library and its replacement. |
| `forbidden-import` | An import of a replaced library in `src/`, also of a subpath. |
| `raw-color` | A hex, `rgb()`, `hsl()`, `oklch()`, or other color function in a component, a route, or a feature. Use a color token. |
| `font-size-literal` | A literal `fontSize`. Use a `font` token. |
| `class-name-string` | `className="..."`. Use `stylex.props`. |
| `inline-style-object` | `style={{ ... }}`. Use `stylex.create`. A dynamic value uses a style function. |
| `stylex-shorthand` | The `border:`, `background:`, or `outline:` shorthand. Use longhands. |
| `palette-import` | An import of `palette.stylex` or `brand.stylex` outside `tokens.stylex.ts` and `themes.ts`. |
| `left-edge-nav` | `borderLeft`, `borderInlineStart`, or an inset shadow in shell or navigation files. |
| `theme-media-query` | `prefers-color-scheme` in a component. Themes are a token concern. |
| `raw-element` | A native `<button>`, `<input>`, `<select>`, `<textarea>`, or `<table>` in a route or a feature. Use the kit component, such as `Button`, `TextField`, `Select`, or `DataTable`. |
| `intl-in-component` | `new Intl.` in a component, a route, or a feature. Use the formatters of `src/lib/locale.ts`. |
| `separator-glyph` | A middle dot (`·`), a bullet (`•`), or a vertical bar that joins separate facts in a string or in JSX text. |
| `toolbar-control-size` | An explicit `size` on a `Button` or a `LinkButton` in a `Toolbar`, its `actions` included. Set `size` on the `Toolbar`. |
| `kit-folder` | A file in `src/components/` that is not a kit file. [[kit-update#app-files]] tells where it goes. |
| `kit-docs` | A kit file without a complete doc comment, or with a `@layer` that does not agree with its folder. [[kit-adding-a-component#the-doc-comment]] gives the format. In an app, run `design sync --write`. |
| `kit-layout` | Kit files at the old paths of a moved kit. Do [[kit-update#moved-kit-files]]. |
| `recipes` | In a scaffold with the lab, a recipe that breaks the recipe contract of [[kit-recipes#the-recipe-contract]]. |

`design check` permits structural literals, such as `1px` borders, `100%`, `0`, rem widths, and `calc()` expressions that use tokens.

## What Separator Glyph Catches

[[grouped-values]] tells why separate facts get separate elements. The `separator-glyph` rule reads each line of `src/`, outside comments. An HTML entity or an escape, such as `&middot;`, `&bull;`, or `·`, counts as the glyph.

It fails on:

- A middle dot or a bullet with whitespace or a line end next to it: `"Production · attempt 1"`, `` `${count} items · ${size}` ``, `{" · "}`, and a dot alone on a JSX line.
- A middle dot or a bullet that is the only text of an element: `<span>·</span>`.
- A `join` with a dot, or with a bar next to whitespace: `.join(" · ")`, `.join(" | ")`.
- A vertical bar between spaces in a double-quoted string, in a one-line template literal, or in JSX text that closes on the same line: `"Docs | Help"`, `<p>Docs | Help</p>`.

A string that quotes machine output, such as a test summary with a bar, also fails. Use the output of a tool that does not use a bar, or put the sample in a multi-line template literal.

## What Separator Glyph Permits

- A union type or a bitwise operator, such as `"a" | "b"`. A bar counts only in text.
- `join("|")` without whitespace, which makes a pattern.
- A glyph between quotes with no whitespace, such as `"•"` for a flat delta, or a run of glyphs, such as the masked secret `"••••1234"`.
- The body of a multi-line template literal, such as a code sample or the body of a file.

## What Separator Glyph Cannot Catch

- A glyph next to words without a space, such as `"Q3·YTD"`, or a separator in a variable.
- A vertical bar in JSX text on more than one line.
- Other separators, such as a slash or a dash between separate facts. Find them with `design read review#text-and-data`.
