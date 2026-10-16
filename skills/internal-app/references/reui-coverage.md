# ReUI Coverage

This file records how the kit covers the free, MIT-licensed ReUI components
(https://reui.io, commit 067aa0dc7f8bbfec1cd76fc5ad31f842be5f569a). Only free
components and examples were used. No ReUI Pro block or template was used.

The test for each item: does an internal tool (an operations console, an
admin, a back office, or a data app) plausibly use it? Ported items are
re-implemented with StyleX, react-aria-components, and lucide.
`THIRD_PARTY_NOTICES.md` lists every kit file that uses ReUI behavior or
design.

Decisions:

- **Covered**: an existing kit primitive does the job. No ReUI port was needed.
- **Ported**: the kit file re-implements the ReUI component or example category.
- **Skipped**: the kit leaves it out for the reason given.

## ReUI Components

These are ReUI's own components (`registry-reui/bases/base/reui` and the
ReUI-authored parts of `registry/bases/base/ui`).

| ReUI | Decision | Kit file | Reason |
|---|---|---|---|
| Alert | Ported (phase 1) | `alert.tsx` | Page and object notices. |
| Autocomplete | Covered | `combo-box.tsx`, `command-palette.tsx` | ComboBox filters long lists; the command palette searches pages and actions. |
| Badge | Ported (phase 1) | `badge.tsx` | Status labels. |
| Cascader | Ported (phase 1) | `cascader.tsx` | Choices from a tree, such as region and city. |
| Code Block | Ported | `code-block.tsx` | Config, payloads, queries, diffs, and diagnostics with copy and wrap. A small built-in highlighter replaces Shiki. |
| Color Picker | Skipped | — | Kit colors come from tokens. Free colors in app data break the token rule; pick an `intent` from a Select. |
| Data Grid | Ported (phase 1) | `data-table.tsx` | Tables with selection, pinning, resizing, and virtualization. |
| Date Selector | Covered | `date-picker.tsx`, `date-range-picker.tsx`, `filters.tsx` | Dates, ranges with presets, and date filters. |
| Emoji Picker | Skipped | — | Internal tools do not need emoji input. |
| Event Calendar | Ported | `event-calendar.tsx` | On-call shifts, maintenance windows, and jobs in month, week, and agenda views. Recurrence, resources, and drag to reschedule are not ported. |
| File Type | Ported | `file-type-icon.tsx` | File family icons for uploads, trees, and attachments, drawn with lucide instead of brand artwork. |
| Filters | Ported (phase 1) | `filters.tsx`, `filter-params.ts` | List filters in the URL. |
| Frame | Ported (phase 1) | `layout.tsx` (`Card`, `CardSection`) | Cards divided into sections. |
| Gantt | Ported | `gantt.tsx` | Plans with progress, milestones, dependencies, and keyboard and pointer rescheduling. Recurrence and resource capacity views are not ported. |
| Icon Stack | Skipped | — | A decorative isometric illustration; `IconTile` covers empty states. |
| Icon Tile | Ported | `icon-tile.tsx` | Media for list rows and empty states. |
| Kanban | Ported | `kanban.tsx` | Stage boards, such as incidents, with keyboard drag and drop. Column reordering is not ported: stages are fixed. |
| Number Field | Ported | `number-field.tsx` | Stepper buttons and units on the existing field. |
| Phone Input | Skipped | — | Correct formatting needs a phone number library. Use `TextField` with `type="tel"`. |
| Rating | Skipped | — | Star ratings are a consumer pattern. Use `RadioGroup` or `Select` for a score. |
| Scrollspy | Ported | `scrollspy.tsx` | Section links on long settings and detail pages. |
| Signature Pad | Skipped | — | Internal tools do not collect signatures. |
| Sortable | Ported | `sortable-list.tsx` | Priority orders, column orders, and widget grids with keyboard drag and drop. |
| Stepper | Ported (phase 1) | `stepper.tsx` | Wizards and pipeline status. |
| Time Picker | Ported | `time-field.tsx` | Times of day with a time zone label. The column popover is not ported: typed segments are faster and accessible. |
| Timeline | Ported (phase 1) | `timeline.tsx` | Activity and audit feeds. |
| Trace | Ported | `trace.tsx` | Run steps that open to their output, and a span waterfall for distributed traces. |
| Tree | Ported | `tree.tsx` | Folders, categories, and permissions with cascading checkboxes and drag and drop. |
| Marker | Covered | `trace.tsx`, `badge.tsx` (`StatusDot`) | One status line per step. |
| Item | Ported | `item.tsx` | Integration, member, and account rows. |
| Bubble, Message, Message Scroller, Attachment | Skipped | — | Chat interfaces. Comments and history use `Timeline`; files use `FileUpload` and `FileTypeIcon`. |
| Questionnaire | Skipped | — | Survey flows are not an internal-tool pattern. Forms use the field primitives. |

## Example Categories

These are the shadcn/ui-based component categories in the ReUI registry
(`registry-reui/bases/base/components`).

| Category | Decision | Kit file | Reason |
|---|---|---|---|
| Accordion, Collapsible | Covered | `disclosure.tsx` | `Disclosure` and `Accordion`. |
| Alert Dialog | Covered | `confirm-dialog.tsx` | Confirmations that name the object and the effect. |
| Aspect Ratio | Skipped | — | A CSS property; no primitive needed. |
| Avatar | Covered | `avatar.tsx` | People and service accounts. |
| Breadcrumb | Covered | `breadcrumbs.tsx` | Route breadcrumbs. |
| Button | Covered | `button.tsx` | Intents and sizes. |
| Button Group | Ported | `button.tsx` (`ButtonGroup`) | Split buttons, zoom controls, and joined actions. |
| Calendar | Covered | `calendar.tsx`, `date-picker.tsx` | Calendar grids in the pickers. |
| Card | Covered | `layout.tsx` | `Card` and `CardSection`. |
| Carousel | Skipped | — | Internal pages show all items in lists or grids. |
| Chart | Covered | Aperture (`references/charts.md`) | Charts use Aperture. |
| Checkbox | Covered | `checkbox.tsx` | Includes indeterminate. |
| Combobox | Covered | `combo-box.tsx`, `multi-select.tsx` | Single and multiple choices. |
| Command | Covered | `command-palette.tsx` | App-wide command palette. |
| Context Menu | Ported | `menu.tsx` (`ContextMenu`) | Right-click and Shift+F10 menus on rows and cards. |
| Dialog | Covered | `dialog.tsx` | Short tasks. |
| Drawer | Covered | `sheet.tsx` | Edge panels and peeks. |
| Dropdown Menu | Covered | `menu.tsx` | Row and overflow actions. |
| Empty | Ported | `feedback.tsx` (`EmptyState`) | Icon tile, two actions, a dashed first-run variant, and a small size. |
| Field, Input, Label, Textarea | Covered | `text-field.tsx`, `field.tsx` | Labeled fields with errors. |
| Hover Card | Ported | `hover-card.tsx` | Previews of people and records on links. |
| Input Group | Ported | `text-field.tsx` (`prefix`, `suffix`) | Fixed parts, icons, hints, spinners, and copy buttons inside a field. |
| Input OTP | Skipped | — | Internal apps sign in through single sign-on. |
| Kbd | Covered | `layout.tsx` (`Kbd`) | Shortcut hints. |
| Menubar | Skipped | — | The app shell holds navigation; pages use toolbars and menus. |
| Native Select | Covered | `select.tsx` | One select primitive. |
| Navigation Menu | Skipped | — | The app shell sidebar is the navigation. |
| Pagination | Covered | `pagination.tsx`, `data-table.tsx` | Page footers. |
| Popover | Covered | `popover.tsx` | Anchored panels. |
| Progress | Covered | `progress-bar.tsx`, `meter.tsx` | Task progress and levels. |
| Radio Group | Covered | `radio-group.tsx` | Visible choices. |
| Resizable | Ported | `resizable-panels.tsx` | List and detail splits with keyboard window splitters. |
| Scroll Area | Skipped | — | Native scrolling keeps platform behavior. |
| Select | Covered | `select.tsx` | Short fixed lists. |
| Separator | Covered | `layout.tsx` (`Separator`) | Dividers. |
| Sheet | Covered | `sheet.tsx` | Edge panels. |
| Sidebar | Covered | `app-shell.tsx` | The app frame. |
| Skeleton | Covered | `feedback.tsx` (`Skeleton`) | Client-side loading. |
| Slider | Ported | `slider.tsx` | Thresholds, sampling rates, and ranges. |
| Sonner | Covered | `toaster.tsx` | Failure toasts. |
| Spinner | Ported | `feedback.tsx` (`Spinner`) | Sizes for buttons, fields, and panels. |
| Switch | Covered | `switch.tsx` | Settings that apply at once. |
| Table | Covered | `data-table.tsx` | Semantic tables. |
| Tabs | Covered | `tabs.tsx` | In-page sections. |
| Toggle, Toggle Group | Ported | `toggle-group.tsx` | Multiple on/off options, such as run days. `SegmentedControl` covers one choice. |
| Tooltip | Covered | `tooltip.tsx` | Short hints. |
