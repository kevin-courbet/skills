---
id: responsive
topic: layout
summary: Narrow screens keep the task and the priorities but change the information and the arrangement.
keywords: [responsive, mobile, mobile first, mobile layout, phone, small screen, narrow screen, breakpoint, stack, stacking, adaptive, tablet, media query, container query, pointer coarse, hover none, touch, safe area, notch, srcset, responsive images, picture element]
requires: [hierarchy]
related: [density, tables, form-layout]
---

# Responsive Adaptation

Adapt the information and the arrangement for small screens. Do not only shrink or stack the desktop design.

## Keep The Task

- Keep the priorities and the relationships, not the desktop geometry.
- Keep identifiers, critical values, status, and primary actions.
- Keep critical actions available. Change their layout instead of hiding them.
- Never make hover the only way to reach a function. Touch users cannot hover.
- Do not move related labels and values so far apart that their relationship becomes unclear.

## Recompose

- Recompose wide patterns. Do not only shrink them.
- Stack sections when columns cause wrapping. Do not stack automatically when this causes excessive scrolling or empty space.
- Recompose component internals to use narrow horizontal space. For example, put comparable prices in one right-aligned column.
- Replace a multi-column comparison only when the replacement still supports comparison.
- Do not scale all type and spacing by one ratio. Large desktop headlines usually need a smaller ratio on mobile.
- Change navigation in three stages: a menu button with a drawer on mobile, a compact horizontal bar on a tablet, and full navigation with labels on a desktop.
- Collapse secondary content on mobile with `<details>` and `<summary>`.
- Container queries are for components. Viewport queries are for the page layout. A component in a narrow sidebar then stays compact, and the same component in the main area expands:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 120px 1fr;
  }
}
```

## Overview And Detail

- Simplify overview screens: remove low-priority detail.
- Keep detail screens complete. Use scrolling or another explicit navigation pattern.
- For tables on narrow screens, [[tables#narrow-screens]] gives the rules.

## Breakpoints

- Write the base styles for mobile, and add complexity with `min-width` queries. Do not write desktop styles first with `max-width`.
- Set the breakpoints where the content stops working, not at device sizes. Start narrow, make the window wider until the design breaks, and add a breakpoint there. Three breakpoints are usually sufficient, such as 640, 768, and 1024px.
- Use `clamp()` for fluid values that need no breakpoint.
- Use feature detection, not device detection. Do not make separate code bases for mobile and desktop.

## Input Method

The screen size does not tell the input method. A laptop can have a touch screen, and a tablet can have a keyboard. Use pointer and hover queries:

```css
/* Mouse or trackpad. */
@media (pointer: fine) {
  .button { padding: 8px 16px; }
}

/* Touch or stylus: a larger target. */
@media (pointer: coarse) {
  .button { padding: 12px 20px; }
}
```

Gate hover effects behind `(hover: hover)`. [[reduced-motion#hover-on-touch-devices]] gives the rule for hover animation.

## Safe Areas

Phones have notches, rounded corners, and home indicators. Use `env()` and enable `viewport-fit=cover`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
.footer {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

## Responsive Images

- Use `srcset` with width descriptors and `sizes`. The browser then selects the file from the viewport width and the pixel density:

```html
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero image"
>
```

- Use `<picture>` with `<source media>` when a narrow screen needs a different crop, not only a different resolution.

## Test On Real Devices

Device emulation in the browser tools is useful for layout. It does not show real touch, CPU and memory limits, network latency, font rendering, or the browser bars and the keyboard. Test on one real iPhone and one real Android phone at least, and on a tablet when it is relevant. A cheap Android phone shows performance problems that a simulator does not show. Test tablet and landscape layouts too.
