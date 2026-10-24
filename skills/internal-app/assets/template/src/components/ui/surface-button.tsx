import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ButtonHTMLAttributes, Ref } from "react";
import { color } from "@/styles/tokens.stylex";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "style" | "type"
>;

export interface SurfaceButtonProps extends NativeButtonProps {
  readonly ref?: Ref<HTMLButtonElement>;
  /** The surface's whole look. It is applied after the reset. */
  readonly style?: StyleXStyles;
}

/**
 * A custom surface that acts as one control, such as a card title, a list row,
 * or an object on a canvas.
 *
 * Button handles presses through react-aria, which stops pointer and click events
 * from reaching ancestors. A surface keeps the native events, so drag, pan, and
 * delegated listeners on its ancestors keep working. Use Button for every other
 * action, and for anything that submits a form.
 */
export function SurfaceButton({ ref, style, ...props }: SurfaceButtonProps) {
  return <button ref={ref} type="button" {...props} {...stylex.props(styles.reset, style)} />;
}

const styles = stylex.create({
  reset: {
    appearance: "none",
    margin: 0,
    padding: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    lineHeight: "inherit",
    letterSpacing: "inherit",
    textAlign: "inherit",
    cursor: { default: "pointer", ":disabled": "default" },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineOffset: "2px",
    outlineColor: color.focus,
  },
});
