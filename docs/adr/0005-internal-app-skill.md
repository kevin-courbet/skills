# ADR 0005: Internal App Skill

## Status

Accepted

## Decision

The catalog develops and distributes `internal-app`, the entry skill for
internal, non-client-facing web apps.

The skill fixes one stack: TanStack Start with Vite and Nitro; TanStack
Router, Query, Table v9, Form, and Virtual; Effect 4 for server services and
schemas; StyleX for all styling; react-aria-components for interactive
controls; lucide icons; Aperture for charts; sonner for toasts.
react-aria-components is the primitive library because Aperture already
depends on it and it covers dates, combo boxes, and locale-aware fields.

The skill ships a design kit. `assets/template` is a verified app and the
single source of the kit. `assets/kit.json` lists the kit-owned files: tokens,
global CSS, primitives, the app shell, chart bridge, and the server-function
boundary. All other template files are examples that the app owns.

A bun CLI, `scripts/internal-app`, provides four commands:

- `new` scaffolds an app from the template.
- `sync` installs and updates kit files in an app and records their hashes in
  `internal-app.kit.json`. It never overwrites a locally edited file without
  `--force`.
- `doctor` audits an app against the stack, wiring, kit, and conventions, and
  prints the fix for each gap.
- `check` enforces the styling, import, and API conventions.

## Consequences

Agents building or upgrading internal tools load `internal-app` first.
`ui-design` and `form-design` keep the design method.
`create-data-visualizations` keeps chart selection and data semantics.

Apps do not edit kit files. Kit changes land in this repository and reach
apps through `sync --write`, so every app keeps the same look and behavior.

`validate-skills` scaffolds the template, installs it from the frozen
lockfile, and runs build, typecheck, lint, format check, `check`, `sync`, and
`doctor`. A template change cannot land unless the scaffold passes.
