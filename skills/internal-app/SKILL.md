---
name: internal-app
description: Build, upgrade, extend, or review internal (non-client-facing) web apps on the fixed house stack and design kit. The stack is TanStack Start, Router, Query, Table, and Form; Effect 4; StyleX; react-aria-components; lucide icons; and Aperture charts. This skill should be used for any internal tool, admin console, back-office screen, operations dashboard, or data-management UI. It covers scaffolding a new app, migrating an existing app to the kit, and adding pages. Do not use it for marketing sites or client-facing products.
---

# Internal App

Build internal web apps that look and behave the same each time. This skill
is a use case of the `design` skill. `design` gives the method, the kit, and
the CLI. This skill fixes the stack, the template, and the implementation.
Its notes win where they specialize a `design` note. Here, `design` means
`bun <folder of the design skill>/scripts/design`.

The rules are notes. `design read <id>[#section]` prints one, and
`design search "<the need>"` ranks the notes and the kit components together.
Read only the notes of the current step.

## The Use Case

`design new <dir> --app internal-app` scaffolds an app from the template of
this skill and the kit of the `design` skill. It writes the kit lock
`internal-app.kit.json`. The other `design` commands find the use case in
that lock. Add `--app internal-app` in a folder without the lock.
`design check` and `design doctor` add the stack rules of this skill to the
kit rules. Exit status 1 is a failure, not a warning.

## Hard Rules

- **One stack.** TanStack Start (Vite, Nitro bun preset), Router, Query, Table v9, Form, and Virtual. Effect 4 on the server. StyleX for each style. react-aria-components for each interactive control. lucide-react, Aperture, and sonner. TypeScript 7 for CLI checks. No Tailwind, shadcn/ui, Radix, Base UI, zod, react-hook-form, visx, or heroicons.
- **Kit first.** Pages compose kit primitives. No raw `<button>`, `<input>`, `<select>`, or `<table>` in a route or a feature. Add a missing control to the kit in the `design` skill, not to the app.
- **Kit files belong to the `design` skill.** Never edit a kit file in an app. Change the kit, then run `design sync --write` in each app.
- **Tokens only.** Raw colors, font sizes, and theme media queries live in the token files. Brand colors go in `brand.stylex.ts`. Density changes happen in the kit.
- **Dense and quiet.** 13 px body text, 32 px controls, and 36 px table rows. A shared tablet or kiosk page uses `Page density="touch"`. Work away from a desk gets a separate touch view. One primary action for each view. Sentence case. No success toast for a result that the UI shows.
- **App frame.** The sidebar sits on `frame`, and the page sits in the raised content panel. No chrome outside the panel.
- **Current navigation** uses a selected surface, medium weight, and `aria-current="page"`. Never a left-edge border, rail, pseudo-element, or inset shadow.
- **Effect at the boundary.** `Context.Service` classes with layers in one `ManagedRuntime`. Server functions validate input with Effect Schema and run through `runServerFn`. Expected failures are typed data, and defects throw. Nothing is swallowed.
- **Separate backends.** Prefer Effect RPC, with contracts of schemas only and HTTP for SSR and browser calls.
- **Forms.** Chips or cards for a small closed set of choices, each field sized to its answer, and a submit button that stays enabled.
- **URL state.** Search, sort, filter, and page live in search params that a schema validates.
- **Data states.** Loaders prefetch with `ensureQueryData`. SSR data never shows a loading state. An empty state shows only after the data resolved to empty. An error is visible and gives a next action.
- **Verify, then report.** Format, lint, typecheck, build, `design check`, `sync`, `doctor`, and screenshots in light and dark are part of done. Report each unmet item.

## Process

### New App

1. Run `design read internal-app-stack` and `design read internal-app-project-layout`.
2. Run `design new <dir> --app internal-app --name "<App name>"`, `bun install`, `bun run build`, and `bun run tsc`.
3. Replace the example `items` feature with the real features, in the same file shapes. Build each page as below.

### Add Or Change A Page

1. Pattern and recipe: `design read internal-app-page-patterns`, then `design recipe <Id>`. Primary action, row heights, moves, focus, container: `design read kit-composition`.
2. Components: `design search "<the need>"`, then `design docs <Id>`. None fits: `design read kit-adding-a-component`.
3. Route: `design read internal-app-routes`. List filters: `design read kit-url-filters`.
4. Data: `design read internal-app-server-functions`. Writes, optimistic moves, deletes: `design read internal-app-mutations`. Effect services and config: `design read internal-app-effect-services`. A separate backend: `design read internal-app-rpc`. An error tracker: `design read internal-app-error-reporting`.
5. A form, also a dialog with one field: `design read forms` first, then `design read kit-forms` and `design read internal-app-form-submit`. A printed or sent result: `design read kit-form-preview`.
6. Other parts of the page:
   - cards with several blocks: `design read kit-cards`
   - loading, empty, and error states: `design read kit-states`
   - labels and messages: `design read kit-writing`
   - icons: `design read kit-icons`
   - a chart: `design read kit-charts`, and the `create-data-visualizations` skill
   - work away from a desk: `design read kit-touch-work-view` and `design read kit-density`
7. Styles: `design read kit-stylex`. Tokens and color roles: `design read kit-tokens`. Motion: `design read kit-motion`. Theme code: `design read kit-themes`. Brand colors: `design read kit-brand-colors`. `vite.config.ts` or the global CSS: `design read internal-app-build-wiring`.
8. Run `design check`. For a finding: `design read internal-app-check-rules`.
9. Handoff: `design read internal-app-review` and `design read internal-app-review-checklist`. Judgement of hierarchy, spacing, tables, and dark theme: `design read method`.

### Upgrade An Existing App

1. Run `design doctor --app internal-app` in the app root.
2. Do the steps of `design read internal-app-upgrade` in order. Replacements for legacy components, classes, and libraries: `design read kit-migration-map`. An app on another framework: `design read internal-app-framework-port`.
3. Done: `design doctor` passes, and the review of `design read internal-app-review` is done.

### Update The Kit Of An App

Do the steps of `design read kit-update` in order, then the review of `design read internal-app-review`.
