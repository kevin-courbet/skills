/**
 * The StyleX marker on the root of `AppShell`.
 *
 * @layer helper
 * @keywords shell marker, stylex marker, when ancestor, shell root, touch page in shell
 * @related AppShell, Density, Layout
 * @notes density, internal-app-adding-a-primitive
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

/**
 * Marks the root of `AppShell`, so the parts of the shell can follow the page
 * that the shell holds. StyleX needs a marker in a `.stylex.ts` file.
 */
export const shellMarker = stylex.defineMarker();
