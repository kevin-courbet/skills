# ADR 0006: Design Hub

## Status

Accepted. Supersedes ADR 0002.

## Context

The `ui-design` and `form-design` skills shared one long method file and one
component pattern file. A script copied these files from `ui-design` to
`form-design`. An agent read about 4400 words before a first edit, and about
6000 words for a form. Most of these words did not apply to the task. Other
skills, such as `internal-app`, pointed to sections of the copied files by
title, and nothing verified these pointers.

## Decision

### One hub skill

The `design` skill is the hub of the design system. It replaces `ui-design`
and `form-design`. Its `SKILL.md` gives the taste rules, the process, and the
note ids for each step. It has at most 900 words.

### Notes

- The design rules live in small Markdown notes in `skills/design/notes/`.
  The note graph is the only source of design rules in this repository.
  There are no generated copies.
- A note has one topic and at most 1000 words. Each `##` section is
  readable alone.
- Each note starts with front matter: `id`, `topic`, a one-sentence
  `summary`, and `keywords` that include synonyms and common wrong terms.
- Typed links connect the notes. `requires` names notes to read first.
  `related` names notes on near topics. `specializes` names hub notes that a
  member note narrows. `[[id]]` and `[[id#section]]` in prose, and
  `design read <id>` anywhere, are links of the type `mentions`.
  `skill:<name>` names another skill, such as
  `skill:create-data-visualizations`.
- A rule has one place. Other notes link to that place.

The note `note-format` gives the full format.

### CLI

`skills/design/scripts/design` is a bun script without dependencies, a
build step, or network access. Agents run it as
`bun "$SKILL_DIR/scripts/design" <command>`:

- `search <query>` ranks notes and sections by their id, summary, keywords,
  titles, and body, and corrects small typing errors.
- `read <id>`, `read <id>#<section>`, and `read <id> --outline` print a note,
  one section, or the section list with word counts.
- `list` prints all notes by topic.
- `links <id>` prints the outgoing and incoming links of a note.
- `graph --check` verifies the front matter, the links, the sections, the
  word limits, the asset paths, the reachability of each note from a
  `SKILL.md`, and the membership files.

The output is plain text when the output is not a terminal. An unknown id or
section is an error that names the nearest matches.

### Graph membership

Another skill joins the graph with a `design-graph.json` file in its root
folder: `{ "notes": "notes" }`. The CLI reads the hub notes and the notes of
each sibling skill folder with this file. Sibling folders are the folders
next to the hub in `.agents/skills/`, `.claude/skills/`, or the `skills/`
folder of a repository. The CLI also looks next to the resolved real path
when the hub folder is a symbolic link.

Member note ids start with the member skill name and a hyphen. A member note
can specialize a hub note. Where the two notes differ, the specialization
wins in the product of the member. A hub note does not link to a member
note, so that the hub works without its members. The note
`graph-membership` gives the full contract.

## Consequences

- An agent reads `SKILL.md` and then only the notes that its task needs.
- `internal-app` points to notes by id, such as `design read forms`.
  `validate-skills` runs each of these commands, so a broken pointer fails
  validation.
- A later change can make `internal-app` a member of the graph and move
  other design skills, such as `frontend-design`, into the hub, without a
  change to the note format or the CLI.
- `validate-skills` runs the CLI tests, which include about 40 golden search
  queries, and `design graph --check`.
