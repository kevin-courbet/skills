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
- Aperture puts every rule in the `aperture` cascade layer. `src/styles/app.css` imports it first, so the layer is declared before the reset and StyleX layers. StyleX host styles override Aperture defaults without specificity tricks.
- `__root.tsx` renders `<AppDocument theme={theme}>`. It does not render `<html>`, `<head>`, or `<body>` itself.

## Token Files

Raw values live in two `stylex.defineConsts` files:

- `src/styles/brand.stylex.ts` is app-owned. It holds `lightBrand` and
  `darkBrand`: the frame, surface, text, border, and accent roles. The template
  ships neutral grey with a blue accent. An app with its own brand colors
  changes these values (see Brand colors).
- `src/styles/palette.stylex.ts` is kit-owned. It holds `lightPalette` and
  `darkPalette`: `scheme`, the status triples, `backdrop`, and the shadows.
  These values are the same in every app, so status reads the same everywhere.

`src/styles/tokens.stylex.ts` maps both files into semantic roles as
`stylex.defineVars` and holds build-time constants as `stylex.defineConsts`.
Components import tokens only.

Semantic color roles (every component uses these names and nothing else):

| Group | Roles |
|---|---|
| Frame | `frame` behind the sidebar and panel, `frameHover`, `frameSelected` for sidebar items |
| Surfaces | `page` (the content panel), `subtle`, `raised`, `overlay`, `inset` |
| Text | `text`, `textMuted`, `textFaint`, `textInverse` |
| Borders | `borderSubtle`, `border`, `borderStrong` |
| Accent | `accent`, `accentHover`, `accentStrong` for pressed and high-emphasis fills, `accentText`, `accentMuted`, `accentBorder`, `onAccent`, `selected`, `focus` |
| Status | `success`, `successMuted`, `successBorder` and the same triple for `warning`, `danger`, `info` |
| Overlay | `backdrop` behind dialogs and sheets |

Surface order, from recessed to raised: `page`, `inset`, `frame`, `raised`, `subtle`, `overlay`.
The content panel (`page`) is the deepest surface so cards on `raised` stand clearly off it.
The sidebar (`frame`) sits lighter than the panel so navigation reads as its own plane.
Keep these gaps when you tune the palette; equal values make the app look washed out.

### Brand colors

To apply a brand, change only `src/styles/brand.stylex.ts` in the app:

1. Convert the brand colors to OKLCH. Keep the lightness and hue of the brand.
   The steps around them follow from the rules below.
2. Tint the neutrals toward the warm or cool base of the brand. Use one hue for
   every frame, surface, text, and border role. Keep chroma low: 0.004 to 0.02
   on light surfaces and less than 0.012 on dark surfaces, so large areas stay calm.
3. Keep the surface order and the gaps above in the two themes.
4. Put the main brand color on `accent`. Make `accentHover` and `accentStrong`
   darker in light and lighter in dark. `onAccent` text must have 4.5:1
   contrast against `accent`, and `accentText` must have 4.5:1 against `raised`.
5. If the brand is green, keep the accent different from `success` in hue or
   chroma, so that a primary button does not look like a status.
6. Set `defaultTheme` in `src/lib/brand.ts` if the brand starts in one theme
   (see Themes).
7. Examine every page in the two themes, as for all color changes.

Other groups: `shadow` (`sm`, `md`, `lg`, `xl` for a floating surface such as a dragged item or a docked panel, and
`frame` for the content panel), `font` (families, sizes `xs` to `xxxl`, `display` and `displayLg` for large numerals
and labels that people read from a distance, weights `regular` to `semibold`, `bold` for a wordmark only, line heights), `space` (`xs` 4px to `page` 48px), `radius`,
`size` (control heights, icon sizes, sidebar, top bar, frame gap, content widths),
`media` (breakpoints, `finePointer` for feedback that only a hover shows, reduced motion, forced colors), `container` (`belowSm`,
`belowMd`, `belowLg` container queries that resolve against the nearest
`containerType: "inline-size"` ancestor, such as the DataTable scroller), `layer` (z-index), and
`motion` (durations and easing curves; see Motion).

Density defaults:

| Element | Value |
|---|---|
| Body and table text | `font.md` (13px), line height 1.45 |
| Labels, metadata, captions | `font.sm` (12px) |
| Page title | `font.xxl` (20px), weight 600 |
| Control height | `size.controlMd` (32px); `controlSm` 28px inside a `DataTable` frame. All controls in one row share one height (`ControlSizeProvider`). |
| Table row | 36px total: 8px padding plus one text line |
| Spacing between fields | `space.lg` (16px); between sections `space.xxl` (24px) |
| Field width | `size.fieldXs`, `fieldSm`, `fieldMd`, `fieldLg` (6, 11, 17, 26rem). Set them through the field `width` prop, not in a style. |
| Radius | `radius.md` (6px) controls, `radius.lg` (8px) sidebar items, popovers, and the table frame, `radius.xl` (12px) the content panel, cards, stat tiles, settings cards, dialogs, and the peek sheet |
| Sidebar | `size.sidebar` (240px), items `size.controlSm` (28px) |
| Content panel | `size.frameGap` (8px) from the window edges and the sidebar |
| Identifiers | `Code`: `font.mono` at `font.xs` (11px), medium weight, `textMuted` |

Change a density value in the token file of this skill, never in a component
and never in an app's copy of a kit file.

### Touch density

Some pages run on a shared tablet or kiosk, where people tap the screen and
read it from arm's length. `src/styles/themes.ts` exports `touchDensity`, a
pair of `createTheme` overrides on `size` and `font`. `Page density="touch"`
applies it to the full page region:

| Token | Default | Touch |
|---|---|---|
| `controlSm`, `controlMd`, `controlLg` | 28, 32, 36px | 44, 48, 56px |
| `iconSm`, `icon`, `iconLg` | 14, 16, 20px | 18, 20, 24px |
| `fieldXs`, `fieldSm`, `fieldMd`, `fieldLg` | 6, 11, 17, 26rem | 8, 14, 22, 34rem |
| `toggle`, `toggleMark` (checkbox box, radio circle, check) | 16, 12px | 24, 18px |
| `switchWidth`, `switchHeight` | 28 by 16px | 44 by 26px |
| `sliderThumb`, `sliderTrack` (track height that takes the pointer) | 16, 20px | 28, 44px |
| `togglePadding` (above and below a checkbox, radio, or switch row) | 0px | 10px |
| `font.md` (body) | 13px | 17px |
| `font.sm` (labels) | 12px | 15px |
| `font.xxl` (page title) | 20px | 26px |

All primitives read these tokens. Buttons, fields, segmented controls, badges,
checkboxes, radios, switches, sliders, and tables become larger together,
without one-off styles. A one-line checkbox, radio, or switch row is at least
44px high. Menu, select, and list box options are at least `controlSm` high.
Use touch density for a full page that runs on such a device. Do not use it for
one control on a desk page.

`Page` also puts the density in a React context (`DensityProvider` in
`src/components/ui/density.tsx`). Dialogs, sheets, popovers, hover cards,
menus, the option lists of the select fields and pickers, and tooltips render
in a portal outside the page. Each one gets the page theme again from
`useOverlayDensity()` on its root element, so it opens with the density of the
page that opens it. A new overlay component must do the same: put
`...useOverlayDensity()` first in the styles of its portal root. Toasts and the
command palette render in the app shell, outside every page, and keep the
default density.

On a touch page, prefer visible choices to a list in a popover: show a short
list in a `SegmentedControl` or a `RadioGroup`, not in a `Select`. A
`DatePicker` takes `quickPicks`, so people tap a day instead of opening the
calendar popover.

A touch screen has no hover, and it keeps the hover state after a tap. Do not
put an action or information behind a hover. Put feedback that only a hover
shows, such as an underline on a link, under `media.finePointer`:

```ts
textDecorationLine: {
  default: "none",
  ":hover": { default: "none", [media.finePointer]: "underline" },
},
```

Touch density makes a desktop page larger. It does not make a desktop page
into a page for work away from a desk. See Touch Work View in
`components.md` to decide when an app needs a separate touch view.

### Category Colors

`src/styles/category.ts` gives colors to categories that a hue identifies, such
as projects, teams, or tags. `categoryColor(hue, role)` returns the `text`,
`surface`, or `line` color for a hue from 0 to 360. All categories use the same
lightness and chroma for a role, so only the hue makes them different and no
category is more prominent than another. The value contains `light-dark()`, so
it follows `color-scheme`, which AppDocument and the explicit themes set. Apply
it through a style function:

```ts
const styles = stylex.create({ ink: (value: string) => ({ color: value }) });
<span {...stylex.props(styles.ink(categoryColor(project.hue, "text")))} />
```

Store the hue with the record. Do not use category colors for status; use the
status roles.

## Themes

Tokens carry light values by default and dark values under
`@media (prefers-color-scheme: dark)`, so the server renders the right theme
without knowing the user. An explicit choice is a cookie read in the root
`beforeLoad`. Without a cookie, the choice is `defaultTheme` from the app-owned
`src/lib/brand.ts`. The template uses `"system"`. Use `"light"` or `"dark"` for
an app whose brand starts in one theme. `src/styles/themes.ts` creates
`lightTheme` and `darkTheme` with `stylex.createTheme`, and `AppDocument`
applies the chosen one to `<html>`.
`createTheme` results must be bound to a bare `const`; the compiler rejects
inline calls inside arrays.

`AppDocument` also sets `data-theme` on `<html>`: from the choice when it is
`"light"` or `"dark"`, else from an inline script before first paint. Aperture and any other
third-party CSS keyed on `[data-theme]` follow it. The `ThemeSwitch` in the
top bar writes the cookie through a server function and invalidates the router.

`AppDocument` sets `lang` and wraps the app in react-aria's `I18nProvider`
with `appLocale`, so date segments and number fields format like the
`src/lib/locale.ts` formatters instead of following the browser locale.

`color.scheme` feeds `color-scheme` on `<html>` so native controls and
scrollbars match.

Dark values are not inverted light values. They follow `ui-design`'s
`dark-theme.md`: tinted near-black page, lighter raised surfaces, reduced
chroma on large areas, higher contrast text. Dark neutrals keep chroma
near 0.003 so the frame, panel, and cards read as neutral grey steps:
`page` (L 0.13) < `inset` (0.158) < `frame` (0.195) < `raised` (0.205) <
`subtle` and `overlay` (0.245). Each step stays visible without a border.

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
- Reserve `stylex.keyframes` for enter, exit, change, and loading motion. Every animated property gets a reduced-motion override. See Motion.
- Pseudo-elements `::before` and `::after` are discouraged; render a real element.
- Write longhands for `border`, `background`, and `outline`. In the verified build, `border: "none"` and `background: "transparent"` on a `<button>` left the native border and background in place even though the classes were emitted. `borderStyle: "none"`, `backgroundColor: "transparent"`, and `outlineStyle: "none"` reset them correctly. The `margin`, `padding`, `gap`, `inset`, and `flex` shorthands compile and apply.
- Set the base font size on `<body>`, not `<html>`. A rem-based `fontSize` on `<html>` rescales every rem token.

## Motion

Motion helps people follow an object when the state changes. It is not
decoration. Animate a change only when people can lose track of an object
without the animation: a card that goes to a different lane, a row that leaves
a list, a status that changes while people look at a different part of the
screen.

`src/lib/motion.ts` has the helpers. The overlay, button, `Kanban`,
`SortableList`, and `WorkQueue` components already use them. `MotionShowcase`
(`src/components/kit/showcase-motion.tsx`) on the `/design-kit` route shows
each helper on one list.

| Change | Use | Duration and easing |
|---|---|---|
| A card or a row moves to a different lane, group, or position after an action | `withViewTransition` around the update, and `motionStyles.named(viewTransitionName(scope, kind, id))` on each item that can move | `motion.move` (240ms), `motion.easeInOut` |
| People remove an item or add an item | `withViewTransition`. The item fades out or in, and the other items close or open the gap. | `motion.move`, `motion.easeInOut` |
| An item arrives from the server, such as a new ticket after a refetch | `useArrivals(ids)` and `motionStyles.enter` on each arriving item | `motion.normal` (180ms), `motion.easeOut` |
| A value changes in place, such as a status badge | `useHasChanged(value)`, `key={value}`, and `motionStyles.changed` | `motion.normal`, `motion.easeOut` |
| A dialog, a sheet, a popover, or a menu opens or closes | The kit component. Do not add motion. | Enter `motion.normal` with `easeOut`, exit `motion.fast` with `ease`. A side sheet enters in `motion.slow`. |
| A button is pressed | `Button` and `LinkButton` scale to 0.97 while pressed | `motion.fast` (120ms) |
| Hover, focus, and selection colors | `transitionDuration: motion.fast` | `motion.fast`, `motion.ease` |

Do not animate:

- The first render of a page or a list. `useArrivals` returns no keys on the first render.
- A route change. `app.css` turns off the cross-fade of the page.
- Rows that a sort, a filter, a search, or a new page replaces. People asked for a new list; they do not follow one row.
- A refetch that changes many items at the same time.
- Numbers that count up, text that types itself, and charts that grow on load.
- Content that loads. Show a `Skeleton` or a `Spinner`. These are the only animations that repeat.
- The page shell, the sidebar, and the layout of a page.

Durations and easing:

- Keep motion of the user interface at 300ms or less. People wait for motion that is longer.
- An exit is shorter than its enter.
- Use `easeOut` for an element that enters, `ease` for an exit and a change of state, and `easeInOut` for an object that moves from one place to another, so the eye can follow it. Do not use `linear`, except for a spinner.
- `::view-transition-group(*)` in `app.css` uses `motion.move` and `motion.easeInOut`. Change the two places together.

Reduced motion:

- With `prefers-reduced-motion: reduce`, `withViewTransition` runs the update at once, and `app.css` turns off all view-transition animations.
- Every `animationDuration` and every transition of a transform gets `[media.reducedMotion]: "0ms"`, or a `null` transform under `media.reducedMotion`. `motionStyles` already does this.
- Loading animations stop: the spinner, the skeleton pulse, and the indeterminate progress bar. Their shape still shows that work runs.

### View transitions

```tsx
function TicketList({ tickets }: { readonly tickets: ReadonlyArray<Ticket> }) {
  const scope = useId();
  return tickets.map((ticket) => (
    <Item
      key={ticket.id}
      style={motionStyles.named(viewTransitionName(scope, "ticket", ticket.id))}
      title={ticket.title}
    />
  ));
}

const close = (ticket: Ticket) => {
  withViewTransition(() =>
    queryClient.setQueryData(ticketKeys.queue, (tickets: ReadonlyArray<Ticket> = []) =>
      tickets.filter((candidate) => candidate.id !== ticket.id),
    ),
  );
  closeTicket.mutate(ticket.id);
};

function TicketStatus({ status }: { readonly status: TicketStatus }) {
  const hasChanged = useHasChanged(status);
  return (
    // A transform does not apply to an inline element, so the wrapper is inline-flex.
    <span key={status} {...stylex.props(styles.status, hasChanged && motionStyles.changed)}>
      <Badge intent={statusIntents[status]}>{statusLabels[status]}</Badge>
    </span>
  );
}
```

- `withViewTransition(update)` captures the screen, runs `update`, and moves every named element from its old place to its new place. Named elements that only exist on one side fade out or in. The rest of the page changes at once.
- `update` must change the state synchronously: a state setter, a `queryClient.setQueryData`, or a router navigation. Put the request after the update. See Optimistic moves in `data.md`.
- A name must be unique in the document. Take the scope from `useId()`, so two boards on one page do not share names. A duplicate name is a bug: the browser skips the animation and `withViewTransition` reports the error to the window error handlers.
- Name only the items that can move, such as the cards of a board or a queue, and the groups that contain them. Do not name every element of a page.
- While a view transition runs, the page does not take pointer input. Keep it at `motion.move`.
- An item that people drop with the pointer is already at its new place. Remove its name before the transition, so it does not fly back to where it started. `Kanban` does this.
- Browsers without the View Transitions API run the update without motion.

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
| `palette-import` | `palette.stylex` or `brand.stylex` imported outside `tokens.stylex.ts` and `themes.ts`. |
| `toolbar-control-size` | An explicit `size` on a `Button` or `LinkButton` inside a `Toolbar`, its `actions` included. Set `size` on the `Toolbar`. |
| `left-edge-nav` | `borderLeft`, `borderInlineStart`, or an inset shadow in shell or navigation files. |
| `theme-media-query` | `prefers-color-scheme` in a component. Themes are a token concern. |
| `forbidden-import`, `forbidden-dependency` | Tailwind, `clsx`, Radix, Base UI, zod, visx, heroicons, and the other replaced libraries. |

Structural literals such as `1px` borders, `100%`, `0`, rem widths, and
`calc()` expressions built from tokens are allowed.
