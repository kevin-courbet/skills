import * as stylex from "@stylexjs/stylex";
import type { SortingState } from "@tanstack/react-table";
import { Bell, Copy, Filter, LayoutGrid, List, Pencil, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboBox } from "@/components/ui/combo-box";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Skeleton, Spinner } from "@/components/ui/feedback";
import {
  Card,
  DescriptionList,
  Kbd,
  PageHeader,
  Section,
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
  readonly region: string;
  readonly volume: number;
}

const sampleRows: ReadonlyArray<SampleRow> = [
  { id: "r1", name: "Northwind export", region: "EU West", volume: 12840 },
  { id: "r2", name: "Ledger sync", region: "US East", volume: 9310 },
  { id: "r3", name: "Payroll check", region: "EU Central", volume: 4022 },
];

const sampleColumns: ReadonlyArray<DataTableColumn<SampleRow>> = [
  { id: "name", accessorKey: "name", header: "Job" },
  { id: "region", accessorKey: "region", header: "Region" },
  {
    id: "volume",
    accessorKey: "volume",
    header: "Rows",
    cell: (info) => info.getValue<number>().toLocaleString("en-GB"),
  },
];

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
          <StatTile label="Jobs" value="1,284" hint="last 30 days" />
          <StatTile
            label="Failures"
            value="12"
            delta={{ value: "3", direction: "down", tone: "good" }}
            hint="vs last week"
          />
          <StatTile label="Rows synced" value="26.4M" delta={{ value: "8.1%", direction: "up" }} />
        </div>
        <Toolbar label="Filter jobs">
          <SearchField label="Search jobs" hideLabel placeholder="Search jobs" />
          <Badge intent="accent">3 filters</Badge>
        </Toolbar>
        <DataTable
          caption="Sample jobs"
          columns={sampleColumns}
          data={sampleRows}
          getRowId={(row) => row.id}
          numericColumns={["volume"]}
          sorting={sorting}
          onSortingChange={setSorting}
          emptyState={<EmptyState title="No jobs" />}
        />
        <Pagination page={page} pageCount={4} onPageChange={setPage} />
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
});
