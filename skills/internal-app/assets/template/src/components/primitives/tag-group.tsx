/**
 * A labeled set of short values, such as labels, recipients, or the chosen options of a field.
 *
 * @layer primitive
 * @keywords tag group, tags, labels, chips, recipients, removable tags, tag list, token list
 * @related Filters, MultiSelect, Checkbox, Badge
 * @notes grouped-values, form-fields, internal-app-forms
 *
 * Use it to show a set of short values and, with `onRemove`, to let people
 * remove some. Do not use it to filter a list: use `Filters`. Do not use it to
 * pick values from a list: use `MultiSelect`, or a `CheckboxGroup` with
 * `appearance="chips"`. For one status, use `Badge`.
 *
 * ## Behavior
 * The group does these things. Do not build them again:
 * - Arrow keys move between the tags.
 * - With `onRemove`, each tag gets a remove button with the name
 *   "Remove <label>", and Backspace and Delete remove the focused tag.
 * - Without tags, the group shows `emptyLabel`.
 *
 * ## Rules
 * - Give each tag one short value. Do not join several facts in one tag.
 *
 * ## Example
 * ```tsx
 * <TagGroup
 *   label="Recipients"
 *   items={recipients.map((person) => ({ id: person.id, label: person.name }))}
 *   onRemove={(ids) => removeRecipients(ids)}
 *   emptyLabel="No recipients"
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { X } from "lucide-react";
import { Button, Tag as AriaTag, TagGroup as AriaTagGroup, TagList } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { field, FieldDescription, FieldLabel } from "@/components/helpers/field";

export interface TagItem<Value extends string> {
  /** Stable id of the value. `onRemove` receives it. */
  readonly id: Value;
  /** Visible text of the tag. */
  readonly label: string;
}

export interface TagGroupProps<Value extends string> {
  /** Visible name of the group, in sentence case. */
  readonly label: string;
  /** Hides the visible label where the context already names the group. Screen readers keep it. */
  readonly hideLabel?: boolean;
  /** The tags, in the order that they show. */
  readonly items: ReadonlyArray<TagItem<Value>>;
  /** Adds a remove button to each tag. Backspace and Delete remove the focused tag. */
  readonly onRemove?: (ids: ReadonlyArray<Value>) => void;
  /** Shown when there are no tags, such as "No labels". */
  readonly emptyLabel?: string;
  /** Hint between the label and the tags. */
  readonly description?: string;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

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
      <FieldLabel isHidden={hideLabel}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
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
