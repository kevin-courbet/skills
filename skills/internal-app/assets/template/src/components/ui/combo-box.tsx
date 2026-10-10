import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import {
  Button,
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  FieldError,
  Group,
  Input,
  Label,
  Popover,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, radius, size } from "@/styles/tokens.stylex";
import { control, field, inputText } from "./field";
import { type ListOption, OptionList } from "./list-box";
import { overlay } from "./overlay";

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
  readonly label: string;
  readonly options: ReadonlyArray<ListOption<Value>>;
  readonly value?: Value | null;
  readonly onChange?: (value: Value | null) => void;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly placeholder?: string;
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
  placeholder,
  style,
  ...props
}: ComboBoxProps<Value>) {
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
      <Label {...stylex.props(field.label)}>{label}</Label>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
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
