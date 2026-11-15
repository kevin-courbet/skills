---
id: reduced-motion
topic: motion
summary: Under prefers-reduced-motion, replace movement with short fades, keep the functional motion, and gate hover animation to devices with a fine pointer.
keywords: [reduced motion, prefers-reduced-motion, motion sickness, vestibular, useReducedMotion, accessible animation, disable animation, animations turned off, system setting, operating system setting, os setting, animation accessibility, hover on touch, hover media query]
requires: [motion]
related: [accessibility, responsive, motion-performance]
---

# Reduced Motion

Animation can cause motion sickness. Every animation that moves an element needs a reduced version.

## Reduce, Do Not Remove

Reduced motion means fewer and gentler animations, not no animation.

- Keep opacity and color transitions that help people understand the change.
- Remove movement and position animations.
- Replace an entry movement with a short fade:

```css
.card {
  animation: slide-up 500ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    /* A fade instead of movement. */
    animation: fade-in 200ms ease-out;
  }
}
```

- In React with Motion, read the setting and remove the distance:

```jsx
const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : '-100%';
```

- Do not set every duration to `0.01ms` with a global rule. It removes the fades that explain the change, and it also stops the functional motion.

## Keep Functional Motion

These animations continue under reduced motion, without spatial movement:

- Progress bars.
- Loading spinners, at a slower speed.
- Focus indicators.

## Hover On Touch Devices

A touch device triggers hover on a tap, so a hover animation plays when people do not expect it. Gate hover animations behind a fine pointer:

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

[[responsive]] gives the other pointer and hover rules.
