---
id: component-feel
topic: motion
summary: Press feedback with scale, entries that never start from scale(0), popovers that scale from their trigger, tooltip delays, interruptible transitions, and the transform techniques behind them.
keywords: [component feel, press feedback, button press, active state scale, scale 0.97, scale(0), popover origin, transform-origin, origin aware popover, dropdown origin, tooltip delay, tooltip animation, starting-style, keyframes vs transitions, interruptible animation, crossfade blur, translate percentage, polish, details, sonner, toast]
requires: [motion, easing-and-duration]
related: [clip-path-animation, motion-performance, overlays, accessibility]
---

# Component Feel

Most details are invisible to users, and that is the goal. When a component behaves as people expect, they continue without a second thought. Many correct small details together make an interface that people like without knowing why.

## Press Feedback

Give every pressable element a short scale on `:active`, so that the interface shows that it received the press.

```css
.button {
  transition: transform 160ms ease-out;
}

.button:active {
  transform: scale(0.97);
}
```

- Keep the scale subtle: 0.95 to 0.98.
- `scale()` also scales the children: the text, the icons, and the content. This is correct for press feedback.

## Never Start From Scale Zero

Nothing in the real world appears from nothing. An element that grows from `scale(0)` seems to come from nowhere.

- Start an entry from `scale(0.9)` or more, together with `opacity: 0`. A barely visible start scale looks natural, like a balloon that has a shape also when it is empty.

```css
.entering {
  transform: scale(0.95);
  opacity: 0;
}
```

## Origin-Aware Popovers

A popover scales from its trigger, not from its center. The default `transform-origin: center` is wrong for almost every popover, dropdown, and menu.

```css
/* Radix UI */
.popover {
  transform-origin: var(--radix-popover-content-transform-origin);
}

/* Base UI */
.popover {
  transform-origin: var(--transform-origin);
}
```

A modal is the exception. It has no trigger anchor and appears in the center of the viewport, so it keeps `transform-origin: center`.

## Tooltips

- Delay a tooltip before it appears, so that people do not open it by accident.
- After one tooltip is open, open the adjacent tooltips at once, with no delay and no animation. The toolbar then feels faster, and the first delay keeps its purpose.

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* No animation on the next tooltips. */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

## Transitions For Interruptible UI

- Use CSS transitions, not keyframes, for an element that people can trigger quickly, such as a toast or a toggle. A transition retargets from its current value. A keyframe animation restarts from zero.
- Use keyframes only for animations that always run from start to end.

## Enter With Starting Style

Animate the entry of an element without JavaScript:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

This replaces a `useEffect` that sets `mounted: true` after the first render. Where the browser support is not sufficient, use that `useEffect` and a `data-mounted` attribute.

## Blur Hides A Bad Crossfade

When a crossfade between two states still looks wrong after you tried other easings and durations, add `filter: blur(2px)` during the transition. Without blur, people see two objects that overlap. The blur joins them, and the eye sees one transformation.

```css
.button-content {
  transition: filter 200ms ease, opacity 200ms ease;
}

.button-content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

Combine it with the press scale. [[motion-performance#blur-and-filters]] gives the limits of blur.

## Transform Techniques

- A percentage in `translate()` is relative to the size of the element. `translateY(100%)` moves an element by its own height. Sonner positions toasts this way, and Vaul hides the drawer this way. Prefer percentages to fixed pixel values, because they adapt to the content.
- Set `transform-origin` to the position of the trigger for origin-aware motion.
- `rotateX()` and `rotateY()` with `transform-style: preserve-3d` give real 3D effects in CSS, such as orbits and coin flips, without JavaScript.

```css
.wrapper {
  transform-style: preserve-3d;
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotateY(0deg) translateZ(72px) rotateY(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotateY(360deg) translateZ(72px) rotateY(0deg);
  }
}
```

## Lists That Change Height

When items enter and exit a list, the opacity change must fit the height animation. No formula gives this. Adjust the two until they feel correct. [[motion-performance#measure-then-animate]] gives the cheap way to animate height.

## Components That People Like

These principles come from Sonner, a toast library with more than 13 million downloads each week:

1. Make the adoption easy. Sonner needs no hooks, no context, and no setup: insert `<Toaster />` one time and call `toast()` from anywhere.
2. Good defaults are more important than options. Most people never change them, so the default easing, timing, and visual design must be excellent.
3. A good name gives the component an identity. "Sonner" (French for "to ring") is more memorable than "react-toast".
4. Handle edge cases invisibly. Pause toast timers when the tab is hidden. Fill the gaps between stacked toasts with pseudo-elements, so that the hover state stays. Capture the pointer during a drag.
5. Use transitions, not keyframes, for dynamic UI. [[component-feel#transitions-for-interruptible-ui]] gives the rule.
6. Make a documentation site where people can try the component, with examples and code that they can copy.
