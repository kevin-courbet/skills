---
id: internal-app-upgrade
topic: internal-app
summary: Move an existing TanStack Start app onto the stack and the kit one step at a time, from the doctor audit to the removal of the legacy UI and the replaced libraries.
keywords: [upgrade, migrate an app, migration, existing app, old app, legacy app, legacy ui, adopt the kit, install the kit, doctor, upgrade-findings, page by page, migrate pages, remove legacy ui, remove replaced libraries, global stylesheet, tailwind dark mode]
related: [internal-app-migration-map, internal-app-framework-port, internal-app-kit-update, internal-app-build-wiring, internal-app-review]
---

# Upgrade An Existing Internal App

Move an existing app onto the stack and the kit without a big-bang rewrite. The old UI continues to work while the pages move one at a time. The upgrade is complete when `doctor` has no `FAIL` rows.

Work on a branch. Commit after each step, so that each step can be reviewed and reverted alone.

## Assess The App

In the app root, run:

```sh
bun "$SKILL_DIR/scripts/internal-app" doctor
bun "$SKILL_DIR/scripts/internal-app" check --json > upgrade-findings.json
bun "$SKILL_DIR/scripts/internal-app" sync
```

- `doctor` lists the missing dependencies with their `bun add` commands, the replaced libraries, the gaps in the wiring, and the number of convention findings for each rule.
- `check --json` gives each finding with its file and its line. Use it to plan the order of the pages and to measure the progress. Do not commit the file.
- `sync` lists the kit files to add and each `conflict`: an app file at a kit path, such as `src/components/shell/app-shell.tsx`.

If the `framework` row fails, stop. Run `design read internal-app-framework-port` before you do anything else.

## Install The Stack

1. Run the `bun add` and `bun add -d` commands that `doctor` printed. Keep the replaced libraries installed until the last step.
2. Apply the scripts that `doctor` printed to `package.json`.
3. Copy `.oxlintrc.json` and `.oxfmtrc.json` from the template if they are missing. `doctor` prints the commands. If the app has an `.oxlintrc.json`, compare it with the `_oxlintrc.json` of the template and take the rules of the template.
4. Make `vite.config.ts` agree with `assets/template/vite.config.ts`. Keep the options of the app, such as `server.port`. [[internal-app-build-wiring#the-vite-config]] gives the plugin order and the aliases.
5. Make `tsconfig.json` strict, with the `@/*` path and without `verbatimModuleSyntax`. [[internal-app-stack#typescript-7]] gives the TypeScript 7 rules, the removal of `baseUrl`, and the `typescript-js` alias.

Run `bun install` and `bun run build`. The build must pass before the next step.

## Install The Kit Next To The Old UI

1. Move the old UI out of `src/components/` first, for example from `src/components/ui/` to `src/legacy/ui/`. `src/components/` holds only kit files. Update the imports. Do not use `--force` to replace an app file that pages still use.
2. Run `sync --write`. It adds each kit file and writes `internal-app.kit.json`. Commit the two.
3. Create each app contract file that is missing. Copy it from the template and adapt it. [[internal-app-project-layout#app-modules-that-the-kit-imports]] lists the files and their exports. For `src/styles/brand.stylex.ts`, run `design read internal-app-brand-colors`.
4. If the app already has an Effect runtime, export `runtime` and `AppServices` from it. Do not create a second runtime.

## Wire The Root, The Router, And The Shell

1. In `src/router.tsx`, create the router with `createQueryClient()` and `...routerDefaults`, then call `setupRouterSsrQueryIntegration`. Copy the shape from `assets/template/src/router.tsx`. Remove the old QueryClient setup and each react-aria `RouterProvider` of the app, because `routerDefaults` includes the bridge.
2. In `src/routes/__root.tsx`, return `{ theme: await getThemeChoice() }` from `beforeLoad` and render `<AppDocument theme={theme}><Outlet /></AppDocument>`. Delete the old `<html>`, `<head>`, and `<body>` markup. Keep the `head()` meta and the title of the app.
3. Link an icon in `head()` with `links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }]`, and add `public/favicon.svg`. Without it, the browser requests `/favicon.ico` on each load and logs a 404. `doctor` warns about a missing icon (`app-icon`).
4. Keep the old global stylesheet while legacy pages exist. Import it in `__root.tsx` above the `AppDocument` import. Thus its cascade layers come before the StyleX layers, and the kit wins.
5. If the old CSS uses the class-based dark mode of Tailwind, make it follow the kit theme with `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`.
6. Replace the authenticated layout with a pathless layout that renders `ChartProvider` and `AppShell` with the navigation groups of the app. Keep its `beforeLoad` auth guard. Copy the shape from `assets/template/src/routes/_app.tsx`.
7. Add `staticData: { crumb }` to each top-level route.

Run `doctor`. The `root-route`, `router`, `app-shell`, `chart-provider`, `contract`, and `kit` rows must pass now.

## Migrate The Pages

Migrate one route at a time. Start with the route that people use most. For each route:

1. Replace the legacy components with kit primitives. [[internal-app-migration-map#components]] gives the kit component for each one. Keep the behavior. Change the structure only where [[internal-app-page-patterns]] requires it.
2. Replace the utility classes with `stylex.create` styles that use tokens. [[internal-app-migration-map#utility-classes-to-tokens]] gives the token for each class.
3. Move the list state into search params that a schema validates ([[internal-app-routes]]).
4. Send the data through the `api.ts` of the feature, `queryOptions`, `ensureQueryData`, and `useSuspenseQuery` ([[internal-app-server-functions]]).
5. Run `check`, and fix each finding in the files that you changed.
6. Capture the page in the two themes at 1440 px and at 400 px.

## Remove The Legacy UI

When no route imports from the legacy folder:

1. Delete the legacy folder and the import of the old global stylesheet.
2. Remove the Tailwind config and the PostCSS config if nothing else uses them.

## Remove The Replaced Libraries

1. Replace each use of a replaced library. [[internal-app-migration-map#libraries]] gives the replacement of each one.
2. Run the `bun remove` command that `doctor` prints under `forbidden-dependencies`.
3. Run the full gates of [[internal-app-review]].

The upgrade is complete when `doctor` has no `FAIL` rows and the rendered checks pass.
