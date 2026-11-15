---
id: internal-app-tokens
topic: internal-app
summary: The token files of the kit, which file the app owns, the semantic color roles, the depth of the frame, the panel, and the cards, the other token groups, and the category colors for projects, teams, or tags.
keywords: [StyleX tokens, design tokens, token files, tokens.stylex.ts, palette.stylex.ts, brand.stylex.ts, semantic color roles, color roles, which token, background color, text color, surface depth, frame color, raised surface, inset, overlay, status colors, shadow tokens, font tokens, space tokens, radius tokens, media tokens, container queries, z-index layer, category colors, categoryColor, project color, tag color]
specializes: [semantic-tokens, depth]
related: [internal-app-brand-colors, internal-app-themes, internal-app-density, internal-app-stylex]
---

# Internal App Tokens

Raw values are only in the token files. Components import `@/styles/tokens.stylex` and nothing else. `check` fails on a raw color, a literal font size, and an import of a palette file outside the token files.

## Token Files

Two `stylex.defineConsts` files hold the raw values:

- `src/styles/brand.stylex.ts` is an app file. It holds `lightBrand` and `darkBrand`: the frame, surface, text, border, and accent roles. The template has neutral grey with a blue accent. An app with its own brand colors changes these values. Run `design read internal-app-brand-colors`.
- `src/styles/palette.stylex.ts` is a kit file. It holds `lightPalette` and `darkPalette`: `scheme`, the status triples, `backdrop`, and the shadows. These values are the same in each app, so a status looks the same in each app.

`src/styles/tokens.stylex.ts` maps the two files to semantic roles with `stylex.defineVars`. It also holds the build-time constants with `stylex.defineConsts`.

## Color Roles

Each component uses these role names and no other color:

| Group | Roles |
|---|---|
| Frame | `frame` behind the sidebar and the panel, `frameHover`, and `frameSelected` for the sidebar items |
| Surfaces | `page` (the content panel), `subtle`, `raised`, `overlay`, and `inset` |
| Text | `text`, `textMuted`, `textFaint`, and `textInverse` |
| Borders | `borderSubtle`, `border`, and `borderStrong` |
| Accent | `accent`, `accentHover`, `accentStrong` for pressed and high-emphasis fills, `accentText`, `accentMuted`, `accentBorder`, `onAccent`, `selected`, and `focus` |
| Status | `success`, `successMuted`, and `successBorder`, and the same triple for `warning`, `danger`, and `info` |
| Overlay | `backdrop` behind dialogs and sheets |

## Surface Depth

The order of the surfaces, from recessed to raised, is `page`, `inset`, `frame`, `raised`, `subtle`, and `overlay`.

- The content panel (`page`) is the deepest surface, so the cards on `raised` stand clearly off it.
- The sidebar (`frame`) is lighter than the panel, so the navigation is a separate plane.
- Keep these gaps when you tune the palette. Equal values make the app look washed out.

## Other Token Groups

- `shadow`: `sm`, `md`, `lg`, `xl` for a floating surface such as a dragged item or a docked panel, and `frame` for the content panel.
- `font`: the families; the sizes `xs` to `xxxl`; `display` and `displayLg` for large numerals and for labels that people read from a distance; the weights `regular` to `semibold`, and `bold` for a wordmark only; the line heights.
- `space`: `xs` (4px) to `page` (48px).
- `radius`, and `size` for the control heights, the icon sizes, the sidebar, the top bar, the frame gap, and the content widths. Run `design read internal-app-density` for the values.
- `media`: the breakpoints, `belowLg`, `finePointer` for feedback that only a hover shows, `coarsePointer` for a touch screen, reduced motion, and forced colors.
- `container`: `belowSm`, `belowMd`, and `belowLg`. These container queries resolve against the nearest ancestor with `containerType: "inline-size"`, such as the `DataTable` scroller.
- `layer`: the z-index values.
- `motion`: the durations and the easing curves. Run `design read internal-app-motion`.

## Category Colors

`src/styles/category.ts` gives colors to categories that a hue identifies, such as projects, teams, or tags. `categoryColor(hue, role)` returns the `text`, `surface`, or `line` color for a hue from 0 to 360.

- All categories use the same lightness and chroma for a role. Thus only the hue makes them different, and no category is more prominent than a different category.
- The value contains `light-dark()`, so it follows `color-scheme`. `AppDocument` and the explicit themes set `color-scheme`.
- Apply the value through a style function:

```ts
const styles = stylex.create({ ink: (value: string) => ({ color: value }) });
<span {...stylex.props(styles.ink(categoryColor(project.hue, "text")))} />
```

- Store the hue with the record.
- Do not use category colors for a status. Use the status roles.
