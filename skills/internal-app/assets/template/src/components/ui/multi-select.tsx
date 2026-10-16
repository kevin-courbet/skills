import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import {
  Button,
  FieldError,
  Label,
  Popover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, size, space } from "@/styles/tokens.stylex";
import { control, field } from "./field";
import { type ListOption, OptionList } from "./list-box";
import { overlay } from "./overlay";
import { TagGroup } from "./tag-group";

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
  readonly label: string;
  readonly options: ReadonlyArray<ListOption<Value>>;
  readonly value: ReadonlyArray<Value>;
  readonly onChange: (value: ReadonlyArray<Value>) => void;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  /** `sm` uses the compact control height for toolbars inside a table frame. */
  readonly size?: "sm" | "md";
  /** Lists the chosen values as removable tags under the field. Use in forms, not toolbars. */
  readonly showTags?: boolean;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly style?: StyleXStyles;
}

/**
 * Several choices from a fixed list. The popover stays open while people
 * choose. The trigger names the first choice and counts the rest.
 */
export function MultiSelect<Value extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
  size: sizeKey = "md",
  showTags = false,
  description,
  errorMessage,
  placeholder = "Select",
  style,
  ...props
}: MultiSelectProps<Value>) {
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
        <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
        <Button
          {...renderStyles<{ isDisabled: boolean }>((state) => [
            control.base,
            styles.trigger,
            sizeKey === "sm" && control.compact,
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
        {description ? (
          <Text slot="description" {...stylex.props(field.description)}>
            {description}
          </Text>
        ) : null}
        <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
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
