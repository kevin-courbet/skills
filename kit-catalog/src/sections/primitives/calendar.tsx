import { useState } from "react";
import { Calendar, RangeCalendar } from "@/components/primitives/calendar";
import type { DateRange } from "@/components/primitives/date-range-picker";
import { Card, DescriptionList } from "@/components/primitives/layout";
import { appLocale } from "@/lib/locale";
import { defineSection, Labeled, Row } from "../../specimen";

const today = "2026-11-16";
const stockTakeDays = new Set(["2026-11-27", "2026-11-28"]);
const publicHolidays = new Set(["2026-12-25", "2026-12-26", "2027-01-01"]);

const longDate = new Intl.DateTimeFormat(appLocale, { dateStyle: "full", timeZone: "UTC" });

function formatIsoDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}

function isSunday(isoDate: string): boolean {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay() === 0;
}

function workshopClosedReason(isoDate: string): string | null {
  if (publicHolidays.has(isoDate)) return "The workshop is closed on public holidays";
  if (stockTakeDays.has(isoDate)) return "The workshop is closed for the stock take";
  if (isSunday(isoDate)) return "The workshop is closed on Sundays";
  return null;
}

function VisitBooking() {
  const [visitDate, setVisitDate] = useState<string | null>("2026-11-20");
  return (
    <Card title="Book a service visit" description="Work order WO-4821, Canyon Endurace CF 7">
      <Row align="start">
        <Calendar
          label="Visit date"
          value={visitDate}
          onChange={setVisitDate}
          minValue={today}
          unavailableReason={workshopClosedReason}
        />
        <DescriptionList
          items={[
            {
              term: "Visit date",
              detail: visitDate === null ? "No date picked" : formatIsoDate(visitDate),
            },
            { term: "Mechanic", detail: "Marco Rossi" },
            { term: "Service", detail: "Full service and brake bleed" },
          ]}
        />
      </Row>
    </Card>
  );
}

function MechanicLeave() {
  const [leave, setLeave] = useState<DateRange | null>({ start: "2026-12-21", end: "2027-01-03" });
  return (
    <Card title="Leave of Marco Rossi">
      <Row align="start">
        <RangeCalendar label="Leave of Marco Rossi" value={leave} onChange={setLeave} />
        <DescriptionList
          items={[
            {
              term: "First day",
              detail: leave === null ? "No range picked" : formatIsoDate(leave.start),
            },
            {
              term: "Last day",
              detail: leave === null ? "No range picked" : formatIsoDate(leave.end),
            },
          ]}
        />
      </Row>
    </Card>
  );
}

function PickupWindow() {
  const [pickup, setPickup] = useState<string | null>(null);
  return (
    <Card title="Pickup of the repaired bike" description="Pickup is possible in the next 3 weeks.">
      <Row align="start">
        <Calendar
          label="Pickup date"
          value={pickup}
          onChange={setPickup}
          minValue={today}
          maxValue="2026-12-07"
          unavailableReason={workshopClosedReason}
        />
        <DescriptionList
          items={[
            {
              term: "Pickup date",
              detail: pickup === null ? "No date picked" : formatIsoDate(pickup),
            },
          ]}
        />
      </Row>
    </Card>
  );
}

export default defineSection({
  component: "Calendar",
  specimens: [
    {
      title: "Date with unavailable days",
      note: "Give each unavailable date a reason. The line under the grid shows it for the date under the pointer or the focus.",
      render: () => <VisitBooking />,
    },
    {
      title: "RangeCalendar",
      note: "The first press starts the range and the second press ends it. A range can cross months and years.",
      render: () => <MechanicLeave />,
    },
    {
      title: "Empty, with limits",
      note: "Dates before minValue and after maxValue cannot get the focus. The year grid shows only the years between the limits.",
      render: () => <PickupWindow />,
    },
    {
      title: "Disabled and read-only",
      wide: true,
      render: () => (
        <Row align="start">
          <Labeled label="isDisabled">
            <Calendar label="Visit date" value="2026-11-20" onChange={() => {}} isDisabled />
          </Labeled>
          <Labeled label="isReadOnly">
            <Calendar label="Visit date" value="2026-11-20" onChange={() => {}} isReadOnly />
          </Labeled>
          <Labeled label="RangeCalendar isReadOnly">
            <RangeCalendar
              label="Leave of Marco Rossi"
              value={{ start: "2026-11-23", end: "2026-11-27" }}
              onChange={() => {}}
              isReadOnly
            />
          </Labeled>
        </Row>
      ),
    },
  ],
});
