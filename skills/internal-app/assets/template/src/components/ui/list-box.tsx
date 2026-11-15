/**
 * The option list inside the popovers of Select, MultiSelect, ComboBox, and
 * Filters.
 *
 * @layer helper
 * @keywords option list, list box, listbox, options in a popover, option status dot, dropdown options, list option
 * @related Select, MultiSelect, ComboBox, Filters, Item
 * @notes internal-app-adding-a-primitive
 *
 * It is a part of the kit fields. Do not use it on a page: use `Select`,
 * `ComboBox`, `MultiSelect`, or `Filters`. For rows of records, use `ItemList`
 * in `Item`.
 *
 * ## Behavior
 * - An option shows its `description` under the label, and a check mark while
 *   it is selected.
 * - An option with `intent` shows a status dot before the label.
 * - The list scrolls when it is higher than 18rem.
 *
 * ## Rules
 * - Use it in a new kit field that opens a list of options in a popover. Inside
 *   a react-aria `Select` or `ComboBox`, the field owns the selection.
 *   Otherwise, pass the selection props.
 *
 * ## Example
 * ```tsx
 * <Popover {...stylex.props(overlay.popover, overlay.matchTrigger)}>
 *   <OptionList options={options} />
 * </Popover>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { Check } from "lucide-react";
import { ListBox, ListBoxItem, type ListBoxProps } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import type { BadgeIntent } from "./badge";

export interface ListOption<Value extends string> {
  /** Stable id of the option. The field value holds it. */
  readonly id: Value;
  /** Visible text of the option, in sentence case. */
  readonly label: string;
  /** Quiet line under the label. */
  readonly description?: string;
  /** Shows a status dot before the label, for options that are statuses. */
  readonly intent?: BadgeIntent;
}

export type OptionListProps<Value extends string> = Omit<
  ListBoxProps<ListOption<Value>>,
  "items" | "children" | "className" | "style"
> & {
  /** The options, in the order that they show. */
  readonly options: ReadonlyArray<ListOption<Value>>;
};

/**
 * Option list inside a Select, MultiSelect, ComboBox, or Filters popover. The
 * selection props pass through to the react-aria ListBox when the list owns
 * the selection itself.
 */
export function OptionList<Value extends string>({ options, ...props }: OptionListProps<Value>) {
  return (
    <ListBox {...props} items={options} {...stylex.props(styles.list)}>
      {(option) => (
        <ListBoxItem
          id={option.id}
          textValue={option.label}
          {...renderStyles<{ isFocused: boolean; isDisabled: boolean }>((state) => [
            styles.item,
            state.isFocused && styles.itemFocused,
            state.isDisabled && styles.itemDisabled,
          ])}
        >
          {({ isSelected }) => (
            <>
              {option.intent === undefined ? null : (
                <span aria-hidden {...stylex.props(styles.dot, dots[option.intent])} />
              )}
              <span {...stylex.props(styles.label)}>
                {option.label}
                {option.description ? (
                  <span {...stylex.props(styles.description)}>{option.description}</span>
                ) : null}
              </span>
              <Check aria-hidden {...stylex.props(styles.check, !isSelected && styles.hidden)} />
            </>
          )}
        </ListBoxItem>
      )}
    </ListBox>
  );
}

const styles = stylex.create({
  list: { outlineStyle: "none", maxHeight: "18rem", overflow: "auto", padding: space.xs },
  item: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: size.controlSm,
    paddingBlock: "0.375rem",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    fontSize: font.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
  },
  itemFocused: { backgroundColor: color.subtle },
  itemDisabled: { opacity: "0.5" },
  dot: { width: "0.5rem", height: "0.5rem", flexShrink: 0, borderRadius: radius.full },
  label: { display: "flex", flexDirection: "column", gap: "0.125rem", flex: "1", minWidth: 0 },
  description: { fontSize: font.sm, color: color.textMuted },
  check: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.accentText },
  hidden: { visibility: "hidden" },
});

const dots = stylex.create({
  neutral: { backgroundColor: color.textFaint },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});
