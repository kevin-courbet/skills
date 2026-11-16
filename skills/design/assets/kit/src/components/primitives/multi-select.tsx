/**
 * Several choices from a fixed list in a popover, with optional removable tags.
 *
 * @layer primitive
 * @keywords multi select, multiselect, multiple choice dropdown, several values, pick many, select many, tags, labels picker
 * @related Checkbox, Select, ComboBox, TagGroup, Filters, ListBox
 * @notes form-choices, kit-forms
 *
 * Use it for several choices from a long list. For several choices from a short
 * list, use `CheckboxGroup` with chips or cards, which shows all the options.
 * To filter a list page, use `Filters`.
 *
 * ## Behavior
 * - The popover stays open while people choose.
 * - The trigger names the first choice and counts the rest, such as "Pump and 2
 *   more".
 * - With `showTags`, each tag has a remove button, and Backspace and Delete
 *   remove the focused tag.
 * - `onChange` receives the ids in the order of `options`.
 *
 * ## Rules
 * - Give every field a `width` from the length of its trigger text.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <MultiSelect
 *   label="Skills"
 *   showTags
 *   options={skillOptions}
 *   value={skills}
 *   onChange={setSkills}
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
} from "@/components/helpers/field";
import { type ListOption, OptionList } from "@/components/helpers/list-box";
import { overlay } from "@/components/helpers/overlay";
import { TagGroup } from "./tag-group";
import { useControlSize } from "@/components/helpers/control-size";
import { useOverlayDensity } from "@/components/helpers/density";

type AriaMultipleSelectProps<Value extends string> = Omit<
  AriaSelectProps<ListOption<Value>, "multiple">,
  | "className"
  | "style"
  | "children"
  | "value"
  | "defaultValue"
  | "onChange"
  | "selectionMode"
  | "selectedKey"
  | "defaultSelectedKey"
  | "onSelectionChange"
>;

export interface MultiSelectProps<Value extends string> extends AriaMultipleSelectProps<Value> {
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** The choices, in the order that they show. */
  readonly options: ReadonlyArray<ListOption<Value>>;
  /** Ids of the chosen options. */
  readonly value: ReadonlyArray<Value>;
  /** Receives the ids of the chosen options. */
  readonly onChange: (value: ReadonlyArray<Value>) => void;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  /** Lists the chosen values as removable tags under the field. Use in forms, not toolbars. */
  readonly showTags?: boolean;
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

export function MultiSelect<Value extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
  showTags = false,
  description,
  errorMessage,
  isOptional = false,
  width = "full",
  placeholder = "Select",
  style,
  ...props
}: MultiSelectProps<Value>) {
  const controlSize = useControlSize();
  const overlayDensity = useOverlayDensity();
  if (isOptional && props.isRequired === true)
    throw new Error("MultiSelect: a field cannot be both optional and required.");
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  const selected = options.filter((option) => value.includes(option.id));
  const toValues = (keys: ReadonlyArray<unknown>) =>
    options.filter((option) => keys.includes(option.id)).map((option) => option.id);
  return (
    <div {...stylex.props(field.root, styles.root, style)}>
      <AriaSelect
        {...props}
        selectionMode="multiple"
        isInvalid={isInvalid}
        placeholder={placeholder}
        value={value}
        onChange={(keys) => onChange(toValues(keys))}
        {...stylex.props(field.root)}
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
          <SelectValue
            {...renderStyles<{ isPlaceholder: boolean }>((state) => [
              styles.value,
              state.isPlaceholder && control.placeholder,
            ])}
          >
            {({ isPlaceholder }) => (isPlaceholder ? placeholder : summary(selected))}
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
      {showTags && selected.length > 0 ? (
        <TagGroup
          label={`Selected ${label.toLowerCase()}`}
          hideLabel
          items={selected}
          onRemove={(removed) => onChange(value.filter((id) => !removed.includes(id)))}
        />
      ) : null}
    </div>
  );
}

function summary<Value extends string>(selected: ReadonlyArray<ListOption<Value>>): string {
  const [first, ...rest] = selected;
  if (first === undefined) return "";
  return rest.length === 0 ? first.label : `${first.label} and ${rest.length} more`;
}

const styles = stylex.create({
  root: { gap: space.sm },
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
