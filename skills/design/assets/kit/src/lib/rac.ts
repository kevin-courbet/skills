import * as stylex from "@stylexjs/stylex";
import type { CompiledStyles, InlineStyles, StyleXArray } from "@stylexjs/stylex";
import type { CSSProperties } from "react";

export type StyleArg = StyleXArray<
  null | undefined | boolean | CompiledStyles | Readonly<[CompiledStyles, InlineStyles]>
>;

/**
 * Adapts StyleX to react-aria-components render props. Use it when a style
 * depends on a state that CSS cannot express, such as isSelected, isInvalid,
 * isOpen, isEntering, or isPlaceholder. Prefer StyleX pseudo-classes for
 * hover, active, focus-visible, and disabled.
 */
export function renderStyles<State>(resolve: (state: State) => ReadonlyArray<StyleArg>) {
  return {
    className: (state: State): string => stylex.props(...resolve(state)).className ?? "",
    style: (state: State): CSSProperties =>
      (stylex.props(...resolve(state)).style ?? {}) as CSSProperties,
  };
}
