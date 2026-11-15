# ADR 0007: Kit Component Discovery

## Status

Accepted. Extends ADR 0005 and ADR 0006.

## Context

The components of the `internal-app` kit had their docs in
`references/components.md`. An agent read the whole file, about 4000 words,
before it could choose one component. The file described the newest kit in
the skill, not the kit that an app has installed. `design search` did not
find components, so an agent needed two search methods: `design search` for
the rules and `components.md` for the components.

## Decision

### Docs live in the source

Each file that `assets/kit.json` lists under `docs` starts with a doc
comment. The comment gives a summary sentence, `@layer`, `@keywords`,
`@related` (kit doc ids or exports), and `@notes` (design note ids). Then it
gives an introduction that names the alternatives, and the sections
`## Behavior`, `## Rules`, and `## Example`. Each exported prop has its own
comment. The doc id is the PascalCase name of the file, such as `Kanban` for
`kanban.tsx`.

The layers are `primitive`, `pattern`, `shell`, and `helper`. A helper is a
kit file that a page does not render alone, such as `Field`, `Overlay`, or
`Motion`. ADR 0008 puts each kit file in the folder of its layer.

The parser in `scripts/lib/kit-docs.ts` uses text parsing only. It has no
TypeScript compiler, no dependencies, and no build step. `internal-app check`
and `doctor` fail when a documented file has no doc comment, no layer, a
required section is missing, a prop has no comment, or an `@related` name is
not in the kit.

### Commands of `internal-app`

- `components [dir]` lists the kit components, grouped by layer, one line
  each. The line is the summary of the doc comment, so the catalog stores no
  fact a second time.
- `docs <id>[#part] [dir]` prints one doc comment and the exported props with
  their types and comments. Above 500 words, it prints an outline, and the
  agent prints one part.
- `design-entries [dir]` prints the docs as search entries for the `design`
  skill.

These commands find the app from the working folder: the nearest folder
upward with `internal-app.kit.json`. They read the kit files of that app, so
the docs match the installed version. Outside an app, they read the template
of the skill and say so.

The commands live in `internal-app` because only that skill knows the app
layout, the lock file, and the doc format. `check` and `doctor` use the same
parser.

### Entries in the design graph

A member skill can add entries to `design search` with the key `entries` in
`design-graph.json`, such as `["scripts/internal-app", "design-entries"]`.
The `design` CLI runs this command with its own runtime in the working folder
of the agent, and reads one JSON object. Entry ids are PascalCase, so that
they never equal a note id. Search ranks entries and notes together, and each
entry hit prints the command that reads it. An entry links to the notes that
it applies, and `design read <note>` lists these entries under "Implemented
by". The note `graph-membership` gives the contract.

The `design` CLI has no knowledge of `internal-app`. It works without members
and without an app.

### General rules are notes

The rules of `components.md` that apply to more than one component are
`internal-app` notes, such as `internal-app-forms` and
`internal-app-composition`. Each note specializes the hub note that it
narrows. `components.md` is removed.

## Consequences

- An agent uses one search: `design search` finds the notes and the
  components, and each component hit names its `docs` command.
- A change to a component and to its docs is one change to one file.
- An app that has not run `sync --write` after this change has no doc
  comments. `docs` then tells the agent to run `sync --write`.
- `validate-skills` runs the tests of `skills/internal-app/tests`. They
  include golden search queries and paraphrases that must rank the expected
  id in the top 3, and a word limit for each printed doc.
