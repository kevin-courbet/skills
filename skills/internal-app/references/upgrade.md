# Upgrade An Existing App

Move an existing internal app onto the stack and kit without a big-bang
rewrite. The old UI keeps working while pages move one at a time. The upgrade
is complete when `doctor` has no `FAIL` rows.

Work on a branch. Commit after each numbered step so each step can be
reviewed and reverted alone.

## 1. Assess

Run in the app root:

```sh
bun "$SKILL_DIR/scripts/internal-app" doctor
bun "$SKILL_DIR/scripts/internal-app" check --json > upgrade-findings.json
bun "$SKILL_DIR/scripts/internal-app" sync
```

- `doctor` lists missing dependencies with `bun add` commands, replaced libraries, wiring gaps, and the convention count by rule.
- `check --json` gives every finding with file and line. Use it to plan the page order and to measure progress. Do not commit the file.
- `sync` lists the kit files to add and any `conflict`: an existing app file at a kit path, often `src/components/ui/button.tsx`.

If `framework` fails, read "Apps on another framework" below before anything else.

## 2. Install The Stack

1. Run the `bun add` and `bun add -d` commands that `doctor` printed. Keep the replaced libraries installed until step 7.
2. Apply the scripts `doctor` printed to `package.json`.
3. Copy `.oxlintrc.json` and `.oxfmtrc.json` from the template if they are missing (`doctor` prints the commands).
4. Update `vite.config.ts` to match `assets/template/vite.config.ts`: `stylex.vite({...})` first, with `unstable_moduleResolution` and `aliases` for `@/*`, then `tanstackStart`, `nitro`, and the React plugin. Keep app-specific options such as `server.port`.
5. Make `tsconfig.json` strict with the `@/*` path and without `verbatimModuleSyntax`.

Run `bun install` and `bun run build`. The build must pass before the next step.

## 3. Install The Kit Next To The Old UI

1. Move every conflicting app file out of the kit paths first, for example `src/components/ui/` to `src/components/legacy/`. Update its imports. Do not use `--force` to overwrite an app file that pages still use.
2. Run `sync --write`. It adds every kit file and writes `internal-app.kit.json`. Commit both.
3. Create the app contract files if they are missing. Copy and adapt `src/lib/locale.ts` (`appLocale`, `appTimeZone`, formatters) and `src/server/runtime.ts` (`runtime`, `AppServices`) from the template. If the app already has an Effect runtime, export these two names from it instead of creating a second runtime.

## 4. Wire The Root, The Router, And The Shell

1. `src/router.tsx`: create the router with `createQueryClient()` and `...routerDefaults`, then call `setupRouterSsrQueryIntegration`. Copy the shape from `assets/template/src/router.tsx`. Remove the old QueryClient setup and any react-aria `RouterProvider` the app had; `routerDefaults` includes the bridge.
2. `src/routes/__root.tsx`: return `{ theme: await getThemeChoice() }` from `beforeLoad` and render `<AppDocument theme={theme}><Outlet /></AppDocument>`. Delete the old `<html>`, `<head>`, and `<body>` markup. Keep the app's `head()` meta and title.
3. Keep the old global stylesheet while legacy pages exist. Import it in `__root.tsx` above the `AppDocument` import, so its cascade layers come before the StyleX layers and the kit wins.
4. If the old CSS uses Tailwind's class-based dark mode, make it follow the kit theme: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`.
5. Replace the authenticated layout with a pathless layout that renders `ChartProvider` and `AppShell` with the app's navigation groups. Keep its `beforeLoad` auth guard. Copy the shape from `assets/template/src/routes/_app.tsx`.
6. Add `staticData: { crumb }` to each top-level route.

Run `doctor`. The `root-route`, `router`, `app-shell`, `chart-provider`, `contract`, and `kit` rows must pass now.

## 5. Migrate Pages

Migrate one route at a time, most-used first. For each route:

1. Replace legacy components with kit primitives (tables below). Keep behavior; change structure only where the page patterns in `components.md` require it.
2. Replace utility classes with `stylex.create` styles built from tokens.
3. Move list state into schema-validated search params.
4. Route data through feature `api.ts`, `queryOptions`, `ensureQueryData`, and `useSuspenseQuery`.
5. Run `check` and fix every finding in the files you touched.
6. Capture the page in both themes at 1440 px and 400 px.

### Components

| Legacy | Kit |
|---|---|
| shadcn or IntentUI `Button` (`default`, `secondary`, `outline`, `ghost`, `destructive`, `link`) | `Button` (`primary`, `secondary`, `secondary`, `ghost`, `danger`); `LinkButton` for navigation; a router `Link` for inline links |
| `Input`, `Label`, `FormItem`, `FormMessage` | `TextField` with `label`, `description`, `errorMessage` |
| `Textarea` | `TextField multiline` |
| `Select`, `ResponsiveSelect` | `Select` (short list) or `ComboBox` (long list) |
| `Command`, searchable select | `ComboBox` |
| `Checkbox`, `Switch`, `RadioGroup` | `Checkbox`, `Switch`, `RadioGroup` |
| `Calendar`, date picker | `DatePicker` with ISO strings |
| `Dialog`, `Modal`, `AlertDialog` | `Dialog`; `ConfirmDialog` for destructive confirmation |
| `Sheet`, `Drawer` | `Sheet` |
| `DropdownMenu`, `ContextMenu` | `Menu` in `MenuTrigger` |
| `Popover` | `Popover` in `PopoverTrigger` |
| `Tooltip` | `Tooltip` in `TooltipTrigger` |
| `Tabs` | `Tabs` |
| `Table` and hand-rendered tables | `DataTable` |
| `Badge` | `Badge` |
| `Card` | `Card`, or no container when grouping comes from spacing |
| `Skeleton`, spinners | `Skeleton`, `Spinner`; none for SSR data |
| `Alert`, callouts | `Alert` |
| Toast and Sonner wrappers | `toast` from `@/components/ui/toaster` |
| `Breadcrumb` components | `staticData.crumb` and loader `{ crumb }` |
| Sidebar components | `AppShell` navigation groups |

### Utility Classes To Tokens

Map by role first; the kit is denser than Tailwind's defaults.

| Tailwind | Token |
|---|---|
| `p-1`, `gap-1` (4 px) | `space.xs` |
| `p-2`, `gap-2` (8 px) | `space.sm` |
| `p-3` (12 px) | `space.md` |
| `p-4` (16 px) | `space.lg` |
| `p-5` (20 px) | `space.xl` |
| `p-6` (24 px) | `space.xxl` |
| `p-8` (32 px) | `space.xxxl` |
| `text-xs` labels, metadata | `font.sm` |
| `text-sm` body, cells, controls | `font.md` |
| `text-base` section titles | `font.lg` |
| `text-xl`, `text-2xl` page titles | `font.xxl` |
| `font-medium`, `font-semibold` | `font.medium`, `font.semibold` |
| `rounded`, `rounded-md` | `radius.sm`, `radius.md` |
| `rounded-lg`, `rounded-xl` | `radius.lg`, `radius.xl` |
| `bg-background` | `color.page` |
| `bg-card`, `bg-popover` | `color.raised`, `color.overlay` |
| `bg-muted`, `bg-secondary` | `color.subtle` |
| `text-foreground` | `color.text` |
| `text-muted-foreground` | `color.textMuted` |
| `border`, `border-input` | `color.border` |
| `bg-primary`, `text-primary-foreground` | `color.accent`, `color.onAccent` |
| `destructive`, `danger` | `color.danger`, `color.dangerMuted`, `color.dangerBorder` |
| `h-9`, `h-10` controls | Kit control sizes; do not size controls in pages |
| `cn(a, cond && b)` | `stylex.props(styles.a, cond && styles.b)` |
| `tv({ variants })`, `cva` | One `stylex.create` map per variant axis |

### Libraries

| Legacy | Kit |
|---|---|
| visx, recharts, hand-rolled SVG charts | Aperture widgets with the chart host bridge (`charts.md`). Keep the data aggregation in the feature; replace only the rendering. |
| zod schemas | Effect Schema in `features/<name>/schemas.ts`. Validate with `Schema.toStandardSchemaV1(schema)` in server functions, forms, and `validateSearch`. |
| react-hook-form | TanStack Form (`data.md`, Forms) |
| heroicons, other icon sets | lucide-react |
| `createServerFn` handlers that call services directly, or `.inputValidator` | `.validator(Schema.toStandardSchemaV1(...))` and a dynamic import of a `.server.ts` module that calls `runServerFn` |
| `Context.Tag`, `Effect.Service` | `Context.Service` with a static `layer` |
| Hand-written `validateSearch` functions | Effect Schema with defaults and `stripSearchParams` |
| `motion` or framer-motion transitions | StyleX keyframes with reduced-motion overrides; remove decorative motion |

## 6. Remove Legacy UI

When no route imports from the legacy folder:

1. Delete the legacy folder and the old global stylesheet import.
2. Remove the Tailwind config and PostCSS config if nothing else uses them.

## 7. Remove Replaced Libraries

Run the `bun remove` command `doctor` prints under `forbidden-dependencies`.
Then run the full gates in `review.md`. The upgrade is complete when `doctor`
has no `FAIL` rows and the rendered checks pass.

## Apps On Another Framework

Do not convert a Next.js, Remix, or Vite SPA app in place. The routing,
data-loading, and server models differ too much for a page-by-page swap.

1. Create a new app with `new`.
2. Port the server logic first. Effect services, schemas, and repositories move with few changes; wrap their entry points in server functions that call `runServerFn`.
3. Port one route at a time with the kit, starting with the most-used page.
4. Run both apps side by side until the new app covers every route, then switch traffic.

Ask the user before starting this path. It is a project, not a refactor.
