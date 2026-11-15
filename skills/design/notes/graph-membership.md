---
id: graph-membership
topic: graph
summary: How another skill joins the design graph with a design-graph.json file, prefixed note ids, and specializes links that narrow hub notes.
keywords: [graph membership, join the design graph from another skill, member skill, specialization, specialize, design-graph.json, sibling skill, product skill, extend design system, internal-app, skill folder]
requires: [note-format]
related: [method]
---

# Graph Membership

A skill joins the design graph to narrow the design choices for one product or one stack. The hub skill `design` holds the general rules. A member skill holds the product rules.

## Join The Graph

1. Put the file `design-graph.json` in the root folder of the member skill.
2. Give it one key, `notes`: the note folder, relative to the skill folder. Example: `{ "notes": "notes" }`.
3. Put the member notes in that folder, in the format of [[note-format]].
4. Start the id of each member note with the skill name and a hyphen, such as `internal-app-forms` for the skill `internal-app`. The skill name is the `name` in the `SKILL.md` of the member.
5. Link to the member notes from the `SKILL.md` of the member, with `design read <id>` or `[[id]]`.

The member note folder must stay inside the member skill folder. The membership file has no other keys.

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

- `design-graph.json` is valid JSON with the key `notes` only.
- The note folder exists and stays inside the skill folder.
- The member has a `SKILL.md`.
- Each member note id starts with the member skill name and a hyphen.
- Each member note is reachable from a `SKILL.md` in the graph.
