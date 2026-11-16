---
id: internal-app-project-layout
topic: internal-app
summary: The folders and files of an internal app, which files the kit of the design skill owns, which files the template of this skill gives, which files the app owns, the app modules that kit files import, the import rules, the locale module, and the package scripts.
keywords: [project layout, folder structure, file layout, where to put files, kit files, app files, template files, lab files, ownership, who owns, app contract, import rules, locale, time zone, Intl, date strings, package scripts, routeTree, bun scripts, tsc script]
related: [internal-app-stack, internal-app-server-functions, kit-update, kit-recipes]
---

# Internal App Project Layout

Three sources give the files of an internal app:

- **The kit.** The design skill owns the kit files. Its `kit.json` lists them. `design new` and `design sync` copy them into the app, and the kit lock records them. Never edit a kit file in an app. Change the kit in the design skill ([[kit-update]]).
- **The template.** This skill owns the template in `assets/template/`: the app files of a new internal app, such as the router, the routes, the brand, the locale module, the server runtime, and the example feature `items`. `design new <dir> --app internal-app` copies the template one time. After that, the app owns these files, and `design sync` never changes them.
- **The lab.** This skill owns the recipe pages in `assets/lab/`. `design new <dir> --app internal-app --lab` adds them under `/lab` ([[kit-recipes]]).

The app owns all the files that are not kit files. The template has a working example of each app file.

## Folders And Files

The files that the kit owns are marked **kit**.

```
internal-app.kit.json          Kit lock that `design sync` writes. It names the use case. Commit it.
public/favicon.svg             App. The tab icon. The root route links it; replace it with the icon of the app.
src/
  router.tsx                   App. Spreads routerDefaults; wires the SSR query bridge.
  routes/
    __root.tsx                 App. Theme choice in beforeLoad; renders AppDocument; links the icon.
    _app.tsx                   App. Navigation config, ChartProvider, AppShell.
    _app/...                   App. Pages. Set staticData.crumb for breadcrumbs.
  styles/                      kit. palette.stylex.ts, tokens.stylex.ts, themes.ts, category.ts, app.css
  styles/brand.stylex.ts       App. Brand surfaces, text, borders, and accent for the two themes.
  components/                  kit. Only kit files. The folder of each file is its @layer.
    primitives/                kit. One control or one display element, such as Button, Select, and Sparkline.
    patterns/                  kit. A complete interaction for one task, such as DataTable, Kanban, and TrendChart.
    shell/                     kit. AppDocument, AppShell, NavLink, RouteBreadcrumbs, RouteError, ThemeSwitch.
    helpers/                   kit. Parts, hooks, and functions for kit code: Field, Overlay, chartHost, form, motion.
  features/<name>/             App.
    schemas.ts                 Effect Schema for entities, inputs, and search params. Client-safe.
    api.ts                     Server functions, query keys, queryOptions. The only data module routes import.
    <name>.server.ts           Server-only glue that runs Effects through runServerFn.
    ui/                        Feature components that receive resolved data as props.
  lib/
    locale.ts                  App. appLocale, appTimeZone, and the formatters.
    brand.ts                   App. defaultTheme for people without a saved theme.
    error-presentation.ts      App. unexpectedFailureMessage.
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

Put the components of the app in `src/features/<name>/ui/`, not in `src/components/`. `design check` fails on a file in `src/components/` that is not a kit file, and when the `@layer` of a kit file does not agree with its folder. `src/lib/` keeps the kit modules that have no doc comment and the app modules. [[kit-update#app-files]] gives the rule, and [[internal-app-page-patterns]] gives a complete page for each common page type.

## App Modules That The Kit Imports

Kit files import these app modules. `appContract` in the `kit.json` of the design skill lists them, and the `contract` row of `design doctor` checks them. Keep their exports:

- `src/server/runtime.server.ts`: `runtime`, `AppServices`, and `recordEffectCause`.
- `src/lib/locale.ts`: `appLocale` and `appTimeZone`.
- `src/lib/brand.ts`: `defaultTheme`.
- `src/styles/brand.stylex.ts`: `lightBrand` and `darkBrand`.
- `src/lib/error-presentation.ts`: `unexpectedFailureMessage`.

## Import Rules

`design check` enforces these rules:

- Routes import `features/*/api.ts`, `components/*`, and `lib/*`. Never `server/*` or a `.server` module.
- `api.ts` loads `*.server.ts` with a dynamic import inside the handler.
- Components read styles only from `@/styles/tokens.stylex`. Never from `palette.stylex.ts` or `brand.stylex.ts`.

## Locale And Time

- `src/lib/locale.ts` sets one locale and one time zone, and exports the formatters. Format each number and each date with it.
- `AppDocument` gives the locale to the react-aria fields. `ChartProvider` in `_app.tsx` receives the same values.
- Do not make `Intl` formatters in components. `design check` fails on them.
- Date fields exchange ISO date strings. Thus schemas use `Schema.String` with a date check, not calendar objects.

## Scripts

```json
{
  "dev": "bun --bun vite dev",
  "build": "bun --bun vite build",
  "start": "bun .output/server/index.mjs",
  "tsc": "bun --bun node_modules/.bin/tsc --noEmit",
  "lint": "bun --bun oxlint",
  "format": "bun --bun oxfmt",
  "test": "bun --bun vitest run"
}
```

- `build` makes `src/routeTree.gen.ts` again. Run it before the first `tsc` on a new route.
- The `tsc` script runs the locked compiler from `node_modules/.bin`. Do not write `bun tsc`: in a script named `tsc`, it calls the script again. Do not write `bunx`: some validation environments have Bun without its `bunx` alias.
