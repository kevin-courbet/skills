import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  FieldError,
  Label,
  Radio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  Text,
} from "react-aria-components";
import { color, font, motion, radius, space } from "@/styles/tokens.stylex";
import { field } from "./field";

export interface RadioOption<Value extends string> {
  readonly id: Value;
  readonly label: string;
  readonly description?: string;
}

export interface RadioGroupProps<Value extends string> extends Omit<
  AriaRadioGroupProps,
  "className" | "style" | "children" | "value" | "defaultValue" | "onChange"
> {
  readonly label: string;
  readonly options: ReadonlyArray<RadioOption<Value>>;
  readonly value?: Value;
  readonly defaultValue?: Value;
  readonly onChange?: (value: Value) => void;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/** Up to about five visible choices where comparison matters. Use Select for longer lists. */
export function RadioGroup<Value extends string>({
  label,
  options,
  value,
  defaultValue,
  onChange,
  description,
  errorMessage,
  orientation = "vertical",
  style,
  ...props
}: RadioGroupProps<Value>) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaRadioGroup
      {...props}
      orientation={orientation}
      isInvalid={isInvalid}
      value={value}
      defaultValue={defaultValue}
      onChange={(next) => {
        const option = options.find((candidate) => candidate.id === next);
        if (option !== undefined && onChange !== undefined) onChange(option.id);
      }}
      {...stylex.props(field.root, style)}
    >
      <Label {...stylex.props(field.label)}>{label}</Label>
      <div {...stylex.props(styles.options, orientation === "horizontal" && styles.horizontal)}>
        {options.map((option) => (
          <Radio key={option.id} value={option.id} {...stylex.props(styles.radio)}>
            {({ isSelected, isFocusVisible, isDisabled }) => (
              <>
                <span
                  aria-hidden
                  {...stylex.props(
                    styles.circle,
                    isSelected && styles.circleSelected,
                    isFocusVisible && styles.circleFocused,
                    isInvalid && styles.circleInvalid,
                    isDisabled && styles.disabled,
                  )}
                />
                <span {...stylex.props(styles.text, isDisabled && styles.disabled)}>
                  {option.label}
                  {option.description ? (
                    <span {...stylex.props(styles.description)}>{option.description}</span>
                  ) : null}
                </span>
              </>
            )}
          </Radio>
        ))}
      </div>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

const styles = stylex.create({
  options: { display: "flex", flexDirection: "column", gap: space.sm, paddingBlock: space.xs },
  horizontal: { flexDirection: "row", flexWrap: "wrap", gap: space.lg },
  radio: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    fontSize: font.md,
    cursor: "pointer",
    outlineStyle: "none",
  },
  circle: {
    width: "1rem",
    height: "1rem",
    marginTop: "0.125rem",
    flexShrink: 0,
    borderRadius: radius.full,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.borderStrong,
    backgroundColor: color.raised,
    transitionProperty: "border-color, border-width",
    transitionDuration: motion.fast,
  },
  circleSelected: { borderColor: color.accent, borderWidth: "5px" },
  circleFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  circleInvalid: { borderColor: color.danger },
  text: { display: "flex", flexDirection: "column", gap: "0.125rem", color: color.text },
  description: { fontSize: font.sm, color: color.textMuted },
  disabled: { opacity: "0.5", cursor: "not-allowed" },
});
