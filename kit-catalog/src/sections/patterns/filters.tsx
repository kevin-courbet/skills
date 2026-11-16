import * as stylex from "@stylexjs/stylex";
import type { SortingState } from "@tanstack/react-table";
import { Bike, CalendarDays, CircleDot, SearchX, Wrench } from "lucide-react";
import { useState } from "react";
import type { ActiveFilter, FilterField } from "@/components/helpers/filter-params";
import { DataTable, type DataTableColumn } from "@/components/patterns/data-table";
import { Filters } from "@/components/patterns/filters";
import { StatusDot } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/feedback";
import { Toolbar } from "@/components/primitives/layout";
import { SearchField } from "@/components/primitives/search-field";
import { defineSection, Labeled } from "../../specimen";

const statusField = {
  id: "status",
  label: "Status",
  icon: CircleDot,
  kind: "multiSelect",
  options: [
    { id: "received", label: "Received", intent: "info" },
    { id: "inProgress", label: "In progress", intent: "accent" },
    { id: "waitingForPart", label: "Waiting for a part", intent: "warning" },
    { id: "ready", label: "Ready for pickup", intent: "success" },
    { id: "invoiced", label: "Invoiced", intent: "neutral" },
  ],
} as const satisfies FilterField;

const mechanicField = {
  id: "mechanic",
  label: "Mechanic",
  icon: Wrench,
  kind: "select",
  options: [
    { id: "lena", label: "Lena Fischer" },
    { id: "marco", label: "Marco Rossi" },
    { id: "sam", label: "Sam Okafor" },
  ],
} as const satisfies FilterField;

const bikeField = {
  id: "bike",
  label: "Bike",
  icon: Bike,
  kind: "text",
  placeholder: "e.g. Brompton C Line",
} as const satisfies FilterField;

/** The presets come from a fixed reference date, so that the specimen is the same on each day. */
const receivedField = {
  id: "received",
  label: "Received",
  icon: CalendarDays,
  kind: "dateRange",
  presets: [
    { label: "Today", value: { start: "2026-11-16", end: "2026-11-16" } },
    { label: "Last 7 days", value: { start: "2026-11-10", end: "2026-11-16" } },
    { label: "This month", value: { start: "2026-11-01", end: "2026-11-30" } },
  ],
} as const satisfies FilterField;

const workOrderFields = [
  statusField,
  mechanicField,
  bikeField,
  receivedField,
] as const satisfies ReadonlyArray<FilterField>;

const activeFilters: ReadonlyArray<ActiveFilter> = [
  { kind: "multiSelect", field: "status", operator: "is", value: ["inProgress", "waitingForPart"] },
  { kind: "select", field: "mechanic", operator: "is", value: "marco" },
  {
    kind: "text",
    field: "bike",
    operator: "contains",
    value: "Riese & Müller Load 75 cargo bike with the child seat and the rain cover",
  },
  {
    kind: "dateRange",
    field: "received",
    operator: "between",
    value: { start: "2026-11-10", end: "2026-11-16" },
  },
];

const operatorFields = [
  {
    ...statusField,
    operators: [
      { id: "is", label: "is" },
      { id: "isNot", label: "is not" },
    ],
  },
  {
    ...bikeField,
    operators: [
      { id: "contains", label: "contains" },
      { id: "doesNotContain", label: "does not contain" },
    ],
  },
] as const satisfies ReadonlyArray<FilterField>;

const operatorFilters: ReadonlyArray<ActiveFilter> = [
  { kind: "multiSelect", field: "status", operator: "isNot", value: ["invoiced"] },
];

/** More than 8 options, so the value list gets a search box. */
const brandField = {
  id: "brand",
  label: "Bike brand",
  icon: Bike,
  kind: "multiSelect",
  options: [
    { id: "bianchi", label: "Bianchi" },
    { id: "brompton", label: "Brompton" },
    { id: "canyon", label: "Canyon" },
    { id: "cannondale", label: "Cannondale" },
    { id: "cube", label: "Cube" },
    { id: "gazelle", label: "Gazelle" },
    { id: "giant", label: "Giant" },
    { id: "raleigh", label: "Raleigh" },
    { id: "riese-mueller", label: "Riese & Müller" },
    { id: "specialized", label: "Specialized" },
    { id: "tern", label: "Tern" },
    { id: "trek", label: "Trek" },
  ],
} as const satisfies FilterField;

const brandFields = [brandField, mechanicField] as const satisfies ReadonlyArray<FilterField>;

const brandFilters: ReadonlyArray<ActiveFilter> = [
  {
    kind: "multiSelect",
    field: "brand",
    operator: "is",
    value: ["brompton", "riese-mueller", "tern"],
  },
];

const allUsedFilters: ReadonlyArray<ActiveFilter> = [
  { kind: "multiSelect", field: "status", operator: "is", value: ["ready"] },
  { kind: "select", field: "mechanic", operator: "is", value: "lena" },
  { kind: "text", field: "bike", operator: "contains", value: "Brompton" },
  {
    kind: "dateRange",
    field: "received",
    operator: "between",
    value: { start: "2026-11-01", end: "2026-11-30" },
  },
];

function FilterBar({
  label,
  fields,
  initial,
}: {
  readonly label: string;
  readonly fields: ReadonlyArray<FilterField>;
  readonly initial: ReadonlyArray<ActiveFilter>;
}) {
  const [value, setValue] = useState(initial);
  return <Filters label={label} fields={fields} value={value} onChange={setValue} />;
}

function SearchAndFilters({
  size,
  initial,
}: {
  readonly size?: "sm";
  readonly initial: ReadonlyArray<ActiveFilter>;
}) {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState(initial);
  return (
    <Toolbar label="Filter work orders" size={size}>
      <SearchField
        label="Search"
        hideLabel
        placeholder="Search by order or customer"
        value={query}
        onChange={setQuery}
        style={styles.search}
      />
      <Filters
        label="Work order filters"
        fields={workOrderFields}
        value={value}
        onChange={setValue}
      />
    </Toolbar>
  );
}

interface QueueOrder {
  readonly id: string;
  readonly bike: string;
  readonly mechanic: (typeof mechanicField.options)[number]["id"];
  readonly status: (typeof statusField.options)[number]["id"];
}

const queueOrders: ReadonlyArray<QueueOrder> = [
  { id: "WO-1042", bike: "Trek Domane AL 2", mechanic: "lena", status: "inProgress" },
  { id: "WO-1043", bike: "Brompton C Line", mechanic: "marco", status: "waitingForPart" },
  { id: "WO-1044", bike: "Specialized Rockhopper", mechanic: "lena", status: "ready" },
  { id: "WO-1046", bike: "Cannondale Topstone 3", mechanic: "sam", status: "inProgress" },
];

function optionOf<T extends { readonly id: string }>(options: ReadonlyArray<T>, id: string): T {
  const option = options.find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error(`The Filters specimen has no option "${id}".`);
  return option;
}

const queueColumns: ReadonlyArray<DataTableColumn<QueueOrder>> = [
  { id: "bike", accessorKey: "bike", header: "Bike" },
  { id: "id", accessorKey: "id", header: "Work order" },
  {
    id: "mechanic",
    accessorKey: "mechanic",
    header: "Mechanic",
    cell: (info) => optionOf(mechanicField.options, info.row.original.mechanic).label,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const option = optionOf(statusField.options, info.row.original.status);
      return <StatusDot intent={option.intent}>{option.label}</StatusDot>;
    },
  },
];

const queueFields = [statusField, mechanicField] as const satisfies ReadonlyArray<FilterField>;

/** Applies the status and mechanic filters in the browser, in place of the server. */
function matchesFilters(order: QueueOrder, filters: ReadonlyArray<ActiveFilter>): boolean {
  return filters.every((filter) => {
    if (filter.field === "status" && filter.kind === "multiSelect")
      return filter.value.includes(order.status);
    if (filter.field === "mechanic" && filter.kind === "select")
      return filter.value === order.mechanic;
    throw new Error(`The Filters specimen cannot apply the "${filter.field}" filter.`);
  });
}

function FiltersWithNoRows() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [value, setValue] = useState<ReadonlyArray<ActiveFilter>>([
    { kind: "multiSelect", field: "status", operator: "is", value: ["ready"] },
    { kind: "select", field: "mechanic", operator: "is", value: "marco" },
  ]);
  return (
    <DataTable
      caption="Work orders"
      columns={queueColumns}
      data={queueOrders.filter((order) => matchesFilters(order, value))}
      getRowId={(order) => order.id}
      toolbar={
        <Toolbar label="Filter work orders">
          <Filters
            label="Work order filters"
            fields={queueFields}
            value={value}
            onChange={setValue}
          />
        </Toolbar>
      }
      sorting={sorting}
      onSortingChange={setSorting}
      emptyState={
        <EmptyState
          icon={SearchX}
          title="No work orders match"
          description="Change the filters."
          action={<Button onPress={() => setValue([])}>Clear filters</Button>}
        />
      }
    />
  );
}

export default defineSection({
  component: "Filters",
  specimens: [
    {
      title: "Search and filters in a toolbar",
      note: "Put the SearchField first and Filters after it in one Toolbar. Keep the filters in the URL with FilterParams. The catalog keeps them in local state.",
      wide: true,
      render: () => <SearchAndFilters initial={activeFilters.slice(0, 2)} />,
    },
    {
      title: "Each field kind",
      note: "A multiSelect chip names each value with its status dot. A long text value truncates in the chip.",
      wide: true,
      render: () => (
        <FilterBar label="Work order filters" fields={workOrderFields} initial={activeFilters} />
      ),
    },
    {
      title: "No filters",
      note: "Only the add button shows. Clear all shows only while a filter is active.",
      render: () => <FilterBar label="Work order filters" fields={workOrderFields} initial={[]} />,
    },
    {
      title: "Operators",
      note: "A field with more than one operator adds an operator step. Its chip changes the operator in place.",
      render: () => (
        <FilterBar label="Work order filters" fields={operatorFields} initial={operatorFilters} />
      ),
    },
    {
      title: "Long option list",
      note: "A value list with more than 8 options gets a search box.",
      render: () => <FilterBar label="Bike filters" fields={brandFields} initial={brandFilters} />,
    },
    {
      title: "Compact row with each field used",
      note: "A field with a filter leaves the add list. When each field has a filter, the add button goes away.",
      wide: true,
      render: () => (
        <Labeled label="Toolbar size sm">
          <SearchAndFilters size="sm" initial={allUsedFilters} />
        </Labeled>
      ),
    },
    {
      title: "Filters that leave no rows",
      note: "When the filters leave no rows, give the empty state a Clear filters action.",
      wide: true,
      render: () => <FiltersWithNoRows />,
    },
  ],
});

const styles = stylex.create({
  search: { flex: "1", minWidth: "12rem", maxWidth: "20rem" },
});
