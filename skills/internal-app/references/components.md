# Components

Every interactive control is a thin StyleX skin over react-aria-components
(RAC). The kit ships the primitives below in `src/components/ui`. Compose
them; do not restyle them in an app. The `/design-kit` route renders all of
them through `KitShowcase` for visual checks; `OperationsShowcase`
(`src/components/kit/showcase-operations.tsx`) shows the filter, status,
pipeline, activity, and detail-card patterns; `WorkspaceShowcase`
(`src/components/kit/showcase-workspace.tsx`) shows traces, boards, trees,
sortable lists, code, calendars, schedules, and panels; and `ControlsShowcase`
(`src/components/kit/showcase-controls.tsx`) shows items, field add-ons,
toggles, sliders, hover cards, and context menus.

Several primitives re-implement the behavior and design of free ReUI
components. `THIRD_PARTY_NOTICES.md` in this skill lists them with the ReUI
license. `references/reui-coverage.md` records which ReUI components the kit
covers and why the others are left out.

## Primitives

All primitives take typed props, render visible labels, and accept a
`style?: StyleXStyles` prop where a parent needs to set width or margin.

### Actions

| File | Exports | Use |
|---|---|---|
| `button.tsx` | `Button`, `LinkButton`, `ButtonGroup` | Intents `primary`, `secondary` (default), `ghost`, `danger`. Sizes `sm`, `md`, `lg`. `iconOnly` needs `aria-label`. `LinkButton` is a router `Link`. `Button` accepts `type="submit"` and `form` for dialog footers. `ButtonGroup` joins buttons into one control with a `label`: a split button (an action and a `MenuTrigger` with an icon-only Button), zoom out and in, or previous and next. Use one intent in a group. |
| `menu.tsx` | `Menu`, `MenuItem`, `MenuSeparator`, `MenuTrigger`, `ContextMenu` | Row and overflow actions. `MenuItem` takes `icon`, `shortcut`, `isDestructive`. In a `Menu` with `selectionMode`, each item shows a check mark when selected. `ContextMenu` wraps an area, such as a list row or a card, and opens its `menu` items at the pointer on a right click, or at the focused element with Shift+F10 or the context menu key. Give each `MenuItem` an `id` and handle `onAction`. Every action must also be reachable from a visible control, such as a row menu button. |
| `toggle-group.tsx` | `ToggleGroup`, `ToggleOption` | Buttons that each turn an option on or off, such as the days a job runs or the channels that get an alert. `value` is the array of pressed ids. A pressed text option shows a check mark; `iconOnly` keeps the labels as accessible names. For one choice among views, use `SegmentedControl`. |
| `hover-card.tsx` | `HoverCard`, `HoverCardLink` | A preview that opens on hover, focus, or long press, such as a person or a record named in a table. The trigger is a `HoverCardLink` (an inline link with an optional `href`) or a kit `Button`. The card may hold links and buttons; never put information there that the page does not show or link to. |
| `command-palette.tsx` | `CommandPalette`, `useCommandPalette`, `Command`, `CommandGroup` | Search for pages and app actions in a modal. `AppShell` mounts the only palette and binds Command-K and Control-K. A `Command` has `href` or `onAction`, never both, plus optional `icon`, `keywords`, and `shortcut`. `useCommandPalette().open()` opens it from a page. |
| `segmented-control.tsx` | `SegmentedControl` | Two to five views or modes of the same content. Typed `value` and `onChange`. `size="sm"` matches the 28px controls of a compact toolbar. |
| `tooltip.tsx` | `Tooltip`, `TooltipTrigger` | Short hints. Never the only place for required information. |
| `copy-button.tsx` | `CopyButton` | Icon button next to an identifier or URL. A check mark confirms the copy; a refused clipboard shows an error toast. |
| `popover.tsx` | `Popover`, `PopoverTrigger` | Non-modal panel anchored to a trigger, such as a filter panel. |

### Fields

| File | Exports | Use |
|---|---|---|
| `field.tsx` | `field`, `control`, `inputText` styles | Shared label, description, error, and control box styles. `control.base` plus `control.textInput` style an input that is itself the box. `inputText.base` resets an input nested inside a box. Never put both on one element; the reset removes the box. `field.hiddenLabel` keeps a label for screen readers only. |
| `text-field.tsx` | `TextField` | Single line or `multiline`. `hideLabel` where a `SettingRow` already names the field. `prefix` and `suffix` put content inside the box of a single-line field: a fixed part of the value ("https://", ".example.com"), a lucide icon, a `Kbd` hint, a `Spinner` while a value is checked, or one small button such as a `CopyButton`. |
| `number-field.tsx` | `NumberField` | Number value with locale formatting and right-aligned tabular figures. `unit` shows a unit after the number ("seconds", "%"); use `formatOptions` for currency. `showStepper` adds decrement and increment buttons; arrow keys step without them. `hideLabel` in a `SettingRow`. |
| `time-field.tsx` | `TimeField` | Time of day, such as a daily run time. `value` and `onChange` use ISO time strings (`"02:00"`) or `null`; `granularity="second"` adds seconds. `minValue` and `maxValue` mark earlier or later times as invalid. `zoneLabel` names the time zone after the time, such as "UTC". Type the digits or use the arrow keys on each part. |
| `slider.tsx` | `Slider`, `RangeSlider` | A number or a range picked on a track, such as a sampling rate, a threshold, or a latency band. `minValue`, `maxValue`, `step`, and `formatOptions` for the value text; `marks` labels values under the track. `RangeSlider` takes `thumbLabels` for the two thumbs. Arrow keys step, Page Up and Page Down move a tenth, Home and End jump to the ends. Use `NumberField` when people type exact values. |
| `search-field.tsx` | `SearchField` | Search with a clear button; Escape clears. `hideLabel` and `size="sm"` in a compact toolbar. `focusShortcut` binds "/" to the main list search. |
| `select.tsx` | `Select` | Single choice from a short fixed list. `options: { id, label, description? }[]`. `hideLabel` and `size="sm"` in a compact toolbar. |
| `combo-box.tsx` | `ComboBox` | Single choice from a long list; typing filters. `value` is an option id or `null`. |
| `date-picker.tsx` | `DatePicker` | Calendar date. `value` and `onChange` use ISO strings (`"2026-10-12"`) or `null`. |
| `date-range-picker.tsx` | `DateRangePicker`, `DateRange` | Start and end date in one field, such as a report period. `value` is `{ start, end }` with ISO strings, or `null`. `presets` lists quick ranges next to the calendar; compute them from a stable reference date. |
| `multi-select.tsx` | `MultiSelect` | Several choices from a fixed list. `value` is an array of option ids. The trigger names the first choice and counts the rest. `showTags` lists the choices as removable tags under the field in forms. |
| `tag-group.tsx` | `TagGroup` | A labeled set of short values, such as labels or recipients. `onRemove` adds remove buttons and Delete-key removal. For list filters, use `Filters`. |
| `cascader.tsx` | `Cascader`, `CascaderOption` | Single choice from a tree, such as region, country, and city. `value` is the path of ids from the root, or `null`. Columns open as people move: arrow keys move in a column, Right opens a branch, Left goes back, Enter chooses. `allowsBranchSelection` lets a branch be the value. A search box finds options at every level; it shows by default above 12 options. |
| `file-upload.tsx` | `FileUpload`, `UploadFile` | Drop zone with a file dialog button and the chosen files. It only selects files: the app validates and uploads them and passes each file's `status` (`queued`, `uploading` with `progress`, `done`, `failed` with `error`). `acceptedFileTypes` takes exact MIME types. |
| `radio-group.tsx` | `RadioGroup` | Up to about five visible choices that users compare. |
| `checkbox.tsx` | `Checkbox` | Independent on/off choices. Supports indeterminate. |
| `switch.tsx` | `Switch` | Settings that apply immediately. |
| `list-box.tsx` | `OptionList`, `ListOption` | Option list inside Select, MultiSelect, ComboBox, and Filters popovers. An option with `intent` shows a status dot. Not used directly in pages. |
| `calendar.tsx` | `DateSegments`, `CalendarButton`, `CalendarHeader`, `RangeCalendarView`, `calendar` styles | Shared parts of DatePicker, DateRangePicker, and the Filters date editor. Not used directly in pages. |

### Data And Layout

| File | Exports | Use |
|---|---|---|
| `layout.tsx` | `Page`, `PageHeader`, `Section`, `Toolbar`, `Card`, `CardSection`, `StatTile`, `StatStrip`, `DescriptionList`, `SettingsCard`, `SettingRow`, `Code`, `Kbd`, `Separator` | Page structure, filter rows, overview numbers, and read-only facts. `Card` takes `title`, `description`, `actions` (a total, a link, or one button), and `footer`; `layout="sections"` stacks `CardSection` rows divided by lines (see Cards below). `StatTile` deltas take `tone` when "down" is good; `chart` takes the kit `Sparkline` (`src/components/charts/sparkline.tsx`) and `footnote` names the source. `StatStrip` is a divided row of key facts for detail headers and peeks; `variant="status"` shows one status word per cell with a `detail` line (CI, artifact, traffic), and `framed={false}` drops its border inside a `CardSection`. `DescriptionList layout="grid"` puts labels above values in columns for the key facts of a record; an item with `span="wide"` takes two columns. `SettingsCard` with `SettingRow` puts the label left and the value or control right. `Toolbar density="compact"` goes inside a `DataTable`; its `actions` hold trailing icon buttons. `Code` shows inline code and commands. |
| `data-table.tsx` | `DataTable`, `DataTableColumn`, `DataTableSelection`, `DataTableExpansion`, `DataTablePinning`, `DataTablePagination`, `DataTableRowAction`, `DataTableColumnVisibility`, `TwoLineCell`, `MeterCell` | Server-sorted table on semantic `<table>` with `aria-sort`, sticky header, numeric columns, and an empty-state slot. `toolbar` renders a compact `Toolbar` inside the frame. `rowAction` opens a row: `{ link: (row) => ({ to, params }) }` or `{ onAction }`. The `rowHeader` column (default: the first data column) becomes a `<th scope="row">` with that link or button, so Tab and Enter open the row, and a click anywhere else on the row does the same. `pinnedColumns={{ start, end }}` keeps columns in view while the table scrolls sideways, such as the name and a row menu. `expansion` adds a toggle column and a full-width detail row. `density="compact"` uses 28px rows. `isLoading` shows `loadingRows` skeleton rows for client-triggered loads. `pagination` adds a footer in the frame with the row range, page buttons, and rows per page. A column `footer` adds a summary row. `activeRowId` marks the row open in a peek. `selection` adds a checkbox column and a bulk-action bar that replaces the toolbar while rows are selected. `columnVisibility` adds a column menu. `resizableColumns` adds drag and arrow-key handles on header edges; set `size` on each column. `virtualize={{ visibleRows }}` renders only the rows in view; it cannot combine with `expansion`. `TwoLineCell` holds a primary line and a quiet second line. `MeterCell` adds a bar that compares a number with the column maximum. |
| `pagination.tsx` | `Pagination` | Previous and next for server-paged lists that are not tables, such as card grids. Tables use the `DataTable` `pagination` footer. Renders nothing for one page. |
| `badge.tsx` | `Badge`, `StatusDot` | Status text: `neutral`, `accent`, `success`, `warning`, `danger`, `info`. `appearance` is `subtle` (default), `solid` for counts, or `outline` for a quiet tag; `size` `sm`, `md`, `lg`; `shape="pill"`; `icon` before the text. `StatusDot` is the dense form for table cells, lists, and detail headers: a dot and the text, `detail` adds a secondary line ("Build · 1m 12s"), and `isActive` pulses the dot for work in progress. |
| `filters.tsx` | `Filters` | Chip bar filter builder for a list. "Add filter" walks field, operator (only when the field has more than one), and value, and adds only complete filters. Field kinds: `select`, `multiSelect` (the chip names every value, "Failed, Building"), `text`, and `dateRange` with presets. Each chip changes its operator and value in place and has a remove button; "Clear all" removes all. One filter per field. Keyboard-complete. Define fields and the URL codec with `src/lib/filter-params.ts` (see Filters in the URL). |
| `identifier.tsx` | `Identifier` | Monospaced record ID, SHA, or host with a `CopyButton`. `display` shows a short form, such as a 7-character SHA, and copies the full `value`. `size` `sm`, `md`, `lg` (a detail page title); `muted` next to a name. |
| `breadcrumbs.tsx` | `Breadcrumbs` | Location in a hierarchy. The shell renders it from route data. |
| `tabs.tsx` | `Tabs`, `TabList`, `Tab`, `TabPanel` | In-page sections. Not for navigation between routes. |
| `disclosure.tsx` | `Disclosure`, `Accordion` | `Disclosure` shows and hides one section, such as advanced settings or a raw payload. `Accordion` frames several `Disclosure` rows; one opens at a time unless `allowsMultipleExpanded`. Use `Tabs` when people compare sections. |
| `timeline.tsx` | `Timeline`, `TimelineEvent` | Activity or audit feed, newest first. Each event has an `icon` for its type, a one-sentence `title`, an `actor` (an avatar and the name; `isSystem` shows the name only), a `time` (`label` such as "3h ago", `dateTime`, and an exact `title`), and an optional `description` and trailing `meta` link. Items are neutral; `tone` tints the icon of an event that needs attention, such as a failure. `kind` names the event type for screen readers. For steps with a status, use `Stepper` with `mode="status"`. |
| `stepper.tsx` | `Stepper`, `SegmentedProgress`, `StepStatus`, `stepStatusDisplay` | `Stepper` shows steps in order. `mode="wizard"` (default) shows the position in a multi-step task: steps before `currentStep` show as complete and `onStepPress` lets people go back to them. `mode="status"` shows steps that run on their own, such as pipeline stages: each step has a `status` (`pending`, `running`, `success`, `failed`, `skipped`, `cancelled`), a `duration`, and an optional `note`. With `onSelectionChange`, status steps are a radio group: arrow keys move, Space or Enter selects, and the selected step drives the detail below, such as its logs. `orientation` is `horizontal`, `vertical`, or `responsive` (vertical below `media.md`). `SegmentedProgress` is the compact form for cards and table rows: one colored segment per step and the current step in words ("Test · Failed · 27s"). |
| `log-viewer.tsx` | `LogViewer`, `LogLine` | Monospaced output with line numbers, an aligned source column (such as the stage), times in the app time zone, an "All" and "Warnings and errors" switch when the output has them, search with match highlights, and a footer with the line count. Warning and error lines show their level in words. It renders only the lines in view, opens at the first error, and `follow` keeps the newest line in view during a stream. `title` starts the header row; `filters` holds more controls; `downloadName` adds a download button; `footerEnd` holds run details. `variant="embedded"` fills a `CardSection` with `padding="flush"`. Pass `query`/`onQueryChange` and `level`/`onLevelChange` to keep them in the URL. |
| `avatar.tsx` | `Avatar`, `AvatarGroup` | A person or service account: image with initials when it is missing. `size="xs"` sits inline in a metadata line. `AvatarGroup` overlaps avatars and counts the rest. Show the name in text where it matters. |
| `item.tsx` | `ItemList`, `Item` | Rows of records that people scan and act on one at a time, such as integrations, members, or connected accounts. An `Item` has `media` (an `IconTile` or an `Avatar`), a `title`, a quiet `description`, trailing `meta` (a `Badge`, a count, or a date), and `actions` (a `Switch`, a button, or a row menu). `onAction` opens the item: the title becomes a button and a click anywhere else on the row does the same. `size="sm"` in a sheet or popover. `ItemList` divides the rows; `framed={false}` inside a `Card`. Use `DataTable` when people compare values across rows. |
| `icon-tile.tsx` | `IconTile` | An icon on a small surface, such as the media of an `Item` or the icon of an `EmptyState`. `tone` (default `neutral`), `variant` `soft` (default), `solid`, or `outline`, `size` `sm` 24px, `md` 32px, `lg` 40px, and `shape="circle"`. It is decorative: the text next to it carries the meaning. |
| `file-type-icon.tsx` | `FileTypeIcon`, `fileTypeOf`, `FileType` | The family icon of a file on an `IconTile`, from its name, path, or URL, or its MIME type: spreadsheet, data, code, document, image, video, audio, archive, key or certificate, log, or file. Names without an extension, such as `Dockerfile` or `.env.local`, resolve by name. Show the file name next to it. |
| `scrollspy.tsx` | `Scrollspy`, `ScrollspyItem` | Links to the sections of a long page, such as settings or a record with many parts. Each item names a section `id` on the page. The link of the section in view has `aria-current="location"` and the selected surface. A link scrolls its section into view (instantly under reduced motion) and moves focus to it. `orientation="horizontal"` for a bar above the sections; `offset` leaves room for a sticky bar. |

### Runs, Boards, And Schedules

`WorkspaceShowcase` (`src/components/kit/showcase-workspace.tsx`) shows each
primitive below on the `/design-kit` route.

| File | Exports | Use |
|---|---|---|
| `trace.tsx` | `Trace`, `TraceStep`, `TraceStatus`, `SpanWaterfall`, `TraceSpan` | `Trace` is a run as a column of quiet step lines: agent turns, CI jobs, checks, and imports. Each step has an `icon`, a `title` that says what happened, a `status` (`done` default, `running`, `failed`, `pending`, `skipped`), a `meta` such as a duration, and an optional `badge`. A step with `detail` or child `steps` opens in place; `expandedIds` with `onExpandedChange` controls which steps are open, such as the running one. Screen readers hear the status word before the title. `SpanWaterfall` shows a distributed trace: spans nest under their parent on a shared time axis, arrow keys move between spans and open or close them, and the selected span shows its duration, self time, start, status, and `attributes` below. The span with the most self time shows its share of the trace. Use `Stepper mode="status"` for a short fixed pipeline and `Timeline` for an audit feed. |
| `kanban.tsx` | `Kanban`, `KanbanColumn`, `KanbanMove` | Cards that people move between stages, such as incidents or requests. `columns` names each stage with an optional `icon` and a work-in-progress `limit` (the count turns to a warning above it). `value` maps each column id to its items in order; `onChange` receives the next value and the `KanbanMove`. Apply the move optimistically, persist it, and on failure restore the previous value and show an error toast. `renderItem` draws the card content (a title and two or three facts); `getItemLabel` names the card for typeahead and drag announcements; `onItemAction` opens a card on click or Enter. Drag with the pointer, or focus the grip and press Enter, Tab to a column, arrow to a place, and press Enter. `columnActions` adds header content such as an add button. Columns scroll sideways on narrow screens. Column order is fixed. |
| `tree.tsx` | `Tree`, `TreeNode`, `TreeSelection`, `TreeMove`, `moveTreeNodes` | A hierarchy of records, such as folders, categories, an org chart, or permissions. Each node has a `label`, an optional `icon` and `openIcon`, a quiet `description`, trailing `meta`, and `children`. Arrow keys move between rows, Right and Left open and close a branch. `selection` is `{ mode: "single", value, onChange }` for the open record, or `{ mode: "checkbox", value, onChange }` with leaf ids: a branch checkbox selects or clears every leaf under it and shows a dash when only some are selected. `onAction` opens a node. `onMove` enables drag and drop to reorder and nest nodes; apply the move with `moveTreeNodes` and persist it. `guides` (on by default) draws the level lines. Pass `expandedIds` and `onExpandedChange` to keep open branches in the URL. |
| `sortable-list.tsx` | `SortableList`, `SortableMove` | A list people put in order, such as an escalation chain, a column order, or dashboard widgets. `onReorder` receives the items in their new order and the `SortableMove`; apply it optimistically, persist it, and restore the old order with an error toast if it fails. `renderItem` draws the row content, `itemActions` adds trailing controls such as a remove button, and `onItemAction` opens a row. `showPosition` numbers the rows for priority orders. `layout="grid"` wraps tiles. Drag by the grip, or focus the grip, press Enter, move with the arrow keys, and press Enter; Escape cancels. `framed={false}` drops the frame inside a `Card`. |
| `code-block.tsx` | `CodeBlock`, `CodeLanguage`, `CodeDiagnostic`, `CodeLineSpec` | Read-only config, payloads, queries, commands, and short output. `language` is `ts`, `tsx`, `js`, `json`, `sh`, `sql`, `yaml`, `diff` (the +/- prefixes mark lines), or `text`. `title` names the file or command in the header with a copy button and a wrap toggle; without a title the buttons pin to the corner. `highlightedLines` and `diff={{ added, removed }}` take line numbers and `[start, end]` ranges. `diagnostics` tint error and warning lines and show the message under the line, such as config validation. `maxLines` collapses long code behind "Show all N lines". `startLine` numbers an excerpt. `variant="embedded"` drops the border inside a `CardSection padding="flush"` or a `Trace` step. Use `LogViewer` for long or streaming logs and `Code` for inline values. |
| `event-calendar.tsx` | `EventCalendar`, `CalendarEvent`, `CalendarView` | Month, week, and agenda views of events, such as on-call shifts, maintenance windows, scheduled jobs, or bookings. An event has `start` and an exclusive `end` as ISO instants, or ISO dates with `allDay`; times show in the app time zone. `intent` colors the event; say the meaning in the `title` or `meta` too. `today` (and `now` for the week view's time line) come from the loader. Pass `date`/`onDateChange` and `view`/`onViewChange` to keep the period and view in the URL. `onEventAction` opens an event; `onDayAction` starts a new event from a focused day (Enter) or the add button of a week column. In the month view, arrow keys move between days, Home and End go to the week edges, and Page Up and Page Down change the month; a day with more than three events shows "N more" with the full list. Below `md` the month view shows dots and lists the events of the focused day. The week view packs overlapping events side by side and scrolls to `scrollToHour`. Recurrence, resources, and drag to reschedule are not supported: expand recurring events on the server. |
| `gantt.tsx` | `Gantt`, `GanttTask`, `GanttChange` | Tasks on a time line, such as a migration plan or a release schedule. A task has `start` and an inclusive `end` as ISO dates (like the `DateRangePicker` value), `progress` in percent, an `intent`, a quiet `meta` after the bar such as the owner, `milestone` for a one-day diamond, and `dependsOn` for arrows from the tasks that must finish first. `children` make a group whose bar spans its tasks and shows their combined progress. The task list is a tree with the names kept in view while the chart scrolls sideways; it opens with `today` in view. `scale` is `day` or `week`. `onTaskAction` opens a task. `onTaskChange` makes bars movable: drag a bar or its edges, or press Alt with the arrow keys on the selected task (Alt and Shift change the end); persist the change and update `tasks`. |
| `resizable-panels.tsx` | `ResizablePanels`, `ResizablePanel` | Panels people resize, such as a list beside its detail or a query above its results. `panels` give each panel an `id`, a `label` for the handle, a `defaultSize` in percent (all add up to 100), `minSize`, `maxSize`, and `content`. `orientation` is `horizontal` (side by side) or `vertical`. Each handle is a window splitter: drag it, or focus it and use the arrow keys (Shift for 10 percent), Home, and End. Pass `sizes` and `onSizesChange` to remember the layout. A panel's content can be another `ResizablePanels` with the other orientation. Set the height of a horizontal group with `style`. Frame the group yourself on a page; inside a `Card`, use `CardSection padding="flush"`. |

### Feedback And Overlays

| File | Exports | Use |
|---|---|---|
| `alert.tsx` | `Alert` | Inline notice about the page or object: `neutral`, `info`, `success`, `warning`, `danger`. The `title` wraps to as many lines as it needs and can hold inline `Code`; the body stays one flowing paragraph. `actions` sit at the end on wide screens and wrap under the text on narrow ones. `icon` replaces the intent icon, such as a pause icon for a held state. `onDismiss` adds a close button. `announce` sets `role="status"` or `role="alert"` for notices that appear after the page loaded. |
| `progress-bar.tsx` | `ProgressBar` | Progress of a task that finishes, such as an import. `isIndeterminate` while the total is unknown. `valueLabel` replaces the percentage, for example "3 of 12 files". |
| `meter.tsx` | `Meter` | A level within a range, such as quota or disk use. `warningAt` and `dangerAt` change the bar color; the value text carries the meaning. Use `MeterCell` in tables. |
| `feedback.tsx` | `Skeleton`, `Spinner`, `EmptyState`, `ErrorState` | Client-side loading, resolved-empty data, and visible failures. `Spinner` takes `size` `sm` (in a button or field), `md`, or `lg`. `EmptyState` takes a lucide `icon` shown on an `IconTile`, a `title`, a `description`, and an `action` (one primary button, or a primary and a secondary). `variant="dashed"` frames a first-run area on a page, such as "No webhooks yet"; `size="sm"` fits a card or a popover. |
| `dialog.tsx` | `Dialog`, `DialogTrigger` | Centered modal for short tasks. Sizes `sm`, `md`, `lg`. Footer through `actions(close)`. |
| `confirm-dialog.tsx` | `ConfirmDialog` | Confirmation for irreversible or high-impact actions. The `title` names the action and the object; the `description` states the result with the exact objects and can hold `Code`; `consequences` lists each further effect; `children` holds a choice the action needs, such as a `RadioGroup` of rollback targets, with `isConfirmDisabled` until it is complete. `intent="danger"` (default) for destructive steps, `primary` for actions people can undo. Runs `onConfirm`, keeps the dialog open and shows the failure if it rejects. |
| `sheet.tsx` | `Sheet` | Edge panel for detail or editing next to page context. `side` `right` or `left`. `size="peek"` opens a record over its list: `meta` holds the identifier and `CopyButton`, `headerActions` holds "Open page", and `navigation` adds previous and next buttons bound to k and j. |
| `toaster.tsx` | `Toaster`, `toast` | Toasts for failures with no inline place. `AppShell` mounts the toaster. |
| `overlay.tsx` | `overlay` styles | Shared popover surface and enter and exit motion. |

## Shell

`src/components/shell` holds the app frame:

- `AppDocument` renders `<html>`, `<head>`, and `<body>` with global CSS, theme wiring, the locale provider, and the router head and scripts. The root route renders it.
- `AppShell` renders the sidebar on the `frame` color and the page in a raised content panel inset by `size.frameGap`. The panel holds the top bar with breadcrumbs and scrolls on its own (`#main-content`); the router resets that element to the top on navigation. The sidebar has the brand block, collapsible navigation groups, and a footer with the `sidebarFooter` links and the theme switch. "Hide sidebar" gives the panel the full width, and the top bar then shows "Show sidebar". Below the `md` breakpoint the sidebar moves into a left `Sheet` opened from the top bar, and the panel loses its border and radius.
- `AppShell` props: `appName`; optional `environment`, a short context under the name such as "Preview"; `nav`; optional `actions` for global top-bar actions such as a user menu; optional `sidebarFooter` for quiet links such as help; optional `commands`, groups of app-wide actions for the command palette.
- `AppShell` mounts the `CommandPalette`. The top bar has a "Search" button with the shortcut hint, and Command-K or Control-K toggles the palette. The palette lists `commands` first, then every navigation item under its group label. Page-specific actions stay on their page.
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
| Overview | `_app/index.tsx` | `PageHeader`, `StatTile` grid with a source `footnote`, `TrendChart` in a `Section`. |
| List | `_app/items/index.tsx` | `PageHeader` with one primary action. `DataTable` with a compact `Toolbar` in its frame (`SearchField`, `Filters`), a row link to the detail route, the name column pinned, `StatusDot` status, a summary footer, and the `pagination` footer. Search, filters, sort, and page live in the URL; `features/items/filters.ts` holds the filter fields and builds the server query from the search. |
| Detail | `_app/items/$itemId.tsx` | `Page width="reading"`, `PageHeader` with quiet actions, `DescriptionList` in a `Section`, `ConfirmDialog` for delete. |
| Create | `features/items/ui/create-item-dialog.tsx` | `Dialog` with a TanStack Form; the footer submit button uses `form={formId}`. |
| Settings | `_app/settings.tsx` | Reading-width page with `SettingsCard` and `SettingRow`. Identifiers use `Code` with a `CopyButton`. |

Choose the container by task:

- Short creation or edit (up to about six fields): `Dialog`.
- Detail or edit that benefits from the list behind it: `Sheet`.
- Records read one after another from a list: `Sheet size="peek"` with `navigation` and an "Open page" link to the detail route. Keep the open record in a search param.
- Long forms or multi-section records: a dedicated route.
- Irreversible actions: `ConfirmDialog` that names the object and the consequence. The confirm label repeats the verb ("Delete item"). The `danger` intent is for that button, not for the entry point.

## Cards

A card holds its content directly. Do not put a card, a framed panel, or any
second bordered box inside a card.

- A card with one block of content: `<Card title="Activity">` and the content as children.
- A card with several blocks, such as facts, a status strip, a stepper, and logs: `<Card title="Pipeline" layout="sections">` with one `CardSection` per block. Lines divide the sections; the sections have no border, radius, or surface of their own.
- Content with its own padding, such as a `StatStrip framed={false}` or a `LogViewer variant="embedded"`, goes in `CardSection padding="flush"`.
- `CardSection tone="inset"` sinks one section into the inset surface for raw output, such as a payload. It is a full-width band, not a nested card. Never use it for section content.
- On a page, a `Section` holds its content directly with spacing. Use a `Card` inside a `Section` only for distinct, comparable, or actionable groups, such as two cards side by side.

```tsx
<Card title="Pipeline" layout="sections" actions="Total 1m 56s">
  <CardSection>
    <Stepper mode="status" label="Pipeline stages" steps={stages}
      selectedStep={stage} onSelectionChange={setStage} />
  </CardSection>
  <CardSection padding="flush">
    <LogViewer variant="embedded" label="Build output" lines={lines} emptyState={empty} />
  </CardSection>
</Card>
```

## Filters In The URL

Define the filter fields once with `as const satisfies ReadonlyArray<FilterField>`,
then use the pure functions of `src/lib/filter-params.ts`:

```ts
export const ItemsSearch = Schema.Struct({
  q: Schema.optionalKey(Schema.String),
  page: Schema.optionalKey(Schema.Number),
  ...filterSearchFields(itemFilterFields), // one optional string param per field
});

const filters = parseFilters(itemFilterFields, search); // ReadonlyArray<ActiveFilter>
navigate({ search: (prev) => ({ ...prev, ...serializeFilters(itemFilterFields, next), page: undefined }) });
```

- Each field writes one param: `status=failed,building`, `owner=not:ops`, `created=2026-10-01..2026-10-12`. The operator prefix appears only when the field has more than one operator.
- `filterSearchFields` validates each value against the field options, operators, and dates. An invalid value fails search validation, and the route shows its reset action.
- `parseFilters` and `serializeFilters` throw on a value or a definition that cannot round-trip. Option and operator ids use letters, digits, `_`, `-`, and `.`.
- Build the server query from the parsed filters in the feature, as `itemsQueryFromSearch` does. Do not send the raw params to the server.

## Composition Rules

- One primary button per view. Secondary actions are `secondary` or `ghost`.
- Labels are quieter than values. Section titles are quieter than content.
- Use `Card` only for distinct, comparable, or actionable groups. Never nest cards; see Cards.
- Tables: text left, numbers right with tabular figures, sort state announced, rows open the detail route through `rowAction`.
- Status uses `Badge` with text, or `StatusDot` in table cells and dense lists. Color only supports it.
- Steps that run on their own use `Stepper mode="status"` on a detail page and `SegmentedProgress` in cards and rows. Activity and audit history use `Timeline`, which does not color items as progress.
- List filters go in the `DataTable` frame as a compact `Toolbar` with `Filters`. Keep the search field first.
- Row selection is page state, not URL state. Ids on other pages stay selected; the bulk bar counts all of them. Bulk buttons name the count ("Delete 3 items"), and a destructive bulk action opens a `ConfirmDialog`.
- Keep hidden columns in a search param when people share the view, or in page state otherwise.
- Moves in `Kanban`, `SortableList`, `Tree`, and `Gantt` are optimistic: apply the new value at once, persist it with a mutation, and on failure restore the previous value and show an error toast. Every drag has a keyboard path; never add a drag-only control.
- Pointer-only shortcuts, such as `ContextMenu` and `HoverCard`, repeat what a visible control or link already offers.
- Server-paged tables use the `DataTable` `pagination` footer. Use `virtualize` only for long lists the client already holds, such as a log export or a full lookup table.
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
- Metadata pairs a label and a qualifier with a middle dot: "Measured · catalog prices", "Attempt 2 · main".
- Record IDs, hashes, and hosts that people paste elsewhere use `Identifier`. Inline code and commands use `Code`.
- Confirmations name the exact object and every effect: "app.example.com serves dpl_rxt8gA84n within a minute. Automatic promotion pauses until you undo the rollback."

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
