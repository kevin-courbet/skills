import * as stylex from "@stylexjs/stylex";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarDate } from "@internationalized/date";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Heading,
  RangeCalendar,
  type RangeCalendarProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";

/**
 * Shared parts of DatePicker and DateRangePicker: the segmented date input,
 * the calendar button, the month header, and the calendar cell styles.
 */
export function DateSegments({ slot }: { readonly slot?: "start" | "end" }) {
  return (
    <DateInput slot={slot} {...stylex.props(calendar.input)}>
      {(segment) => (
        <DateSegment
          segment={segment}
          {...renderStyles<{ isPlaceholder: boolean; isFocused: boolean }>((state) => [
            calendar.segment,
            state.isPlaceholder && calendar.placeholder,
            state.isFocused && calendar.segmentFocused,
          ])}
        />
      )}
    </DateInput>
  );
}

export function CalendarButton() {
  return (
    <Button aria-label="Open calendar" {...stylex.props(calendar.button)}>
      <CalendarDays aria-hidden {...stylex.props(calendar.icon)} />
    </Button>
  );
}

export function CalendarHeader() {
  return (
    <header {...stylex.props(calendar.header)}>
      <Button slot="previous" aria-label="Previous month" {...stylex.props(calendar.nav)}>
        <ChevronLeft aria-hidden {...stylex.props(calendar.icon)} />
      </Button>
      <Heading {...stylex.props(calendar.heading)} />
      <Button slot="next" aria-label="Next month" {...stylex.props(calendar.nav)}>
        <ChevronRight aria-hidden {...stylex.props(calendar.icon)} />
      </Button>
    </header>
  );
}

/**
 * Month grid for a date range. Inside DateRangePicker it reads the picker
 * state; on its own it takes `value` and `onChange`, as in the Filters editor.
 */
export function RangeCalendarView(
  props: Omit<RangeCalendarProps<CalendarDate>, "className" | "style" | "children">,
) {
  return (
    <RangeCalendar {...props} {...stylex.props(calendar.calendar)}>
      <CalendarHeader />
      <CalendarGrid {...stylex.props(calendar.grid)}>
        {(date) => (
          <CalendarCell
            date={date}
            {...renderStyles<{
              isSelected: boolean;
              isSelectionStart: boolean;
              isSelectionEnd: boolean;
              isFocusVisible: boolean;
              isOutsideMonth: boolean;
              isDisabled: boolean;
              isUnavailable: boolean;
            }>((state) => [
              calendar.cell,
              state.isOutsideMonth && calendar.outside,
              state.isSelected && calendar.inRange,
              (state.isSelectionStart || state.isSelectionEnd) && calendar.selected,
              state.isSelectionStart && calendar.rangeStart,
              state.isSelectionEnd && calendar.rangeEnd,
              state.isFocusVisible && calendar.cellFocused,
              (state.isDisabled || state.isUnavailable) && calendar.unavailable,
            ])}
          />
        )}
      </CalendarGrid>
    </RangeCalendar>
  );
}

export const calendar = stylex.create({
  group: { gap: space.xs, paddingInlineEnd: "2px" },
  input: {
    display: "flex",
    alignItems: "center",
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
    marginInlineStart: "auto",
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
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
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
  /** Days between the start and the end of a range. */
  inRange: {
    borderRadius: 0,
    backgroundColor: { default: color.accentMuted, ":hover": color.accentMuted },
    color: color.accentText,
  },
  rangeStart: { borderStartStartRadius: radius.md, borderEndStartRadius: radius.md },
  rangeEnd: { borderStartEndRadius: radius.md, borderEndEndRadius: radius.md },
  cellFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  unavailable: { color: color.textFaint, textDecoration: "line-through", cursor: "not-allowed" },
});
