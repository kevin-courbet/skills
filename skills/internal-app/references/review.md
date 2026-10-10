# Review And Definition Of Done

Run every step before reporting a page or an app as complete. Treat a failure
as a defect to fix, not a note to add.

## Automated Gates

Run in the app root:

```sh
bun run format
bun run lint
bun run tsc
bun run build
bun run test
bun "$SKILL_DIR/scripts/internal-app" check
bun "$SKILL_DIR/scripts/internal-app" sync
bun "$SKILL_DIR/scripts/internal-app" doctor
```

- `check` lists convention findings with file and line. Fix the source; there are no ignore comments.
- `sync` without `--write` must report that all kit files match the skill. A `modified` file means someone edited a kit file in the app; move that change into the skill.
- `doctor` must have no `FAIL` rows. Each `WARN` row is reported in the handoff with its reason.

## Rendered Checks

Start the built server (`bun run start`) and inspect it with a real browser.
Use the `agent-browser` skill (`ab chrome --url ...`, `ab snapshot`,
`ab screenshot`). Capture:

1. Each changed page in the light theme and the dark theme. Switch with the theme menu in the top bar or set the `theme` cookie to `light` or `dark`.
2. Every empty, loading, and error state the page can show.
3. Each dialog, sheet, menu, and popover the page opens, and one invalid form field.
4. The page at 400 px and at 1440 px wide. At 400 px, the navigation opens from the menu button in the top bar.
5. `/design-kit` after a kit install or update, in both themes.

Compare against the tokens: surfaces, text, borders, and spacing must come
from tokens, and the dark theme must keep hierarchy without inverting.

Browser pitfalls:

- Confirm `innerWidth` and `devicePixelRatio` with `ab eval` before capturing. A saved page zoom in the browser profile changes the layout width while the screenshot size stays the same.
- An automated window can report `document.visibilityState` as `hidden`. The browser then pauses CSS animations and drops key events, and react-aria overlays wait for their exit animation. Run `ab set media reduced-motion` before checking open and close flows. Open overlays with a click on their trigger, not with key presses.
- Router scroll restoration can reopen a page scrolled down. Scroll to the element before capturing an overlay anchored to it.
- Find controls by role and name. A column header and a filter can both be named "Status".

## Checklist

Hierarchy and layout:

- The page purpose and primary action are clear within seconds.
- One primary button per view. Secondary actions are quiet.
- Labels are quieter than values. Section titles are quieter than content.
- Spacing shows grouping. Cards wrap only distinct or actionable groups.
- Tables: text left, numbers right with tabular figures, sort state announced, names link to detail pages.

States and data:

- SSR-loaded data renders without a loading state.
- Empty states appear only after data resolved to empty. Filtered-to-zero has a clear-filters action.
- Errors are visible with a next action. No silent fallback, no empty plot in place of an error.
- Mutations show failures inline with `failureMessage`. Success is shown by the UI, not a toast.
- Search, sort, filter, and page live in the URL and survive reload.
- A missing record shows the not-found page, not a generic error.

Accessibility and input:

- Every control is reachable by keyboard with a visible focus ring.
- Icon-only buttons have `aria-label`. Decorative icons have `aria-hidden`.
- Status and selection do not depend on color alone.
- Text contrast is at least 4.5:1 in both themes. Controls and focus rings reach 3:1.
- Reduced motion disables enter and exit animation.

Navigation:

- The current item uses a selected surface and `aria-current="page"`. No left-edge border, rail, pseudo-element, or inset shadow.
- Breadcrumbs name the location; detail pages show the record name.
- At 400 px the sheet navigation contains every sidebar item.

Code:

- No `any`, no non-null assertions, no nested ternaries, no console output.
- Routes import feature `api.ts`, components, and lib only.
- Server functions validate input with Effect Schema and run through `runServerFn`.
- Effect services use `Context.Service` and `Layer`. Errors are tagged and mapped at the boundary.
- Styles use tokens only. Variants are StyleX maps. No kit file is edited.
- Charts use Aperture with the host bridge on every Aperture root and SVG rendering for SSR.

## Handoff

Report what changed, the commands that ran with their results, the
screenshots captured, and every checklist item that was not met with the
reason. A missing gate is reported, never implied.
