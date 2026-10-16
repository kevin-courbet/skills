// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import { Check } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
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
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
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

/** In a menu with a `selectionMode`, each item shows a check mark when selected. */
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
      textValue={props.textValue ?? (typeof children === "string" ? children : undefined)}
      {...renderStyles<{ isFocused: boolean; isDisabled: boolean }>((state) => [
        styles.item,
        state.isFocused && styles.itemFocused,
        isDestructive && styles.itemDestructive,
        state.isDisabled && styles.itemDisabled,
      ])}
    >
      {({ selectionMode, isSelected }) => (
        <>
          {selectionMode === "none" ? null : (
            <Check aria-hidden {...stylex.props(styles.check, !isSelected && styles.unchecked)} />
          )}
          {icon ? <span {...stylex.props(styles.icon)}>{icon}</span> : null}
          <span {...stylex.props(styles.label)}>{children}</span>
          {shortcut ? <kbd {...stylex.props(styles.shortcut)}>{shortcut}</kbd> : null}
        </>
      )}
    </AriaMenuItem>
  );
}

export interface ContextMenuProps<Item extends object> extends Omit<
  AriaMenuProps<Item>,
  "className" | "style" | "children" | "autoFocus" | "items"
> {
  /** Names the menu, such as "Job actions". */
  readonly label: string;
  /** The area that opens the menu, such as a table row, a card, or a tree. */
  readonly children: ReactNode;
  /** MenuItem and MenuSeparator elements. */
  readonly menu: ReactNode;
}

/**
 * Actions on an area that open at the pointer on a right click, or at the
 * focused element with Shift+F10 or the context menu key. Every action must
 * also be reachable without it, such as from a row menu button.
 */
export function ContextMenu<Item extends object>({
  label,
  children,
  menu,
  onAction,
  ...props
}: ContextMenuProps<Item>) {
  const [point, setPoint] = useState<{ readonly x: number; readonly y: number } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  // Native listeners: the area is any content, not a control of its own.
  useEffect(() => {
    const area = areaRef.current;
    if (area === null) return;
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      setPoint({ x: event.clientX, y: event.clientY });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
      if (!(event.target instanceof Element)) return;
      event.preventDefault();
      const box = event.target.getBoundingClientRect();
      setPoint({ x: box.left + 4, y: box.bottom });
    };
    area.addEventListener("contextmenu", onContextMenu);
    area.addEventListener("keydown", onKeyDown);
    return () => {
      area.removeEventListener("contextmenu", onContextMenu);
      area.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={areaRef} {...stylex.props(styles.contextArea)}>
      {children}
      <span
        ref={anchorRef}
        aria-hidden
        {...stylex.props(styles.anchor, point !== null && styles.anchorAt(point.x, point.y))}
      />
      <Popover
        triggerRef={anchorRef}
        isOpen={point !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPoint(null);
        }}
        placement="bottom start"
        offset={2}
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          overlay.popover,
          styles.popover,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
        <AriaMenu<Item>
          {...props}
          aria-label={label}
          autoFocus="first"
          onAction={(key, value) => {
            setPoint(null);
            onAction?.(key, value);
          }}
          {...stylex.props(styles.menu)}
        >
          {menu}
        </AriaMenu>
      </Popover>
    </div>
  );
}

export function MenuSeparator() {
  return <Separator {...stylex.props(styles.separator)} />;
}

const styles = stylex.create({
  popover: { minWidth: "11rem" },
  // The area keeps the layout of its content; it only listens for the context menu.
  contextArea: { display: "contents" },
  anchor: { position: "fixed", top: 0, left: 0, width: 0, height: 0, pointerEvents: "none" },
  anchorAt: (x: number, y: number) => ({ left: `${x}px`, top: `${y}px` }),
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
  check: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.accentText },
  unchecked: { visibility: "hidden" },
  label: { flex: "1", minWidth: 0 },
  shortcut: { fontFamily: font.mono, fontSize: font.xs, color: color.textFaint },
  separator: {
    height: "1px",
    marginBlock: space.xs,
    backgroundColor: color.borderSubtle,
    borderStyle: "none",
  },
});
