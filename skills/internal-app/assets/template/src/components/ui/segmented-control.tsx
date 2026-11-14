import * as stylex from "@stylexjs/stylex";
import type { LucideIcon } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, motion, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { useControlSize } from "./control-size";

export interface SegmentOption<Value extends string> {
  readonly id: Value;
  readonly label: string;
  readonly icon?: LucideIcon;
}

export interface SegmentedControlProps<Value extends string> {
  /** Accessible name for the group, such as "View" or "Period". */
  readonly label: string;
  readonly options: ReadonlyArray<SegmentOption<Value>>;
  readonly value: Value;
  readonly onChange: (value: Value) => void;
}

/** Switches between two to five views or modes of the same content. */
export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  const controlSize = useControlSize();
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const option = options.find((candidate) => keys.has(candidate.id));
        if (option !== undefined) onChange(option.id);
      }}
      {...stylex.props(styles.group, groupSizes[controlSize])}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <ToggleButton
            key={option.id}
            id={option.id}
            {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean }>((state) => [
              styles.segment,
              segmentSizes[controlSize],
              state.isSelected && styles.selected,
              state.isFocusVisible && styles.focused,
            ])}
          >
            {Icon ? <Icon aria-hidden {...stylex.props(styles.icon)} /> : null}
            {option.label}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

const styles = stylex.create({
  group: {
    display: "inline-flex",
    gap: "2px",
    padding: "2px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.subtle,
  },
  segment: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    whiteSpace: "nowrap",
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: "transparent",
    fontWeight: font.medium,
    color: { default: color.textMuted, ":hover": color.text },
    cursor: "pointer",
    outlineStyle: "none",
    transitionProperty: "background-color, color, box-shadow",
    transitionDuration: motion.fast,
  },
  selected: { backgroundColor: color.raised, color: color.text, boxShadow: shadow.sm },
  focused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  icon: { width: size.iconSm, height: size.iconSm },
});

// The group carries the height, so the control matches the other controls of its size even when the browser rounds the border width. The segments stretch inside the padding.
const groupSizes = stylex.create({
  sm: { height: size.controlSm },
  md: { height: size.controlMd },
});

const segmentSizes = stylex.create({
  sm: { paddingInline: space.sm, fontSize: font.sm },
  md: { paddingInline: space.md, fontSize: font.md },
});
