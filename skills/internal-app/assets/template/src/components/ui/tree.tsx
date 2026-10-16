// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import {
  Tree as AriaTree,
  Button,
  Collection,
  DropIndicator,
  type Key,
  type Selection,
  TreeItem,
  TreeItemContent,
  useDragAndDrop,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";
import { Checkbox } from "./checkbox";

export interface TreeNode {
  readonly id: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  /** Icon of an open branch, such as FolderOpen next to Folder. */
  readonly openIcon?: LucideIcon;
  /** Quiet text after the label, such as a role or a path. */
  readonly description?: string;
  /** Trailing content, such as a count or a Badge. */
  readonly meta?: ReactNode;
  readonly isDisabled?: boolean;
  readonly children?: ReadonlyArray<TreeNode>;
}

export type TreeSelection =
  | {
      /** One selected node, such as the open folder of a file browser. */
      readonly mode: "single";
      readonly value: string | null;
      readonly onChange: (id: string | null) => void;
    }
  | {
      /**
       * Checkboxes, such as permissions. `value` holds leaf ids only. A branch
       * checkbox selects or clears every leaf under it and shows a dash when
       * only some are selected.
       */
      readonly mode: "checkbox";
      readonly value: ReadonlyArray<string>;
      readonly onChange: (ids: ReadonlyArray<string>) => void;
    };

export interface TreeMove {
  readonly ids: ReadonlyArray<string>;
  readonly targetId: string;
  /** `inside` appends the nodes to the children of the target. */
  readonly position: "before" | "after" | "inside";
}

export interface TreeProps {
  /** Names the tree, such as "Files" or "Permissions". */
  readonly label: string;
  readonly nodes: ReadonlyArray<TreeNode>;
  readonly selection?: TreeSelection;
  /** Opens a node, such as a file. Enter and a double click call it. */
  readonly onAction?: (id: string) => void;
  readonly expandedIds?: ReadonlyArray<string>;
  readonly defaultExpandedIds?: ReadonlyArray<string>;
  readonly onExpandedChange?: (ids: ReadonlyArray<string>) => void;
  /**
   * Enables drag and drop to reorder and nest nodes. Apply the move with
   * `moveTreeNodes`, then persist it.
   */
  readonly onMove?: (move: TreeMove) => void;
  /** Vertical lines that connect each level. On by default. */
  readonly guides?: boolean;
  /** Shown when `nodes` is empty. */
  readonly emptyState?: ReactNode;
  readonly style?: StyleXStyles;
}

/**
 * Hierarchy of records, such as folders, an org chart, categories, or
 * permissions. Arrow keys move between rows, Right and Left open and close a
 * branch, and Space selects. Branch checkboxes cascade to their leaves.
 */
export function Tree({
  label,
  nodes,
  selection,
  onAction,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  onMove,
  guides = true,
  emptyState,
  style,
}: TreeProps) {
  const dragged = useRef<ReadonlySet<string>>(new Set());
  const { dragAndDropHooks } = useDragAndDrop<TreeNode>({
    isDisabled: onMove === undefined,
    getItems: (keys) => [...keys].map((key) => ({ "text/plain": labelOf(nodes, String(key)) })),
    onDragStart: (event) => {
      dragged.current = new Set([...event.keys].map(String));
    },
    getDropOperation: (target) =>
      target.type === "item" && isInside(nodes, dragged.current, String(target.key))
        ? "cancel"
        : "move",
    onMove: (event) => {
      if (event.target.type !== "item") return;
      onMove?.({
        ids: [...event.keys].map(String),
        targetId: String(event.target.key),
        position: event.target.dropPosition === "on" ? "inside" : event.target.dropPosition,
      });
    },
    renderDropIndicator: (target) => (
      <DropIndicator
        target={target}
        {...renderStyles<{ isDropTarget: boolean }>((state) => [
          styles.dropLine,
          state.isDropTarget && styles.dropLineActive,
        ])}
      />
    ),
  });

  const checkbox = selection?.mode === "checkbox" ? selection : undefined;
  const checked = new Set(checkbox?.value ?? []);
  const selectedKeys: Iterable<Key> = (() => {
    if (selection === undefined) return [];
    if (selection.mode === "single") return selection.value === null ? [] : [selection.value];
    return [
      ...checked,
      ...allNodes(nodes)
        .filter((node) => branchState(node, checked) === "all")
        .map((node) => node.id),
    ];
  })();

  const onSelectionChange = (keys: Selection) => {
    if (selection === undefined) return;
    if (selection.mode === "single") {
      const next = keys === "all" ? undefined : keys.values().next().value;
      selection.onChange(next === undefined ? null : String(next));
      return;
    }
    const previous = new Set([...selectedKeys].map(String));
    const now = new Set(
      keys === "all" ? allNodes(nodes).map((node) => node.id) : [...keys].map(String),
    );
    const next = new Set(checked);
    for (const node of allNodes(nodes)) {
      const wasOn = previous.has(node.id);
      const isOn = now.has(node.id);
      if (wasOn === isOn) continue;
      for (const leaf of leaves(node)) {
        if (isOn) next.add(leaf.id);
        else next.delete(leaf.id);
      }
    }
    selection.onChange(
      allNodes(nodes)
        .filter((node) => next.has(node.id))
        .map((node) => node.id),
    );
  };

  return (
    <AriaTree
      aria-label={label}
      items={nodes}
      dependencies={[checkbox?.value, selection?.mode, guides]}
      selectionMode={selectionModes[selection?.mode ?? "none"]}
      selectionBehavior={selection?.mode === "checkbox" ? "toggle" : "replace"}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      onAction={onAction === undefined ? undefined : (key) => onAction(String(key))}
      expandedKeys={expandedIds}
      defaultExpandedKeys={defaultExpandedIds}
      onExpandedChange={
        onExpandedChange === undefined
          ? undefined
          : (keys) => onExpandedChange([...keys].map(String))
      }
      disabledKeys={allNodes(nodes)
        .filter((node) => node.isDisabled === true)
        .map((node) => node.id)}
      dragAndDropHooks={onMove === undefined ? undefined : dragAndDropHooks}
      renderEmptyState={() => emptyState}
      {...renderStyles<{ isDropTarget: boolean }>((state) => [
        styles.tree,
        state.isDropTarget && styles.treeDropTarget,
        style,
      ])}
    >
      {function renderNode(node: TreeNode): ReactNode {
        return (
          <TreeItem
            id={node.id}
            textValue={node.label}
            {...renderStyles<{
              isSelected: boolean;
              isFocusVisible: boolean;
              isDisabled: boolean;
              isDragging?: boolean;
              isDropTarget?: boolean;
            }>((state) => [
              styles.row,
              selection?.mode === "single" && state.isSelected && styles.rowSelected,
              state.isFocusVisible && styles.rowFocused,
              state.isDisabled && styles.rowDisabled,
              state.isDragging === true && styles.rowDragging,
              state.isDropTarget === true && styles.rowDropTarget,
            ])}
          >
            <TreeItemContent>
              {({ level, hasChildItems, isExpanded, isDisabled }) => {
                const Icon = isExpanded && node.openIcon !== undefined ? node.openIcon : node.icon;
                const state = checkbox === undefined ? undefined : branchState(node, checked);
                return (
                  <div {...stylex.props(styles.rowContent)}>
                    {Array.from({ length: level - 1 }, (_, index) => (
                      <span key={index} aria-hidden {...stylex.props(styles.indent)}>
                        {guides ? <span {...stylex.props(styles.guide)} /> : null}
                      </span>
                    ))}
                    {hasChildItems ? (
                      <Button slot="chevron" {...stylex.props(styles.chevronButton)}>
                        <ChevronRight
                          aria-hidden
                          {...stylex.props(styles.chevron, isExpanded && styles.chevronOpen)}
                        />
                      </Button>
                    ) : (
                      <span aria-hidden {...stylex.props(styles.chevronSpacer)} />
                    )}
                    {checkbox === undefined ? null : (
                      <Checkbox
                        slot="selection"
                        isIndeterminate={state === "some"}
                        isDisabled={isDisabled}
                      />
                    )}
                    {Icon === undefined ? null : (
                      <Icon aria-hidden {...stylex.props(styles.icon)} />
                    )}
                    <span {...stylex.props(styles.label)}>{node.label}</span>
                    {node.description === undefined ? null : (
                      <span {...stylex.props(styles.description)}>{node.description}</span>
                    )}
                    {node.meta === undefined ? null : (
                      <span {...stylex.props(styles.meta)}>{node.meta}</span>
                    )}
                  </div>
                );
              }}
            </TreeItemContent>
            {node.children === undefined ? null : (
              <Collection
                items={node.children}
                dependencies={[checkbox?.value, selection?.mode, guides]}
              >
                {renderNode}
              </Collection>
            )}
          </TreeItem>
        );
      }}
    </AriaTree>
  );
}

/** Applies a TreeMove to the nodes and returns the new nodes. The input is not changed. */
export function moveTreeNodes(
  nodes: ReadonlyArray<TreeNode>,
  move: TreeMove,
): ReadonlyArray<TreeNode> {
  const ids = new Set(move.ids);
  if (ids.has(move.targetId) || isInside(nodes, ids, move.targetId))
    throw new Error("moveTreeNodes: a node cannot move into itself.");
  const moving = allNodes(nodes).filter(
    (node) => ids.has(node.id) && !isInside(nodes, ids, node.id),
  );
  const remove = (list: ReadonlyArray<TreeNode>): ReadonlyArray<TreeNode> =>
    list
      .filter((node) => !ids.has(node.id))
      .map((node) =>
        node.children === undefined ? node : { ...node, children: remove(node.children) },
      );
  const insert = (list: ReadonlyArray<TreeNode>): ReadonlyArray<TreeNode> =>
    list.flatMap((node) => {
      if (node.id !== move.targetId)
        return [node.children === undefined ? node : { ...node, children: insert(node.children) }];
      if (move.position === "before") return [...moving, node];
      if (move.position === "after") return [node, ...moving];
      return [{ ...node, children: [...(node.children ?? []), ...moving] }];
    });
  return insert(remove(nodes));
}

const selectionModes = { none: "none", single: "single", checkbox: "multiple" } as const;

type BranchState = "none" | "some" | "all";

function branchState(node: TreeNode, checked: ReadonlySet<string>): BranchState {
  const nodeLeaves = leaves(node);
  const count = nodeLeaves.filter((leaf) => checked.has(leaf.id)).length;
  if (count === 0) return "none";
  return count === nodeLeaves.length ? "all" : "some";
}

function leaves(node: TreeNode): ReadonlyArray<TreeNode> {
  if (node.children === undefined || node.children.length === 0)
    return node.isDisabled === true ? [] : [node];
  return node.children.flatMap(leaves);
}

function allNodes(nodes: ReadonlyArray<TreeNode>): ReadonlyArray<TreeNode> {
  return nodes.flatMap((node) => [node, ...allNodes(node.children ?? [])]);
}

function labelOf(nodes: ReadonlyArray<TreeNode>, id: string): string {
  return allNodes(nodes).find((node) => node.id === id)?.label ?? id;
}

/** Whether the node with `id` sits under one of the `ancestors`. */
function isInside(
  nodes: ReadonlyArray<TreeNode>,
  ancestors: ReadonlySet<string>,
  id: string,
): boolean {
  const visit = (list: ReadonlyArray<TreeNode>, underAncestor: boolean): boolean =>
    list.some((node) => {
      if (node.id === id) return underAncestor;
      return visit(node.children ?? [], underAncestor || ancestors.has(node.id));
    });
  return visit(nodes, false);
}

const rowHeight = "1.875rem";

const styles = stylex.create({
  tree: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    outlineStyle: "none",
    borderRadius: radius.md,
  },
  treeDropTarget: { boxShadow: `inset 0 0 0 1px ${color.accentBorder}` },
  row: {
    borderRadius: radius.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    transitionProperty: "background-color",
    transitionDuration: motion.fast,
  },
  rowSelected: {
    backgroundColor: { default: color.selected, ":hover": color.selected },
    fontWeight: font.medium,
  },
  rowFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  rowDisabled: { opacity: "0.5", cursor: "not-allowed" },
  rowDragging: { opacity: "0.45" },
  rowDropTarget: {
    backgroundColor: color.accentMuted,
    boxShadow: `inset 0 0 0 1px ${color.accentBorder}`,
  },
  rowContent: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    height: rowHeight,
    paddingInline: space.xs,
    minWidth: 0,
    fontSize: font.md,
  },
  indent: {
    position: "relative",
    alignSelf: "stretch",
    width: "1.25rem",
    flexShrink: 0,
  },
  guide: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: "1px",
    backgroundColor: color.border,
  },
  chevronButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.25rem",
    height: "1.25rem",
    flexShrink: 0,
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.inset },
    color: color.textMuted,
    cursor: "pointer",
  },
  chevron: {
    width: size.iconSm,
    height: size.iconSm,
    transitionProperty: "transform",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    transitionTimingFunction: motion.ease,
  },
  chevronOpen: { transform: "rotate(90deg)" },
  chevronSpacer: { width: "1.25rem", flexShrink: 0 },
  icon: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
  label: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingInlineStart: "2px",
  },
  description: {
    marginInlineStart: space.xs,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: font.sm,
    fontWeight: font.regular,
    color: color.textMuted,
  },
  meta: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    flexShrink: 0,
    marginInlineStart: "auto",
    paddingInlineStart: space.sm,
    fontSize: font.sm,
    fontWeight: font.regular,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  dropLine: { height: "2px", marginBlock: "-1px", borderRadius: radius.full, outlineStyle: "none" },
  dropLineActive: { backgroundColor: color.accent },
});
