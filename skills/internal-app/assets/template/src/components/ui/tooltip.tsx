/**
 * A short hint that shows on hover and on keyboard focus of a control.
 *
 * @layer primitive
 * @keywords tooltip, hint, hover text, icon button label, help on hover, title attribute
 * @related HoverCard, Button, Popover
 * @notes overlays, component-feel, accessibility
 *
 * Use it for a short hint on a control, such as the name of an icon-only
 * button. Do not use it for required information: a touch screen has no hover,
 * so put that information on the page or in a `description`. For a preview of a
 * record, use `HoverCard`.
 *
 * ## Behavior
 * - `TooltipTrigger` opens the tooltip after a delay on hover, and on keyboard
 *   focus. Escape closes it.
 * - The tooltip takes the density of the page and fades in.
 *
 * ## Rules
 * - Wrap a focusable trigger, such as a kit `Button`, and the `Tooltip` in
 *   `TooltipTrigger`.
 * - An icon-only button still needs its own `aria-label`.
 *
 * ## Example
 * ```tsx
 * <TooltipTrigger>
 *   <Button intent="ghost" iconOnly aria-label="Refresh"><RefreshCw /></Button>
 *   <Tooltip>Refresh</Tooltip>
 * </TooltipTrigger>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, layer, radius, shadow, space } from "@/styles/tokens.stylex";
import { overlay } from "./overlay";
import { useOverlayDensity } from "./density";

export interface TooltipProps extends Omit<AriaTooltipProps, "className" | "style" | "children"> {
  /** The hint: a few words. */
  readonly children: ReactNode;
}

/** Wrap a focusable trigger and this tooltip in TooltipTrigger. Never put required information only here. */
export function Tooltip({ children, offset = 6, ...props }: TooltipProps) {
  const overlayDensity = useOverlayDensity();
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        ...overlayDensity,
        styles.tooltip,
        state.isEntering && overlay.entering,
        state.isExiting && overlay.exiting,
      ])}
    >
      {children}
    </AriaTooltip>
  );
}

export { TooltipTrigger };

const styles = stylex.create({
  tooltip: {
    zIndex: layer.tooltip,
    maxWidth: "18rem",
    paddingBlock: space.xs,
    paddingInline: space.sm,
    fontSize: font.sm,
    lineHeight: "1.4",
    color: color.textInverse,
    backgroundColor: color.text,
    borderRadius: radius.md,
    boxShadow: shadow.md,
  },
});
