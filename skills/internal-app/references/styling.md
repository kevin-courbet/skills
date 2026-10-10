# Styling With StyleX

StyleX is the only styling mechanism. There are no utility classes, no CSS
modules, no inline style objects with raw values, and no component-level CSS
files. The compiler turns every `stylex.create` call into atomic classes at
build time, so the full visual system lives in two token files.

## Build Wiring

`vite.config.ts` (verified with Vite 8, TanStack Start 1.168, StyleX 0.19):

```ts
import stylex from "@stylexjs/unplugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
      dev: process.env.NODE_ENV !== "production",
      devPersistToDisk: true,
      unstable_moduleResolution: { type: "commonJS", rootDir },
      aliases: { "@/*": [`${rootDir}src/*`] },
    }),
    tanstackStart({ srcDirectory: "src" }),
    nitro({ preset: "bun" }),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
});
```

Rules that follow from the wiring:

- The StyleX plugin must come before the React plugin, or Fast Refresh breaks.
- `aliases` must mirror `tsconfig.json` paths, or imports of `@/styles/tokens.stylex` fail at compile time.
- The kit `AppDocument` component (`src/components/shell/app-document.tsx`) imports `@/styles/app.css` as a side-effect import. TanStack attaches that CSS to the root route, and the StyleX plugin appends its output to the first CSS asset in production. Do not set `cssInjectionTarget`, and do not import `app.css` with `?url`.
- In development the stylesheet is served from `/virtual:stylex.css`. `AppDocument` links it and loads `virtual:stylex:runtime` for hot reload.
- `src/styles/app.css` imports Aperture CSS inside `@layer aperture`. StyleX emits its own layers after it, so StyleX host styles override Aperture defaults without specificity tricks.
- `__root.tsx` renders `<AppDocument theme={theme}>`. It does not render `<html>`, `<head>`, or `<body>` itself.

## Token Files

`src/styles/palette.stylex.ts` holds raw values as `stylex.defineConsts`.
`src/styles/tokens.stylex.ts` holds semantic roles as `stylex.defineVars` and
build-time constants as `stylex.defineConsts`. Components import tokens only.

Semantic color roles (every component uses these names and nothing else):

| Group | Roles |
|---|---|
| Surfaces | `page`, `subtle`, `raised`, `overlay`, `inset` |
| Text | `text`, `textMuted`, `textFaint`, `textInverse` |
| Borders | `borderSubtle`, `border`, `borderStrong` |
| Accent | `accent`, `accentHover`, `accentText`, `accentMuted`, `onAccent`, `selected`, `focus` |
| Status | `success`, `successMuted`, `successBorder` and the same triple for `warning`, `danger`, `info` |
| Overlay | `backdrop` behind dialogs and sheets |

Other groups: `shadow` (`sm`, `md`, `lg`), `font` (families, sizes `xs` to
`xxxl`, weights, line heights), `space` (`xs` 4px to `page` 48px), `radius`,
`size` (control heights, icon sizes, sidebar and top bar, content widths),
`media` (breakpoints, reduced motion, forced colors), `layer` (z-index), and
`motion` (durations and easing).

Density defaults:

| Element | Value |
|---|---|
| Body and table text | `font.md` (13px), line height 1.45 |
| Labels, metadata, captions | `font.sm` (12px) |
| Page title | `font.xxl` (20px), weight 600 |
| Control height | `size.controlMd` (32px); `controlSm` 28px for toolbars and table rows |
| Table row | 36px total: 8px padding plus one text line |
| Spacing between fields | `space.lg` (16px); between sections `space.xxl` (24px) |
| Radius | `radius.md` (6px) controls, `radius.lg` (8px) cards and popovers, `radius.xl` (12px) dialogs |
| Sidebar | `size.sidebar` (240px) |

Change a density value in the token file of this skill, never in a component
and never in an app's copy of a kit file.

## Themes

Tokens carry light values by default and dark values under
`@media (prefers-color-scheme: dark)`, so the server renders the right theme
without knowing the user. An explicit choice is a cookie read in the root
`beforeLoad`; `src/styles/themes.ts` creates `lightTheme` and `darkTheme` with
`stylex.createTheme` and `AppDocument` applies the chosen one to `<html>`.
`createTheme` results must be bound to a bare `const`; the compiler rejects
inline calls inside arrays.

`AppDocument` also sets `data-theme` on `<html>`: from the cookie when there is
one, else from an inline script before first paint. Aperture and any other
third-party CSS keyed on `[data-theme]` follow it. The `ThemeSwitch` in the
top bar writes the cookie through a server function and invalidates the router.

`AppDocument` sets `lang` and wraps the app in react-aria's `I18nProvider`
with `appLocale`, so date segments and number fields format like the
`src/lib/locale.ts` formatters instead of following the browser locale.

`color.scheme` feeds `color-scheme` on `<html>` so native controls and
scrollbars match.

Dark values are not inverted light values. They follow `ui-design`'s
`dark-theme.md`: tinted near-black page, lighter raised surfaces, reduced
chroma on large areas, higher contrast text.

## Writing Styles

```ts
const styles = stylex.create({
  base: {
    display: "inline-flex",
    height: size.controlMd,
    paddingInline: space.md,
    borderRadius: radius.md,
    backgroundColor: { default: color.raised, ":hover": color.subtle, ":active": color.inset },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
  },
});
```

- Nest pseudo-classes and media queries inside the property with a `default` key. Do not write selectors.
- Use `media.*` and `layer.*` constants for media-query keys and z-index values.
- Express variants as separate `stylex.create` maps indexed by a prop: `intents[intent]`, `sizes[size]`.
- Apply with `{...stylex.props(styles.base, cond && styles.active, style)}`. Later arguments win.
- Accept a `style?: StyleXStyles` prop on layout-level components so parents can set width or margin. Spread it last.
- Dynamic values (measured widths, computed colors) use a style function: `stylex.create({ width: (px: number) => ({ width: px }) })`. Use them rarely.
- Custom properties are allowed as keys (`"--aperture-color-text": color.text`). The chart host bridge relies on this.
- Reserve `stylex.keyframes` for enter, exit, and loading motion. Every animated property gets a reduced-motion override.
- Pseudo-elements `::before` and `::after` are discouraged; render a real element.
- Write longhands for `border`, `background`, and `outline`. In the verified build, `border: "none"` and `background: "transparent"` on a `<button>` left the native border and background in place even though the classes were emitted. `borderStyle: "none"`, `backgroundColor: "transparent"`, and `outlineStyle: "none"` reset them correctly. The `margin`, `padding`, `gap`, `inset`, and `flex` shorthands compile and apply.
- Set the base font size on `<body>`, not `<html>`. A rem-based `fontSize` on `<html>` rescales every rem token.

## react-aria-components Adapter

react-aria-components (RAC) exposes state through render props on `className`
and `style`. `src/lib/rac.ts` provides `renderStyles`:

```tsx
<Tab
  {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean }>((state) => [
    styles.tab,
    state.isSelected && styles.tabSelected,
    state.isFocusVisible && styles.tabFocused,
  ])}
/>
```

Use `renderStyles` for `isSelected`, `isInvalid`, `isOpen`, `isPlaceholder`,
`isEntering`, `isExiting`, `isFocused` on collection items, and `isDisabled`
on non-form elements. Use plain `stylex.props` with `:hover`, `:active`,
`:focus-visible`, and `:disabled` for everything else.

## Rules Enforced By `check`

Run `bun "$SKILL_DIR/scripts/internal-app" check`. Each finding names the rule,
file, and line. Fix the source; there are no ignore comments.

| Rule | Fails on |
|---|---|
| `raw-color` | A hex, `rgb()`, `hsl()`, or `oklch()` color in a component, route, or feature. Use a color token. |
| `font-size-literal` | A literal `fontSize`. Use a `font` token. |
| `class-name-string` | `className="..."`. Use `stylex.props`. |
| `inline-style-object` | `style={{ ... }}`. Use `stylex.create`; dynamic values use a style function. |
| `stylex-shorthand` | `border:`, `background:`, or `outline:` shorthands. Use longhands. |
| `palette-import` | `palette.stylex` imported outside `tokens.stylex.ts` and `themes.ts`. |
| `left-edge-nav` | `borderLeft`, `borderInlineStart`, or an inset shadow in shell or navigation files. |
| `theme-media-query` | `prefers-color-scheme` in a component. Themes are a token concern. |
| `forbidden-import`, `forbidden-dependency` | Tailwind, `clsx`, Radix, Base UI, zod, visx, heroicons, and the other replaced libraries. |

Structural literals such as `1px` borders, `100%`, `0`, rem widths, and
`calc()` expressions built from tokens are allowed.
