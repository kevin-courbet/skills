/**
 * The StyleX marker on the root of `AppShell`.
 *
 * @layer shell
 * @keywords shell marker, stylex marker, when ancestor, shell root, touch page in shell
 * @related AppShell, Density, Layout
 * @notes density, kit-adding-a-component
 *
 * The parts of the shell use this marker with `stylex.when.ancestor` to follow
 * the density of the page that the shell holds. Do not use it in a page or in
 * a feature: a page sets its density with `Page density`.
 *
 * ## Rules
 * - StyleX reads a marker only from a `.stylex.ts` file, so the marker cannot
 *   move into `app-shell.tsx`.
 *
 * ## Example
 * ```ts
 * const styles = stylex.create({
 *   topbar: {
 *     height: {
 *       default: size.controlMd,
 *       [stylex.when.ancestor(touchPageInShell, shellMarker)]: touchSize.controlMd,
 *     },
 *   },
 * });
 * ```
 */
import * as stylex from "@stylexjs/stylex";

export const shellMarker = stylex.defineMarker();
