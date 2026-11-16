---
id: kit-recipes
topic: kit
summary: What a recipe is, a complete small page that composes the kit for one page type in the lab of a use case, how to print and use one with design recipe, and the recipe contract that design check enforces.
keywords: [recipe, recipes, design recipe, page recipe, page example, page template, lab, lab scaffold, "--lab", recipe contract, adapt it, example data, companion files, "@files", "@components", list page recipe, detail page recipe, overview page recipe]
related: [kit-composition, kit-adding-a-component, kit-update, patterns]
---

# Kit Recipes

A recipe is a complete, small page that composes the kit for one page type, such as a list page or a settings page. Each recipe is in the lab of a use case, not in the kit. Copy the structure of the recipe that matches the task, then adapt it.

## Commands

- `design recipe` lists the recipes of the use case of the app.
- `design recipe <Id>` prints one recipe in full, with its components and its design notes.
- `design recipe <Id>#files` prints its companion files: its example data and its app components.
- `design search` finds the recipes together with the kit components.

In a folder without a kit lock, add `--app <use case>`. With `--json`, each command prints JSON.

## Use A Recipe

1. Print the recipe with `design recipe <Id>`, and print its files with `design recipe <Id>#files`.
2. Copy the page into `src/routes/`, and copy each companion file into `src/features/<name>/` of the feature.
3. Make each decision of the "Adapt it" section.
4. Replace the example data with the data module of the feature.

`design sync` does not write the recipes into an app, because a recipe is a start for app code that the app then owns. A recipe follows the newest kit. In an app with an older kit, `design recipe` names the components that the app does not have. Run `design sync --write` first.

## The Lab

`design new <dir> --app <use case> --lab` adds the recipe pages to a scaffold under `/lab`. The lab is the visual check of the kit. Open `/lab` before you add a component. After a kit change, capture the recipes that use the changed components in the two themes.

## The Recipe Contract

The use case names the two folders of its lab: the pages, such as `src/routes/_app/lab/`, and the companion files, such as `src/features/lab/`. In a scaffold with the lab, `design check` fails with the rule `recipes` when a recipe breaks one of these rules:

1. The page starts with a doc comment.
2. The comment starts with a summary: one sentence that names the page type and ends with a period.
3. An introduction follows: when to use the page type, and when not to.
4. The tags:
   - `@keywords`: at least 3 search terms, with the words that a builder types.
   - `@components`: the kit components that the page composes. Each one must be a kit doc id or a kit export.
   - `@notes`: the design notes that the page applies.
   - `@files`: optional. The companion files of the page, each one in the files folder of the lab.
5. A `## Adapt it` section gives the decisions that an agent makes when it adapts the recipe.
6. The page has at most 250 lines. Move the example data or an app component to a file in `@files`, or split the page.
7. The recipe id comes from the file name, such as `ListPage` from `list-page.tsx`. It must not be the id or an export of a kit file.
8. The lab index, `index.tsx` in the pages folder, links to the recipe with `to="<route>"`.
