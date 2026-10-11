# Components

Every interactive control is a thin StyleX skin over react-aria-components
(RAC). The kit ships the primitives below in `src/components/ui`. Compose
them; do not restyle them in an app. The `/design-kit` route renders all of
them through `KitShowcase` for visual checks.

## Primitives

All primitives take typed props, render visible labels, and accept a
`style?: StyleXStyles` prop where a parent needs to set width or margin.

### Actions

| File | Exports | Use |
|---|---|---|
| `button.tsx` | `Button`, `LinkButton` | Intents `primary`, `secondary` (default), `ghost`, `danger`. Sizes `sm`, `md`, `lg`. `iconOnly` needs `aria-label`. `LinkButton` is a router `Link`. `Button` accepts `type="submit"` and `form` for dialog footers. |
| `menu.tsx` | `Menu`, `MenuItem`, `MenuSeparator`, `MenuTrigger` | Row and overflow actions. `MenuItem` takes `icon`, `shortcut`, `isDestructive`. |
| `segmented-control.tsx` | `SegmentedControl` | Two to five views or modes of the same content. Typed `value` and `onChange`. |
| `tooltip.tsx` | `Tooltip`, `TooltipTrigger` | Short hints. Never the only place for required information. |
| `popover.tsx` | `Popover`, `PopoverTrigger` | Non-modal panel anchored to a trigger, such as a filter panel. |

### Fields

| File | Exports | Use |
|---|---|---|
| `field.tsx` | `field`, `control`, `inputText` styles | Shared label, description, error, and control box styles. `control.base` plus `control.textInput` style an input that is itself the box. `inputText.base` resets an input nested inside a box. Never put both on one element; the reset removes the box. `field.hiddenLabel` keeps a label for screen readers only. |
| `text-field.tsx` | `TextField` | Single line or `multiline`. |
| `number-field.tsx` | `NumberField` | Number value with locale formatting and right-aligned tabular figures. |
| `search-field.tsx` | `SearchField` | Search with a clear button; Escape clears. `hideLabel` only in dense toolbars. |
| `select.tsx` | `Select` | Single choice from a short fixed list. `options: { id, label, description? }[]`. |
| `combo-box.tsx` | `ComboBox` | Single choice from a long list; typing filters. `value` is an option id or `null`. |
| `date-picker.tsx` | `DatePicker` | Calendar date. `value` and `onChange` use ISO strings (`"2026-10-12"`) or `null`. |
| `radio-group.tsx` | `RadioGroup` | Up to about five visible choices that users compare. |
| `checkbox.tsx` | `Checkbox` | Independent on/off choices. Supports indeterminate. |
| `switch.tsx` | `Switch` | Settings that apply immediately. |
| `list-box.tsx` | `OptionList`, `ListOption` | Option list inside Select and ComboBox popovers. Not used directly in pages. |

### Data And Layout

| File | Exports | Use |
|---|---|---|
| `layout.tsx` | `Page`, `PageHeader`, `Section`, `Toolbar`, `Card`, `StatTile`, `DescriptionList`, `Kbd`, `Separator` | Page structure, filter rows, overview numbers, and read-only facts. `StatTile` deltas take `tone` when "down" is good. |
| `data-table.tsx` | `DataTable`, `DataTableColumn` | Server-sorted table on semantic `<table>` with `aria-sort`, sticky header, numeric columns, and an empty-state slot. |
| `pagination.tsx` | `Pagination` | Previous and next for server-paged lists. Renders nothing for one page. |
| `badge.tsx` | `Badge` | Status text: `neutral`, `accent`, `success`, `warning`, `danger`, `info`. |
| `breadcrumbs.tsx` | `Breadcrumbs` | Location in a hierarchy. The shell renders it from route data. |
| `tabs.tsx` | `Tabs`, `TabList`, `Tab`, `TabPanel` | In-page sections. Not for navigation between routes. |

### Feedback And Overlays

| File | Exports | Use |
|---|---|---|
| `alert.tsx` | `Alert` | Inline notice about the page or object: `info`, `success`, `warning`, `danger`. |
| `feedback.tsx` | `Skeleton`, `Spinner`, `EmptyState`, `ErrorState` | Client-side loading, resolved-empty data, and visible failures. |
| `dialog.tsx` | `Dialog`, `DialogTrigger` | Centered modal for short tasks. Sizes `sm`, `md`, `lg`. Footer through `actions(close)`. |
| `confirm-dialog.tsx` | `ConfirmDialog` | Confirmation for irreversible actions. Runs `onConfirm`, keeps the dialog open and shows the failure if it rejects. |
| `sheet.tsx` | `Sheet` | Edge panel for detail or editing next to page context. `side` `right` or `left`. |
| `toaster.tsx` | `Toaster`, `toast` | Toasts for failures with no inline place. `AppShell` mounts the toaster. |
| `overlay.tsx` | `overlay` styles | Shared popover surface and enter and exit motion. |

## Shell

`src/components/shell` holds the app frame:

- `AppDocument` renders `<html>`, `<head>`, and `<body>` with global CSS, theme wiring, the locale provider, and the router head and scripts. The root route renders it.
- `AppShell` renders the sidebar, the top bar with breadcrumbs and the theme switch, and the scrolling page region. Below the `md` breakpoint the sidebar moves into a left `Sheet` opened from the top bar. Props: `appName`, `nav`, optional `actions` for global top-bar actions such as a user menu.
- `AppDocument` owns theme presentation state through `ThemeContext`. Saving the cookie updates that state without refreshing application data. Theme save failures use classified toast feedback.
- `RouteError` retries queries that hold the failed error. For a retained loader error, it invalidates only the failed router match. Data refresh uses query-cache operations, and theme changes use presentation state.
- `nav` is `ReadonlyArray<NavGroup>`. A group has a `label` by user goal and `items` of `{ to, params?, label, icon, exact? }`. Use `params` with typed dynamic routes. `icon` is a lucide component. Set `exact: true` on the index route.
- `RouteBreadcrumbs` reads `staticData.crumb` from each matched route. A loader can return `{ crumb }` to use a record name. Give a parent a layout route (`items/route.tsx`) when its children need the parent crumb.
- `RouteError` and `RouteNotFound` are the router defaults. An invalid search param shows a reset action.

Example `_app.tsx` navigation:

```tsx
const nav: ReadonlyArray<NavGroup> = [
  { label: "Workspace", items: [
    { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/items", label: "Items", icon: Package },
  ] },
  { label: "System", items: [{ to: "/settings", label: "Settings", icon: Settings }] },
];
```

## Page Patterns

The template contains one working example of each:

| Pattern | Template route | Structure |
|---|---|---|
| Overview | `_app/index.tsx` | `PageHeader`, `StatTile` grid, `TrendChart` in a `Section`. |
| List | `_app/items/index.tsx` | `PageHeader` with one primary action, `Toolbar` with `SearchField` and `Select`, `DataTable`, `Pagination`. Filters live in the URL. |
| Detail | `_app/items/$itemId.tsx` | `Page width="reading"`, `PageHeader` with quiet actions, `DescriptionList` in a `Section`, `ConfirmDialog` for delete. |
| Create | `features/items/ui/create-item-dialog.tsx` | `Dialog` with a TanStack Form; the footer submit button uses `form={formId}`. |
| Settings | `_app/settings.tsx` | Reading-width page with `Section` and `DescriptionList`. |

Choose the container by task:

- Short creation or edit (up to about six fields): `Dialog`.
- Detail or edit that benefits from the list behind it: `Sheet`.
- Long forms or multi-section records: a dedicated route.
- Irreversible actions: `ConfirmDialog` that names the object and the consequence. The confirm label repeats the verb ("Delete item"). The `danger` intent is for that button, not for the entry point.

## Composition Rules

- One primary button per view. Secondary actions are `secondary` or `ghost`.
- Labels are quieter than values. Section titles are quieter than content.
- Use `Card` only for distinct, comparable, or actionable groups.
- Tables: text left, numbers right with tabular figures, sort state announced, row names link to the detail route.
- Status uses `Badge` with text. Color only supports it.
- Numbers and dates use `src/lib/locale.ts`. Use relative dates with a reference time returned by the loader.
- `StatTile` grids collapse to one column below `media.sm`.

## States

- SSR-loaded data renders directly. No skeleton, no spinner.
- `Skeleton` only for client-triggered loads that take longer than about 300 ms.
- During a quiet refetch, show a small "Updating" text or nothing. Never blank the table.
- `EmptyState` only after data resolved to zero rows. A filtered-to-zero result gets a "Clear filters" action.
- `ErrorState` for failures. Route failures render `RouteError`.

## Writing

- Sentence case for every label, heading, button, and menu item.
- Buttons name the action: "Create item", "Save changes", "Delete 3 items".
- Descriptions state the consequence: "Items appear in the list as soon as they are saved."
- Errors state the problem and the next action: "The bank rejected the file. Check the account number and run it again."
- Omit success toasts when the UI already shows the result.

## Icons

- `lucide-react` only, imported by name.
- Size icons with StyleX (`size.icon` 16 px, `size.iconSm` 14 px) or `width` and `height` props of 16.
- Decorative icons get `aria-hidden`. Icon-only buttons get `aria-label`.
- Use the same icon for the same concept across the app.

## Adding A Primitive

Primitives live in this skill, not in an app. When a page needs a control the
kit does not have:

1. Scaffold a working copy with `new`, then build the primitive in `src/components/ui` on the matching RAC component with StyleX tokens and `renderStyles`.
2. Add it to `KitShowcase` in all its states, and to the inventory above.
3. Run `bun run build`, `bun run tsc`, `bun run lint`, `check`, and capture `/design-kit` in both themes.
4. Copy the file into `assets/template/src`, add its path to `assets/kit.json`, and run `bash scripts/validate-skills` in the skills repository.
5. In each app, run `sync --write`.
