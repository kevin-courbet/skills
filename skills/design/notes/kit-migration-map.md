---
id: kit-migration-map
topic: kit
summary: The kit component, the token, or the library that replaces each legacy component, Tailwind utility class, and library when an app moves onto the kit, with every library that design check and design doctor reject.
keywords: [migration map, legacy component, replace shadcn, intentui, tailwind class, utility classes, tailwind to stylex, tailwind to tokens, cn, cva, tv, p-4, text-sm, bg-muted, replaced libraries, forbidden library, forbidden dependency, replace recharts, replace zod, replace react-hook-form, replace framer-motion, radix, base ui, cmdk]
related: [kit-update, kit-check-rules, kit-tokens]
---

# Kit Migration Map

These tables give the replacement for each legacy part of an app that moves onto the kit. Run `design docs <Id>` for the rules of each kit component.

## Components

| Legacy | Kit |
|---|---|
| shadcn or IntentUI `Button` | `Button` with `intent`: `default` becomes `primary`, `secondary` and `outline` become `secondary`, `ghost` stays `ghost`, and `destructive` becomes `danger`. For `link`, use `LinkButton` for navigation that looks like a button, and `TextLink` for a link in text. |
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
| `Toggle` | `ToggleButton`, and `ToggleGroup` for several options of the same kind |
| `ScrollArea` | `ScrollShadow`, or the native scroll of the element when no edge needs a fade |
| Styled `<a>` elements and `Link` wrappers | `TextLink`, with `to` for a route or `href` for an external page |
| `Table` and tables that a page renders by hand | `DataTable` for records that people sort, filter, page, or open. `Table` for a small read-only table of up to about 20 rows, such as the line items of an estimate with a total. |
| `Badge` | `Badge` |
| `Card` | `Card`, or no container when the spacing makes the group |
| `Skeleton`, spinners | `Skeleton`, `Spinner`, and none for SSR data |
| `Progress`, a circular progress | `ProgressBar`, or `ProgressCircle` in a table row or another narrow place |
| `Alert`, callouts | `Alert` |
| Toast and Sonner wrappers | `toast` from `@/components/primitives/toaster` |
| `Breadcrumb` components | `staticData.crumb` and the loader `{ crumb }` |
| Sidebar components | The navigation groups of `AppShell` |

## Utility Classes To Tokens

Map each class by its role first. The kit is denser than the defaults of Tailwind. [[kit-tokens]] gives the role of each token.

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

`design check` and `design doctor` fail when an app installs or imports one of these libraries. The rules are `forbidden-dependency` and `forbidden-import`. The lists `forbiddenDependencies` and `forbiddenDependencyPrefixes` in `assets/kit.json` are the source. An import of a subpath, such as `zod/v4`, also fails.

| Replaced | Use instead |
|---|---|
| `tailwindcss`, `@tailwindcss/*`, `clsx`, `tailwind-merge`, `tailwind-variants`, `class-variance-authority` | StyleX `create` and `props`, and one `stylex.create` map for each variant axis ([[kit-stylex]]) |
| `styled-components`, `@emotion/*`, `@vanilla-extract/*` | StyleX with tokens ([[kit-stylex]]) |
| `@stylexjs/postcss-plugin`, `@stylexjs/babel-plugin` | `@stylexjs/unplugin`, the one StyleX compiler of the kit |
| shadcn/ui and IntentUI code, `@radix-ui/*`, `@base-ui-components/*`, `@base-ui/*`, `cmdk` | Kit components on react-aria-components. The table of components above gives each one. `CommandPalette` replaces `cmdk`. |
| `react-hook-form`, `@hookform/*` | TanStack Form with the kit form helpers ([[kit-forms]]) |
| `zod`, `valibot`, `@tanstack/zod-adapter` | Effect Schema. Give it to a form or to a router through `Schema.toStandardSchemaV1(schema)`. |
| `recharts`, `@visx/*`, SVG charts written by hand | Aperture widgets with the chart host bridge ([[kit-charts]]). Keep the aggregation of the data in the feature, and replace only the rendering. |
| `@heroicons/*`, `@phosphor-icons/*`, `react-icons` | lucide-react ([[kit-icons]]) |
| `motion`, `framer-motion` | StyleX keyframes with reduced-motion overrides ([[kit-motion]]). Remove the decorative motion. |
| `react-virtuoso` | `@tanstack/react-virtual`. `DataTable` with `virtualize`, and `LogViewer`, already use it. |

To remove a library, first replace each use of it. Then run the `bun remove` command that `design doctor` prints under `forbidden-dependencies`.
