// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  FieldError,
  Group,
  Input,
  Label,
  Text,
  TextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, space } from "@/styles/tokens.stylex";
import { control, field, inputText } from "./field";

export interface TextFieldProps extends Omit<
  AriaTextFieldProps,
  "className" | "style" | "children"
> {
  readonly label: string;
  /** Hide the visible label where a SettingRow or toolbar names the field. Screen readers keep it. */
  readonly hideLabel?: boolean;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly multiline?: boolean;
  /**
   * Content inside the box before the text: a fixed part of the value such as
   * "https://", or a lucide icon. Not for multiline fields.
   */
  readonly prefix?: ReactNode;
  /**
   * Content inside the box after the text: a unit or domain such as
   * ".example.com", a Kbd hint, a Spinner, or one small icon button.
   */
  readonly suffix?: ReactNode;
  readonly style?: StyleXStyles;
}

export function TextField({
  label,
  hideLabel = false,
  description,
  errorMessage,
  placeholder,
  multiline = false,
  prefix,
  suffix,
  style,
  ...props
}: TextFieldProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  const hasAdornment = prefix !== undefined || suffix !== undefined;
  if (multiline && hasAdornment)
    throw new Error("TextField: prefix and suffix are not supported on a multiline field.");
  return (
    <AriaTextField {...props} isInvalid={isInvalid} {...stylex.props(field.root, style)}>
      <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
      {multiline ? (
        <TextArea
          placeholder={placeholder}
          {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
            control.base,
            control.textInput,
            styles.textarea,
            state.isInvalid && control.invalid,
            state.isDisabled && control.disabled,
          ])}
        />
      ) : null}
      {!multiline && hasAdornment ? (
        <Group
          isInvalid={isInvalid}
          isDisabled={props.isDisabled}
          {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
            control.base,
            styles.group,
            state.isInvalid && control.invalid,
            state.isDisabled && control.disabled,
          ])}
        >
          {prefix === undefined ? null : <span {...stylex.props(styles.addon)}>{prefix}</span>}
          <Input placeholder={placeholder} {...stylex.props(inputText.base)} />
          {suffix === undefined ? null : <span {...stylex.props(styles.addon)}>{suffix}</span>}
        </Group>
      ) : null}
      {!multiline && !hasAdornment ? (
        <Input
          placeholder={placeholder}
          {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
            control.base,
            control.textInput,
            styles.input,
            state.isInvalid && control.invalid,
            state.isDisabled && control.disabled,
          ])}
        />
      ) : null}
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}

const styles = stylex.create({
  input: { display: "block" },
  group: { gap: space.sm },
  addon: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    flexShrink: 0,
    color: color.textMuted,
    fontSize: font.md,
    whiteSpace: "nowrap",
  },
  textarea: {
    height: "auto",
    minHeight: "5rem",
    paddingBlock: "0.5rem",
    resize: "vertical",
    lineHeight: "1.45",
  },
});
