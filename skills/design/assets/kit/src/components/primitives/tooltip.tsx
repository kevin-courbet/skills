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
 * - `TooltipTrigger` opens the tooltip on keyboard focus, and on hover after
 *   600 ms, so that a pointer that passes over the control does not open it.
 *   Escape closes it.
 * - While one tooltip is open, and for 500 ms after it closes, the next
 *   tooltip opens at once and without motion. Thus people can read a row of
 *   icon buttons quickly.
 * - The first tooltip grows and fades in from its trigger. Under reduced
 *   motion, it only fades. It takes the density of the page.
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
import { type ReactNode, useContext, useEffect, useState } from "react";
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps,
  TooltipTriggerStateContext,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, layer, radius, shadow, space } from "@/styles/tokens.stylex";
import { overlay } from "@/components/helpers/overlay";
import { useOverlayDensity } from "@/components/helpers/density";

export interface TooltipProps extends Omit<AriaTooltipProps, "className" | "style" | "children"> {
  /** The hint: a few words. */
  readonly children: ReactNode;
}

export function Tooltip({ children, offset = 6, ...props }: TooltipProps) {
  const overlayDensity = useOverlayDensity();
  const isInstant = useOpensWarm(useContext(TooltipTriggerStateContext)?.isOpen ?? false);
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        ...overlayDensity,
        styles.tooltip,
        overlay.transition,
        state.isEntering && overlay.entering,
        state.isExiting && overlay.exiting,
        isInstant && overlay.instant,
      ])}
    >
      {children}
    </AriaTooltip>
  );
}

/** The react-aria default of 1500 ms makes people wait for a hint that they asked for. */
export function TooltipTrigger({ delay = 600, ...props }: TooltipTriggerComponentProps) {
  return <AriaTooltipTrigger delay={delay} {...props} />;
}

// react-aria opens the next tooltip without a delay while a tooltip is open
// and for 500 ms after the last one closes. These counters follow the same
// rule, so that such a tooltip also opens without motion.
const warmPeriod = 500;
let openTooltips = 0;
let isCooling = false;
let cooldown: ReturnType<typeof setTimeout> | undefined;

function useOpensWarm(isOpen: boolean): boolean {
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [isWarm, setIsWarm] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setIsWarm(openTooltips > 0 || isCooling);
  }
  useEffect(() => {
    if (!isOpen) return;
    openTooltips += 1;
    return () => {
      openTooltips -= 1;
      if (openTooltips > 0) return;
      clearTimeout(cooldown);
      isCooling = true;
      cooldown = setTimeout(() => {
        isCooling = false;
      }, warmPeriod);
    };
  }, [isOpen]);
  return isWarm;
}

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
