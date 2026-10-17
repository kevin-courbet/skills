// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { parseTime, type Time } from "@internationalized/date";
import { Clock } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  FieldError,
  Group,
  type Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
} from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { DateSegments } from "./calendar";
import { control, field } from "./field";
import { overlay } from "./overlay";

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
  /**
   * Minutes between the choices in the popover: 5 offers :00, :05, and so on.
   * It must divide 60. Typed values keep any minute.
   */
  readonly minuteStep?: number;
  /** Time zone or place shown after the time, such as "UTC". */
  readonly zoneLabel?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/**
 * Time of day, such as a daily run time or a maintenance window start. Type
 * the digits or use the arrow keys on each part, or open the popover and pick
 * the hour and the minute from two columns. The value is an ISO time string,
 * so schemas and server functions never handle time objects.
 */
export function TimeField({
  label,
  hideLabel = false,
  value,
  onChange,
  minValue,
  maxValue,
  minuteStep = 5,
  zoneLabel,
  description,
  errorMessage,
  style,
  ...props
}: TimeFieldProps) {
  if (!Number.isInteger(minuteStep) || minuteStep < 1 || 60 % minuteStep !== 0)
    throw new Error(`TimeField: minuteStep ${minuteStep} must be a whole number that divides 60.`);
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  const groupRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const time = value === null ? null : parseTime(value);
  const min = minValue === undefined ? undefined : parseTime(minValue);
  const max = maxValue === undefined ? undefined : parseTime(maxValue);
  const commit = (next: Time) => onChange(toIsoTime(next, props.granularity));
  return (
    <AriaTimeField
      {...props}
      isInvalid={isInvalid}
      value={time}
      onChange={(next) => onChange(next === null ? null : toIsoTime(next, props.granularity))}
      minValue={min}
      maxValue={max}
      {...stylex.props(field.root, style)}
    >
      <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
      <Group
        ref={groupRef}
        isInvalid={isInvalid}
        isDisabled={props.isDisabled}
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          styles.box,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <DateSegments />
        {zoneLabel === undefined ? null : <span {...stylex.props(styles.zone)}>{zoneLabel}</span>}
        <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
          <Button
            aria-label={`Choose ${label.toLowerCase()}`}
            isDisabled={props.isDisabled === true || props.isReadOnly === true}
            {...renderStyles<{ isFocusVisible: boolean }>((state) => [
              styles.trigger,
              zoneLabel === undefined && styles.triggerEnd,
              state.isFocusVisible && styles.triggerFocused,
            ])}
          >
            <Clock aria-hidden {...stylex.props(styles.icon)} />
          </Button>
          <Popover
            triggerRef={groupRef}
            placement="bottom start"
            {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
              overlay.popover,
              state.isEntering && overlay.entering,
              state.isExiting && overlay.exiting,
            ])}
          >
            <Dialog aria-label={label} {...stylex.props(styles.dialog)}>
              <TimeColumns
                time={time}
                min={min}
                max={max}
                minuteStep={minuteStep}
                onHour={(hour) =>
                  commit(withinRange(timeOf(hour, time?.minute ?? 0, time?.second ?? 0), min, max))
                }
                onMinute={(minute) => {
                  commit(timeOf(time?.hour ?? firstHour(min), minute, time?.second ?? 0));
                  setOpen(false);
                }}
              />
            </Dialog>
          </Popover>
        </DialogTrigger>
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

/**
 * The hour and minute lists of the popover. The hour list takes focus with
 * the current hour; Tab moves to the minutes. Choosing a minute closes the
 * popover, so a keyboard user picks a time with arrows, Enter, Tab, and Enter.
 */
function TimeColumns({
  time,
  min,
  max,
  minuteStep,
  onHour,
  onMinute,
}: {
  readonly time: Time | null;
  readonly min: Time | undefined;
  readonly max: Time | undefined;
  readonly minuteStep: number;
  readonly onHour: (hour: number) => void;
  readonly onMinute: (minute: number) => void;
}) {
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const minutes = Array.from({ length: 60 / minuteStep }, (_, index) => index * minuteStep);
  const selectedHour = time?.hour ?? null;
  const hourForMinutes = selectedHour ?? firstHour(min);
  const disabledHours = hours.filter(
    (hour) => (min !== undefined && hour < min.hour) || (max !== undefined && hour > max.hour),
  );
  const disabledMinutes = minutes.filter((minute) => {
    const candidate = timeOf(hourForMinutes, minute, 0);
    return (
      (min !== undefined && candidate.compare(timeOf(min.hour, min.minute, 0)) < 0) ||
      (max !== undefined && candidate.compare(timeOf(max.hour, max.minute, 0)) > 0)
    );
  });

  // Open with the chosen hour and minute in the middle of their lists.
  useEffect(() => {
    for (const list of [hourListRef.current, minuteListRef.current]) {
      const option = list?.querySelector<HTMLElement>("[data-selected]");
      if (list === null || option === null || option === undefined) continue;
      list.scrollTop = option.offsetTop - list.clientHeight / 2 + option.offsetHeight / 2;
    }
  }, []);

  return (
    <div {...stylex.props(styles.columns)}>
      <TimeList
        listRef={hourListRef}
        label="Hour"
        autoFocus
        values={hours}
        selected={selectedHour}
        disabled={disabledHours}
        format={formatHour}
        onSelect={onHour}
      />
      <TimeList
        listRef={minuteListRef}
        label="Minute"
        values={minutes}
        selected={time !== null && time.minute % minuteStep === 0 ? time.minute : null}
        disabled={disabledMinutes}
        format={(minute) => String(minute).padStart(2, "0")}
        onSelect={onMinute}
      />
    </div>
  );
}

function TimeList({
  listRef,
  label,
  autoFocus = false,
  values,
  selected,
  disabled,
  format,
  onSelect,
}: {
  readonly listRef: RefObject<HTMLDivElement | null>;
  readonly label: string;
  readonly autoFocus?: boolean;
  readonly values: ReadonlyArray<number>;
  readonly selected: number | null;
  readonly disabled: ReadonlyArray<number>;
  readonly format: (value: number) => string;
  readonly onSelect: (value: number) => void;
}) {
  return (
    <div {...stylex.props(styles.column)}>
      <span aria-hidden {...stylex.props(styles.columnLabel)}>
        {label}
      </span>
      <ListBox
        ref={listRef}
        aria-label={label}
        autoFocus={autoFocus}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selected === null ? [] : [selected]}
        disabledKeys={disabled}
        onSelectionChange={(keys) => {
          if (keys === "all") return;
          const key: Key | undefined = keys.values().next().value;
          if (key !== undefined) onSelect(Number(key));
        }}
        {...stylex.props(styles.list)}
      >
        {values.map((value) => (
          <ListBoxItem
            key={value}
            id={value}
            textValue={format(value)}
            {...renderStyles<{
              isFocused: boolean;
              isFocusVisible: boolean;
              isSelected: boolean;
              isDisabled: boolean;
            }>((state) => [
              styles.option,
              state.isFocused && styles.optionFocused,
              state.isSelected && styles.optionSelected,
              state.isDisabled && styles.optionDisabled,
              state.isFocusVisible && styles.optionFocusVisible,
            ])}
          >
            {format(value)}
          </ListBoxItem>
        ))}
      </ListBox>
    </div>
  );
}

function timeOf(hour: number, minute: number, second: number): Time {
  return parseTime(
    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`,
  );
}

function firstHour(min: Time | undefined): number {
  return min?.hour ?? 0;
}

/** Keeps a picked hour inside the allowed range by moving its minutes to the nearest bound. */
function withinRange(time: Time, min: Time | undefined, max: Time | undefined): Time {
  if (min !== undefined && time.compare(min) < 0) return min;
  if (max !== undefined && time.compare(max) > 0) return max;
  return time;
}

function formatHour(hour: number): string {
  return new Date(Date.UTC(2026, 0, 1, hour)).toLocaleTimeString(appLocale, {
    hour: "2-digit",
    timeZone: "UTC",
  });
}

function toIsoTime(time: Time, granularity: AriaTimeFieldProps<Time>["granularity"]): string {
  const text = time.toString();
  return granularity === "second" ? text.slice(0, 8) : text.slice(0, 5);
}

const styles = stylex.create({
  box: { gap: space.sm, width: "auto", minWidth: "8rem", paddingInlineEnd: "2px" },
  icon: { width: size.icon, height: size.icon, flexShrink: 0 },
  zone: { marginInlineStart: "auto", paddingInlineStart: space.sm, color: color.textMuted },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.75rem",
    flexShrink: 0,
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: { default: color.textMuted, ":hover": color.text },
    cursor: "pointer",
    outlineStyle: "none",
  },
  triggerEnd: { marginInlineStart: "auto" },
  triggerFocused: { outlineStyle: "solid", outlineWidth: "2px", outlineColor: color.focus },
  dialog: { padding: space.xs, outlineStyle: "none" },
  columns: { display: "flex", gap: space.xs },
  column: { display: "flex", flexDirection: "column", gap: space.xs, width: "4.5rem" },
  columnLabel: {
    textAlign: "center",
    paddingInline: space.sm,
    paddingTop: space.xs,
    fontSize: font.xs,
    fontWeight: font.medium,
    color: color.textMuted,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    maxHeight: "13.5rem",
    overflowY: "auto",
    outlineStyle: "none",
    scrollbarWidth: "thin",
  },
  option: {
    flexShrink: 0,
    paddingBlock: "0.3125rem",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    fontSize: font.md,
    fontVariantNumeric: "tabular-nums",
    textAlign: "center",
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
  },
  optionFocused: { backgroundColor: color.subtle },
  optionSelected: { backgroundColor: color.accent, color: color.onAccent, fontWeight: font.medium },
  optionDisabled: { color: color.textFaint },
  optionFocusVisible: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
});
