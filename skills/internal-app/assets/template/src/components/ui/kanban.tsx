// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import { GripVertical, type LucideIcon } from "lucide-react";
import { type ReactNode, useId } from "react";
import {
  Button,
  type DropItem,
  type DropTarget,
  DropIndicator,
  GridList,
  GridListItem,
  isTextDropItem,
  type Key,
  type TextDropItem,
  useDragAndDrop,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { field } from "./field";

export interface KanbanColumn {
  readonly id: string;
  readonly title: string;
  readonly icon?: LucideIcon;
  /** Work-in-progress limit. The count turns to a warning above it. */
  readonly limit?: number;
}

export interface KanbanMove {
  readonly itemId: string;
  readonly fromColumn: string;
  readonly toColumn: string;
  /** Position in the target column after the move. */
  readonly index: number;
}

export interface KanbanProps<Item> {
  /** Names the board, such as "Incident board". */
  readonly label: string;
  readonly columns: ReadonlyArray<KanbanColumn>;
  /** Items per column id, in order. Every column id needs an entry. */
  readonly value: Readonly<Record<string, ReadonlyArray<Item>>>;
  /**
   * Receives the next value and the move. Apply it optimistically, persist the
   * move, and restore the previous value with an error toast if it fails.
   */
  readonly onChange: (value: Record<string, ReadonlyArray<Item>>, move: KanbanMove) => void;
  readonly getItemId: (item: Item) => string;
  /** Plain-text name of the item, for typeahead and drag announcements. */
  readonly getItemLabel: (item: Item) => string;
  /** Card content. Keep it to a title and two or three facts. */
  readonly renderItem: (item: Item) => ReactNode;
  /** Opens an item, such as a peek sheet. Enter and a click on the card call it. */
  readonly onItemAction?: (item: Item) => void;
  /** Header content at the end of a column, such as an add button. */
  readonly columnActions?: (column: KanbanColumn) => ReactNode;
  /** Text in a column without items. */
  readonly emptyLabel?: string;
}

/**
 * Columns of cards that people move between stages, such as incidents or
 * requests. Drag a card by the pointer, or focus its grip and press Enter,
 * move with Tab or the arrow keys, and press Enter to drop. Columns scroll
 * sideways on narrow screens.
 */
export function Kanban<Item extends object>({
  label,
  columns,
  value,
  onChange,
  getItemId,
  getItemLabel,
  renderItem,
  onItemAction,
  columnActions,
  emptyLabel = "No items",
}: KanbanProps<Item>) {
  const dragType = `application/x-kanban-${useId()}`;

  const columnOf = (itemId: string): string => {
    for (const column of columns) {
      if ((value[column.id] ?? []).some((item) => getItemId(item) === itemId)) return column.id;
    }
    throw new Error(`Kanban: item ${itemId} is in no column.`);
  };

  const move = (ids: ReadonlyArray<string>, toColumn: string, target: DropTarget | "end") => {
    const first = ids[0];
    if (first === undefined) return;
    const fromColumn = columnOf(first);
    const moving = new Set(ids);
    const picked: Array<Item> = [];
    const next: Record<string, Array<Item>> = {};
    for (const column of columns) {
      next[column.id] = (value[column.id] ?? []).filter((item) => {
        if (!moving.has(getItemId(item))) return true;
        picked.push(item);
        return false;
      });
    }
    const destination = next[toColumn];
    if (destination === undefined) throw new Error(`Kanban: no column ${toColumn}.`);
    let index = destination.length;
    if (target !== "end" && target.type === "item") {
      const at = destination.findIndex((item) => getItemId(item) === String(target.key));
      if (at !== -1) index = target.dropPosition === "after" ? at + 1 : at;
    }
    destination.splice(index, 0, ...picked);
    onChange(next, { itemId: first, fromColumn, toColumn, index });
  };

  return (
    <div role="group" aria-label={label} {...stylex.props(styles.board)}>
      {columns.map((column) => (
        <KanbanLane
          key={column.id}
          column={column}
          items={value[column.id] ?? []}
          dragType={dragType}
          move={move}
          getItemId={getItemId}
          getItemLabel={getItemLabel}
          renderItem={renderItem}
          onItemAction={onItemAction}
          actions={columnActions?.(column)}
          emptyLabel={emptyLabel}
        />
      ))}
    </div>
  );
}

interface KanbanLaneProps<Item> {
  readonly column: KanbanColumn;
  readonly items: ReadonlyArray<Item>;
  readonly dragType: string;
  readonly move: (ids: ReadonlyArray<string>, toColumn: string, target: DropTarget | "end") => void;
  readonly getItemId: (item: Item) => string;
  readonly getItemLabel: (item: Item) => string;
  readonly renderItem: (item: Item) => ReactNode;
  readonly onItemAction: ((item: Item) => void) | undefined;
  readonly actions: ReactNode;
  readonly emptyLabel: string;
}

function KanbanLane<Item extends object>({
  column,
  items,
  dragType,
  move,
  getItemId,
  getItemLabel,
  renderItem,
  onItemAction,
  actions,
  emptyLabel,
}: KanbanLaneProps<Item>) {
  const headingId = useId();
  const readIds = (dropped: ReadonlyArray<DropItem>) =>
    Promise.all(
      dropped
        .filter((item): item is TextDropItem => isTextDropItem(item))
        .map((item) => item.getText(dragType)),
    );
  const { dragAndDropHooks } = useDragAndDrop<Item>({
    getItems: (keys) =>
      [...keys].map((key) => {
        const item = items.find((candidate) => getItemId(candidate) === String(key));
        return {
          [dragType]: String(key),
          "text/plain": item === undefined ? String(key) : getItemLabel(item),
        };
      }),
    acceptedDragTypes: [dragType],
    getDropOperation: () => "move",
    onReorder: (event) => move([...event.keys].map(String), column.id, event.target),
    onInsert: async (event) => move(await readIds(event.items), column.id, event.target),
    onRootDrop: async (event) => move(await readIds(event.items), column.id, "end"),
    renderDropIndicator: (target) => (
      <DropIndicator
        target={target}
        {...renderStyles<{ isDropTarget: boolean }>((state) => [
          styles.indicator,
          state.isDropTarget && styles.indicatorActive,
        ])}
      />
    ),
  });
  const Icon = column.icon;
  const isOverLimit = column.limit !== undefined && items.length > column.limit;

  return (
    <section aria-labelledby={headingId} {...stylex.props(styles.lane)}>
      <header {...stylex.props(styles.laneHeader)}>
        {Icon === undefined ? null : <Icon aria-hidden {...stylex.props(styles.laneIcon)} />}
        <h3 id={headingId} {...stylex.props(styles.laneTitle)}>
          {column.title}
        </h3>
        <span {...stylex.props(styles.count, isOverLimit && styles.countOver)}>
          {column.limit === undefined ? items.length : `${items.length} / ${column.limit}`}
          {isOverLimit ? <span {...stylex.props(field.hiddenLabel)}>, over the limit</span> : null}
        </span>
        {actions === undefined ? null : <div {...stylex.props(styles.laneActions)}>{actions}</div>}
      </header>
      <GridList
        aria-label={column.title}
        items={items}
        dependencies={[renderItem, getItemLabel, onItemAction]}
        dragAndDropHooks={dragAndDropHooks}
        onAction={
          onItemAction === undefined
            ? undefined
            : (key: Key) => {
                const item = items.find((candidate) => getItemId(candidate) === String(key));
                if (item !== undefined) onItemAction(item);
              }
        }
        renderEmptyState={() => <p {...stylex.props(styles.empty)}>{emptyLabel}</p>}
        {...renderStyles<{ isDropTarget: boolean; isEmpty: boolean }>((state) => [
          styles.list,
          state.isDropTarget && styles.listDropTarget,
        ])}
      >
        {(item) => (
          <GridListItem
            id={getItemId(item)}
            textValue={getItemLabel(item)}
            {...renderStyles<{
              isFocusVisible: boolean;
              isDragging?: boolean;
            }>((state) => [
              styles.card,
              onItemAction !== undefined && styles.cardActionable,
              state.isFocusVisible && styles.cardFocused,
              state.isDragging && styles.cardDragging,
            ])}
          >
            <div {...stylex.props(styles.cardBody)}>{renderItem(item)}</div>
            <Button
              slot="drag"
              aria-label={`Move ${getItemLabel(item)}`}
              {...stylex.props(styles.grip)}
            >
              <GripVertical aria-hidden {...stylex.props(styles.gripIcon)} />
            </Button>
          </GridListItem>
        )}
      </GridList>
    </section>
  );
}

const styles = stylex.create({
  board: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: { default: "minmax(16rem, 85%)", [media.md]: "minmax(16rem, 1fr)" },
    gap: space.md,
    overflowX: "auto",
    scrollSnapType: { default: "x mandatory", [media.md]: "none" },
    paddingBottom: space.xs,
  },
  lane: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    padding: space.sm,
    gap: space.sm,
    backgroundColor: color.subtle,
    borderRadius: radius.xl,
    scrollSnapAlign: "start",
  },
  laneHeader: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: size.controlSm,
    paddingInline: space.xs,
  },
  laneIcon: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
  laneTitle: { margin: 0, fontSize: font.md, fontWeight: font.semibold, color: color.text },
  count: {
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  countOver: { color: color.warning, fontWeight: font.medium },
  laneActions: { display: "flex", alignItems: "center", gap: space.xs, marginInlineStart: "auto" },
  list: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minHeight: "6rem",
    padding: "2px",
    borderRadius: radius.lg,
    outlineStyle: "none",
    transitionProperty: "background-color, box-shadow",
    transitionDuration: motion.fast,
  },
  listDropTarget: {
    backgroundColor: color.accentMuted,
    boxShadow: `inset 0 0 0 1px ${color.accentBorder}`,
  },
  empty: {
    margin: 0,
    paddingBlock: space.xl,
    textAlign: "center",
    fontSize: font.sm,
    color: color.textMuted,
  },
  indicator: {
    height: "2px",
    marginTop: "-2px",
    transform: `translateY(calc(-1 * ${space.xs} + 1px))`,
    borderRadius: radius.full,
    outlineStyle: "none",
  },
  indicatorActive: { backgroundColor: color.accent },
  card: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    gap: space.xs,
    marginBottom: space.sm,
    paddingBlock: space.md,
    paddingInlineStart: space.md,
    paddingInlineEnd: space.xs,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: { default: color.border, ":hover": color.borderStrong },
    borderRadius: radius.lg,
    boxShadow: shadow.sm,
    cursor: "grab",
    outlineStyle: "none",
    transitionProperty: "border-color, opacity",
    transitionDuration: motion.fast,
  },
  cardActionable: { cursor: "pointer" },
  cardFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  cardDragging: { opacity: "0.45" },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    flex: "1",
    minWidth: 0,
    fontSize: font.md,
    color: color.text,
  },
  grip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0,
    marginTop: "-0.25rem",
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
  gripIcon: { width: size.iconSm, height: size.iconSm },
});
