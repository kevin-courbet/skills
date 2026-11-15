/**
 * A single choice from a fixed list in a popover.
 *
 * @layer primitive
 * @keywords select, dropdown, single choice, pick one option, option list, picker, toolbar select, choose from a list
 * @related RadioGroup, ComboBox, Cascader, MultiSelect, ListBox, Layout
 * @notes form-choices, form-fields, internal-app-forms
 *
 * Use it for one choice from more than about seven options, or from a short
 * list where the row has no space for chips, such as a toolbar or a
 * `SettingRow`. In a form, show a short list as a `RadioGroup` with chips or
 * cards: a dropdown hides the options and costs two clicks. When people know
 * the name and type it, use `ComboBox`. For a path in a hierarchy, use
 * `Cascader`.
 *
 * ## Behavior
 * - An option shows its `description` under the label. An option with `intent`
 *   shows a status dot.
 * - The selected option shows a check mark. The trigger shows only the label.
 * - The popover takes the width of the trigger and the density of the page.
 * - The height follows the nearest `ControlSizeProvider`.
 *
 * ## Rules
 * - Give every field a `width` from the length of its longest option.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <Select
 *   label="Region"
 *   width="md"
 *   options={[
 *     { id: "eu", label: "Europe" },
 *     { id: "us", label: "United States" },
 *   ]}
 *   value={region}
 *   onChange={setRegion}
 * />
 * ```
 */
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
import { useOverlayDensity } from "./density";

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
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** The choices, in the order that they show. */
  readonly options: ReadonlyArray<SelectOption<Value>>;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  /** Id of the chosen option, or null when nothing is chosen. */
  readonly value?: Value | null;
  /** Id of the first choice when the field keeps its own state. */
  readonly defaultValue?: Value;
  /** Receives the id of the chosen option. */
  readonly onChange?: (value: Value) => void;
  /** Hint between the label and the control, such as the format or where the answer goes. */
  readonly description?: string;
  /** Error text under the field. It also marks the field invalid. */
  readonly errorMessage?: string;
  /** Adds a quiet "optional" to the label. Do not set it with `isRequired`. */
  readonly isOptional?: boolean;
  /** Control width from the expected length of the answer. See FieldWidth. */
  readonly width?: FieldWidth;
  /** Trigger text while nothing is chosen. */
  readonly placeholder?: string;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

/** Single choice from a fixed list. Use ComboBox when users need to type to find. */
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
  const overlayDensity = useOverlayDensity();
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
          ...overlayDensity,
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
