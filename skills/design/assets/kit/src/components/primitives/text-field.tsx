// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * A labeled text input of one line, or a text area with `multiline`.
 *
 * @layer primitive
 * @keywords text field, text input, input, textarea, multiline text, single line field, prefix, suffix, url field, email field
 * @related NumberField, SearchField, ComboBox, Select, FormLayout, SettingsCard, CopyButton
 * @notes form-fields, form-errors, kit-forms
 *
 * Use it for free text. Do not use it for a number: use `NumberField`. Do not
 * use it to filter a list: use `SearchField`. Do not use it for a choice from
 * known values: use `Select`, `ComboBox`, or a `RadioGroup` of chips.
 *
 * ## Behavior
 * The field does these things. Do not build them again:
 * - The label, the description, and the error message connect to the input
 *   for screen readers.
 * - `errorMessage` marks the field invalid and shows the message below it.
 * - The height follows the nearest `ControlSizeProvider`.
 * - A `multiline` field grows with its text, from about three lines to about
 *   ten lines. Above that, it scrolls.
 *
 * ## Rules
 * - Give every field a `width` from the length of its answer, not from the
 *   space in the layout. See `design read kit-forms`.
 * - `isOptional` together with `isRequired` throws an error. So do `prefix`
 *   or `suffix` on a `multiline` field.
 * - A `placeholder` never replaces the label or the description.
 *
 * ## Example
 * ```tsx
 * <TextField
 *   label="Serial number"
 *   description="On the label under the battery."
 *   width="md"
 *   placeholder="e.g. SN-20931"
 *   value={serial}
 *   onChange={setSerial}
 *   errorMessage={errors.serial}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  Group,
  Input,
  TextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, space } from "@/styles/tokens.stylex";
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

export interface TextFieldProps extends Omit<
  AriaTextFieldProps,
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
  /** An example answer that starts with "e.g.", such as "e.g. 3.14". Never the only instruction. */
  readonly placeholder?: string;
  /** Renders a text area that grows with its text, for answers of more than one line. */
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
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

export function TextField({
  label,
  hideLabel = false,
  description,
  errorMessage,
  isOptional = false,
  width = "full",
  placeholder,
  multiline = false,
  prefix,
  suffix,
  style,
  ...props
}: TextFieldProps) {
  const controlSize = useControlSize();
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  const hasAdornment = prefix !== undefined || suffix !== undefined;
  if (multiline && hasAdornment)
    throw new Error("TextField: prefix and suffix are not supported on a multiline field.");
  if (isOptional && props.isRequired === true)
    throw new Error("TextField: a field cannot be both optional and required.");
  return (
    <AriaTextField {...props} isInvalid={isInvalid} {...stylex.props(field.root, style)}>
      <FieldLabel isOptional={isOptional} isHidden={hideLabel}>
        {label}
      </FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      {multiline ? (
        <TextArea
          placeholder={placeholder}
          {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
            control.base,
            fieldWidth[width],
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
            fieldWidth[width],
            controlSize === "sm" && control.compact,
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
            fieldWidth[width],
            controlSize === "sm" && control.compact,
            control.textInput,
            styles.input,
            state.isInvalid && control.invalid,
            state.isDisabled && control.disabled,
          ])}
        />
      ) : null}
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
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
    fieldSizing: "content",
    minHeight: "5rem",
    // Above about ten lines, the field scrolls, so that a long note does not push the form off the screen.
    maxHeight: "calc(10lh + 1rem)",
    paddingBlock: "0.5rem",
    resize: "vertical",
    lineHeight: "1.45",
  },
});
