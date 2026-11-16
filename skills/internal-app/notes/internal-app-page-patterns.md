---
id: internal-app-page-patterns
topic: internal-app
summary: The page patterns of an internal app with their template routes and the recipes of the internal-app lab, and how to start a page from a recipe.
keywords: [page pattern, list page, detail page, overview page, settings page, create dialog, long form route, touch queue, work board, approval list, template routes, recipe, recipes, lab, page example, page template, internal app recipes]
specializes: [patterns, kit-recipes]
related: [kit-composition, kit-forms, kit-touch-work-view]
---

# Internal App Page Patterns

Each page pattern of an internal app has a working example: a route of the template, a recipe of the lab of this skill, or the two. Copy the structure of the example that matches the task. Read each kit component with `design docs <Id>`, and list them all with `design components`. [[kit-composition]] gives the rules that join the components, and the container for each task.

## Patterns

| Pattern | Template route | Recipe | Structure |
| --- | --- | --- | --- |
| Overview | `_app/index.tsx` | `OverviewPage` | `PageHeader`, a `StatStrip` that links each count to the filtered list, a `StatTile` grid, and a `TrendChart` in a `Section`. |
| List | `_app/items/index.tsx` | `ListPage` | `PageHeader` with one primary action. A page `Toolbar` with a `SearchField` and `Filters` above the `DataTable`. A row link to the detail route, the name column pinned, and `StatusDot` for the status. The search, the filters, the sort, and the page live in the URL. |
| Detail | `_app/items/$itemId.tsx` | `DetailPage` | `Page width="reading"`, a `PageHeader` with quiet actions, a `DescriptionList` in a `Section`, and a `ConfirmDialog` for delete. |
| Create | `features/items/ui/create-item-dialog.tsx` | none | A `Dialog` with a TanStack Form. The submit button in the footer uses `form={formId}`. |
| Long form | none | `PreviewForm` | See [[kit-forms]]. |
| Settings | `_app/settings.tsx` | `SettingsPage` | A page of reading width with `SettingsCard` and `SettingRow`. Each change saves on its own. |
| Board | none | `WorkBoard` | A `Kanban` of stages, with a peek `Sheet` for one card. |
| Touch queue | none | `TouchQueue` | See [[kit-touch-work-view]]. |
| Approval list | none | `ApprovalList` | Two `Card` lists, with decisions in a view transition. See [[kit-motion]]. |

## Recipes

The recipes of the table are in the lab of this skill. [[kit-recipes]] tells how to print a recipe, how to use it, and the recipe contract.

- `design recipe` lists the recipes, and `design recipe ListPage` prints one.
- `design recipe PreviewForm#files` prints the example data and the app components of a recipe.
- `design new <dir> --app internal-app --lab` adds the recipe pages to a scaffold under `/lab`.

Copy the page into `src/routes/_app/`, and copy each companion file from `src/features/lab/` into `src/features/<name>/`. Replace the example data with the `api.ts` module of the feature ([[internal-app-server-functions#the-api-ts-file]]).
