import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { control, field } from "./field";

export interface TextFieldProps extends Omit<
  AriaTextFieldProps,
  "className" | "style" | "children"
> {
  readonly label: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly multiline?: boolean;
  readonly style?: StyleXStyles;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  multiline = false,
  style,
  ...props
}: TextFieldProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaTextField {...props} isInvalid={isInvalid} {...stylex.props(field.root, style)}>
      <Label {...stylex.props(field.label)}>{label}</Label>
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
      ) : (
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
      )}
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
  textarea: {
    height: "auto",
    minHeight: "5rem",
    paddingBlock: "0.5rem",
    resize: "vertical",
    lineHeight: "1.45",
  },
});
