# Palette Usage

Use the bundled palettes to accelerate color selection without skipping semantic roles, contrast checks, or project context.

## Available Assets

`assets/palettes/` contains:

- `palette-01.json` through `palette-24.json`.
- `swatches.json`, which collects the available color scales.
- `NOTICE.md`, which records source information.

The upstream files use `.json` names but contain comments and trailing commas. Parse them as JSONC, or remove comments and trailing commas before using a strict JSON parser.

Each numbered palette is a self-contained option. Token names are scoped to that file. The same token name can have a different value in another numbered palette or in `swatches.json`. Do not merge numbered palette files by token name. Select one numbered palette, or select scales directly from `swatches.json`.

## Palette Structure

Most palette files provide:

- One or more primary scales for brand and high-emphasis actions.
- A neutral scale for text, surfaces, and borders.
- Supporting scales for semantic or occasional emphasis.
- Ten shade steps from `050` through `900`.

Do not copy all colors into product tokens. Select only the scales and steps required by the interface.

## Selection Workflow

1. Identify the product tone and existing brand constraints.
2. Select one numbered palette, or select one primary scale and one compatible neutral scale from `swatches.json`.
3. Select supporting scales only for real semantic needs such as danger, warning, success, or information.
4. Map raw values to semantic tokens such as `surface`, `text-muted`, `action-primary`, and `status-danger`.
5. Test every foreground and background pair in its actual size and weight.
6. Test focus, hover, selected, disabled, and high-contrast states.
7. Verify that status and selection remain understandable without color.

For a dark theme, also follow `dark-theme.md`. Do not derive the dark theme by inverting the light palette.

## Modern Use

The assets contain hex values from the original package. Preserve them when an exact supplied palette is required. For a new system, use them as visual references and build project tokens in the color space already used by the project. Prefer OKLCH for a new web palette when supported.

Do not assume that a numbered shade has a specific contrast ratio. Shade numbers describe sequence, not accessibility.

## Anti-Patterns

- Do not mix unrelated scales only because individual colors look attractive.
- Do not use the primary scale for every interactive element.
- Do not use supporting colors as decoration when they already carry semantic meaning.
- Do not use a light shade for text without testing contrast.
- Do not expose raw palette names throughout component code. Map them through semantic tokens.
