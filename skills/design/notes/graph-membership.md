---
id: graph-membership
topic: graph
summary: How another skill joins the design graph with a design-graph.json file, prefixed note ids, specializes links that narrow hub notes, and an entries command that adds its components to search.
keywords: [graph membership, join the design graph from another skill, member skill, specialization, specialize, design-graph.json, sibling skill, product skill, extend design system, internal-app, skill folder, entries, component search, search entries, member components]
requires: [note-format]
related: [method]
---

# Graph Membership

A skill joins the design graph to narrow the design choices for one product or one stack. The hub skill `design` holds the general rules. A member skill holds the product rules.

## Join The Graph

1. Put the file `design-graph.json` in the root folder of the member skill.
2. Give it the key `notes`: the note folder, relative to the skill folder. Example: `{ "notes": "notes" }`.
3. Put the member notes in that folder, in the format of [[note-format]].
4. Start the id of each member note with the skill name and a hyphen, such as `internal-app-forms` for the skill `internal-app`. The skill name is the `name` in the `SKILL.md` of the member.
5. Link to the member notes from the `SKILL.md` of the member, with `design read <id>` or `[[id]]`.

The member note folder must stay inside the member skill folder. The membership file can also have the key `entries`. It has no other keys.

## Add Entries To Search

A member can add documents that are not notes to `design search`, such as the components of its kit. These documents are entries. Entries come from the project of the agent, so that they match the installed version.

1. Add `"entries": ["<script>", "<argument>", ...]` to `design-graph.json`. The script path is relative to the skill folder and stays inside it.
2. The CLI runs the script with its own runtime, in the working folder of the agent. The script finds its project from that folder, such as by a lock file.
3. The script prints one JSON object and exits with status 0:

   ```json
   { "read": "<command that prints one entry, with {id}>", "source": "<one line: where the entries come from>",
     "problems": ["<one line for each problem>"],
     "entries": [{ "id": "PriceTag", "kind": "component", "label": "pattern", "title": "PriceTag",
       "summary": "<one sentence>", "keywords": ["..."], "intro": "<text>",
       "sections": [{ "title": "<title>", "text": "<text>" }], "links": ["<note id>"] }] }
   ```

- An entry id is PascalCase, such as `PriceTag`. A note id is lowercase, so the two never collide.
- `links` names the notes that the entry applies. The check verifies each id. `design read <note>` lists the entries that link to it under "Implemented by".
- Search ranks entries and notes together. Each entry hit prints its `read` command. `design read <entry id>` prints that command too.
- The CLI prints the `problems` and a failed run as warnings in search. `design graph --check` fails on them.

## Where The CLI Looks

The CLI reads the notes of the hub. Then it reads each sibling skill folder that contains `design-graph.json`. A sibling is a folder next to the hub skill folder. The CLI looks in the parent of the hub folder as the agent invoked it, and in the parent of the resolved real path when the hub folder is a symbolic link.

The skill folder can be `.agents/skills/`, `.claude/skills/`, or the `skills/` folder of a repository. Install the member skill next to the hub skill, so that the CLI finds it.

## Specialize A Hub Note

- Add `specializes: [<hub id>]` to a member note that narrows a hub note.
- In the product of the member skill, the specialization wins where the two notes differ. The hub note stays valid for all other points.
- `design read <hub id>` lists the specializations under "Specialized by", so that an agent sees the narrower rule.
- A member note can also use `requires`, `related`, and body links to hub notes.

## Direction Of Links

- A hub note does not link to a member note. The hub must work without any member.
- A member note links to hub notes and to the notes of its own skill.
- A member skill can link to other skills with `skill:<name>`.

## Checks

`design graph --check` also verifies the membership:

- `design-graph.json` is valid JSON with the key `notes` and the optional key `entries`.
- The entries command runs, prints the JSON above, and gives unique ids and known note links.
- The note folder exists and stays inside the skill folder.
- The member has a `SKILL.md`.
- Each member note id starts with the member skill name and a hyphen.
- Each member note is reachable from a `SKILL.md` in the graph.
