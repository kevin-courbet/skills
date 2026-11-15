// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A row of buttons that each turn one option on or off, and the change applies at once.
 *
 * @layer primitive
 * @keywords toggle group, toggle buttons, weekdays, days of the week, multiple toggles, log levels, filter toggles, pressed buttons
 * @related SegmentedControl, Checkbox, Switch, Layout, LogViewer
 * @notes form-choices, density, internal-app-forms, internal-app-composition
 *
 * Use it for several on and off options that apply at once, such as the days
 * that a job runs in a `SettingRow`, or the levels that a log shows in a
 * `Toolbar`. Do not use it for an answer that a form submits, because it has
 * no hint and no error: use `CheckboxGroup` with `appearance="chips"`. For one
 * choice among views, use `SegmentedControl`. For one setting, use `Switch`.
 *
 * ## Behavior
 * The group does these things. Do not build them again:
 * - Arrow keys move between the options, and Space toggles one.
 * - A pressed text option shows a check mark. An option with an `icon` shows
 *   the icon instead.
 * - The height follows the control size of its row, so it has no `size` prop.
 *
 * ## Rules
 * - Use `iconOnly` only for icons that people know, such as the log levels.
 *
 * ## Example
 * ```tsx
 * <ToggleGroup
 *   label="Run on days"
 *   options={weekdays}
 *   value={job.days}
 *   onChange={(days) => updateJob.mutate({ days })}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { Check, type LucideIcon } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";
import { useControlSize } from "@/components/helpers/control-size";

export interface ToggleOption<Value extends string> {
  readonly id: Value;
  /** Visible text. With `iconOnly`, it becomes the accessible name. */
  readonly label: string;
  /** Lucide icon before the label. It replaces the check mark of a pressed option. */
  readonly icon?: LucideIcon;
  /** Shows the option but people cannot press it. */
  readonly isDisabled?: boolean;
}

export interface ToggleGroupProps<Value extends string> {
  /** Names the group, such as "Run on days" or "Notify by". */
  readonly label: string;
  /** The options, in the order that they show. */
  readonly options: ReadonlyArray<ToggleOption<Value>>;
  /** Pressed options, in option order. */
  readonly value: ReadonlyArray<Value>;
  /** Receives the pressed options, in option order. Apply the change at once. */
  readonly onChange: (value: ReadonlyArray<Value>) => void;
  /** Shows only the icons; each label stays as the accessible name. */
  readonly iconOnly?: boolean;
  /** Disables all options. */
  readonly isDisabled?: boolean;
}

/**
 * Buttons that each turn an option on or off and apply at once, such as the
 * days a job runs in a SettingRow or the levels a log shows in a toolbar.
 * Arrow keys move between options and Space toggles one. It has no hint and
 * no error, so a form answer with several choices is a CheckboxGroup with
 * `appearance="chips"`. For one choice among views, use SegmentedControl.
 */
export function ToggleGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
  iconOnly = false,
  isDisabled,
}: ToggleGroupProps<Value>) {
  const controlSize = useControlSize();
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
                sizes[controlSize],
                iconOnly && squares[controlSize],
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
