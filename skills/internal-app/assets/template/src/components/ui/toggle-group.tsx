// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import { Check, type LucideIcon } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

export interface ToggleOption<Value extends string> {
  readonly id: Value;
  /** Visible text. With `iconOnly`, it becomes the accessible name. */
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly isDisabled?: boolean;
}

export interface ToggleGroupProps<Value extends string> {
  /** Names the group, such as "Run on days" or "Notify by". */
  readonly label: string;
  readonly options: ReadonlyArray<ToggleOption<Value>>;
  /** Pressed options, in option order. */
  readonly value: ReadonlyArray<Value>;
  readonly onChange: (value: ReadonlyArray<Value>) => void;
  /** Shows only the icons; each label stays as the accessible name. */
  readonly iconOnly?: boolean;
  /** `sm` matches the 28px controls of a compact toolbar. */
  readonly size?: "sm" | "md";
  readonly isDisabled?: boolean;
}

/**
 * Buttons that each turn an option on or off, such as the days a job runs or
 * the channels that get an alert. Arrow keys move between options and Space
 * toggles one. For one choice among views, use SegmentedControl.
 */
export function ToggleGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
  iconOnly = false,
  size: sizeKey = "md",
  isDisabled,
}: ToggleGroupProps<Value>) {
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="multiple"
      selectedKeys={value}
      isDisabled={isDisabled}
      onSelectionChange={(keys) =>
        onChange(options.filter((option) => keys.has(option.id)).map((option) => option.id))
      }
      {...stylex.props(styles.group)}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <ToggleButton
            key={option.id}
            id={option.id}
            isDisabled={option.isDisabled}
            aria-label={iconOnly ? option.label : undefined}
            {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean; isDisabled: boolean }>(
              (state) => [
                styles.toggle,
                sizes[sizeKey],
                iconOnly && squares[sizeKey],
                state.isSelected && styles.selected,
                state.isFocusVisible && styles.focused,
                state.isDisabled && styles.disabled,
              ],
            )}
          >
            {({ isSelected }) => (
              <>
                {Icon === undefined && !iconOnly && isSelected ? (
                  <Check aria-hidden {...stylex.props(styles.icon)} />
                ) : null}
                {Icon === undefined ? null : <Icon aria-hidden {...stylex.props(styles.icon)} />}
                {iconOnly ? null : option.label}
              </>
            )}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

const styles = stylex.create({
  group: { display: "inline-flex", flexWrap: "wrap", gap: space.xs },
  toggle: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    whiteSpace: "nowrap",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: { default: color.raised, ":hover": color.subtle },
    fontWeight: font.medium,
    color: color.textMuted,
    cursor: "pointer",
    outlineStyle: "none",
    transitionProperty: "background-color, border-color, color",
    transitionDuration: motion.fast,
  },
  selected: {
    backgroundColor: { default: color.accentMuted, ":hover": color.accentMuted },
    borderColor: color.accentBorder,
    color: color.accentText,
  },
  focused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  disabled: { opacity: "0.5", cursor: "not-allowed" },
  icon: { width: size.iconSm, height: size.iconSm },
});

const sizes = stylex.create({
  sm: { height: size.controlSm, paddingInline: space.sm, fontSize: font.sm },
  md: { height: size.controlMd, paddingInline: space.md, fontSize: font.md },
});

const squares = stylex.create({
  sm: { width: size.controlSm, paddingInline: 0 },
  md: { width: size.controlMd, paddingInline: 0 },
});
