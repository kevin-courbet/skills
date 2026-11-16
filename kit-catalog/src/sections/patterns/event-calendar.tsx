import { useState } from "react";
import {
  type CalendarEvent,
  type CalendarEventChange,
  type CalendarOccurrence,
  type CalendarRecurrence,
  type CalendarResource,
  EventCalendar,
  type EventCalendarProps,
  recurrenceLabel,
} from "@/components/patterns/event-calendar";
import { DescriptionList } from "@/components/primitives/layout";
import { Sheet } from "@/components/primitives/sheet";
import { appLocale, appTimeZone, formatDateTime } from "@/lib/locale";
import { Column, defineSection } from "../../specimen";

const today = "2026-11-18";
const now = "2026-11-18T11:20:00Z";

const mechanics: ReadonlyArray<CalendarResource> = [
  { id: "ines", title: "Ines Duarte", meta: "Wheels and brakes" },
  { id: "tomas", title: "Tomas Berg", meta: "E-bikes" },
  { id: "ana", title: "Ana Reyes", meta: "Overhauls" },
];

const partsDelivery: CalendarRecurrence = {
  frequency: "weekly",
  weekdays: ["tue", "fri"],
  until: "2026-12-18",
};
const stockCount: CalendarRecurrence = { frequency: "monthly", count: 6 };

/** Work orders of the mechanics. The bookings calendar and the mechanic schedule show the same ones. */
const workOrders: ReadonlyArray<CalendarEvent> = [
  {
    id: "wo-2041",
    title: "Full service: Trek Domane",
    start: "2026-11-16T09:00:00Z",
    end: "2026-11-16T10:30:00Z",
    meta: "Marc Laurent, bay 1",
    resourceId: "ana",
  },
  {
    id: "wo-2042",
    title: "Wheel truing",
    start: "2026-11-16T11:00:00Z",
    end: "2026-11-16T11:45:00Z",
    meta: "Sade Okafor, bay 2",
    resourceId: "ines",
  },
  {
    id: "wo-2046",
    title: "Tubeless setup",
    start: "2026-11-17T10:00:00Z",
    end: "2026-11-17T11:00:00Z",
    meta: "Kenji Ito, bay 2",
    resourceId: "ines",
  },
  {
    id: "wo-2043",
    title: "E-bike diagnostics: Riverside Couriers",
    start: "2026-11-18T08:30:00Z",
    end: "2026-11-18T10:00:00Z",
    intent: "info",
    meta: "Fleet contract, bay 3",
    resourceId: "tomas",
  },
  {
    id: "wo-2044",
    title: "Overhaul: Brompton C Line",
    start: "2026-11-18T10:00:00Z",
    end: "2026-11-18T13:00:00Z",
    intent: "accent",
    meta: "Jin Park, bay 1",
    resourceId: "ana",
  },
  {
    id: "wo-2045",
    title: "Brake bleed",
    start: "2026-11-18T10:30:00Z",
    end: "2026-11-18T11:30:00Z",
    meta: "Alice Moreau, bay 2",
    resourceId: "ines",
  },
  {
    id: "wo-2047",
    title: "Wheel rebuild, rear",
    start: "2026-11-18T13:30:00Z",
    end: "2026-11-18T15:30:00Z",
    intent: "warning",
    meta: "Rim back-ordered, bay 2",
    resourceId: "ines",
  },
  {
    id: "wo-2048",
    title: "Motor firmware update",
    start: "2026-11-18T14:00:00Z",
    end: "2026-11-18T15:00:00Z",
    intent: "info",
    meta: "Bosch Performance CX, bay 3",
    resourceId: "tomas",
  },
  {
    id: "wo-2049",
    title: "Headset replacement",
    start: "2026-11-19T10:00:00Z",
    end: "2026-11-19T11:30:00Z",
    meta: "Omar Haddad, bay 1",
    resourceId: "ana",
  },
  {
    id: "wo-2051",
    title: "Spoke tension check",
    start: "2026-11-19T14:00:00Z",
    end: "2026-11-19T15:00:00Z",
    meta: "Noah Weber, bay 2",
    resourceId: "ines",
  },
  {
    id: "wo-2050",
    title: "Battery health check",
    start: "2026-11-20T09:00:00Z",
    end: "2026-11-20T09:45:00Z",
    intent: "info",
    meta: "Riverside Couriers, bay 3",
    resourceId: "tomas",
  },
];

const bookings: ReadonlyArray<CalendarEvent> = [
  ...workOrders,
  {
    id: "wo-2039",
    title: "Overdue pickup: Specialized Turbo Vado",
    start: "2026-11-17T17:30:00Z",
    end: "2026-11-17T18:00:00Z",
    intent: "danger",
    meta: "Paul Girard, front desk",
  },
  {
    id: "fit-118",
    title: "Bike fitting session",
    start: "2026-11-19T16:00:00Z",
    end: "2026-11-19T17:00:00Z",
    intent: "success",
    meta: "Lena Novak, fitting room",
  },
  {
    id: "fleet-riverside",
    title: "Cargo bike fleet service: Riverside Couriers",
    start: "2026-11-23",
    end: "2026-11-26",
    allDay: true,
    intent: "info",
    meta: "12 bikes, all bays",
  },
  {
    id: "sale-black-friday",
    title: "Black Friday sale",
    start: "2026-11-27",
    end: "2026-11-28",
    allDay: true,
    intent: "success",
    meta: "Shop floor",
  },
  {
    id: "closed-training",
    title: "Shop closed: staff training",
    start: "2026-11-11",
    end: "2026-11-12",
    allDay: true,
    intent: "warning",
    meta: "All staff",
  },
  {
    id: "parts-shimano",
    title: "Parts delivery: Shimano",
    start: "2026-11-03T08:00:00Z",
    end: "2026-11-03T08:30:00Z",
    recurrence: partsDelivery,
    meta: "Loading dock",
  },
  {
    id: "stock-count",
    title: "Monthly stock count",
    start: "2026-11-27T17:00:00Z",
    end: "2026-11-27T19:00:00Z",
    recurrence: stockCount,
    intent: "warning",
    meta: "Parts store",
  },
];

const rules: ReadonlyArray<{ readonly name: string; readonly rule: CalendarRecurrence }> = [
  { name: "Team stand-up", rule: { frequency: "daily" } },
  { name: "Parts delivery: Shimano", rule: partsDelivery },
  {
    name: "Workshop deep clean",
    rule: { frequency: "weekly", interval: 2, weekdays: ["mon", "wed"], count: 6 },
  },
  { name: "Monthly stock count", rule: stockCount },
  { name: "Tool calibration", rule: { frequency: "monthly", interval: 3, until: "2027-12-31" } },
];

const dateFormat = new Intl.DateTimeFormat(appLocale, {
  dateStyle: "medium",
  timeZone: appTimeZone,
});

function occurrenceWhen(occurrence: CalendarOccurrence): string {
  if (occurrence.event.allDay === true)
    return `All day from ${dateFormat.format(new Date(occurrence.start))}`;
  return `${formatDateTime(occurrence.start)} to ${formatDateTime(occurrence.end)}`;
}

function applyChange(event: CalendarEvent, change: CalendarEventChange): CalendarEvent {
  return change.resourceId === undefined
    ? { ...event, start: change.start, end: change.end }
    : { ...event, start: change.start, end: change.end, resourceId: change.resourceId };
}

type WorkshopCalendarProps = Omit<
  EventCalendarProps,
  "events" | "today" | "onEventAction" | "onEventChange" | "onDayAction"
> & {
  readonly initialEvents: ReadonlyArray<CalendarEvent>;
  /** Makes single events movable. Without it the calendar is read-only. */
  readonly isMovable?: boolean;
  readonly canAddBooking?: boolean;
};

function WorkshopCalendar({
  initialEvents,
  isMovable = false,
  canAddBooking = false,
  ...props
}: WorkshopCalendarProps) {
  const [events, setEvents] = useState(initialEvents);
  const [open, setOpen] = useState<CalendarOccurrence | null>(null);
  const [newBooking, setNewBooking] = useState<string | null>(null);
  const resourceTitle = (id: string | undefined) =>
    mechanics.find((mechanic) => mechanic.id === id)?.title;

  return (
    <Column>
      <EventCalendar
        {...props}
        events={events}
        today={today}
        onEventAction={(_event, occurrence) => setOpen(occurrence)}
        onEventChange={
          isMovable
            ? (event, change) =>
                setEvents((current) =>
                  current.map((item) => (item.id === event.id ? applyChange(item, change) : item)),
                )
            : undefined
        }
        onDayAction={
          canAddBooking
            ? (date, resourceId) =>
                setNewBooking(
                  [`New booking on ${dateFormat.format(new Date(date))}`, resourceTitle(resourceId)]
                    .filter((part) => part !== undefined)
                    .join(" for "),
                )
            : undefined
        }
      />
      {newBooking === null ? null : <p role="status">{newBooking}</p>}
      {open === null ? null : (
        <Sheet
          size="peek"
          isOpen
          onOpenChange={(isOpen) => isOpen || setOpen(null)}
          title={open.event.title}
        >
          <DescriptionList
            items={[
              { term: "When", detail: occurrenceWhen(open) },
              { term: "Details", detail: open.event.meta ?? "None" },
              ...(open.event.resourceId === undefined
                ? []
                : [
                    {
                      term: "Mechanic",
                      detail: resourceTitle(open.event.resourceId) ?? "Not assigned",
                    },
                  ]),
              ...(open.event.recurrence === undefined
                ? []
                : [{ term: "Repeats", detail: recurrenceLabel(open.event.recurrence) }]),
            ]}
          />
        </Sheet>
      )}
    </Column>
  );
}

export default defineSection({
  component: "EventCalendar",
  specimens: [
    {
      title: "Month view",
      wide: true,
      note: 'Wednesday 18 November has five bookings, so the day shows three and a "2 more" button. Drag a single event to another day. Recurring events do not move.',
      render: () => (
        <WorkshopCalendar label="Workshop bookings" initialEvents={bookings} now={now} isMovable />
      ),
    },
    {
      title: "Week view with the current time",
      wide: true,
      note: "Overlapping bookings sit side by side, and a line marks `now`. Drag an event or its lower edge in steps of 15 minutes.",
      render: () => (
        <WorkshopCalendar
          label="Workshop bookings"
          initialEvents={bookings}
          defaultView="week"
          now={now}
          isMovable
        />
      ),
    },
    {
      title: "Resource day view",
      wide: true,
      note: "One time column for each mechanic. The add button of a column calls `onDayAction` with the mechanic id.",
      render: () => (
        <WorkshopCalendar
          label="Mechanic schedule"
          initialEvents={workOrders}
          resources={mechanics}
          views={["day", "week"]}
          defaultView="day"
          now={now}
          isMovable
          canAddBooking
        />
      ),
    },
    {
      title: "Resource week view",
      wide: true,
      note: "One row for each mechanic. Alt with Up or Down moves the focused event to the row beside it.",
      render: () => (
        <WorkshopCalendar
          label="Mechanic schedule"
          initialEvents={workOrders}
          resources={mechanics}
          views={["day", "week"]}
          defaultView="week"
          isMovable
        />
      ),
    },
    {
      title: "Agenda view, read-only",
      wide: true,
      note: "Without `onEventChange` the events do not move and the hint under the calendar does not show.",
      render: () => (
        <WorkshopCalendar
          label="Workshop bookings"
          initialEvents={bookings}
          views={["agenda", "month"]}
          defaultView="agenda"
        />
      ),
    },
    {
      title: "Agenda without events",
      wide: true,
      note: "The agenda view says when the month has no events.",
      render: () => (
        <WorkshopCalendar
          label="Workshop bookings"
          initialEvents={[]}
          views={["agenda", "month"]}
          defaultView="agenda"
          defaultDate="2027-01-12"
        />
      ),
    },
    {
      title: "Recurrence labels",
      note: "`recurrenceLabel` gives a rule in words for a form or a detail sheet.",
      render: () => (
        <Column width="36rem">
          <DescriptionList
            items={rules.map(({ name, rule }) => ({ term: name, detail: recurrenceLabel(rule) }))}
          />
        </Column>
      ),
    },
  ],
});
