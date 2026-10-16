import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { X } from "lucide-react";
import {
  Button,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { field } from "./field";

export interface TagItem<Value extends string> {
  readonly id: Value;
  readonly label: string;
}

export interface TagGroupProps<Value extends string> {
  readonly label: string;
  readonly hideLabel?: boolean;
  readonly items: ReadonlyArray<TagItem<Value>>;
  /** Adds a remove button to each tag. Backspace and Delete remove the focused tag. */
  readonly onRemove?: (ids: ReadonlyArray<Value>) => void;
  /** Shown when there are no tags, such as "No labels". */
  readonly emptyLabel?: string;
  readonly description?: string;
  readonly style?: StyleXStyles;
}

/**
 * A labeled set of short values, such as labels, recipients, or chosen
 * options. Arrow keys move between tags. For list filters, use Filters.
 */
export function TagGroup<Value extends string>({
  label,
  hideLabel = false,
  items,
  onRemove,
  emptyLabel,
  description,
  style,
}: TagGroupProps<Value>) {
  return (
    <AriaTagGroup
      onRemove={
        onRemove === undefined
          ? undefined
          : (keys) => onRemove(items.filter((item) => keys.has(item.id)).map((item) => item.id))
      }
      {...stylex.props(field.root, style)}
    >
      <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
      <TagList
        items={items}
        renderEmptyState={() => <span {...stylex.props(styles.empty)}>{emptyLabel}</span>}
        {...stylex.props(styles.list)}
      >
        {(item) => (
          <AriaTag
            id={item.id}
            textValue={item.label}
            {...renderStyles<{ isFocusVisible: boolean; isDisabled: boolean }>((state) => [
              styles.tag,
              onRemove === undefined && styles.tagStatic,
              state.isFocusVisible && styles.tagFocused,
              state.isDisabled && styles.disabled,
            ])}
          >
            {({ allowsRemoving }) => (
              <>
                {item.label}
                {allowsRemoving ? (
                  <Button
                    slot="remove"
                    aria-label={`Remove ${item.label}`}
                    {...stylex.props(styles.remove)}
                  >
                    <X aria-hidden {...stylex.props(styles.removeIcon)} />
                  </Button>
                ) : null}
              </>
            )}
          </AriaTag>
        )}
      </TagList>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
    </AriaTagGroup>
  );
}

const styles = stylex.create({
  list: { display: "flex", flexWrap: "wrap", gap: space.xs, outlineStyle: "none" },
  empty: { fontSize: font.md, color: color.textFaint },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    height: "1.5rem",
    paddingInlineStart: space.sm,
    paddingInlineEnd: "2px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.subtle,
    color: color.text,
    fontSize: font.sm,
    fontWeight: font.medium,
    whiteSpace: "nowrap",
    cursor: "default",
    outlineStyle: "none",
  },
  tagStatic: { paddingInlineEnd: space.sm },
  tagFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  disabled: { opacity: "0.5" },
  remove: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.25rem",
    height: "1.25rem",
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.inset },
    color: { default: color.textMuted, ":hover": color.text },
    cursor: "pointer",
    outlineStyle: "none",
  },
  removeIcon: { width: size.iconSm, height: size.iconSm },
});
