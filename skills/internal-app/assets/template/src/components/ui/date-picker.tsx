import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type CalendarDate, parseDate } from "@internationalized/date";
import {
  Radio,
  RadioGroup,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { space } from "@/styles/tokens.stylex";
import { CalendarButton, CalendarHeader, DateSegments, calendar } from "./calendar";
import {
  control,
  field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
} from "./field";
import { choice, chipSizes } from "./choice";
import { overlay } from "./overlay";
import { useControlSize } from "./control-size";

/** A date that people pick with one press, such as "Today" or "Fri". */
export interface DateQuickPick {
  /** ISO calendar date, "2026-10-10". */
  readonly value: string;
  readonly label: string;
  /** Quiet text after the label, such as the weekday after "Today". */
  readonly meta?: string;
}

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
  /** Adds a quiet "optional" to the label. Do not set it with `isRequired`. */
  readonly isOptional?: boolean;
  /** Control width from the expected length of the answer. See FieldWidth. The default is `sm`. */
  readonly width?: FieldWidth;
  /**
   * Visible chips for the dates that people pick most, such as the next
   * working days. The date input stays beside them for any other date.
   * Build day chips with `dayQuickPicks`.
   */
  readonly quickPicks?: ReadonlyArray<DateQuickPick>;
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
  isOptional = false,
  width = "sm",
  quickPicks = [],
  style,
  ...props
}: DatePickerProps) {
  const controlSize = useControlSize();
  if (isOptional && props.isRequired === true)
    throw new Error("DatePicker: a field cannot be both optional and required.");
  if (new Set(quickPicks.map((pick) => pick.value)).size !== quickPicks.length)
    throw new Error("DatePicker: two quick picks have the same date.");
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  const group = (
    <Group
      {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
        control.base,
        fieldWidth[width],
        controlSize === "sm" && control.compact,
        calendar.group,
        state.isInvalid && control.invalid,
        state.isDisabled && control.disabled,
      ])}
    >
      <DateSegments />
      <CalendarButton />
    </Group>
  );
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
      <FieldLabel isOptional={isOptional}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      {quickPicks.length === 0 ? (
        group
      ) : (
        <div {...stylex.props(styles.quickRow)}>
          <RadioGroup
            aria-label={label}
            orientation="horizontal"
            isDisabled={props.isDisabled}
            value={quickPicks.some((pick) => pick.value === value) ? value : null}
            onChange={onChange}
            {...stylex.props(choice.chips)}
          >
            {quickPicks.map((pick) => (
              <Radio key={pick.value} value={pick.value} {...stylex.props(choice.itemRoot)}>
                {({ isSelected, isFocusVisible, isDisabled }) => (
                  <span
                    {...stylex.props(
                      choice.chip,
                      chipSizes[controlSize],
                      choice.base,
                      isSelected && choice.selected,
                      isSelected && choice.chipSelected,
                      isInvalid && !isSelected && choice.invalid,
                      isFocusVisible && choice.focused,
                      isDisabled && choice.disabled,
                    )}
                  >
                    {pick.label}
                    {pick.meta === undefined ? null : (
                      <span {...stylex.props(choice.chipMeta)}>{pick.meta}</span>
                    )}
                  </span>
                )}
              </Radio>
            ))}
          </RadioGroup>
          {group}
        </div>
      )}
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
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

/**
 * Quick picks for the next days from `today` (an ISO date): "Today" and
 * "Tomorrow" with their weekday as meta, then weekday names. `skip` leaves out
 * days such as closed days. Weekday names repeat after a week, so at most six
 * days follow today.
 */
export function dayQuickPicks({
  today,
  count,
  skip = () => false,
}: {
  readonly today: string;
  readonly count: number;
  readonly skip?: (isoDate: string) => boolean;
}): ReadonlyArray<DateQuickPick> {
  if (count < 1) throw new Error("dayQuickPicks: count must be at least 1.");
  const start = parseDate(today);
  const picks: Array<DateQuickPick> = [];
  for (let offset = 0; offset < 7 && picks.length < count; offset += 1) {
    const date = start.add({ days: offset });
    const iso = date.toString();
    if (skip(iso)) continue;
    // A calendar date has no time of day, so it formats in UTC and never moves to the next day.
    const name = date.toDate("UTC").toLocaleDateString(appLocale, {
      weekday: "short",
      timeZone: "UTC",
    });
    if (offset === 0) picks.push({ value: iso, label: "Today", meta: name });
    else if (offset === 1) picks.push({ value: iso, label: "Tomorrow", meta: name });
    else picks.push({ value: iso, label: name });
  }
  if (picks.length < count)
    throw new Error(`dayQuickPicks: only ${picks.length} days in the next week are not skipped.`);
  return picks;
}

const styles = stylex.create({
  quickRow: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.sm },
});
