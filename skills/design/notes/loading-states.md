---
id: loading-states
topic: interaction
summary: Make waits feel shorter with skeletons, an immediate start, progressive content, and optimistic updates for low-stakes actions only.
keywords: [loading, loading state, skeleton, skeleton screen, spinner, optimistic ui, optimistic update, rollback, perceived performance, feels slow, wait, progress, progressive loading, 80ms, instant feedback]
related: [easing-and-duration, motion, ux-writing, accessibility]
---

# Loading States

People do not measure the speed of a product. They feel it. A good loading state makes the same wait feel shorter.

## Thresholds

- People feel a response under approximately 80ms as instant. Use this target for micro-interactions.
- Do not use animation to hide a slow load. Make the load faster, or show the progress.

## Active Waiting

A passive wait, such as a spinner, feels longer than an active wait. Give people something to see:

- **Start at once.** Begin the transition while the content loads, as iOS zooms an app open, or show a skeleton.
- **Show content early.** Show content as it arrives. Do not wait for all of it. Progressive images and streamed HTML do this.
- Use skeleton screens instead of spinners for content. A skeleton shows the shape of the content and feels faster than a generic spinner.
- When you use a spinner, make it spin fast. [[easing-and-duration#speed-changes-perceived-performance]] gives the reason.
- Use `linear` timing for a progress bar.

## Optimistic Updates

- Update the interface at once, and synchronize later. If the request fails, return the interface to its previous state and tell people what happened.
- Use optimistic updates only for low-stakes actions, such as a like or a follow.
- Never use them for payments or destructive actions.

## Too Fast

For a complex operation, such as a search or an analysis, an instant result can make people distrust it. A short delay can show that real work occurred.

## Loading Copy

Write specific loading text, such as "Saving your draft...", and give the expected time for a long wait. [[ux-writing#loading-and-progress]] gives the rules.
