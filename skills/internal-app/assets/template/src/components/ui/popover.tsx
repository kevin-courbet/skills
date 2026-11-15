/**
 * A panel that is not modal and that opens next to its trigger, such as a filter panel.
 *
 * @layer primitive
 * @keywords popover, dropdown panel, filter panel, floating panel, quick details, panel next to a button
 * @related Dialog, Menu, HoverCard, Sheet, Filters, Tooltip
 * @notes overlays
 *
 * Use it for a few controls or quick details that belong to one trigger. Do
 * not use it for a list of actions: use `Menu`. Do not use it for a task that
 * must interrupt: use `Dialog`. For detail next to the page, use `Sheet`.
 *
 * ## Behavior
 * - Focus moves into the panel. Escape or a click outside closes it, and the
 *   focus goes back to the trigger.
 * - The panel takes the density of the page and the `md` control size, because
 *   React context passes into portals.
 * - The panel flips to stay on the screen.
 *
 * ## Rules
 * - Wrap the trigger button and the `Popover` in `PopoverTrigger`.
 *
 * ## Example
 * ```tsx
 * <PopoverTrigger>
 *   <Button>Columns</Button>
 *   <Popover title="Columns" showTitle>
 *     <CheckboxGroup label="Visible columns" options={columns} value={visible} onChange={setVisible} />
 *   </Popover>
 * </PopoverTrigger>
 * ```
 */
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
import { ControlSizeProvider } from "./control-size";
import { useOverlayDensity } from "./density";

export { DialogTrigger as PopoverTrigger };

export interface PopoverProps extends Pick<AriaPopoverProps, "placement" | "offset"> {
  /** Accessible name; shown as a heading when visible. */
  readonly title: string;
  /** Shows `title` as a heading in the panel. */
  readonly showTitle?: boolean;
  /** Panel content: a few controls or quick details. */
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
  const overlayDensity = useOverlayDensity();
  return (
    <ControlSizeProvider size="md">
      <AriaPopover
        placement={placement}
        offset={offset}
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          ...overlayDensity,
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
    </ControlSizeProvider>
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
