// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import {
  type CalendarDate,
  endOfMonth,
  endOfWeek,
  getDayOfWeek,
  isSameDay,
  isSameMonth,
  parseAbsolute,
  parseDate,
  startOfMonth,
  startOfWeek,
  toCalendarDate,
  type ZonedDateTime,
} from "@internationalized/date";
import { CalendarPlus, ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { appLocale, appTimeZone } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { color, font, media, radius, size, space } from "@/styles/tokens.stylex";
import type { BadgeIntent } from "./badge";
import { Button } from "./button";
import { field } from "./field";
import { overlay } from "./overlay";
import { SegmentedControl } from "./segmented-control";

export type CalendarView = "month" | "week" | "day" | "agenda";

export type CalendarWeekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * Repeats an event. Each occurrence keeps the start time and the length of the
 * first one, in the app time zone. Occurrences are expanded for the period in
 * view only.
 */
export interface CalendarRecurrence {
  readonly frequency: "daily" | "weekly" | "monthly";
  /** Every n days, weeks, or months. Defaults to 1. */
  readonly interval?: number;
  /** Weekly only: the days of the week. Defaults to the weekday of `start`. */
  readonly weekdays?: ReadonlyArray<CalendarWeekday>;
  /**
   * Last ISO date an occurrence may start on, inclusive. Give `until` or
   * `count`, not both; without either the series has no end.
   */
  readonly until?: string;
  /** Number of occurrences, the first included. */
  readonly count?: number;
}

/** A person, room, or system that events belong to, such as an on-call engineer. */
export interface CalendarResource {
  readonly id: string;
  readonly title: string;
  /** Quiet second line, such as a team or a region. */
  readonly meta?: string;
}

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
  /** Repeats the event. A monthly event on the 31st skips months without that day. */
  readonly recurrence?: CalendarRecurrence;
  /** The resource the event belongs to. Required for every event when `resources` is set. */
  readonly resourceId?: string;
}

/** One occurrence of an event on the calendar. */
export interface CalendarOccurrence {
  readonly event: CalendarEvent;
  /** Unique per occurrence: the event id, followed by the start date for a recurring event. */
  readonly key: string;
  /** Start and exclusive end of this occurrence, in the format of the event. */
  readonly start: string;
  readonly end: string;
  /** Position in the series, from 0. A single event is 0. */
  readonly index: number;
}

/** New dates for an event, in the format of the event, and its new resource. */
export interface CalendarEventChange {
  readonly start: string;
  readonly end: string;
  readonly resourceId?: string;
}

export interface EventCalendarProps {
  /** Names the calendar, such as "On-call schedule". */
  readonly label: string;
  readonly events: ReadonlyArray<CalendarEvent>;
  /** Today's ISO date from the loader, so the server and the browser agree. */
  readonly today: string;
  /** Current instant from the loader. The week and day views draw a line at it. */
  readonly now?: string;
  /** An ISO date inside the shown period. Pass it with `onDateChange` to keep it in the URL. */
  readonly date?: string;
  readonly defaultDate?: string;
  readonly onDateChange?: (date: string) => void;
  readonly view?: CalendarView;
  readonly defaultView?: CalendarView;
  readonly onViewChange?: (view: CalendarView) => void;
  /** The views people can switch between, in order. Defaults to all four. */
  readonly views?: ReadonlyArray<CalendarView>;
  /**
   * Shows the events per resource. The day view gets one time column per
   * resource; the week view gets one row per resource.
   */
  readonly resources?: ReadonlyArray<CalendarResource>;
  /** Opens an event, such as a sheet with its details. */
  readonly onEventAction?: (event: CalendarEvent, occurrence: CalendarOccurrence) => void;
  /**
   * Makes single events movable: drag an event to another time, day, or
   * resource, or drag its lower edge to change its end. With an event
   * focused, Alt and the arrow keys move it and Alt, Shift, and the arrow
   * keys change its end. Persist the change and update `events`. Recurring
   * events do not move; change their recurrence in a form.
   */
  readonly onEventChange?: (event: CalendarEvent, change: CalendarEventChange) => void;
  /**
   * Starts a new event on a day. Enter on a focused month day and the add
   * button of a week or day column call it; a resource column passes its id.
   */
  readonly onDayAction?: (date: string, resourceId?: string) => void;
  /** First hour in view when the week or day view opens. */
  readonly scrollToHour?: number;
  /** Minutes per step when an event moves or changes its end in a time grid. It must divide 60. */
  readonly minuteStep?: number;
}

const dayMinutes = 24 * 60;
const allViews: ReadonlyArray<CalendarView> = ["month", "week", "day", "agenda"];
const viewLabels: Record<CalendarView, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  agenda: "Agenda",
};
const weekdayIds: ReadonlyArray<CalendarWeekday> = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/**
 * Month, week, day, and agenda views of events, such as on-call shifts,
 * maintenance windows, or bookings, with recurring events, resources, and
 * changes by drag or keyboard. Arrow keys move between days in the month
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
  views = allViews,
  resources,
  onEventAction,
  onEventChange,
  onDayAction,
  scrollToHour = 8,
  minuteStep = 15,
}: EventCalendarProps) {
  if (!Number.isInteger(minuteStep) || minuteStep < 1 || 60 % minuteStep !== 0)
    throw new Error(
      `EventCalendar: minuteStep ${minuteStep} must be a whole number that divides 60.`,
    );
  const [localDate, setLocalDate] = useState(defaultDate ?? today);
  const [localView, setLocalView] = useState<CalendarView>(defaultView);
  const [preview, setPreview] = useState<{
    readonly id: string;
    readonly change: CalendarEventChange;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const focusAfterChange = useRef<string | null>(null);
  const suppressPress = useRef(false);
  const anchor = parseDate(date ?? localDate);
  const currentView = view ?? localView;
  if (!views.includes(currentView))
    throw new Error(`EventCalendar: the view "${currentView}" is not in \`views\`.`);
  const todayDate = parseDate(today);

  // A moved event re-renders in its new place; keep the keyboard on it.
  useEffect(() => {
    const key = focusAfterChange.current;
    if (key === null) return;
    focusAfterChange.current = null;
    const target = rootRef.current?.querySelector<HTMLElement>(
      `[data-event-key="${CSS.escape(key)}"]`,
    );
    if (target !== null && target !== undefined && document.activeElement !== target)
      target.focus();
  });

  if (resources !== undefined) {
    const ids = new Set(resources.map((resource) => resource.id));
    for (const event of events)
      if (event.resourceId === undefined || !ids.has(event.resourceId))
        throw new Error(
          `EventCalendar: event ${event.id} needs a resourceId from \`resources\`, not ${String(event.resourceId)}.`,
        );
  }

  const range = visibleRange(currentView, anchor);
  const shown =
    preview === null
      ? events
      : events.map((event) => (event.id === preview.id ? { ...event, ...preview.change } : event));
  const placed = shown.flatMap((event) => expand(event, range.start, range.end));

  const setAnchor = (next: CalendarDate) => {
    if (date === undefined) setLocalDate(next.toString());
    onDateChange?.(next.toString());
  };
  const setView = (next: CalendarView) => {
    if (view === undefined) setLocalView(next);
    onViewChange?.(next);
  };
  const step = (direction: 1 | -1) => {
    if (currentView === "week") setAnchor(anchor.add({ weeks: direction }));
    else if (currentView === "day") setAnchor(anchor.add({ days: direction }));
    else setAnchor(startOfMonth(anchor).add({ months: direction }));
  };

  const resourceTitle = (id: string | undefined) =>
    resources?.find((resource) => resource.id === id)?.title;

  const commit = (item: Placed, change: CalendarEventChange) => {
    const original = events.find((event) => event.id === item.event.id);
    if (onEventChange === undefined || original === undefined) return;
    if (
      sameMoment(original.start, change.start) &&
      sameMoment(original.end, change.end) &&
      original.resourceId === change.resourceId
    )
      return;
    const moved = placeEvent({ ...original, ...change });
    focusAfterChange.current = item.key;
    const resource = resourceTitle(change.resourceId);
    setAnnouncement(
      `${original.title}: ${dateRangeLabel(moved)}${resource === undefined ? "" : `, ${resource}`}`,
    );
    onEventChange(original, change);
  };

  const interaction: Interaction = {
    canChange: (item) => onEventChange !== undefined && item.event.recurrence === undefined,
    onPress:
      onEventAction === undefined
        ? undefined
        : (item) => {
            if (suppressPress.current) return;
            onEventAction(item.event, occurrenceOf(item));
          },
    onKeyDown: (event, item, mode) => {
      if (!event.altKey || onEventChange === undefined || item.event.recurrence !== undefined)
        return;
      const change = keyChange(event.key, event.shiftKey, item, mode, minuteStep, resources);
      if (change === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      commit(item, change);
    },
    onPointerDown: (event, item, drag) => {
      const root = rootRef.current;
      if (
        event.button !== 0 ||
        root === null ||
        onEventChange === undefined ||
        item.event.recurrence !== undefined
      )
        return;
      const originX = event.clientX;
      const originY = event.clientY;
      const columns =
        drag.kind === "grid"
          ? Array.from(root.querySelectorAll<HTMLElement>("[data-grid-column]")).map((element) =>
              element.getBoundingClientRect(),
            )
          : [];
      let isDragging = false;
      let last: CalendarEventChange | undefined;
      const onMove = (moveEvent: globalThis.PointerEvent) => {
        if (!isDragging && Math.hypot(moveEvent.clientX - originX, moveEvent.clientY - originY) < 4)
          return;
        isDragging = true;
        moveEvent.preventDefault();
        const change =
          drag.kind === "grid"
            ? gridDragChange(item, drag, columns, moveEvent, originY, minuteStep)
            : cellDragChange(item, drag, root, moveEvent);
        if (change === undefined) return;
        last = change;
        setPreview({ id: item.event.id, change });
      };
      const stop = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        setPreview(null);
      };
      const onUp = () => {
        stop();
        if (!isDragging) return;
        // The release after a drag must not also open the event.
        suppressPress.current = true;
        window.setTimeout(() => {
          suppressPress.current = false;
        }, 0);
        if (last !== undefined) commit(item, last);
      };
      const onCancel = () => stop();
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    },
    resourceTitle,
  };

  return (
    <section ref={rootRef} aria-label={label} {...stylex.props(styles.root)}>
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
            {periodHeading(currentView, anchor)}
          </h3>
        </div>
        {views.length > 1 ? (
          <SegmentedControl
            size="sm"
            label="Calendar view"
            value={currentView}
            onChange={setView}
            options={views.map((id) => ({ id, label: viewLabels[id] }))}
          />
        ) : null}
      </div>
      {currentView === "month" ? (
        <MonthView
          anchor={anchor}
          today={todayDate}
          events={placed}
          onAnchorChange={setAnchor}
          interaction={interaction}
          onDayAction={onDayAction}
        />
      ) : null}
      {currentView === "week" && resources === undefined ? (
        <TimeGrid
          columns={weekDays(anchor).map((day) => ({
            key: day.toString(),
            day,
            resource: undefined,
            events: eventsOn(placed, day),
          }))}
          mode="grid"
          minWidth="44rem"
          today={todayDate}
          now={now}
          interaction={interaction}
          onDayAction={onDayAction}
          scrollToHour={scrollToHour}
        />
      ) : null}
      {currentView === "week" && resources !== undefined ? (
        <ResourceWeek
          anchor={anchor}
          today={todayDate}
          resources={resources}
          events={placed}
          interaction={interaction}
          onDayAction={onDayAction}
        />
      ) : null}
      {currentView === "day" ? (
        <TimeGrid
          columns={(resources ?? [undefined]).map((resource) => ({
            key: resource?.id ?? anchor.toString(),
            day: anchor,
            resource,
            events: eventsOn(placed, anchor).filter(
              (item) => resource === undefined || item.event.resourceId === resource.id,
            ),
          }))}
          mode={resources === undefined ? "grid" : "resourceDay"}
          minWidth={resources === undefined ? "0" : `calc(3.5rem + ${resources.length} * 8rem)`}
          today={todayDate}
          now={now}
          interaction={interaction}
          onDayAction={onDayAction}
          scrollToHour={scrollToHour}
        />
      ) : null}
      {currentView === "agenda" ? (
        <AgendaView anchor={anchor} today={todayDate} events={placed} interaction={interaction} />
      ) : null}
      {onEventChange === undefined ? null : (
        <p {...stylex.props(styles.hint)}>
          Drag an event to move it, or its lower edge to change its end. With an event focused, Alt
          and the arrow keys move it, and Alt, Shift, and the arrow keys change its end. Recurring
          events do not move.
        </p>
      )}
      <span aria-live="polite" {...stylex.props(field.hiddenLabel)}>
        {announcement}
      </span>
    </section>
  );
}

const previousLabel: Record<CalendarView, string> = {
  month: "Previous month",
  week: "Previous week",
  day: "Previous day",
  agenda: "Previous month",
};
const nextLabel: Record<CalendarView, string> = {
  month: "Next month",
  week: "Next week",
  day: "Next day",
  agenda: "Next month",
};

/**
 * How the arrow keys move an event, by the layout it sits in. `month` steps
 * days and weeks, `grid` steps minutes and days, `resourceDay` steps minutes
 * and resource columns, and `resourceWeek` steps days and resource rows.
 */
type ChangeMode = "month" | "grid" | "resourceDay" | "resourceWeek";

type DragSpec =
  | { readonly kind: "cell"; readonly day: CalendarDate; readonly edge: "move" | "end" }
  | {
      readonly kind: "grid";
      readonly column: number;
      readonly columns: ReadonlyArray<GridColumn>;
      readonly mode: ChangeMode;
      readonly edge: "move" | "end";
    };

interface Interaction {
  readonly canChange: (item: Placed) => boolean;
  readonly onPress: ((item: Placed) => void) | undefined;
  readonly onKeyDown: (event: KeyboardEvent, item: Placed, mode: ChangeMode) => void;
  readonly onPointerDown: (event: PointerEvent<HTMLElement>, item: Placed, drag: DragSpec) => void;
  readonly resourceTitle: (id: string | undefined) => string | undefined;
}

interface Placed {
  readonly event: CalendarEvent;
  readonly key: string;
  readonly index: number;
  readonly firstDay: CalendarDate;
  /** Inclusive last day. */
  readonly lastDay: CalendarDate;
  readonly start: ZonedDateTime | undefined;
  readonly end: ZonedDateTime | undefined;
}

function placeEvent(event: CalendarEvent): Placed {
  if (event.allDay === true) {
    const firstDay = parseDate(event.start);
    const lastDay = parseDate(event.end).subtract({ days: 1 });
    if (lastDay.compare(firstDay) < 0)
      throw new Error(`EventCalendar: event ${event.id} ends before it starts.`);
    return { event, key: event.id, index: 0, firstDay, lastDay, start: undefined, end: undefined };
  }
  const start = parseAbsolute(event.start, appTimeZone);
  const end = parseAbsolute(event.end, appTimeZone);
  if (end.compare(start) < 0)
    throw new Error(`EventCalendar: event ${event.id} ends before it starts.`);
  const lastInstant = end.compare(start) === 0 ? end : end.subtract({ milliseconds: 1 });
  return {
    event,
    key: event.id,
    index: 0,
    firstDay: toCalendarDate(start),
    lastDay: toCalendarDate(lastInstant),
    start,
    end,
  };
}

function occurrenceOf(item: Placed): CalendarOccurrence {
  if (item.start === undefined || item.end === undefined)
    return {
      event: item.event,
      key: item.key,
      start: item.firstDay.toString(),
      end: item.lastDay.add({ days: 1 }).toString(),
      index: item.index,
    };
  return {
    event: item.event,
    key: item.key,
    start: isoInstant(item.start),
    end: isoInstant(item.end),
    index: item.index,
  };
}

function visibleRange(
  view: CalendarView,
  anchor: CalendarDate,
): { readonly start: CalendarDate; readonly end: CalendarDate } {
  if (view === "week") {
    const days = weekDays(anchor);
    return { start: days[0] ?? anchor, end: days[6] ?? anchor };
  }
  if (view === "day") return { start: anchor, end: anchor };
  if (view === "agenda") return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  return {
    start: startOfWeek(startOfMonth(anchor), appLocale),
    end: endOfWeek(endOfMonth(anchor), appLocale),
  };
}

function checkRecurrence(event: CalendarEvent, rule: CalendarRecurrence) {
  const fail = (reason: string) => {
    throw new Error(`EventCalendar: the recurrence of event ${event.id} ${reason}.`);
  };
  const interval = rule.interval ?? 1;
  if (!Number.isInteger(interval) || interval < 1) fail("needs a whole interval of 1 or more");
  if (rule.count !== undefined && (!Number.isInteger(rule.count) || rule.count < 1))
    fail("needs a whole count of 1 or more");
  if (rule.count !== undefined && rule.until !== undefined) fail("has both until and count");
  if (rule.weekdays !== undefined && rule.frequency !== "weekly")
    fail("has weekdays, which only weekly events take");
  if (rule.weekdays !== undefined && rule.weekdays.length === 0) fail("has no weekdays");
}

/**
 * The occurrences of an event that touch the days from `from` to `to`. Long
 * series skip ahead to the period in view instead of walking every
 * occurrence since the first.
 */
function expand(event: CalendarEvent, from: CalendarDate, to: CalendarDate): Array<Placed> {
  const base = placeEvent(event);
  const rule = event.recurrence;
  if (rule === undefined)
    return base.lastDay.compare(from) >= 0 && base.firstDay.compare(to) <= 0 ? [base] : [];
  checkRecurrence(event, rule);
  const interval = rule.interval ?? 1;
  const spanDays = base.lastDay.compare(base.firstDay);
  const until = rule.until === undefined ? undefined : parseDate(rule.until);
  const earliest = from.subtract({ days: spanDays });
  const result: Array<Placed> = [];
  const add = (day: CalendarDate, index: number) => {
    if (day.compare(earliest) >= 0) result.push(occurrence(base, day, index));
  };
  const isPast = (day: CalendarDate, index: number) =>
    day.compare(to) > 0 ||
    (until !== undefined && day.compare(until) > 0) ||
    (rule.count !== undefined && index >= rule.count);

  if (rule.frequency === "daily") {
    const skip = Math.max(0, Math.floor(earliest.compare(base.firstDay) / interval));
    for (let index = skip; ; index += 1) {
      const day = base.firstDay.add({ days: index * interval });
      if (isPast(day, index)) break;
      add(day, index);
    }
    return result;
  }

  if (rule.frequency === "weekly") {
    const chosen = new Set(rule.weekdays ?? [weekdayOf(base.firstDay)]);
    const firstWeek = startOfWeek(base.firstDay, appLocale);
    const daysOfWeek = (weekStart: CalendarDate) =>
      Array.from({ length: 7 }, (_, offset) => weekStart.add({ days: offset })).filter((day) =>
        chosen.has(weekdayOf(day)),
      );
    const perWeek = daysOfWeek(firstWeek).length;
    const inFirstWeek = daysOfWeek(firstWeek).filter(
      (day) => day.compare(base.firstDay) >= 0,
    ).length;
    const weeksAhead = Math.floor(startOfWeek(earliest, appLocale).compare(firstWeek) / 7);
    const skip = Math.max(0, Math.floor(weeksAhead / interval));
    let index = skip === 0 ? 0 : inFirstWeek + (skip - 1) * perWeek;
    for (let period = skip; ; period += 1) {
      const weekStart = firstWeek.add({ weeks: period * interval });
      if (weekStart.compare(to) > 0) break;
      for (const day of daysOfWeek(weekStart)) {
        if (day.compare(base.firstDay) < 0) continue;
        if (isPast(day, index)) return result;
        add(day, index);
        index += 1;
      }
    }
    return result;
  }

  // Monthly: months without the start day, such as February for the 31st, have no occurrence.
  let index = 0;
  for (let period = 0; ; period += 1) {
    const month = startOfMonth(base.firstDay).add({ months: period * interval });
    if (month.compare(to) > 0) break;
    if (base.firstDay.day > month.calendar.getDaysInMonth(month)) continue;
    const day = month.set({ day: base.firstDay.day });
    if (isPast(day, index)) break;
    add(day, index);
    index += 1;
  }
  return result;
}

function occurrence(base: Placed, day: CalendarDate, index: number): Placed {
  const days = day.compare(base.firstDay);
  const key = base.event.recurrence === undefined ? base.event.id : `${base.event.id}@${day}`;
  if (base.start === undefined || base.end === undefined)
    return {
      ...base,
      key,
      index,
      firstDay: day,
      lastDay: base.lastDay.add({ days }),
    };
  const duration = base.end.toDate().getTime() - base.start.toDate().getTime();
  // Adding calendar days keeps the wall-clock time across daylight saving changes.
  const start = base.start.add({ days });
  const end = start.add({ milliseconds: duration });
  const lastInstant = duration === 0 ? end : end.subtract({ milliseconds: 1 });
  return {
    ...base,
    key,
    index,
    firstDay: toCalendarDate(start),
    lastDay: toCalendarDate(lastInstant),
    start,
    end,
  };
}

function weekdayOf(day: CalendarDate): CalendarWeekday {
  const id = weekdayIds[getDayOfWeek(day, "en-US")];
  if (id === undefined) throw new Error(`EventCalendar: no weekday for ${day.toString()}.`);
  return id;
}

function eventsOn(events: ReadonlyArray<Placed>, day: CalendarDate): ReadonlyArray<Placed> {
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

function formatDay(day: CalendarDate, options: Intl.DateTimeFormatOptions): string {
  return day
    .toDate(appTimeZone)
    .toLocaleDateString(appLocale, { ...options, timeZone: appTimeZone });
}

function formatTime(value: ZonedDateTime): string {
  return value
    .toDate()
    .toLocaleTimeString(appLocale, { hour: "2-digit", minute: "2-digit", timeZone: appTimeZone });
}

function longDay(day: CalendarDate): string {
  return formatDay(day, { weekday: "long", day: "numeric", month: "long" });
}

function periodHeading(view: CalendarView, anchor: CalendarDate): string {
  if (view === "day")
    return formatDay(anchor, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  if (view !== "week") return formatDay(anchor, { month: "long", year: "numeric" });
  const days = weekDays(anchor);
  const first = days[0] ?? anchor;
  const last = days[6] ?? anchor;
  return `${formatDay(first, { day: "numeric", month: "short" })} – ${formatDay(last, { day: "numeric", month: "short", year: "numeric" })}`;
}

function dateRangeLabel(item: Placed): string {
  if (item.start === undefined || item.end === undefined) {
    if (isSameDay(item.firstDay, item.lastDay))
      return `${formatDay(item.firstDay, { weekday: "short", day: "numeric", month: "short" })}, all day`;
    return `${formatDay(item.firstDay, { day: "numeric", month: "short" })} – ${formatDay(item.lastDay, { day: "numeric", month: "short" })}`;
  }
  return `${formatDay(item.firstDay, { weekday: "short", day: "numeric", month: "short" })}, ${formatTime(item.start)} – ${formatTime(item.end)}`;
}

function timeRange(item: Placed): string {
  if (item.start === undefined || item.end === undefined) {
    if (isSameDay(item.firstDay, item.lastDay)) return "All day";
    return `${formatDay(item.firstDay, { day: "numeric", month: "short" })} – ${formatDay(item.lastDay, { day: "numeric", month: "short" })}`;
  }
  return `${formatTime(item.start)} – ${formatTime(item.end)}`;
}

const frequencyUnit = { daily: "day", weekly: "week", monthly: "month" } as const;

/** "Repeats every 2 weeks on Mon, Wed until 30 Nov", in words for labels and the agenda. */
export function recurrenceLabel(rule: CalendarRecurrence): string {
  const interval = rule.interval ?? 1;
  const unit = frequencyUnit[rule.frequency];
  const every = interval === 1 ? `every ${unit}` : `every ${interval} ${unit}s`;
  const days =
    rule.weekdays === undefined
      ? ""
      : ` on ${rule.weekdays.map((day) => day.charAt(0).toUpperCase() + day.slice(1)).join(", ")}`;
  return `Repeats ${every}${days}${seriesEnd(rule)}`;
}

function seriesEnd(rule: CalendarRecurrence): string {
  if (rule.until !== undefined)
    return ` until ${formatDay(parseDate(rule.until), { day: "numeric", month: "short" })}`;
  if (rule.count !== undefined) return `, ${rule.count} times`;
  return "";
}

/** A press on a resize handle starts its own drag, not a move of the whole event. */
function isOnHandle(event: PointerEvent<HTMLElement>): boolean {
  return event.target instanceof Element && event.target.closest("[data-resize-handle]") !== null;
}

function eventLabel(item: Placed, resource: string | undefined): string {
  return [
    item.event.title,
    timeRange(item),
    item.event.meta,
    resource,
    item.event.recurrence === undefined ? undefined : recurrenceLabel(item.event.recurrence),
  ]
    .filter(Boolean)
    .join(", ");
}

function isoInstant(value: ZonedDateTime): string {
  return value.toDate().toISOString().replace(".000Z", "Z");
}

function sameMoment(left: string, right: string): boolean {
  if (left === right) return true;
  const a = Date.parse(left);
  const b = Date.parse(right);
  return !Number.isNaN(a) && a === b;
}

function changeOf(
  item: Placed,
  start: string,
  end: string,
  resourceId?: string,
): CalendarEventChange {
  const resource = resourceId ?? item.event.resourceId;
  return resource === undefined ? { start, end } : { start, end, resourceId: resource };
}

function shiftDays(item: Placed, days: number, resourceId?: string): CalendarEventChange {
  if (item.start === undefined || item.end === undefined)
    return changeOf(
      item,
      parseDate(item.event.start).add({ days }).toString(),
      parseDate(item.event.end).add({ days }).toString(),
      resourceId,
    );
  return changeOf(
    item,
    isoInstant(item.start.add({ days })),
    isoInstant(item.end.add({ days })),
    resourceId,
  );
}

function shiftMinutes(
  item: Placed,
  minutes: number,
  days: number,
  resourceId?: string,
): CalendarEventChange | undefined {
  if (item.start === undefined || item.end === undefined) return undefined;
  return changeOf(
    item,
    isoInstant(item.start.add({ days, minutes })),
    isoInstant(item.end.add({ days, minutes })),
    resourceId,
  );
}

function resizeMinutes(
  item: Placed,
  minutes: number,
  step: number,
): CalendarEventChange | undefined {
  if (item.start === undefined || item.end === undefined) return undefined;
  const shortest = item.start.add({ minutes: step });
  const end = item.end.add({ minutes });
  return changeOf(
    item,
    isoInstant(item.start),
    isoInstant(end.compare(shortest) < 0 ? shortest : end),
  );
}

function resizeDays(item: Placed, lastDay: CalendarDate): CalendarEventChange | undefined {
  if (item.start !== undefined) return undefined;
  const last = lastDay.compare(item.firstDay) < 0 ? item.firstDay : lastDay;
  return changeOf(item, item.event.start, last.add({ days: 1 }).toString());
}

function moveResource(
  item: Placed,
  delta: number,
  resources: ReadonlyArray<CalendarResource> | undefined,
): CalendarEventChange | undefined {
  if (resources === undefined) return undefined;
  const index = resources.findIndex((resource) => resource.id === item.event.resourceId);
  const next = resources[Math.min(resources.length - 1, Math.max(0, index + delta))];
  if (next === undefined || next.id === item.event.resourceId) return undefined;
  return changeOf(item, item.event.start, item.event.end, next.id);
}

/**
 * The change for Alt and an arrow key. Left and Right step a day, or a
 * resource column in the resource day view. Up and Down step `minuteStep` in
 * a time grid, a week in the month view, and a resource row in the resource
 * week view. With Shift, Up and Down change the end of a timed event and
 * Left and Right the last day of an all-day event.
 */
function keyChange(
  key: string,
  withShift: boolean,
  item: Placed,
  mode: ChangeMode,
  step: number,
  resources: ReadonlyArray<CalendarResource> | undefined,
): CalendarEventChange | undefined {
  const isTimed = item.start !== undefined;
  const forward = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
  const horizontal = key === "ArrowLeft" || key === "ArrowRight";
  const vertical = key === "ArrowUp" || key === "ArrowDown";
  if (!horizontal && !vertical) return undefined;
  if (withShift) {
    if (isTimed && vertical) return resizeMinutes(item, forward * step, step);
    if (!isTimed && horizontal) return resizeDays(item, item.lastDay.add({ days: forward }));
    return undefined;
  }
  if (horizontal)
    return mode === "resourceDay"
      ? moveResource(item, forward, resources)
      : shiftDays(item, forward);
  if (mode === "resourceWeek") return moveResource(item, forward, resources);
  if (mode === "month") return shiftDays(item, forward * 7);
  return shiftMinutes(item, forward * step, 0);
}

/** A drag over day cells: the event moves by the days between the cells, and to the cell's resource. */
function cellDragChange(
  item: Placed,
  drag: Extract<DragSpec, { kind: "cell" }>,
  root: HTMLElement,
  event: globalThis.PointerEvent,
): CalendarEventChange | undefined {
  const cell = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest<HTMLElement>("[data-drop-day]");
  const day = cell?.dataset.dropDay;
  if (cell === null || cell === undefined || day === undefined || !root.contains(cell))
    return undefined;
  const target = parseDate(day);
  if (drag.edge === "end") return resizeDays(item, target);
  return shiftDays(item, target.compare(drag.day), cell.dataset.dropResource);
}

/** A drag in a time grid: minutes from the vertical distance, a day or resource from the column. */
function gridDragChange(
  item: Placed,
  drag: Extract<DragSpec, { kind: "grid" }>,
  rects: ReadonlyArray<DOMRect>,
  event: globalThis.PointerEvent,
  originY: number,
  step: number,
): CalendarEventChange | undefined {
  const height = rects[0]?.height ?? 1;
  const minutes = Math.round((((event.clientY - originY) / height) * dayMinutes) / step) * step;
  if (drag.edge === "end") return resizeMinutes(item, minutes, step);
  const hit = rects.findIndex((rect) => event.clientX >= rect.left && event.clientX < rect.right);
  const firstRect = rects[0];
  const fallback = firstRect !== undefined && event.clientX < firstRect.left ? 0 : rects.length - 1;
  const column = drag.columns[hit === -1 ? fallback : hit];
  const origin = drag.columns[drag.column];
  if (column === undefined || origin === undefined) return undefined;
  if (drag.mode === "resourceDay") return shiftMinutes(item, minutes, 0, column.resource?.id);
  return shiftMinutes(item, minutes, column.day.compare(origin.day));
}

interface MonthViewProps {
  readonly anchor: CalendarDate;
  readonly today: CalendarDate;
  readonly events: ReadonlyArray<Placed>;
  readonly onAnchorChange: (date: CalendarDate) => void;
  readonly interaction: Interaction;
  readonly onDayAction: ((date: string) => void) | undefined;
}

const visibleChips = 3;

function MonthView({
  anchor,
  today,
  events,
  onAnchorChange,
  interaction,
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
                      data-drop-day={day.toString()}
                      {...stylex.props(styles.cell, isOutside && styles.cellOutside)}
                    >
                      <AriaButton
                        ref={(element) => {
                          if (element === null) dayRefs.current.delete(day.toString());
                          else dayRefs.current.set(day.toString(), element);
                        }}
                        excludeFromTabOrder={!isFocused}
                        aria-label={`${longDay(day)}${isToday ? ", today" : ""}, ${dayEvents.length === 1 ? "1 event" : `${dayEvents.length} events`}`}
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
                            key={item.key}
                            item={item}
                            day={day}
                            mode="month"
                            interaction={interaction}
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
                                aria-label={longDay(day)}
                                {...stylex.props(styles.moreDialog)}
                              >
                                <p {...stylex.props(styles.moreHeading)}>{longDay(day)}</p>
                                {dayEvents.map((item) => (
                                  <EventChip
                                    key={item.key}
                                    item={item}
                                    day={day}
                                    mode="month"
                                    interaction={interaction}
                                    isDraggable={false}
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
                              key={item.key}
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
        <p {...stylex.props(styles.dayListHeading)}>{longDay(focusDay)}</p>
        {focusedEvents.length === 0 ? (
          <p {...stylex.props(styles.empty)}>No events</p>
        ) : (
          focusedEvents.map((item) => (
            <AgendaRow key={item.key} item={item} interaction={interaction} />
          ))
        )}
      </div>
    </div>
  );
}

function EventChip({
  item,
  day,
  mode,
  interaction,
  isDraggable = true,
}: {
  readonly item: Placed;
  readonly day: CalendarDate;
  readonly mode: ChangeMode;
  readonly interaction: Interaction;
  readonly isDraggable?: boolean;
}) {
  const intent = item.event.intent ?? "accent";
  const isBar = item.start === undefined || !isSameDay(item.firstDay, item.lastDay);
  const canChange = interaction.canChange(item);
  const isLastDay = isSameDay(item.lastDay, day);
  const label = eventLabel(item, interaction.resourceTitle(item.event.resourceId));
  const content = (
    <>
      {isBar ? null : <span aria-hidden {...stylex.props(styles.dot, dotColors[intent])} />}
      {isBar || item.start === undefined || !isSameDay(item.firstDay, day) ? null : (
        <span {...stylex.props(styles.chipTime)}>{formatTime(item.start)}</span>
      )}
      <span {...stylex.props(styles.chipTitle)}>{item.event.title}</span>
      {item.event.recurrence === undefined ? null : (
        <Repeat aria-hidden {...stylex.props(styles.repeatIcon)} />
      )}
    </>
  );
  const chipStyles = [
    styles.chip,
    isBar && styles.chipBar,
    isBar && barColors[intent],
    isBar && !isSameDay(item.firstDay, day) && styles.chipContinues,
    isBar && !isLastDay && styles.chipGoesOn,
  ];
  const onPress = interaction.onPress;
  if (onPress === undefined && !canChange)
    return (
      <span title={label} {...stylex.props(...chipStyles)}>
        <span {...stylex.props(field.hiddenLabel)}>{label}</span>
        <span aria-hidden {...stylex.props(styles.chipInner)}>
          {content}
        </span>
      </span>
    );
  return (
    <div
      onPointerDownCapture={
        canChange && isDraggable
          ? (event) => {
              if (!isOnHandle(event))
                interaction.onPointerDown(event, item, { kind: "cell", day, edge: "move" });
            }
          : undefined
      }
      {...stylex.props(styles.chipWrap)}
    >
      <AriaButton
        data-event-key={item.key}
        aria-label={label}
        onPress={() => onPress?.(item)}
        onKeyDown={(event) => interaction.onKeyDown(event, item, mode)}
        {...renderStyles<{ isFocusVisible: boolean }>((state) => [
          ...chipStyles,
          styles.chipAction,
          canChange && isDraggable && styles.movable,
          state.isFocusVisible && styles.focusRing,
        ])}
      >
        {content}
      </AriaButton>
      {canChange && isDraggable && isBar && item.start === undefined && isLastDay ? (
        <span
          aria-hidden
          data-resize-handle
          onPointerDown={(event) => {
            event.stopPropagation();
            interaction.onPointerDown(event, item, { kind: "cell", day, edge: "end" });
          }}
          {...stylex.props(styles.chipHandle)}
        />
      ) : null}
    </div>
  );
}

interface GridColumn {
  readonly key: string;
  readonly day: CalendarDate;
  readonly resource: CalendarResource | undefined;
  readonly events: ReadonlyArray<Placed>;
}

interface Segment {
  readonly item: Placed;
  readonly startMin: number;
  readonly endMin: number;
  readonly column: number;
  readonly columns: number;
}

/** Packs overlapping timed events of one day into side-by-side columns. */
function daySegments(events: ReadonlyArray<Placed>, day: CalendarDate): ReadonlyArray<Segment> {
  const dayStart = day.toDate(appTimeZone).getTime();
  const timed = events
    .filter((item) => item.start !== undefined && item.end !== undefined)
    .map((item) => ({
      item,
      startMin: Math.max(0, ((item.start?.toDate().getTime() ?? dayStart) - dayStart) / 60_000),
      endMin: Math.min(
        dayMinutes,
        ((item.end?.toDate().getTime() ?? dayStart) - dayStart) / 60_000,
      ),
    }));
  const result: Array<Segment> = [];
  let cluster: Array<{ item: Placed; startMin: number; endMin: number; column: number }> = [];
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

/**
 * Hours down the side and one column per day, or per resource in the
 * resource day view. All-day events sit in a row above the hours.
 */
function TimeGrid({
  columns,
  mode,
  minWidth,
  today,
  now,
  interaction,
  onDayAction,
  scrollToHour,
}: {
  readonly columns: ReadonlyArray<GridColumn>;
  readonly mode: "grid" | "resourceDay";
  readonly minWidth: string;
  readonly today: CalendarDate;
  readonly now: string | undefined;
  readonly interaction: Interaction;
  readonly onDayAction: ((date: string, resourceId?: string) => void) | undefined;
  readonly scrollToHour: number;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const nowInstant = now === undefined ? undefined : parseAbsolute(now, appTimeZone);
  const template = styles.gridColumns(columns.length);

  useEffect(() => {
    const body = bodyRef.current;
    if (body !== null) body.scrollTop = (body.scrollHeight / 24) * scrollToHour;
  }, [scrollToHour]);

  const columnLabel = (column: GridColumn) =>
    column.resource === undefined ? longDay(column.day) : column.resource.title;

  return (
    <div {...stylex.props(styles.weekScroll)}>
      <div {...stylex.props(styles.weekInner, styles.minWidth(minWidth))}>
        <div {...stylex.props(styles.gridRow, template, styles.weekHeader)}>
          <span />
          {columns.map((column) => {
            const isToday = column.resource === undefined && isSameDay(column.day, today);
            return (
              <div key={column.key} {...stylex.props(styles.weekDayHeader)}>
                {column.resource === undefined ? (
                  <>
                    <span {...stylex.props(styles.weekDayName)}>
                      {formatDay(column.day, { weekday: "short" })}
                    </span>
                    <span {...stylex.props(styles.weekDayNumber, isToday && styles.dayNumberToday)}>
                      {column.day.day}
                      {isToday ? <span {...stylex.props(field.hiddenLabel)}>, today</span> : null}
                    </span>
                  </>
                ) : (
                  <span {...stylex.props(styles.resourceHeading)}>
                    <span {...stylex.props(styles.resourceTitle)}>{column.resource.title}</span>
                    {column.resource.meta === undefined ? null : (
                      <span {...stylex.props(styles.resourceMeta)}>{column.resource.meta}</span>
                    )}
                  </span>
                )}
                {onDayAction === undefined ? null : (
                  <AriaButton
                    aria-label={`Add event ${column.resource === undefined ? "on" : "for"} ${columnLabel(column)}`}
                    onPress={() => onDayAction(column.day.toString(), column.resource?.id)}
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
        <div {...stylex.props(styles.gridRow, template, styles.allDayRow)}>
          <span {...stylex.props(styles.gutterLabel)}>All day</span>
          {columns.map((column) => (
            <div
              key={column.key}
              data-drop-day={column.day.toString()}
              data-drop-resource={column.resource?.id}
              {...stylex.props(styles.allDayCell)}
            >
              {column.events
                .filter((item) => item.start === undefined)
                .map((item) => (
                  <EventChip
                    key={item.key}
                    item={item}
                    day={column.day}
                    mode={mode}
                    interaction={interaction}
                  />
                ))}
            </div>
          ))}
        </div>
        <div ref={bodyRef} {...stylex.props(styles.weekBody)}>
          <div {...stylex.props(styles.gridRow, template)}>
            <div aria-hidden {...stylex.props(styles.hours)}>
              {Array.from({ length: 24 }, (_, hour) => (
                <span key={hour} {...stylex.props(styles.hourLabel)}>
                  {hour === 0 ? "" : hourLabel(hour)}
                </span>
              ))}
            </div>
            {columns.map((column, index) => {
              const isToday = isSameDay(column.day, today);
              const nowMin =
                isToday &&
                nowInstant !== undefined &&
                isSameDay(toCalendarDate(nowInstant), column.day)
                  ? nowInstant.hour * 60 + nowInstant.minute
                  : undefined;
              return (
                <div
                  key={column.key}
                  role="group"
                  aria-label={columnLabel(column)}
                  data-grid-column={index}
                  {...stylex.props(
                    styles.dayColumn,
                    isToday && column.resource === undefined && styles.dayColumnToday,
                  )}
                >
                  {daySegments(column.events, column.day).map((segment) => (
                    <TimedEvent
                      key={segment.item.key}
                      segment={segment}
                      drag={{ kind: "grid", column: index, columns, mode, edge: "move" }}
                      mode={mode}
                      interaction={interaction}
                    />
                  ))}
                  {nowMin === undefined ? null : (
                    <span
                      aria-hidden
                      {...stylex.props(styles.nowLine, styles.at(nowMin / dayMinutes))}
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
  drag,
  mode,
  interaction,
}: {
  readonly segment: Segment;
  readonly drag: Extract<DragSpec, { kind: "grid" }>;
  readonly mode: ChangeMode;
  readonly interaction: Interaction;
}) {
  const { item } = segment;
  const intent = item.event.intent ?? "accent";
  const canChange = interaction.canChange(item);
  // Short events put the title and the time on one line so the title stays visible.
  const isCompact = segment.endMin - segment.startMin < 45;
  const position = styles.block(
    segment.startMin / dayMinutes,
    Math.max(segment.endMin - segment.startMin, 20) / dayMinutes,
    segment.column / segment.columns,
    1 / segment.columns,
  );
  const content = (
    <>
      <span {...stylex.props(styles.blockTitle)}>
        {item.event.title}
        {item.event.recurrence === undefined ? null : (
          <Repeat aria-hidden {...stylex.props(styles.repeatIcon)} />
        )}
      </span>
      <span {...stylex.props(styles.blockTime)}>{timeRange(item)}</span>
    </>
  );
  const blockStyles = [
    styles.timed,
    isCompact && styles.timedCompact,
    barColors[intent],
    blockBorders[intent],
  ];
  const onPress = interaction.onPress;
  if (onPress === undefined && !canChange)
    return <div {...stylex.props(...blockStyles, styles.timedFill, position)}>{content}</div>;
  // Only the part of the event inside this day can be dragged here; its lower edge is the real end.
  const endsToday =
    item.end !== undefined &&
    segment.endMin < dayMinutes &&
    isSameDay(item.lastDay, drag.columns[drag.column]?.day ?? item.lastDay);
  return (
    <div
      onPointerDownCapture={
        canChange
          ? (event) => {
              if (!isOnHandle(event)) interaction.onPointerDown(event, item, drag);
            }
          : undefined
      }
      {...stylex.props(styles.timedWrap, position)}
    >
      <AriaButton
        data-event-key={item.key}
        aria-label={eventLabel(item, interaction.resourceTitle(item.event.resourceId))}
        onPress={() => onPress?.(item)}
        onKeyDown={(event) => interaction.onKeyDown(event, item, mode)}
        {...renderStyles<{ isFocusVisible: boolean }>((state) => [
          ...blockStyles,
          styles.timedFill,
          styles.chipAction,
          canChange && styles.movable,
          state.isFocusVisible && styles.focusRing,
        ])}
      >
        {content}
      </AriaButton>
      {canChange && endsToday ? (
        <span
          aria-hidden
          data-resize-handle
          onPointerDown={(event) => {
            event.stopPropagation();
            interaction.onPointerDown(event, item, { ...drag, edge: "end" });
          }}
          {...stylex.props(styles.blockHandle)}
        />
      ) : null}
    </div>
  );
}

/** One row per resource and one column per day, for rotas such as on-call shifts. */
function ResourceWeek({
  anchor,
  today,
  resources,
  events,
  interaction,
  onDayAction,
}: {
  readonly anchor: CalendarDate;
  readonly today: CalendarDate;
  readonly resources: ReadonlyArray<CalendarResource>;
  readonly events: ReadonlyArray<Placed>;
  readonly interaction: Interaction;
  readonly onDayAction: ((date: string, resourceId?: string) => void) | undefined;
}) {
  const days = weekDays(anchor);
  return (
    <div {...stylex.props(styles.weekScroll)}>
      <div {...stylex.props(styles.weekInner, styles.minWidth("46rem"))}>
        <div {...stylex.props(styles.resourceRow, styles.weekHeader)}>
          <span {...stylex.props(styles.resourceCorner)}>Resource</span>
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
                    aria-label={`Add event on ${longDay(day)}`}
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
        {resources.map((resource) => {
          const own = events.filter((item) => item.event.resourceId === resource.id);
          return (
            <div
              key={resource.id}
              role="group"
              aria-label={resource.title}
              {...stylex.props(styles.resourceRow, styles.resourceLine)}
            >
              <span {...stylex.props(styles.resourceName)}>
                <span {...stylex.props(styles.resourceTitle)}>{resource.title}</span>
                {resource.meta === undefined ? null : (
                  <span {...stylex.props(styles.resourceMeta)}>{resource.meta}</span>
                )}
              </span>
              {days.map((day) => (
                <div
                  key={day.toString()}
                  data-drop-day={day.toString()}
                  data-drop-resource={resource.id}
                  {...stylex.props(
                    styles.resourceCell,
                    isSameDay(day, today) && styles.dayColumnToday,
                  )}
                >
                  {eventsOn(own, day).map((item) => (
                    <EventChip
                      key={item.key}
                      item={item}
                      day={day}
                      mode="resourceWeek"
                      interaction={interaction}
                    />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({
  anchor,
  today,
  events,
  interaction,
}: {
  readonly anchor: CalendarDate;
  readonly today: CalendarDate;
  readonly events: ReadonlyArray<Placed>;
  readonly interaction: Interaction;
}) {
  const days: Array<CalendarDate> = [];
  for (
    let day = startOfMonth(anchor);
    day.compare(endOfMonth(anchor)) <= 0;
    day = day.add({ days: 1 })
  )
    if (eventsOn(events, day).length > 0) days.push(day);
  if (days.length === 0)
    return (
      <p {...stylex.props(styles.empty)}>
        No events in {formatDay(anchor, { month: "long", year: "numeric" })}.
      </p>
    );
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
              <AgendaRow key={item.key} item={item} interaction={interaction} />
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

function AgendaRow({
  item,
  interaction,
}: {
  readonly item: Placed;
  readonly interaction: Interaction;
}) {
  const resource = interaction.resourceTitle(item.event.resourceId);
  const meta = [
    item.event.meta,
    resource,
    item.event.recurrence === undefined ? undefined : recurrenceLabel(item.event.recurrence),
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
  const content: ReactNode = (
    <>
      <span {...stylex.props(styles.agendaTime)}>{timeRange(item)}</span>
      <span aria-hidden {...stylex.props(styles.dot, dotColors[item.event.intent ?? "accent"])} />
      <span {...stylex.props(styles.agendaText)}>
        <span {...stylex.props(styles.agendaTitle)}>{item.event.title}</span>
        {meta === "" ? null : <span {...stylex.props(styles.agendaMeta)}>{meta}</span>}
      </span>
    </>
  );
  const onPress = interaction.onPress;
  if (onPress === undefined && !interaction.canChange(item))
    return <div {...stylex.props(styles.agendaRow)}>{content}</div>;
  return (
    <AriaButton
      data-event-key={item.key}
      onPress={() => onPress?.(item)}
      onKeyDown={(event) => interaction.onKeyDown(event, item, "month")}
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
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  icon: { width: size.icon, height: size.icon },
  iconSm: { width: size.iconSm, height: size.iconSm },
  hint: { margin: 0, fontSize: font.sm, color: color.textMuted },
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
  chipWrap: { position: "relative", display: "flex", minWidth: 0 },
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
  chipGoesOn: { borderStartEndRadius: 0, borderEndEndRadius: 0 },
  chipAction: { cursor: "pointer", outlineStyle: "none" },
  movable: { cursor: "grab", userSelect: "none" },
  chipHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: "0.375rem",
    borderRadius: radius.sm,
    cursor: "ew-resize",
    touchAction: "none",
    backgroundColor: { default: "transparent", ":hover": color.focus },
  },
  chipTime: { flexShrink: 0, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  chipTitle: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  repeatIcon: {
    width: "0.75rem",
    height: "0.75rem",
    flexShrink: 0,
    marginInlineStart: "auto",
    opacity: 0.7,
  },
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
  minWidth: (value: string) => ({ minWidth: value }),
  gridRow: { display: "grid" },
  gridColumns: (count: number) => ({
    gridTemplateColumns: `3.5rem repeat(${count}, minmax(0, 1fr))`,
  }),
  weekHeader: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  weekDayHeader: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    minWidth: 0,
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
  resourceHeading: { display: "flex", flexDirection: "column", minWidth: 0 },
  resourceTitle: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: font.md,
    fontWeight: font.medium,
    color: color.text,
  },
  resourceMeta: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: font.xs,
    color: color.textMuted,
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0,
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
  timedWrap: { position: "absolute", display: "flex" },
  timedFill: { width: "100%", height: "100%" },
  timedCompact: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingBlock: 0 },
  timed: {
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
  blockHandle: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
    height: "0.375rem",
    borderRadius: radius.sm,
    cursor: "ns-resize",
    touchAction: "none",
    backgroundColor: { default: "transparent", ":hover": color.focus },
  },
  block: (top: number, height: number, left: number, width: number) => ({
    top: `${top * 100}%`,
    height: `calc(${height * 100}% - 2px)`,
    left: `calc(${left * 100}% + 2px)`,
    width: `calc(${width * 100}% - 4px)`,
  }),
  blockTitle: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
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
  resourceRow: {
    display: "grid",
    gridTemplateColumns: {
      default: "7rem repeat(7, minmax(0, 1fr))",
      [media.md]: "10rem repeat(7, minmax(0, 1fr))",
    },
  },
  resourceLine: {
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  resourceCorner: {
    alignSelf: "end",
    paddingInline: space.sm,
    paddingBlock: space.sm,
    fontSize: font.xs,
    color: color.textMuted,
  },
  resourceName: {
    position: "sticky",
    left: 0,
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 0,
    paddingInline: space.sm,
    paddingBlock: space.xs,
    backgroundColor: color.raised,
  },
  resourceCell: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
    minHeight: "3rem",
    padding: "2px",
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
  },
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
