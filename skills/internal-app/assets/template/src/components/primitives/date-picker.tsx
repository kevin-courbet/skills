/**
 * A calendar date field with typed parts, a calendar popover, and optional day
 * chips.
 *
 * @layer primitive
 * @keywords date picker, date field, calendar date, due date, pick a date, date input, today and tomorrow, quick picks, day chips
 * @related DateRangePicker, TimeField, EventCalendar, Calendar, RadioGroup, FormLayout
 * @notes form-choices, form-fields, internal-app-forms
 *
 * Use it for one calendar date. Do not use it for a period: use
 * `DateRangePicker`. For a time of day, use `TimeField`. To show many dated
 * events, use `EventCalendar`.
 *
 * ## Behavior
 * - The parts of the date follow the locale. People type the digits or open the
 *   calendar button.
 * - The value is an ISO date string, so that schemas and server functions never
 *   handle calendar objects.
 * - With `quickPicks`, a row of chips comes before the date input. Arrow keys
 *   move through the chips, and Tab moves on to the input.
 *
 * ## Rules
 * - Give `quickPicks` when the date is usually in the next few days. Build them
 *   with `dayQuickPicks({ today, count, skip })`: "Today" and "Tomorrow" with
 *   the weekday as meta, then weekday names, at most a week ahead. `skip`
 *   leaves out days such as weekends.
 * - Pass `today` from the loader, so that the server and the browser show the
 *   same chips.
 * - Two quick picks with the same date throw an error. `dayQuickPicks` throws
 *   when `skip` leaves fewer than `count` days in the next week.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <DatePicker
 *   label="Visit date"
 *   quickPicks={dayQuickPicks({ today, count: 4, skip: isWeekend })}
 *   value={visitDate}
 *   onChange={setVisitDate}
 * />
 * ```
 */
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
import {
  CalendarButton,
  CalendarHeader,
  DateSegments,
  calendar,
} from "@/components/helpers/calendar";
import {
  control,
  field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
} from "@/components/helpers/field";
import { choice, chipSizes } from "@/components/helpers/choice";
import { overlay } from "@/components/helpers/overlay";
import { useControlSize } from "@/components/helpers/control-size";
import { useOverlayDensity } from "@/components/helpers/density";

/** A date that people pick with one press, such as "Today" or "Fri". */
export interface DateQuickPick {
  /** ISO calendar date, "2026-10-10". */
  readonly value: string;
  /** Visible text of the chip, such as "Today" or "Fri". */
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
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** ISO calendar date, "2026-10-10", or null when empty. */
  readonly value: string | null;
  /** Receives the ISO date, or null when people clear the field. */
  readonly onChange: (value: string | null) => void;
  /** Earliest allowed ISO date. Earlier dates are not available. */
  readonly minValue?: string;
  /** Latest allowed ISO date. Later dates are not available. */
  readonly maxValue?: string;
  /** Hint between the label and the control, such as the format or where the answer goes. */
  readonly description?: string;
  /** Error text under the field. It also marks the field invalid. */
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
  /** StyleX styles for the root, such as a margin from the parent layout. */
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
  const overlayDensity = useOverlayDensity();
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
          ...overlayDensity,
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
