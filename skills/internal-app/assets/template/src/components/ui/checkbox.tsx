import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { color, font, motion, radius, space } from "@/styles/tokens.stylex";

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
  disabled: { opacity: "0.5", cursor: "not-allowed" },
});
