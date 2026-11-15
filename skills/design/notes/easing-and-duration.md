---
id: easing-and-duration
topic: motion
summary: Select ease-out for entries and exits, custom curves instead of the weak built-in ones, durations under 300ms for UI, faster exits, and short staggers.
keywords: [easing, easing curve, ease-out, ease-in, ease-in-out, cubic-bezier, duration, animation duration, timing, how long should an animation be, dropdown animation, dropdown animation feels slow, animation feels slow, sluggish animation, stagger, exit animation, motion tokens, linear]
requires: [motion]
related: [component-feel, springs-and-gestures, loading-states]
---

# Easing And Duration

The easing decides how fast the motion feels. The duration decides how long people wait. A slow curve or a long duration makes the whole interface feel slow.

## Select The Easing

Ask these questions in order:

1. Does the element enter or exit? Use `ease-out`. It starts fast, so that the interface feels responsive.
2. Does the element move or change shape on the screen? Use `ease-in-out`, for a natural acceleration and deceleration.
3. Is it a hover or a color change? Use `ease`.
4. Is it constant motion, such as a marquee or a progress bar? Use `linear`.
5. In all other cases, use `ease-out`.

Never use `ease-in` for UI animation. It starts slowly, at the moment when people look most closely. A dropdown with `ease-in` at 300ms feels slower than a dropdown with `ease-out` at the same 300ms.

Do not use bounce or elastic curves in ordinary UI. Real objects do not bounce when they stop. They slow down smoothly. An overshoot pulls the attention to the animation and away from the content. [[springs-and-gestures#spring-configuration]] gives the only permitted bounce.

## Easing Tokens

The built-in CSS curves are too weak. Use custom curves, which give the motion a clear intent:

```css
/* Strong ease-out for UI interactions. This is the default. */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);

/* Strong ease-in-out for movement on the screen. */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

/* A drawer curve like iOS, from the Ionic Framework. */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

When the product needs another ease-out strength, use one of these exponential curves:

- Quart out, smooth: `cubic-bezier(0.25, 1, 0.5, 1)`.
- Quint out, a little stronger: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Expo out, fast and confident: `cubic-bezier(0.16, 1, 0.3, 1)`.

Do not make a curve from nothing. Find a stronger variant of a standard curve at [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/).

## Duration

| Element | Duration |
| --- | --- |
| Press feedback on a button | 100 to 160ms |
| Tooltip or small popover | 125 to 200ms |
| Dropdown or select | 150 to 250ms |
| Modal or drawer | 200 to 500ms |
| Page load or hero reveal on a marketing page | 500 to 800ms |
| Marketing or explanatory animation | Longer is permitted |

- Keep UI animation under 300ms. A 180ms dropdown feels more responsive than a 400ms dropdown.
- Do not use more than 500ms for UI feedback.
- Make an exit faster than its entry. Approximately 75% of the entry duration is a good start.

## Asymmetric Timing

Make the motion slow where people decide, and fast where the system responds.

- A deliberate press can be slow: a hold-to-delete overlay fills in 2s with `linear` timing.
- The release is always fast: 200ms with `ease-out`.

```css
/* Release: fast. */
.overlay {
  transition: clip-path 200ms ease-out;
}

/* Press: slow and deliberate. */
.button:active .overlay {
  transition: clip-path 2s linear;
}
```

[[clip-path-animation#hold-to-delete]] gives the complete pattern.

## Speed Changes Perceived Performance

- `ease-out` at 200ms feels faster than `ease-in` at 200ms, because people see the movement at once.
- A fast spinner makes the load feel faster, also when the load time is the same.
- After the first tooltip opens, open the next tooltips at once, without a delay and without animation. [[component-feel#tooltips]] gives the rule.

## Stagger

When several elements enter together, stagger them. Each element starts a little after the previous one.

```css
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: fade-in 300ms ease-out forwards;
  animation-delay: calc(var(--i, 0) * 50ms);
}

@keyframes fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- Set `style="--i: 0"`, `style="--i: 1"`, and so on, on the items.
- Keep the delay between items short: 30 to 80ms. Long delays make the interface feel slow.
- Limit the total stagger time. 10 items at 50ms take 500ms. For many items, reduce the delay for each item, or stagger only the first items.
- Stagger is decoration. Never block interaction while a stagger plays.
