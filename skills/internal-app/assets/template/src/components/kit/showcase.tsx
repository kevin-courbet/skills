import * as stylex from "@stylexjs/stylex";
import type { SortingState } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Bell,
  Copy,
  Download,
  Filter,
  Globe,
  LayoutGrid,
  List,
  Pause,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendChart } from "@/components/charts/trend-chart";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboBox } from "@/components/ui/combo-box";
import { useCommandPalette, useCommandPaletteShortcut } from "@/components/ui/command-palette";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import {
  DataTable,
  type DataTableColumn,
  MeterCell,
  TwoLineCell,
} from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { type DateRange, DateRangePicker } from "@/components/ui/date-range-picker";
import { Dialog } from "@/components/ui/dialog";
import { Accordion, Disclosure } from "@/components/ui/disclosure";
import { EmptyState, ErrorState, Skeleton, Spinner } from "@/components/ui/feedback";
import { FileUpload, type UploadFile } from "@/components/ui/file-upload";
import { Filters } from "@/components/ui/filters";
import {
  Card,
  Code,
  DescriptionList,
  Kbd,
  PageHeader,
  Section,
  SettingRow,
  SettingsCard,
  StatStrip,
  StatTile,
  Toolbar,
} from "@/components/ui/layout";
import { type LogLine, LogViewer } from "@/components/ui/log-viewer";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Meter } from "@/components/ui/meter";
import { MultiSelect } from "@/components/ui/multi-select";
import { NumberField } from "@/components/ui/number-field";
import { Pagination } from "@/components/ui/pagination";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RadioGroup } from "@/components/ui/radio-group";
import { SearchField } from "@/components/ui/search-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import { TagGroup } from "@/components/ui/tag-group";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toaster";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import type { ActiveFilter, FilterField } from "@/lib/filter-params";
import { color, font, media, size, space } from "@/styles/tokens.stylex";
import { OperationsShowcase } from "./showcase-operations";
import { WorkspaceShowcase } from "./showcase-workspace";

interface SampleRow {
  readonly id: string;
  readonly name: string;
  readonly status: "healthy" | "failed" | "paused";
  readonly region: string;
  readonly volume: number;
}

const sampleRows: ReadonlyArray<SampleRow> = [
  { id: "job_7f3a", name: "Northwind export", status: "healthy", region: "EU West", volume: 12840 },
  { id: "job_19c2", name: "Ledger sync", status: "failed", region: "US East", volume: 9310 },
  { id: "job_4be8", name: "Payroll check", status: "paused", region: "EU Central", volume: 4022 },
];

const statusDisplay = {
  healthy: { intent: "success", label: "Healthy" },
  failed: { intent: "danger", label: "Failed" },
  paused: { intent: "warning", label: "Paused" },
} as const;

const sampleDay = (index: number) => `2026-10-${String(index + 1).padStart(2, "0")}`;
const jobsPerDay = [96, 104, 99, 112, 108, 101, 94, 115, 121, 110, 108, 116].map(
  (value, index) => ({
    date: sampleDay(index),
    value,
  }),
);
const failuresPerDay = [3, 2, 4, 1, 2, 0, 1, 0, 1, 2, 0, 1].map((value, index) => ({
  date: sampleDay(index),
  value,
}));

const maxVolume = Math.max(...sampleRows.map((row) => row.volume));
const totalVolume = sampleRows.reduce((sum, row) => sum + row.volume, 0);

const teams = [
  { id: "ops", label: "Operations" },
  { id: "finance", label: "Finance", description: "Billing and payroll" },
  { id: "sales", label: "Sales" },
  { id: "support", label: "Support" },
] as const;

function cycle<T>(values: ReadonlyArray<T>, index: number): T {
  const value = values[index % values.length];
  if (value === undefined) throw new Error("cycle needs at least one value.");
  return value;
}

const sampleStatuses = ["healthy", "healthy", "failed", "healthy", "paused"] as const;
const sampleRegions = ["EU West", "US East", "EU Central", "AP South"] as const;

const jobFilterFields = [
  {
    id: "region",
    kind: "multiSelect",
    label: "Region",
    icon: Globe,
    options: sampleRegions.map((region) => ({
      id: region.toLowerCase().replace(" ", "-"),
      label: region,
    })),
  },
] as const satisfies ReadonlyArray<FilterField>;

/** One thousand rows for the virtualized table. */
const manyRows: ReadonlyArray<SampleRow> = Array.from({ length: 1000 }, (_, index) => ({
  id: `run_${String(index + 1).padStart(4, "0")}`,
  name: `Nightly batch ${index + 1}`,
  status: cycle(sampleStatuses, index),
  region: cycle(sampleRegions, index),
  volume: (index * 7919) % 20000,
}));

function compareValues(left: string | number, right: string | number): number {
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "en-GB", { numeric: true });
}

function sortRows(rows: ReadonlyArray<SampleRow>, sorting: SortingState) {
  const first = sorting[0];
  if (first === undefined) return rows;
  const key = first.id;
  if (key !== "name" && key !== "region" && key !== "volume") return rows;
  const direction = first.desc ? -1 : 1;
  return rows.toSorted((a, b) => compareValues(a[key], b[key]) * direction);
}

const datePresets = [
  { label: "Last 7 days", value: { start: "2026-10-06", end: "2026-10-12" } },
  { label: "Last 30 days", value: { start: "2026-09-13", end: "2026-10-12" } },
  { label: "This month", value: { start: "2026-10-01", end: "2026-10-12" } },
];

const sampleFiles: ReadonlyArray<UploadFile> = [
  { id: "f1", name: "payroll-october.csv", size: 482_113, status: "done" },
  { id: "f2", name: "ledger-2026-q3.xlsx", size: 2_301_220, status: "uploading", progress: 64 },
  {
    id: "f3",
    name: "bank-export.csv",
    size: 12_044,
    status: "failed",
    error: "The file has no header row. Add one and upload it again.",
  },
  { id: "f4", name: "vendors.csv", size: 3_120, status: "queued" },
];

const buildSteps = ["install", "build", "test"] as const;
const sampleLog: ReadonlyArray<LogLine> = [
  ...Array.from({ length: 48 }, (_, index): LogLine => {
    const step = cycle(buildSteps, Math.floor(index / 16));
    const isWarning = index === 21;
    return {
      id: `l${index}`,
      at: `2026-10-12T02:00:${String(index).padStart(2, "0")}Z`,
      level: isWarning ? "warn" : "info",
      source: step,
      text: isWarning
        ? "Deprecated option experimentalDecorators is ignored."
        : `step ${index + 1} finished in ${(index * 37) % 400} ms`,
    };
  }),
  {
    id: "l48",
    at: "2026-10-12T02:00:48Z",
    level: "error",
    source: "test",
    text: "FAIL src/ledger.test.ts > totals > rounds to cents. Expected 104.25, received 104.2",
  },
  {
    id: "l49",
    at: "2026-10-12T02:00:49Z",
    level: "info",
    source: "test",
    text: "Tests 1 failed | 211 passed",
  },
];

function Specimen({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div {...stylex.props(styles.specimen)}>
      <span {...stylex.props(styles.specimenLabel)}>{label}</span>
      <div {...stylex.props(styles.specimenBody)}>{children}</div>
    </div>
  );
}

/**
 * Every kit primitive in its main states, on one page. Render it on a route
 * to check a new install or an upgrade in both themes.
 */
export function KitShowcase() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [team, setTeam] = useState<string | null>("finance");
  const [date, setDate] = useState<string | null>("2026-10-12");
  const [sorting, setSorting] = useState<SortingState>([{ id: "volume", desc: true }]);
  const [page, setPage] = useState(2);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const peekRow = peekIndex === null ? undefined : sampleRows[peekIndex];
  const [selectedIds, setSelectedIds] = useState<ReadonlyArray<string>>([]);
  const [jobFilters, setJobFilters] = useState<ReadonlyArray<ActiveFilter>>([
    { kind: "multiSelect", field: "region", operator: "is", value: ["eu-west"] },
  ]);
  const [hiddenColumns, setHiddenColumns] = useState<ReadonlyArray<string>>([]);
  const [runSorting, setRunSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [range, setRange] = useState<DateRange | null>({ start: "2026-10-06", end: "2026-10-12" });
  const [owners, setOwners] = useState<ReadonlyArray<string>>(["finance", "ops"]);
  const [labels, setLabels] = useState([
    { id: "billing", label: "Billing" },
    { id: "eu", label: "EU" },
    { id: "nightly", label: "Nightly" },
  ]);
  const [files, setFiles] = useState(sampleFiles);
  const [importStep, setImportStep] = useState<"source" | "mapping" | "review" | "import">(
    "review",
  );
  const palette = useCommandPalette();
  const shortcut = useCommandPaletteShortcut();

  const sampleColumns: ReadonlyArray<DataTableColumn<SampleRow>> = [
    {
      id: "name",
      accessorKey: "name",
      header: "Job",
      enableHiding: false,
      cell: (info) => (
        <TwoLineCell
          primary={<span {...stylex.props(styles.rowName)}>{info.row.original.name}</span>}
          secondary={<Code>{info.row.original.id}</Code>}
        />
      ),
      footer: `${sampleRows.length} jobs`,
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => {
        const status = statusDisplay[info.row.original.status];
        return <StatusDot intent={status.intent}>{status.label}</StatusDot>;
      },
      footer: "1 failed",
    },
    { id: "region", accessorKey: "region", header: "Region" },
    {
      id: "volume",
      accessorKey: "volume",
      header: "Rows",
      cell: (info) => (
        <MeterCell
          label={info.getValue<number>().toLocaleString("en-GB")}
          value={info.getValue<number>()}
          max={maxVolume}
        />
      ),
      footer: `${totalVolume.toLocaleString("en-GB")} total`,
    },
  ];

  const runColumns: ReadonlyArray<DataTableColumn<SampleRow>> = [
    { id: "name", accessorKey: "name", header: "Run", size: 220 },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      size: 120,
      cell: (info) => {
        const status = statusDisplay[info.row.original.status];
        return <StatusDot intent={status.intent}>{status.label}</StatusDot>;
      },
    },
    { id: "region", accessorKey: "region", header: "Region", size: 140 },
    {
      id: "volume",
      accessorKey: "volume",
      header: "Rows",
      size: 120,
      cell: (info) => info.getValue<number>().toLocaleString("en-GB"),
    },
  ];

  return (
    <div {...stylex.props(styles.root)}>
      <PageHeader
        title="Design kit"
        description="Every primitive of the internal-app kit in its main states."
        actions={
          <>
            <Button>Secondary</Button>
            <Button intent="primary">
              <Plus aria-hidden width={16} height={16} />
              Primary
            </Button>
          </>
        }
      />

      <Section title="Actions">
        <div {...stylex.props(styles.grid)}>
          <Specimen label="Intents">
            <Button intent="primary">Primary</Button>
            <Button>Secondary</Button>
            <Button intent="ghost">Ghost</Button>
            <Button intent="danger">Delete</Button>
          </Specimen>
          <Specimen label="Sizes and states">
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button isDisabled>Disabled</Button>
            <Button iconOnly aria-label="Copy">
              <Copy aria-hidden width={16} height={16} />
            </Button>
          </Specimen>
          <Specimen label="Segmented control">
            <SegmentedControl
              label="View"
              value={view}
              onChange={setView}
              options={[
                { id: "list", label: "List", icon: List },
                { id: "grid", label: "Grid", icon: LayoutGrid },
              ]}
            />
          </Specimen>
          <Specimen label="Menu, tooltip, popover">
            <MenuTrigger>
              <Button>Actions</Button>
              <Menu aria-label="Item actions">
                <MenuItem icon={<Pencil width={16} height={16} />} shortcut="E">
                  Edit
                </MenuItem>
                <MenuItem icon={<Copy width={16} height={16} />}>Duplicate</MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Trash2 width={16} height={16} />} isDestructive>
                  Delete
                </MenuItem>
              </Menu>
            </MenuTrigger>
            <TooltipTrigger>
              <Button iconOnly intent="ghost" aria-label="Notifications">
                <Bell aria-hidden width={16} height={16} />
              </Button>
              <Tooltip>Notifications</Tooltip>
            </TooltipTrigger>
            <PopoverTrigger>
              <Button>
                <Filter aria-hidden width={16} height={16} />
                Filters
              </Button>
              <Popover title="Filters" showTitle>
                <Checkbox defaultSelected>Active only</Checkbox>
                <Checkbox>Include archived</Checkbox>
              </Popover>
            </PopoverTrigger>
          </Specimen>
          <Specimen label="Command palette">
            <Button onPress={palette.open}>Open command palette</Button>
            <Kbd>{shortcut}</Kbd>
          </Specimen>
        </div>
      </Section>

      <Section title="Fields">
        <div {...stylex.props(styles.fields)}>
          <TextField label="Name" placeholder="Workspace name" />
          <TextField
            label="Owner"
            description="Team that maintains the item."
            defaultValue="finance"
          />
          <TextField label="Code" errorMessage="Use 3 to 8 letters." defaultValue="x" isInvalid />
          <TextField label="Disabled" defaultValue="Read only" isDisabled />
          <NumberField
            label="Amount"
            defaultValue={1250}
            formatOptions={{ style: "currency", currency: "EUR" }}
          />
          <Select
            label="Status"
            defaultValue="active"
            options={[
              { id: "active", label: "Active" },
              { id: "paused", label: "Paused" },
            ]}
          />
          <ComboBox
            label="Team"
            placeholder="Search teams"
            options={teams}
            value={team}
            onChange={setTeam}
          />
          <DatePicker label="Start date" value={date} onChange={setDate} />
          <DateRangePicker label="Period" value={range} onChange={setRange} presets={datePresets} />
          <MultiSelect
            label="Owners"
            placeholder="Any team"
            options={teams}
            value={owners}
            onChange={setOwners}
            showTags
          />
          <SearchField label="Search" placeholder="Search items" />
          <TextField label="Notes" multiline placeholder="Context for the next person" />
        </div>
        <div {...stylex.props(styles.grid)}>
          <RadioGroup
            label="Schedule"
            defaultValue="daily"
            options={[
              { id: "hourly", label: "Hourly" },
              { id: "daily", label: "Daily", description: "At 02:00 UTC" },
              { id: "weekly", label: "Weekly" },
            ]}
          />
          <Specimen label="Checkbox and switch">
            <div {...stylex.props(styles.stack)}>
              <Checkbox defaultSelected>Send summary email</Checkbox>
              <Checkbox isIndeterminate>Select all rows</Checkbox>
              <Switch defaultSelected>Automatic retries</Switch>
              <Switch>Maintenance mode</Switch>
            </div>
          </Specimen>
          <div {...stylex.props(styles.stack)}>
            <TagGroup
              label="Labels"
              items={labels}
              onRemove={(ids) => setLabels(labels.filter((label) => !ids.includes(label.id)))}
              emptyLabel="No labels"
            />
            <TagGroup
              label="Read-only tags"
              items={[
                { id: "pii", label: "Contains PII" },
                { id: "export", label: "Exported" },
              ]}
            />
          </div>
        </div>
        <FileUpload
          label="Source files"
          description="CSV or XLSX, up to 10 MB each."
          acceptedFileTypes={[
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ]}
          allowsMultiple
          files={files}
          onSelect={(selected) =>
            setFiles([
              ...files,
              ...selected.map((file): UploadFile => ({
                id: `${file.name}-${file.lastModified}`,
                name: file.name,
                size: file.size,
                status: "queued",
              })),
            ])
          }
          onRemove={(id) => setFiles(files.filter((file) => file.id !== id))}
        />
      </Section>

      <Section title="Data">
        <div {...stylex.props(styles.stats)}>
          <StatTile
            label="Jobs"
            value="1,284"
            delta={{ value: "8.1%", direction: "up" }}
            chart={
              <Sparkline
                label="Jobs per day"
                description="Jobs per day for the last 12 days."
                series={jobsPerDay}
              />
            }
            footnote="Measured · last 12 days"
          />
          <StatTile
            label="Failures"
            value="12"
            delta={{ value: "3", direction: "down", tone: "good" }}
            hint="vs last week"
            chart={
              <Sparkline
                label="Failures per day"
                description="Failed jobs per day for the last 12 days."
                series={failuresPerDay}
              />
            }
          />
          <StatTile label="Rows synced" value="26.4M" hint="last 30 days" />
        </div>
        <StatStrip
          items={[
            { label: "Elapsed", value: "320 ms" },
            { label: "Steps", value: "3", hint: "3 types" },
            { label: "Failed steps", value: "2", tone: "danger" },
            { label: "Coverage", value: "100%" },
          ]}
        />
        <TrendChart
          title="Jobs per day"
          description="Completed jobs per day for the last 12 days."
          unit="Jobs"
          source="Job runner, sample data"
          series={jobsPerDay}
        />
        <DataTable
          caption="Sample jobs"
          columns={sampleColumns}
          data={sampleRows}
          getRowId={(row) => row.id}
          numericColumns={["volume"]}
          sorting={sorting}
          onSortingChange={setSorting}
          pinnedColumns={{ start: ["name"] }}
          rowAction={{ onAction: (row) => setPeekIndex(sampleRows.indexOf(row)) }}
          activeRowId={peekRow?.id}
          selection={{
            selectedIds,
            onChange: setSelectedIds,
            rowLabel: (row) => row.name,
            canSelect: (row) => row.status !== "paused",
            actions: (ids) => (
              <>
                <Button size="sm">
                  <Pause aria-hidden width={14} height={14} />
                  Pause
                </Button>
                <Button size="sm" onPress={() => setConfirmOpen(true)}>
                  <Trash2 aria-hidden width={14} height={14} />
                  Delete {ids.length} {ids.length === 1 ? "job" : "jobs"}
                </Button>
              </>
            ),
          }}
          columnVisibility={{ hidden: hiddenColumns, onChange: setHiddenColumns }}
          toolbar={
            <Toolbar
              label="Filter jobs"
              density="compact"
              actions={
                <>
                  <Button intent="ghost" size="sm" iconOnly aria-label="Refresh">
                    <RefreshCw aria-hidden width={14} height={14} />
                  </Button>
                  <Button intent="ghost" size="sm" iconOnly aria-label="Export">
                    <Download aria-hidden width={14} height={14} />
                  </Button>
                </>
              }
            >
              <Select
                label="Scope"
                hideLabel
                size="sm"
                defaultValue="all"
                options={[
                  { id: "all", label: "All jobs" },
                  { id: "mine", label: "My jobs" },
                ]}
                style={styles.scope}
              />
              <SearchField
                label="Search jobs"
                hideLabel
                size="sm"
                focusShortcut
                placeholder="Search jobs"
                style={styles.toolbarSearch}
              />
              <Filters
                label="Job filters"
                fields={jobFilterFields}
                value={jobFilters}
                onChange={setJobFilters}
              />
            </Toolbar>
          }
          emptyState={<EmptyState title="No jobs" />}
        />
        <Pagination page={page} pageCount={4} onPageChange={setPage} />
        <DataTable
          caption="Nightly runs"
          columns={runColumns}
          data={sortRows(manyRows, runSorting)}
          getRowId={(row) => row.id}
          numericColumns={["volume"]}
          sorting={runSorting}
          onSortingChange={setRunSorting}
          resizableColumns
          virtualize={{ visibleRows: 10 }}
          emptyState={<EmptyState title="No runs" />}
        />
        <SettingsCard title="Organization">
          <SettingRow label="Name" description="Shown in the sidebar and in exports.">
            <TextField
              label="Name"
              hideLabel
              defaultValue="Northwind"
              style={styles.settingField}
            />
            <Button size="sm">Save</Button>
          </SettingRow>
          <SettingRow label="Organization ID">
            <Code>org_northwind</Code>
            <CopyButton value="org_northwind" label="Copy organization ID" />
          </SettingRow>
          <SettingRow label="Mode">
            <Badge>Managed</Badge>
          </SettingRow>
        </SettingsCard>
        <div {...stylex.props(styles.grid)}>
          <Card>
            <DescriptionList
              items={[
                { term: "Status", detail: <Badge intent="success">Healthy</Badge> },
                { term: "Region", detail: "EU West" },
                { term: "Shortcut", detail: <Kbd>⌘ K</Kbd> },
              ]}
            />
          </Card>
          <Specimen label="Badges">
            <Badge>Neutral</Badge>
            <Badge intent="accent">Accent</Badge>
            <Badge intent="success">Active</Badge>
            <Badge intent="warning">Paused</Badge>
            <Badge intent="danger">Failed</Badge>
            <Badge intent="info">Queued</Badge>
          </Specimen>
        </div>
        <Breadcrumbs
          items={[
            { id: "a", label: "Items", href: "/items" },
            { id: "b", label: "Workspace 12", href: "/items" },
          ]}
        />
      </Section>

      <Section title="Progress and people">
        <div {...stylex.props(styles.grid)}>
          <Specimen label="Progress bar">
            <div {...stylex.props(styles.stack, styles.wide)}>
              <ProgressBar label="Importing rows" value={64} />
              <ProgressBar label="Files" value={3} maxValue={12} valueLabel="3 of 12 files" />
              <ProgressBar label="Preparing export" isIndeterminate />
            </div>
          </Specimen>
          <Specimen label="Meter">
            <div {...stylex.props(styles.stack, styles.wide)}>
              <Meter
                label="Storage"
                value={42}
                valueLabel="42 GB of 100 GB"
                warningAt={75}
                dangerAt={90}
              />
              <Meter label="API quota" value={81} warningAt={75} dangerAt={90} />
              <Meter label="Disk" value={96} warningAt={75} dangerAt={90} />
            </div>
          </Specimen>
          <Specimen label="Avatar">
            <Avatar name="Ada Lovelace" size="sm" />
            <Avatar name="Grace Hopper" />
            <Avatar name="Katherine Johnson" size="lg" />
            <AvatarGroup
              label="Owners"
              people={[
                { name: "Ada Lovelace" },
                { name: "Grace Hopper" },
                { name: "Alan Turing" },
                { name: "Edsger Dijkstra" },
                { name: "Barbara Liskov" },
                { name: "Donald Knuth" },
              ]}
            />
          </Specimen>
        </div>
      </Section>

      <Section title="Steps and history">
        <Stepper
          label="Import steps"
          steps={[
            { id: "source", label: "Source", description: "Upload files" },
            { id: "mapping", label: "Mapping", description: "Match columns" },
            { id: "review", label: "Review", description: "Check 1,284 rows" },
            { id: "import", label: "Import" },
          ]}
          currentStep={importStep}
          onStepPress={setImportStep}
        />
        <div {...stylex.props(styles.grid)}>
          <Card title="Wizard, vertical">
            <Stepper
              label="Import steps, vertical"
              orientation="vertical"
              steps={[
                { id: "source", label: "Source", description: "Upload files" },
                { id: "mapping", label: "Mapping", description: "Match columns" },
                { id: "review", label: "Review", description: "Check 1,284 rows" },
                { id: "import", label: "Import" },
              ]}
              currentStep={importStep}
              onStepPress={setImportStep}
            />
          </Card>
          <Card title="Live run">
            <Stepper
              mode="status"
              label="Live run stages"
              orientation="vertical"
              steps={[
                {
                  id: "install",
                  label: "Install",
                  description: "bun install",
                  status: "success",
                  duration: "11s",
                },
                {
                  id: "build",
                  label: "Build",
                  description: "bun run build",
                  status: "running",
                  duration: "32s so far",
                },
                { id: "test", label: "Test", description: "bun run test", status: "pending" },
              ]}
            />
          </Card>
        </div>
        <LogViewer
          label="Build output"
          lines={sampleLog}
          emptyState={
            <EmptyState
              title="Waiting for a runner"
              description="Build output appears when this run starts."
            />
          }
          downloadName="run_0042.log"
          visibleLines={12}
          footnote="Sample output"
        />
      </Section>

      <OperationsShowcase />

      <WorkspaceShowcase />

      <Section title="Feedback">
        <div {...stylex.props(styles.stack)}>
          <Alert title="Sync is paused for maintenance">
            Jobs resume at 06:00 UTC. Queued work is kept.
          </Alert>
          <Alert intent="success" title="Import finished">
            1,284 rows were added.
          </Alert>
          <Alert
            intent="warning"
            title="Two jobs are slow"
            actions={<Button size="sm">View jobs</Button>}
          >
            Their median run time doubled this week.
          </Alert>
          <Alert intent="danger" title="Payroll export failed">
            The bank rejected the file. Check the account number and run it again.
          </Alert>
        </div>
        <div {...stylex.props(styles.grid)}>
          <Card>
            <EmptyState
              title="No exports yet"
              description="Exports appear here after the first run."
              action={<Button>Run export</Button>}
            />
          </Card>
          <ErrorState
            message="The jobs could not load. The details are in the server log."
            action={<Button>Try again</Button>}
          />
          <Specimen label="Loading">
            <div {...stylex.props(styles.stack, styles.wide)}>
              <Skeleton style={styles.skeletonWide} />
              <Skeleton style={styles.skeletonNarrow} />
              <Spinner />
            </div>
          </Specimen>
        </div>
      </Section>

      <Section title="Overlays">
        <Specimen label="Open each overlay">
          <Button onPress={() => setDialogOpen(true)}>Dialog</Button>
          <Button onPress={() => setConfirmOpen(true)}>Confirm dialog</Button>
          <Button onPress={() => setSheetOpen(true)}>Sheet</Button>
          <Button
            onPress={() => toast("Export queued", { description: "You can leave this page." })}
          >
            Toast
          </Button>
        </Specimen>
        <div {...stylex.props(styles.grid)}>
          <Specimen label="Disclosure">
            <div {...stylex.props(styles.stack, styles.wide)}>
              <Disclosure title="Request payload" hint="2 KB">
                <Code>job_7f3a · dry run off</Code>
              </Disclosure>
              <Disclosure title="Advanced settings" defaultExpanded>
                Retries and timeouts use the workspace defaults.
              </Disclosure>
            </div>
          </Specimen>
          <Accordion defaultExpandedKeys={["schedule"]}>
            <Disclosure id="schedule" title="Schedule">
              Runs every day at 02:00 UTC.
            </Disclosure>
            <Disclosure id="retries" title="Retries" hint="3 attempts">
              Failed runs retry after 5, 15, and 45 minutes.
            </Disclosure>
            <Disclosure id="alerts" title="Alerts">
              Failures notify the finance channel.
            </Disclosure>
          </Accordion>
        </div>
        <Tabs>
          <TabList aria-label="Job sections">
            <Tab id="runs">Runs</Tab>
            <Tab id="schedule">Schedule</Tab>
            <Tab id="settings">Settings</Tab>
          </TabList>
          <TabPanel id="runs">Recent runs appear here.</TabPanel>
          <TabPanel id="schedule">The schedule appears here.</TabPanel>
          <TabPanel id="settings">Settings appear here.</TabPanel>
        </Tabs>
      </Section>

      <Dialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Rename job"
        description="The new name appears in every list."
        actions={(close) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button intent="primary" onPress={close}>
              Save
            </Button>
          </>
        )}
      >
        <TextField label="Name" defaultValue="Northwind export" />
      </Dialog>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Northwind export?"
        description="The job and its run history are removed. This cannot be undone."
        confirmLabel="Delete job"
        onConfirm={() => Promise.resolve()}
      />
      <Sheet
        isOpen={isSheetOpen}
        onOpenChange={setSheetOpen}
        title="Northwind export"
        description="Runs every day at 02:00 UTC."
        actions={(close) => (
          <>
            <Button onPress={close}>Close</Button>
            <Button intent="primary" onPress={close}>
              Run now
            </Button>
          </>
        )}
      >
        <DescriptionList
          items={[
            { term: "Region", detail: "EU West" },
            { term: "Last run", detail: "12 Oct 2026, 02:00" },
            { term: "Rows", detail: "12,840" },
          ]}
        />
      </Sheet>
      {peekRow && peekIndex !== null ? (
        <Sheet
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) setPeekIndex(null);
          }}
          size="peek"
          title={peekRow.name}
          meta={
            <>
              <Code>{peekRow.id}</Code>
              <CopyButton value={peekRow.id} label="Copy job ID" />
            </>
          }
          headerActions={
            <Button size="sm">
              Open page
              <ArrowUpRight aria-hidden width={14} height={14} />
            </Button>
          }
          navigation={{
            onPrevious: peekIndex > 0 ? () => setPeekIndex(peekIndex - 1) : undefined,
            onNext:
              peekIndex < sampleRows.length - 1 ? () => setPeekIndex(peekIndex + 1) : undefined,
          }}
        >
          <div {...stylex.props(styles.peekBody)}>
            <StatStrip
              items={[
                { label: "Status", value: statusDisplay[peekRow.status].label },
                { label: "Region", value: peekRow.region },
                { label: "Rows", value: peekRow.volume.toLocaleString("en-GB") },
              ]}
            />
            <DescriptionList
              items={[
                { term: "Schedule", detail: "Every day at 02:00 UTC" },
                { term: "Owner", detail: "Finance" },
              ]}
            />
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.xxxl },
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
  fields: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [media.md]: "repeat(2, minmax(0, 1fr))",
      [media.xl]: "repeat(3, minmax(0, 1fr))",
    },
    gap: space.lg,
    alignItems: "start",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.sm]: "repeat(3, minmax(0, 1fr))" },
    gap: space.md,
  },
  specimen: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  specimenLabel: { fontSize: font.sm, fontWeight: font.medium, color: color.textMuted },
  specimenBody: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  stack: { display: "flex", flexDirection: "column", gap: space.sm },
  wide: { width: "100%" },
  skeletonWide: { width: "100%", height: size.controlMd },
  skeletonNarrow: { width: "60%" },
  rowName: { fontWeight: font.medium },
  scope: { width: "8rem" },
  toolbarSearch: { flex: "1", minWidth: "12rem" },
  settingField: { width: "14rem" },
  peekBody: { display: "flex", flexDirection: "column", gap: space.lg },
});
