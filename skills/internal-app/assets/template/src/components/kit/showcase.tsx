import * as stylex from "@stylexjs/stylex";
import type { SortingState } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Bell,
  Copy,
  Download,
  Filter,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboBox } from "@/components/ui/combo-box";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { DataTable, type DataTableColumn, MeterCell } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Skeleton, Spinner } from "@/components/ui/feedback";
import { FilterChip } from "@/components/ui/filter-chip";
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
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { NumberField } from "@/components/ui/number-field";
import { Pagination } from "@/components/ui/pagination";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup } from "@/components/ui/radio-group";
import { SearchField } from "@/components/ui/search-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toaster";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { color, font, media, size, space } from "@/styles/tokens.stylex";

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

const maxVolume = Math.max(...sampleRows.map((row) => row.volume));
const totalVolume = sampleRows.reduce((sum, row) => sum + row.volume, 0);

const teams = [
  { id: "ops", label: "Operations" },
  { id: "finance", label: "Finance", description: "Billing and payroll" },
  { id: "sales", label: "Sales" },
  { id: "support", label: "Support" },
] as const;

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

  const sampleColumns: ReadonlyArray<DataTableColumn<SampleRow>> = [
    {
      id: "name",
      accessorKey: "name",
      header: "Job",
      cell: (info) => (
        <span {...stylex.props(styles.nameCell)}>
          <Button
            intent="ghost"
            size="sm"
            onPress={() => setPeekIndex(info.row.index)}
            style={styles.rowLink}
          >
            {info.row.original.name}
          </Button>
          <Code>{info.row.original.id}</Code>
        </span>
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
        </div>
      </Section>

      <Section title="Data">
        <div {...stylex.props(styles.stats)}>
          <StatTile
            label="Jobs"
            value="1,284"
            delta={{ value: "8.1%", direction: "up" }}
            footnote="Measured · last 12 days"
          />
          <StatTile
            label="Failures"
            value="12"
            delta={{ value: "3", direction: "down", tone: "good" }}
            hint="vs last week"
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
        <DataTable
          caption="Sample jobs"
          columns={sampleColumns}
          data={sampleRows}
          getRowId={(row) => row.id}
          numericColumns={["volume"]}
          sorting={sorting}
          onSortingChange={setSorting}
          stickyFirstColumn
          activeRowId={peekRow?.id}
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
              <FilterChip label="Region" value="EU West" onRemove={() => undefined} />
              <SearchField
                label="Search jobs"
                hideLabel
                size="sm"
                focusShortcut
                placeholder="Search jobs"
                style={styles.toolbarSearch}
              />
            </Toolbar>
          }
          emptyState={<EmptyState title="No jobs" />}
        />
        <Pagination page={page} pageCount={4} onPageChange={setPage} />
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
            action={<Button size="sm">View jobs</Button>}
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
  nameCell: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" },
  rowLink: {
    height: "auto",
    paddingInline: 0,
    fontSize: font.md,
    color: color.text,
    backgroundColor: { default: "transparent", ":hover": "transparent", ":active": "transparent" },
    textDecoration: { default: "none", ":hover": "underline" },
  },
  scope: { width: "8rem" },
  toolbarSearch: { flex: "1", minWidth: "12rem" },
  settingField: { width: "14rem" },
  peekBody: { display: "flex", flexDirection: "column", gap: space.lg },
});
