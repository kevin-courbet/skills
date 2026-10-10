import * as stylex from "@stylexjs/stylex";
import { Check } from "lucide-react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";

export interface ListOption<Value extends string> {
  readonly id: Value;
  readonly label: string;
  readonly description?: string;
}

/** Option list inside a Select or ComboBox popover. */
export function OptionList<Value extends string>({
  options,
}: {
  readonly options: ReadonlyArray<ListOption<Value>>;
}) {
  return (
    <ListBox items={options} {...stylex.props(styles.list)}>
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
    justifyContent: "space-between",
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
  itemDisabled: { opacity: "0.5" },
  label: { display: "flex", flexDirection: "column", gap: "0.125rem", minWidth: 0 },
  description: { fontSize: font.sm, color: color.textMuted },
  check: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.accentText },
  hidden: { visibility: "hidden" },
});
