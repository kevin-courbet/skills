---
id: internal-app-page-patterns
topic: internal-app
summary: The page patterns of an internal app with their template routes, the container for each task, and the design-kit routes that show every kit component.
keywords: [page pattern, list page, detail page, overview page, settings page, create dialog, long form route, touch queue, which container, dialog or sheet, peek, template routes, design kit route, showcase]
specializes: [patterns, overlays]
related: [internal-app-forms, internal-app-touch-work-view, internal-app-composition]
---

# Internal App Page Patterns

The template has one working example of each page pattern. Copy the structure of the example that matches the task. Read each kit component with `internal-app docs <Id>`, and list them all with `internal-app components`.

## Patterns

| Pattern | Template route | Structure |
| --- | --- | --- |
| Overview | `_app/index.tsx` | `PageHeader`, a `StatTile` grid with a source `footnote`, and a `TrendChart` in a `Section`. |
| List | `_app/items/index.tsx` | `PageHeader` with one primary action. A page `Toolbar` with a `SearchField` and `Filters` above the `DataTable`. A row link to the detail route, the name column pinned, `StatusDot` for the status, a summary footer, and the `pagination` footer. The search, the filters, the sort, and the page live in the URL. `features/items/filters.ts` holds the filter fields and builds the server query from the search. |
| Detail | `_app/items/$itemId.tsx` | `Page width="reading"`, a `PageHeader` with quiet actions, a `DescriptionList` in a `Section`, and a `ConfirmDialog` for delete. |
| Create | `features/items/ui/create-item-dialog.tsx` | A `Dialog` with a TanStack Form. The submit button in the footer uses `form={formId}`. The status is a `RadioGroup appearance="chips"`. |
| Long form | `_app/design-kit_.form.tsx` with `components/kit/showcase-form.tsx` | See [[internal-app-forms]]. |
| Touch queue | `_app/design-kit_.queue.tsx` with `components/kit/showcase-queue.tsx` | See [[internal-app-touch-work-view]]. |
| Settings | `_app/settings.tsx` | A page of reading width with `SettingsCard` and `SettingRow`. Identifiers use `Identifier`. |

## Choose The Container

- A short create or edit task, up to about six fields: `Dialog`.
- A detail or an edit that is easier with the list behind it: `Sheet`.
- Records that people read one after another from a list: `Sheet size="peek"` with `navigation` and an "Open page" link to the detail route. Keep the open record in a search param.
- A long form, with more than about six fields, or a record with many sections: a route of its own with `FormLayout`. See [[internal-app-forms]].
- An irreversible action: `ConfirmDialog`.

## Design Kit Routes

The template renders every kit component for visual checks. Open these routes before you add a component, and capture them in both themes after a kit change.

| Route | Component | Shows |
| --- | --- | --- |
| `/design-kit` | `KitShowcase` | Every primitive in all its states. |
| `/design-kit` | `OperationsShowcase` in `src/components/kit/showcase-operations.tsx` | Filters, status, pipelines, activity, and detail cards. |
| `/design-kit` | `WorkspaceShowcase` in `src/components/kit/showcase-workspace.tsx` | Traces, boards, trees, sortable lists, code, calendars, schedules, and panels. |
| `/design-kit` | `ControlsShowcase` in `src/components/kit/showcase-controls.tsx` | Items, field add-ons, toggles, sliders, hover cards, and context menus. |
| `/design-kit` | `MotionShowcase` in `src/components/kit/showcase-motion.tsx` | Each motion helper on one list. |
| `/design-kit/form` | `FormShowcase` in `src/components/kit/showcase-form.tsx` | A long form that uses every form component. |
| `/design-kit/queue` | `QueueShowcase` in `src/components/kit/showcase-queue.tsx` | A touch work view on a shared tablet. |
