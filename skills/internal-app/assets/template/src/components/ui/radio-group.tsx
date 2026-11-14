import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Radio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
import { color, font, motion, radius, space } from "@/styles/tokens.stylex";
import {
  assertChoiceOptions,
  type ChoiceAppearance,
  type ChoiceNoneOption,
  type ChoiceOption,
  ChoiceLeading,
  choice,
  chipSizes,
} from "./choice";
import { useControlSize } from "./control-size";
import { field, FieldDescription, FieldErrorMessage, FieldLabel } from "./field";

interface RadioGroupBaseProps<Value extends string> extends Omit<
  AriaRadioGroupProps,
  "className" | "style" | "children" | "value" | "defaultValue" | "onChange" | "orientation"
> {
  readonly label: string;
  readonly options: ReadonlyArray<ChoiceOption<Value>>;
  /** Hint between the label and the options, such as what the choice changes. */
  readonly description?: string;
  readonly errorMessage?: string;
  /** See ChoiceAppearance. The default is `list`. */
  readonly appearance?: ChoiceAppearance;
  /** Direction of the `list` appearance. Cards and chips always flow in rows. */
  readonly orientation?: "vertical" | "horizontal";
  readonly style?: StyleXStyles;
}

type RadioGroupValueProps<Value extends string> =
  | {
      readonly noneOption?: undefined;
      /** The chosen option, or null before people choose one. */
      readonly value?: Value | null;
      readonly defaultValue?: Value;
      readonly onChange?: (value: Value) => void;
    }
  | {
      /** Adds a last option whose value is null, such as "Decide later". See ChoiceNoneOption. */
      readonly noneOption: ChoiceNoneOption;
      /** The chosen option. Null selects the none option. */
      readonly value: Value | null;
      readonly defaultValue?: undefined;
      readonly onChange: (value: Value | null) => void;
    };

export type RadioGroupProps<Value extends string> = RadioGroupBaseProps<Value> &
  RadioGroupValueProps<Value>;

// Radio values are strings, so the none option takes the one id that no option may use.
const noneId = "";

/**
 * One choice from a short visible list. Arrow keys move between the options
 * and choose one; Tab leaves the group. Use `cards` when people compare the
 * options, `chips` for short labels in a row, and Select for more than about
 * seven options. A single choice that people may skip takes a `noneOption`.
 */
export function RadioGroup<Value extends string>(props: RadioGroupProps<Value>) {
  const {
    label,
    options,
    description,
    errorMessage,
    appearance = "list",
    orientation,
    style,
    noneOption,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    ...ariaProps
  } = props;
  const controlSize = useControlSize();
  assertChoiceOptions("RadioGroup", appearance, options);
  if (options.some((option) => option.id === noneId))
    throw new Error("RadioGroup: an option id must not be empty.");
  if (orientation !== undefined && appearance !== "list")
    throw new Error("RadioGroup: orientation applies to the list appearance only.");
  const isInvalid = ariaProps.isInvalid ?? errorMessage !== undefined;
  const items: ReadonlyArray<ChoiceOption<string>> =
    noneOption === undefined
      ? options
      : [...options, { id: noneId, label: noneOption.label, description: noneOption.description }];
  const selectedKey = props.noneOption === undefined ? props.value : (props.value ?? noneId);
  const select = (next: string) => {
    if (props.noneOption !== undefined && next === noneId) return props.onChange(null);
    const option = options.find((candidate) => candidate.id === next);
    if (option === undefined) throw new Error(`RadioGroup: no option has the id "${next}".`);
    props.onChange?.(option.id);
  };
  return (
    <AriaRadioGroup
      {...ariaProps}
      orientation={appearance === "list" ? (orientation ?? "vertical") : "horizontal"}
      isInvalid={isInvalid}
      value={selectedKey}
      defaultValue={props.defaultValue}
      onChange={select}
      {...stylex.props(field.root, style)}
    >
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <div
        {...stylex.props(
          appearance === "list" && styles.list,
          appearance === "list" && orientation === "horizontal" && styles.horizontal,
          appearance === "cards" && choice.cards,
          appearance === "chips" && choice.chips,
        )}
      >
        {items.map((option) => (
          <Radio
            key={option.id}
            value={option.id}
            isDisabled={option.isDisabled}
            {...stylex.props(appearance === "list" ? styles.radio : choice.itemRoot)}
          >
            {({ isSelected, isFocusVisible, isDisabled }) => {
              const mark = (
                <span
                  aria-hidden
                  {...stylex.props(
                    styles.circle,
                    isSelected && styles.circleSelected,
                    isInvalid && !isSelected && styles.circleInvalid,
                    appearance === "cards" && choice.cardMark,
                    appearance === "list" && isFocusVisible && styles.circleFocused,
                    appearance === "list" && isDisabled && styles.disabled,
                  )}
                />
              );
              if (appearance === "list")
                return (
                  <>
                    {mark}
                    <span {...stylex.props(styles.text, isDisabled && styles.disabled)}>
                      {option.label}
                      {option.description ? (
                        <span {...stylex.props(styles.description)}>{option.description}</span>
                      ) : null}
                    </span>
                  </>
                );
              const state = [
                choice.base,
                isSelected && choice.selected,
                isInvalid && !isSelected && choice.invalid,
                isFocusVisible && choice.focused,
                isDisabled && choice.disabled,
              ];
              if (appearance === "cards")
                return (
                  <span {...stylex.props(choice.card, ...state)}>
                    {mark}
                    <span {...stylex.props(choice.cardText)}>
                      <span {...stylex.props(choice.cardLabel)}>
                        <ChoiceLeading option={option} isSelected={isSelected} placement="card" />
                        {option.label}
                      </span>
                      {option.description ? (
                        <span {...stylex.props(choice.cardDescription)}>{option.description}</span>
                      ) : null}
                    </span>
                    {option.meta === undefined ? null : (
                      <span {...stylex.props(choice.cardMeta)}>{option.meta}</span>
                    )}
                  </span>
                );
              return (
                <span
                  {...stylex.props(
                    choice.chip,
                    chipSizes[controlSize],
                    ...state,
                    isSelected && choice.chipSelected,
                  )}
                >
                  <ChoiceLeading option={option} isSelected={isSelected} placement="chip" />
                  {option.label}
                  {option.meta === undefined ? null : (
                    <span {...stylex.props(choice.chipMeta)}>{option.meta}</span>
                  )}
                </span>
              );
            }}
          </Radio>
        ))}
      </div>
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
    </AriaRadioGroup>
  );
}

const styles = stylex.create({
  list: { display: "flex", flexDirection: "column", gap: space.sm, paddingBlock: space.xs },
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
