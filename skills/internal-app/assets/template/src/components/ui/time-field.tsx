// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { parseTime, type Time } from "@internationalized/date";
import { Clock } from "lucide-react";
import {
  FieldError,
  Group,
  Label,
  Text,
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, size, space } from "@/styles/tokens.stylex";
import { DateSegments } from "./calendar";
import { control, field } from "./field";

export interface TimeFieldProps extends Omit<
  AriaTimeFieldProps<Time>,
  | "className"
  | "style"
  | "children"
  | "value"
  | "defaultValue"
  | "onChange"
  | "minValue"
  | "maxValue"
> {
  readonly label: string;
  /** Hide the visible label where a SettingRow names the field. Screen readers keep it. */
  readonly hideLabel?: boolean;
  /** Time of day as "HH:mm" or "HH:mm:ss", or null when empty. */
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  /** Earliest allowed time, such as "08:30". Earlier times show as invalid. */
  readonly minValue?: string;
  readonly maxValue?: string;
  /** Time zone or place shown after the time, such as "UTC". */
  readonly zoneLabel?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/**
 * Time of day, such as a daily run time or a maintenance window start. Type
 * the digits or use the arrow keys on each part. The value is an ISO time
 * string, so schemas and server functions never handle time objects.
 */
export function TimeField({
  label,
  hideLabel = false,
  value,
  onChange,
  minValue,
  maxValue,
  zoneLabel,
  description,
  errorMessage,
  style,
  ...props
}: TimeFieldProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaTimeField
      {...props}
      isInvalid={isInvalid}
      value={value === null ? null : parseTime(value)}
      onChange={(next) => onChange(next === null ? null : toIsoTime(next, props.granularity))}
      minValue={minValue === undefined ? undefined : parseTime(minValue)}
      maxValue={maxValue === undefined ? undefined : parseTime(maxValue)}
      {...stylex.props(field.root, style)}
    >
      <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
      <Group
        isInvalid={isInvalid}
        isDisabled={props.isDisabled}
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          styles.box,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <Clock aria-hidden {...stylex.props(styles.icon)} />
        <DateSegments />
        {zoneLabel === undefined ? null : <span {...stylex.props(styles.zone)}>{zoneLabel}</span>}
      </Group>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}

function toIsoTime(time: Time, granularity: AriaTimeFieldProps<Time>["granularity"]): string {
  const text = time.toString();
  return granularity === "second" ? text.slice(0, 8) : text.slice(0, 5);
}

const styles = stylex.create({
  box: { gap: space.sm, width: "auto", minWidth: "8rem" },
  icon: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
  zone: { marginInlineStart: "auto", paddingInlineStart: space.sm, color: color.textMuted },
});
