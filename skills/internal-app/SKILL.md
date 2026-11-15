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
bun "$SKILL_DIR/scripts/internal-app" components [dir]              # kit catalog by layer
bun "$SKILL_DIR/scripts/internal-app" docs <Id>[#part] [dir]        # docs of one kit component
```

Add `--json` for machine-readable output. Exit status 1 means action is
needed. Treat it as a failure, not a warning.

## Components

Each kit component documents itself in a doc comment at the top of its file:
its purpose and alternative, its layer, its built-in behavior, its rules, an
example, its props, and the related components and design notes. Read the
docs of the installed kit, because an app can have an older kit than this
skill. `components` and `docs` find the app from the working folder by its
`internal-app.kit.json`. Outside an app they read the template and say so.

To find a component or a rule, run `design search "<the need>"` in the app.
It ranks the design notes and the kit components together, and prints the
`docs` command of each component.

The general rules for pages are notes:

| Note | Read before |
|---|---|
| `design read internal-app-page-patterns` | Composing a page. It gives the pattern, the container, and the design-kit routes. |
| `design read internal-app-composition` | Any page. Primary actions, row heights, moves, and focus. |
| `design read internal-app-forms` | Any form. The control for each answer, widths, and errors. |
| `design read internal-app-form-preview` | A form that makes a printed or sent thing. |
| `design read internal-app-touch-work-view` | Work away from a desk, on a tablet or a phone. |
| `design read internal-app-cards` | Cards with more than one block. |
| `design read internal-app-url-filters` | List filters. |
| `design read internal-app-states` | Loading, empty, and error states. |
| `design read internal-app-writing` | Labels, messages, and facts on one line. |
| `design read internal-app-icons` | Icons. |
| `design read internal-app-adding-a-primitive` | A control that the kit does not have. |

## Ownership

- **Kit files** are listed in `assets/kit.json`. They are owned by this skill.
  `sync` copies them into the app and records their hashes in
  `internal-app.kit.json`. Commit that lock file. Never edit a kit file in an
  app: `sync` reports the edit as `modified` and `doctor` fails. Change the kit
  in this skill, then run `sync --write` in each app.
- **App files** belong to the app: routes, features, server services, the
  router, the root route, `src/lib/locale.ts`, `src/lib/brand.ts`,
  `src/styles/brand.stylex.ts`, and config. The template
  contains working examples of each. Kit files import app modules:
  `src/server/runtime.server.ts` (`runtime`, `AppServices`, `recordEffectCause`),
  `src/lib/locale.ts` (`appLocale`, `appTimeZone`), `src/lib/brand.ts`
  (`defaultTheme`), `src/styles/brand.stylex.ts` (`lightBrand`, `darkBrand`),
  and `src/lib/error-presentation.ts` (`unexpectedFailureMessage`).

## Workflows

### New app

1. Run `design read internal-app-stack` and `design read internal-app-project-layout`.
2. Run `new <dir> --name "<App name>"`, then `bun install`, `bun run build`, `bun run tsc`.
3. Replace the example `items` feature with the real features. Keep its file
   shapes. Follow the data notes in References, the notes in Components, and
   the component docs.
4. Finish with `design read internal-app-review`.

### Upgrade an existing app

1. Run `doctor` in the app root. It lists every gap with a fix.
2. Run `design read internal-app-upgrade` and follow it step by step. It
   covers dependencies, build wiring, kit installation next to the old UI,
   page-by-page migration, and removal of the replaced libraries.
3. The upgrade is complete when `doctor` passes and the review in
   `design read internal-app-review` is done.

### Add or change pages

1. Run `design read internal-app-page-patterns`, `design read internal-app-routes`,
   and `design read internal-app-server-functions` before writing a route. For a page or a dialog with a form, run
   `design read forms` first.
2. Find each component with `design search` and read it with `docs <Id>`.
   If no component fits, stop and add one to this skill
   (`design read internal-app-adding-a-primitive`). Do not build a one-off
   control in the app.
3. Run `check` and the review in `design read internal-app-review`.

## References

| File | Read before |
|---|---|
| `design read internal-app-stack` | Installing anything. Packages and replaced libraries. |
| `design read internal-app-project-layout` | Creating files. Layout, ownership, import rules, locale, scripts. |
| `design read internal-app-stylex` | Writing any style. |
| `design read internal-app-tokens` | Using a token or a color role. |
| `design read internal-app-brand-colors` | Applying the colors of a brand. |
| `design read internal-app-themes` | Changing theme code. |
| `design read internal-app-density` | Building a touch page or changing a size. |
| `design read internal-app-motion` | Animating a change. |
| `design read internal-app-build-wiring` | Changing `vite.config.ts` or the global CSS. |
| `design read internal-app-check-rules` | Fixing a `check` finding. |
| `design read internal-app-routes` | Writing a route, its loader, or its search params. |
| `design read internal-app-server-functions` | Writing a server function, a query, or a feature module. |
| `design read internal-app-effect-services` | Writing an Effect service, a layer, config, or a schema. |
| `design read internal-app-mutations` | Writing a mutation, an optimistic move, or a delete. |
| `design read internal-app-error-reporting` | Connecting an error tracker or server observability. |
| `design read internal-app-rpc` | Connecting a separate backend with Effect 4 RPC, typed errors, SSR, or cancellation. |
| `design read internal-app-charts` | Adding a chart or widget. Also load the `create-data-visualizations` skill. |
| `design read internal-app-upgrade` | Migrating an existing app. |
| `design read internal-app-migration-map` | Replacing a legacy component, class, or library. |
| `design read internal-app-kit-update` | Updating the kit files of an app. |
| `design read internal-app-review` | Handing off any change. |
| `design read internal-app-review-checklist` | Reviewing a page before handoff. |

For hierarchy, spacing, tables, and dark-theme judgement, apply the method
of the `design` skill: run `design read method`. This skill fixes the
implementation; the `design` skill fixes the design method. In this skill,
`design` means `bun <folder of the design skill>/scripts/design`.

For any form, including a dialog with one field, run `design read forms`
before you design it. Then run `design read internal-app-forms` for the kit
component of each answer, and `design read internal-app-form-submit` for the
form state and the server call.

## Non-Negotiables

- **One stack.** TanStack Start (Vite, Nitro bun preset), Router, Query, Table v9, Form, and Virtual. Effect 4 on the server. StyleX for every style. react-aria-components for every interactive control. lucide-react icons, Aperture charts, sonner toasts. No Tailwind, shadcn/ui, Radix, Base UI, zod, react-hook-form, visx, or heroicons.
- **Kit first.** Pages compose kit primitives. Never put a raw `<button>`, `<input>`, `<select>`, or `<table>` in a route or feature.
- **Tokens only.** Raw colors, font sizes, and theme media queries live in the token files. Brand colors go in the app's `brand.stylex.ts`. Density changes happen in the skill, not in an app.
- **Both themes.** Check every page in light and dark before handoff.
- **Dense and quiet.** Use 13 px body text, 32 px controls, and 36 px table rows. A page for a shared tablet or kiosk uses `Page density="touch"` instead. Work that people do away from a desk gets a separate touch view, not a squeezed desktop page; run `design read internal-app-touch-work-view`. One primary action per view. Sentence case. No success toasts for results the UI already shows.
- **App frame.** The sidebar sits on the `frame` color; the page sits in the raised content panel. Do not add page chrome outside the panel.
- **Current navigation** uses a selected surface, medium weight, and `aria-current="page"`. Never a left-edge border, rail, pseudo-element, or inset shadow.
- **Effect at the boundary.** Services are `Context.Service` classes with layers in one `ManagedRuntime`. Server functions validate input with Effect Schema and run through `runServerFn`. Expected failures travel as typed data; defects throw. Nothing is swallowed.
- **Separate backends.** Prefer Effect RPC for an independently running backend. Share schema-only contracts, use HTTP for both SSR and browser calls, and keep runtime ownership explicit. Use TypeScript 7 for CLI checks.
- **Forms.** Run `design read forms` for every form. Show a small closed set of choices as chips or cards, size each field to its answer, and keep the submit button enabled until the submit runs. A long form uses `FormLayout` with an `ErrorSummary`, split sections, and a `FormFooter`.
- **URL state.** Search, sort, filter, and page live in schema-validated search params.
- **Data states.** Loaders prefetch with `ensureQueryData`. SSR data never shows a loading state. Empty states appear only after data resolved to empty. Errors are visible and give a next action.
- **Verify, then report.** Format, lint, typecheck, build, `check`, `sync`, `doctor`, and screenshots in both themes are part of done. Report every unmet item.
