/**
 * One on and off choice with `Checkbox`, or several choices from a short visible list with `CheckboxGroup`.
 *
 * @layer primitive
 * @keywords checkbox, check box, checkbox group, multiple choice, select several, tick box, agree to terms, indeterminate, chips, choice cards
 * @related RadioGroup, Choice, MultiSelect, Switch, ToggleGroup, FormLayout
 * @notes form-choices, form-fields, form-errors, internal-app-forms
 *
 * Use `Checkbox` for one independent answer, such as "Send a copy to me".
 * Use `CheckboxGroup` for several answers from a short fixed list, such as
 * the kinds of work in a request. Do not use them for a long or searchable
 * list: use `MultiSelect`. For one answer, use `RadioGroup`. For a setting
 * that applies at once outside a form, use `Switch` or `ToggleGroup`.
 *
 * ## Behavior
 * The controls do these things. Do not build them again:
 * - Each option is its own tab stop, and Space toggles it.
 * - `Checkbox` shows a dash with `isIndeterminate`, such as for a "select
 *   all" box when only some rows are selected.
 * - `CheckboxGroup` returns the values in option order, and a selected chip
 *   shows a check mark.
 * - Chips take the control size of their row.
 * - The label, the description, and the error message connect to the group
 *   for screen readers. `errorMessage` marks the group invalid.
 *
 * ## Rules
 * - `appearance="cards"` (the default) fits options with a `description` or
 *   a `meta`, such as a duration. `chips` fit short labels. `list` fits a
 *   dense panel or a dialog.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <CheckboxGroup
 *   label="Kinds of work"
 *   appearance="chips"
 *   options={workKinds}
 *   value={kinds}
 *   onChange={setKinds}
 *   errorMessage={errors.kinds}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";
import {
  assertChoiceOptions,
  type ChoiceAppearance,
  type ChoiceOption,
  ChoiceLeading,
  choice,
  chipSizes,
} from "@/components/helpers/choice";
import { useControlSize } from "@/components/helpers/control-size";
import { field, FieldDescription, FieldErrorMessage, FieldLabel } from "@/components/helpers/field";

export interface CheckboxProps extends Omit<AriaCheckboxProps, "className" | "style" | "children"> {
  /** Visible label after the box. Without it, give an `aria-label`. */
  readonly children?: ReactNode;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

export function Checkbox({ children, style, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox {...props} {...stylex.props(styles.root, style)}>
      {({ isSelected, isIndeterminate, isFocusVisible, isDisabled, isInvalid }) => (
        <>
          <span
            aria-hidden
            {...stylex.props(
              styles.box,
              (isSelected || isIndeterminate) && styles.boxSelected,
              isFocusVisible && styles.boxFocused,
              isInvalid && styles.boxInvalid,
              isDisabled && styles.disabled,
            )}
          >
            <CheckboxMark isSelected={isSelected} isIndeterminate={isIndeterminate} />
          </span>
          {children ? (
            <span {...stylex.props(styles.label, isDisabled && styles.disabled)}>{children}</span>
          ) : null}
        </>
      )}
    </AriaCheckbox>
  );
}

export interface CheckboxGroupProps<Value extends string> extends Omit<
  AriaCheckboxGroupProps,
  "className" | "style" | "children" | "value" | "defaultValue" | "onChange"
> {
  /** Visible name of the group, in sentence case. */
  readonly label: string;
  /** The options of a short fixed list. See ChoiceOption. */
  readonly options: ReadonlyArray<ChoiceOption<Value>>;
  /** Ids of the selected options. */
  readonly value: ReadonlyArray<Value>;
  /** Receives the ids of the selected options, in option order. */
  readonly onChange: (value: ReadonlyArray<Value>) => void;
  /** Hint between the label and the options, such as what the choice changes. */
  readonly description?: string;
  /** Error text under the options. It also marks the group invalid. */
  readonly errorMessage?: string;
  /** See ChoiceAppearance. The default is `cards`. */
  readonly appearance?: ChoiceAppearance;
  /** Marks the label "optional" when people may choose nothing. Do not set it with `isRequired`. */
  readonly isOptional?: boolean;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

export function CheckboxGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
  description,
  errorMessage,
  appearance = "cards",
  isOptional = false,
  style,
  ...props
}: CheckboxGroupProps<Value>) {
  const controlSize = useControlSize();
  assertChoiceOptions("CheckboxGroup", appearance, options);
  if (isOptional && props.isRequired)
    throw new Error("CheckboxGroup: set isOptional or isRequired, not both.");
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaCheckboxGroup
      {...props}
      isInvalid={isInvalid}
      value={[...value]}
      onChange={(next) =>
        onChange(options.filter((option) => next.includes(option.id)).map((option) => option.id))
      }
      {...stylex.props(field.root, style)}
    >
      <FieldLabel isOptional={isOptional}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <div
        {...stylex.props(
          appearance === "list" && styles.list,
          appearance === "cards" && choice.cards,
          appearance === "chips" && choice.chips,
        )}
      >
        {options.map((option) => (
          <AriaCheckbox
            key={option.id}
            value={option.id}
            isDisabled={option.isDisabled}
            {...stylex.props(appearance === "list" ? styles.listItem : choice.itemRoot)}
          >
            {({ isSelected, isFocusVisible, isDisabled }) => {
              const box = (
                <span
                  aria-hidden
                  {...stylex.props(
                    styles.box,
                    appearance === "list" ? styles.listBox : choice.cardMark,
                    isSelected && styles.boxSelected,
                    isInvalid && !isSelected && styles.boxInvalid,
                    appearance === "list" && isFocusVisible && styles.boxFocused,
                    appearance === "list" && isDisabled && styles.disabled,
                  )}
                >
                  <CheckboxMark isSelected={isSelected} isIndeterminate={false} />
                </span>
              );
              if (appearance === "list")
                return (
                  <>
                    {box}
                    <span {...stylex.props(styles.listText, isDisabled && styles.disabled)}>
                      {option.label}
                      {option.description ? (
                        <span {...stylex.props(styles.listDescription)}>{option.description}</span>
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
                    {box}
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
                  {isSelected ? (
                    // A multiple choice shows a check, so chips never read as one choice of many.
                    <Check aria-hidden {...stylex.props(choice.icon, choice.iconSelected)} />
                  ) : (
                    <ChoiceLeading option={option} isSelected={isSelected} placement="chip" />
                  )}
                  {option.label}
                  {option.meta === undefined ? null : (
                    <span {...stylex.props(choice.chipMeta)}>{option.meta}</span>
                  )}
                </span>
              );
            }}
          </AriaCheckbox>
        ))}
      </div>
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
    </AriaCheckboxGroup>
  );
}

function CheckboxMark({
  isSelected,
  isIndeterminate,
}: {
  readonly isSelected: boolean;
  readonly isIndeterminate: boolean;
}) {
  if (isIndeterminate) return <Minus {...stylex.props(styles.icon)} />;
  if (isSelected) return <Check {...stylex.props(styles.icon)} />;
  return null;
}

const styles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    paddingBlock: size.togglePadding,
    fontSize: font.md,
    cursor: "pointer",
    outlineStyle: "none",
  },
  box: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.toggle,
    height: size.toggle,
    flexShrink: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: color.raised,
    color: color.onAccent,
    transitionProperty: "background-color, border-color, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  boxSelected: { backgroundColor: color.accent, borderColor: color.accent },
  boxFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  boxInvalid: { borderColor: color.danger },
  icon: { width: size.toggleMark, height: size.toggleMark, strokeWidth: "3" },
  label: { color: color.text, userSelect: "none" },
  list: { display: "flex", flexDirection: "column", gap: space.sm, paddingBlock: space.xs },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    paddingBlock: size.togglePadding,
    fontSize: font.md,
    cursor: "pointer",
    outlineStyle: "none",
  },
  // Centers the box on the first line of the label in every density.
  listBox: { marginTop: `calc((1lh - ${size.toggle}) / 2)` },
  listText: { display: "flex", flexDirection: "column", gap: "0.125rem", color: color.text },
  listDescription: { fontSize: font.sm, color: color.textMuted },
  disabled: { opacity: "0.5", cursor: "not-allowed" },
});
