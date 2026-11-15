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
toggles, sliders, hover cards, and context menus. `MotionShowcase`
(`src/components/kit/showcase-motion.tsx`) shows each motion helper on one
list. The `/design-kit/form` route
renders `FormShowcase` (`src/components/kit/showcase-form.tsx`), a long form
that uses every form component. Copy its structure for a new form; see Forms
below. The `/design-kit/queue` route renders `QueueShowcase`
(`src/components/kit/showcase-queue.tsx`), a touch work view on a shared
tablet. Copy its structure for a touch view; see Touch Work View below.

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
| `button.tsx` | `Button`, `LinkButton`, `ButtonGroup` | Intents `primary`, `secondary` (default), `ghost`, `danger`. Sizes `sm`, `md`, `lg`. Without `size`, a button takes the control size of its row. Do not set `size` inside a `Toolbar`. `iconOnly` needs `aria-label`. `LinkButton` is a router `Link`. `Button` accepts `type="submit"` and `form` for dialog footers. `ButtonGroup` joins buttons into one control with a `label`: a split button (an action and a `MenuTrigger` with an icon-only Button), zoom out and in, or previous and next. Use one intent in a group. |
| `surface-button.tsx` | `SurfaceButton` | A custom surface that is one control: a card title, a list row, or an object on a canvas. `style` gives the surface its full look after a reset; the kit adds only the focus ring. It keeps native pointer, click, and key events, so drag, pan, and delegated listeners on ancestors continue to work. `Button` uses react-aria press handling, which stops these events. It is always `type="button"`. Use `Button` for all other actions and for form submission. |
| `menu.tsx` | `Menu`, `MenuItem`, `MenuSeparator`, `MenuTrigger`, `ContextMenu` | Row and overflow actions. `MenuItem` takes `icon`, `shortcut`, `isDestructive`. In a `Menu` with `selectionMode`, each item shows a check mark when selected. `ContextMenu` wraps an area, such as a list row or a card, and opens its `menu` items at the pointer on a right click, or at the focused element with Shift+F10 or the context menu key. Give each `MenuItem` an `id` and handle `onAction`. Every action must also be reachable from a visible control, such as a row menu button. |
| `toggle-group.tsx` | `ToggleGroup`, `ToggleOption` | Buttons that each turn an option on or off and apply at once, such as the days a job runs in a `SettingRow` or the levels a log shows in a toolbar. `value` is the array of pressed ids. A pressed text option shows a check mark; `iconOnly` keeps the labels as accessible names. It has no hint and no error. For several choices that a form submits, use `CheckboxGroup appearance="chips"`. For one choice among views, use `SegmentedControl`. |
| `hover-card.tsx` | `HoverCard`, `HoverCardLink` | A preview that opens on hover, focus, or long press, such as a person or a record named in a table. The trigger is a `HoverCardLink` (an inline link with an optional `href`) or a kit `Button`. The card may hold links and buttons; never put information there that the page does not show or link to. |
| `command-palette.tsx` | `CommandPalette`, `useCommandPalette`, `Command`, `CommandGroup` | Search for pages and app actions in a modal. `AppShell` mounts the only palette and binds Command-K and Control-K. A `Command` has `href` or `onAction`, never both, plus optional `icon`, `keywords`, and `shortcut`. `useCommandPalette().open()` opens it from a page. |
| `segmented-control.tsx` | `SegmentedControl` | Two to five views or modes of the same content. Typed `value` and `onChange`. It takes the control size of its row. |
| `tooltip.tsx` | `Tooltip`, `TooltipTrigger` | Short hints. Never the only place for required information. |
| `copy-button.tsx` | `CopyButton` | Icon button next to an identifier or URL. A check mark confirms the copy; a refused clipboard shows an error toast. |
| `popover.tsx` | `Popover`, `PopoverTrigger` | Non-modal panel anchored to a trigger, such as a filter panel. |

### Fields

| File | Exports | Use |
|---|---|---|
| `field.tsx` | `FieldLabel`, `FieldDescription`, `FieldErrorMessage`, `FieldErrorIcon`, `FieldWidth`, `fieldWidth`, and the `field`, `control`, `inputText` styles | The parts of every kit field. `FieldLabel` shows a quiet "optional" with `isOptional`. `FieldDescription` (the hint) goes between the label and the control. `FieldErrorMessage` goes under the control and starts with an icon. `fieldWidth` sizes a control from `FieldWidth`. Use these parts only in a new kit field. `control.base` plus `control.textInput` style an input that is itself the box. `inputText.base` resets an input nested inside a box. Never put both on one element; the reset removes the box. `field.hiddenLabel` keeps a label for screen readers only. |
| `text-field.tsx` | `TextField` | Single line or `multiline`. `hideLabel` where a `SettingRow` already names the field. `prefix` and `suffix` put content inside the box of a single-line field: a fixed part of the value ("https://", ".example.com"), a lucide icon, a `Kbd` hint, a `Spinner` while a value is checked, or one small button such as a `CopyButton`. `placeholder` is an example answer that starts with "e.g.". |
| `number-field.tsx` | `NumberField` | Number value with locale formatting and right-aligned tabular figures. `unit` shows a unit after the number ("seconds", "%"); use `formatOptions` for currency. `showStepper` adds decrement and increment buttons; arrow keys step without them. `hideLabel` in a `SettingRow`. |
| `time-field.tsx` | `TimeField` | Time of day, such as a daily run time. `value` and `onChange` use ISO time strings (`"02:00"`) or `null`; `granularity="second"` adds seconds. `minValue` and `maxValue` mark earlier or later times as invalid. `zoneLabel` names the time zone after the time, such as "UTC". Type the digits or use the arrow keys on each part, or open the clock button: a popover lists hours and minutes in two columns. The hour list takes focus on the current hour, Tab moves to the minutes, and choosing a minute closes the popover and returns focus to the button. `minuteStep` (default 5, must divide 60) sets the minutes the popover offers; typed values keep any minute. |
| `slider.tsx` | `Slider`, `RangeSlider` | A number or a range picked on a track, such as a sampling rate, a threshold, or a latency band. `minValue`, `maxValue`, `step`, and `formatOptions` for the value text; `marks` labels values under the track. `RangeSlider` takes `thumbLabels` for the two thumbs. Arrow keys step, Page Up and Page Down move a tenth, Home and End jump to the ends. Use `NumberField` when people type exact values. |
| `search-field.tsx` | `SearchField` | Search with a clear button; Escape clears. `hideLabel` in a toolbar. `focusShortcut` binds "/" to the main list search. |
| `select.tsx` | `Select` | Single choice from a fixed list of more than about seven options, or from a short list where a row has no space for chips, such as a toolbar or a `SettingRow`. `options: { id, label, description? }[]`. `hideLabel` in a toolbar. In a form, a short list is a `RadioGroup` (see Forms). |
| `combo-box.tsx` | `ComboBox` | Single choice from a long list; typing filters. `value` is an option id or `null`. |
| `date-picker.tsx` | `DatePicker`, `DateQuickPick`, `dayQuickPicks` | Calendar date. `value` and `onChange` use ISO strings (`"2026-10-12"`) or `null`. `width` defaults to `sm`. `quickPicks` puts a row of day chips before the date input for the dates that people pick most; the input stays for any other date. Build them with `dayQuickPicks({ today, count, skip? })`: "Today" and "Tomorrow" with the weekday as meta, then weekday names, at most a week ahead. `skip` leaves out days such as weekends. Pass `today` from the loader. Arrow keys move through the chips, and Tab moves on to the input. |
| `date-range-picker.tsx` | `DateRangePicker`, `DateRange` | Start and end date in one field, such as a report period. `value` is `{ start, end }` with ISO strings, or `null`. `presets` lists quick ranges next to the calendar; compute them from a stable reference date. |
| `multi-select.tsx` | `MultiSelect` | Several choices from a fixed list. `value` is an array of option ids. The trigger names the first choice and counts the rest. `showTags` lists the choices as removable tags under the field in forms. |
| `tag-group.tsx` | `TagGroup` | A labeled set of short values, such as labels or recipients. `onRemove` adds remove buttons and Delete-key removal. For list filters, use `Filters`. |
| `cascader.tsx` | `Cascader`, `CascaderOption` | Single choice from a tree, such as region, country, and city. `value` is the path of ids from the root, or `null`. Columns open as people move: arrow keys move in a column, Right opens a branch, Left goes back, Enter chooses. `allowsBranchSelection` lets a branch be the value. A search box finds options at every level; it shows by default above 12 options. |
| `file-upload.tsx` | `FileUpload`, `UploadFile` | Drop zone with a file dialog button and the chosen files. It only selects files: the app validates and uploads them and passes each file's `status` (`queued`, `uploading` with `progress`, `done`, `failed` with `error`). `acceptedFileTypes` takes exact MIME types. |
| `radio-group.tsx` | `RadioGroup` | One visible choice from up to about seven options. `appearance` is `list` (default: small marks, for a dense panel or a dialog), `cards` (tiles with a `description`, for choices that people compare, such as a priority), or `chips` (pills in a wrapping row, for short labels, such as a building or a person). `orientation` applies to `list` only. `noneOption={{ label, description? }}` adds a last choice whose value is `null`, such as "Decide later"; then `value` and `onChange` take `null` too. Arrow keys move and choose; Tab leaves the group. |
| `checkbox.tsx` | `Checkbox`, `CheckboxGroup` | `Checkbox` is one independent on/off choice and supports indeterminate. `CheckboxGroup` picks several values from a short fixed list, such as the kinds of work in a request. `appearance` is `cards` (default), `chips`, or `list`, as in `RadioGroup`. A selected chip shows a check. `isOptional` marks the label when people may choose nothing. The group also takes `description` and `errorMessage`. `value` and `onChange` use arrays; `onChange` returns the values in option order. Each option is a tab stop and Space toggles it. Use `MultiSelect` for a long or searchable list. |
| `choice.tsx` | `ChoiceOption`, `ChoiceNoneOption`, `ChoiceAppearance` | The option type of `RadioGroup` and `CheckboxGroup`: `id`, `label`, and optional `description` (list and cards), `meta` (a quiet fact after the label, such as "3 open", "1 h", or a price), `icon` (a lucide icon) or `avatar` (`{ src? }`, initials when it is missing), and `isDisabled`. A field that the appearance cannot show throws an error, such as a `description` on a chip. Chips take the control size of their row. |
| `form-layout.tsx` | `FormLayout`, `FieldRow`, `FormPreview`, `FormFooter`, `ErrorSummary`, `FormError` | The parts of a long form on its own route. `FormLayout` (`id`, `onSubmit`, `aria-label`, `preview`, `footer`) renders the `<form>` without browser validation. The sections take the main column, and `preview` stays beside them while the form is wider than the `lg` breakpoint and goes under them otherwise. `FieldRow` puts related fields on one line, such as a floor and a room; it wraps when it is narrow. `FormPreview` (`label`, `description`) shows the record that the answers make, such as a `DescriptionList`, with a dash for each empty answer. `FormFooter` (`summary`, children) sticks to the bottom of the window with live facts on the left, then a cancel action and the submit button; a focused field never goes under it. `ErrorSummary` (`title`, `errors`, `submitCount`) lists the problems with a link to each field, takes focus on each new submit attempt, and renders nothing without errors. Build `errors` with `formErrors` from `src/lib/form.ts`. |
| `switch.tsx` | `Switch` | Settings that apply immediately. |

The text-like fields (`TextField`, `NumberField`, `Select`, `ComboBox`,
`MultiSelect`, `Cascader`, `DatePicker`, `DateRangePicker`, and `TimeField`)
take `width` and `isOptional`. `FileUpload` takes `isOptional`. `width` is
`xs`, `sm`, `md`, `lg`, or `full` (the default, except `DatePicker`); see
Forms. A field with both `isOptional` and `isRequired` throws an error.
| `list-box.tsx` | `OptionList`, `ListOption` | Option list inside Select, MultiSelect, ComboBox, and Filters popovers. An option with `intent` shows a status dot. Not used directly in pages. |
| `calendar.tsx` | `DateSegments`, `CalendarButton`, `CalendarHeader`, `RangeCalendarView`, `calendar` styles | Shared parts of DatePicker, DateRangePicker, and the Filters date editor. Not used directly in pages. |

### Data And Layout

| File | Exports | Use |
|---|---|---|
| `layout.tsx` | `Page`, `PageHeader`, `Section`, `Toolbar`, `Card`, `CardSection`, `StatTile`, `StatStrip`, `DescriptionList`, `SettingsCard`, `SettingRow`, `MetaLine`, `Code`, `Kbd`, `Separator` | Page structure, filter rows, overview numbers, and read-only facts. `Page width="reading"` makes a detail or form page narrower. `Section layout="split"` puts the `title` and a one-sentence `description` in a column on the left and the content on the right, with a line between consecutive split sections. It needs a `title` and takes no `actions`. Use it for the parts of a long form or a settings page. It stacks when the section is narrower than the `md` breakpoint. `Page density="touch"` makes controls and text larger for a shared tablet or kiosk. The overlays that the page opens and the app shell around it follow it (see Touch density in `styling.md`). `PageHeader` `title` and `description` take rich content like `Card`: the title is the page's only `<h1>` and its parts wrap as one heading line, such as an `Identifier size="lg"` followed by a `StatusDot` or a `Badge size="lg"`; the description flows as text and can hold `Code`, links, or a small `Identifier`. Put a `{" "}` between the parts of a title so the heading reads with a space. `PageHeader` `actions` never grow wider than the header, so a wrapping control such as a `RadioGroup appearance="chips"` wraps in place. `Card` takes `title`, `description`, `actions` (a total, a link, or one button), and `footer`; `layout="sections"` stacks `CardSection` rows divided by lines (see Cards below). `StatTile` deltas take `tone` when "down" is good; `chart` takes the kit `Sparkline` (`src/components/charts/sparkline.tsx`) and `footnote` names the source. `StatStrip` is a divided row of key facts for detail headers and peeks; `variant="status"` shows one status word per cell with a `detail` line (CI, artifact, traffic), and `framed={false}` drops its border inside a `CardSection`. An item `link` makes the whole cell open the records that it counts, such as the list filtered to them. The link name is the label and the value, such as "Overdue 12". `DescriptionList layout="grid"` puts labels above values in columns for the key facts of a record; an item with `span="wide"` takes two columns. `SettingsCard` with `SettingRow` puts the label left and the value or control right. `Toolbar` sets the control size of its row. It is `sm` (28px) inside a `DataTable` frame and `md` (32px) elsewhere; `size` changes it. Its `actions` hold trailing icon buttons. `Code` shows inline code and commands. `MetaLine` puts separate facts on one line with a gap between them and no separator character, such as an environment and an attempt under a run name. Each entry of `items` is one fact; it takes the color and size of the line around it, and the line wraps between facts. |
| `control-size.tsx` | `ControlSizeProvider`, `useControlSize`, `ControlSize` | The control size of a row: `sm` (`size.controlSm`, 28px) or `md` (`size.controlMd`, 32px, the default). Every kit control inside the provider takes this height, so a row cannot mix heights. `Toolbar`, the `DataTable` toolbar row and footer, and the `LogViewer` and `EventCalendar` headers set it. Dialogs, sheets, and popovers set `md` again, because React context passes into portals. A primitive with a control height reads `useControlSize()` and has no `size` prop. |
| `src/lib/motion.ts` | `withViewTransition`, `viewTransitionName`, `motionStyles`, `useDropTransition`, `useArrivals`, `useHasChanged`, `isViewTransitionRunning` | Motion that helps people follow an object when the state changes (see Motion in `styling.md`). `withViewTransition(update)` runs a synchronous state change in a view transition. `viewTransitionName(scope, ...parts)` makes a unique name from a `useId()` scope and the id of the element; `motionStyles.named(name)` sets it. `useDropTransition()` returns `{ droppedByPointer, commit(ids, update) }` for a new drag-and-drop collection. `useArrivals(keys)` returns the keys that arrived since the last render, for `motionStyles.enter`. `useHasChanged(value)` is true after the value changes, for `motionStyles.changed`. `Kanban`, `SortableList`, and `WorkQueue` already use these helpers. |
| `src/lib/focus.ts` | `useFocusAfterRemoval`, `FocusAfterRemovalOptions`, `isFocusLost` | The focus after a change removes the focused item from a collection (see Composition Rules). `useFocusAfterRemoval({ container, ids, itemSelector, focusTarget?, emptyTarget })` watches the `container`, which stays mounted. Each item element has its id in `data-key`, as a react-aria collection row has. When the focused item leaves, the focus goes to the next item in the order of `ids`, then to the item before, then to `emptyTarget()`. `focusTarget(item)` picks the element in an item that takes the focus. The hook acts only when the focus is lost, and it throws when it finds no target. `isFocusLost()` is true when the focus is on the body; use it before you move the focus after a change. `Kanban`, `SortableList`, and `WorkQueue` use this hook. |
| `density.tsx` | `DensityProvider`, `useDensity`, `useOverlayDensity`, `Density`, `ShellDensityProvider`, `useShellPageDensity` | The density of the page: `default` or `touch`. `Page density` sets it, and `AppShell` sets it again for its sheet and its top bar menus; do not set it in other places. `ShellDensityProvider` and `useShellPageDensity` send the density of the page to `AppShell`. Only `AppShell` and `Page` use them. `useDensity()` tells a component that it renders on a touch page. `useOverlayDensity()` returns the styles that give the root of an overlay the density of the page that opens it. Every kit dialog, sheet, popover, hover card, menu, option list, and tooltip uses it. A new overlay puts `...useOverlayDensity()` first in the styles of its portal root (see Touch density in `styling.md`). |
| `data-table.tsx` | `DataTable`, `DataTableColumn`, `DataTableSelection`, `DataTableExpansion`, `DataTablePinning`, `DataTablePagination`, `DataTableRowAction`, `DataTableColumnVisibility`, `TwoLineCell`, `MeterCell` | Server-sorted table on semantic `<table>` with `aria-sort`, sticky header, numeric columns, and an empty-state slot. `toolbar` renders a `Toolbar` inside the frame. The toolbar row, the bulk-action bar, and the pagination footer use the `sm` control size. `rowAction` opens a row: `{ link: (row) => ({ to, params }) }` or `{ onAction }`. The `rowHeader` column (default: the first data column) becomes a `<th scope="row">` with that link or button, so Tab and Enter open the row, and a click anywhere else on the row does the same. `pinnedColumns={{ start, end }}` keeps columns in view while the table scrolls sideways, such as the name and a row menu. `expansion` adds a toggle column and a full-width detail row. `density="compact"` uses 28px rows. `isLoading` shows `loadingRows` skeleton rows for client-triggered loads. `pagination` adds a footer in the frame with the row range, page buttons, and rows per page. A column `footer` adds a summary row. `activeRowId` marks the row open in a peek. `selection` adds a checkbox column and a bulk-action bar that replaces the toolbar while rows are selected. `columnVisibility` adds a column menu. `resizableColumns` adds drag and arrow-key handles on header edges; set `size` on each column. `virtualize={{ visibleRows }}` renders only the rows in view; it cannot combine with `expansion`. `responsiveColumns` makes a table read on a phone: `{ [columnId]: { hideBelow: "sm" \| "md" \| "lg", stack?: boolean } }` removes a column while the table frame is narrower than the breakpoint (`sm` 640px, `md` 768px, `lg` 1024px). The frame width decides through a container query on the scroller, so a table in a narrow panel adapts too. With `stack`, the cell shows under the row header while its column is hidden, for short values such as a region or an owner. Keep the row header and the status; hide secondary facts such as the source, the author, or the date. Below `sm` cell text also wraps and the padding tightens, so the columns that stay fit the frame. The row header column cannot be responsive. `TwoLineCell` holds a primary line and a quiet second line. `MeterCell` adds a bar that compares a number with the column maximum. |
| `pagination.tsx` | `Pagination` | Previous and next for server-paged lists that are not tables, such as card grids. Tables use the `DataTable` `pagination` footer. Renders nothing for one page. |
| `badge.tsx` | `Badge`, `StatusDot` | Status text: `neutral`, `accent`, `success`, `warning`, `danger`, `info`. `appearance` is `subtle` (default), `solid` for counts, or `outline` for a quiet tag; `size` `sm`, `md`, `lg`; `shape="pill"`; `icon` before the text. `StatusDot` is the dense form for table cells, lists, and detail headers: a dot and the text, `detail` adds a secondary line (the stage and its duration in a `MetaLine`), and `isActive` pulses the dot for work in progress. |
| `filters.tsx` | `Filters` | Chip bar filter builder for a list. "Add filter" walks field, operator (only when the field has more than one), and value, and adds only complete filters. Field kinds: `select`, `multiSelect` (the chip names every value, "Failed, Building"), `text`, and `dateRange` with presets. Each chip changes its operator and value in place and has a remove button; "Clear all" removes all. One filter per field. Keyboard-complete. The chips take the control size of the row. Define fields and the URL codec with `src/lib/filter-params.ts` (see Filters in the URL). |
| `identifier.tsx` | `Identifier` | Monospaced record ID, SHA, or host with a `CopyButton`. `display` shows a short form, such as a 7-character SHA, and copies the full `value`. `size` `sm`, `md`, `lg` (a detail page title); `muted` next to a name. |
| `breadcrumbs.tsx` | `Breadcrumbs` | Location in a hierarchy. The shell renders it from route data. |
| `tabs.tsx` | `Tabs`, `TabList`, `Tab`, `TabPanel` | In-page sections. Not for navigation between routes. |
| `disclosure.tsx` | `Disclosure`, `Accordion` | `Disclosure` shows and hides one section, such as advanced settings or a raw payload. `Accordion` frames several `Disclosure` rows; one opens at a time unless `allowsMultipleExpanded`. Use `Tabs` when people compare sections. |
| `timeline.tsx` | `Timeline`, `TimelineEvent` | Activity or audit feed, newest first. Each event has an `icon` for its type, a one-sentence `title`, an `actor` (an avatar and the name; `isSystem` shows the name only), a `time` (`label` such as "3h ago", `dateTime`, and an exact `title`), and an optional `description` and trailing `meta` link. The actor, the time, and `meta` sit on one line separated by gaps; the actor name has the text color and the time is muted. Items are neutral; `tone` tints the icon of an event that needs attention, such as a failure. `kind` names the event type for screen readers. For steps with a status, use `Stepper` with `mode="status"`. |
| `stepper.tsx` | `Stepper`, `SegmentedProgress`, `StepStatus`, `stepStatusDisplay` | `Stepper` shows steps in order. `mode="wizard"` (default) shows the position in a multi-step task: steps before `currentStep` show as complete and `onStepPress` lets people go back to them. `mode="status"` shows steps that run on their own, such as pipeline stages: each step has a `status` (`pending`, `running`, `success`, `failed`, `skipped`, `cancelled`), a `duration`, and an optional `note`. With `onSelectionChange`, status steps are a radio group: arrow keys move, Space or Enter selects, and the selected step drives the detail below, such as its logs. `orientation` is `horizontal`, `vertical`, or `responsive` (vertical below `media.md`). `SegmentedProgress` is the compact form for cards and table rows: one colored segment per step and a caption for the current step: its name, its status word in the status color, and its duration, each as its own element. |
| `log-viewer.tsx` | `LogViewer`, `LogLine` | Monospaced output with line numbers, an aligned source column (such as the stage), times in the app time zone, an "All" and "Warnings and errors" switch when the output has them, search with match highlights, and a footer with the line count and a quiet `footnote`, each as its own element. Warning and error lines show their level in words. It renders only the lines in view, opens at the first error, and `follow` keeps the newest line in view during a stream. `title` starts the header row; `filters` holds more controls, which take the `sm` control size of the header row; `downloadName` adds a download button; `footerEnd` holds run details. `maxVisibleLines` (default 24) caps the height: shorter output takes only the height of its lines, longer output stops there and scrolls. Below the `sm` width of its own frame the time column hides and lines wrap, so a phone never scrolls the log sideways. `variant="embedded"` fills a `CardSection` with `padding="flush"`. Pass `query`/`onQueryChange` and `level`/`onLevelChange` to keep them in the URL. |
| `avatar.tsx` | `Avatar`, `AvatarGroup` | A person or service account: image with initials when it is missing. `size="xs"` sits inline in a metadata line. `AvatarGroup` overlaps avatars and counts the rest. Show the name in text where it matters. |
| `item.tsx` | `ItemList`, `Item` | Rows of records that people scan and act on one at a time, such as integrations, members, or connected accounts. An `Item` has `media` (an `IconTile` or an `Avatar`), a `title`, a quiet `description`, trailing `meta` (a `Badge`, a count, or a date), and `actions` (a `Switch`, a button, or a row menu). `onAction` opens the item: the title becomes a button and a click anywhere else on the row does the same. `size="sm"` in a sheet or popover. `ItemList` divides the rows; `framed={false}` inside a `Card`. `style` adds styles to the row, such as `motionStyles.named` so that the row moves or leaves in a view transition. Use `DataTable` when people compare values across rows. |
| `icon-tile.tsx` | `IconTile` | An icon on a small surface, such as the media of an `Item` or the icon of an `EmptyState`. `tone` (default `neutral`), `variant` `soft` (default), `solid`, or `outline`, `size` `sm` 24px, `md` 32px, `lg` 40px, and `shape="circle"`. It is decorative: the text next to it carries the meaning. |
| `file-type-icon.tsx` | `FileTypeIcon`, `fileTypeOf`, `FileType` | The family icon of a file on an `IconTile`, from its name, path, or URL, or its MIME type: spreadsheet, data, code, document, image, video, audio, archive, key or certificate, log, or file. Names without an extension, such as `Dockerfile` or `.env.local`, resolve by name. Show the file name next to it. |
| `scrollspy.tsx` | `Scrollspy`, `ScrollspyItem` | Links to the sections of a long page, such as settings or a record with many parts. Each item names a section `id` on the page. The link of the section in view has `aria-current="location"` and the selected surface. A link scrolls its section into view (instantly under reduced motion) and moves focus to it. `orientation="horizontal"` for a bar above the sections; `offset` leaves room for a sticky bar. |

### Runs, Boards, And Schedules

`WorkspaceShowcase` (`src/components/kit/showcase-workspace.tsx`) shows each
primitive below on the `/design-kit` route, except `WorkQueue`. `QueueShowcase`
shows `WorkQueue` on the `/design-kit/queue` route.

| File | Exports | Use |
|---|---|---|
| `trace.tsx` | `Trace`, `TraceStep`, `TraceStatus`, `SpanWaterfall`, `TraceSpan` | `Trace` is a run as a column of quiet step lines: agent turns, CI jobs, checks, and imports. Each step has an `icon`, a `title` that says what happened, a `status` (`done` default, `running`, `failed`, `pending`, `skipped`), a `meta` such as a duration, and an optional `badge`. A step with `detail` or child `steps` opens in place; `expandedIds` with `onExpandedChange` controls which steps are open, such as the running one. Screen readers hear the status word before the title. `SpanWaterfall` shows a distributed trace: spans nest under their parent on a shared time axis, arrow keys move between spans and open or close them, and the selected span shows its duration, self time, start, status, and `attributes` below. The span with the most self time shows its share of the trace. Use `Stepper mode="status"` for a short fixed pipeline and `Timeline` for an audit feed. |
| `kanban.tsx` | `Kanban`, `KanbanColumn`, `KanbanMove` | Cards that people move between stages, such as incidents or requests. `columns` names each stage with an optional `icon` and a work-in-progress `limit` (the count turns to a warning above it). `value` maps each column id to its items in order; `onChange` receives the next value and the `KanbanMove`. Apply the move optimistically, persist it, and on failure restore the previous value and show an error toast (see Optimistic moves in `data.md`). `onChange` runs inside a view transition: a card that moves by the keyboard glides to its new place, a card that people drop with the pointer lands at once, and the other cards make room. A card that arrives in `value` without a move, such as after a refetch, fades in. Change the value synchronously in `onChange`, and restore it with `withViewTransition`. `renderItem` draws the card content (a title and two or three facts); `getItemLabel` names the card for typeahead and drag announcements; `onItemAction` opens a card on click or Enter. Drag with the pointer, or focus the grip and press Enter, Tab to a column, arrow to a place, and press Enter. A moved card keeps the focus in its new column. When the focused card leaves the board, the next card of its column takes the focus, or the column when it is empty. `columnActions` adds header content such as an add button. Columns scroll sideways on narrow screens. `onColumnsChange(columns, move)` makes the column order changeable: drag a column by the grip in its header, or focus that grip, press Enter or Space, move with Left and Right, and press Enter to drop or Escape to cancel. A line marks the place and a live region announces it. `KanbanColumnMove` is `{ columnId, fromIndex, toIndex }`; apply it optimistically and persist it. The columns glide to their new places. Without `onColumnsChange` the order is fixed. |
| `work-queue.tsx` | `WorkQueue`, `QueueSection`, `QueueSectionProps`, `QueueCard`, `QueueCardProps`, `QueueCardAction` | The work of one person on a touch page, grouped by the next action. Put it in `Page density="touch"`; see Touch Work View. `QueueSection` takes a `title` that names the next action, an `icon`, the `items` in the order of work, `getItemId` (unique in the whole queue), and `renderItem`. It shows the count beside the title. `emptyMessage` keeps an empty section on the page with that sentence; without it, an empty section does not show. `emphasis` gives the section that people work on now a stronger card edge; use it once. `QueueCard` takes a `title`, a `link` that opens the record (the title gets a chevron), a `tag` at the top right such as a `Badge size="lg"`, a one-line `subtitle`, `children` with what people need to do the work, quiet `meta` under a divider, and `actions`: `{ label, icon?, intent?, onPress, isDisabled? }`. The actions are large buttons that share the width of the card and stack when the card is narrow. One action at most has `intent: "primary"`. `panel` replaces the actions with short content, such as a form that asks why work stops; do not give `panel` and `actions` together. `tone="attention"` marks an item that needs help; say why in the card too. A card that moves to another section in a `withViewTransition` update glides there, a card that leaves fades out, a card that arrives without a move fades in, and the count animates when it changes. When an action moves or removes the focused card, the next card of the same section takes the focus. When the section is empty, its heading takes the focus; when the section closes, the heading of the next section takes it, or of the section before when no section follows. An open `panel` gives the focus to its first control, and the action that opened it takes the focus again when it closes. Each component throws outside its parent. |
| `tree.tsx` | `Tree`, `TreeNode`, `TreeSelection`, `TreeMove`, `moveTreeNodes` | A hierarchy of records, such as folders, categories, an org chart, or permissions. Each node has a `label`, an optional `icon` and `openIcon`, a quiet `description`, trailing `meta`, and `children`. Arrow keys move between rows, Right and Left open and close a branch. `selection` is `{ mode: "single", value, onChange }` for the open record, or `{ mode: "checkbox", value, onChange }` with leaf ids: a branch checkbox selects or clears every leaf under it and shows a dash when only some are selected. `onAction` opens a node. `onMove` enables drag and drop to reorder and nest nodes; apply the move with `moveTreeNodes` and persist it. `guides` (on by default) draws the level lines. Pass `expandedIds` and `onExpandedChange` to keep open branches in the URL. |
| `sortable-list.tsx` | `SortableList`, `SortableMove` | A list people put in order, such as an escalation chain, a column order, or dashboard widgets. `onReorder` receives the items in their new order and the `SortableMove`; apply it optimistically, persist it, and restore the old order with an error toast if it fails. `onReorder` runs inside a view transition, so the other rows glide to their new places; change the order synchronously in `onReorder`. `renderItem` draws the row content, `itemActions` adds trailing controls such as a remove button, and `onItemAction` opens a row. `showPosition` numbers the rows for priority orders. `layout="grid"` wraps tiles. Drag by the grip, or focus the grip, press Enter, move with the arrow keys, and press Enter; Escape cancels. A moved row keeps the focus. When the focused row leaves the list, such as after its remove button, the next row takes the focus, or the list when it is empty. `framed={false}` drops the frame inside a `Card`. |
| `code-block.tsx` | `CodeBlock`, `CodeLanguage`, `CodeDiagnostic`, `CodeLineSpec` | Read-only config, payloads, queries, commands, and short output. `language` is `ts`, `tsx`, `js`, `jsx`, `json`, `sh`, `bash`, `sql`, `yaml`, `css`, `html`, `python`, `go`, `rust`, `toml`, `dockerfile`, `markdown`, `diff` (the +/- prefixes mark lines), or `text`. A small built-in highlighter colors comments, strings, numbers, keywords, keys, functions, types, and tags; it adds no dependency to the bundle. `title` names the file or command in the header with a copy button and a wrap toggle; without a title the buttons pin to the corner. `highlightedLines` and `diff={{ added, removed }}` take line numbers and `[start, end]` ranges. `diagnostics` tint error and warning lines and show the message under the line, such as config validation. `maxLines` collapses long code behind "Show all N lines". `startLine` numbers an excerpt. `variant="embedded"` drops the border inside a `CardSection padding="flush"` or a `Trace` step. Use `LogViewer` for long or streaming logs and `Code` for inline values. |
| `event-calendar.tsx` | `EventCalendar`, `CalendarEvent`, `CalendarView`, `CalendarRecurrence`, `CalendarResource`, `CalendarOccurrence`, `CalendarEventChange`, `recurrenceLabel` | Month, week, day, and agenda views of events, such as on-call shifts, maintenance windows, scheduled jobs, or bookings. An event has `start` and an exclusive `end` as ISO instants, or ISO dates with `allDay`; times show in the app time zone. `intent` colors the event; say the meaning in the `title` or `meta` too. `today` (and `now` for the time line) come from the loader. Pass `date`/`onDateChange` and `view`/`onViewChange` to keep the period and view in the URL; `views` limits and orders the view switch. `recurrence` repeats an event: `{ frequency: "daily" \| "weekly" \| "monthly", interval?, weekdays?, until? \| count? }`; occurrences keep the wall-clock time and length of the first, only the period in view is expanded, and a monthly event on the 31st skips shorter months. `recurrenceLabel` words a rule ("Repeats every 2 weeks on Mon, Wed"). `resources` (`{ id, title, meta? }`) with a `resourceId` on every event shows one row per resource in the week view and one time column per resource in the day view. `onEventAction(event, occurrence)` opens an event; `occurrence` names the date of a recurring one. `onDayAction(date, resourceId?)` starts a new event from a focused month day (Enter) or the add button of a column. `onEventChange(event, { start, end, resourceId? })` makes single events movable: drag an event to another time, day, or resource, or drag its lower edge (the end of an all-day bar) to change its end; with an event focused, Alt and Left or Right move it a day (a resource column in the resource day view), Alt and Up or Down move it `minuteStep` (default 15) in a time grid, a week in the month view, or a resource row in the resource week view, and Alt and Shift with Up or Down (timed) or Left or Right (all-day) change its end. Focus stays on the moved event and a live region announces the new time. Recurring events do not move; change their recurrence in a form. In the month view, arrow keys move between days, Home and End go to the week edges, and Page Up and Page Down change the month; a day with more than three events shows "N more" with the full list. Below `md` the month view shows dots and lists the events of the focused day. The time grids pack overlapping events side by side and scroll to `scrollToHour`. |
| `gantt.tsx` | `Gantt`, `GanttTask`, `GanttChange` | Tasks on a time line, such as a migration plan or a release schedule. A task has `start` and an inclusive `end` as ISO dates (like the `DateRangePicker` value), `progress` in percent, an `intent`, an `assignee`, a quiet `meta` after the bar (it defaults to the assignee), `milestone` for a one-day diamond, and `dependsOn` for arrows from the tasks that must finish first. An arrow leaves its source bar through the bottom edge near the end and enters the target from the left, so it clears the labels after both bars; where it crosses the label of a row in between, the label stays on top. `children` make a group whose bar spans its tasks and shows their combined progress. The task list is a tree with the names kept in view while the chart scrolls sideways; it opens with `today` in view. `scale` is `day` or `week`. `onTaskAction` opens a task. `onTaskChange` makes bars movable: drag a bar or its edges, or press Alt with Left or Right on the selected task (Alt and Shift change the end); persist the change and update `tasks`. `onReorder(tasks, move)` makes the order changeable among siblings: drag a row by its grip, or press Alt with Up or Down on the selected task; `GanttMove` is `{ taskId, parentId, fromIndex, toIndex }`. `load={{ limit }}` adds a load lane under the tasks: one row per assignee with the number of their tasks on each day; days above `limit` show as a warning, and each row says in words which days go over it. Groups and milestones do not count. |
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
- `AppShell` renders the sidebar on the lighter `frame` color and the page in a recessed content panel inset by `size.frameGap`. The panel holds the top bar with breadcrumbs and scrolls on its own (`#main-content`); the router resets that element to the top on navigation. The sidebar has the brand block, collapsible navigation groups, and, when `sidebarFooter` is set, a footer with those controls. The top bar ends with search, the `actions`, and the theme switch. "Hide sidebar" gives the panel the full width, and the top bar then shows "Show sidebar". Below the `lg` breakpoint (1024px), the sidebar moves into a left `Sheet` that the menu button in the top bar opens. A tablet in portrait is 768px to 1023px wide, and a 240px sidebar takes 23% to 31% of that width. The sheet and the command palette keep the navigation one tap away. Below the `md` breakpoint, the panel also loses its border and radius. On a page with `density="touch"`, the sidebar stays in the sheet at every width. The top bar, the sheet, and the top bar menus then take the touch density (see Touch density in `styling.md`).
- `AppShell` props: `appName`; optional `logo`; optional `environment`, a short context under the name such as "Preview"; `nav`; optional `actions` for global top-bar actions such as a user menu; optional `sidebarFooter` for quiet controls such as help or a review-data switcher (never a banner across the page); optional `commands`, groups of app-wide actions for the command palette.
- The brand block shows `appName` with `environment` under it. `logo="initial"` (the default) puts a square mark with the first letter before the name. `logo="wordmark"` removes the mark and sets the name in `font.bold`, for a brand whose logo is its name in type.
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
| List | `_app/items/index.tsx` | `PageHeader` with one primary action. A page `Toolbar` above the `DataTable` (`SearchField`, `Filters`), a row link to the detail route, the name column pinned, `StatusDot` status, a summary footer, and the `pagination` footer. Search, filters, sort, and page live in the URL; `features/items/filters.ts` holds the filter fields and builds the server query from the search. |
| Detail | `_app/items/$itemId.tsx` | `Page width="reading"`, `PageHeader` with quiet actions, `DescriptionList` in a `Section`, `ConfirmDialog` for delete. |
| Create | `features/items/ui/create-item-dialog.tsx` | `Dialog` with a TanStack Form; the footer submit button uses `form={formId}`. Status is a `RadioGroup appearance="chips"`. |
| Long form | `_app/design-kit_.form.tsx` with `components/kit/showcase-form.tsx` | `FormLayout` with an `ErrorSummary`, one `Section layout="split"` for each part, a `FormPreview` beside the sections, and a `FormFooter` with the summary and the submit button. After submit, a success `Alert` names the new record and offers the next action. |
| Touch queue | `_app/design-kit_.queue.tsx` with `components/kit/showcase-queue.tsx` | `Page density="touch"`. A person picker as `RadioGroup appearance="cards"`, then a `PageHeader` that names the person with the person chips in its actions. A `WorkQueue` with one `QueueSection` for each next action, `QueueCard` actions that move a card optimistically, an inline panel for a short question, and a `Sheet` for the full record. |
| Settings | `_app/settings.tsx` | Reading-width page with `SettingsCard` and `SettingRow`. Identifiers use `Code` with a `CopyButton`. |

Choose the container by task:

- Short creation or edit (up to about six fields): `Dialog`.
- Detail or edit that benefits from the list behind it: `Sheet`.
- Records read one after another from a list: `Sheet size="peek"` with `navigation` and an "Open page" link to the detail route. Keep the open record in a search param.
- Long forms (more than about six fields) or multi-section records: a dedicated route with `FormLayout`. See Forms.
- Irreversible actions: `ConfirmDialog` that names the object and the consequence. The confirm label repeats the verb ("Delete item"). The `danger` intent is for that button, not for the entry point.

## Touch Work View

Some people do their work away from a desk. A technician, a stock picker, or
a nurse holds a tablet or a phone, finishes one item, and then starts the next.
A desktop list page in touch density does not help these people. Make a
separate touch view when all of these conditions are true:

- People work away from a desk: on a tablet, on a phone, or on a shared screen
  at a bench or on a wall.
- People work on their own items, one item after the other.
- People change the state of an item (start, finish, wait) more frequently
  than they edit its fields.

Keep the desktop page for the people who plan, assign, and audit the work.
The two pages read the same data. The touch view does not replace the desktop
page.

A desktop page that is squeezed onto a tablet shows these signs. If you see
one of them on a page for work away from a desk, make a touch view:

- A `DataTable` that scrolls sideways, or columns that people must read across
  the screen to find the next item.
- Actions in a row menu, in a toolbar above the list, or behind a hover.
- Filters that people must set each time to see their own items.
- The state is a column value, so people must read each row to find what to
  do next.
- Small controls next to each other, so a tap hits the wrong control.

`QueueShowcase` on the `/design-kit/queue` route is the reference. Copy its
structure.

### Structure

1. Render the route in `Page density="touch"`. `AppShell` then keeps the
   sidebar in the navigation sheet, so the queue gets the full width.
2. If no person is chosen, show a `PageHeader` that asks "Who is working on
   this tablet?" and a `RadioGroup appearance="cards"` with one card for each
   person. Show the number of open items of each person in the card `meta`.
3. When a person is chosen, show a `PageHeader` whose title names the person
   and the amount of work. Put a `RadioGroup appearance="chips"` with the first
   names in the header `actions`, so the next person can change the queue in
   one tap.
4. Show a `WorkQueue` with one `QueueSection` for each next action.
5. Open the full record in a `Sheet` from the card title. Keep the id of the
   open record in a search param.

### The Person

- Keep the person in the URL, such as `?person=`, so a reload and a link show
  the same queue.
- On a shared device, remember the last person for each device in a cookie.
  Read the cookie in `beforeLoad`, as `getThemeChoice` in `src/lib/theme.ts`
  reads the theme. Do not read `localStorage` during a render: the server
  cannot read it, so the server HTML and the first browser render are
  different. The showcase keeps the person in the URL only.
- If the app has sign-in and the device is personal, the signed-in user is the
  person. Do not show the picker.

### Sections

- Make one section for each next action, in the order of work: "In progress",
  then "Up next", then "Waiting for a part", then "Not assigned yet". Name a
  section with the next action or the state that people know. Do not name it
  with an internal status code.
- Sort the items of a section: urgent items first, then by due date. Sort a
  waiting section by the longest wait first.
- Give `emphasis` to the section that people work on now. Use it on one
  section only.
- Give `emptyMessage` to a section that people expect to see, so that an empty
  section tells them what to do next: "Nothing in progress. Start the next work
  order below." Do not give it to a section that is frequently empty, such as
  a waiting section. That section does not show when it is empty.

### Cards

- Keep a card short: the title, one `subtitle` line, the tasks as a short
  list, a quote from the requester, and an `Alert` that says why the item
  waits. Put all other fields in the `Sheet`.
- Give the card a `link`. The title becomes the link to the record. Do not
  make the full card a link, because the card contains buttons.
- Give one `primary` action: the next step. Label each action with a verb, such
  as "Start work", "Mark as done", or "Take this work order". Do not use an
  icon-only button.
- Do not put an action behind a hover or in a menu. A touch screen has no
  hover. Put feedback that only a hover shows, such as an underline, under
  `media.finePointer`, because a touch screen keeps the hover state after a
  tap.
- Make every target 44px or more. The kit buttons, links, and choices do this
  in touch density. A `Badge` keeps its size in all densities, so use `Badge
  size="lg"` on a touch page.
- Give `tone="attention"` to an item that needs help, such as an overdue item
  or an item that waits too long. Also write the reason in the card, such as
  "6 days without the part. Call the supplier." The color is not the only cue.
- If a move needs a short answer, such as the name of the missing part, show a
  `panel` in the card, not a dialog. Keep the panel to one or two fields, a
  submit button, and a cancel button.

### Moves

- Change the query cache inside `withViewTransition`, then send the request.
  See Optimistic moves in `data.md`.
- If the request fails, restore the item inside `withViewTransition` and show
  a toast that names the item: "WO-1042 did not change. Try again." The card
  moves back, so the toast is the only place for the message.
- Do not show a toast when the move succeeds. The card in its new section
  shows the result.
- `WorkQueue` already animates the moves, the items that arrive after a
  refetch, and the count of each section. Do not add motion.
- `WorkQueue` also keeps the focus in the queue after a move. Do not add
  `autoFocus` to a field in a `panel`; the panel focuses its first control.

```tsx
<Page density="touch">
  <PageHeader
    title={`${technician.firstName}, ${greeting(count)}`}
    actions={
      <RadioGroup
        label="Work orders of"
        appearance="chips"
        options={people}
        value={person}
        onChange={setPerson}
      />
    }
  />
  <WorkQueue>
    <QueueSection
      title="In progress"
      icon={Wrench}
      emphasis
      items={queue.inProgress}
      getItemId={(order) => order.id}
      emptyMessage="Nothing in progress. Start the next work order below."
      renderItem={(order) => (
        <QueueCard
          title={order.title}
          link={{ to: "/work", search: (previous) => ({ ...previous, order: order.id }) }}
          subtitle={order.place}
          actions={[
            {
              label: "Mark as done",
              icon: Check,
              intent: "primary",
              onPress: () => change(order, { stage: "done" }),
            },
            { label: "Waiting for a part", icon: PackageSearch, onPress: () => askForPart(order) },
          ]}
        >
          <TaskList tasks={order.tasks} />
        </QueueCard>
      )}
    />
    <QueueSection
      title="Up next"
      icon={ListTodo}
      items={queue.next}
      getItemId={(order) => order.id}
      emptyMessage="Your queue is clear."
      renderItem={(order) => <WorkOrderCard order={order} />}
    />
  </WorkQueue>
</Page>
```

## Forms

Load the `form-design` skill before you design or change a form. The rules
below tell you which kit component does each job. `FormShowcase` in
`src/components/kit/showcase-form.tsx` uses all of them.

### Choose The Control

Show a small closed set of choices. A dropdown hides the options and costs
two clicks, so use one only when the list is long or the row has no space.

| Answer | Control |
|---|---|
| One choice from 2 to about 7 short labels, such as a building, a status, or a person | `RadioGroup appearance="chips"`. Put a fact that helps the choice in `meta`, such as the open work of a person ("3 open"). |
| One choice from 2 to about 5 options that people compare, such as a priority or a plan | `RadioGroup appearance="cards"` with a `description` for each option. |
| One choice in a dense panel or a dialog with no space for chips or cards | `RadioGroup` (the `list` appearance). |
| One choice from more than about 7 options | `Select`. Use `ComboBox` when people know the name and type it, such as a customer. Use `Cascader` for a path in a hierarchy. |
| Several choices from a short list | `CheckboxGroup appearance="chips"` for short labels, `cards` (the default) when an option needs a description or a `meta` such as a duration. |
| Several choices from a long or searchable list | `MultiSelect`. |
| An answer that people may skip, such as the person who takes the work | `noneOption` on the `RadioGroup`, such as "Decide later" or "Leave in queue". Do not make people press a selected chip again to clear it. |
| A date that is usually in the next few days | `DatePicker` with `quickPicks` from `dayQuickPicks`. The date input stays for any other day. |
| A date range with common spans, such as the last 30 days | `DateRangePicker` with `presets`. |
| A setting that applies at once, outside a form | `ToggleGroup` for several on/off options, `SegmentedControl` for one view, `Switch` for one setting. These have no hint and no error, so do not use them for an answer that a form submits. |

### Size And Mark The Fields

- Set `width` from the expected answer, not from the column. A short box tells people that the answer is short.

  | `width` | Holds about | Use for |
  |---|---|---|
  | `xs` | 4 characters | A quantity, a floor, a room number. |
  | `sm` | 12 characters | A phone number, a date, an amount, a postal code. |
  | `md` | 24 characters | A name, a city. |
  | `lg` | 40 characters | An email, an address line, a URL. |
  | `full` (default) | The column | Free text, a `multiline` description, a title. |

  `DatePicker` defaults to `sm`. The `touch` density makes each width larger together with the text.
- Put related short fields on one line in a `FieldRow`, such as a name and an email, or a floor and a room.
- Mark the optional fields with `isOptional`, not the required ones. Most fields in a good form are required, so the marker goes where it is rare.
- A `placeholder` is an example answer that starts with "e.g.": "e.g. sam.lee@example.com". Never put an instruction or the label in a placeholder; it goes away when people type. Put an instruction in `description`.
- Set `autoComplete` on name, email, phone, and address fields. Set `autoFocus` on the first field of a form that opens for input.

### Validate And Show Errors

- Spread `formBehavior` into `useForm` and pass the schema as `validators: { onDynamic: schema }`. See Forms in `data.md`.
- Show each field message with `fieldError(field, hasSubmitAttempt)`. A message shows after people change a field and leave it, or after a submit attempt. Before a submit attempt, it never shows while people type.
- A message names the field and says how to fix it: "Enter the floor in 3 characters or fewer, like 12 or B2." Do not write "Invalid value" or "Required".
- Put an `ErrorSummary` first in a `FormLayout`. Its title counts the problems and names the action: "2 things to fix before you send the request". It takes focus on each submit attempt, and each item links to its field. Build the items with `formErrors` in the order of the fields on the page, and give each field the `id` that the item names.
- Do not disable the submit button while the form is invalid. People then cannot find out what is wrong. Disable it only while the submit runs.

### Lay Out A Long Form

- Use `FormLayout` on its own route for a form with more than about six fields or more than one part. Put a short form in a `Dialog`.
- Make each part a `Section layout="split"`. The title names the part ("Where", "When"). The description is one sentence that says what the answers change: "The kinds of work set the time estimate and the tools that the technician brings."
- Give `FormLayout` a `preview` when the answers make a record that people meet later, such as a card on a board. `FormPreview` shows the record with a dash for each empty answer.
- Give `FormLayout` a `footer`: a `FormFooter` with live facts in `summary`, such as a count or an estimate, then the cancel action and one primary submit `Button type="submit"`. The button names the action: "Send request".
- After a successful submit, replace the form with a success `Alert` with `announce="status"`. The title names the new record ("Request WO-2318 is in the queue"), the text says what happens next, and one action starts the next task, such as "Report another problem".

```tsx
<FormLayout id={formId} onSubmit={() => void form.handleSubmit()} aria-label="Report a building problem"
  preview={<form.Subscribe selector={(state) => state.values}>{(values) => <RequestPreview values={values} />}</form.Subscribe>}
  footer={<FormFooter summary={<FooterSummary />}>{cancel}<Button intent="primary" type="submit">Send request</Button></FormFooter>}>
  <ErrorSummary title={title} errors={errors} submitCount={submissionAttempts} />
  <Section layout="split" title="Where" description="A room number saves the technician a search of the floor.">
    <form.Field name="building">{(field) => (
      <RadioGroup id="request-building" label="Building" appearance="chips" options={buildingOptions}
        noneOption={{ label: "Not sure" }} value={field.state.value} onChange={field.handleChange}
        errorMessage={fieldError(field, hasSubmitAttempt)} />
    )}</form.Field>
  </Section>
</FormLayout>
```

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
- Place a list's search and filters by what they act on. Keep the search field first either way.
  - **Above the table, on the page,** when the toolbar holds only a search and `Filters` and the table is the page's one subject. A separate row reads as the page's controls at a glance.
  - **In the `DataTable` frame** (`toolbar` with a `Toolbar`) when the bar holds more controls, such as a scope `Select`, view actions, or the column menu, or when the page has several tables or several search fields and the controls must show which table they act on.
- Controls in one row share one height. The kit controls read the control size of their row, so do not set a size on each control:
  - Put a row of filters and view controls in a `Toolbar`. Set `size` on the `Toolbar` only when the default is wrong.
  - Wrap a row that is not a toolbar, such as a card header with a `SegmentedControl` and a `Button`, in `ControlSizeProvider` when it must be `sm`.
  - Field controls, `Filters`, `SegmentedControl`, and `ToggleGroup` have no `size` prop. A `Button` has `size` for a button that stands alone. `check` fails on an explicit `size` on a `Button` inside a `Toolbar`.
- Row selection is page state, not URL state. Ids on other pages stay selected; the bulk bar counts all of them. Bulk buttons name the count ("Delete 3 items"), and a destructive bulk action opens a `ConfirmDialog`.
- Keep hidden columns in a search param when people share the view, or in page state otherwise.
- Moves in `Kanban`, `SortableList`, `Tree`, `Gantt`, and `EventCalendar` are optimistic: apply the new value at once, persist it with a mutation, and on failure restore the previous value and show an error toast. Every drag has a keyboard path; never add a drag-only control.
- A change never leaves the focus on the page body. When an action moves or removes the focused item, the focus goes to the next item of the same group. With no item left, it goes to the heading of the group or to the collection. When a panel or an inline form closes, the control that opened it takes the focus again. `Kanban`, `SortableList`, and `WorkQueue` do this already. For a new collection, use `useFocusAfterRemoval` from `src/lib/focus.ts`.
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
- Do not join separate facts into one string with a middle dot, a bullet, or a vertical bar. Give each fact its own element and type role. Put peer facts on one line in a `MetaLine`: `<MetaLine items={["Production", "Attempt 2"]} />`. Show a count as a count badge, a status summary as figures with labels, and labelled metadata as label and value pairs. When the facts must stay in running text, write a full sentence: "Measured from catalog prices". Text without layout, such as an accessible name or a native `<option>`, uses ordinary punctuation. Follow Grouped Values And Metadata in the `ui-design` method (`references/method.md`). `check` fails on the separator (rule `separator-glyph`).
- A chip `meta` is one fact ("3 open"), and a hint is one sentence.
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
