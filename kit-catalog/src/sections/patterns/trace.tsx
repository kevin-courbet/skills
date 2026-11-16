import {
  Calculator,
  Database,
  FileCheck,
  FileText,
  Globe,
  Mail,
  PackageSearch,
  Receipt,
  RefreshCw,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { CodeBlock } from "@/components/primitives/code-block";
import { SpanWaterfall, Trace, type TraceSpan, type TraceStep } from "@/components/patterns/trace";
import { defineSection } from "../../specimen";

const syncError = `POST https://api.velosupply.example/v2/price-list?page=3
HTTP 502 Bad Gateway after 30.0 s
Retry 1 of 3 in 5 s: HTTP 502 Bad Gateway
Retry 2 of 3 in 10 s: HTTP 502 Bad Gateway
Retry 3 of 3 in 20 s: HTTP 502 Bad Gateway
Stopped at page 3 of 9: 1,602 prices stay unchanged`;

const invoicePayload = `{
  "invoice": "INV-2043",
  "workOrder": "WO-2381",
  "customer": "Claire Moreau",
  "lines": 6,
  "total": "€186.40"
}`;

const syncSteps: ReadonlyArray<TraceStep> = [
  { id: "auth", icon: ShieldCheck, title: "Signed in to the Velo Supply API", meta: "0.4 s" },
  {
    id: "pages-1",
    icon: PackageSearch,
    title: "Fetched pages 1 and 2 of the price list",
    meta: "6.8 s",
  },
  {
    id: "pages-3",
    icon: PackageSearch,
    title: "Fetched page 3 of the price list",
    status: "failed",
    meta: "65 s",
    detail: <CodeBlock variant="embedded" language="text" code={syncError} />,
  },
  { id: "prices", icon: Calculator, title: "Update part prices", status: "skipped" },
  { id: "notify", icon: Mail, title: "Email the price changes to the workshop", status: "skipped" },
];

const statusSteps: ReadonlyArray<TraceStep> = [
  { id: "received", icon: Wrench, title: "Checked in the bike at the front desk", meta: "09:12" },
  {
    id: "inspect",
    icon: FileCheck,
    title: "Inspecting the drivetrain and brakes",
    status: "running",
    meta: "12 min",
  },
  { id: "parts", icon: PackageSearch, title: "Reserve the parts for the quote", status: "pending" },
  {
    id: "approve",
    icon: Send,
    title: "Sent the quote to the customer",
    status: "failed",
    meta: "SMS bounced",
  },
  {
    id: "wash",
    icon: Wrench,
    title: "Wash the bike before the repair",
    status: "skipped",
    meta: "Not ordered",
  },
];

const invoiceSteps: ReadonlyArray<TraceStep> = [
  {
    id: "collect",
    icon: Database,
    title: "Collected the labor and parts of work order WO-2381",
    meta: "1.4 s",
    badge: <Badge size="sm">12%</Badge>,
    steps: [
      { id: "labor", icon: Wrench, title: "Read 3 labor lines from the work order", meta: "0.3 s" },
      {
        id: "parts",
        icon: PackageSearch,
        title: "Read 5 parts and their stock prices",
        meta: "1.1 s",
      },
    ],
  },
  {
    id: "render",
    icon: FileText,
    title:
      "Rendered invoice INV-2043 as a PDF with the shop letterhead, the VAT breakdown, and the warranty terms for the replaced parts",
    meta: "7.6 s",
    badge: (
      <Badge size="sm" intent="warning">
        65%
      </Badge>
    ),
    detail: <CodeBlock variant="embedded" language="json" code={invoicePayload} />,
    steps: [
      { id: "layout", icon: FileText, title: "Laid out 2 pages", meta: "5.9 s" },
      { id: "fonts", icon: FileText, title: "Embedded 3 fonts", meta: "1.7 s" },
    ],
  },
  {
    id: "send",
    icon: Mail,
    title: "Emailed the invoice to Claire Moreau",
    meta: "2.7 s",
    badge: <Badge size="sm">23%</Badge>,
  },
];

const importSteps: ReadonlyArray<TraceStep> = [
  { id: "file", icon: FileCheck, title: "Read customers.csv with 1,284 rows", meta: "0.8 s" },
  {
    id: "match",
    icon: RefreshCw,
    title: "Matching rows with existing customers",
    status: "running",
    meta: "812 of 1,284",
    detail: (
      <CodeBlock
        variant="embedded"
        language="text"
        code={
          "Row 806: matched C-0907 by phone number\nRow 809: new customer Léa Fontaine\nRow 812: matched C-1182 by email"
        }
      />
    ),
  },
  { id: "write", icon: Database, title: "Write new and changed customers", status: "pending" },
];

const invoiceTrace: TraceSpan = {
  id: "root",
  name: "POST /api/invoices",
  service: "api-gateway",
  icon: Globe,
  startMs: 0,
  durationMs: 1840,
  attributes: [
    ["http.request.method", "POST"],
    ["http.route", "/api/invoices"],
    ["http.response.status_code", "201"],
    ["shop.work_order", "WO-2381"],
  ],
  children: [
    {
      id: "auth",
      name: "verify session",
      service: "api-gateway",
      icon: ShieldCheck,
      startMs: 4,
      durationMs: 18,
    },
    {
      id: "create",
      name: "createInvoice",
      service: "invoice-service",
      icon: Receipt,
      startMs: 26,
      durationMs: 1790,
      attributes: [["shop.invoice", "INV-2043"]],
      children: [
        {
          id: "select-order",
          name: "SELECT work_orders",
          service: "postgres",
          icon: Database,
          startMs: 30,
          durationMs: 42,
          attributes: [["db.rows", "1"]],
        },
        {
          id: "select-lines",
          name: "SELECT work_order_lines",
          service: "postgres",
          icon: Database,
          startMs: 76,
          durationMs: 64,
          attributes: [["db.rows", "8"]],
        },
        {
          id: "render-pdf",
          name: "render invoice PDF",
          service: "pdf-renderer",
          icon: FileText,
          startMs: 150,
          durationMs: 1320,
          attributes: [
            ["pdf.pages", "2"],
            ["pdf.bytes", "184,220"],
          ],
        },
        {
          id: "insert",
          name: "INSERT invoices",
          service: "postgres",
          icon: Database,
          startMs: 1480,
          durationMs: 36,
        },
        {
          id: "mail",
          name: "send invoice email",
          service: "mailer",
          icon: Mail,
          startMs: 1522,
          durationMs: 290,
          attributes: [["mail.to", "claire.moreau@example.com"]],
        },
      ],
    },
  ],
};

const bookingTrace: TraceSpan = {
  id: "root",
  name: "POST /api/bookings",
  service: "api-gateway",
  icon: Globe,
  startMs: 0,
  durationMs: 214,
  isError: true,
  attributes: [
    ["http.request.method", "POST"],
    ["http.response.status_code", "409"],
    ["shop.customer", "C-1240"],
  ],
  children: [
    {
      id: "book",
      name: "createBooking",
      service: "booking-service",
      icon: Wrench,
      startMs: 6,
      durationMs: 200,
      isError: true,
      children: [
        {
          id: "slots",
          name: "SELECT bay_slots FOR UPDATE",
          service: "postgres",
          icon: Database,
          startMs: 10,
          durationMs: 120,
        },
        {
          id: "overlap",
          name: "check bay overlap",
          service: "booking-service",
          icon: Calculator,
          startMs: 134,
          durationMs: 58,
          isError: true,
          attributes: [
            ["error.type", "BayDoubleBooked"],
            ["shop.bay", "3"],
            ["shop.conflicts_with", "WO-2377"],
          ],
        },
        {
          id: "rollback",
          name: "ROLLBACK",
          service: "postgres",
          icon: Database,
          startMs: 194,
          durationMs: 8,
        },
      ],
    },
  ],
};

function ControlledImport() {
  const [expanded, setExpanded] = useState<ReadonlyArray<string>>(["match"]);
  return (
    <Trace
      label="Customer import"
      steps={importSteps}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
    />
  );
}

function SelectedErrorSpan() {
  const [selected, setSelected] = useState<string | null>("overlap");
  return (
    <SpanWaterfall
      label="Trace 7d41a0c2"
      span={bookingTrace}
      selectedId={selected}
      onSelectionChange={setSelected}
    />
  );
}

export default defineSection({
  component: "Trace",
  specimens: [
    {
      title: "Steps of a run",
      note: "Write each title as what happened, and put long output in an embedded CodeBlock in detail.",
      render: () => (
        <Trace label="Nightly parts sync" steps={syncSteps} defaultExpandedIds={["pages-3"]} />
      ),
    },
    {
      title: "Statuses",
      note: "Failed is red, running shimmers, and pending is faint. Screen readers hear the status word before the title.",
      render: () => <Trace label="Work order WO-2385" steps={statusSteps} />,
    },
    {
      title: "Child steps and badges",
      note: "A step with detail or child steps opens in place. The second title is long and ends with an ellipsis.",
      render: () => (
        <Trace label="Invoice INV-2043" steps={invoiceSteps} defaultExpandedIds={["collect"]} />
      ),
    },
    {
      title: "Controlled open steps",
      note: "Pass expandedIds with onExpandedChange to open the running step.",
      render: () => <ControlledImport />,
    },
    {
      title: "SpanWaterfall",
      note: "The span with the most self time shows its share of the trace and is selected first. The arrow keys move between spans.",
      wide: true,
      render: () => <SpanWaterfall label="Trace 4bf92f35" span={invoiceTrace} />,
    },
    {
      title: "SpanWaterfall with a failed span",
      note: "The selection is controlled and starts on the span that failed.",
      wide: true,
      render: () => <SelectedErrorSpan />,
    },
    {
      title: "SpanWaterfall with closed spans",
      note: "Pass defaultExpandedIds to open only some spans at first. When a closed span hides the slowest span, the closed span is selected first.",
      wide: true,
      render: () => (
        <SpanWaterfall
          label="Trace 4bf92f35, collapsed"
          span={invoiceTrace}
          defaultExpandedIds={["root"]}
        />
      ),
    },
  ],
});
