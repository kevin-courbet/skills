import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  MenuTrigger,
  Popover,
  Separator,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { overlay } from "./overlay";

export { MenuTrigger };

export interface MenuProps<Item extends object> extends Omit<
  AriaMenuProps<Item>,
  "className" | "style"
> {
  readonly placement?: "bottom start" | "bottom end" | "top start" | "top end";
}

/** Wrap the trigger button and this menu in MenuTrigger. */
export function Menu<Item extends object>({ placement = "bottom end", ...props }: MenuProps<Item>) {
  return (
    <Popover
      placement={placement}
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        overlay.popover,
        styles.popover,
        state.isEntering && overlay.entering,
        state.isExiting && overlay.exiting,
      ])}
    >
      <AriaMenu {...props} {...stylex.props(styles.menu)} />
    </Popover>
  );
}

export interface MenuItemProps extends Omit<AriaMenuItemProps, "className" | "style" | "children"> {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly shortcut?: string;
  /** Visual warning for an irreversible step. Pair it with a confirmation. */
  readonly isDestructive?: boolean;
}

export function MenuItem({
  children,
  icon,
  shortcut,
  isDestructive = false,
  ...props
}: MenuItemProps) {
  return (
    <AriaMenuItem
      {...props}
      {...renderStyles<{ isFocused: boolean; isDisabled: boolean }>((state) => [
        styles.item,
        state.isFocused && styles.itemFocused,
        isDestructive && styles.itemDestructive,
        state.isDisabled && styles.itemDisabled,
      ])}
    >
      {icon ? <span {...stylex.props(styles.icon)}>{icon}</span> : null}
      <span {...stylex.props(styles.label)}>{children}</span>
      {shortcut ? <kbd {...stylex.props(styles.shortcut)}>{shortcut}</kbd> : null}
    </AriaMenuItem>
  );
}

export function MenuSeparator() {
  return <Separator {...stylex.props(styles.separator)} />;
}

const styles = stylex.create({
  popover: { minWidth: "11rem" },
  menu: { outline: "none", padding: space.xs, maxHeight: "20rem", overflow: "auto" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    paddingBlock: "0.375rem",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    fontSize: font.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
  },
  itemFocused: { backgroundColor: color.subtle },
  itemDestructive: { color: color.danger },
  itemDisabled: { opacity: "0.5" },
  icon: {
    display: "inline-flex",
    width: "1rem",
    height: "1rem",
    color: color.textMuted,
    flexShrink: 0,
  },
  label: { flex: "1", minWidth: 0 },
  shortcut: { fontFamily: font.mono, fontSize: font.xs, color: color.textFaint },
  separator: {
    height: "1px",
    marginBlock: space.xs,
    backgroundColor: color.borderSubtle,
    borderStyle: "none",
  },
});
