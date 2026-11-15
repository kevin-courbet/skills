---
id: internal-app-migration-map
topic: internal-app
summary: The kit component, the token, or the library that replaces each legacy component, Tailwind utility class, and library when an app moves onto the kit.
keywords: [migration map, legacy component, replace shadcn, intentui, tailwind class, utility classes, tailwind to stylex, tailwind to tokens, cn, cva, tv, p-4, text-sm, bg-muted, replace recharts, replace zod, replace react-hook-form, replace framer-motion, Context.Tag, Effect.Service, inputValidator]
related: [internal-app-upgrade, internal-app-framework-port, internal-app-stack, internal-app-tokens]
---

# Internal App Migration Map

These tables give the replacement for each legacy part of an app that moves onto the kit. Run `docs <Id>` for the rules of each kit component.

## Components

| Legacy | Kit |
|---|---|
| shadcn or IntentUI `Button` | `Button` with `intent`: `default` becomes `primary`, `secondary` and `outline` become `secondary`, `ghost` stays `ghost`, and `destructive` becomes `danger`. For `link`, use `LinkButton` for navigation and a router `Link` for an inline link. |
| `Input`, `Label`, `FormItem`, `FormMessage` | `TextField` with `label`, `description`, and `errorMessage` |
| `Textarea` | `TextField multiline` |
| `Select`, `ResponsiveSelect` | `Select` for a short list, or `ComboBox` for a long list |
| `Command`, a searchable select | `ComboBox` |
| `Checkbox`, `Switch`, `RadioGroup` | `Checkbox`, `Switch`, `RadioGroup` |
| `Calendar`, a date picker | `DatePicker` with ISO strings |
| `Dialog`, `Modal`, `AlertDialog` | `Dialog`, and `ConfirmDialog` for a destructive confirmation |
| `Sheet`, `Drawer` | `Sheet` |
| `DropdownMenu`, `ContextMenu` | `Menu` in `MenuTrigger` |
| `Popover` | `Popover` in `PopoverTrigger` |
| `Tooltip` | `Tooltip` in `TooltipTrigger` |
| `Tabs` | `Tabs` |
| `Table` and tables that a page renders by hand | `DataTable` |
| `Badge` | `Badge` |
| `Card` | `Card`, or no container when the spacing makes the group |
| `Skeleton`, spinners | `Skeleton`, `Spinner`, and none for SSR data |
| `Alert`, callouts | `Alert` |
| Toast and Sonner wrappers | `toast` from `@/components/primitives/toaster` |
| `Breadcrumb` components | `staticData.crumb` and the loader `{ crumb }` |
| Sidebar components | The navigation groups of `AppShell` |

## Utility Classes To Tokens

Map each class by its role first. The kit is denser than the defaults of Tailwind. [[internal-app-tokens]] gives the role of each token.

| Tailwind | Token |
|---|---|
| `p-1`, `gap-1` (4 px) | `space.xs` |
| `p-2`, `gap-2` (8 px) | `space.sm` |
| `p-3` (12 px) | `space.md` |
| `p-4` (16 px) | `space.lg` |
| `p-5` (20 px) | `space.xl` |
| `p-6` (24 px) | `space.xxl` |
| `p-8` (32 px) | `space.xxxl` |
| `text-xs` labels and metadata | `font.sm` |
| `text-sm` body, cells, and controls | `font.md` |
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
| `h-9`, `h-10` controls | The sizes of the kit controls. Do not set the size of a control in a page. |
| `cn(a, cond && b)` | `stylex.props(styles.a, cond && styles.b)` |
| `tv({ variants })`, `cva` | One `stylex.create` map for each variant axis |

## Libraries

[[internal-app-stack#replaced-libraries]] lists each library that `check` and `doctor` reject. This table tells how to move the code.

| Legacy | Kit |
|---|---|
| visx, recharts, SVG charts written by hand | Aperture widgets with the chart host bridge ([[internal-app-charts]]). Keep the aggregation of the data in the feature, and replace only the rendering. |
| zod schemas | Effect Schema in `features/<name>/schemas.ts`. Validate with `Schema.toStandardSchemaV1(schema)` in server functions, forms, and `validateSearch`. |
| react-hook-form | TanStack Form ([[internal-app-form-submit]]) |
| heroicons and other icon sets | lucide-react |
| `createServerFn` handlers that call services directly, or `.inputValidator` | `.validator(Schema.toStandardSchemaV1(...))` and a dynamic import of a `.server.ts` module that calls `runServerFn` ([[internal-app-server-functions]]) |
| `Context.Tag`, `Effect.Service` | `Context.Service` with a static `layer` ([[internal-app-effect-services]]) |
| `validateSearch` functions written by hand | Effect Schema with defaults and `stripSearchParams` ([[internal-app-routes]]) |
| `motion` or framer-motion transitions | StyleX keyframes with reduced-motion overrides ([[internal-app-motion]]). Remove the decorative motion. |
