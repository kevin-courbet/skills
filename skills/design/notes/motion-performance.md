---
id: motion-performance
topic: motion
summary: Keep animation smooth with transform and opacity, measure-then-animate, scroll timelines, local CSS variables, small blur, and the existing animation library, and report each defect with its line and fix.
keywords: [animation performance, janky animation, jank, stutter, dropped frames, choppy animation, layout thrashing, compositor, gpu, hardware acceleration, will-change, transform and opacity, flip, scroll animation, scroll timeline, intersection observer, view transitions, blur animation, css variables animation, framer motion performance, waapi, accordion height]
requires: [motion]
related: [component-feel, clip-path-animation, springs-and-gestures, review]
---

# Motion Performance

A slow animation is worse than no animation. Apply the rules in this order. The first two sections and the last section are critical.

## Rendering Work

The browser does three types of work. Each type is more expensive than the one before it:

- **Composite:** `transform` and `opacity`.
- **Paint:** color, borders, gradients, masks, images, and filters.
- **Layout:** size, position, flow, grid, and flex.

Animating `padding`, `margin`, `height`, or `width` causes all three types of work on each frame.

## Never

- Do not read layout and write layout in the same frame.
- Do not animate layout continuously on large or important surfaces.
- Do not drive animation from `scrollTop`, `scrollY`, or scroll events.
- Do not run a `requestAnimationFrame` loop without a stop condition.
- Do not mix animation systems that each measure or change layout.

## Choose The Mechanism

- Use `transform` and `opacity` for motion by default.
- Use JavaScript animation only when the interaction needs it, such as a drag.
- Animate paint or layout only on small and isolated surfaces.
- A one-time effect is acceptable more often than continuous motion.
- Use a cheaper technique before you remove the motion.
- Do not use `transition: all`. Name each property that animates.

## Measure Then Animate

- Measure one time, then animate with `transform` or `opacity`.
- Read all layout values before you write any value.
- Do not read layout again during the animation.
- For an effect that looks like a layout change, use FLIP:

```js
// Measure the first position and the last position, then animate the difference.
const first = el.getBoundingClientRect();
el.classList.add('moved');
const last = el.getBoundingClientRect();
el.style.transform = `translateX(${first.left - last.left}px)`;
requestAnimationFrame(() => {
  el.style.transition = 'transform 0.3s';
  el.style.transform = '';
});
```

- For an accordion, animate `grid-template-rows` from `0fr` to `1fr`, not `height`.

## Scroll

- Use scroll timelines and view timelines where the browser supports them:

```css
.reveal {
  animation: fade-in linear;
  animation-timeline: view();
}
```

- Use `IntersectionObserver` to detect visibility and to pause animations. Stop the observation after a one-time animation.
- Do not poll the scroll position.
- Pause or stop animations that are not on the screen.
- Scroll-linked motion must not cause continuous layout or paint on large surfaces.

## Paint And CSS Variables

- Animate paint properties only on small, isolated elements. Never on large containers.
- Do not animate CSS variables for `transform`, `opacity`, or position.
- Do not animate CSS variables that children inherit. A change on a parent recalculates the styles of all children. Set the variable on the element that uses it.

```js
// Wrong: all children of the drawer recalculate their styles.
element.style.setProperty('--swipe-amount', `${distance}px`);

// Correct: only this element changes.
element.style.transform = `translateY(${distance}px)`;
```

## Layers

- Never assume that the browser promotes an element to its own layer.
- Use `will-change` only for a short time and only on the element that animates, when the animation is about to start, such as on `:hover` or on an `.animating` class. Do not set it in advance on many elements.
- Avoid many promoted layers and large promoted layers.
- When performance is important, check the layers with the browser tools.

## Blur And Filters

- Keep an animated blur at 8px or less.
- Use an animated blur only for a short, one-time effect, such as [[component-feel#blur-hides-a-bad-crossfade]].
- Never animate blur continuously, and never on large surfaces.
- Try opacity and translation before blur.
- Keep a static blur under 20px. Large blur is expensive, mostly in Safari.

## View Transitions

- Use view transitions only for navigation between pages or views.
- Do not use them for UI with much interaction, or when people must interrupt or cancel the change.
- A size change in a view transition can cause layout.

## Libraries And The Main Thread

- CSS animations and the Web Animations API (WAAPI) run off the main thread. When the browser loads a page, runs scripts, or paints, `requestAnimationFrame` animations drop frames, but CSS animations stay smooth.
- Use CSS for animations that are known in advance. Use JavaScript for dynamic animations that people can interrupt.
- The shorthand properties `x`, `y`, and `scale` of Motion (before: Framer Motion) run on the main thread. Use the full `transform` string for hardware acceleration:

```jsx
// Main thread: drops frames under load.
<motion.div animate={{ x: 100 }} />

// Hardware accelerated: smooth also when the main thread is busy.
<motion.div animate={{ transform: "translateX(100px)" }} />
```

At Vercel, the dashboard tab animation used shared layout animations and dropped frames during page loads. CSS animations fixed it.

- WAAPI gives JavaScript control with CSS performance and needs no library. [[clip-path-animation#image-reveals-on-scroll]] can use it:

```js
element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
  duration: 1000,
  fill: 'forwards',
  easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
});
```

## Tool Boundaries

- Do not migrate or rewrite an animation library unless the user asks for it.
- Apply these rules in the animation system that the project already uses.
- Never migrate an API partly, and never mix animation styles in one component.

## Report Performance Defects

- Enforce the critical rules first: Never, Choose The Mechanism, and Tool Boundaries.
- Select the cheapest rendering work that gives the intended effect.
- For each choice that is not the default, state the constraint that makes it necessary: the surface size, the duration, or the interaction.
- For each defect, quote the exact line, give the reason in one short sentence, and give a fix in code. Use the table in [[review#findings-format]].

| Before | After | Why |
| --- | --- | --- |
| `.panel { transition: width 0.3s; }` | `.panel { transition: transform 0.3s; }` | `width` causes layout on each frame. |
| `window.addEventListener('scroll', () => el.style.opacity = scrollY / 500)` | `.reveal { animation: fade-in linear; animation-timeline: view(); }` | Scroll events run on the main thread. |
