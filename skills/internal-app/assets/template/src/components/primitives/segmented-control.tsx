/**
 * A row of two to five segments that switch between views or modes of the same content.
 *
 * @layer primitive
 * @keywords segmented control, view switch, toggle view, mode switch, period switch, list or grid, tabs in a toolbar
 * @related Tabs, ToggleGroup, RadioGroup, Select, Layout
 * @notes form-choices, density, internal-app-composition
 *
 * Use it to change how a page shows the same content, such as a list or a
 * board, or a period of a chart. Do not use it for sections with different
 * content: use `Tabs`. Do not use it for an answer that a form submits: use a
 * `RadioGroup` with `appearance="chips"`. For more than five options, use
 * `Select`. For options that each turn on or off, use `ToggleGroup`.
 *
 * ## Behavior
 * The control does these things. Do not build them again:
 * - One segment is always selected. Arrow keys move between the segments.
 * - The height follows the control size of its row, so it has no `size` prop.
 *
 * ## Rules
 * - Keep the labels short. An `icon` adds to a label and never replaces it.
 * - Keep the view in the URL when people share it.
 *
 * ## Example
 * ```tsx
 * <SegmentedControl
 *   label="View"
 *   options={[
 *     { id: "list", label: "List", icon: List },
 *     { id: "board", label: "Board", icon: Columns3 },
 *   ]}
 *   value={view}
 *   onChange={setView}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { LucideIcon } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, motion, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { useControlSize } from "@/components/helpers/control-size";

export interface SegmentOption<Value extends string> {
  /** Stable id of the view. `value` and `onChange` use it. */
  readonly id: Value;
  /** Visible text of the segment. */
  readonly label: string;
  /** Lucide icon before the label. */
  readonly icon?: LucideIcon;
}

export interface SegmentedControlProps<Value extends string> {
  /** Accessible name for the group, such as "View" or "Period". */
  readonly label: string;
  /** Two to five segments, in the order that they show. */
  readonly options: ReadonlyArray<SegmentOption<Value>>;
  /** Id of the selected segment. */
  readonly value: Value;
  /** Receives the id of the segment that people select. */
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
