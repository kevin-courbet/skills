import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { control, field, inputText } from "./field";

export interface NumberFieldProps extends Omit<
  AriaNumberFieldProps,
  "className" | "style" | "children"
> {
  readonly label: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly style?: StyleXStyles;
}

/** Numeric input with locale formatting. Value is a number, NaN when empty. */
export function NumberField({
  label,
  description,
  errorMessage,
  placeholder,
  style,
  ...props
}: NumberFieldProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaNumberField {...props} isInvalid={isInvalid} {...stylex.props(field.root, style)}>
      <Label {...stylex.props(field.label)}>{label}</Label>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <Input placeholder={placeholder} {...stylex.props(inputText.base, styles.numeric)} />
      </Group>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}

const styles = stylex.create({
  numeric: { fontVariantNumeric: "tabular-nums", textAlign: "end" },
});
