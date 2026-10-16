// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "react-aria-components";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

export interface ItemListProps {
  /** Names the list, such as "Integrations" or "Team members". */
  readonly label: string;
  /** Item elements. */
  readonly children: ReactNode;
  /**
   * `false` drops the border and surface so the rows sit directly in a Card.
   * Keep the default on a page.
   */
  readonly framed?: boolean;
  readonly style?: StyleXStyles;
}

/** Rows of Item divided by lines, such as integrations, members, or files. */
export function ItemList({ label, children, framed = true, style }: ItemListProps) {
  return (
    <div
      role="list"
      aria-label={label}
      {...stylex.props(styles.list, framed && styles.framed, style)}
    >
      {children}
    </div>
  );
}

export interface ItemProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  /** Leading IconTile or Avatar. */
  readonly media?: ReactNode;
  /** Quiet trailing content, such as a Badge, a count, or a date. */
  readonly meta?: ReactNode;
  /** Trailing controls, such as a Switch, a button, or a row menu. */
  readonly actions?: ReactNode;
  /**
   * Opens the item. The title becomes a button for the keyboard, a click
   * anywhere else on the row does the same, and a chevron shows at the end.
   */
  readonly onAction?: () => void;
  /** `sm` for dense lists in a sheet or a popover. */
  readonly size?: "sm" | "md";
}

/**
 * One row of an ItemList: media, a title with a quiet description, trailing
 * meta, and actions. Use DataTable when people compare values across rows.
 */
export function Item({
  title,
  description,
  media,
  meta,
  actions,
  onAction,
  size: sizeKey = "md",
}: ItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // A click on the row outside its controls opens it, like a DataTable row action.
  useEffect(() => {
    const row = rowRef.current;
    if (row === null || onAction === undefined) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("button, a, input, label, [role=switch], [role=menu]") !== null)
        return;
      if (window.getSelection()?.toString() !== "") return;
      onAction();
    };
    row.addEventListener("click", onClick);
    return () => row.removeEventListener("click", onClick);
  }, [onAction]);

  return (
    <div
      ref={rowRef}
      role="listitem"
      {...stylex.props(styles.item, sizes[sizeKey], onAction !== undefined && styles.actionable)}
    >
      {media === undefined ? null : <span {...stylex.props(styles.media)}>{media}</span>}
      <div {...stylex.props(styles.text)}>
        {onAction === undefined ? (
          <span {...stylex.props(styles.title)}>{title}</span>
        ) : (
          <Button onPress={onAction} {...stylex.props(styles.title, styles.titleButton)}>
            {title}
          </Button>
        )}
        {description === undefined ? null : (
          <span {...stylex.props(styles.description)}>{description}</span>
        )}
      </div>
      {meta === undefined ? null : <span {...stylex.props(styles.meta)}>{meta}</span>}
      {actions === undefined ? null : <div {...stylex.props(styles.actions)}>{actions}</div>}
      {onAction === undefined ? null : (
        <ChevronRight aria-hidden {...stylex.props(styles.chevron)} />
      )}
    </div>
  );
}

const styles = stylex.create({
  list: { display: "flex", flexDirection: "column", minWidth: 0 },
  framed: {
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    paddingInline: space.md,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: space.md,
    minWidth: 0,
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
    transitionProperty: "background-color",
    transitionDuration: motion.fast,
  },
  actionable: {
    cursor: "pointer",
    marginInline: `calc(-1 * ${space.sm})`,
    paddingInline: space.sm,
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  media: { display: "inline-flex", flexShrink: 0 },
  text: { display: "flex", flexDirection: "column", gap: "2px", flex: "1", minWidth: 0 },
  title: {
    fontSize: font.md,
    fontWeight: font.medium,
    color: color.text,
    overflowWrap: "anywhere",
  },
  titleButton: {
    alignSelf: "flex-start",
    padding: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    textAlign: "start",
    cursor: "pointer",
    borderRadius: radius.sm,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  description: { fontSize: font.sm, color: color.textMuted, overflowWrap: "anywhere" },
  meta: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    flexShrink: 0,
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  actions: { display: "flex", alignItems: "center", gap: space.xs, flexShrink: 0 },
  chevron: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textFaint },
});

const sizes = stylex.create({
  sm: { minHeight: "2.5rem", paddingBlock: space.xs },
  md: { minHeight: "3.5rem", paddingBlock: space.sm },
});
