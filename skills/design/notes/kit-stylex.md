---
id: kit-stylex
topic: kit
summary: Write the styles of an app on the kit with StyleX only, with nested pseudo-classes, variant maps, a style prop, style functions, longhand properties, and the renderStyles adapter for react-aria render props.
keywords: [StyleX, stylex.create, stylex.props, write styles, styling, CSS, pseudo-class, hover style, media query key, variants, style prop, StyleXStyles, style function, dynamic style, custom property, keyframes, pseudo-element, border shorthand, longhand, renderStyles, react-aria render props, isSelected style]
related: [kit-tokens, kit-check-rules, kit-motion]
---

# Kit StyleX

StyleX is the only way to style an app on the kit. Do not use utility classes, CSS modules, inline style objects with raw values, or a CSS file for a component. The compiler changes each `stylex.create` call into atomic classes at build time. Thus the full visual system is in the token files. Run `design read kit-tokens`.

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
    transitionProperty: "background-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
});
```

- Put pseudo-classes and media queries in the property, with a `default` key. Do not write selectors.
- Use the `media.*` and `layer.*` constants for media-query keys and z-index values.
- Write variants as separate `stylex.create` maps that a prop indexes: `intents[intent]`, `sizes[size]`.
- Apply styles with `{...stylex.props(styles.base, cond && styles.active, style)}`. A later argument wins.
- Give a layout component a `style?: StyleXStyles` prop, so that a parent can set its width or margin. Spread it last.
- A dynamic value, such as a measured width or a computed color, uses a style function: `stylex.create({ width: (px: number) => ({ width: px }) })`. Use style functions rarely.
- You can use a custom property as a key: `"--aperture-color-text": color.text`. The chart host bridge uses this.
- Use `stylex.keyframes` only for enter, exit, change, and loading motion. Each style that moves an element gets a `media.reducedMotion` override that removes the movement. Color and opacity transitions stay. Run `design read kit-motion`.
- Give the reduced-motion override a value that stops the movement, such as `transform: { default: null, ":active": { default: "scale(0.97)", [media.reducedMotion]: "none" } }`. Do not use `null` for it: StyleX writes no rule for a `null` value, so the element still moves.
- Do not use the pseudo-elements `::before` and `::after`. Render a real element.
- Set the base font size on `<body>`, not on `<html>`. A rem-based `fontSize` on `<html>` changes the scale of each rem token.

## Longhand Properties

Write longhands for `border`, `background`, and `outline`. In the verified build, `border: "none"` and `background: "transparent"` on a `<button>` did not remove the native border and background, although the compiler emitted the classes. `borderStyle: "none"`, `backgroundColor: "transparent"`, and `outlineStyle: "none"` remove them correctly. The `margin`, `padding`, `gap`, `inset`, and `flex` shorthands compile and apply. `design check` fails on the three shorthands with the rule `stylex-shorthand`.

## React Aria Render Props

react-aria-components gives its state through render props on `className` and `style`. `src/lib/rac.ts` has the `renderStyles` adapter:

```tsx
<Tab
  {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean }>((state) => [
    styles.tab,
    state.isSelected && styles.tabSelected,
    state.isFocusVisible && styles.tabFocused,
  ])}
/>
```

- Use `renderStyles` for `isSelected`, `isInvalid`, `isOpen`, `isPlaceholder`, `isEntering`, `isExiting`, `isFocused` on collection items, and `isDisabled` on elements that are not form elements.
- Use plain `stylex.props` with `:hover`, `:active`, `:focus-visible`, and `:disabled` for all other states.
