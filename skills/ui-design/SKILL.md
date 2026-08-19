---
name: ui-design
description: Create, review, or refactor information-dense UI hierarchy, layout, typography, forms, dashboards, tables, data presentation, and responsive behavior. Use for content-heavy pages, application screens, settings, metrics, and status displays; do not use for visual-only styling or motion.
---

# UI Design

Apply a hierarchy-first method to make an existing interface clearer, easier to scan, and more polished without depending on decorative effects.

## Required Workflow

1. Read `references/method.md` before design or implementation. Treat it as the canonical method and checklist.
2. Read `references/component-patterns.md` before selecting page or component structures.
3. Read `references/palette-usage.md` before creating or changing a color system.
4. Read `references/dark-theme.md` before creating, changing, or reviewing a dark theme.
5. Read `references/font-selection.md` before selecting or pairing typefaces.
6. Read `references/icon-usage.md` before selecting or implementing icons.

Resolve all paths relative to this skill directory. Use the support directory printed by `skills use` when the skill is loaded on demand.

## Non-Negotiables

- Establish user priorities before styling components.
- Use hierarchy, proximity, and alignment before adding containers or decoration.
- Preserve semantic HTML and accessible names even when visible labels are reduced.
- Use color as support, never as the only status or selection signal.
- Adapt information and arrangement for small screens; do not only shrink or stack the desktop design.
- Respect the existing product design system unless the user requests a new direction.
- Treat bundled palettes and external icon libraries as starting resources, not automatic design decisions.

## Optional Coordination

- If another skill provides project design context, use that context without changing this workflow.
- Keep motion and interaction-polish work separate unless the request includes it.
