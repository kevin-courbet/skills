---
id: preview-server
topic: process
summary: Keep a component preview fast, measure its speed in separate steps, and keep one development server with its caches for the whole review.
keywords: [preview performance, slow preview, ladle slow, storybook slow, dev server, development server, hot reload, vite cache, fixed port, story discovery, docgen, preview startup]
requires: [proposal-previews]
related: [motion-performance]
---

# Preview Server

A slow preview stops the review. Measure it, and keep the server running.

## Keep The Preview Fast

1. Check the published version of the tool and its dependencies before you install it.
2. Limit story discovery to the preview folders.
3. Load stories on demand. Keep optional addons disabled until the review needs them.
4. Measure these steps separately: the server start, the first usable screen, cached navigation, scenario changes, and hot reload.
5. Record the machine, the component workload, the cache state, the number of samples, and the start and end of each measurement.
6. After a slow operation, profile the real process before you change tools or clear caches.
7. Keep temporary benchmark code out of the committed tests.

- The repository code, generated translations, styles, and imported libraries all add to the preview cost.
- Generated translation modules can make the automatic component documentation block the development server. Limit that analysis to the component source when the tool permits it. Otherwise, disable automatic documentation for the preview.
- The published Ladle package can use an older Vite version than its upstream source. Do not use the upstream package metadata or old marketing benchmarks as measurements of the installed version.

## Use The Development Loop

1. Compile generated inputs, such as translations, before the preview imports changed symbols.
2. Start the development server on a fixed port. A port conflict is an error.
3. Keep the same server running during the review and the feedback.
4. Use hot reload for normal component changes.
5. Keep the dependency caches and the module cache of the server.
6. Restart the server only for a configuration change or an observed server error.
7. Validate each coherent change with focused browser checks.
8. Run the required validation of the repository before the handoff.

- Do not run a static production build after each change, screenshot, or feedback round. Build the static preview only when you must publish it or validate the static artifact.
- Do not clear caches without an identified cache problem.
- After a slow command, record its duration and find the cause before you run it again.
- Dependency caches and static-build caches are different. Check the cache behavior of each tool before you make a claim about it.
- If the preview setup blocks the review, propose the smaller harness, and keep the real components.
