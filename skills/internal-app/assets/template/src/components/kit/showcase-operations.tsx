import * as stylex from "@stylexjs/stylex";
import type { SortingState } from "@tanstack/react-table";
import {
  ArrowUpCircle,
  CalendarDays,
  CircleDot,
  CircleSlash,
  GitBranch,
  GitCommitHorizontal,
  History,
  MoreHorizontal,
  PackageCheck,
  PauseCircle,
  Rocket,
  RotateCcw,
  Server,
  TextSearch,
  Undo2,
  XCircle,
  Zap,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeIntent, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cascader, type CascaderOption } from "@/components/ui/cascader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn, TwoLineCell } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/feedback";
import { Filters } from "@/components/ui/filters";
import { Identifier } from "@/components/ui/identifier";
import {
  Card,
  CardSection,
  Code,
  DescriptionList,
  Section,
  StatStrip,
  Toolbar,
} from "@/components/ui/layout";
import { type LogLine, LogViewer } from "@/components/ui/log-viewer";
import { Menu, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { RadioGroup } from "@/components/ui/radio-group";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SegmentedProgress, type StatusStep, Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { Timeline, type TimelineEvent } from "@/components/ui/timeline";
import { toast } from "@/components/ui/toaster";
import { type ActiveFilter, type FilterField, serializeFilters } from "@/lib/filter-params";
import { color, font, media, size, space } from "@/styles/tokens.stylex";

const filterFields = [
  {
    id: "status",
    kind: "multiSelect",
    label: "Status",
    icon: CircleDot,
    options: [
      { id: "ready", label: "Ready", intent: "success" },
      { id: "building", label: "Building", intent: "info" },
      { id: "failed", label: "Failed", intent: "danger" },
      { id: "queued", label: "Queued", intent: "neutral" },
      { id: "cancelled", label: "Cancelled", intent: "neutral" },
    ],
  },
  {
    id: "environment",
    kind: "select",
    label: "Environment",
    icon: Server,
    operators: [
      { id: "is", label: "is" },
      { id: "not", label: "is not" },
    ],
    options: [
      { id: "production", label: "Production" },
      { id: "preview", label: "Preview" },
    ],
  },
  {
    id: "branch",
    kind: "select",
    label: "Branch",
    icon: GitBranch,
    options: [
      "main",
      "release",
      "feat-sync",
      "feat-maps",
      "fix-timezone",
      "fix-uploads",
      "chore-deps",
      "docs-api",
      "spike-offline",
    ].map((branch) => ({ id: branch, label: branch })),
  },
  {
    id: "message",
    kind: "text",
    label: "Commit message",
    icon: TextSearch,
    placeholder: "Contains",
  },
  {
    id: "created",
    kind: "dateRange",
    label: "Created",
    icon: CalendarDays,
    presets: [
      { label: "Last 7 days", value: { start: "2026-10-06", end: "2026-10-12" } },
      { label: "Last 30 days", value: { start: "2026-09-13", end: "2026-10-12" } },
    ],
  },
] as const satisfies ReadonlyArray<FilterField>;

const regions: ReadonlyArray<CascaderOption> = [
  {
    id: "eu",
    label: "Europe",
    children: [
      {
        id: "fr",
        label: "France",
        children: [
          { id: "par", label: "Paris" },
          { id: "lyo", label: "Lyon" },
        ],
      },
      {
        id: "de",
        label: "Germany",
        children: [
          { id: "fra", label: "Frankfurt" },
          { id: "ber", label: "Berlin" },
        ],
      },
      { id: "ie", label: "Ireland", children: [{ id: "dub", label: "Dublin" }] },
    ],
  },
  {
    id: "us",
    label: "United States",
    children: [
      { id: "va", label: "Virginia", children: [{ id: "ash", label: "Ashburn" }] },
      { id: "or", label: "Oregon", children: [{ id: "bmd", label: "Boardman" }] },
    ],
  },
  { id: "ap", label: "Asia Pacific", children: [{ id: "sg", label: "Singapore" }] },
];

type StageId = "queued" | "install" | "build" | "test" | "publish" | "verify" | "promote";

const runningStages: ReadonlyArray<StatusStep<StageId>> = [
  { id: "queued", label: "Queued", status: "success", duration: "7s" },
  { id: "install", label: "Install", status: "success", duration: "17s" },
  { id: "build", label: "Build", status: "success", duration: "38s" },
  { id: "test", label: "Test", status: "running", duration: "14s" },
  { id: "publish", label: "Publish", status: "pending" },
  { id: "verify", label: "Verify", status: "pending" },
  { id: "promote", label: "Promote", status: "pending" },
];

const failedStages: ReadonlyArray<StatusStep<StageId>> = [
  { id: "queued", label: "Queued", status: "success", duration: "4s" },
  { id: "install", label: "Install", status: "success", duration: "16s" },
  { id: "build", label: "Build", status: "success", duration: "41s" },
  {
    id: "test",
    label: "Test",
    description: "bun test --reporter=junit",
    status: "failed",
    duration: "27s",
  },
  { id: "publish", label: "Publish", status: "skipped" },
  { id: "verify", label: "Verify", status: "skipped" },
  { id: "promote", label: "Promote", status: "cancelled" },
];

const stagedStages: ReadonlyArray<StatusStep<StageId>> = [
  ...runningStages.slice(0, 3).map((stage) => ({ ...stage })),
  { id: "test", label: "Test", status: "success", duration: "31s" },
  { id: "publish", label: "Publish", status: "success", duration: "13s" },
  { id: "verify", label: "Verify", status: "success", duration: "9s" },
  {
    id: "promote",
    label: "Promote",
    status: "pending",
    note: "Staged: rollback holds production",
  },
];

const stageSources: ReadonlyArray<StageId> = ["queued", "install", "build", "test"];
const deployLog: ReadonlyArray<LogLine> = [
  {
    id: "d1",
    at: "2026-10-12T18:30:40Z",
    source: "Queued",
    text: "Waiting for a runner with labels [self-hosted, sovereign]",
  },
  {
    id: "d2",
    at: "2026-10-12T18:30:47Z",
    source: "Queued",
    text: "Picked up by runner sovereign-runner-2",
  },
  {
    id: "d3",
    at: "2026-10-12T18:30:47Z",
    source: "Install",
    text: "$ bun install --frozen-lockfile",
  },
  {
    id: "d4",
    at: "2026-10-12T18:31:03Z",
    source: "Install",
    text: "1284 packages installed [16.8s]",
  },
  { id: "d5", at: "2026-10-12T18:31:03Z", source: "Build", text: "$ bun run build" },
  { id: "d6", at: "2026-10-12T18:31:22Z", source: "Build", text: "2431 modules transformed." },
  {
    id: "d7",
    at: "2026-10-12T18:31:34Z",
    source: "Build",
    level: "warn",
    text: "(!) Some chunks are larger than 500 kB after minification: map-engine-Cq81.js",
  },
  { id: "d8", at: "2026-10-12T18:31:42Z", source: "Build", text: "built in 38.4s" },
  { id: "d9", at: "2026-10-12T18:31:42Z", source: "Test", text: "$ bun test --reporter=junit" },
  ...Array.from({ length: 14 }, (_, index): LogLine => ({
    id: `t${index}`,
    at: `2026-10-12T18:31:${String(43 + index).padStart(2, "0")}Z`,
    source: "Test",
    text: `✓ sync › case ${index + 1} [${(index * 37) % 90}.0${index}ms]`,
  })),
  {
    id: "d10",
    at: "2026-10-12T18:31:58Z",
    source: "Test",
    level: "error",
    text: "✗ mission-plan › resolves conflicts by vector clock. Expected 3 revisions, received 2",
  },
];

function activityEvents(): ReadonlyArray<TimelineEvent> {
  return [
    {
      id: "a1",
      kind: "Failure",
      icon: XCircle,
      tone: "danger",
      title: (
        <>
          CI run <Code>#48229</Code> failed in Build for PR #415. The preview URL keeps serving the
          previous deployment.
        </>
      ),
      actor: { name: "System", isSystem: true },
      time: { label: "25m ago", dateTime: "2026-10-12T18:05:00Z", title: "12 Oct 2026, 18:05" },
      meta: (
        <Button intent="ghost" size="sm" style={styles.inlineLink}>
          Inspect
        </Button>
      ),
    },
    {
      id: "a2",
      kind: "Automatic promotion",
      icon: Zap,
      title: "Automatically promoted dpl_6M91fxF8A to production",
      actor: { name: "System", isSystem: true },
      time: { label: "3h ago", dateTime: "2026-10-12T15:30:00Z", title: "12 Oct 2026, 15:30" },
    },
    {
      id: "a3",
      kind: "Rollback",
      icon: History,
      tone: "warning",
      title: "Rolled back production from dpl_6M91fxF8A to dpl_rxt8gA84n",
      description: "Checkout fails for Safari users after the map engine update.",
      actor: { name: "Léa Martin" },
      time: { label: "1d ago", dateTime: "2026-10-11T18:30:00Z", title: "11 Oct 2026, 18:30" },
    },
    {
      id: "a4",
      kind: "Cancellation",
      icon: CircleSlash,
      title: "Cancelled CI run #48181 on main",
      actor: { name: "Tom Becker" },
      time: { label: "1d ago", dateTime: "2026-10-11T12:00:00Z" },
    },
    {
      id: "a5",
      kind: "Published",
      icon: PackageCheck,
      title: "Published dpl_6M91fxF8A to /srv/releases/dpl_6M91fxF8A",
      actor: { name: "System", isSystem: true },
      time: { label: "2d ago", dateTime: "2026-10-10T09:00:00Z" },
    },
    {
      id: "a6",
      kind: "Retry",
      icon: RotateCcw,
      title: "Retried CI run #48097 after a registry outage (attempt 2)",
      actor: { name: "Hugo Bernard" },
      time: { label: "4d ago", dateTime: "2026-10-08T09:00:00Z" },
    },
  ];
}

type RunStatus = "ready" | "building" | "failed" | "queued";

interface Run {
  readonly id: string;
  readonly name: string;
  readonly environment: string;
  readonly status: RunStatus;
  readonly statusDetail: string;
  readonly branch: string;
  readonly sha: string;
  readonly message: string;
  readonly created: string;
  readonly author: string;
}

const runStatus: Record<RunStatus, { readonly label: string; readonly intent: BadgeIntent }> = {
  ready: { label: "Ready", intent: "success" },
  building: { label: "Building", intent: "info" },
  failed: { label: "Failed", intent: "danger" },
  queued: { label: "Queued", intent: "neutral" },
};

const runs: ReadonlyArray<Run> = [
  {
    id: "r48231",
    name: "CI run #48231",
    environment: "Production · attempt 1",
    status: "building",
    statusDetail: "Build · 1m 12s",
    branch: "main",
    sha: "92127a4",
    message: "Add retry budget to sync worker",
    created: "1m ago",
    author: "hbernard",
  },
  {
    id: "r48212",
    name: "CI run #48212",
    environment: "Production · attempt 1",
    status: "failed",
    statusDetail: "in Test · 1m 27s",
    branch: "main",
    sha: "904974a",
    message: "Bump drizzle-orm to 0.44 and regenerate migrations",
    created: "6h ago",
    author: "shaddad",
  },
  {
    id: "dpl_RJ21",
    name: "dpl_RJ21Qst6J",
    environment: "Production",
    status: "ready",
    statusDetail: "1m 53s",
    branch: "main",
    sha: "7bf9f3e",
    message: "Move uploads to sovereign object storage",
    created: "3d ago",
    author: "shaddad",
  },
  {
    id: "r48097",
    name: "CI run #48097",
    environment: "Preview · attempt 2",
    status: "queued",
    statusDetail: "Waiting for a runner",
    branch: "feat-maps",
    sha: "6b9aa67",
    message: "Upgrade to React 19.3",
    created: "4d ago",
    author: "hbernard",
  },
];

/** Operations patterns from the ReUI port: filters, status, pipeline, activity, and flat cards. */
export function OperationsShowcase() {
  const [filters, setFilters] = useState<ReadonlyArray<ActiveFilter>>([
    { kind: "multiSelect", field: "status", operator: "is", value: ["failed", "building"] },
    { kind: "select", field: "environment", operator: "is", value: "production" },
  ]);
  const [region, setRegion] = useState<ReadonlyArray<string> | null>(["eu", "fr", "par"]);
  const [stage, setStage] = useState<StageId | null>("test");
  const [isHoldVisible, setHoldVisible] = useState(true);
  const [isRollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<"rxt8" | "iZtx">("rxt8");
  const [density, setDensity] = useState<"default" | "compact">("default");
  const [isLoading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlyArray<string>>(["r48212"]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created", desc: true }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const params = Object.entries(serializeFilters(filterFields, filters)).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  );
  const stageLog =
    stage === null || !stageSources.includes(stage)
      ? deployLog
      : deployLog.filter((line) => line.source?.toLowerCase() === stage);

  const runColumns: ReadonlyArray<DataTableColumn<Run>> = [
    {
      id: "name",
      accessorKey: "name",
      header: "Deployment",
      enableSorting: false,
      cell: (info) => (
        <TwoLineCell
          primary={<span {...stylex.props(styles.mono)}>{info.row.original.name}</span>}
          secondary={info.row.original.environment}
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => {
        const display = runStatus[info.row.original.status];
        return (
          <StatusDot
            intent={display.intent}
            isActive={info.row.original.status === "building"}
            detail={density === "default" ? info.row.original.statusDetail : undefined}
          >
            {display.label}
          </StatusDot>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      enableSorting: false,
      cell: (info) => (
        <TwoLineCell
          primary={
            <span {...stylex.props(styles.inline)}>
              <GitBranch aria-hidden {...stylex.props(styles.smallIcon)} />
              <span {...stylex.props(styles.mono)}>{info.row.original.branch}</span>
            </span>
          }
          secondary={
            <span {...stylex.props(styles.inline)}>
              <GitCommitHorizontal aria-hidden {...stylex.props(styles.smallIcon)} />
              <span {...stylex.props(styles.mono)}>{info.row.original.sha}</span>
              {info.row.original.message}
            </span>
          }
        />
      ),
    },
    {
      id: "created",
      accessorKey: "created",
      header: "Created",
      cell: (info) => (
        <TwoLineCell
          primary={info.row.original.created}
          secondary={`by ${info.row.original.author}`}
        />
      ),
    },
    {
      id: "actions",
      header: () => <span {...stylex.props(styles.hidden)}>Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: (info) => (
        <MenuTrigger>
          <Button
            intent="ghost"
            size="sm"
            iconOnly
            aria-label={`Actions for ${info.row.original.name}`}
          >
            <MoreHorizontal aria-hidden {...stylex.props(styles.smallIcon)} />
          </Button>
          <Menu aria-label={`Actions for ${info.row.original.name}`}>
            <MenuItem icon={<RotateCcw width={16} height={16} />}>Retry</MenuItem>
            <MenuItem icon={<ArrowUpCircle width={16} height={16} />}>
              Promote to production
            </MenuItem>
          </Menu>
        </MenuTrigger>
      ),
    },
  ];

  return (
    <>
      <Section
        title="Filters and hierarchy"
        description="The chip bar adds complete filters only and writes them to URL params."
      >
        <Card>
          <div {...stylex.props(styles.column)}>
            <Filters
              label="Deployment filters"
              fields={filterFields}
              value={filters}
              onChange={setFilters}
            />
            <span {...stylex.props(styles.caption)}>
              URL params:{" "}
              <Code>
                {params.length === 0
                  ? "none"
                  : `?${params.map(([key, value]) => `${key}=${value}`).join("&")}`}
              </Code>
            </span>
          </div>
        </Card>
        <div {...stylex.props(styles.fields)}>
          <Cascader label="Region" options={regions} value={region} onChange={setRegion} />
          <Cascader
            label="Scope"
            description="Branches can be chosen too."
            options={regions}
            value={null}
            allowsBranchSelection
            isSearchable
            placeholder="Any region"
            onChange={(path) => toast(`Chose ${path.join(" / ")}`)}
          />
        </div>
      </Section>

      <Section title="Status">
        <div {...stylex.props(styles.grid)}>
          <Specimen label="Status label">
            <div {...stylex.props(styles.stack)}>
              <StatusDot intent="success">Ready</StatusDot>
              <StatusDot intent="info" isActive detail="Build · 1m 12s">
                Building
              </StatusDot>
              <StatusDot intent="danger" detail="in Test · 1m 27s">
                Failed
              </StatusDot>
            </div>
          </Specimen>
          <Specimen label="Badge appearances">
            <Badge intent="success">Subtle</Badge>
            <Badge intent="success" appearance="solid">
              Solid
            </Badge>
            <Badge intent="success" appearance="outline">
              Outline
            </Badge>
            <Badge intent="info" shape="pill" size="sm">
              Current
            </Badge>
            <Badge intent="accent" icon={<Rocket width={14} height={14} />} size="lg">
              Serving PR #415
            </Badge>
            <Badge intent="danger" appearance="solid" shape="pill">
              3
            </Badge>
          </Specimen>
          <Specimen label="Identifiers">
            <div {...stylex.props(styles.stack)}>
              <Identifier value="dpl_6M91fxF8A" label="deployment ID" size="lg" />
              <Identifier
                value="46194d3f0a9be1c2"
                display="46194d3"
                label="commit SHA"
                size="sm"
                muted
              />
              <Identifier value="app.myautonomy.eu" label="production URL" />
            </div>
          </Specimen>
        </div>
        <StatStrip
          variant="status"
          items={[
            {
              label: "CI",
              value: "Succeeded",
              tone: "success",
              detail: "All stages passed in 1m 56s",
            },
            {
              label: "Artifact",
              value: "Published",
              tone: "success",
              detail: <Code>/srv/releases/dpl_6M91fxF8A</Code>,
            },
            {
              label: "Traffic",
              value: "Serving production",
              tone: "success",
              detail: "since 3h ago",
            },
          ]}
        />
      </Section>

      <Section
        title="Detail cards"
        description="Each card holds its content directly and divides it with lines. Never nest a card in a card."
      >
        {isHoldVisible ? (
          <Alert
            intent="warning"
            icon={PauseCircle}
            title="Rollback holds production. Automatic promotion is paused."
            actions={
              <Button size="sm" onPress={() => setRollbackOpen(true)}>
                <Undo2 aria-hidden {...stylex.props(styles.smallIcon)} />
                Undo rollback
              </Button>
            }
            onDismiss={() => setHoldVisible(false)}
          >
            Léa Martin rolled back from <Code>dpl_6M91fxF8A</Code> to <Code>dpl_rxt8gA84n</Code> 38m
            ago. 1 deployment is staged and waiting.
          </Alert>
        ) : (
          <Button onPress={() => setHoldVisible(true)}>Show the rollback banner again</Button>
        )}
        <Card
          title="Production"
          layout="sections"
          actions={
            <Button size="sm" onPress={() => setRollbackOpen(true)}>
              <History aria-hidden {...stylex.props(styles.smallIcon)} />
              Roll back
            </Button>
          }
        >
          <CardSection>
            <DescriptionList
              layout="grid"
              items={[
                {
                  term: "Deployment",
                  detail: <Identifier value="dpl_rxt8gA84n" label="deployment ID" />,
                },
                { term: "Status", detail: <StatusDot intent="success">Ready</StatusDot> },
                {
                  term: "Rolled back",
                  detail: (
                    <span {...stylex.props(styles.inline)}>
                      38m ago by <Avatar name="Léa Martin" size="xs" /> Léa Martin
                    </span>
                  ),
                },
                {
                  term: "Automatic promotion",
                  detail: <StatusDot intent="warning">Paused by rollback</StatusDot>,
                },
                {
                  term: "Source",
                  span: "wide",
                  detail: (
                    <TwoLineCell
                      primary={
                        <span {...stylex.props(styles.inline)}>
                          <GitBranch aria-hidden {...stylex.props(styles.smallIcon)} />
                          <span {...stylex.props(styles.mono)}>main</span>
                        </span>
                      }
                      secondary={
                        <span {...stylex.props(styles.inline)}>
                          <span {...stylex.props(styles.mono)}>80c45ef</span> Paginate audit log
                          export by cursor
                        </span>
                      }
                    />
                  ),
                },
                { term: "Built in", detail: "1m 58s" },
              ]}
            />
          </CardSection>
          <CardSection padding="flush">
            <StatStrip
              variant="status"
              framed={false}
              items={[
                { label: "CI", value: "Succeeded", tone: "success", detail: "All stages passed" },
                { label: "Artifact", value: "Published", tone: "success", detail: "2 hours ago" },
                {
                  label: "Traffic",
                  value: "Serving production",
                  tone: "success",
                  detail: "app.myautonomy.eu",
                },
              ]}
            />
          </CardSection>
        </Card>
        <Card title="Pipeline" layout="sections" actions="Total 1m 56s so far">
          <CardSection>
            <Stepper
              mode="status"
              label="Pipeline stages"
              steps={runningStages}
              selectedStep={stage}
              onSelectionChange={setStage}
            />
          </CardSection>
          <CardSection padding="flush">
            <LogViewer
              variant="embedded"
              label="Build output"
              title={
                stage === null ? (
                  "All logs"
                ) : (
                  <>
                    {runningStages.find((step) => step.id === stage)?.label} logs
                    <Button intent="ghost" size="sm" onPress={() => setStage(null)}>
                      Show all stages
                    </Button>
                  </>
                )
              }
              lines={stageLog}
              visibleLines={10}
              emptyState={
                <EmptyState
                  title="This stage has not started"
                  description="Output appears when the stage runs."
                />
              }
              footerEnd={<Code>run #48224 · attempt 1</Code>}
            />
          </CardSection>
        </Card>
        <div {...stylex.props(styles.grid2)}>
          <Card
            title="Production candidate"
            description="Rollback holds production, so a passing candidate is staged."
          >
            <div {...stylex.props(styles.column)}>
              <Identifier value="dpl_FImAaZ9Q6" label="deployment ID" />
              <SegmentedProgress label="Pipeline for dpl_FImAaZ9Q6" steps={stagedStages} />
            </div>
          </Card>
          <Card title="Failed run" description="Vertical status steps with durations.">
            <Stepper
              mode="status"
              label="Stages of run 48212"
              orientation="vertical"
              steps={failedStages}
            />
          </Card>
        </div>
        <Card title="Activity" description="Audit history for this deployment.">
          <Timeline label="Activity" events={activityEvents()} />
        </Card>
      </Section>

      <Section
        title="Data grid"
        description="Rows open with Enter on the row header or a click anywhere on the row."
      >
        <DataTable
          caption="Deployments"
          columns={runColumns}
          data={runs}
          getRowId={(run) => run.id}
          sorting={sorting}
          onSortingChange={setSorting}
          density={density}
          isLoading={isLoading}
          loadingRows={4}
          pinnedColumns={{ start: ["name"], end: ["actions"] }}
          rowAction={{ onAction: (run) => toast(`Open ${run.name}`) }}
          expansion={{
            expandedIds: expanded,
            onChange: setExpanded,
            rowLabel: (run) => run.name,
            canExpand: (run) => run.status === "failed" || run.status === "building",
            render: (run) => (
              <SegmentedProgress
                label={`Pipeline for ${run.name}`}
                steps={run.status === "failed" ? failedStages : runningStages}
              />
            ),
          }}
          toolbar={
            <Toolbar
              label="Table options"
              density="compact"
              actions={
                <Switch isSelected={isLoading} onChange={setLoading}>
                  Loading state
                </Switch>
              }
            >
              <SegmentedControl
                size="sm"
                label="Density"
                value={density}
                onChange={setDensity}
                options={[
                  { id: "default", label: "Default" },
                  { id: "compact", label: "Compact" },
                ]}
              />
            </Toolbar>
          }
          pagination={{
            page,
            pageSize,
            total: 248,
            onPageChange: setPage,
            onPageSizeChange: (next) => {
              setPageSize(next);
              setPage(1);
            },
          }}
          emptyState={<EmptyState title="No deployments" />}
        />
      </Section>

      <Section title="Alerts and confirmation">
        <div {...stylex.props(styles.column)}>
          <Alert intent="neutral" title="Retention runs every night at 02:00 UTC" />
          <Alert
            intent="danger"
            announce="alert"
            title="The data source failed to respond, so the deployment list and the production state below may be out of date by several minutes"
            actions={<Button size="sm">Try again</Button>}
          >
            The GitHub Actions API returned 502 three times. The list refreshes on its own when the
            API answers.
          </Alert>
        </div>
        <Specimen label="Consequence-stating confirmation">
          <Button intent="danger" onPress={() => setRollbackOpen(true)}>
            Roll back production
          </Button>
        </Specimen>
      </Section>

      <ConfirmDialog
        isOpen={isRollbackOpen}
        onOpenChange={setRollbackOpen}
        title="Roll back production?"
        description={
          <>
            <Code>app.myautonomy.eu</Code> serves the deployment you choose within a minute.
          </>
        }
        consequences={[
          "Automatic promotion pauses until you undo the rollback.",
          "1 staged deployment stays staged.",
          "Nothing is rebuilt; the artifact already exists.",
        ]}
        confirmLabel="Roll back production"
        onConfirm={() => Promise.resolve()}
      >
        <RadioGroup
          label="Roll back to"
          value={rollbackTarget}
          onChange={setRollbackTarget}
          options={[
            {
              id: "rxt8",
              label: "dpl_rxt8gA84n",
              description: "Promoted 1d ago · Paginate audit log",
            },
            {
              id: "iZtx",
              label: "dpl_iZtxPSMVp",
              description: "Promoted 2d ago · Harden session refresh",
            },
          ]}
        />
      </ConfirmDialog>
    </>
  );
}

function Specimen({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div {...stylex.props(styles.specimen)}>
      <span {...stylex.props(styles.specimenLabel)}>{label}</span>
      <div {...stylex.props(styles.specimenBody)}>{children}</div>
    </div>
  );
}

const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: space.sm },
  column: { display: "flex", flexDirection: "column", gap: space.sm },
  caption: { fontSize: font.sm, color: color.textMuted },
  fields: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.md]: "repeat(2, minmax(0, 1fr))" },
    gap: space.lg,
    maxWidth: "40rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [media.md]: "repeat(2, minmax(0, 1fr))",
      [media.xl]: "repeat(3, minmax(0, 1fr))",
    },
    gap: space.lg,
    alignItems: "start",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.lg]: "repeat(2, minmax(0, 1fr))" },
    gap: space.lg,
    alignItems: "start",
  },
  specimen: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  specimenLabel: { fontSize: font.sm, fontWeight: font.medium, color: color.textMuted },
  specimenBody: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  mono: { fontFamily: font.mono, fontSize: font.sm },
  inline: { display: "inline-flex", alignItems: "center", gap: space.xs, minWidth: 0 },
  smallIcon: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.textMuted },
  hidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  inlineLink: { height: "auto", paddingInline: 0, fontSize: font.sm },
});
