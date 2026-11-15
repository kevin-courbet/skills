---
name: design
description: Design, review, or refactor any user interface. Covers project context in DESIGN.md, visual direction, hierarchy, layout, spacing, density, typography, fonts, color, palettes, dark themes, forms, tables, dashboards, navigation, overlays, icons, responsive behavior, motion and animation, loading states, UX writing, and proposal previews, through a graph of small linked notes and a search CLI. Use for application screens, settings, forms, marketing and content pages, dashboards, status displays, animations, and interface copy.
---

# Design

Load this skill before you design, build, or review a user interface. It holds the taste rules and the process. The details are in small notes that the `design` CLI searches and prints.

## The CLI

Run the CLI with Bun from this skill folder:

```bash
bun "$SKILL_DIR/scripts/design" <command>
```

`$SKILL_DIR` is the folder of this file. The notes call the command `design`.

```bash
design search "error summary"        # rank notes for a question
design read form-errors#error-summary # print one section
design read dark-theme --outline     # summary, sections, and links
design list                          # every note, by topic
```

- `[[id]]` in a note is a link. Run `design read <id>` to follow it.
- Asset paths, such as `assets/themes/graphite.css`, are relative to this skill folder.
- When you do not know the note, run `design search` with the words of the question.

## Taste Rules

These rules apply to every interface. A note gives the details of each rule.

- Establish user priorities before you style components. [[method]]
- Use hierarchy, proximity, and alignment before you add containers or decoration. [[spacing]]
- Keep semantic HTML, accessible names, native behavior, and keyboard operation, also when you reduce the visible labels. [[accessibility]]
- Use color as support, never as the only signal for status or selection. [[accessibility]]
- Design every state: default, hover, active, focus, selected, disabled, invalid, error, success, and loading. [[accessibility]]
- Do not put a contrasting strip on only the left or top edge of a card, notice, navigation item, or row. Never mark the current navigation item with a left-edge border, rail, or inset shadow. Use a surface change, text weight, and `aria-current`. [[edge-accents]]
- Do not join separate entities into one string with a middle dot, a bullet, or a vertical bar, such as `Q3 2026 · YTD Sep`. Give each entity its own element. A wish to add a separator is a sign that the structure is wrong. [[grouped-values]]
- Group form fields by user intent, not by storage structure. [[forms]]
- Put field errors near their controls. Give an error summary when users must find several errors. [[form-errors]]
- Show the end result when the work makes a tangible thing that people see or hold outside the app, such as a printed tag, an invoice, a document, or an outgoing message. Make the preview look like that thing. Humans are visual creatures. Do not preview a record that lives only in the app, such as an edited contact. [[form-preview]]
- A functional design may have one or two signature elements from its domain, such as a paper repair tag. They are part of the design. A rule set must not forbid them. [[signature-elements]]
- Controls in one row have the same height. [[density]]
- Changing the density of one page must not change the app frame on desktop. [[density]]
- Adapt the information and the arrangement for small screens. Do not only shrink or stack the desktop design. [[responsive]]
- Respect the existing product design system unless the user requests a new direction. Treat bundled palettes and icon libraries as starting resources, not automatic decisions. [[method]]
- Give each animation a purpose. Do not animate an action that people do 100 or more times each day. [[motion]]
- Write labels that say what happens, with one term for each concept. [[ux-writing]]

## Process

1. **Context, users, and priorities.** Before you choose a layout, read `DESIGN.md` at the project root when it exists. Otherwise, run `design read project-context#when-to-collect-the-context`. Then run `design read method#establish-users-and-priorities`. Identify the users, the task, and what they must notice first.
2. **Direction.** For a new product, or for a marketing or content page, run `design read visual-direction` and choose a direction inside the house rules. For a functional app, keep the product system and use [[signature-elements]].
3. **Structure.** Before you choose components, run `design read hierarchy` and `design read patterns --outline`. For a form, run `design read forms` first. For data, run `design read dashboards` or `design read tables`.
4. **Build.** Before each part, read its note. Examples: `design read color` before you set colors, `design read dark-theme` before a dark theme, `design read font-selection` before you pick a font, `design read icons` before you add icons, `design read motion` before you animate, and `design read ux-writing` before you write labels, errors, or empty states. When the part has no obvious note, run `design search`.
5. **Review.** Before you finish, run `design read review` and answer each question. Follow the link of each question that fails.

To propose a design or a UX change before implementation, run `design read proposal-previews`. Show the proposal as a running preview of the real components.

## Specializations

A product skill can join this graph and narrow the rules, so that its agents make fewer design choices. `design read <id>` lists these notes under "Specialized by". In that product, the specialization wins. Before you add or change a member skill, run `design read graph-membership`.

## Charts

For the chart itself, load the `create-data-visualizations` skill. Before you place a chart on a page, run `design read charts`.

## Maintain The Graph

The notes are the only source of design rules. A rule has one place. Before you add or change a note, run `design read note-format`. After a change, run `design graph --check`. It must pass.
