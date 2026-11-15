/**
 * A native button with no look of its own, for a custom surface that is one control.
 *
 * @layer primitive
 * @keywords surface button, clickable card, clickable row, custom button, unstyled button, canvas object, card title button
 * @related Button, Item
 * @notes accessibility, component-feel, internal-app-adding-a-primitive
 *
 * Use it when people press a custom surface, such as a card title, a list row,
 * or an object on a canvas. Do not use it for an ordinary action or to submit a
 * form: use `Button`.
 *
 * ## Behavior
 * - It resets the native button and adds only the focus ring. `style` gives the
 *   whole look.
 * - It keeps the native pointer, click, and key events, so drag, pan, and
 *   delegated listeners on its ancestors continue to work. `Button` uses
 *   react-aria press handling, which stops these events.
 * - It is always `type="button"`, so it never submits a form.
 *
 * ## Rules
 * - Give it visible text or an `aria-label`.
 *
 * ## Example
 * ```tsx
 * <SurfaceButton style={styles.cardTitle} onClick={() => openJob(job.id)}>
 *   {job.title}
 * </SurfaceButton>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ButtonHTMLAttributes, Ref } from "react";
import { color } from "@/styles/tokens.stylex";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "style" | "type"
>;

export interface SurfaceButtonProps extends NativeButtonProps {
  /** Ref to the native button, for focus or for measurement. */
  readonly ref?: Ref<HTMLButtonElement>;
  /** The surface's whole look. It is applied after the reset. */
  readonly style?: StyleXStyles;
}

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
