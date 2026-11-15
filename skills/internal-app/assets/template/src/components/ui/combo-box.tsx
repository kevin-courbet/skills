/**
 * A single choice from a long list, where typing filters the options.
 *
 * @layer primitive
 * @keywords combo box, combobox, autocomplete, typeahead, searchable select, long list, type to filter, lookup, pick a customer
 * @related Select, MultiSelect, Cascader, ListBox, SearchField
 * @notes form-choices, form-fields, internal-app-forms
 *
 * Use it when the list is long and people know the name that they look for,
 * such as a customer or a host. Do not use it for a short list: use `Select` or
 * a `RadioGroup`. For several values, use `MultiSelect`. To search the records
 * of a list page, use `SearchField`.
 *
 * ## Behavior
 * - Typing filters the options. The chevron button opens the full list.
 * - An option shows its `description` under the label. An option with `intent`
 *   shows a status dot.
 * - The popover takes the width of the field and the density of the page.
 * - The height follows the nearest `ControlSizeProvider`.
 *
 * ## Rules
 * - The label always shows: the field has no `hideLabel`.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <ComboBox
 *   label="Customer"
 *   width="lg"
 *   placeholder="e.g. Acme"
 *   options={customers.map((customer) => ({ id: customer.id, label: customer.name }))}
 *   value={customerId}
 *   onChange={setCustomerId}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import {
  Button,
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  Group,
  Input,
  Popover,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, radius, size } from "@/styles/tokens.stylex";
import {
  control,
  field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
  inputText,
} from "./field";
import { type ListOption, OptionList } from "./list-box";
import { overlay } from "./overlay";
import { useControlSize } from "./control-size";
import { useOverlayDensity } from "./density";

type AriaSingleComboBoxProps<Value extends string> = Omit<
  AriaComboBoxProps<ListOption<Value>>,
  | "className"
  | "style"
  | "children"
  | "items"
  | "defaultItems"
  | "selectedKey"
  | "defaultSelectedKey"
  | "onSelectionChange"
  | "value"
  | "defaultValue"
  | "onChange"
>;

export interface ComboBoxProps<Value extends string> extends AriaSingleComboBoxProps<Value> {
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** The choices, in the order that they show. */
  readonly options: ReadonlyArray<ListOption<Value>>;
  /** Id of the chosen option, or null when nothing is chosen. */
  readonly value?: Value | null;
  /** Receives the id of the chosen option, or null when people clear the text. */
  readonly onChange?: (value: Value | null) => void;
  /** Hint between the label and the control, such as the format or where the answer goes. */
  readonly description?: string;
  /** Error text under the field. It also marks the field invalid. */
  readonly errorMessage?: string;
  /** Adds a quiet "optional" to the label. Do not set it with `isRequired`. */
  readonly isOptional?: boolean;
  /** Control width from the expected length of the answer. See FieldWidth. */
  readonly width?: FieldWidth;
  /** An example answer that starts with "e.g.". Never the only instruction. */
  readonly placeholder?: string;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

/** Single choice from a long list. Typing filters the options. */
export function ComboBox<Value extends string>({
  label,
  options,
  value,
  onChange,
  description,
  errorMessage,
  isOptional = false,
  width = "full",
  placeholder,
  style,
  ...props
}: ComboBoxProps<Value>) {
  const controlSize = useControlSize();
  const overlayDensity = useOverlayDensity();
  if (isOptional && props.isRequired === true)
    throw new Error("ComboBox: a field cannot be both optional and required.");
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaComboBox
      {...props}
      isInvalid={isInvalid}
      defaultItems={options}
      selectedKey={value}
      onSelectionChange={(key) => {
        if (onChange === undefined) return;
        const option = options.find((candidate) => candidate.id === key);
        onChange(option === undefined ? null : option.id);
      }}
      {...stylex.props(field.root, style)}
    >
      <FieldLabel isOptional={isOptional}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          fieldWidth[width],
          controlSize === "sm" && control.compact,
          styles.group,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <Input placeholder={placeholder} {...stylex.props(inputText.base)} />
        <Button {...stylex.props(styles.button)}>
          <ChevronDown aria-hidden {...stylex.props(styles.chevron)} />
        </Button>
      </Group>
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
      <Popover
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          ...overlayDensity,
          overlay.popover,
          overlay.matchTrigger,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
        <OptionList options={options} />
      </Popover>
    </AriaComboBox>
  );
}

const styles = stylex.create({
  group: { paddingInlineEnd: "2px" },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.625rem",
    flexShrink: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.textMuted,
    cursor: "pointer",
  },
  chevron: { width: size.icon, height: size.icon },
});
