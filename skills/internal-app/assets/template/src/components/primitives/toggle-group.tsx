// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A row of buttons that each turn one option on or off, and the change applies at once.
 *
 * @layer primitive
 * @keywords toggle group, toggle buttons, weekdays, days of the week, multiple toggles, log levels, filter toggles, pressed buttons
 * @related ToggleButton, SegmentedControl, Checkbox, Switch, Layout, LogViewer
 * @notes form-choices, density, internal-app-forms, internal-app-composition
 *
 * Use it for several on and off options that apply at once, such as the days
 * that a job runs in a `SettingRow`, or the levels that a log shows in a
 * `Toolbar`. Do not use it for an answer that a form submits, because it has
 * no hint and no error: use `CheckboxGroup` with `appearance="chips"`. For one
 * choice among views, use `SegmentedControl`. For one setting, use `Switch`.
 * For one option alone, use `ToggleButton`.
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
import type { LucideIcon } from "lucide-react";
import { ToggleButtonGroup } from "react-aria-components";
import { space } from "@/styles/tokens.stylex";
import { ToggleButton } from "./toggle-button";

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
  /** Shows only the icons; each label stays as the accessible name. Each option needs an `icon`. */
  readonly iconOnly?: boolean;
  /** Disables all options. */
  readonly isDisabled?: boolean;
}

export function ToggleGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
  iconOnly = false,
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
      {options.map((option) => (
        <ToggleButton
          key={option.id}
          id={option.id}
          label={option.label}
          icon={option.icon}
          iconOnly={iconOnly}
          isDisabled={option.isDisabled}
        />
      ))}
    </ToggleButtonGroup>
  );
}

const styles = stylex.create({
  group: { display: "inline-flex", flexWrap: "wrap", gap: space.xs },
});
