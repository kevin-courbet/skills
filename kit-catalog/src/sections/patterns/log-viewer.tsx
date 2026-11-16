import { useState } from "react";
import { Code, Card, CardSection } from "@/components/primitives/layout";
import { Select } from "@/components/primitives/select";
import { EmptyState } from "@/components/primitives/feedback";
import {
  LogViewer,
  type LogLevel,
  type LogLevelFilter,
  type LogLine,
} from "@/components/patterns/log-viewer";
import { Column, defineSection } from "../../specimen";

type LineSpec = readonly [seconds: number, level: LogLevel, source: string, text: string];

function toLines(
  prefix: string,
  start: string,
  specs: ReadonlyArray<LineSpec>,
): ReadonlyArray<LogLine> {
  const startMs = Date.parse(start);
  return specs.map(([seconds, level, source, text], index) => ({
    id: `${prefix}-${index + 1}`,
    at: new Date(startMs + seconds * 1000).toISOString(),
    level,
    source,
    text,
  }));
}

const bookingLines = toLines("booking", "2026-11-16T07:00:00.000Z", [
  [0.2, "info", "booking-api", "Starting booking service v3.8.1 on port 8080"],
  [0.4, "debug", "booking-api", "Loaded opening hours: Mon-Sat 09:00-18:30, Sun closed"],
  [0.6, "info", "scheduler", "Loaded 4 mechanics and 6 repair bays for 2026-11-16"],
  [1.1, "info", "booking-api", "Connected to database shop_prod (pool size 10)"],
  [2.0, "info", "booking-api", "GET /api/slots?date=2026-11-16 200 in 38 ms"],
  [
    4.3,
    "info",
    "booking-api",
    "POST /api/bookings customer=C-1182 service=full-tune-up 201 in 112 ms",
  ],
  [4.4, "info", "scheduler", "Booked bay 2 with Inès Laurent, 09:30-11:00, work order WO-2381"],
  [4.6, "info", "sms-worker", "Queued booking confirmation SMS to customer C-1182"],
  [5.2, "info", "sms-worker", "Sent SMS confirmation for WO-2381"],
  [9.8, "info", "booking-api", "GET /api/slots?date=2026-11-17 200 in 41 ms"],
  [12.1, "debug", "scheduler", "Slot cache hit for 2026-11-17 (12 free slots)"],
  [
    15.7,
    "info",
    "booking-api",
    "POST /api/bookings customer=C-0907 service=brake-bleed 201 in 98 ms",
  ],
  [15.8, "info", "scheduler", "Booked bay 4 with Marc Dubois, 11:00-11:45, work order WO-2382"],
  [16.0, "warn", "sms-worker", "SMS provider answered in 4.2 s, above the 3 s budget"],
  [16.1, "info", "sms-worker", "Sent SMS confirmation for WO-2382"],
  [22.4, "info", "booking-api", "GET /api/bookings/WO-2379 200 in 12 ms"],
  [25.9, "info", "booking-api", "PATCH /api/bookings/WO-2379 status=bike-received 200 in 27 ms"],
  [31.3, "info", "booking-api", "GET /api/slots?date=2026-11-16 200 in 35 ms"],
  [
    33.0,
    "info",
    "booking-api",
    "POST /api/bookings customer=C-1240 service=wheel-true 201 in 104 ms",
  ],
  [33.1, "error", "scheduler", "Bay 3 is double-booked 14:00-14:30: WO-2383 overlaps WO-2377"],
  [33.1, "error", "scheduler", "Rolled back booking WO-2383 and released the slot"],
  [33.2, "info", "booking-api", "Returned 409 Conflict to customer C-1240 with 3 other slots"],
  [
    41.6,
    "info",
    "booking-api",
    "POST /api/bookings customer=C-1240 service=wheel-true 201 in 96 ms",
  ],
  [41.7, "info", "scheduler", "Booked bay 1 with Sofia Marin, 14:30-15:00, work order WO-2384"],
  [41.9, "info", "sms-worker", "Sent SMS confirmation for WO-2384"],
  [48.2, "debug", "scheduler", "Recomputed free slots for 2026-11-16 (7 free slots)"],
  [
    55.0,
    "warn",
    "booking-api",
    "Customer C-0311 has 2 bookings on the same day, flagged for the front desk",
  ],
  [61.4, "info", "booking-api", "GET /api/bookings?mechanic=ines-laurent 200 in 22 ms"],
  [
    70.8,
    "info",
    "booking-api",
    "DELETE /api/bookings/WO-2370 reason=customer-cancelled 204 in 31 ms",
  ],
  [70.9, "info", "scheduler", "Released bay 2, 16:00-17:30, for 2026-11-18"],
  [71.2, "info", "sms-worker", "Sent cancellation SMS for WO-2370"],
  [80.5, "info", "booking-api", "Health check passed: database 4 ms, SMS provider 210 ms"],
  [90.0, "info", "booking-api", "GET /api/slots?date=2026-11-19 200 in 44 ms"],
  [
    93.7,
    "info",
    "booking-api",
    "POST /api/bookings customer=C-1251 service=e-bike-diagnostic 201 in 131 ms",
  ],
  [93.8, "info", "scheduler", "Booked bay 5 with Marc Dubois, 10:00-11:30, work order WO-2385"],
  [94.0, "info", "sms-worker", "Sent SMS confirmation for WO-2385"],
]);

const invoiceLines = toLines("invoice", "2026-11-16T18:30:00.000Z", [
  [0.1, "info", "export", "Starting daily invoice export for 2026-11-16"],
  [0.9, "info", "export", "Found 23 issued invoices, 2 credit notes"],
  [1.8, "info", "export", "Rendered 25 PDF files to invoices/2026-11-16/"],
  [2.6, "info", "export", "Uploaded the export to the accounting folder"],
  [2.7, "info", "export", "Daily invoice export finished in 2.6 s"],
]);

const syncLines = toLines("sync", "2026-11-16T02:00:00.000Z", [
  [0.0, "info", "parts-sync", "Fetching the price list from Velo Supply"],
  [3.4, "info", "parts-sync", "Received 4,812 parts in 3.4 s"],
  [3.9, "info", "parts-sync", "Updated prices of 214 parts"],
  [
    4.1,
    "warn",
    "parts-sync",
    "Part SH-CN-HG601 (Shimano 11-speed chain) is discontinued at the supplier",
  ],
  [4.4, "info", "parts-sync", "Marked 3 parts out of stock at the supplier"],
  [5.0, "info", "stock", "Reserved 2 brake pads for WO-2381"],
  [5.3, "info", "stock", "Stock of SRAM PG-1130 cassette is 1, below the reorder point of 2"],
  [5.6, "info", "stock", "Created draft purchase order PO-0418 for 6 parts"],
  [6.0, "info", "parts-sync", "Waiting for the next page of the price list"],
]);

const plainLines: ReadonlyArray<LogLine> = [
  { id: "plain-1", text: "$ bun run migrate" },
  { id: "plain-2", text: "Applied 0042_add_work_order_bay.sql" },
  { id: "plain-3", text: "Applied 0043_invoice_due_date_index.sql" },
  { id: "plain-4", text: "2 migrations applied in 184 ms" },
];

const stageOptions = [
  { id: "all", label: "All services" },
  { id: "booking-api", label: "booking-api" },
  { id: "scheduler", label: "scheduler" },
  { id: "sms-worker", label: "sms-worker" },
] as const;

type Stage = (typeof stageOptions)[number]["id"];

function ControlledSearch() {
  const [query, setQuery] = useState("WO-238");
  const [level, setLevel] = useState<LogLevelFilter>("all");
  return (
    <LogViewer
      label="Booking service output"
      title="Booking service"
      lines={bookingLines}
      emptyState={<EmptyState title="No output from the booking service yet" />}
      query={query}
      onQueryChange={setQuery}
      level={level}
      onLevelChange={setLevel}
      maxVisibleLines={10}
    />
  );
}

function ServiceFilter() {
  const [stage, setStage] = useState<Stage>("scheduler");
  const lines =
    stage === "all" ? bookingLines : bookingLines.filter((line) => line.source === stage);
  return (
    <LogViewer
      label="Booking service output"
      title="Booking service"
      lines={lines}
      emptyState={<EmptyState title="No output from this service yet" />}
      filters={
        <Select
          label="Service"
          hideLabel
          options={stageOptions}
          value={stage}
          onChange={setStage}
          width="sm"
        />
      }
      maxVisibleLines={10}
      footnote="Retained for 14 days"
      footerEnd={<Code>deploy 3.8.1, pod booking-api-7c9f</Code>}
    />
  );
}

function NoMatch() {
  const [query, setQuery] = useState("derailleur hanger");
  const [level, setLevel] = useState<LogLevelFilter>("problems");
  return (
    <LogViewer
      label="Booking service output"
      title="Booking service"
      lines={bookingLines}
      emptyState={<EmptyState title="No output from the booking service yet" />}
      query={query}
      onQueryChange={setQuery}
      level={level}
      onLevelChange={setLevel}
    />
  );
}

export default defineSection({
  component: "LogViewer",
  specimens: [
    {
      title: "Service log with problems",
      note: "The output opens at the first error line. The level switch shows because the log has warnings and errors.",
      wide: true,
      render: () => (
        <LogViewer
          label="Booking service output"
          title="Booking service"
          lines={bookingLines}
          emptyState={<EmptyState title="No output from the booking service yet" />}
          downloadName="booking-service-2026-11-16.log"
          footnote="Retained for 14 days"
        />
      ),
    },
    {
      title: "Controlled search and level",
      note: "Pass query with onQueryChange and level with onLevelChange to keep them in the URL. Then a link shows the same lines.",
      wide: true,
      render: () => <ControlledSearch />,
    },
    {
      title: "Extra filters and footer end",
      note: "Controls in filters take the sm size of the header row.",
      wide: true,
      render: () => <ServiceFilter />,
    },
    {
      title: "Embedded in a Card",
      note: "Inside a Card, use variant embedded in a CardSection with flush padding.",
      wide: true,
      render: () => (
        <Card
          title="Daily invoice export"
          description="Run on 16 Nov 2026, 18:30"
          layout="sections"
        >
          <CardSection padding="flush">
            <LogViewer
              label="Invoice export output"
              lines={invoiceLines}
              emptyState={<EmptyState title="Waiting for the export job" />}
              variant="embedded"
              footnote="Retained for 30 days"
            />
          </CardSection>
        </Card>
      ),
    },
    {
      title: "Following a running job",
      note: "With follow, the newest line stays in view. Scroll up to show the Follow output button.",
      wide: true,
      render: () => (
        <LogViewer
          label="Parts sync output"
          title="Nightly parts sync"
          lines={syncLines}
          emptyState={<EmptyState title="No output yet" description="The sync starts at 02:00." />}
          follow
          maxVisibleLines={5}
          downloadName="parts-sync-2026-11-16.log"
        />
      ),
    },
    {
      title: "No matching lines",
      wide: true,
      render: () => <NoMatch />,
    },
    {
      title: "Empty and plain output",
      note: "Without times, sources, or levels, a line shows only its number and text.",
      wide: true,
      render: () => (
        <Column>
          <LogViewer
            label="Parts sync output"
            title="Nightly parts sync"
            lines={[]}
            emptyState={
              <EmptyState title="No output yet" description="The sync starts at 02:00." />
            }
          />
          <LogViewer
            label="Migration output"
            title="Database migration"
            lines={plainLines}
            emptyState={<EmptyState title="No output from the migration yet" />}
          />
        </Column>
      ),
    },
  ],
});
