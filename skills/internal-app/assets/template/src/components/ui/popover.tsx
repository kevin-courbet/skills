import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { font, space } from "@/styles/tokens.stylex";
import { overlay } from "./overlay";

export { DialogTrigger as PopoverTrigger };

export interface PopoverProps extends Pick<AriaPopoverProps, "placement" | "offset"> {
  /** Accessible name; shown as a heading when visible. */
  readonly title: string;
  readonly showTitle?: boolean;
  readonly children: ReactNode;
}

/**
 * Non-modal panel anchored to a trigger, for filters and quick details.
 * Wrap the trigger button and this popover in PopoverTrigger.
 */
export function Popover({
  title,
  showTitle = false,
  placement = "bottom start",
  offset = 6,
  children,
}: PopoverProps) {
  return (
    <AriaPopover
      placement={placement}
      offset={offset}
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        overlay.popover,
        styles.popover,
        state.isEntering && overlay.entering,
        state.isExiting && overlay.exiting,
      ])}
    >
      <Dialog aria-label={showTitle ? undefined : title} {...stylex.props(styles.dialog)}>
        {showTitle ? (
          <Heading slot="title" {...stylex.props(styles.title)}>
            {title}
          </Heading>
        ) : null}
        {children}
      </Dialog>
    </AriaPopover>
  );
}

const styles = stylex.create({
  popover: { minWidth: "14rem", maxWidth: "24rem" },
  dialog: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    padding: space.md,
    outlineStyle: "none",
  },
  title: { fontSize: font.md, fontWeight: font.semibold, margin: 0 },
});
