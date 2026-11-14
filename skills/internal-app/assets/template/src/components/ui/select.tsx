import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import {
  Button,
  Popover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, size, space } from "@/styles/tokens.stylex";
import {
  control,
  field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
} from "./field";
import { type ListOption, OptionList } from "./list-box";
import { overlay } from "./overlay";
import { useControlSize } from "./control-size";

export type SelectOption<Value extends string> = ListOption<Value>;

type AriaSingleSelectProps<Value extends string> = Omit<
  AriaSelectProps<SelectOption<Value>, "single">,
  | "className"
  | "style"
  | "children"
  | "selectedKey"
  | "onSelectionChange"
  | "defaultSelectedKey"
  | "value"
  | "defaultValue"
  | "onChange"
  | "selectionMode"
>;

export interface SelectProps<Value extends string> extends AriaSingleSelectProps<Value> {
  readonly label: string;
  readonly options: ReadonlyArray<SelectOption<Value>>;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  readonly value?: Value | null;
  readonly defaultValue?: Value;
  readonly onChange?: (value: Value) => void;
  readonly description?: string;
  readonly errorMessage?: string;
  /** Adds a quiet "optional" to the label. Do not set it with `isRequired`. */
  readonly isOptional?: boolean;
  /** Control width from the expected length of the answer. See FieldWidth. */
  readonly width?: FieldWidth;
  readonly placeholder?: string;
  readonly style?: StyleXStyles;
}

/** Single choice from a short, fixed list. Use ComboBox when users need to type to find. */
export function Select<Value extends string>({
  label,
  hideLabel = false,
  options,
  value,
  defaultValue,
  onChange,
  description,
  errorMessage,
  isOptional = false,
  width = "full",
  placeholder = "Select",
  style,
  ...props
}: SelectProps<Value>) {
  const controlSize = useControlSize();
  if (isOptional && props.isRequired === true)
    throw new Error("Select: a field cannot be both optional and required.");
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaSelect
      {...props}
      isInvalid={isInvalid}
      placeholder={placeholder}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => {
        const option = options.find((candidate) => candidate.id === key);
        if (option !== undefined && onChange !== undefined) onChange(option.id);
      }}
      {...stylex.props(field.root, style)}
    >
      <FieldLabel isOptional={isOptional} isHidden={hideLabel}>
        {label}
      </FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <Button
        {...renderStyles<{ isDisabled: boolean }>((state) => [
          control.base,
          fieldWidth[width],
          styles.trigger,
          controlSize === "sm" && control.compact,
          isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        {/* Render the text only. The default renders the whole option, including its check icon. */}
        <SelectValue
          {...renderStyles<{ isPlaceholder: boolean }>((state) => [
            styles.value,
            state.isPlaceholder && control.placeholder,
          ])}
        >
          {({ selectedText, isPlaceholder }) => (isPlaceholder ? placeholder : selectedText)}
        </SelectValue>
        <ChevronDown aria-hidden {...stylex.props(styles.chevron)} />
      </Button>
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
      <Popover
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          overlay.popover,
          overlay.matchTrigger,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
        <OptionList options={options} />
      </Popover>
    </AriaSelect>
  );
}

const styles = stylex.create({
  trigger: {
    justifyContent: "space-between",
    gap: space.sm,
    cursor: "pointer",
    textAlign: "start",
  },
  value: {
    flex: "1",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chevron: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
});
