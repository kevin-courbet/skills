// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Minus, Plus } from "lucide-react";
import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size } from "@/styles/tokens.stylex";
import { control, field, inputText } from "./field";

export interface NumberFieldProps extends Omit<
  AriaNumberFieldProps,
  "className" | "style" | "children"
> {
  readonly label: string;
  /** Hide the visible label where a SettingRow or toolbar names the field. Screen readers keep it. */
  readonly hideLabel?: boolean;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  /** Unit after the number, such as "ms", "rows", or "%". Use `formatOptions` for currency. */
  readonly unit?: string;
  /** Adds decrement and increment buttons that step by `step`. Arrow keys step without them. */
  readonly showStepper?: boolean;
  readonly style?: StyleXStyles;
}

/** Numeric input with locale formatting. Value is a number, NaN when empty. */
export function NumberField({
  label,
  hideLabel = false,
  description,
  errorMessage,
  placeholder,
  unit,
  showStepper = false,
  style,
  ...props
}: NumberFieldProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaNumberField {...props} isInvalid={isInvalid} {...stylex.props(field.root, style)}>
      <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          showStepper && styles.groupStepper,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        {showStepper ? (
          <Button slot="decrement" {...stylex.props(styles.step, styles.stepStart)}>
            <Minus aria-hidden {...stylex.props(styles.icon)} />
          </Button>
        ) : null}
        <Input
          placeholder={placeholder}
          {...stylex.props(inputText.base, styles.numeric, showStepper && styles.centered)}
        />
        {unit === undefined ? null : (
          <span {...stylex.props(styles.unit, showStepper && styles.unitStepper)}>{unit}</span>
        )}
        {showStepper ? (
          <Button slot="increment" {...stylex.props(styles.step, styles.stepEnd)}>
            <Plus aria-hidden {...stylex.props(styles.icon)} />
          </Button>
        ) : null}
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
  centered: { textAlign: "center" },
  unitStepper: { paddingInlineEnd: "0.5rem" },
  groupStepper: { paddingInline: 0 },
  unit: { flexShrink: 0, paddingInlineStart: "0.25rem", fontSize: font.md, color: color.textMuted },
  step: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.controlMd,
    height: "100%",
    flexShrink: 0,
    padding: 0,
    borderStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle, ":disabled": "transparent" },
    color: { default: color.textMuted, ":hover": color.text, ":disabled": color.textFaint },
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  stepStart: {
    borderInlineEndWidth: "1px",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.border,
    borderStartStartRadius: radius.md,
    borderEndStartRadius: radius.md,
  },
  stepEnd: {
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.border,
    borderStartEndRadius: radius.md,
    borderEndEndRadius: radius.md,
  },
  icon: { width: size.iconSm, height: size.iconSm },
});
