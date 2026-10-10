import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type CalendarDate, parseDate } from "@internationalized/date";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { control, field } from "./field";
import { overlay } from "./overlay";

export interface DatePickerProps extends Omit<
  AriaDatePickerProps<CalendarDate>,
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
  /** ISO calendar date, "2026-10-10", or null when empty. */
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  readonly minValue?: string;
  readonly maxValue?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/**
 * Calendar date field. Values are ISO date strings so schemas and server
 * functions never handle calendar objects. Segments follow the provider locale.
 */
export function DatePicker({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  description,
  errorMessage,
  style,
  ...props
}: DatePickerProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaDatePicker
      {...props}
      isInvalid={isInvalid}
      value={value === null ? null : parseDate(value)}
      onChange={(next) => onChange(next === null ? null : next.toString())}
      minValue={minValue === undefined ? undefined : parseDate(minValue)}
      maxValue={maxValue === undefined ? undefined : parseDate(maxValue)}
      {...stylex.props(field.root, style)}
    >
      <Label {...stylex.props(field.label)}>{label}</Label>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          styles.group,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <DateInput {...stylex.props(styles.input)}>
          {(segment) => (
            <DateSegment
              segment={segment}
              {...renderStyles<{ isPlaceholder: boolean; isFocused: boolean }>((state) => [
                styles.segment,
                state.isPlaceholder && styles.placeholder,
                state.isFocused && styles.segmentFocused,
              ])}
            />
          )}
        </DateInput>
        <Button aria-label="Open calendar" {...stylex.props(styles.button)}>
          <CalendarDays aria-hidden {...stylex.props(styles.icon)} />
        </Button>
      </Group>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
      <Popover
        placement="bottom end"
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          overlay.popover,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
        <Dialog {...stylex.props(styles.dialog)}>
          <Calendar {...stylex.props(styles.calendar)}>
            <header {...stylex.props(styles.header)}>
              <Button slot="previous" aria-label="Previous month" {...stylex.props(styles.nav)}>
                <ChevronLeft aria-hidden {...stylex.props(styles.icon)} />
              </Button>
              <Heading {...stylex.props(styles.heading)} />
              <Button slot="next" aria-label="Next month" {...stylex.props(styles.nav)}>
                <ChevronRight aria-hidden {...stylex.props(styles.icon)} />
              </Button>
            </header>
            <CalendarGrid {...stylex.props(styles.grid)}>
              {(date) => (
                <CalendarCell
                  date={date}
                  {...renderStyles<{
                    isSelected: boolean;
                    isFocusVisible: boolean;
                    isOutsideMonth: boolean;
                    isDisabled: boolean;
                    isUnavailable: boolean;
                  }>((state) => [
                    styles.cell,
                    state.isOutsideMonth && styles.outside,
                    state.isSelected && styles.selected,
                    state.isFocusVisible && styles.cellFocused,
                    (state.isDisabled || state.isUnavailable) && styles.unavailable,
                  ])}
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}

const styles = stylex.create({
  group: { gap: space.xs, paddingInlineEnd: "2px" },
  input: {
    display: "flex",
    alignItems: "center",
    flex: "1",
    minWidth: 0,
    fontVariantNumeric: "tabular-nums",
  },
  segment: {
    paddingInline: "1px",
    borderRadius: "0.1875rem",
    outlineStyle: "none",
    color: color.text,
  },
  placeholder: { color: color.textFaint },
  segmentFocused: { backgroundColor: color.accent, color: color.onAccent },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.625rem",
    flexShrink: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.textMuted,
    cursor: "pointer",
  },
  icon: { width: size.icon, height: size.icon },
  dialog: { padding: space.md, outlineStyle: "none" },
  calendar: { display: "flex", flexDirection: "column", gap: space.sm },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.sm },
  heading: { fontSize: font.md, fontWeight: font.semibold, margin: 0 },
  nav: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.controlSm,
    height: size.controlSm,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.text,
    cursor: "pointer",
  },
  grid: { borderCollapse: "collapse", fontSize: font.sm, color: color.textMuted },
  cell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: radius.md,
    fontSize: font.md,
    color: color.text,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
    outlineStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  outside: { color: color.textFaint },
  selected: {
    backgroundColor: { default: color.accent, ":hover": color.accentHover },
    color: color.onAccent,
  },
  cellFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  unavailable: { color: color.textFaint, textDecoration: "line-through", cursor: "not-allowed" },
});
