# ADR 0010: The Hub Owns The Kit And The CLI

## Status

Accepted. Supersedes ADR 0007, and the sections "CLI" and "Graph membership"
of ADR 0006. Changes ADR 0005, ADR 0008, and ADR 0009 where they name
`scripts/internal-app`, `skills/internal-app/assets/kit.json`, or the kit
files in the template.

## Context

The kit, its docs, and the commands that read them lived in `internal-app`.
An agent used two CLIs: `design` for the rules, and `internal-app` for the
components, the docs, the recipes, and the app commands. The kit is the
design system in code, so a second kind of app could not use it without a
copy. `design search` ran a member script to get the component entries, and
the hub did not know its own components.

`internal-app` is a use case of the design system: it narrows the design
choices for one stack. It is not the owner of the design system.

## Decision

### The hub owns the kit

- `skills/design/assets/kit/` holds every kit file, and
  `skills/design/assets/kit.json` lists them.
- A kit doc comment links only to hub notes. The hub kit must work without
  the use cases.
- The kit rules of `design check` and the kit checks of `design doctor` are
  in the hub. The note `kit-check-rules` lists them.

### One CLI

`skills/design/scripts/design` is the only CLI. It has three groups of
commands:

- The notes: `search`, `read`, `list`, `links`, and `graph`.
- The kit: `components`, `docs <id>[#part]`, and `recipe [<id>[#part]]`.
- The apps: `new <dir> --app <use case>`, `sync`, `check`, and `doctor`.

`scripts/internal-app` is removed.

### Use cases

A member skill becomes a use case with the key `app` in its
`design-graph.json`. The block names the template, the optional app name
placeholder, the optional lab, and the optional rules module. The note
`kit-use-cases` gives the shape.

- The template holds only the app files that are not kit files. `design new`
  copies the template, then the hub kit, then the lab with `--lab`.
- `design new` writes the kit lock `<use case>.kit.json`. The lock tells
  `sync`, `check`, and `doctor` the use case of the app.
- The rules module of the use case adds line rules, file rules, and doctor
  checks to the kit rules. The CLI loads it in the same process, so the CLI
  stays synchronous and has no dependencies.

### Entries are native

The CLI builds the search entries itself. A kit component prints
`[component, <layer>]` and `read: design docs <id>`. A recipe prints
`[<use case> recipe, page]` and `read: design recipe <id>`. Inside an app,
the entries come from the installed kit and the lab of its use case. Outside
an app, they come from the hub kit and each lab. The key `entries` of
`design-graph.json` is removed.

### Checks

`design graph --check` verifies the kit and each use case: the files that
`kit.json` lists, a template that holds a kit file, a lab file that replaces
a template file or a kit file, the exports of `appContract`, the packages
that the kit imports, the rules module, the recipes, and the lab index.

## Consequences

- An agent uses one CLI for the rules, the components, the recipes, and the
  apps.
- A new use case adds a template, notes, and rules. It does not copy the kit.
- A project that installs only `design` gets the kit docs from the hub kit.
- An app that was made by `scripts/internal-app` keeps working: its lock file
  is `internal-app.kit.json`, which the new CLI reads.
- `validate-skills` scaffolds the `internal-app` use case with
  `design new --app internal-app`, with and without the lab, and installs,
  builds, typechecks, lints, and checks each scaffold.
