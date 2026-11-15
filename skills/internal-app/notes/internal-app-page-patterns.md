---
id: internal-app-page-patterns
topic: internal-app
summary: The page patterns of an internal app with their template routes and recipes, the container for each task, and the lab scaffold that shows each recipe.
keywords: [page pattern, list page, detail page, overview page, settings page, create dialog, long form route, touch queue, work board, approval list, which container, dialog or sheet, peek, template routes, recipe, recipes, lab, page example, page template]
specializes: [patterns, overlays]
related: [internal-app-forms, internal-app-touch-work-view, internal-app-composition]
---

# Internal App Page Patterns

Each page pattern has a working example: a template route, a recipe, or the two. Copy the structure of the example that matches the task. Read each kit component with `internal-app docs <Id>`, and list them all with `internal-app components`.

## Patterns

| Pattern | Template route | Recipe | Structure |
| --- | --- | --- | --- |
| Overview | `_app/index.tsx` | `OverviewPage` | `PageHeader`, a `StatStrip` that links each count to the filtered list, a `StatTile` grid, and a `TrendChart` in a `Section`. |
| List | `_app/items/index.tsx` | `ListPage` | `PageHeader` with one primary action. A page `Toolbar` with a `SearchField` and `Filters` above the `DataTable`. A row link to the detail route, the name column pinned, and `StatusDot` for the status. The search, the filters, the sort, and the page live in the URL. |
| Detail | `_app/items/$itemId.tsx` | `DetailPage` | `Page width="reading"`, a `PageHeader` with quiet actions, a `DescriptionList` in a `Section`, and a `ConfirmDialog` for delete. |
| Create | `features/items/ui/create-item-dialog.tsx` | none | A `Dialog` with a TanStack Form. The submit button in the footer uses `form={formId}`. |
| Long form | none | `PreviewForm` | See [[internal-app-forms]]. |
| Settings | `_app/settings.tsx` | `SettingsPage` | A page of reading width with `SettingsCard` and `SettingRow`. Each change saves on its own. |
| Board | none | `WorkBoard` | A `Kanban` of stages, with a peek `Sheet` for one card. |
| Touch queue | none | `TouchQueue` | See [[internal-app-touch-work-view]]. |
| Approval list | none | `ApprovalList` | Two `Card` lists, with decisions in a view transition. See [[internal-app-motion]]. |

## Recipes

A recipe is a complete, small page in a generic domain for one page type. It starts with a doc comment: the page type, when to use it, the kit components and the design notes that it uses, and an "Adapt it" section with the decisions to make. Its example data is in a separate file under `src/features/lab/`.

- `internal-app recipe` lists the recipes.
- `internal-app recipe <Id>` prints one recipe in full.
- `internal-app recipe <Id>#files` prints its example data and its app components.
- `design search` finds the recipes with the kit components.

To use a recipe, copy the page into `src/routes/`, and copy each companion file into `src/features/<name>/`. Then make each decision of "Adapt it". Replace the example data with the api module of the feature.

The recipes live in the skill, not in the kit. `sync` does not write them into an app, because a recipe is a start for app code that the app then owns. A recipe follows the newest kit. In an app with an older kit, `internal-app recipe` names the components that the app does not have. Run `sync --write` first.

## The Lab

`internal-app new <dir> --lab` adds the recipe pages to a scaffold under `/lab`. The lab is the visual check of the kit. Open `/lab` before you add a component. After a kit change, capture the recipes that use the changed components in the two themes. In a scaffold with the lab, `check` also fails on a recipe that breaks the recipe contract: no doc comment, no "Adapt it" section, an unknown component, more than 250 lines, or no link on the `/lab` index.

## Choose The Container

- A short create or edit task, up to about six fields: `Dialog`.
- A detail or an edit that is easier with the list behind it: `Sheet`.
- Records that people read one after another from a list: `Sheet size="peek"` with `navigation` and an "Open page" link to the detail route. Keep the open record in a search param.
- A long form, with more than about six fields, or a record with many sections: a route of its own with `FormLayout`. See [[internal-app-forms]].
- An irreversible action: `ConfirmDialog`.
