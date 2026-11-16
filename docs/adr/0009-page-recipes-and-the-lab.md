# ADR 0009: Page Recipes And The Lab

## Status

Accepted. Extends ADR 0007 and ADR 0008. Replaces the design-kit showcase
routes of the template. ADR 0010 moves the `recipe` command to the `design`
CLI, and the lab joins the `app` block of `design-graph.json`.

## Context

The template had three showcase routes: `/design-kit`, `/design-kit/form`,
and `/design-kit/queue`. Their components were kit files in
`src/components/showcase/`, so `sync` wrote them into each app. They showed
many components on one page, in no real domain, so an agent could not copy a
page from them. They were also the only visual check of many components, and
each app carried about 1500 lines of demo code that it did not own.

## Decision

### A recipe is one complete page for one page type

A recipe is a small route in a generic domain, such as a help desk, access
requests, or work orders. It shows one common page type: a list page, a
detail page, a settings page, a form with a preview, a board, a touch queue,
an overview page, or an approval list.

- Each recipe starts with a doc comment. The summary names the page type.
  The introduction says when to use it and when not to. The tags are
  `@keywords`, `@components` (kit doc ids or exports), `@notes` (design note
  ids), and `@files`. The section `## Adapt it` lists the decisions that an
  agent makes when it adapts the recipe.
- A recipe has 250 lines at most (`RECIPE_LINE_LIMIT`). The example data and
  the app components of the recipe go in `@files`, under
  `src/features/lab/`, where an app keeps the code of a feature.
- The id is the PascalCase name of the file before the first dot, such as
  `DetailPage` for `detail-page.$ticketId.tsx`. A recipe id must not be a kit
  doc id or a kit export.

`scripts/lib/recipes.ts` parses the recipes with the text parser of
`scripts/lib/kit-docs.ts`.

### Recipes are in the skill, not in sync

The recipes are in `assets/lab/` of the skill, as an overlay of the template.
They are not in `assets/kit.json`, so `sync` never writes them into an app.

- A recipe is a starting point. The agent copies it into a feature and
  changes it. After the copy, the app owns the page. If `sync` owned it, the
  next `sync --write` would overwrite the changes of the app, or report a
  modified kit file.
- An app does not carry demo pages that it does not use.
- `internal-app recipe` reads the recipes of the skill, so the agent always
  gets the newest recipe. The recipes follow the newest kit. When the kit of
  the app does not have a component of the recipe, the command prints a
  warning that tells the agent to run `sync --write` first.

### Commands and search

- `internal-app recipe` lists the recipes. `internal-app recipe <Id>` prints
  one recipe in full, with its companion files, kit components, and notes.
  `internal-app recipe <Id>#files` prints the companion files.
- `internal-app design-entries` gives the recipes to `design search` as a
  second group of member entries, with the kind `recipe` and its own read
  command. A search for a page type thus finds the recipe next to the notes
  and the kit components.

### The lab is the visual check

`internal-app new <dir> --lab` copies `assets/lab/` over the scaffold. The
lab adds routes under `/lab` and an index page that links to each recipe. A
lab file must not replace a template file, so the lab scaffold verifies the
same app that ships.

In a scaffold with the lab, `internal-app check` also holds each recipe to
the recipe contract (rule `recipes`): the doc comment, the line limit, the
companion files, the kit components, and a link from the lab index.
`scripts/validate-skills` scaffolds a lab app and runs the build, the type
check, the lint, the format check, and `check` on it.

## Consequences

- A new app has no `/design-kit` routes. `sync` removes the old showcase
  files from an app whose lock records them. An app file that still imports
  them fails the build, and `kit-update` says what to do.
- A kit component that no recipe uses has no visual check page. A change to
  such a component needs its own page in a lab scaffold that is not copied
  back, as `kit-adding-a-component` says.
- The example stores of the recipes live in memory on the server. After a
  change, the server render and the browser can show different data until
  the next refetch. This is acceptable for example data only.
