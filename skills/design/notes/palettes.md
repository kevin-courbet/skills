---
id: palettes
topic: color
summary: The bundled Refactoring UI palettes in assets/palettes, how to parse them, and how to select scales for a product.
keywords: [palette, palettes, pick a color palette, color palette, swatches, swatches.json, palette json, jsonc, refactoring ui palettes, color scales, shade steps]
requires: [color, semantic-tokens]
related: [dark-theme, sources]
---

# Bundled Palettes

Use the bundled palettes to select colors faster. Do not skip semantic roles, contrast checks, or the project context.

## Available Assets

`assets/palettes/` contains:

- `palette-01.json` through `palette-24.json`.
- `swatches.json`, which collects the available color scales.
- `NOTICE.md`, which records the source.

The upstream files use `.json` names, but they contain comments and trailing commas. Parse them as JSONC, or remove the comments and trailing commas before you use a strict JSON parser.

Each numbered palette is a self-contained option. Token names are scoped to their file. The same token name can have a different value in another numbered palette or in `swatches.json`.

- Do not merge numbered palette files by token name.
- Select one numbered palette, or select scales directly from `swatches.json`.

## Palette Structure

Most palette files give:

- One or more primary scales for brand and high-emphasis actions.
- A neutral scale for text, surfaces, and borders.
- Supporting scales for semantic or occasional emphasis.
- Ten shade steps, from `050` through `900`.

Do not copy all colors into product tokens. Select only the scales and the steps that the interface requires.

## Selection Workflow

1. Identify the product tone and the existing brand constraints.
2. Select one numbered palette. Or select one primary scale and one compatible neutral scale from `swatches.json`.
3. Select supporting scales only for real semantic needs, such as danger, warning, success, or information.
4. Map the raw values to semantic tokens. [[semantic-tokens]] gives the rules.
5. Test every foreground and background pair at its real size and weight. [[contrast]] gives the limits.
6. Test focus, hover, selected, disabled, and high-contrast states.
7. Verify that status and selection stay understandable without color.

For a dark theme, also use [[dark-theme]].

## Modern Use

The assets contain the hex values of the original package. Keep them when the product requires the exact supplied palette. For a new system, use them as visual references. Build the project tokens in the color space that the project already uses.

Do not assume that a numbered shade has a specific contrast ratio. Shade numbers give a sequence, not accessibility.

## Anti-Patterns

- Do not mix unrelated scales only because individual colors look attractive.
- Do not use the primary scale for every interactive element.
- Do not use supporting colors as decoration when they already carry semantic meaning.
