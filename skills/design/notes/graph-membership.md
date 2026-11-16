---
id: graph-membership
topic: graph
summary: How another skill joins the design graph with a design-graph.json file, prefixed note ids, and specializes links that narrow hub notes, which entries search ranks with the notes, and the checks of the membership.
keywords: [graph membership, join the design graph from another skill, member skill, specialization, specialize, design-graph.json, sibling skill, product skill, extend design system, internal-app, skill folder, search entries, implemented by, specialized by]
requires: [note-format]
related: [method, kit-use-cases]
---

# Graph Membership

A skill joins the design graph to narrow the design choices for one product or one stack. The hub skill `design` holds the general rules, the kit, and the one CLI. A member skill holds the product rules. A member with an `app` block is also a use case of the kit: it supplies the starter app, and the hub supplies the kit files.

## Join The Graph

1. Put the file `design-graph.json` in the root folder of the member skill.
2. Give it the key `notes`: the note folder, relative to the skill folder. Example: `{ "notes": "notes" }`.
3. Put the member notes in that folder, in the format of [[note-format]].
4. Start the id of each member note with the skill name and a hyphen, such as `internal-app-routes` for the skill `internal-app`. The skill name is the `name` in the `SKILL.md` of the member.
5. Link to the member notes from the `SKILL.md` of the member, with `design read <id>` or `[[id]]`.

The member note folder must stay inside the member skill folder. The membership file can also have the key `app`. It has no other keys.

## Add A Use Case

Add the key `app` when the member supplies apps that use the kit. [[kit-use-cases]] gives the shape of the block, the rules for the template and the lab, and the commands for the apps of a use case.

## Entries In Search

Search ranks two kinds of entries with the notes:

- Each kit component with a doc comment. Search prints `[component, <layer>]` and `read: design docs <id>`. The component belongs to the hub.
- Each recipe of a lab. Search prints `[<use case> recipe, page]` and `read: design recipe <id>`. The recipe belongs to the use case.

An entry id is PascalCase, such as `PriceTag`. A note id is lowercase, so the two never collide. `design read <note>` lists the components that link to the note under "Implemented by". `design read <entry id>` prints the read command of the entry.

## Where The CLI Looks

The CLI reads the notes of the hub. Then it reads each sibling skill folder that contains `design-graph.json`. A sibling is a folder next to the hub skill folder. The CLI looks in the parent of the hub folder, and also in the parent of its real path when the hub folder is a symbolic link.

The skill folder can be `.agents/skills/`, `.claude/skills/`, or the `skills/` folder of a repository. Install the member skill next to the hub skill, so that the CLI finds it.

## Specialize A Hub Note

- Add `specializes: [<hub id>]` to a member note that narrows a hub note.
- In the product of the member skill, the specialization wins where the two notes differ. The hub note stays valid for all other points.
- `design read <hub id>` lists the specializations under "Specialized by", so that an agent sees the narrower rule.
- A member note can also link to hub notes with `requires`, `related`, and body links.

## Direction Of Links

- A hub note does not link to a member note. A kit doc comment does not link to a member note. The hub must work without any member.
- A member note links to hub notes and to the notes of its own skill.
- A member skill can link to other skills with `skill:<name>`.

## Checks

`design graph --check` also verifies the membership and the use cases:

- `design-graph.json` is valid JSON with the key `notes` and the optional key `app`, and the `app` block has the shape above.
- The note folder exists and stays inside the skill folder.
- The member has a `SKILL.md` with at most 900 words in its body, as the hub `SKILL.md` has.
- Each member note id starts with the member skill name and a hyphen.
- Each member note is reachable from a `SKILL.md` in the graph.
- Each template and lab keeps the rules of [[kit-use-cases]], and each rules module loads.
- Each recipe uses only kit components, and the lab index links to each recipe.
