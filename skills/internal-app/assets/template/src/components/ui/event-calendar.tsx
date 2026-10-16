// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import {
  type CalendarDate,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  parseAbsolute,
  parseDate,
  startOfMonth,
  startOfWeek,
  toCalendarDate,
  type ZonedDateTime,
} from "@internationalized/date";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { appLocale, appTimeZone } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { color, font, media, radius, size, space } from "@/styles/tokens.stylex";
import type { BadgeIntent } from "./badge";
import { Button } from "./button";
import { field } from "./field";
import { overlay } from "./overlay";
import { SegmentedControl } from "./segmented-control";

export type CalendarView = "month" | "week" | "agenda";

export interface CalendarEvent {
  readonly id: string;
  readonly title: string;
  /** ISO instant, "2026-10-12T09:00:00Z", or an ISO date for an all-day event. */
  readonly start: string;
  /** Exclusive end in the same format as `start`. */
  readonly end: string;
  readonly allDay?: boolean;
  /** Color of the event. Pair it with words in the title or meta: color alone is not a status. */
  readonly intent?: BadgeIntent;
  /** Quiet second line, such as the owner, the place, or the system. */
  readonly meta?: string;
}

export interface EventCalendarProps {
  /** Names the calendar, such as "On-call schedule". */
  readonly label: string;
  readonly events: ReadonlyArray<CalendarEvent>;
  /** Today's ISO date from the loader, so the server and the browser agree. */
  readonly today: string;
  /** Current instant from the loader. The week view draws a line at it. */
  readonly now?: string;
  /** An ISO date inside the shown period. Pass it with `onDateChange` to keep it in the URL. */
  readonly date?: string;
  readonly defaultDate?: string;
  readonly onDateChange?: (date: string) => void;
  readonly view?: CalendarView;
  readonly defaultView?: CalendarView;
  readonly onViewChange?: (view: CalendarView) => void;
  /** Opens an event, such as a sheet with its details. */
  readonly onEventAction?: (event: CalendarEvent) => void;
  /** Starts a new event on a day. Enter on a focused day and the add button in a week call it. */
  readonly onDayAction?: (date: string) => void;
  /** First hour in view when the week view opens. */
  readonly scrollToHour?: number;
}

const dayMs = 24 * 60;
const viewOptions = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "agenda", label: "Agenda" },
] as const;

/**
 * Month, week, and agenda views of events, such as on-call shifts,
 * maintenance windows, or bookings. Arrow keys move between days in the month
 * view; Page Up and Page Down change the month. Below the `md` breakpoint the
 * month view shows dots and lists the events of the focused day.
 */
export function EventCalendar({
  label,
  events,
  today,
  now,
  date,
  defaultDate,
  onDateChange,
  view,
  defaultView = "month",
  onViewChange,
  onEventAction,
  onDayAction,
  scrollToHour = 8,
}: EventCalendarProps) {
  const [localDate, setLocalDate] = useState(defaultDate ?? today);
  const [localView, setLocalView] = useState<CalendarView>(defaultView);
  const anchor = parseDate(date ?? localDate);
  const currentView = view ?? localView;
  const todayDate = parseDate(today);
  const placed = events.map(placeEvent);

  const setAnchor = (next: CalendarDate) => {
    if (date === undefined) setLocalDate(next.toString());
    onDateChange?.(next.toString());
  };
  const setView = (next: CalendarView) => {
    if (view === undefined) setLocalView(next);
    onViewChange?.(next);
  };
  const step = (direction: 1 | -1) =>
    setAnchor(
      currentView === "week"
        ? anchor.add({ weeks: direction })
        : startOfMonth(anchor).add({ months: direction }),
    );

  return (
    <section aria-label={label} {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.nav)}>
          <Button size="sm" onPress={() => setAnchor(todayDate)}>
            Today
          </Button>
          <Button
            size="sm"
            intent="ghost"
            iconOnly
            aria-label={previousLabel[currentView]}
            onPress={() => step(-1)}
          >
            <ChevronLeft aria-hidden {...stylex.props(styles.icon)} />
          </Button>
          <Button
            size="sm"
            intent="ghost"
            iconOnly
            aria-label={nextLabel[currentView]}
            onPress={() => step(1)}
          >
            <ChevronRight aria-hidden {...stylex.props(styles.icon)} />
          </Button>
          <h3 aria-live="polite" {...stylex.props(styles.heading)}>
            {currentView === "week" ? weekHeading(anchor) : monthHeading(anchor)}
          </h3>
        </div>
        <SegmentedControl
          size="sm"
          label="Calendar view"
          value={currentView}
          onChange={setView}
          options={viewOptions}
        />
      </div>
      {currentView === "month" ? (
        <MonthView
          anchor={anchor}
          today={todayDate}
          events={placed}
          onAnchorChange={setAnchor}
          onEventAction={onEventAction}
          onDayAction={onDayAction}
        />
      ) : null}
      {currentView === "week" ? (
        <WeekView
          anchor={anchor}
          today={todayDate}
          now={now}
          events={placed}
          onEventAction={onEventAction}
          onDayAction={onDayAction}
          scrollToHour={scrollToHour}
        />
      ) : null}
      {currentView === "agenda" ? (
        <AgendaView
          anchor={anchor}
          today={todayDate}
          events={placed}
          onEventAction={onEventAction}
        />
      ) : null}
    </section>
  );
}

const previousLabel: Record<CalendarView, string> = {
  month: "Previous month",
  week: "Previous week",
  agenda: "Previous month",
};
const nextLabel: Record<CalendarView, string> = {
  month: "Next month",
  week: "Next week",
  agenda: "Next month",
};

interface PlacedEvent {
  readonly event: CalendarEvent;
  readonly firstDay: CalendarDate;
  /** Inclusive last day. */
  readonly lastDay: CalendarDate;
  readonly start: ZonedDateTime | undefined;
  readonly end: ZonedDateTime | undefined;
}

function placeEvent(event: CalendarEvent): PlacedEvent {
  if (event.allDay === true) {
    const firstDay = parseDate(event.start);
    const lastDay = parseDate(event.end).subtract({ days: 1 });
    if (lastDay.compare(firstDay) < 0)
      throw new Error(`EventCalendar: event ${event.id} ends before it starts.`);
    return { event, firstDay, lastDay, start: undefined, end: undefined };
  }
  const start = parseAbsolute(event.start, appTimeZone);
  const end = parseAbsolute(event.end, appTimeZone);
  if (end.compare(start) < 0)
    throw new Error(`EventCalendar: event ${event.id} ends before it starts.`);
  const lastInstant = end.compare(start) === 0 ? end : end.subtract({ milliseconds: 1 });
  return {
    event,
    firstDay: toCalendarDate(start),
    lastDay: toCalendarDate(lastInstant),
    start,
    end,
  };
}

function eventsOn(
  events: ReadonlyArray<PlacedEvent>,
  day: CalendarDate,
): ReadonlyArray<PlacedEvent> {
  return events
    .filter((item) => item.firstDay.compare(day) <= 0 && item.lastDay.compare(day) >= 0)
    .toSorted((a, b) => {
      if (a.start === undefined || b.start === undefined) return a.start === undefined ? -1 : 1;
      return a.start.compare(b.start);
    });
}

function weekDays(anchor: CalendarDate): ReadonlyArray<CalendarDate> {
  const first = startOfWeek(anchor, appLocale);
  return Array.from({ length: 7 }, (_, index) => first.add({ days: index }));
}

function monthWeeks(anchor: CalendarDate): ReadonlyArray<ReadonlyArray<CalendarDate>> {
  const first = startOfWeek(startOfMonth(anchor), appLocale);
  const last = endOfWeek(endOfMonth(anchor), appLocale);
  const weeks: Array<ReadonlyArray<CalendarDate>> = [];
  for (let day = first; day.compare(last) <= 0; day = day.add({ weeks: 1 }))
    weeks.push(weekDays(day));
  return weeks;
}

function toJsDate(day: CalendarDate): Date {
  return day.toDate(appTimeZone);
}

function formatDay(day: CalendarDate, options: Intl.DateTimeFormatOptions): string {
  return toJsDate(day).toLocaleDateString(appLocale, { ...options, timeZone: appTimeZone });
}

function formatTime(value: ZonedDateTime): string {
  return value
    .toDate()
    .toLocaleTimeString(appLocale, { hour: "2-digit", minute: "2-digit", timeZone: appTimeZone });
}

function monthHeading(anchor: CalendarDate): string {
  return formatDay(anchor, { month: "long", year: "numeric" });
}

function weekHeading(anchor: CalendarDate): string {
  const days = weekDays(anchor);
  const first = days[0] ?? anchor;
  const last = days[6] ?? anchor;
  return `${formatDay(first, { day: "numeric", month: "short" })} – ${formatDay(last, { day: "numeric", month: "short", year: "numeric" })}`;
}

function timeRange(item: PlacedEvent): string {
  if (item.start === undefined || item.end === undefined) {
    if (isSameDay(item.firstDay, item.lastDay)) return "All day";
    return `${formatDay(item.firstDay, { day: "numeric", month: "short" })} – ${formatDay(item.lastDay, { day: "numeric", month: "short" })}`;
  }
  return `${formatTime(item.start)} – ${formatTime(item.end)}`;
}

function eventLabel(item: PlacedEvent): string {
  return [item.event.title, timeRange(item), item.event.meta].filter(Boolean).join(", ");
}

interface MonthViewProps {
  readonly anchor: CalendarDate;
  readonly today: CalendarDate;
  readonly events: ReadonlyArray<PlacedEvent>;
  readonly onAnchorChange: (date: CalendarDate) => void;
  readonly onEventAction: ((event: CalendarEvent) => void) | undefined;
  readonly onDayAction: ((date: string) => void) | undefined;
}

const visibleChips = 3;

function MonthView({
  anchor,
  today,
  events,
  onAnchorChange,
  onEventAction,
  onDayAction,
}: MonthViewProps) {
  const [focused, setFocused] = useState<CalendarDate>(
    isSameMonth(anchor, today) ? today : startOfMonth(anchor),
  );
  const focusDay = isSameMonth(focused, anchor) ? focused : startOfMonth(anchor);
  const moved = useRef(false);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const weeks = monthWeeks(anchor);
  const focusedEvents = eventsOn(events, focusDay);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    dayRefs.current.get(focusDay.toString())?.focus();
  }, [focusDay]);

  const moveTo = (next: CalendarDate) => {
    moved.current = true;
    setFocused(next);
    if (!isSameMonth(next, anchor)) onAnchorChange(next);
  };

  const onKeyDown = (event: KeyboardEvent, day: CalendarDate) => {
    const moves: Record<string, () => CalendarDate> = {
      ArrowLeft: () => day.subtract({ days: 1 }),
      ArrowRight: () => day.add({ days: 1 }),
      ArrowUp: () => day.subtract({ weeks: 1 }),
      ArrowDown: () => day.add({ weeks: 1 }),
      Home: () => startOfWeek(day, appLocale),
      End: () => endOfWeek(day, appLocale),
      PageUp: () => day.subtract({ months: 1 }),
      PageDown: () => day.add({ months: 1 }),
    };
    const move = moves[event.key];
    if (move === undefined) return;
    event.preventDefault();
    moveTo(move());
  };

  return (
    <div {...stylex.props(styles.monthWrap)}>
      <div {...stylex.props(styles.monthFrame)}>
        <table {...stylex.props(styles.month)}>
          <thead>
            <tr>
              {(weeks[0] ?? []).map((day) => (
                <th
                  key={day.toString()}
                  scope="col"
                  abbr={formatDay(day, { weekday: "long" })}
                  {...stylex.props(styles.weekday)}
                >
                  {formatDay(day, { weekday: "short" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]?.toString()}>
                {week.map((day) => {
                  const dayEvents = eventsOn(events, day);
                  const isOutside = !isSameMonth(day, anchor);
                  const isToday = isSameDay(day, today);
                  const isFocused = isSameDay(day, focusDay);
                  const hidden = dayEvents.length - visibleChips;
                  return (
                    <td
                      key={day.toString()}
                      {...stylex.props(styles.cell, isOutside && styles.cellOutside)}
                    >
                      <AriaButton
                        ref={(element) => {
                          if (element === null) dayRefs.current.delete(day.toString());
                          else dayRefs.current.set(day.toString(), element);
                        }}
                        excludeFromTabOrder={!isFocused}
                        aria-label={`${formatDay(day, { weekday: "long", day: "numeric", month: "long" })}${isToday ? ", today" : ""}, ${dayEvents.length === 1 ? "1 event" : `${dayEvents.length} events`}`}
                        aria-current={isToday ? "date" : undefined}
                        onKeyDown={(event) => onKeyDown(event, day)}
                        onFocus={() => setFocused(day)}
                        onPress={() => {
                          setFocused(day);
                          onDayAction?.(day.toString());
                        }}
                        {...renderStyles<{ isFocusVisible: boolean }>((state) => [
                          styles.dayNumber,
                          isOutside && styles.dayNumberOutside,
                          isToday && styles.dayNumberToday,
                          isFocused && styles.dayNumberSelected,
                          state.isFocusVisible && styles.focusRing,
                        ])}
                      >
                        {day.day}
                      </AriaButton>
                      <div {...stylex.props(styles.chips)}>
                        {dayEvents.slice(0, visibleChips).map((item) => (
                          <EventChip
                            key={item.event.id}
                            item={item}
                            day={day}
                            onEventAction={onEventAction}
                          />
                        ))}
                        {hidden > 0 ? (
                          <DialogTrigger>
                            <AriaButton
                              {...renderStyles<{ isFocusVisible: boolean }>((state) => [
                                styles.more,
                                state.isFocusVisible && styles.focusRing,
                              ])}
                            >
                              {hidden} more
                            </AriaButton>
                            <Popover
                              placement="bottom start"
                              {...renderStyles<{ isEntering: boolean; isExiting: boolean }>(
                                (state) => [
                                  overlay.popover,
                                  styles.morePopover,
                                  state.isEntering && overlay.entering,
                                  state.isExiting && overlay.exiting,
                                ],
                              )}
                            >
                              <Dialog
                                aria-label={formatDay(day, {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                                {...stylex.props(styles.moreDialog)}
                              >
                                <p {...stylex.props(styles.moreHeading)}>
                                  {formatDay(day, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                  })}
                                </p>
                                {dayEvents.map((item) => (
                                  <EventChip
                                    key={item.event.id}
                                    item={item}
                                    day={day}
                                    onEventAction={onEventAction}
                                  />
                                ))}
                              </Dialog>
                            </Popover>
                          </DialogTrigger>
                        ) : null}
                      </div>
                      {dayEvents.length > 0 ? (
                        <span aria-hidden {...stylex.props(styles.dots)}>
                          {dayEvents.slice(0, 3).map((item) => (
                            <span
                              key={item.event.id}
                              {...stylex.props(
                                styles.dot,
                                dotColors[item.event.intent ?? "accent"],
                              )}
                            />
                          ))}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div {...stylex.props(styles.dayList)}>
        <p {...stylex.props(styles.dayListHeading)}>
          {formatDay(focusDay, { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {focusedEvents.length === 0 ? (
          <p {...stylex.props(styles.empty)}>No events</p>
        ) : (
          focusedEvents.map((item) => (
            <AgendaRow key={item.event.id} item={item} onEventAction={onEventAction} />
          ))
        )}
      </div>
    </div>
  );
}

function EventChip({
  item,
  day,
  onEventAction,
}: {
  readonly item: PlacedEvent;
  readonly day: CalendarDate;
  readonly onEventAction: ((event: CalendarEvent) => void) | undefined;
}) {
  const intent = item.event.intent ?? "accent";
  const isBar = item.start === undefined || !isSameDay(item.firstDay, item.lastDay);
  const content = (
    <>
      {isBar ? null : <span aria-hidden {...stylex.props(styles.dot, dotColors[intent])} />}
      {isBar || item.start === undefined || !isSameDay(item.firstDay, day) ? null : (
        <span {...stylex.props(styles.chipTime)}>{formatTime(item.start)}</span>
      )}
      <span {...stylex.props(styles.chipTitle)}>{item.event.title}</span>
    </>
  );
  const chipStyles = [
    styles.chip,
    isBar && styles.chipBar,
    isBar && barColors[intent],
    isBar && !isSameDay(item.firstDay, day) && styles.chipContinues,
  ];
  if (onEventAction === undefined)
    return (
      <span title={eventLabel(item)} {...stylex.props(...chipStyles)}>
        <span {...stylex.props(field.hiddenLabel)}>{eventLabel(item)}</span>
        <span aria-hidden {...stylex.props(styles.chipInner)}>
          {content}
        </span>
      </span>
    );
  return (
    <AriaButton
      aria-label={eventLabel(item)}
      onPress={() => onEventAction(item.event)}
      {...renderStyles<{ isFocusVisible: boolean }>((state) => [
        ...chipStyles,
        styles.chipAction,
        state.isFocusVisible && styles.focusRing,
      ])}
    >
      {content}
    </AriaButton>
  );
}

interface WeekViewProps {
  readonly anchor: CalendarDate;
  readonly today: CalendarDate;
  readonly now: string | undefined;
  readonly events: ReadonlyArray<PlacedEvent>;
  readonly onEventAction: ((event: CalendarEvent) => void) | undefined;
  readonly onDayAction: ((date: string) => void) | undefined;
  readonly scrollToHour: number;
}

interface Segment {
  readonly item: PlacedEvent;
  readonly startMin: number;
  readonly endMin: number;
  readonly column: number;
  readonly columns: number;
}

/** Packs overlapping events of one day into side-by-side columns. */
function daySegments(
  events: ReadonlyArray<PlacedEvent>,
  day: CalendarDate,
): ReadonlyArray<Segment> {
  const dayStart = day.toDate(appTimeZone).getTime();
  const timed = eventsOn(events, day)
    .filter((item) => item.start !== undefined && item.end !== undefined)
    .map((item) => ({
      item,
      startMin: Math.max(0, ((item.start?.toDate().getTime() ?? dayStart) - dayStart) / 60_000),
      endMin: Math.min(dayMs, ((item.end?.toDate().getTime() ?? dayStart) - dayStart) / 60_000),
    }));
  const result: Array<Segment> = [];
  let cluster: Array<{ item: PlacedEvent; startMin: number; endMin: number; column: number }> = [];
  let clusterEnd = -1;
  const flush = () => {
    const columns = Math.max(1, ...cluster.map((entry) => entry.column + 1));
    for (const entry of cluster) result.push({ ...entry, columns });
    cluster = [];
  };
  for (const segment of timed) {
    if (segment.startMin >= clusterEnd) flush();
    const taken = new Set(
      cluster.filter((entry) => entry.endMin > segment.startMin).map((entry) => entry.column),
    );
    let column = 0;
    while (taken.has(column)) column += 1;
    cluster.push({ ...segment, column });
    clusterEnd = Math.max(clusterEnd, segment.endMin);
  }
  flush();
  return result;
}

function hourLabel(hour: number): string {
  return new Date(Date.UTC(2026, 0, 1, hour)).toLocaleTimeString(appLocale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function WeekView({
  anchor,
  today,
  now,
  events,
  onEventAction,
  onDayAction,
  scrollToHour,
}: WeekViewProps) {
  const days = weekDays(anchor);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nowInstant = now === undefined ? undefined : parseAbsolute(now, appTimeZone);

  useEffect(() => {
    const body = bodyRef.current;
    if (body !== null) body.scrollTop = (body.scrollHeight / 24) * scrollToHour;
  }, [scrollToHour]);

  return (
    <div {...stylex.props(styles.weekScroll)}>
      <div {...stylex.props(styles.weekInner)}>
        <div {...stylex.props(styles.weekRow, styles.weekHeader)}>
          <span />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toString()} {...stylex.props(styles.weekDayHeader)}>
                <span {...stylex.props(styles.weekDayName)}>
                  {formatDay(day, { weekday: "short" })}
                </span>
                <span {...stylex.props(styles.weekDayNumber, isToday && styles.dayNumberToday)}>
                  {day.day}
                  {isToday ? <span {...stylex.props(field.hiddenLabel)}>, today</span> : null}
                </span>
                {onDayAction === undefined ? null : (
                  <AriaButton
                    aria-label={`Add event on ${formatDay(day, { weekday: "long", day: "numeric", month: "long" })}`}
                    onPress={() => onDayAction(day.toString())}
                    {...renderStyles<{ isFocusVisible: boolean }>((state) => [
                      styles.addButton,
                      state.isFocusVisible && styles.focusRing,
                    ])}
                  >
                    <CalendarPlus aria-hidden {...stylex.props(styles.iconSm)} />
                  </AriaButton>
                )}
              </div>
            );
          })}
        </div>
        <div {...stylex.props(styles.weekRow, styles.allDayRow)}>
          <span {...stylex.props(styles.gutterLabel)}>All day</span>
          {days.map((day) => (
            <div key={day.toString()} {...stylex.props(styles.allDayCell)}>
              {eventsOn(events, day)
                .filter((item) => item.start === undefined)
                .map((item) => (
                  <EventChip
                    key={item.event.id}
                    item={item}
                    day={day}
                    onEventAction={onEventAction}
                  />
                ))}
            </div>
          ))}
        </div>
        <div ref={bodyRef} {...stylex.props(styles.weekBody)}>
          <div {...stylex.props(styles.weekRow)}>
            <div aria-hidden {...stylex.props(styles.hours)}>
              {Array.from({ length: 24 }, (_, hour) => (
                <span key={hour} {...stylex.props(styles.hourLabel)}>
                  {hour === 0 ? "" : hourLabel(hour)}
                </span>
              ))}
            </div>
            {days.map((day) => {
              const isToday = isSameDay(day, today);
              const nowMin =
                isToday && nowInstant !== undefined && isSameDay(toCalendarDate(nowInstant), day)
                  ? nowInstant.hour * 60 + nowInstant.minute
                  : undefined;
              return (
                <div
                  key={day.toString()}
                  role="group"
                  aria-label={formatDay(day, { weekday: "long", day: "numeric", month: "long" })}
                  {...stylex.props(styles.dayColumn, isToday && styles.dayColumnToday)}
                >
                  {daySegments(events, day).map((segment) => (
                    <TimedEvent
                      key={segment.item.event.id}
                      segment={segment}
                      onEventAction={onEventAction}
                    />
                  ))}
                  {nowMin === undefined ? null : (
                    <span
                      aria-hidden
                      {...stylex.props(styles.nowLine, styles.at(nowMin / dayMs))}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimedEvent({
  segment,
  onEventAction,
}: {
  readonly segment: Segment;
  readonly onEventAction: ((event: CalendarEvent) => void) | undefined;
}) {
  const { item } = segment;
  const intent = item.event.intent ?? "accent";
  // Short events put the title and the time on one line so the title stays visible.
  const isCompact = segment.endMin - segment.startMin < 45;
  const position = styles.block(
    segment.startMin / dayMs,
    Math.max(segment.endMin - segment.startMin, 20) / dayMs,
    segment.column / segment.columns,
    1 / segment.columns,
  );
  const content = (
    <>
      <span {...stylex.props(styles.blockTitle)}>{item.event.title}</span>
      <span {...stylex.props(styles.blockTime)}>{timeRange(item)}</span>
    </>
  );
  if (onEventAction === undefined)
    return (
      <div
        {...stylex.props(
          styles.timed,
          isCompact && styles.timedCompact,
          barColors[intent],
          blockBorders[intent],
          position,
        )}
      >
        {content}
      </div>
    );
  return (
    <AriaButton
      aria-label={eventLabel(item)}
      onPress={() => onEventAction(item.event)}
      {...renderStyles<{ isFocusVisible: boolean }>((state) => [
        styles.timed,
        isCompact && styles.timedCompact,
        barColors[intent],
        blockBorders[intent],
        position,
        styles.chipAction,
        state.isFocusVisible && styles.focusRing,
      ])}
    >
      {content}
    </AriaButton>
  );
}

function AgendaView({
  anchor,
  today,
  events,
  onEventAction,
}: {
  readonly anchor: CalendarDate;
  readonly today: CalendarDate;
  readonly events: ReadonlyArray<PlacedEvent>;
  readonly onEventAction: ((event: CalendarEvent) => void) | undefined;
}) {
  const days: Array<CalendarDate> = [];
  for (
    let day = startOfMonth(anchor);
    day.compare(endOfMonth(anchor)) <= 0;
    day = day.add({ days: 1 })
  )
    if (eventsOn(events, day).length > 0) days.push(day);
  if (days.length === 0)
    return <p {...stylex.props(styles.empty)}>No events in {monthHeading(anchor)}.</p>;
  return (
    <ol {...stylex.props(styles.agenda)}>
      {days.map((day) => (
        <li key={day.toString()} {...stylex.props(styles.agendaDay)}>
          <p {...stylex.props(styles.agendaDate, isSameDay(day, today) && styles.agendaToday)}>
            {formatDay(day, { weekday: "short", day: "numeric", month: "short" })}
            {isSameDay(day, today) ? " · Today" : null}
          </p>
          <div {...stylex.props(styles.agendaEvents)}>
            {eventsOn(events, day).map((item) => (
              <AgendaRow key={item.event.id} item={item} onEventAction={onEventAction} />
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

function AgendaRow({
  item,
  onEventAction,
}: {
  readonly item: PlacedEvent;
  readonly onEventAction: ((event: CalendarEvent) => void) | undefined;
}) {
  const content: ReactNode = (
    <>
      <span {...stylex.props(styles.agendaTime)}>{timeRange(item)}</span>
      <span aria-hidden {...stylex.props(styles.dot, dotColors[item.event.intent ?? "accent"])} />
      <span {...stylex.props(styles.agendaText)}>
        <span {...stylex.props(styles.agendaTitle)}>{item.event.title}</span>
        {item.event.meta === undefined ? null : (
          <span {...stylex.props(styles.agendaMeta)}>{item.event.meta}</span>
        )}
      </span>
    </>
  );
  if (onEventAction === undefined) return <div {...stylex.props(styles.agendaRow)}>{content}</div>;
  return (
    <AriaButton
      onPress={() => onEventAction(item.event)}
      {...renderStyles<{ isFocusVisible: boolean }>((state) => [
        styles.agendaRow,
        styles.agendaAction,
        state.isFocusVisible && styles.focusRing,
      ])}
    >
      {content}
    </AriaButton>
  );
}

const hourHeight = "3rem";

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.md, minWidth: 0 },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space.sm,
  },
  nav: { display: "flex", alignItems: "center", gap: space.xs, minWidth: 0 },
  heading: {
    margin: 0,
    marginInlineStart: space.sm,
    fontSize: font.lg,
    fontWeight: font.semibold,
    whiteSpace: "nowrap",
  },
  icon: { width: size.icon, height: size.icon },
  iconSm: { width: size.iconSm, height: size.iconSm },
  focusRing: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  monthWrap: { display: "flex", flexDirection: "column", gap: space.md, minWidth: 0 },
  monthFrame: {
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  month: {
    width: "100%",
    tableLayout: "fixed",
    borderCollapse: "collapse",
    // Hidden collapses the outer cell borders into the frame border.
    borderStyle: "hidden",
    backgroundColor: color.raised,
  },
  weekday: {
    paddingBlock: space.xs,
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.textMuted,
    textAlign: "center",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  cell: {
    height: { default: "3.25rem", [media.md]: "6.5rem" },
    padding: space.xs,
    verticalAlign: "top",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.borderSubtle,
  },
  cellOutside: { backgroundColor: color.subtle },
  dayNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "1.5rem",
    height: "1.5rem",
    paddingInline: "0.25rem",
    marginBottom: "2px",
    borderStyle: "none",
    borderRadius: radius.full,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.text,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
    outlineStyle: "none",
  },
  dayNumberOutside: { color: color.textFaint },
  dayNumberToday: {
    backgroundColor: { default: color.accent, ":hover": color.accentHover },
    color: color.onAccent,
  },
  dayNumberSelected: { boxShadow: `inset 0 0 0 1px ${color.accentBorder}` },
  chips: {
    display: { default: "none", [media.md]: "flex" },
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    width: "100%",
    minWidth: 0,
    height: "1.25rem",
    paddingInline: space.xs,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    fontSize: font.xs,
    color: color.text,
    textAlign: "start",
  },
  chipInner: { display: "flex", alignItems: "center", gap: space.xs, minWidth: 0, width: "100%" },
  chipBar: { fontWeight: font.medium },
  chipContinues: { borderStartStartRadius: 0, borderEndStartRadius: 0 },
  chipAction: { cursor: "pointer", outlineStyle: "none" },
  chipTime: { flexShrink: 0, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  chipTitle: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  more: {
    alignSelf: "flex-start",
    paddingInline: space.xs,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    fontSize: font.xs,
    fontWeight: font.medium,
    color: color.textMuted,
    cursor: "pointer",
    outlineStyle: "none",
  },
  morePopover: { minWidth: "14rem", maxWidth: "20rem" },
  moreDialog: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: space.sm,
    outlineStyle: "none",
  },
  moreHeading: { margin: 0, marginBottom: space.xs, fontSize: font.sm, fontWeight: font.semibold },
  dots: {
    display: { default: "flex", [media.md]: "none" },
    justifyContent: "center",
    gap: "2px",
    marginTop: "2px",
  },
  dot: { width: "0.375rem", height: "0.375rem", flexShrink: 0, borderRadius: radius.full },
  dayList: {
    display: { default: "flex", [media.md]: "none" },
    flexDirection: "column",
    gap: space.xs,
  },
  dayListHeading: { margin: 0, fontSize: font.sm, fontWeight: font.semibold },
  empty: { margin: 0, paddingBlock: space.md, fontSize: font.md, color: color.textMuted },
  weekScroll: {
    overflowX: "auto",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.raised,
  },
  weekInner: { minWidth: "44rem" },
  weekRow: { display: "grid", gridTemplateColumns: "3.5rem repeat(7, minmax(0, 1fr))" },
  weekHeader: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  weekDayHeader: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    paddingBlock: space.sm,
    paddingInline: space.sm,
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
  },
  weekDayName: { fontSize: font.sm, color: color.textMuted },
  weekDayNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "1.5rem",
    height: "1.5rem",
    borderRadius: radius.full,
    fontSize: font.md,
    fontWeight: font.semibold,
    fontVariantNumeric: "tabular-nums",
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    marginInlineStart: "auto",
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.textMuted,
    cursor: "pointer",
    outlineStyle: "none",
  },
  allDayRow: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  gutterLabel: {
    paddingBlock: space.xs,
    paddingInlineEnd: space.xs,
    fontSize: font.xs,
    color: color.textMuted,
    textAlign: "end",
  },
  allDayCell: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
    minHeight: "1.75rem",
    padding: "2px",
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
  },
  weekBody: { maxHeight: "30rem", overflowY: "auto" },
  hours: { display: "flex", flexDirection: "column" },
  hourLabel: {
    height: hourHeight,
    paddingInlineEnd: space.xs,
    fontSize: font.xs,
    color: color.textMuted,
    textAlign: "end",
    transform: "translateY(-0.45em)",
    fontVariantNumeric: "tabular-nums",
  },
  dayColumn: {
    position: "relative",
    height: `calc(${hourHeight} * 24)`,
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
    backgroundImage: `repeating-linear-gradient(to bottom, ${color.borderSubtle} 0 1px, transparent 1px ${hourHeight})`,
  },
  dayColumnToday: { backgroundColor: color.subtle },
  timedCompact: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingBlock: 0 },
  timed: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "1px",
    overflow: "hidden",
    paddingBlock: "2px",
    paddingInline: space.xs,
    borderStyle: "none",
    borderInlineStartWidth: "3px",
    borderInlineStartStyle: "solid",
    borderRadius: radius.sm,
    fontSize: font.xs,
    textAlign: "start",
  },
  block: (top: number, height: number, left: number, width: number) => ({
    top: `${top * 100}%`,
    height: `calc(${height * 100}% - 2px)`,
    left: `calc(${left * 100}% + 2px)`,
    width: `calc(${width * 100}% - 4px)`,
  }),
  blockTitle: {
    minWidth: "2.5rem",
    fontWeight: font.medium,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  blockTime: {
    minWidth: 0,
    overflow: "hidden",
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    // In a one-line block the time gives way before the title.
    flexShrink: 10,
  },
  nowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "2px",
    backgroundColor: color.danger,
    zIndex: 1,
  },
  at: (share: number) => ({ top: `${share * 100}%` }),
  agenda: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  agendaDay: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.md]: "9rem 1fr" },
    gap: space.xs,
    paddingBlock: space.sm,
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  agendaDate: { margin: 0, paddingBlock: space.xs, fontSize: font.sm, fontWeight: font.semibold },
  agendaToday: { color: color.accentText },
  agendaEvents: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  agendaRow: {
    display: "grid",
    gridTemplateColumns: "7.5rem auto minmax(0, 1fr)",
    alignItems: "center",
    columnGap: space.sm,
    width: "100%",
    paddingBlock: space.xs,
    paddingInline: space.xs,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: "transparent",
    fontSize: font.md,
    color: color.text,
    textAlign: "start",
  },
  agendaAction: {
    cursor: "pointer",
    outlineStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  agendaTime: { fontSize: font.sm, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  agendaText: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: space.sm,
    minWidth: 0,
  },
  agendaTitle: { fontWeight: font.medium },
  agendaMeta: { fontSize: font.sm, color: color.textMuted },
});

const dotColors = stylex.create({
  neutral: { backgroundColor: color.textFaint },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});

const barColors = stylex.create({
  neutral: { backgroundColor: color.subtle, color: color.text },
  accent: { backgroundColor: color.accentMuted, color: color.accentText },
  success: { backgroundColor: color.successMuted, color: color.success },
  warning: { backgroundColor: color.warningMuted, color: color.warning },
  danger: { backgroundColor: color.dangerMuted, color: color.danger },
  info: { backgroundColor: color.infoMuted, color: color.info },
});

const blockBorders = stylex.create({
  neutral: { borderInlineStartColor: color.borderStrong },
  accent: { borderInlineStartColor: color.accent },
  success: { borderInlineStartColor: color.success },
  warning: { borderInlineStartColor: color.warning },
  danger: { borderInlineStartColor: color.danger },
  info: { borderInlineStartColor: color.info },
});
