import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type CheckboxProps as AriaCheckboxProps,
  FieldError,
  Label,
  Text,
} from "react-aria-components";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";
import { field } from "./field";

export interface CheckboxProps extends Omit<AriaCheckboxProps, "className" | "style" | "children"> {
  readonly children?: ReactNode;
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

export interface CheckboxOption<Value extends string> {
  readonly id: Value;
  readonly label: string;
  readonly description?: string;
  /** Trailing fact that helps the choice, such as a price or a duration. */
  readonly meta?: ReactNode;
}

export interface CheckboxGroupProps<Value extends string> extends Omit<
  AriaCheckboxGroupProps,
  "className" | "style" | "children" | "value" | "defaultValue" | "onChange"
> {
  readonly label: string;
  readonly options: ReadonlyArray<CheckboxOption<Value>>;
  readonly value: ReadonlyArray<Value>;
  readonly onChange: (value: ReadonlyArray<Value>) => void;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/**
 * Several visible choices from a short fixed list, such as the checks to run
 * before a deploy. Options are tiles in a grid that fills the width, so each one
 * is a large target and its `meta` (a duration or a price) lines up at the end.
 * Use MultiSelect for long or searchable lists.
 */
export function CheckboxGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
  description,
  errorMessage,
  style,
  ...props
}: CheckboxGroupProps<Value>) {
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
      <Label {...stylex.props(field.label)}>{label}</Label>
      <div {...stylex.props(styles.tiles)}>
        {options.map((option) => (
          <AriaCheckbox key={option.id} value={option.id} {...stylex.props(styles.tileRoot)}>
            {({ isSelected, isFocusVisible, isDisabled, isHovered }) => (
              <span
                {...stylex.props(
                  styles.tile,
                  isHovered && styles.tileHovered,
                  isSelected && styles.tileSelected,
                  isFocusVisible && styles.boxFocused,
                  isDisabled && styles.disabled,
                )}
              >
                <span
                  aria-hidden
                  {...stylex.props(
                    styles.box,
                    styles.tileBox,
                    isSelected && styles.boxSelected,
                    isInvalid && styles.boxInvalid,
                  )}
                >
                  <CheckboxMark isSelected={isSelected} isIndeterminate={false} />
                </span>
                <span {...stylex.props(styles.tileText)}>
                  <span {...stylex.props(styles.label)}>{option.label}</span>
                  {option.description ? (
                    <span {...stylex.props(styles.tileDescription)}>{option.description}</span>
                  ) : null}
                </span>
                {option.meta === undefined ? null : (
                  <span {...stylex.props(styles.tileMeta)}>{option.meta}</span>
                )}
              </span>
            )}
          </AriaCheckbox>
        ))}
      </div>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
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
    fontSize: font.md,
    cursor: "pointer",
    outlineStyle: "none",
  },
  box: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1rem",
    height: "1rem",
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
  icon: { width: "0.75rem", height: "0.75rem", strokeWidth: "3" },
  label: { color: color.text, userSelect: "none" },
  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 12rem), 1fr))",
    gap: space.sm,
  },
  tileRoot: { display: "flex", minWidth: 0, cursor: "pointer", outlineStyle: "none" },
  tile: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    width: "100%",
    minHeight: size.controlLg,
    paddingBlock: space.sm,
    paddingInline: space.md,
    fontSize: font.md,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.md,
    transitionProperty: "background-color, border-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  tileHovered: { borderColor: color.borderStrong },
  tileSelected: { backgroundColor: color.accentMuted, borderColor: color.accentBorder },
  tileBox: { marginTop: "0.125rem" },
  tileText: { display: "flex", flexDirection: "column", gap: "0.125rem", flex: "1", minWidth: 0 },
  tileDescription: { fontSize: font.sm, color: color.textMuted },
  tileMeta: {
    flexShrink: 0,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  disabled: { opacity: "0.5", cursor: "not-allowed" },
});
