import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type CalendarDate, parseDate } from "@internationalized/date";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  Dialog,
  FieldError,
  Group,
  Label,
  Popover,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { CalendarButton, CalendarHeader, DateSegments, calendar } from "./calendar";
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
          calendar.group,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <DateSegments />
        <CalendarButton />
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
        <Dialog {...stylex.props(calendar.dialog)}>
          <Calendar {...stylex.props(calendar.calendar)}>
            <CalendarHeader />
            <CalendarGrid {...stylex.props(calendar.grid)}>
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
                    calendar.cell,
                    state.isOutsideMonth && calendar.outside,
                    state.isSelected && calendar.selected,
                    state.isFocusVisible && calendar.cellFocused,
                    (state.isDisabled || state.isUnavailable) && calendar.unavailable,
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
