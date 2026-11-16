---
id: internal-app-review
topic: internal-app
summary: The definition of done for a change to an internal app, with the automated gates, the rendered checks in a real browser in both themes and at three widths, the browser pitfalls, and the handoff report.
keywords: [review before finishing, definition of done, done, handoff, hand off, verify a change, automated gates, format lint tsc build, check sync doctor, rendered checks, screenshots, both themes, agent-browser, browser pitfalls, page zoom, visibilityState, reduced motion in tests, main-content scroll, report unmet items]
specializes: [review]
related: [internal-app-review-checklist, internal-app-check-rules, kit-update]
---

# Internal App Review

Do each step before you report a page or an app as complete. A failure is a defect to fix, not a note to add. Then answer each question of `design read internal-app-review-checklist`.

## Automated Gates

Run these commands in the root of the app:

```sh
bun run format
bun run lint
bun run tsc
bun run build
bun run test
design check
design sync
design doctor
```

- `design check` lists the convention findings with the file and the line. Fix the source. There are no ignore comments. Run `design read internal-app-check-rules`.
- `design sync` without `--write` must report that all kit files match the kit of the design skill. A `modified` file means that a person edited a kit file in the app. Move that change into the kit ([[kit-update#edits-to-kit-files]]).
- `design doctor` must have no `FAIL` rows. Report each `WARN` row in the handoff, with its reason.

## Rendered Checks

Start the built server with `bun run start`. Examine it in a real browser with the `agent-browser` skill (`ab chrome --url ...`, `ab snapshot`, `ab screenshot`). Capture:

1. Each changed page in the light theme and in the dark theme. Change the theme with the theme menu at the end of the top bar, or set the `theme` cookie to `light` or `dark`.
2. Each empty, loading, and error state that the page can show.
3. Each dialog, sheet, menu, and popover that the page opens, and one invalid form field.
4. Each form before and after a submit with errors. Make sure that the `ErrorSummary` takes the focus and counts the problems, that each link moves the focus to its field, and that Tab gets to each control in the order of the page. Examine a long form at the `touch` density when it runs on a tablet.
5. The page at 400px, 768px, and 1440px wide. At 400px and 768px, the menu button in the top bar opens the navigation. At 400px, the top bar shows the full page title. Examine a touch page at 1440px with a mouse, and at 1180px and 768px with touch emulation. With a mouse, the sidebar shows. With touch emulation, the sidebar is hidden at each width.
6. After a kit change, the `/lab` recipes that use the changed components, in the two themes. Scaffold them with `design new <dir> --app internal-app --lab`.
7. The system theme during hydration and after a change of the native color scheme. The document theme must follow the native preference without hydration errors.

Compare the pages with the tokens. Surfaces, text, borders, and spacing must come from tokens. The dark theme must keep the hierarchy without inversion.

## Browser Pitfalls

- Before you capture, make sure of `innerWidth` and `devicePixelRatio` with `ab eval`. A saved page zoom in the browser profile changes the layout width, but the screenshot size stays the same.
- An automated window can report `document.visibilityState` as `hidden`. The browser then pauses CSS animations and drops key events, and react-aria overlays wait for their exit animation. Run `ab eval 'document.visibilityState'` before you examine open and close flows. When it is `hidden`, bring the browser window to the front. Reduced motion does not remove the wait, because the kit overlays still fade under reduced motion. Open an overlay with a click on its trigger, not with key presses.
- The page scrolls in the shell panel (`#main-content`), not in the window. Scroll that element, not `window`, before you capture an element below the fold. The scroll restoration of the router can open it again at a scrolled position.
- Find controls by role and name. A column header and a filter can both have the name "Status".

## Handoff

Report what changed, the commands that ran with their results, the screenshots, and each checklist item that is not met, with the reason. Report a missing gate. Never imply it.
