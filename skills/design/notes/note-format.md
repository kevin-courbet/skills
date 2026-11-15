---
id: note-format
topic: graph
summary: The format of a design note, its front matter, its link types, and the checks that design graph --check runs.
keywords: [note format, front matter, frontmatter, yaml, link types, requires, related, specializes, mentions, wiki link, word limit, graph check, add a note, write a note, edit a note]
related: [graph-membership]
---

# Note Format

The note graph is the only source of design rules. A rule has one place: one note section. Other notes link to that section. They do not repeat the rule.

## Files

- A note is one Markdown file in the `notes` folder of its skill. The folder is flat.
- The file name is the id followed by `.md`.
- A note has one topic. Split a note when it covers two topics.
- A note has at most 1000 words in its body. The `SKILL.md` of each skill in the graph, the hub and each member, has at most 900 words in its body.

## Front Matter

The file starts with front matter between two `---` lines. Each key has one line. A list is on one line, as `[a, b, c]`. Indented lines and multi-line values are not permitted. Quote a value that contains `: ` or ` #`, or that starts with a YAML indicator.

| Key | Required | Value |
| --- | --- | --- |
| `id` | yes | Kebab-case, stable, and unique in the graph. It is the file name. |
| `topic` | yes | Kebab-case group for `design list`. |
| `summary` | yes | One sentence that ends with a period. |
| `keywords` | yes | At least 3 search terms. Include synonyms and common wrong terms. |
| `requires` | no | Notes to read before this note. |
| `related` | no | Notes on near topics. |
| `specializes` | no | Hub notes that this note narrows. Only member notes use it. |

Do not change an id after other skills use it. An id is part of the contract of the graph.

## Link Targets

- `<id>` names a note.
- `<id>#<section>` names a section. The section part is the slug of the `##` title: lowercase, with a hyphen between words.
- `skill:<name>` names another skill. The check accepts it but does not resolve it, because the skill can be absent from an installation.

## Links In The Body

- `[[id]]`, `[[id#section]]`, and `[[skill:name]]` in prose are links of the type `mentions`. Inside code, they are not links.
- `design read <id>` and `design links <id>` count as links everywhere, also inside code.
- To follow a link, run `design read <id>` or `design read <id>#<section>`.

## Body

- The body starts with one `# title`. Then an optional short introduction.
- Each `##` section is readable alone, because `design read <id>#<section>` prints only that section.
- Section titles are unique in a note.
- Write in ASD-STE100: short sentences, active voice, and the imperative for instructions.
- Name an asset by its path relative to the skill folder, such as `assets/themes/graphite.css`. The check verifies that the file exists.

## What The Check Verifies

`design graph --check` exits with status 1 and prints `file:line: message` for each problem:

- Missing or wrong front matter, an unknown key, or an id that does not match the file name.
- A duplicate id or a duplicate section title.
- A broken link to a note or a section.
- A note over the word limit, or a `SKILL.md` of the hub or of a member over its limit.
- An asset path that does not exist.
- A note that no `SKILL.md` in the graph reaches through links.
- A hub note that links to a member note.
- Problems in a membership file. [[graph-membership]] gives the contract.
