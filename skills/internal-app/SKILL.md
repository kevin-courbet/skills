---
name: internal-app
description: Build, upgrade, extend, or review internal (non-client-facing) web apps on the fixed house stack and design kit. The stack is TanStack Start, Router, Query, Table, and Form; Effect 4; StyleX; react-aria-components; lucide icons; and Aperture charts. This skill should be used for any internal tool, admin console, back-office screen, operations dashboard, or data-management UI. It covers scaffolding a new app, migrating an existing app to the kit, and adding pages. Do not use it for marketing sites or client-facing products.
---

# Internal App

Build internal web apps that look and behave the same every time. The skill
ships a design kit: tokens, global CSS, primitives, the app shell, the Effect
server boundary, and the Aperture bridge. A bun CLI scaffolds apps, installs
and updates the kit, audits apps, and checks conventions.

## CLI

Resolve paths from this skill directory (`$SKILL_DIR`). The CLI needs Bun.

```sh
bun "$SKILL_DIR/scripts/internal-app" new <dir> --name "App name"   # scaffold
bun "$SKILL_DIR/scripts/internal-app" doctor [dir]                  # audit and list fixes
bun "$SKILL_DIR/scripts/internal-app" sync [dir] [--write] [--force] # install or update kit files
bun "$SKILL_DIR/scripts/internal-app" check [dir]                   # conventions
```

Add `--json` for machine-readable output. Exit status 1 means action is
needed. Treat it as a failure, not a warning.

## Ownership

- **Kit files** are listed in `assets/kit.json`. They are owned by this skill.
  `sync` copies them into the app and records their hashes in
  `internal-app.kit.json`. Commit that lock file. Never edit a kit file in an
  app: `sync` reports the edit as `modified` and `doctor` fails. Change the kit
  in this skill, then run `sync --write` in each app.
- **App files** belong to the app: routes, features, server services, the
  router, the root route, `src/lib/locale.ts`, and config. The template
  contains working examples of each. Kit files import two app modules:
  `src/server/runtime.ts` (`runtime`, `AppServices`) and `src/lib/locale.ts`
  (`appLocale`, `appTimeZone`).

## Workflows

### New app

1. Read `references/stack.md`.
2. Run `new <dir> --name "<App name>"`, then `bun install`, `bun run build`, `bun run tsc`.
3. Replace the example `items` feature with the real features. Keep its file
   shapes. Follow `references/data.md` and `references/components.md`.
4. Finish with `references/review.md`.

### Upgrade an existing app

1. Run `doctor` in the app root. It lists every gap with a fix.
2. Follow `references/upgrade.md` step by step. It covers dependencies, build
   wiring, kit installation next to the old UI, page-by-page migration, and
   removal of the replaced libraries.
3. The upgrade is complete when `doctor` passes and the review in
   `references/review.md` is done.

### Add or change pages

1. Read `references/components.md` and `references/data.md` before writing a route.
2. Compose kit primitives. If no primitive fits, stop and add one to this
   skill (`references/components.md`, Adding a primitive). Do not build a
   one-off control in the app.
3. Run `check` and the review in `references/review.md`.

## References

| File | Read before |
|---|---|
| `references/stack.md` | Installing anything, or creating files. Packages, forbidden libraries, layout, scripts. |
| `references/styling.md` | Writing any style, token, or theme code. |
| `references/components.md` | Composing a page or adding a primitive. |
| `references/data.md` | Writing a route, server function, Effect service, query, mutation, or form. |
| `references/charts.md` | Adding a chart or widget. Also load the `create-data-visualizations` skill. |
| `references/upgrade.md` | Migrating an existing app. |
| `references/review.md` | Handing off any change. |

For hierarchy, spacing, tables, forms, and dark-theme judgement, apply the
`ui-design` skill method. This skill fixes the implementation; `ui-design`
fixes the design method.

## Non-Negotiables

- **One stack.** TanStack Start (Vite, Nitro bun preset), Router, Query, Table v9, Form, and Virtual. Effect 4 on the server. StyleX for every style. react-aria-components for every interactive control. lucide-react icons, Aperture charts, sonner toasts. No Tailwind, shadcn/ui, Radix, Base UI, zod, react-hook-form, visx, or heroicons.
- **Kit first.** Pages compose kit primitives. Never put a raw `<button>`, `<input>`, `<select>`, or `<table>` in a route or feature.
- **Tokens only.** Raw colors, font sizes, and theme media queries live in the token files. Density changes happen in the skill, not in an app.
- **Both themes.** Check every page in light and dark before handoff.
- **Dense and quiet.** Use 13 px body text, 32 px controls, and 36 px table rows. One primary action per view. Sentence case. No success toasts for results the UI already shows.
- **Current navigation** uses a selected surface, medium weight, and `aria-current="page"`. Never a left-edge border, rail, pseudo-element, or inset shadow.
- **Effect at the boundary.** Services are `Context.Service` classes with layers in one `ManagedRuntime`. Server functions validate input with Effect Schema and run through `runServerFn`. Expected failures travel as typed data; defects throw. Nothing is swallowed.
- **URL state.** Search, sort, filter, and page live in schema-validated search params.
- **Data states.** Loaders prefetch with `ensureQueryData`. SSR data never shows a loading state. Empty states appear only after data resolved to empty. Errors are visible and give a next action.
- **Verify, then report.** Format, lint, typecheck, build, `check`, `sync`, `doctor`, and screenshots in both themes are part of done. Report every unmet item.
