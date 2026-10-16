// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import {
  Button,
  DropIndicator,
  GridList,
  GridListItem,
  type Key,
  useDragAndDrop,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, shadow, size, space } from "@/styles/tokens.stylex";

export interface SortableMove {
  readonly itemId: string;
  readonly fromIndex: number;
  readonly toIndex: number;
}

export interface SortableListProps<Item> {
  /** Names the list, such as "Escalation order". */
  readonly label: string;
  readonly items: ReadonlyArray<Item>;
  /**
   * Receives the items in their new order and the move. Apply it
   * optimistically, persist it, and restore the previous order with an error
   * toast if it fails.
   */
  readonly onReorder: (items: ReadonlyArray<Item>, move: SortableMove) => void;
  readonly getItemId: (item: Item) => string;
  /** Plain-text name, for typeahead and drag announcements. */
  readonly getItemLabel: (item: Item) => string;
  readonly renderItem: (item: Item) => ReactNode;
  /** Trailing controls of a row, such as a remove button. */
  readonly itemActions?: (item: Item) => ReactNode;
  /** Opens an item. Enter and a click on the row call it. */
  readonly onItemAction?: (item: Item) => void;
  /** `list` stacks rows; `grid` wraps tiles, such as dashboard widgets. */
  readonly layout?: "list" | "grid";
  /** Shows the 1-based position before each row, for priority orders. */
  readonly showPosition?: boolean;
  /**
   * `false` drops the border and surface so the list sits directly in a Card
   * or a CardSection. Keep the default on a page.
   */
  readonly framed?: boolean;
  readonly emptyState?: ReactNode;
  readonly style?: StyleXStyles;
}

/**
 * A list people put in order, such as an escalation chain, column order, or
 * dashboard widgets. Drag a row by the pointer, or focus its grip, press
 * Enter, move with the arrow keys, and press Enter to drop. Escape cancels.
 */
export function SortableList<Item extends object>({
  label,
  items,
  onReorder,
  getItemId,
  getItemLabel,
  renderItem,
  itemActions,
  onItemAction,
  layout = "list",
  showPosition = false,
  framed = true,
  emptyState,
  style,
}: SortableListProps<Item>) {
  const isGrid = layout === "grid";
  const { dragAndDropHooks } = useDragAndDrop<Item>({
    getItems: (keys) =>
      [...keys].map((key) => {
        const item = items.find((candidate) => getItemId(candidate) === String(key));
        return { "text/plain": item === undefined ? String(key) : getItemLabel(item) };
      }),
    onReorder: (event) => {
      if (event.target.type !== "item") return;
      const moving = new Set([...event.keys].map(String));
      const picked = items.filter((item) => moving.has(getItemId(item)));
      const moved = picked[0];
      if (moved === undefined) return;
      const rest = items.filter((item) => !moving.has(getItemId(item)));
      const at = rest.findIndex((item) => getItemId(item) === String(event.target.key));
      const index = event.target.dropPosition === "after" ? at + 1 : at;
      const next = [...rest.slice(0, index), ...picked, ...rest.slice(index)];
      onReorder(next, {
        itemId: getItemId(moved),
        fromIndex: items.indexOf(moved),
        toIndex: next.indexOf(moved),
      });
    },
    renderDropIndicator: (target) => (
      <DropIndicator
        target={target}
        {...renderStyles<{ isDropTarget: boolean }>((state) => [
          isGrid ? styles.gridIndicator : styles.indicator,
          state.isDropTarget && styles.indicatorActive,
        ])}
      />
    ),
  });

  return (
    <GridList
      aria-label={label}
      items={items}
      layout={isGrid ? "grid" : "stack"}
      dependencies={[renderItem, itemActions, onItemAction, showPosition]}
      dragAndDropHooks={dragAndDropHooks}
      onAction={
        onItemAction === undefined
          ? undefined
          : (key: Key) => {
              const item = items.find((candidate) => getItemId(candidate) === String(key));
              if (item !== undefined) onItemAction(item);
            }
      }
      renderEmptyState={() => emptyState}
      {...renderStyles<{ isEmpty: boolean }>(() => [
        isGrid ? styles.grid : styles.list,
        !isGrid && framed && styles.framed,
        style,
      ])}
    >
      {(item) => (
        <GridListItem
          id={getItemId(item)}
          textValue={getItemLabel(item)}
          {...renderStyles<{ isFocusVisible: boolean; isDragging?: boolean; isHovered: boolean }>(
            (state) => [
              isGrid ? styles.tile : styles.row,
              !isGrid && styles.rowDivided,
              onItemAction !== undefined && styles.actionable,
              state.isFocusVisible && styles.focused,
              state.isDragging === true && styles.dragging,
            ],
          )}
        >
          <Button
            slot="drag"
            aria-label={`Move ${getItemLabel(item)}`}
            {...stylex.props(styles.grip, isGrid && styles.gripTile)}
          >
            <GripVertical aria-hidden {...stylex.props(styles.gripIcon)} />
          </Button>
          {showPosition ? (
            <span aria-hidden {...stylex.props(styles.position)}>
              {items.indexOf(item) + 1}
            </span>
          ) : null}
          <div {...stylex.props(styles.content)}>{renderItem(item)}</div>
          {itemActions === undefined ? null : (
            <div {...stylex.props(styles.actions)}>{itemActions(item)}</div>
          )}
        </GridListItem>
      )}
    </GridList>
  );
}

/** Half the space between grid tiles: each tile has this margin on every side. */
const tileGap = "0.375rem";

const styles = stylex.create({
  list: { display: "flex", flexDirection: "column", minWidth: 0, outlineStyle: "none" },
  framed: {
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  // Flex wrap, not CSS grid: a drop indicator between tiles must not take a grid cell.
  grid: {
    display: "flex",
    flexWrap: "wrap",
    marginInline: `calc(-1 * ${tileGap})`,
    marginBlock: `calc(-1 * ${tileGap})`,
    outlineStyle: "none",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: "2.75rem",
    paddingBlock: space.sm,
    paddingInlineStart: space.xs,
    paddingInlineEnd: space.md,
    backgroundColor: color.raised,
    borderRadius: radius.md,
    fontSize: font.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
    transitionProperty: "opacity, background-color",
    transitionDuration: motion.fast,
  },
  rowDivided: {
    borderRadius: 0,
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  tile: {
    position: "relative",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: {
      default: `calc(100% - 2 * ${tileGap})`,
      [media.sm]: `calc(50% - 2 * ${tileGap})`,
      [media.lg]: `calc(100% / 3 - 2 * ${tileGap})`,
      [media.xl]: `calc(25% - 2 * ${tileGap})`,
    },
    margin: tileGap,
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    minHeight: "5rem",
    padding: space.md,
    paddingInlineStart: space.xs,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: { default: color.border, ":hover": color.borderStrong },
    borderRadius: radius.lg,
    boxShadow: shadow.sm,
    fontSize: font.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
  },
  actionable: { cursor: "pointer" },
  focused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  dragging: { opacity: "0.45" },
  grip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.75rem",
    flexShrink: 0,
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: { default: color.textFaint, ":hover": color.textMuted },
    cursor: "grab",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  gripTile: { marginTop: "-0.25rem" },
  gripIcon: { width: size.icon, height: size.icon },
  position: {
    minWidth: "1.25rem",
    flexShrink: 0,
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.textMuted,
    textAlign: "end",
    fontVariantNumeric: "tabular-nums",
  },
  content: { display: "flex", flexDirection: "column", gap: "2px", flex: "1", minWidth: 0 },
  actions: { display: "flex", alignItems: "center", gap: space.xs, flexShrink: 0 },
  indicator: {
    height: "2px",
    marginBlock: "-1px",
    position: "relative",
    zIndex: 1,
    outlineStyle: "none",
  },
  gridIndicator: {
    width: "2px",
    marginInline: "-1px",
    marginBlock: tileGap,
    borderRadius: radius.full,
    outlineStyle: "none",
  },
  indicatorActive: { backgroundColor: color.accent },
});
