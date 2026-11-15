---
id: motion
topic: motion
summary: The entry note for motion, which decides whether an element animates, what the animation is for, and which motion note to read next.
keywords: [motion, animation, animate, should this animate, when to animate, transition, micro-interaction, motion design, keyboard shortcut animation, command palette animation, delight, page load animation, animation fatigue, movement, slide in, fade in, is animation worth it]
related: [easing-and-duration, component-feel, reduced-motion, motion-performance, springs-and-gestures, method]
---

# Motion

Motion is part of the design. It explains a change, confirms an action, or keeps the space consistent. Before you write animation code, answer the questions in this note in their order.

## Motion Process

1. Decide if the element animates. [[motion#how-often-people-see-it]] gives the rule.
2. Name the purpose. [[motion#purpose]] gives the valid purposes.
3. Select the easing and the duration. [[easing-and-duration]] gives the values.
4. Build the component feel: press, entry, origin, and tooltips. [[component-feel]] gives the rules.
5. For a drag, a swipe, or an interruptible gesture, use [[springs-and-gestures]].
6. For a reveal, a wipe, or a hold-to-confirm effect, use [[clip-path-animation]].
7. Animate only cheap properties. [[motion-performance]] gives the rules.
8. Make a reduced version. [[reduced-motion]] gives the rules.
9. Check the motion in slow motion and on real devices. [[motion#check-the-motion]] gives the steps.

## How Often People See It

| Frequency | Decision |
| --- | --- |
| 100 or more times each day, such as a keyboard shortcut or a command palette toggle | No animation. |
| Tens of times each day, such as hover effects and list navigation | Remove the animation or reduce it a lot. |
| Occasionally, such as modals, drawers, and toasts | Standard animation. |
| Rarely or one time, such as onboarding, a feedback form, or a celebration | Delight is permitted. |

- Never animate an action that starts from the keyboard. People repeat these actions hundreds of times each day, and the animation makes them feel slow and disconnected. Raycast has no open or close animation, which is correct for a tool that people use hundreds of times each day.
- Do not animate everything. Animation fatigue is real.
- Do not use animation to hide slow loading. [[loading-states]] gives the rules for waits.

## Purpose

Each animation has a clear answer to the question "why does this animate?" These purposes are valid:

- **Spatial consistency.** A toast enters and exits from the same direction, so that swipe-to-dismiss feels natural.
- **State indication.** A feedback button changes shape to show the new state.
- **Explanation.** A marketing animation shows how a feature works.
- **Feedback.** A button scales down on press, which confirms that the interface received the input.
- **No jarring change.** An element that appears or disappears without a transition looks broken.

If the only purpose is "it looks good", and people see the animation often, do not animate.

Use motion for state changes: entries, exits, and feedback. On a marketing or content page, one well-orchestrated page load with staggered reveals gives more delight than many scattered micro-interactions. [[easing-and-duration#stagger]] gives the timing.

## Match The Motion To The Product

- Match the motion to the personality of the component and the product. A playful component can have more bounce. A professional dashboard has crisp and fast motion.
- Keep the motion cohesive with the rest of the design. Sonner feels satisfying partly because its easing and duration fit the library: it is a little slower than typical UI motion and uses `ease`, not `ease-out`, to feel more elegant.
- Put the durations and the easing curves in motion tokens, so that the product stays consistent. [[easing-and-duration#easing-tokens]] gives the default tokens.

## Check The Motion

- Play the animation slowly. Increase the duration to 2 to 5 times its normal value for a short time, or slow the playback in the animation inspector of the browser developer tools.
- Step through the animation frame by frame in the Animations panel of Chrome DevTools. This shows timing problems between coordinated properties.
- In slow motion, ask:
  - Do colors change smoothly, or do two distinct states overlap?
  - Does the easing feel correct, or does the motion start or stop abruptly?
  - Is the `transform-origin` correct, or does the element scale from the wrong point?
  - Do opacity, transform, and color stay in sync?
- Test touch interactions, such as drawers and swipe gestures, on physical devices. Connect the phone with USB, open the local development server by its IP address, and use the remote developer tools of Safari. The Xcode Simulator is an alternative, but real hardware is better for gestures.
- Look at the animation again the next day. You see defects with fresh eyes that you did not see during development.
