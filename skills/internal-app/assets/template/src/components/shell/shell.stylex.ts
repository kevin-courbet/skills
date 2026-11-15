import * as stylex from "@stylexjs/stylex";

/**
 * Marks the root of `AppShell`, so the parts of the shell can follow the page
 * that the shell holds. StyleX needs a marker in a `.stylex.ts` file.
 */
export const shellMarker = stylex.defineMarker();
