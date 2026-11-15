---
id: clip-path-animation
topic: motion
summary: Animate clip-path inset for tab color transitions, hold-to-delete, image reveals on scroll, and comparison sliders.
keywords: [clip-path, clip path, inset, reveal animation, wipe, hold to delete, hold to confirm, tab transition, active tab color, image reveal, scroll reveal, comparison slider, before after slider, mask animation]
requires: [motion]
related: [component-feel, easing-and-duration, motion-performance]
---

# Clip-Path Animation

`clip-path` is not only for shapes. It is one of the strongest animation tools in CSS.

## The Inset Shape

`clip-path: inset(top right bottom left)` defines a rectangular clip area. Each value removes part of the element from that side.

```css
/* Hidden from the right. */
.hidden {
  clip-path: inset(0 100% 0 0);
}

/* Fully visible. */
.visible {
  clip-path: inset(0 0 0 0);
}
```

## Tabs With Exact Color Changes

1. Make a copy of the tab list.
2. Style the copy as active, with a different background and a different text color.
3. Clip the copy so that only the active tab is visible.
4. Animate the clip when the tab changes.

The color change is seamless. Separate color transitions on each tab cannot get this result.

## Hold To Delete

1. Put a colored overlay on the button with `clip-path: inset(0 100% 0 0)`.
2. On `:active`, change it to `inset(0 0 0 0)` over 2s with `linear` timing.
3. On release, return it in 200ms with `ease-out`.
4. Add `scale(0.97)` on the button for press feedback. [[component-feel#press-feedback]] gives the rule.

```css
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}

.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

## Image Reveals On Scroll

- Start with `clip-path: inset(0 0 100% 0)`, which hides the image from the bottom.
- Animate to `inset(0 0 0 0)` when the element enters the viewport.
- Detect the entry with `IntersectionObserver`, or with `useInView` from Framer Motion with `{ once: true, margin: "-100px" }`.

## Comparison Sliders

- Put two images on top of each other.
- Clip the top image with `clip-path: inset(0 50% 0 0)`.
- Change the right inset from the drag position.

This needs no extra DOM elements.
