# Stack

Use this exact stack for every internal, non-client-facing web app. Do not
substitute a library because it is familiar. The template's `package.json`
and `bun.lock` are the source of truth for versions. `doctor` compares an app
with them and prints the `bun add` commands for any gap.

## Runtime And Framework

| Role | Package | Notes |
|---|---|---|
| Runtime and package manager | `bun` 1.3 | Scripts run through `bun --bun`. The system Node can be too old. |
| App framework | `@tanstack/react-start` | File routes, server functions, SSR. Vite plugin from `@tanstack/react-start/plugin/vite`. |
| Router | `@tanstack/react-router` | Search params validated with Effect Schema through Standard Schema. |
| Query | `@tanstack/react-query` | One `queryOptions` factory per read. |
| SSR query bridge | `@tanstack/react-router-ssr-query` | `setupRouterSsrQueryIntegration` in `router.tsx`. |
| Table | `@tanstack/react-table` v9 | `useTable({ features: tableFeatures({...}) })`. Not the v8 `useReactTable`. |
| Form | `@tanstack/react-form` | Validators accept Standard Schema objects directly. |
| Virtualizer | `@tanstack/react-virtual` | Lists above about 200 rows. The kit `DataTable` (`virtualize`) and `LogViewer` use it; pages rarely call it directly. |
| Server runtime | `effect` 4 | `Context.Service`, `Layer`, `ManagedRuntime`, `Schema`, `Config`. |
| Server bundle | `nitro` 3 beta | `nitro({ preset: "bun" })` from `nitro/vite`. Start with `bun .output/server/index.mjs`. |
| React | `react`, `react-dom` 19 | |

## Styling And UI

| Role | Package | Notes |
|---|---|---|
| Styles | `@stylexjs/stylex` | Only styling API. Tokens in `src/styles/*.stylex.ts`. |
| StyleX compiler | `@stylexjs/unplugin` | `stylex.vite(...)` before the React plugin. |
| Accessible primitives | `react-aria-components` | Base for every interactive control. Aperture uses the same package. |
| Dates | `@internationalized/date` | Used inside the kit `DatePicker` only. App code passes ISO date strings. |
| Icons | `lucide-react` | Only icon set. `aria-hidden` when decorative. |
| Charts and widgets | `@kevin-courbet/aperture` | Bridged to app tokens. See `charts.md`. |
| Toasts | `sonner` | Mounted once by `AppShell`, unstyled, classes from StyleX. |
| Fonts | `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` | Imported by `src/styles/app.css`. |

## Tooling

| Role | Package | Notes |
|---|---|---|
| Lint | `oxlint` | `.oxlintrc.json`. `no-explicit-any`, `no-nested-ternary`, `no-console`, `no-barrel-file` are errors. `react/incompatible-library` is off because the build does not use the React Compiler. `jsx-a11y/no-autofocus` ignores react-aria components, which manage focus in dialogs. |
| Format | `oxfmt` | `.oxfmtrc.json`. Width 100, double quotes, trailing commas. |
| Types | Go-native `typescript` 7 | `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`. Remove `baseUrl` and use explicit relative `paths`. Keep `verbatimModuleSyntax` off. |
| Tests | `vitest` 5 | Effect tests use explicit layers and `Effect.runPromise`. |

## Replaced Libraries

`check` and `doctor` fail when these are installed or imported. The full list
is in `assets/kit.json`.

| Replaced | Use instead |
|---|---|
| Tailwind, `clsx`, `tailwind-merge`, `tailwind-variants`, `class-variance-authority` | StyleX `create` and `props`, variant maps |
| shadcn/ui, IntentUI, Radix, Base UI, cmdk | Kit primitives on react-aria-components |
| react-hook-form, `@hookform/*`, zod, valibot | TanStack Form with Effect Schema |
| `@visx/*`, recharts | Aperture |
| heroicons, phosphor, react-icons | lucide-react |
| `motion`, framer-motion | StyleX keyframes with reduced-motion overrides |
| react-virtuoso | `@tanstack/react-virtual` |

Prefer Effect RPC for a separately deployed backend or a contract shared by multiple clients.
Use server functions with `runServerFn` for features owned by a single Start process.
RPC is not universally faster or simpler. It adds contract, transport, and runtime ownership.
Read `rpc.md` for the verified Effect v4 pattern and its tradeoffs.

TypeScript 7 is the CLI typechecker, not a JavaScript compiler-API dependency.
If a tool imports the TypeScript JavaScript API, declare `typescript-js` as an npm alias to TypeScript 5 and configure that tool explicitly.
Do not replace the CLI compiler with the JavaScript alias. Verify both the build and CLI typecheck after toolchain changes.

## Project Layout

Kit files are marked **kit**. Everything else is app-owned.

```
internal-app.kit.json          Kit lock written by `sync`. Commit it.
src/
  router.tsx                   App. Spreads routerDefaults; wires the SSR query bridge.
  routes/
    __root.tsx                 App. Theme choice in beforeLoad; renders AppDocument.
    _app.tsx                   App. Navigation config, ChartProvider, AppShell.
    _app/...                   App. Pages. Set staticData.crumb for breadcrumbs.
  styles/                      kit. palette.stylex.ts, tokens.stylex.ts, themes.ts, app.css
  components/
    ui/                        kit. Primitives on react-aria-components.
    shell/                     kit. AppDocument, AppShell, NavLink, RouteBreadcrumbs, RouteError, ThemeSwitch.
    charts/                    kit. chartHost bridge, TrendChart, and Sparkline.
    kit/showcase.tsx           kit. Every primitive on one page for visual checks.
    kit/showcase-operations.tsx kit. Filter, status, pipeline, activity, and card patterns for the showcase.
  features/<name>/             App.
    schemas.ts                 Effect Schema for entities, inputs, and search params. Client-safe.
    api.ts                     Server functions, query keys, queryOptions. The only data module routes import.
    <name>.server.ts           Server-only glue that runs Effects through runServerFn.
    ui/                        Feature components that receive resolved data as props.
  lib/
    locale.ts                  App. appLocale, appTimeZone, and the formatters.
    filter-params.ts           kit. Filter field types and the URL codec for the Filters chip bar.
    form.ts                    kit. fieldError for TanStack Form fields.
    rac.ts                     kit. renderStyles adapter for react-aria render props.
    router-defaults.tsx        kit. createQueryClient, routerDefaults, react-aria router bridge.
    server-result.ts           kit. ServerResult, ServerFnError, unwrap, failureMessage.
    theme.ts                   kit. Theme cookie read and write.
    wire-errors.ts             kit. Schema.TaggedError classes that cross the boundary.
  server/
    runtime.server.ts          App. ManagedRuntime from the app layer; exports runtime and AppServices.
    config.ts                  App. Config.all groups exposed as services.
    errors.ts                  App. Internal Data.TaggedError classes.
    server-fn.server.ts        kit. runServerFn: Exit to ServerResult.
    *.service.ts               App. Context.Service classes with a static layer.
  vite-env.d.ts                kit.
```

Import rules, enforced by `check`:

- Routes import `features/*/api.ts`, `components/*`, and `lib/*`. Never `server/*` or a `.server` module.
- `api.ts` loads `*.server.ts` with a dynamic import inside the handler.
- Components read styles from `@/styles/tokens.stylex` only. Never `palette.stylex.ts`.
- Format numbers and dates with `src/lib/locale.ts`. Do not create `Intl` formatters in components.

## Scripts

```json
{
  "dev": "bun --bun vite dev",
  "build": "bun --bun vite build",
  "start": "bun .output/server/index.mjs",
  "tsc": "bunx --bun tsc --noEmit",
  "lint": "bun --bun oxlint",
  "format": "bun --bun oxfmt",
  "test": "bun --bun vitest run"
}
```

- `build` regenerates `src/routeTree.gen.ts`. Run it before the first `tsc` on a new route.
- The `tsc` script uses `bunx`, because `bun tsc` inside a script named `tsc` calls the script again.
