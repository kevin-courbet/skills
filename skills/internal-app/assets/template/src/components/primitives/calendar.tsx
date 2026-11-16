// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A month calendar on the page, for one date (`Calendar`) or a range of dates
 * (`RangeCalendar`), with a jump to any month and year.
 *
 * @layer primitive
 * @keywords calendar, inline calendar, month calendar, range calendar, pick a day, booking calendar, availability, unavailable dates, closed days, month and year jump, year picker
 * @related DatePicker, DateRangePicker, EventCalendar, Card, CalendarParts
 * @notes form-fields, internal-app-forms, internal-app-density, accessibility
 *
 * Use it when the month is the task, such as a page that books a visit on a
 * free day, and the calendar stays open next to other content. Do not use it
 * for a date in a form: use `DatePicker` or `DateRangePicker`, which keep the
 * calendar in a popover. To show events on days, use `EventCalendar`.
 *
 * ## Behavior
 * - The value is an ISO date string, or a `DateRange` of ISO dates.
 * - The week starts on the first day of the locale. The app locale starts it
 *   on Monday.
 * - The heading button opens a grid of years over the days. A year opens a
 *   grid of months, and a month goes back to the days with the focus on the
 *   grid. Arrow keys, Home, End, and Page Up and Page Down move in each grid.
 *   Enter or Space picks. Escape goes back to the month that was open.
 * - Dates before `minValue` or after `maxValue` cannot get the focus. Months
 *   outside the limits are disabled in the month grid. With both limits, the
 *   year grid shows each year between them.
 * - `unavailableReason` marks dates that people cannot pick, and a line under
 *   the grid shows the reason for the date under the pointer or the focus.
 *   Screen readers announce it.
 * - In `RangeCalendar`, the first press starts the range and the second press
 *   ends it. The jump keeps the start, so a range can cross months and years.
 * - Days and grids use the size tokens, so `Page density="touch"` makes them
 *   larger.
 *
 * ## Rules
 * - Give `label`, such as "Visit date". It names the calendar for screen
 *   readers, and the heading shows only the month.
 * - Give a reason in the words of the user, such as "Closed on public
 *   holidays". A struck date alone does not tell why.
 * - Put the calendar in a `Card` or a `CardSection`, and show the picked date
 *   in text next to it.
 *
 * ## Example
 * ```tsx
 * <Calendar
 *   label="Visit date"
 *   value={visitDate}
 *   onChange={setVisitDate}
 *   minValue={today}
 *   unavailableReason={(date) => (closedDays.has(date) ? "The depot is closed" : null)}
 * />
 * <RangeCalendar label="Leave" value={leave} onChange={setLeave} />
 * ```
 */
import type { StyleXStyles } from "@stylexjs/stylex";
import { parseDate } from "@internationalized/date";
import { CalendarView, RangeCalendarView } from "@/components/helpers/calendar-parts";
import type { DateRange } from "./date-range-picker";

interface CalendarBaseProps {
  /** Names the calendar for screen readers, such as "Visit date". */
  readonly label: string;
  /** Earliest ISO date that people can focus and pick. */
  readonly minValue?: string;
  /** Latest ISO date that people can focus and pick. */
  readonly maxValue?: string;
  /**
   * Returns why an ISO date is not available, such as "The depot is closed",
   * or null when people can pick it.
   */
  readonly unavailableReason?: (isoDate: string) => string | null;
  /** Turns off the whole calendar. */
  readonly isDisabled?: boolean;
  /** Shows the value, and people cannot change it. */
  readonly isReadOnly?: boolean;
  /** Moves the focus to the focused day on the first render. */
  readonly autoFocus?: boolean;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

export interface CalendarProps extends CalendarBaseProps {
  /** ISO calendar date, "2026-10-10", or null when no date is picked. */
  readonly value: string | null;
  /** Receives the ISO date that people pick. */
  readonly onChange: (value: string) => void;
}

export function Calendar({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  style,
  ...props
}: CalendarProps) {
  return (
    <CalendarView
      {...props}
      style={style}
      aria-label={label}
      value={value === null ? null : parseDate(value)}
      onChange={(next) => onChange(next.toString())}
      minValue={minValue === undefined ? undefined : parseDate(minValue)}
      maxValue={maxValue === undefined ? undefined : parseDate(maxValue)}
    />
  );
}

export interface RangeCalendarProps extends CalendarBaseProps {
  /** The range, or null when no range is picked. */
  readonly value: DateRange | null;
  /** Receives the range when people pick its last day. */
  readonly onChange: (value: DateRange) => void;
}

export function RangeCalendar({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  style,
  ...props
}: RangeCalendarProps) {
  return (
    <RangeCalendarView
      {...props}
      style={style}
      aria-label={label}
      value={value === null ? null : { start: parseDate(value.start), end: parseDate(value.end) }}
      onChange={(next) => onChange({ start: next.start.toString(), end: next.end.toString() })}
      minValue={minValue === undefined ? undefined : parseDate(minValue)}
      maxValue={maxValue === undefined ? undefined : parseDate(maxValue)}
    />
  );
}
