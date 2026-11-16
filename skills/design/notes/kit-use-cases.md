---
id: kit-use-cases
topic: kit
summary: How a member skill becomes a use case of the kit with an app block that names its template, its lab, and its rules, and how design new, the kit lock, and the kit commands find the use case of an app.
keywords: [use case, app block, app template, starter app, kit lock, design new, member rules, use case rules, lab overlay, dotfile in template, appContract, kit.json lock, which kit an app uses]
requires: [graph-membership]
related: [kit-update, kit-recipes, kit-check-rules]
---

# Kit Use Cases

The hub skill `design` owns the kit and the one CLI. A use case is a member skill that narrows the kit for one kind of app, such as `internal-app`. It supplies the starter app, the recipes, and the extra check rules. The hub supplies the kit files.

## The App Block

Add the key `app` to the `design-graph.json` of a member skill when the member supplies apps that use the kit. [[graph-membership]] tells how a skill joins the graph.

```json
{ "notes": "notes",
  "app": { "template": "starter",
    "name": { "placeholder": "Internal app", "files": ["src/routes/__root.tsx"] },
    "lab": { "dir": "lab", "pages": "src/routes/_app/lab/", "route": "/lab/", "files": "src/features/lab/" },
    "rules": "scripts/rules.ts" } }
```

- `template` is required. It is the folder of the starter app, relative to the skill folder. It holds the app files that are not kit files, such as the routes and `package.json`.
- `name` is optional. `design new --name` replaces the `placeholder` text in each of the `files` with the app name.
- `lab` is optional. It is an overlay of the template with the recipe pages: `dir` in the skill, and `pages`, `route`, and `files` in the app. [[kit-recipes]] gives the recipe format.
- `rules` is optional. It is a module whose default export takes the rule helpers of the kit and returns `{ lineRules?, fileRules?, doctor? }`. `design check` and `design doctor` add these rules to the kit rules.

The template must not hold a kit file, because the kit files come only from the hub. A lab file must not replace a template file or a kit file. The template must export each name that `appContract` in the hub `kit.json` lists, and declare each package that a kit file imports.

Store each top-level dotfile of the template with `_` in place of the dot, such as `_gitignore`. Then the skill repository does not apply the file to itself. `design new` renames it.

## Apps Of A Use Case

- `design new <dir> --app <use case>` copies the template, the hub kit, and the lab with `--lab`. Then it writes the kit lock `<use case>.kit.json`, with the hash of each kit file.
- The kit lock tells the CLI the use case of the app. `design sync`, `design check`, and `design doctor` read it, so they need no `--app` inside an app.
- `design components`, `design docs`, and `design recipe` look for a kit lock from the working folder upward. Inside an app, they read the installed kit and the recipes of its use case. Outside an app, they read the hub kit and the recipes of each use case.
- [[kit-update]] tells how `design sync` updates the kit files of an app.
