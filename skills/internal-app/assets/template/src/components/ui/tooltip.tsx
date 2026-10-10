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

export interface TooltipProps extends Omit<AriaTooltipProps, "className" | "style" | "children"> {
  readonly children: ReactNode;
}

/** Wrap a focusable trigger and this tooltip in TooltipTrigger. Never put required information only here. */
export function Tooltip({ children, offset = 6, ...props }: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
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
