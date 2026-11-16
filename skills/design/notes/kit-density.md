---
id: kit-density
topic: kit
summary: The default density values of the kit, the touch density of a page on a shared tablet or kiosk with its token values, the density of overlays, and the rules for a touch page without hover.
keywords: [density, density defaults, touch density, touch page, Page density touch, tablet, kiosk, tap target, 44px, control height, row height, field width, radius tokens, touchDensity, useOverlayDensity, overlay density, hover on touch, finePointer, quickPicks, visible choices]
specializes: [density]
related: [kit-tokens, kit-touch-work-view, kit-composition]
---

# Kit Density

The kit is dense by default, for a person at a desk with a mouse. A page on a shared tablet or kiosk uses touch density. Change a density value only in the token file of this skill. Never change it in a component or in the copy of a kit file in an app.

## Default Values

| Element | Value |
|---|---|
| Body and table text | `font.md` (13px), line height 1.45 |
| Labels, metadata, captions | `font.sm` (12px) |
| Page title | `font.xxl` (20px), weight 600 |
| Control height | `size.controlMd` (32px). `controlSm` (28px) in a `DataTable` frame. All controls in one row have one height (`ControlSizeProvider`). |
| Table row | 36px: 8px padding and one line of text |
| Space between fields | `space.lg` (16px). Between sections, `space.xxl` (24px). |
| Field width | `size.fieldXs`, `fieldSm`, `fieldMd`, `fieldLg` (6, 11, 17, 26rem). Set them with the `width` prop of the field, not in a style. |
| Radius | `radius.md` (6px) for controls. `radius.lg` (8px) for sidebar items, popovers, and the table frame. `radius.xl` (12px) for the content panel, cards, stat tiles, settings cards, dialogs, and the peek sheet. |
| Sidebar | `size.sidebar` (240px) from the `lg` breakpoint. Items are `size.controlSm` (28px). |
| Content panel | `size.frameGap` (8px) from the window edges and from the sidebar |
| Identifiers | `Code`: `font.mono` at `font.xs` (11px), medium weight, `textMuted` |

## Touch Values

People tap a shared tablet or kiosk, and read it from arm's length. `src/styles/tokens.stylex.ts` keeps the touch values in the constants `touchSize` and `touchFont`. `src/styles/themes.ts` exports `touchDensity`, a pair of `createTheme` overrides that put these values on `size` and `font`. `Page density="touch"` applies it to the full page.

| Token | Default | Touch |
|---|---|---|
| `controlSm`, `controlMd`, `controlLg` | 28, 32, 36px | 44, 48, 56px |
| `iconSm`, `icon`, `iconLg` | 14, 16, 20px | 18, 20, 24px |
| `fieldXs`, `fieldSm`, `fieldMd`, `fieldLg` | 6, 11, 17, 26rem | 8, 14, 22, 34rem |
| `toggle`, `toggleMark` (checkbox box, radio circle, check) | 16, 12px | 24, 18px |
| `switchWidth`, `switchHeight` | 28 by 16px | 44 by 26px |
| `sliderThumb`, `sliderTrack` (the track height that takes the pointer) | 16, 20px | 28, 44px |
| `togglePadding` (above and below a checkbox, radio, or switch row) | 0px | 10px |
| `topbar` (the height of the top bar of the app shell) | 48px | 64px |
| `font.md` (body) | 13px | 17px |
| `font.sm` (labels) | 12px | 15px |
| `font.xxl` (page title) | 20px | 26px |

- All primitives read these tokens. Thus buttons, fields, segmented controls, badges, checkboxes, radios, switches, sliders, and tables become larger together, without one-off styles.
- A one-line checkbox, radio, or switch row is at least 44px high. Menu, select, and list box options are at least `controlSm` high.
- Use touch density for a full page that runs on such a device. Do not use it for one control on a desk page.
- `Page` gives its density to the overlays of the page and to the app shell. Run `design docs Density` and `design docs AppShell#touch-density`.

## A Touch Page

- Prefer visible choices to a list in a popover. Show a short list in a `SegmentedControl` or a `RadioGroup`, not in a `Select`.
- Give a `DatePicker` its `quickPicks`, so people tap a day and do not open the calendar popover.
- A touch screen has no hover, and it keeps the hover state after a tap. Do not put an action or information behind a hover. [[reduced-motion#hover-on-touch-devices]] gives the general rule.
- Put feedback that only a hover shows, such as the underline of a link, under `media.finePointer`:

```ts
textDecorationLine: {
  default: "none",
  ":hover": { default: "none", [media.finePointer]: "underline" },
},
```

Touch density makes a desktop page larger. It does not make a desktop page into a page for work away from a desk. Run `design read kit-touch-work-view` to decide when an app needs a separate touch view.
