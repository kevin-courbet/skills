---
id: springs-and-gestures
topic: motion
summary: Springs for drags, interruptible gestures, and decorative pointer tracking, with their settings, and the rules for swipe dismissal, boundaries, pointer capture, and discoverable gestures.
keywords: [spring, spring animation, springs, bounce, useSpring, framer motion spring, motion spring, drag, drag and drop, swipe, swipe to dismiss, gesture, gestures, momentum, velocity, flick, damping, rubber band, friction, pointer capture, multi-touch, drawer drag, interruptible]
requires: [motion]
related: [easing-and-duration, component-feel, motion-performance, responsive]
---

# Springs And Gestures

A spring simulates physics. It has no fixed duration: it settles from its physical settings. Springs feel more natural than duration-based animation for motion that people control with a pointer or a finger.

## When To Use A Spring

- A drag with momentum.
- An element that must feel alive, such as the Dynamic Island of Apple.
- A gesture that people can interrupt during the animation.
- A decorative interaction that follows the mouse.

## Interruptions

A spring keeps its velocity when an interruption occurs. A CSS animation or a keyframe animation restarts from zero. When people open an item and press Escape quickly, a spring reverses smoothly from its current position. Use springs for gestures that people can change during the motion.

## Spring Configuration

Apple's settings are easier to reason about. Use them by default:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

Physical settings give more control:

```js
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

- Do not use bounce in most UI.
- Use bounce only for drag-to-dismiss and playful interactions. Keep it subtle: 0.1 to 0.3.

## Springs That Follow The Pointer

A visual value that is tied directly to the mouse position feels artificial, because it has no motion. Interpolate the value with `useSpring` from Motion (before: Framer Motion):

```jsx
import { useSpring } from "framer-motion";

// Without a spring: instant and artificial.
const rotation = mouseX * 0.1;

// With a spring: natural, with momentum.
const springRotation = useSpring(mouseX * 0.1, {
  stiffness: 100,
  damping: 10,
});
```

This works because the animation is decoration. On a functional chart in a banking app, no animation is better. Know when decoration helps and when it is in the way.

## Momentum Dismissal

Do not require a drag past a distance threshold. Calculate the velocity. If it is more than approximately `0.11`, dismiss, whatever the distance. A quick flick is sufficient.

```js
const timeTaken = new Date().getTime() - dragStartTime.current.getTime();
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

## Boundaries

- When people drag past the natural boundary, such as a drawer that is already at the top, apply damping. The farther they drag, the less the element moves. Real objects slow down before they stop.
- Do not block the drag with a hard stop. Permit it with increasing friction. This feels more natural than an invisible wall.

## Pointer Capture And Multi-Touch

- When a drag starts, capture all pointer events on the element. The drag then continues when the pointer leaves the element.
- Ignore more touch points after the drag starts. Without this, a change of finger during the drag makes the element jump.

```js
function onPress() {
  if (isDragging) return;
  // Start the drag.
}
```

## Discoverable Gestures

A gesture, such as swipe-to-delete, is invisible. Show that it exists:

- Show part of the action, such as a delete button that comes out a little from the edge.
- Show a coach mark on the first use.
- Always give a visible alternative, such as a menu with "Delete". A gesture is never the only way to do an action.
