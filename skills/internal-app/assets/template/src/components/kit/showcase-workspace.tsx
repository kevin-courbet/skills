import * as stylex from "@stylexjs/stylex";
import {
  AlertTriangle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Code2,
  CreditCard,
  FileCode,
  FileBraces,
  FileText,
  Folder,
  Gauge,
  Layers,
  type LucideIcon,
  FolderOpen,
  KeyRound,
  Users,
  Database,
  FileSearch,
  FlaskConical,
  Globe,
  Plus,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeIntent } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, type CodeLanguage } from "@/components/ui/code-block";
import {
  type CalendarEvent,
  type CalendarEventChange,
  type CalendarResource,
  type CalendarView,
  EventCalendar,
} from "@/components/ui/event-calendar";
import { EmptyState } from "@/components/ui/feedback";
import { Gantt, type GanttChange, type GanttTask } from "@/components/ui/gantt";
import { Kanban, type KanbanColumn } from "@/components/ui/kanban";
import { Card, Code, Section } from "@/components/ui/layout";
import { ResizablePanels } from "@/components/ui/resizable-panels";
import { Scrollspy } from "@/components/ui/scrollspy";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { SortableList } from "@/components/ui/sortable-list";
import { toast } from "@/components/ui/toaster";
import { SpanWaterfall, Trace, type TraceSpan, type TraceStep } from "@/components/ui/trace";
import { moveTreeNodes, Tree, type TreeNode } from "@/components/ui/tree";
import { color, font, layer, media, radius, space } from "@/styles/tokens.stylex";
import { ControlsShowcase } from "./showcase-controls";

interface Incident {
  readonly id: string;
  readonly title: string;
  readonly severity: "sev1" | "sev2" | "sev3";
  readonly service: string;
  readonly owner: string;
  readonly age: string;
}

const severityDisplay: Record<Incident["severity"], { label: string; intent: BadgeIntent }> = {
  sev1: { label: "SEV 1", intent: "danger" },
  sev2: { label: "SEV 2", intent: "warning" },
  sev3: { label: "SEV 3", intent: "neutral" },
};

const incidentColumns: ReadonlyArray<KanbanColumn> = [
  { id: "triage", title: "Triage", icon: CircleDashed },
  { id: "investigating", title: "Investigating", icon: Search, limit: 2 },
  { id: "mitigated", title: "Mitigated", icon: CircleDot },
  { id: "resolved", title: "Resolved", icon: CircleCheck },
];

const initialIncidents: Readonly<Record<string, ReadonlyArray<Incident>>> = {
  triage: [
    {
      id: "INC-2051",
      title: "Webhook retries pile up for Stripe events",
      severity: "sev3",
      service: "billing-api",
      owner: "Grace Hopper",
      age: "12m",
    },
    {
      id: "INC-2050",
      title: "Slow ledger exports in EU West",
      severity: "sev2",
      service: "ledger-worker",
      owner: "Alan Turing",
      age: "38m",
    },
  ],
  investigating: [
    {
      id: "INC-2047",
      title: "Checkout returns 409 on inventory reserve",
      severity: "sev1",
      service: "inventory",
      owner: "Ada Lovelace",
      age: "1h",
    },
    {
      id: "INC-2046",
      title: "Payroll export misses October rows",
      severity: "sev2",
      service: "payroll-export",
      owner: "Katherine Johnson",
      age: "2h",
    },
    {
      id: "INC-2044",
      title: "Search index lags by 20 minutes",
      severity: "sev3",
      service: "search",
      owner: "Edsger Dijkstra",
      age: "3h",
    },
  ],
  mitigated: [
    {
      id: "INC-2041",
      title: "Login emails delayed",
      severity: "sev2",
      service: "notifications",
      owner: "Barbara Liskov",
      age: "5h",
    },
  ],
  resolved: [],
};

function IncidentCard({ incident }: { readonly incident: Incident }) {
  const severity = severityDisplay[incident.severity];
  return (
    <>
      <span {...stylex.props(styles.cardTitle)}>{incident.title}</span>
      <span {...stylex.props(styles.cardMeta)}>
        <Badge intent={severity.intent} size="sm">
          {severity.label}
        </Badge>
        <Code>{incident.id}</Code>
        <span {...stylex.props(styles.cardService)}>{incident.service}</span>
      </span>
      <span {...stylex.props(styles.cardFooter)}>
        <Avatar name={incident.owner} size="xs" />
        <span {...stylex.props(styles.cardOwner)}>{incident.owner}</span>
        <span {...stylex.props(styles.cardAge)}>{incident.age}</span>
      </span>
    </>
  );
}

const repositoryNodes: ReadonlyArray<TreeNode> = [
  {
    id: "src",
    label: "src",
    icon: Folder,
    openIcon: FolderOpen,
    children: [
      {
        id: "src/server",
        label: "server",
        icon: Folder,
        openIcon: FolderOpen,
        children: [
          { id: "src/server/ledger.ts", label: "ledger.ts", icon: FileCode, meta: "4 KB" },
          { id: "src/server/payroll.ts", label: "payroll.ts", icon: FileCode, meta: "7 KB" },
        ],
      },
      {
        id: "src/routes",
        label: "routes",
        icon: Folder,
        openIcon: FolderOpen,
        children: [
          { id: "src/routes/index.tsx", label: "index.tsx", icon: FileCode, meta: "2 KB" },
        ],
      },
    ],
  },
  {
    id: "migrations",
    label: "migrations",
    icon: Folder,
    openIcon: FolderOpen,
    children: [
      {
        id: "migrations/0007.sql",
        label: "0007_add_invoice_index.sql",
        icon: FileText,
        meta: "1 KB",
      },
      {
        id: "migrations/0008.sql",
        label: "0008_drop_legacy_rates.sql",
        icon: FileText,
        meta: "1 KB",
      },
    ],
  },
  { id: "package.json", label: "package.json", icon: FileBraces, meta: "1 KB" },
  { id: "README.md", label: "README.md", icon: FileText, meta: "3 KB", isDisabled: true },
];

const permissionNodes: ReadonlyArray<TreeNode> = [
  {
    id: "users",
    label: "User management",
    icon: Users,
    children: [
      { id: "users.view", label: "View users" },
      { id: "users.invite", label: "Invite users" },
      { id: "users.edit", label: "Edit roles" },
      { id: "users.delete", label: "Remove users" },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    children: [
      { id: "billing.view", label: "View invoices" },
      { id: "billing.manage", label: "Manage subscriptions" },
    ],
  },
  {
    id: "api",
    label: "API access",
    icon: KeyRound,
    children: [
      { id: "api.read", label: "Read", description: "GET requests" },
      { id: "api.write", label: "Write", description: "POST, PUT, DELETE" },
    ],
  },
];

function TreeShowcase() {
  const [files, setFiles] = useState(repositoryNodes);
  const [openFile, setOpenFile] = useState<string | null>("src/server/ledger.ts");
  const [permissions, setPermissions] = useState<ReadonlyArray<string>>([
    "users.view",
    "users.invite",
    "billing.view",
    "api.read",
  ]);
  return (
    <div id="kit-tree">
      <Section
        title="Tree"
        description="Arrow keys move and open branches. Drag files to reorder or nest them. Branch checkboxes cascade."
      >
        <div {...stylex.props(styles.pair)}>
          <Card
            title="Repository"
            description="Single selection with drag and drop"
            actions={openFile ?? "Nothing open"}
          >
            <Tree
              label="Repository files"
              nodes={files}
              selection={{ mode: "single", value: openFile, onChange: setOpenFile }}
              defaultExpandedIds={["src", "src/server", "migrations"]}
              onMove={(move) => setFiles(moveTreeNodes(files, move))}
            />
          </Card>
          <Card
            title="Role permissions"
            description="Finance analyst"
            actions={`${permissions.length} of 8 allowed`}
          >
            <Tree
              label="Role permissions"
              nodes={permissionNodes}
              selection={{ mode: "checkbox", value: permissions, onChange: setPermissions }}
              defaultExpandedIds={["users", "billing", "api"]}
              guides={false}
            />
          </Card>
        </div>
      </Section>
    </div>
  );
}

interface Escalation {
  readonly id: string;
  readonly name: string;
  readonly channel: string;
  readonly delay: string;
}

const initialEscalations: ReadonlyArray<Escalation> = [
  { id: "primary", name: "Primary on-call", channel: "Push and SMS", delay: "Immediately" },
  { id: "secondary", name: "Secondary on-call", channel: "Push and SMS", delay: "After 10 min" },
  { id: "lead", name: "Team lead", channel: "Phone call", delay: "After 20 min" },
  { id: "director", name: "Engineering director", channel: "Phone call", delay: "After 45 min" },
];

interface Widget {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

const initialWidgets: ReadonlyArray<Widget> = [
  { id: "errors", title: "Error rate", description: "5xx share per service", icon: AlertTriangle },
  { id: "latency", title: "Latency", description: "p50, p95, and p99", icon: Gauge },
  { id: "deploys", title: "Deploys", description: "Last 24 hours", icon: Rocket },
  { id: "queues", title: "Queue depth", description: "Jobs waiting per queue", icon: Layers },
  { id: "spend", title: "Cloud spend", description: "Month to date", icon: CreditCard },
];

function SortableShowcase() {
  const [escalations, setEscalations] = useState(initialEscalations);
  const [widgets, setWidgets] = useState(initialWidgets);
  return (
    <div id="kit-sortable">
      <Section
        title="Sortable list"
        description="Drag a row by its grip, or focus the grip, press Enter, move with the arrow keys, and press Enter."
      >
        <div {...stylex.props(styles.pair)}>
          <SortableList
            label="Escalation order"
            items={escalations}
            onReorder={(next) => setEscalations(next)}
            getItemId={(step) => step.id}
            getItemLabel={(step) => step.name}
            showPosition
            renderItem={(step) => (
              <>
                <span {...stylex.props(styles.cardTitle)}>{step.name}</span>
                <span {...stylex.props(styles.cardService)}>
                  {step.channel} · {step.delay}
                </span>
              </>
            )}
            itemActions={(step) => (
              <Button
                size="sm"
                intent="ghost"
                iconOnly
                aria-label={`Remove ${step.name}`}
                onPress={() => setEscalations(escalations.filter((item) => item.id !== step.id))}
              >
                <X aria-hidden width={14} height={14} />
              </Button>
            )}
            emptyState={<EmptyState title="No escalation steps" />}
          />
          <Card
            title="Escalation order"
            description="Inside a card the list has no frame of its own"
          >
            <SortableList
              label="Escalation order in a card"
              framed={false}
              items={escalations}
              onReorder={(next) => setEscalations(next)}
              getItemId={(step) => step.id}
              getItemLabel={(step) => step.name}
              renderItem={(step) => (
                <>
                  <span {...stylex.props(styles.cardTitle)}>{step.name}</span>
                  <span {...stylex.props(styles.cardService)}>{step.delay}</span>
                </>
              )}
            />
          </Card>
        </div>
        <div {...stylex.props(styles.stack)}>
          <span {...stylex.props(styles.label)}>Dashboard widgets, grid layout</span>
          <SortableList
            label="Dashboard widgets"
            layout="grid"
            items={widgets}
            onReorder={(next) => setWidgets(next)}
            getItemId={(widget) => widget.id}
            getItemLabel={(widget) => widget.title}
            renderItem={(widget) => (
              <>
                <widget.icon aria-hidden {...stylex.props(styles.widgetIcon)} />
                <span {...stylex.props(styles.cardTitle)}>{widget.title}</span>
                <span {...stylex.props(styles.cardService)}>{widget.description}</span>
              </>
            )}
          />
        </div>
      </Section>
    </div>
  );
}

function KanbanShowcase() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [stages, setStages] = useState(incidentColumns);
  return (
    <div id="kit-kanban">
      <Section
        title="Kanban"
        description="Drag a card, or focus its grip and press Enter, then Tab to a place and press Enter. Move a column by the grip in its header, or focus that grip, press Enter, and use Left and Right."
      >
        <Kanban
          label="Incident board"
          columns={stages}
          onColumnsChange={(next) => setStages(next)}
          value={incidents}
          onChange={(next) => setIncidents(next)}
          getItemId={(incident) => incident.id}
          getItemLabel={(incident) => `${incident.id} ${incident.title}`}
          renderItem={(incident) => <IncidentCard incident={incident} />}
          onItemAction={(incident) => toast(`Opened ${incident.id}`)}
          columnActions={(column) =>
            column.id === "triage" ? (
              <Button size="sm" intent="ghost" iconOnly aria-label="Add incident">
                <Plus aria-hidden width={14} height={14} />
              </Button>
            ) : undefined
          }
          emptyLabel="No incidents"
        />
      </Section>
    </div>
  );
}

const deploySteps: ReadonlyArray<TraceStep> = [
  {
    id: "search",
    icon: FileSearch,
    title: "Found 3 changed services",
    meta: "0.4 s",
    detail: "billing-api, ledger-worker, and payroll-export changed since the last release.",
  },
  {
    id: "migrate",
    icon: Database,
    title: "Ran the migration dry run",
    meta: "6.1 s",
    detail: (
      <CodeBlock
        variant="embedded"
        label="Migration output"
        code={"2 migrations pending\n0007_add_invoice_index  ok\n0008_drop_legacy_rates ok"}
        showLineNumbers={false}
      />
    ),
  },
  {
    id: "test",
    icon: FlaskConical,
    title: "Unit tests failed in ledger-worker",
    status: "failed",
    meta: "41 s",
    detail: (
      <CodeBlock
        variant="embedded"
        label="Test output"
        code={
          "FAIL src/ledger.test.ts > totals > rounds to cents\nExpected 104.25, received 104.2\n\nTests 1 failed | 211 passed"
        }
        showLineNumbers={false}
        diagnostics={[{ line: 1, level: "error", message: "1 test failed" }]}
        defaultWrap
      />
    ),
  },
  {
    id: "fix",
    icon: Wrench,
    title: "Applying the rounding fix",
    status: "running",
    meta: "12 s",
    steps: [
      { id: "fix-edit", icon: Code2, title: "Edited src/ledger.ts", meta: "+4 −2" },
      {
        id: "fix-test",
        icon: FlaskConical,
        title: "Running ledger tests again",
        status: "running",
      },
    ],
  },
  { id: "deploy", icon: Rocket, title: "Deploy to staging", status: "pending" },
  {
    id: "audit",
    icon: ShieldCheck,
    title: "Security audit",
    status: "skipped",
    meta: "No dependency changes",
  },
];

const checkoutTrace: TraceSpan = {
  id: "root",
  name: "POST /api/checkout",
  service: "web",
  icon: Server,
  startMs: 0,
  durationMs: 842,
  attributes: [
    ["http.request.method", "POST"],
    ["http.response.status_code", "200"],
    ["user_agent.original", "Mozilla/5.0"],
  ],
  children: [
    {
      id: "cart",
      name: "SELECT cart_items",
      service: "postgres",
      icon: Database,
      startMs: 12,
      durationMs: 96,
      attributes: [
        ["db.system.name", "postgresql"],
        ["db.response.returned_rows", "7"],
      ],
    },
    {
      id: "reserve-1",
      name: "POST /inventory/reserve",
      service: "inventory",
      icon: Globe,
      startMs: 114,
      durationMs: 34,
      isError: true,
      attributes: [
        ["http.response.status_code", "409"],
        ["error.type", "409"],
      ],
    },
    {
      id: "reserve-2",
      name: "POST /inventory/reserve",
      service: "inventory",
      icon: Globe,
      startMs: 152,
      durationMs: 30,
      attributes: [
        ["http.response.status_code", "200"],
        ["http.request.resend_count", "1"],
      ],
    },
    {
      id: "payment",
      name: "payments.createIntent",
      service: "billing",
      icon: Code2,
      startMs: 190,
      durationMs: 610,
      children: [
        {
          id: "payment-http",
          name: "POST /v1/payment_intents",
          service: "payments",
          icon: Globe,
          startMs: 196,
          durationMs: 598,
          attributes: [
            ["server.address", "api.payments.example"],
            ["http.response.status_code", "200"],
          ],
        },
      ],
    },
    {
      id: "email",
      name: "queue.publish order.created",
      service: "events",
      icon: Rocket,
      startMs: 806,
      durationMs: 18,
    },
  ],
};

const billingConfig = `# Billing worker
service: billing-worker
replicas: 3
schedule: "0 2 * * *"
retries:
  attempts: 5
  backoff: exponential
timeout_seconds: -30
alerts:
  channel: "#finance-ops"
  enabled: true`;

const cacheKeyDiff = `export function getCacheKey(request: Request) {
  const url = new URL(request.url);
  return url.href;
  url.searchParams.delete("utm_source");
  url.searchParams.sort();
  return url.toString();
}`;

const webhookPayload = JSON.stringify(
  {
    id: "evt_1Q2w3E4r",
    type: "invoice.payment_failed",
    created: 1760000000,
    livemode: false,
    data: {
      object: {
        id: "in_9Hh2",
        customer: "cus_Northwind",
        amount_due: 104250,
        currency: "eur",
        attempt_count: 2,
        next_payment_attempt: 1760086400,
        last_payment_error: { code: "card_declined", decline_code: "insufficient_funds" },
      },
    },
  },
  null,
  2,
);

const slowQuery = `-- Slowest query this week, p95 1.8 s
SELECT invoices.id, customers.name, SUM(lines.amount) AS total
FROM invoices
JOIN customers ON customers.id = invoices.customer_id
JOIN invoice_lines AS lines ON lines.invoice_id = invoices.id
WHERE invoices.created_at > now() - interval '30 days'
GROUP BY invoices.id, customers.name
ORDER BY total DESC
LIMIT 50;`;

const scheduleEvents: ReadonlyArray<CalendarEvent> = [
  {
    id: "oncall-ada",
    title: "On call: Ada Lovelace",
    start: "2026-10-12",
    end: "2026-10-19",
    allDay: true,
    intent: "accent",
    meta: "Primary",
  },
  {
    id: "oncall-grace",
    title: "On call: Grace Hopper",
    start: "2026-10-19",
    end: "2026-10-26",
    allDay: true,
    intent: "accent",
    meta: "Primary",
  },
  {
    id: "payroll-1",
    title: "Payroll export",
    start: "2026-09-01T02:00:00Z",
    end: "2026-09-01T02:30:00Z",
    intent: "info",
    meta: "payroll-export",
    recurrence: { frequency: "monthly", count: 12 },
  },
  {
    id: "payroll-15",
    title: "Payroll export",
    start: "2026-09-15T02:00:00Z",
    end: "2026-09-15T02:30:00Z",
    intent: "info",
    meta: "payroll-export",
    recurrence: { frequency: "monthly", count: 12 },
  },
  {
    id: "restore-test",
    title: "Backup restore test",
    start: "2026-10-06T07:00:00Z",
    end: "2026-10-06T08:00:00Z",
    intent: "success",
    meta: "Every other Tuesday",
    recurrence: { frequency: "weekly", interval: 2, until: "2026-12-31" },
  },
  {
    id: "pg-upgrade",
    title: "Postgres 17 upgrade",
    start: "2026-10-14T21:00:00Z",
    end: "2026-10-14T23:30:00Z",
    intent: "warning",
    meta: "Maintenance · EU West",
  },
  {
    id: "standup",
    title: "Ops standup",
    start: "2026-10-05T09:00:00Z",
    end: "2026-10-05T09:15:00Z",
    intent: "neutral",
    recurrence: { frequency: "weekly", weekdays: ["mon", "wed", "fri"] },
  },
  {
    id: "review",
    title: "Incident review INC-2047",
    start: "2026-10-16T14:00:00Z",
    end: "2026-10-16T15:00:00Z",
    intent: "danger",
    meta: "Postmortem",
  },
  {
    id: "vendor",
    title: "Payments vendor call",
    start: "2026-10-16T14:30:00Z",
    end: "2026-10-16T15:30:00Z",
    intent: "neutral",
  },
  {
    id: "dr-drill",
    title: "Disaster recovery drill",
    start: "2026-10-20T08:00:00Z",
    end: "2026-10-20T12:00:00Z",
    intent: "warning",
    meta: "All regions",
  },
  {
    id: "cert",
    title: "TLS certificates renew",
    start: "2026-10-20T13:00:00Z",
    end: "2026-10-20T13:15:00Z",
    intent: "success",
  },
  {
    id: "capacity",
    title: "Capacity planning",
    start: "2026-10-20T15:00:00Z",
    end: "2026-10-20T16:00:00Z",
    intent: "neutral",
  },
  {
    id: "release",
    title: "Release 4.12",
    start: "2026-10-20T17:00:00Z",
    end: "2026-10-20T17:30:00Z",
    intent: "success",
  },
  {
    id: "freeze",
    title: "Deploy freeze",
    start: "2026-10-30",
    end: "2026-11-02",
    allDay: true,
    intent: "danger",
    meta: "Quarter close",
  },
];

const onCallPeople: ReadonlyArray<CalendarResource> = [
  { id: "ada", title: "Ada Lovelace", meta: "Platform" },
  { id: "grace", title: "Grace Hopper", meta: "Payments" },
  { id: "alan", title: "Alan Turing", meta: "Data" },
];

const onCallEvents: ReadonlyArray<CalendarEvent> = [
  {
    id: "rota-ada",
    title: "Primary on call",
    start: "2026-10-12",
    end: "2026-10-15",
    allDay: true,
    intent: "accent",
    resourceId: "ada",
  },
  {
    id: "rota-grace",
    title: "Primary on call",
    start: "2026-10-15",
    end: "2026-10-19",
    allDay: true,
    intent: "accent",
    resourceId: "grace",
  },
  {
    id: "rota-alan",
    title: "Secondary on call",
    start: "2026-10-12",
    end: "2026-10-19",
    allDay: true,
    intent: "neutral",
    resourceId: "alan",
  },
  {
    id: "handover",
    title: "Handover",
    start: "2026-10-15T08:30:00Z",
    end: "2026-10-15T09:00:00Z",
    intent: "info",
    resourceId: "ada",
  },
  {
    id: "pg-window",
    title: "Postgres failover drill",
    start: "2026-10-16T13:00:00Z",
    end: "2026-10-16T15:00:00Z",
    intent: "warning",
    resourceId: "grace",
  },
  {
    id: "etl-review",
    title: "ETL review",
    start: "2026-10-16T10:00:00Z",
    end: "2026-10-16T11:00:00Z",
    intent: "neutral",
    resourceId: "alan",
  },
  {
    id: "alan-sync",
    title: "Pipeline sync",
    start: "2026-10-12T15:00:00Z",
    end: "2026-10-12T15:30:00Z",
    intent: "neutral",
    resourceId: "alan",
    recurrence: { frequency: "daily", count: 5 },
  },
];

function applyChange(
  events: ReadonlyArray<CalendarEvent>,
  id: string,
  change: CalendarEventChange,
): ReadonlyArray<CalendarEvent> {
  return events.map((event) => (event.id === id ? { ...event, ...change } : event));
}

function EventCalendarShowcase() {
  const [view, setView] = useState<CalendarView>("month");
  const [date, setDate] = useState("2026-10-16");
  const [events, setEvents] = useState(scheduleEvents);
  const [rota, setRota] = useState(onCallEvents);
  const [rotaView, setRotaView] = useState<CalendarView>("week");
  return (
    <div id="kit-event-calendar" {...stylex.props(styles.sections)}>
      <Section
        title="Event calendar"
        description="Maintenance windows and jobs with recurring series. Drag an event or its lower edge, or focus it and use Alt with the arrow keys."
      >
        <EventCalendar
          label="Operations schedule"
          events={events}
          today="2026-10-16"
          now="2026-10-16T10:30:00Z"
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          onEventAction={(event) => toast(`Opened ${event.title}`)}
          onEventChange={(event, change) => setEvents(applyChange(events, event.id, change))}
          onDayAction={(day) => toast(`New event on ${day}`)}
        />
      </Section>
      <Section
        title="Resource calendar"
        description="An on-call rota: one row per person in the week view and one column per person in the day view. Move a shift to another person with Alt and Up or Down."
      >
        <EventCalendar
          label="On-call rota"
          events={rota}
          resources={onCallPeople}
          views={["week", "day"]}
          view={rotaView}
          onViewChange={setRotaView}
          today="2026-10-16"
          now="2026-10-16T10:30:00Z"
          defaultDate="2026-10-16"
          onEventAction={(event) => toast(`Opened ${event.title}`)}
          onEventChange={(event, change) => setRota(applyChange(rota, event.id, change))}
          onDayAction={(day, resourceId) =>
            toast(`New event on ${day}${resourceId === undefined ? "" : ` for ${resourceId}`}`)
          }
        />
      </Section>
    </div>
  );
}

const migrationPlan: ReadonlyArray<GanttTask> = [
  {
    id: "prepare",
    title: "Prepare",
    children: [
      {
        id: "audit",
        title: "Audit ledger schemas",
        start: "2026-10-05",
        end: "2026-10-09",
        progress: 100,
        intent: "success",
        assignee: "Ada",
      },
      {
        id: "runbook",
        title: "Write the runbook",
        start: "2026-10-08",
        end: "2026-10-14",
        progress: 80,
        assignee: "Grace",
        dependsOn: ["audit"],
      },
    ],
  },
  {
    id: "migrate",
    title: "Migrate",
    children: [
      {
        id: "dual-write",
        title: "Dual write",
        start: "2026-10-15",
        end: "2026-10-21",
        progress: 40,
        assignee: "Alan",
        dependsOn: ["runbook"],
      },
      {
        id: "backfill",
        title: "Backfill 2024 to 2026",
        start: "2026-10-19",
        end: "2026-10-27",
        progress: 10,
        intent: "warning",
        assignee: "Alan",
        dependsOn: ["dual-write"],
      },
      {
        id: "cutover",
        title: "Cut over",
        start: "2026-10-28",
        milestone: true,
        intent: "danger",
        dependsOn: ["backfill"],
      },
    ],
  },
  {
    id: "cleanup",
    title: "Remove legacy tables",
    start: "2026-10-29",
    end: "2026-11-04",
    progress: 0,
    intent: "neutral",
    assignee: "Edsger",
    dependsOn: ["cutover"],
  },
];

function rescheduleTask(
  tasks: ReadonlyArray<GanttTask>,
  id: string,
  change: GanttChange,
): ReadonlyArray<GanttTask> {
  return tasks.map((task) => {
    if (task.id === id) return { ...task, start: change.start, end: change.end };
    if (task.children === undefined) return task;
    return { ...task, children: rescheduleTask(task.children, id, change) };
  });
}

function GanttShowcase() {
  const [plan, setPlan] = useState(migrationPlan);
  const [scale, setScale] = useState<"day" | "week">("day");
  return (
    <div id="kit-gantt">
      <Section
        title="Gantt"
        description="Tasks on a time line with progress, milestones, dependencies, and the load of each assignee. Drag a row by its grip, or press Alt and Up or Down, to change the order."
        actions={
          <SegmentedControl
            size="sm"
            label="Scale"
            value={scale}
            onChange={setScale}
            options={[
              { id: "day", label: "Days" },
              { id: "week", label: "Weeks" },
            ]}
          />
        }
      >
        <Gantt
          label="Ledger migration plan"
          tasks={plan}
          today="2026-10-16"
          scale={scale}
          onTaskChange={(task, change) => setPlan(rescheduleTask(plan, task.id, change))}
          onReorder={(next) => setPlan(next)}
          load={{ limit: 1 }}
          onTaskAction={(task) => toast(`Opened ${task.title}`)}
        />
      </Section>
    </div>
  );
}

function PanelBody({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div {...stylex.props(styles.panelBody)}>
      <span {...stylex.props(styles.panelTitle)}>{title}</span>
      {children}
    </div>
  );
}

function ResizableShowcase() {
  const [sizes, setSizes] = useState<ReadonlyArray<number>>([32, 68]);
  return (
    <div id="kit-resizable">
      <Section
        title="Resizable panels"
        description="Drag a handle, or focus it and use the arrow keys. Panels nest."
        actions={
          <span {...stylex.props(styles.cardService)}>List {Math.round(sizes[0] ?? 0)}%</span>
        }
      >
        <div {...stylex.props(styles.panelFrame)}>
          <ResizablePanels
            sizes={sizes}
            onSizesChange={setSizes}
            style={styles.panelHeight}
            panels={[
              {
                id: "jobs",
                label: "Job list",
                defaultSize: 32,
                minSize: 20,
                maxSize: 60,
                content: (
                  <PanelBody title="Jobs">
                    {["Northwind export", "Ledger sync", "Payroll check", "Vendor import"].map(
                      (job) => (
                        <span key={job} {...stylex.props(styles.cardService)}>
                          {job}
                        </span>
                      ),
                    )}
                  </PanelBody>
                ),
              },
              {
                id: "detail",
                label: "Job detail",
                defaultSize: 68,
                content: (
                  <ResizablePanels
                    orientation="vertical"
                    panels={[
                      {
                        id: "summary",
                        label: "Summary",
                        defaultSize: 45,
                        minSize: 25,
                        content: (
                          <PanelBody title="Ledger sync">
                            <span {...stylex.props(styles.cardService)}>
                              Runs every day at 02:00 UTC · EU West
                            </span>
                          </PanelBody>
                        ),
                      },
                      {
                        id: "output",
                        label: "Output",
                        defaultSize: 55,
                        minSize: 25,
                        content: (
                          <CodeBlock
                            variant="embedded"
                            label="Ledger sync output"
                            code={
                              "02:00:01 sync started\n02:00:14 fetched 9,310 rows\n02:00:19 wrote 9,310 rows\n02:00:19 sync finished"
                            }
                            style={styles.flushCode}
                          />
                        ),
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}

type SampleLanguage = Exclude<CodeLanguage, "text">;

const sampleLanguages: ReadonlyArray<SampleLanguage> = [
  "tsx",
  "jsx",
  "ts",
  "js",
  "json",
  "sh",
  "bash",
  "sql",
  "yaml",
  "css",
  "html",
  "python",
  "go",
  "rust",
  "toml",
  "dockerfile",
  "markdown",
  "diff",
];

const codeSamples: Record<
  SampleLanguage,
  { readonly label: string; readonly title: string; readonly code: string }
> = {
  tsx: {
    label: "TSX",
    title: "run-row.tsx",
    code: `export function RunRow({ run }: { readonly run: Run }) {
  const [isOpen, setOpen] = useState<boolean>(false);
  return (
    <Item title={run.name} onAction={() => setOpen(true)}>
      <StatusDot intent="success">Ready</StatusDot>
    </Item>
  );
}`,
  },
  jsx: {
    label: "JSX",
    title: "banner.jsx",
    code: `// Shown while the sync is paused.
export const Banner = ({ until }) => (
  <p role="status" data-state="paused">
    Sync resumes at {until.toLocaleTimeString()}.
  </p>
);`,
  },
  ts: {
    label: "TypeScript",
    title: "retry.ts",
    code: `type Backoff = "linear" | "exponential";

export async function retry<T>(task: () => Promise<T>, attempts = 5): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await sleep(2 ** attempt * 100);
    }
  }
}`,
  },
  js: {
    label: "JavaScript",
    title: "metrics.js",
    code: `const buckets = [0.05, 0.1, 0.5, 1, 5];
export function observe(histogram, seconds) {
  const index = buckets.findIndex((limit) => seconds <= limit);
  histogram[index === -1 ? buckets.length : index] += 1;
  return \`observed \${seconds}s\`;
}`,
  },
  json: {
    label: "JSON",
    title: "feature-flags.json",
    code: `{
  "ledger.dualWrite": { "enabled": true, "rollout": 0.25 },
  "payroll.newExport": { "enabled": false, "owners": ["finance"] },
  "search.reindex": null
}`,
  },
  sh: {
    label: "Shell",
    title: "deploy.sh",
    code: `#!/bin/sh
set -eu
# Promote the staged build
export RELEASE="\${1:-latest}"
bun run build --mode production && rsync -a .output/ "deploy@$HOST:/srv/$RELEASE"`,
  },
  bash: {
    label: "Bash",
    title: "rotate-logs.bash",
    code: `for file in /var/log/app/*.log; do
  if [[ -s "$file" ]]; then
    gzip --best "$file"   # keeps 30 days
  fi
done
echo "rotated $(ls /var/log/app | wc -l) files"`,
  },
  sql: {
    label: "SQL",
    title: "failed-payments.sql",
    code: `-- Failed payments in the last week
SELECT customer_id, COUNT(*) AS failures, MAX(created_at)
FROM payments
WHERE status = 'failed' AND created_at > now() - interval '7 days'
GROUP BY customer_id
HAVING COUNT(*) > 2;`,
  },
  yaml: {
    label: "YAML",
    title: "ci.yaml",
    code: `name: ci
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: bun test --coverage  # fails under 80%
        timeout-minutes: 10`,
  },
  css: {
    label: "CSS",
    title: "print.css",
    code: `@media print {
  .sidebar, .top-bar { display: none !important; }
  :root { --page-width: 210mm; }
  table th::after { content: attr(data-unit); color: var(--muted); }
  main { width: calc(var(--page-width) - 2rem); }
}`,
  },
  html: {
    label: "HTML",
    title: "maintenance.html",
    code: `<!DOCTYPE html>
<html lang="en">
  <!-- Served while the app is down -->
  <body class="maintenance">
    <h1>Back at 06:00 UTC</h1>
    <a href="https://status.example.com">Status page</a> &middot; ops
  </body>
</html>`,
  },
  python: {
    label: "Python",
    title: "reconcile.py",
    code: `@dataclass
class Batch:
    id: str
    total: Decimal

def reconcile(batches: list[Batch], ledger) -> int:
    """Count the batches the ledger misses."""
    return sum(1 for batch in batches if batch.id not in ledger)  # O(n)`,
  },
  go: {
    label: "Go",
    title: "health.go",
    code: `package health

func Check(ctx context.Context, db *sql.DB) error {
	if err := db.PingContext(ctx); err != nil {
		return fmt.Errorf("database: %w", err)
	}
	return nil // healthy
}`,
  },
  rust: {
    label: "Rust",
    title: "limits.rs",
    code: `#[derive(Debug, Clone)]
pub struct Limit<'a> { name: &'a str, max: u32 }

impl Limit<'_> {
    pub fn allows(&self, used: u32) -> bool {
        println!("{} uses {used}", self.name);
        used <= self.max
    }
}`,
  },
  toml: {
    label: "TOML",
    title: "worker.toml",
    code: `# Billing worker
[worker]
name = "billing"
replicas = 3
start = 2026-10-12T02:00:00Z

[[queues]]
id = 'invoices'
retry = { attempts = 5, backoff = "exponential" }`,
  },
  dockerfile: {
    label: "Dockerfile",
    title: "Dockerfile",
    code: `FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
ENV NODE_ENV=production PORT=\${PORT:-3000}
CMD ["bun", ".output/server/index.mjs"]`,
  },
  markdown: {
    label: "Markdown",
    title: "RUNBOOK.md",
    code: `## Restore a backup

1. Pause the **billing worker** in [the console](https://ops.example.com).
2. Run \`bun run restore --at 02:00\`.

> Restores take about *20 minutes*.

\`\`\`sh
bun run restore --dry-run
\`\`\``,
  },
  diff: {
    label: "Diff",
    title: "cache-key.diff",
    code: `@@ -1,4 +1,5 @@
 export function getCacheKey(request: Request) {
   const url = new URL(request.url);
-  return url.href;
+  url.searchParams.sort();
+  return url.toString();
 }`,
  },
};

function CodeBlockShowcase() {
  const [language, setLanguage] = useState<SampleLanguage>("tsx");
  const sample = codeSamples[language];
  return (
    <div id="kit-code-block">
      <Section
        title="Code block"
        description="Config, payloads, queries, and commands with syntax colors, copy, and wrap."
      >
        <div {...stylex.props(styles.pair)}>
          <CodeBlock
            title="billing-worker.yaml"
            language="yaml"
            code={billingConfig}
            diagnostics={[
              { line: 8, level: "error", message: "timeout_seconds must be 1 or more." },
              { line: 3, level: "warning", message: "3 replicas exceed the plan limit of 2." },
            ]}
            headerActions={
              <>
                <Badge intent="danger" size="sm">
                  1 error
                </Badge>
                <Badge intent="warning" size="sm">
                  1 warning
                </Badge>
              </>
            }
          />
          <CodeBlock
            title="lib/cache-key.ts"
            language="ts"
            code={cacheKeyDiff}
            diff={{ added: [4, 5, 6], removed: [3] }}
          />
          <CodeBlock
            title="invoice.payment_failed"
            language="json"
            code={webhookPayload}
            maxLines={10}
          />
          <div {...stylex.props(styles.stack)}>
            <CodeBlock
              title="slow-invoices.sql"
              language="sql"
              code={slowQuery}
              highlightedLines={[[4, 5]]}
            />
            <CodeBlock
              label="Migration command"
              language="sh"
              code={'bun run db:migrate --env production # needs "DATABASE_URL"'}
            />
          </div>
        </div>
        <div {...stylex.props(styles.stack)}>
          <Select
            label="Language"
            value={language}
            onChange={setLanguage}
            options={sampleLanguages.map((id) => ({ id, label: codeSamples[id].label }))}
            style={styles.languageSelect}
          />
          <CodeBlock title={sample.title} language={language} code={sample.code} />
        </div>
      </Section>
    </div>
  );
}

/**
 * Workspace primitives: traces, boards, trees, sortable lists, code, calendars,
 * schedules, and panels. Rendered by KitShowcase on the design-kit route.
 */
const workspaceSections = [
  { id: "kit-trace", label: "Trace" },
  { id: "kit-kanban", label: "Kanban" },
  { id: "kit-tree", label: "Tree" },
  { id: "kit-sortable", label: "Sortable" },
  { id: "kit-code-block", label: "Code" },
  { id: "kit-event-calendar", label: "Calendar" },
  { id: "kit-gantt", label: "Gantt" },
  { id: "kit-resizable", label: "Panels" },
  { id: "kit-items", label: "Items" },
  { id: "kit-inputs", label: "Inputs" },
  { id: "kit-menus", label: "Menus" },
] as const;

export function WorkspaceShowcase() {
  return (
    <>
      <div id="kit-workspace-nav" {...stylex.props(styles.spyBar)}>
        <Scrollspy
          label="Workspace components"
          orientation="horizontal"
          items={workspaceSections}
          offset={64}
        />
      </div>
      <div id="kit-trace">
        <Section
          title="Trace"
          description="Step lines that open to their output, and a span waterfall for request traces."
        >
          <div {...stylex.props(styles.split)}>
            <Card title="Release run" actions="1m 4s">
              <Trace
                label="Release run steps"
                steps={deploySteps}
                defaultExpandedIds={["test", "fix"]}
              />
            </Card>
            <Card
              title="Trace 4bf92f35"
              description="POST /api/checkout · 6 spans"
              actions="842 ms"
            >
              <SpanWaterfall label="Trace 4bf92f35" span={checkoutTrace} />
            </Card>
          </div>
        </Section>
      </div>
      <KanbanShowcase />
      <TreeShowcase />
      <SortableShowcase />
      <CodeBlockShowcase />
      <EventCalendarShowcase />
      <GanttShowcase />
      <ResizableShowcase />
      <ControlsShowcase />
    </>
  );
}

const styles = stylex.create({
  cardTitle: { fontWeight: font.medium, lineHeight: font.leadingTight, overflowWrap: "anywhere" },
  cardMeta: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: space.sm },
  cardService: { fontSize: font.sm, color: color.textMuted },
  cardFooter: { display: "flex", alignItems: "center", gap: space.xs, fontSize: font.sm },
  cardOwner: { color: color.textMuted, minWidth: 0, flex: "1" },
  widgetIcon: {
    width: "1.25rem",
    height: "1.25rem",
    color: color.textMuted,
    marginBottom: space.xs,
  },
  cardAge: { color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  stack: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  languageSelect: { maxWidth: "16rem" },
  sections: { display: "flex", flexDirection: "column", gap: space.xxxl },
  spyBar: {
    position: "sticky",
    top: 0,
    zIndex: layer.sticky,
    marginInline: `calc(-1 * ${space.xs})`,
    paddingBlock: space.xs,
    paddingInline: space.xs,
    backgroundColor: color.page,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  panelFrame: {
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.raised,
  },
  panelHeight: { height: "20rem" },
  panelBody: { display: "flex", flexDirection: "column", gap: space.xs, padding: space.md },
  panelTitle: { fontSize: font.md, fontWeight: font.semibold, marginBottom: space.xs },
  flushCode: { height: "100%", borderRadius: 0 },
  label: { fontSize: font.sm, fontWeight: font.medium, color: color.textMuted },
  pair: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.lg]: "repeat(2, minmax(0, 1fr))" },
    gap: space.lg,
    alignItems: "start",
  },
  split: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.xl]: "minmax(0, 2fr) minmax(0, 3fr)" },
    gap: space.lg,
    alignItems: "start",
  },
});
