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
import { CodeBlock } from "@/components/ui/code-block";
import {
  type CalendarEvent,
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
  return (
    <div id="kit-kanban">
      <Section
        title="Kanban"
        description="Drag a card, or focus its grip and press Enter, then Tab to a place and press Enter."
      >
        <Kanban
          label="Incident board"
          columns={incidentColumns}
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
    start: "2026-10-01T02:00:00Z",
    end: "2026-10-01T02:30:00Z",
    intent: "info",
    meta: "payroll-export",
  },
  {
    id: "payroll-15",
    title: "Payroll export",
    start: "2026-10-15T02:00:00Z",
    end: "2026-10-15T02:30:00Z",
    intent: "info",
    meta: "payroll-export",
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
    start: "2026-10-16T09:00:00Z",
    end: "2026-10-16T09:30:00Z",
    intent: "neutral",
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

function EventCalendarShowcase() {
  const [view, setView] = useState<CalendarView>("month");
  const [date, setDate] = useState("2026-10-16");
  return (
    <div id="kit-event-calendar">
      <Section
        title="Event calendar"
        description="On-call shifts, maintenance windows, and jobs in month, week, and agenda views."
      >
        <EventCalendar
          label="Operations schedule"
          events={scheduleEvents}
          today="2026-10-16"
          now="2026-10-16T10:30:00Z"
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          onEventAction={(event) => toast(`Opened ${event.title}`)}
          onDayAction={(day) => toast(`New event on ${day}`)}
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
        meta: "Ada",
      },
      {
        id: "runbook",
        title: "Write the runbook",
        start: "2026-10-08",
        end: "2026-10-14",
        progress: 80,
        meta: "Grace",
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
        meta: "Alan",
        dependsOn: ["runbook"],
      },
      {
        id: "backfill",
        title: "Backfill 2024 to 2026",
        start: "2026-10-19",
        end: "2026-10-27",
        progress: 10,
        intent: "warning",
        meta: "Katherine",
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
    meta: "Edsger",
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
        description="Tasks on a time line with progress, milestones, and dependencies."
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

function CodeBlockShowcase() {
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
