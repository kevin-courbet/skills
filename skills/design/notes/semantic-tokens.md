---
id: semantic-tokens
topic: color
summary: Components use semantic color tokens only, with paired foreground and background values and a value for each state.
keywords: [semantic tokens, semantic color tokens, design tokens, css variables, custom properties, theme tokens, color roles, raw palette, component tokens, token naming]
related: [color, palettes, dark-theme, graphite]
---

# Semantic Tokens

Keep raw palette values separate from semantic tokens. A semantic token names a role, such as `surface`, `text-muted`, `action-primary`, or `status-danger`.

## Token Rules

- Let components use semantic tokens only.
- Do not expose raw palette names in component code.
- Treat direct palette utilities in components as defects, unless they show fixed user content.
- Change the semantic token values for each theme. Do not change the component meaning between themes.
- Add component tokens only when a global role cannot describe the component.
- Define paired foreground and background tokens for accent and status roles.
- Define rest, hover, active, selected, focus, and disabled values for each interactive role.

## Minimum Role Groups

Define at least these role groups:

- Page, subtle, raised, overlay, and inset surfaces.
- Primary, secondary, disabled, inverse, and link text.
- Subtle, default, strong, interactive, and focus borders.
- Accent, success, warning, danger, and information roles.
- For each status: a foreground, a muted background, a strong background, and a border value.
