// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A labeled number input with locale formatting, an optional unit, and optional
 * step buttons.
 *
 * @layer primitive
 * @keywords number field, number input, numeric input, quantity, amount, currency, unit, stepper, plus minus buttons, integer
 * @related TextField, Slider, Field, FormLayout, Layout
 * @notes form-fields, internal-app-forms
 *
 * Use it when people type an exact number. Do not use it to pick a value on a
 * scale, where the place matters more than the exact number: use `Slider`. Do
 * not use it for a code that has digits, such as a postal code or a phone
 * number: use `TextField`.
 *
 * ## Behavior
 * - The value shows in the format of the locale, right-aligned in tabular
 *   figures.
 * - Arrow keys step the value by `step`, also without `showStepper`.
 * - The value is a number, or `NaN` when the field is empty.
 * - The height follows the nearest `ControlSizeProvider`.
 *
 * ## Rules
 * - Give a currency through `formatOptions`, such as `{ style: "currency",
 *   currency: "EUR" }`, not through `unit`.
 * - Give every field a `width` from the length of its answer: `xs` fits a
 *   quantity or a floor.
 * - Handle `NaN` in `onChange` as an empty answer.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <NumberField
 *   label="Timeout"
 *   unit="seconds"
 *   width="xs"
 *   minValue={1}
 *   value={timeoutSeconds}
 *   onChange={setTimeoutSeconds}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Minus, Plus } from "lucide-react";
import {
  Button,
  Group,
  Input,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size } from "@/styles/tokens.stylex";
import {
  control,
  field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
  inputText,
} from "@/components/helpers/field";
import { useControlSize } from "@/components/helpers/control-size";

export interface NumberFieldProps extends Omit<
  AriaNumberFieldProps,
  "className" | "style" | "children"
> {
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** Hide the visible label where a SettingRow or toolbar names the field. Screen readers keep it. */
  readonly hideLabel?: boolean;
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
  /** Unit after the number, such as "ms", "rows", or "%". Use `formatOptions` for currency. */
  readonly unit?: string;
  /** Adds decrement and increment buttons that step by `step`. Arrow keys step without them. */
  readonly showStepper?: boolean;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

export function NumberField({
  label,
  hideLabel = false,
  description,
  errorMessage,
  isOptional = false,
  width = "full",
  placeholder,
  unit,
  showStepper = false,
  style,
  ...props
}: NumberFieldProps) {
  const controlSize = useControlSize();
  if (isOptional && props.isRequired === true)
    throw new Error("NumberField: a field cannot be both optional and required.");
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaNumberField {...props} isInvalid={isInvalid} {...stylex.props(field.root, style)}>
      <FieldLabel isOptional={isOptional} isHidden={hideLabel}>
        {label}
      </FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          fieldWidth[width],
          controlSize === "sm" && control.compact,
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
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
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
