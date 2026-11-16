// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * The shared parts of Calendar, RangeCalendar, DatePicker, DateRangePicker,
 * TimeField, and the date editor of Filters: the typed date segments, the
 * calendar button, the month views, and the month and year jump.
 *
 * @layer helper
 * @keywords calendar parts, date segments, calendar button, month view, range calendar view, month and year jump, year grid, month grid, unavailable reason, calendar styles
 * @related Calendar, DatePicker, DateRangePicker, Filters, TimeField
 * @notes kit-adding-a-component, kit-density, kit-motion
 *
 * Do not use these parts on a page: use `Calendar`, `RangeCalendar`,
 * `DatePicker`, or `DateRangePicker`. For a calendar of events, use
 * `EventCalendar`.
 *
 * ## Behavior
 * - `DateSegments` renders the parts of a date that people type, in the order
 *   of the locale.
 * - `CalendarButton` opens the popover. Its accessible name is "Open calendar".
 * - `CalendarView` and `RangeCalendarView` show one month. Inside a react-aria
 *   date picker they read its state. On their own, they take `value` and
 *   `onChange`, as in the `Filters` editor.
 * - The week starts on the first day of the locale.
 * - The month heading is a button. It opens a grid of years over the days.
 *   A year opens a grid of months, and a month goes back to the days of that
 *   month with the focus on the day grid. The heading closes the grids and
 *   keeps the year. Escape closes the grids and goes back to the month that
 *   was open before.
 * - With `unavailableReason`, a line under the grid gives the reason for the
 *   unavailable date under the pointer or the focus. Screen readers announce
 *   the line.
 * - Days, the jump grids, and the buttons use the size tokens, so touch
 *   density makes them larger.
 *
 * ## Rules
 * - Use the parts in a new kit date field, inside a react-aria date picker.
 *   `calendar` holds the shared styles of the field.
 *
 * ## Example
 * ```tsx
 * <Group {...stylex.props(control.base, calendar.group)}>
 *   <DateSegments />
 *   <CalendarButton />
 * </Group>
 * <Popover>
 *   <Dialog {...stylex.props(calendar.dialog)}>
 *     <CalendarView />
 *   </Dialog>
 * </Popover>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type CalendarDate,
  DateFormatter,
  endOfMonth,
  getWeeksInMonth,
  startOfMonth,
  toCalendarDate,
} from "@internationalized/date";
import {
  type ContextType,
  type ReactNode,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Button,
  ButtonContext,
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarMonthPicker,
  type CalendarProps as AriaCalendarProps,
  CalendarStateContext,
  CalendarYearPicker,
  DateInput,
  DateSegment,
  type Key,
  ListBox,
  ListBoxItem,
  Provider,
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  RangeCalendarStateContext,
  useLocale,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";

export function DateSegments({
  slot,
}: {
  /** The date of a range that this input edits. Leave it out for one date. */
  readonly slot?: "start" | "end";
}) {
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

interface MonthViewProps {
  /**
   * Returns why an ISO date is not available, such as "Closed on public
   * holidays", or null when people can pick it. The reason shows under the
   * grid for the date under the pointer or the focus.
   */
  readonly unavailableReason?: (isoDate: string) => string | null;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

type ViewProps<P> = Omit<P, "className" | "style" | "children" | "isDateUnavailable"> &
  MonthViewProps;

/** One month for one date. Inside a react-aria `DatePicker`, it reads the state of the picker. */
export function CalendarView({
  unavailableReason,
  style,
  ...props
}: ViewProps<AriaCalendarProps<CalendarDate>>) {
  return (
    <AriaCalendar
      {...props}
      {...unavailableProps(unavailableReason)}
      {...stylex.props(calendar.calendar, style)}
    >
      <MonthBody unavailableReason={unavailableReason} isRange={false} />
    </AriaCalendar>
  );
}

/** One month for a range. Inside a react-aria `DateRangePicker`, it reads the state of the picker. */
export function RangeCalendarView({
  unavailableReason,
  style,
  ...props
}: ViewProps<AriaRangeCalendarProps<CalendarDate>>) {
  return (
    <AriaRangeCalendar
      {...props}
      {...unavailableProps(unavailableReason)}
      {...stylex.props(calendar.calendar, style)}
    >
      <MonthBody unavailableReason={unavailableReason} isRange />
    </AriaRangeCalendar>
  );
}

// An empty object keeps the `isDateUnavailable` of a date picker around the view.
function unavailableProps(unavailableReason: MonthViewProps["unavailableReason"]) {
  if (unavailableReason === undefined) return {};
  return {
    isDateUnavailable: (date: { toString(): string }) =>
      unavailableReason(date.toString()) !== null,
  };
}

type CalendarState =
  | NonNullable<ContextType<typeof CalendarStateContext>>
  | NonNullable<ContextType<typeof RangeCalendarStateContext>>;

function useCalendarState(): CalendarState {
  const single = useContext(CalendarStateContext);
  const range = useContext(RangeCalendarStateContext);
  const state = single ?? range;
  if (state === null)
    throw new Error(
      "CalendarParts: a month view must be inside a react-aria Calendar or RangeCalendar.",
    );
  return state;
}

type JumpStep = "year" | "month";

// The year grid has four columns. Without both limits, it shows six rows
// around the focused year. With both limits, it shows every year between
// them, up to this many.
const DEFAULT_YEARS = 24;
const MAX_YEARS = 200;

function MonthBody({ unavailableReason, isRange }: MonthViewProps & { readonly isRange: boolean }) {
  const state = useCalendarState();
  const { locale } = useLocale();
  const [step, setStep] = useState<JumpStep | null>(null);
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [hovered, setHovered] = useState<CalendarDate | null>(null);
  const headingRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const title = useMemo(
    () =>
      new DateFormatter(locale, {
        month: "long",
        year: "numeric",
        timeZone: state.timeZone,
      }).format(state.visibleRange.start.toDate(state.timeZone)),
    [locale, state.timeZone, state.visibleRange.start],
  );
  const dayFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: state.timeZone,
      }),
    [locale, state.timeZone],
  );

  const open = () => {
    setStartDate(state.focusedDate);
    setStep("year");
  };
  const close = () => setStep(null);
  const cancel = () => {
    if (startDate !== null) state.setFocusedDate(startDate);
    setStep(null);
    headingRef.current?.focus();
  };
  const finish = () => {
    setStep(null);
    // A cell focuses itself when the calendar has the focus and the cell holds the focused date.
    state.setFocused(true);
  };
  const onPanelEscape = useEffectEvent(cancel);
  const isOpen = step !== null;
  const isHydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  useEffect(() => {
    const panel = panelRef.current;
    if (!isOpen || panel === null) return;
    // The popover of a date picker closes on Escape in a React handler at the
    // root. A native listener on the panel runs first, so the grids close and
    // the popover stays open.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();
      onPanelEscape();
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const reasonDate = hovered ?? (state.isFocused ? state.focusedDate : null);
  const reason =
    unavailableReason !== undefined && reasonDate !== null && state.isCellUnavailable(reasonDate)
      ? unavailableReason(reasonDate.toString())
      : null;

  return (
    <>
      <header {...stylex.props(calendar.header)}>
        <span {...stylex.props(step !== null && calendar.hidden)}>
          <Button slot="previous" aria-label="Previous month" {...stylex.props(calendar.nav)}>
            <ChevronLeft aria-hidden {...stylex.props(calendar.icon)} />
          </Button>
        </span>
        <Provider values={[[ButtonContext, null]]}>
          <Button
            ref={headingRef}
            aria-expanded={step !== null}
            aria-label={`${title}, choose a month and a year`}
            onPress={() => (step === null ? open() : close())}
            {...stylex.props(calendar.heading)}
          >
            {title}
            <ChevronDown
              aria-hidden
              {...stylex.props(calendar.headingIcon, step !== null && calendar.headingIconOpen)}
            />
          </Button>
        </Provider>
        <span {...stylex.props(step !== null && calendar.hidden)}>
          <Button slot="next" aria-label="Next month" {...stylex.props(calendar.nav)}>
            <ChevronRight aria-hidden {...stylex.props(calendar.icon)} />
          </Button>
        </span>
      </header>
      <div {...stylex.props(calendar.stage)}>
        {isHydrated ? (
          <CalendarGrid {...stylex.props(calendar.grid, step !== null && calendar.hidden)}>
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
                }>((cell) => [
                  calendar.cell,
                  cell.isOutsideMonth && calendar.outside,
                  isRange && cell.isSelected && calendar.inRange,
                  (isRange ? cell.isSelectionStart || cell.isSelectionEnd : cell.isSelected) &&
                    calendar.selected,
                  isRange && cell.isSelectionStart && calendar.rangeStart,
                  isRange && cell.isSelectionEnd && calendar.rangeEnd,
                  cell.isFocusVisible && calendar.cellFocused,
                  // react-aria also disables the days of the next and the previous month, which only look faint.
                  !cell.isOutsideMonth &&
                    (cell.isDisabled || cell.isUnavailable) &&
                    calendar.unavailable,
                ])}
              >
                {({ formattedDate, isUnavailable }) =>
                  isUnavailable && unavailableReason !== undefined ? (
                    // react-aria turns off hover on an unavailable cell, so this span reports the pointer.
                    <span
                      onPointerEnter={() => setHovered(date)}
                      onPointerLeave={() => setHovered(null)}
                      {...stylex.props(calendar.cellHit)}
                    >
                      {formattedDate}
                    </span>
                  ) : (
                    formattedDate
                  )
                }
              </CalendarCell>
            )}
          </CalendarGrid>
        ) : (
          <GridPlaceholder weeks={getWeeksInMonth(state.visibleRange.start, locale)} />
        )}
        {step === null ? null : (
          <div ref={panelRef} {...stylex.props(calendar.panel)}>
            {step === "year" ? (
              <YearGrid onPick={() => setStep("month")} />
            ) : (
              <MonthGrid onPick={finish} />
            )}
          </div>
        )}
      </div>
      {unavailableReason === undefined ? null : (
        <p role="status" {...stylex.props(calendar.reason)}>
          {reason === null || reasonDate === null
            ? null
            : `${dayFormatter.format(reasonDate.toDate(state.timeZone))}: ${reason}`}
        </p>
      )}
    </>
  );
}

function subscribeToNothing(): () => void {
  return () => {};
}

// The server and the browser can format the long dates in the names of the
// cells differently, and then the hydration fails. The server renders this
// empty grid of the same size, and the browser renders the days.
function GridPlaceholder({ weeks }: { readonly weeks: number }) {
  const columns = Array.from({ length: 7 }, (_, index) => index);
  return (
    <table aria-hidden cellPadding={0} {...stylex.props(calendar.grid)}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{"\u00a0"}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: weeks }, (_, week) => (
          <tr key={week}>
            {columns.map((column) => (
              <td key={column}>
                <div {...stylex.props(calendar.cell)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface StepProps {
  readonly onPick: () => void;
}

function YearGrid({ onPick }: StepProps) {
  const state = useCalendarState();
  const visibleYears =
    state.minValue != null && state.maxValue != null
      ? Math.min(MAX_YEARS, state.maxValue.year - state.minValue.year + 1)
      : DEFAULT_YEARS;
  return (
    <CalendarYearPicker visibleYears={visibleYears}>
      {(picker) => (
        <JumpGrid
          label={picker["aria-label"]}
          columns="years"
          items={picker.items.map((item) => ({ id: item.id, text: item.formatted }))}
          current={picker.value}
          disabledKeys={[]}
          onPick={(key) => {
            const item = picker.items.find((candidate) => candidate.id === key);
            if (item === undefined)
              throw new Error(`CalendarParts: no year item has the id ${key}.`);
            // Near a limit, react-aria gives each year item the month and the
            // day of that limit. Keep the month and the day of the focused
            // date, so a year pick does not also move the month.
            state.setFocusedDate(
              item.date.set({ month: state.focusedDate.month, day: state.focusedDate.day }),
            );
            onPick();
          }}
        />
      )}
    </CalendarYearPicker>
  );
}

function MonthGrid({ onPick }: StepProps) {
  const state = useCalendarState();
  const min = state.minValue == null ? null : toCalendarDate(state.minValue);
  const max = state.maxValue == null ? null : toCalendarDate(state.maxValue);
  return (
    <CalendarMonthPicker>
      {(picker) => (
        <JumpGrid
          label={picker["aria-label"]}
          columns="months"
          items={picker.items.map((item) => ({ id: item.id, text: item.formatted }))}
          current={picker.value}
          disabledKeys={picker.items
            .filter(
              (item) =>
                (min !== null && endOfMonth(item.date).compare(min) < 0) ||
                (max !== null && startOfMonth(item.date).compare(max) > 0),
            )
            .map((item) => item.id)}
          onPick={(key) => {
            picker.onChange(key);
            onPick();
          }}
        />
      )}
    </CalendarMonthPicker>
  );
}

function JumpGrid({
  label,
  columns,
  items,
  current,
  disabledKeys,
  onPick,
}: {
  readonly label: string | undefined;
  readonly columns: "years" | "months";
  readonly items: ReadonlyArray<{ readonly id: Key; readonly text: string }>;
  readonly current: Key;
  readonly disabledKeys: ReadonlyArray<Key>;
  readonly onPick: (key: Key) => void;
}) {
  // The current item is the selection. In the toggle behavior, a press on the
  // current item clears the selection, so an empty selection picks it again.
  return (
    <ListBox
      aria-label={label}
      autoFocus
      layout="grid"
      selectionMode="single"
      selectionBehavior="toggle"
      escapeKeyBehavior="none"
      selectedKeys={[current]}
      disabledKeys={disabledKeys}
      onSelectionChange={(keys) => {
        const [key] = keys === "all" ? [] : [...keys];
        onPick(key ?? current);
      }}
      items={items}
      {...stylex.props(
        calendar.jumpGrid,
        columns === "years" ? calendar.yearColumns : calendar.monthColumns,
      )}
    >
      {(item): ReactNode => (
        <ListBoxItem
          id={item.id}
          textValue={item.text}
          {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean; isDisabled: boolean }>(
            (option) => [
              calendar.jumpItem,
              option.isSelected && calendar.selected,
              option.isFocusVisible && calendar.cellFocused,
              option.isDisabled && calendar.unavailable,
            ],
          )}
        >
          {item.text}
        </ListBoxItem>
      )}
    </ListBox>
  );
}

const panelIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.98)" },
  to: { opacity: 1, transform: "none" },
});

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

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
  calendar: { display: "flex", flexDirection: "column", gap: space.sm, width: "max-content" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.sm },
  heading: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    height: size.controlSm,
    paddingInline: space.sm,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.text,
    fontFamily: "inherit",
    fontSize: font.md,
    fontWeight: font.semibold,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    transitionProperty: "background-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  headingIcon: {
    width: size.iconSm,
    height: size.iconSm,
    color: color.textMuted,
    transitionProperty: "transform",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    transitionTimingFunction: motion.easeOut,
  },
  headingIconOpen: { transform: "rotate(180deg)" },
  nav: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.controlSm,
    height: size.controlSm,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle, ":disabled": "transparent" },
    color: { default: color.text, ":disabled": color.textFaint },
    cursor: { default: "pointer", ":disabled": "default" },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  /** Hidden, without focus, and still in the layout, so the calendar keeps its size. */
  hidden: { visibility: "hidden" },
  stage: { position: "relative" },
  grid: { borderCollapse: "collapse", fontSize: font.sm, color: color.textMuted },
  cell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.controlMd,
    height: size.controlMd,
    borderRadius: radius.md,
    fontSize: font.md,
    color: color.text,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
    outlineStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  cellHit: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
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
  panel: {
    position: "absolute",
    inset: 0,
    animationName: { default: panelIn, [media.reducedMotion]: fadeIn },
    animationDuration: motion.normal,
    animationTimingFunction: motion.easeOut,
  },
  jumpGrid: {
    display: "grid",
    alignContent: "start",
    gap: space.xs,
    height: "100%",
    overflowY: "auto",
    // The focus ring of an item sits outside the item, so the scroll box keeps room for it.
    padding: "3px",
    outlineStyle: "none",
  },
  yearColumns: { gridTemplateColumns: "repeat(4, 1fr)" },
  monthColumns: { gridTemplateColumns: "repeat(3, 1fr)" },
  jumpItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: size.controlMd,
    borderRadius: radius.md,
    fontSize: font.md,
    color: color.text,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
    outlineStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  // A zero inline size with a full minimum lets a long reason wrap instead of widening the calendar.
  reason: {
    inlineSize: 0,
    minInlineSize: "100%",
    minHeight: "1lh",
    margin: 0,
    fontSize: font.sm,
    color: color.textMuted,
  },
});
