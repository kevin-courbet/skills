import * as stylex from "@stylexjs/stylex";
import type { SortingState } from "@tanstack/react-table";
import { Ellipsis, PackageSearch, SearchX, UserPlus, Wrench } from "lucide-react";
import { useState } from "react";
import { field } from "@/components/helpers/field";
import {
  DataTable,
  type DataTableColumn,
  MeterCell,
  TwoLineCell,
} from "@/components/patterns/data-table";
import { type BadgeIntent, StatusDot } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { EmptyState } from "@/components/primitives/feedback";
import { MetaLine, Toolbar } from "@/components/primitives/layout";
import { Menu, MenuItem, MenuTrigger } from "@/components/primitives/menu";
import { SearchField } from "@/components/primitives/search-field";
import { formatCurrency, formatDateTime, formatInteger } from "@/lib/locale";
import { color, font, space } from "@/styles/tokens.stylex";
import { defineSection } from "../../specimen";

type OrderStatus = "received" | "inProgress" | "waitingForPart" | "ready" | "invoiced";

interface WorkOrder {
  readonly id: string;
  readonly bike: string;
  readonly service: string;
  readonly customer: string;
  readonly mechanic: string | null;
  readonly status: OrderStatus;
  readonly receivedAt: string;
  readonly estimate: number;
}

const statusDisplay: Record<OrderStatus, { readonly label: string; readonly intent: BadgeIntent }> =
  {
    received: { label: "Received", intent: "info" },
    inProgress: { label: "In progress", intent: "accent" },
    waitingForPart: { label: "Waiting for a part", intent: "warning" },
    ready: { label: "Ready for pickup", intent: "success" },
    invoiced: { label: "Invoiced", intent: "neutral" },
  };

const workOrders: ReadonlyArray<WorkOrder> = [
  {
    id: "WO-1042",
    bike: "Trek Domane AL 2",
    service: "Full service",
    customer: "Amara Diallo",
    mechanic: "Lena Fischer",
    status: "inProgress",
    receivedAt: "2026-11-12T08:40:00Z",
    estimate: 129,
  },
  {
    id: "WO-1043",
    bike: "Brompton C Line",
    service: "Rear hub overhaul",
    customer: "Jonas Weber",
    mechanic: "Marco Rossi",
    status: "waitingForPart",
    receivedAt: "2026-11-12T10:15:00Z",
    estimate: 184.5,
  },
  {
    id: "WO-1044",
    bike: "Specialized Rockhopper",
    service: "Brake bleed, front and rear",
    customer: "Priya Nair",
    mechanic: "Lena Fischer",
    status: "ready",
    receivedAt: "2026-11-12T14:05:00Z",
    estimate: 79,
  },
  {
    id: "WO-1045",
    bike: "Gazelle Ultimate C380",
    service: "Puncture repair",
    customer: "Tomás Rivera",
    mechanic: null,
    status: "received",
    receivedAt: "2026-11-13T09:30:00Z",
    estimate: 22,
  },
  {
    id: "WO-1046",
    bike: "Cannondale Topstone 3",
    service: "Replace chain and cassette",
    customer: "Noor Haddad",
    mechanic: "Sam Okafor",
    status: "inProgress",
    receivedAt: "2026-11-13T11:50:00Z",
    estimate: 146.9,
  },
  {
    id: "WO-1047",
    bike: "Riese & Müller Load 75",
    service: "Motor diagnostics after an error code on the display",
    customer: "Ines Costa",
    mechanic: "Marco Rossi",
    status: "waitingForPart",
    receivedAt: "2026-11-13T16:20:00Z",
    estimate: 310,
  },
  {
    id: "WO-1048",
    bike: "Giant Escape 3",
    service: "Gear tune-up",
    customer: "Kenji Mori",
    mechanic: "Sam Okafor",
    status: "invoiced",
    receivedAt: "2026-11-14T08:10:00Z",
    estimate: 45,
  },
  {
    id: "WO-1049",
    bike: "Canyon Grail CF SL",
    service: "Tubeless setup",
    customer: "Elif Yilmaz",
    mechanic: null,
    status: "received",
    receivedAt: "2026-11-14T13:45:00Z",
    estimate: 60,
  },
  {
    id: "WO-1050",
    bike: "Cube Kathmandu Hybrid",
    service: "Full service",
    customer: "Oskar Lind",
    mechanic: "Lena Fischer",
    status: "ready",
    receivedAt: "2026-11-15T09:00:00Z",
    estimate: 129,
  },
  {
    id: "WO-1051",
    bike: "Bianchi Via Nirone 7",
    service: "Wheel truing",
    customer: "Chiara Bruno",
    mechanic: "Sam Okafor",
    status: "invoiced",
    receivedAt: "2026-11-15T10:35:00Z",
    estimate: 35,
  },
  {
    id: "WO-1052",
    bike: "Raleigh Pioneer",
    service: "Replace brake pads",
    customer: "Hannah Becker",
    mechanic: "Marco Rossi",
    status: "inProgress",
    receivedAt: "2026-11-16T08:25:00Z",
    estimate: 38,
  },
  {
    id: "WO-1053",
    bike: "Tern GSD S10",
    service: "Annual check of the electric drive",
    customer: "Lucas Martin",
    mechanic: null,
    status: "received",
    receivedAt: "2026-11-16T09:55:00Z",
    estimate: 95,
  },
];

type OrderSortField = "order" | "customer" | "mechanic" | "status" | "receivedAt" | "estimate";

const orderSortValue: Record<OrderSortField, (order: WorkOrder) => string | number> = {
  order: (order) => order.id,
  customer: (order) => order.customer,
  mechanic: (order) => order.mechanic ?? "",
  status: (order) => statusDisplay[order.status].label,
  receivedAt: (order) => order.receivedAt,
  estimate: (order) => order.estimate,
};

function isOrderSortField(id: string): id is OrderSortField {
  return id in orderSortValue;
}

/** Sorts in the browser, in place of the server that sorts the rows of a real list page. */
function sortOrders(
  orders: ReadonlyArray<WorkOrder>,
  sorting: SortingState,
): ReadonlyArray<WorkOrder> {
  const first = sorting[0];
  if (first === undefined || !isOrderSortField(first.id)) return orders;
  const value = orderSortValue[first.id];
  const sign = first.desc ? -1 : 1;
  return orders.toSorted((left, right) => {
    const a = value(left);
    const b = value(right);
    if (typeof a === "number" && typeof b === "number") return sign * (a - b);
    return sign * String(a).localeCompare(String(b));
  });
}

const orderColumns: ReadonlyArray<DataTableColumn<WorkOrder>> = [
  {
    id: "order",
    accessorKey: "id",
    header: "Work order",
    cell: (info) => (
      <TwoLineCell
        primary={info.row.original.bike}
        secondary={<MetaLine items={[info.row.original.id, info.row.original.service]} />}
      />
    ),
  },
  { id: "customer", accessorKey: "customer", header: "Customer" },
  {
    id: "mechanic",
    accessorKey: "mechanic",
    header: "Mechanic",
    cell: (info) => {
      const mechanic = info.getValue<string | null>();
      return mechanic === null ? (
        <span {...stylex.props(styles.muted)}>Not assigned</span>
      ) : (
        mechanic
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const status = statusDisplay[info.getValue<OrderStatus>()];
      return (
        <StatusDot intent={status.intent} isActive={info.getValue<OrderStatus>() === "inProgress"}>
          {status.label}
        </StatusDot>
      );
    },
  },
  {
    id: "receivedAt",
    accessorKey: "receivedAt",
    header: "Received",
    cell: (info) => (
      <span {...stylex.props(styles.muted)}>{formatDateTime(info.getValue<string>())}</span>
    ),
  },
  {
    id: "estimate",
    accessorKey: "estimate",
    header: "Estimate",
    cell: (info) => formatCurrency(info.getValue<number>()),
  },
];

function WorkOrdersTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "receivedAt", desc: true }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const matches = sortOrders(
    workOrders.filter((order) =>
      `${order.id} ${order.bike} ${order.customer}`.toLowerCase().includes(query.toLowerCase()),
    ),
    sorting,
  );
  return (
    <DataTable
      caption="Work orders"
      columns={orderColumns}
      data={matches.slice((page - 1) * pageSize, page * pageSize)}
      getRowId={(order) => order.id}
      numericColumns={["estimate"]}
      pinnedColumns={{ start: ["order"] }}
      responsiveColumns={{
        customer: { hideBelow: "md", stack: true },
        mechanic: { hideBelow: "lg" },
        receivedAt: { hideBelow: "sm" },
      }}
      rowAction={{ link: () => ({ to: "/" }) }}
      toolbar={
        <Toolbar label="Search work orders">
          <SearchField
            label="Search"
            hideLabel
            placeholder="Search by order, bike, or customer"
            value={query}
            onChange={(next) => {
              setQuery(next);
              setPage(1);
            }}
            style={styles.search}
          />
        </Toolbar>
      }
      sorting={sorting}
      onSortingChange={(next) => {
        setSorting(next);
        setPage(1);
      }}
      pagination={{
        page,
        pageSize,
        total: matches.length,
        onPageChange: setPage,
        onPageSizeChange: (next) => {
          setPageSize(next);
          setPage(1);
        },
        pageSizeOptions: [5, 10, 25],
      }}
      emptyState={
        <EmptyState
          icon={SearchX}
          title="No work orders match"
          description="Change the search."
          action={<Button onPress={() => setQuery("")}>Clear search</Button>}
        />
      }
    />
  );
}

const rowMenuColumn: DataTableColumn<WorkOrder> = {
  id: "actions",
  enableSorting: false,
  enableHiding: false,
  header: () => <span {...stylex.props(field.hiddenLabel)}>Actions</span>,
  cell: (info) => (
    <MenuTrigger>
      <Button
        intent="ghost"
        size="sm"
        iconOnly
        icon={Ellipsis}
        aria-label={`Actions for ${info.row.original.id}`}
      />
      <Menu>
        <MenuItem id="assign">Assign a mechanic</MenuItem>
        <MenuItem id="print">Print the repair tag</MenuItem>
        <MenuItem id="invoice">Create the invoice</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

function SelectableWorkOrdersTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "order", desc: false }]);
  const [selectedIds, setSelectedIds] = useState<ReadonlyArray<string>>(["WO-1045", "WO-1049"]);
  const [hidden, setHidden] = useState<ReadonlyArray<string>>(["receivedAt"]);
  const [deleteIds, setDeleteIds] = useState<ReadonlyArray<string> | null>(null);
  const [orders, setOrders] = useState(workOrders.slice(0, 8));
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const count = (ids: ReadonlyArray<string>) =>
    `${formatInteger(ids.length)} work ${ids.length === 1 ? "order" : "orders"}`;
  return (
    <>
      <DataTable
        caption="Work orders to assign"
        columns={[...orderColumns, rowMenuColumn]}
        data={sortOrders(orders, sorting).slice((page - 1) * pageSize, page * pageSize)}
        getRowId={(order) => order.id}
        numericColumns={["estimate"]}
        pinnedColumns={{ start: ["order"], end: ["actions"] }}
        rowAction={{ link: () => ({ to: "/" }) }}
        selection={{
          selectedIds,
          onChange: setSelectedIds,
          rowLabel: (order) => `${order.id}, ${order.bike}`,
          canSelect: (order) => order.status !== "invoiced",
          actions: (ids) => (
            <>
              <Button icon={UserPlus}>Assign {count(ids)}</Button>
              <Button onPress={() => setDeleteIds(ids)}>Delete {count(ids)}</Button>
            </>
          ),
        }}
        columnVisibility={{ hidden, onChange: setHidden }}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        pagination={{ page, pageSize, total: orders.length, onPageChange: setPage }}
        emptyState={<EmptyState icon={Wrench} title="No work orders yet" />}
      />
      <ConfirmDialog
        isOpen={deleteIds !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteIds(null);
        }}
        title={`Delete ${count(deleteIds ?? [])}?`}
        description="This deletes the work orders and their repair notes. The customers keep their history. You cannot undo this."
        confirmLabel={`Delete ${count(deleteIds ?? [])}`}
        onConfirm={async () => {
          const ids = deleteIds ?? [];
          setOrders((current) => current.filter((order) => !ids.includes(order.id)));
          setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
          setPage(1);
        }}
      />
    </>
  );
}

interface InvoiceLine {
  readonly label: string;
  readonly amount: number;
}

interface Invoice {
  readonly id: string;
  readonly customer: string;
  readonly order: string;
  readonly paid: boolean;
  readonly lines: ReadonlyArray<InvoiceLine>;
}

const invoices: ReadonlyArray<Invoice> = [
  {
    id: "INV-2207",
    customer: "Kenji Mori",
    order: "WO-1048",
    paid: true,
    lines: [
      { label: "Gear tune-up", amount: 45 },
      { label: "Shimano gear cable", amount: 8.5 },
    ],
  },
  {
    id: "INV-2208",
    customer: "Chiara Bruno",
    order: "WO-1051",
    paid: false,
    lines: [{ label: "Wheel truing", amount: 35 }],
  },
  {
    id: "INV-2209",
    customer: "Priya Nair",
    order: "WO-1044",
    paid: false,
    lines: [
      { label: "Brake bleed, front and rear", amount: 79 },
      { label: "Shimano mineral oil, 100 ml", amount: 12.9 },
      { label: "Resin brake pads, two pairs", amount: 31.8 },
    ],
  },
  {
    id: "INV-2210",
    customer: "Oskar Lind",
    order: "WO-1050",
    paid: false,
    lines: [{ label: "Full service", amount: 129 }],
  },
];

const invoiceTotal = (invoice: Invoice) =>
  invoice.lines.reduce((sum, line) => sum + line.amount, 0);

const invoiceSortValue: Record<string, (invoice: Invoice) => string | number> = {
  id: (invoice) => invoice.id,
  customer: (invoice) => invoice.customer,
  order: (invoice) => invoice.order,
  paid: (invoice) => (invoice.paid ? 1 : 0),
};

function sortInvoices(sorting: SortingState): ReadonlyArray<Invoice> {
  const first = sorting[0];
  const value = first === undefined ? undefined : invoiceSortValue[first.id];
  if (first === undefined || value === undefined) return invoices;
  const sign = first.desc ? -1 : 1;
  return invoices.toSorted((left, right) => {
    const a = value(left);
    const b = value(right);
    if (typeof a === "number" && typeof b === "number") return sign * (a - b);
    return sign * String(a).localeCompare(String(b));
  });
}

const invoiceColumns: ReadonlyArray<DataTableColumn<Invoice>> = [
  { id: "id", accessorKey: "id", header: "Invoice", footer: () => "Total of this page" },
  { id: "customer", accessorKey: "customer", header: "Customer" },
  { id: "order", accessorKey: "order", header: "Work order" },
  {
    id: "paid",
    accessorKey: "paid",
    header: "Payment",
    cell: (info) =>
      info.getValue<boolean>() ? (
        <StatusDot intent="success">Paid</StatusDot>
      ) : (
        <StatusDot intent="warning">Not paid</StatusDot>
      ),
  },
  {
    id: "total",
    header: "Total",
    cell: (info) => formatCurrency(invoiceTotal(info.row.original)),
    footer: () => formatCurrency(invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)),
  },
];

function InvoicesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedIds, setExpandedIds] = useState<ReadonlyArray<string>>(["INV-2209"]);
  const [activeId, setActiveId] = useState<string | undefined>("INV-2208");
  return (
    <DataTable
      caption="Invoices"
      columns={invoiceColumns}
      data={sortInvoices(sorting)}
      getRowId={(invoice) => invoice.id}
      numericColumns={["total"]}
      rowAction={{ onAction: (invoice) => setActiveId(invoice.id) }}
      activeRowId={activeId}
      expansion={{
        expandedIds,
        onChange: setExpandedIds,
        rowLabel: (invoice) => invoice.id,
        canExpand: (invoice) => invoice.lines.length > 1,
        render: (invoice) => (
          <ul {...stylex.props(styles.lines)}>
            {invoice.lines.map((line) => (
              <li key={line.label} {...stylex.props(styles.line)}>
                <span>{line.label}</span>
                <span {...stylex.props(styles.amount)}>{formatCurrency(line.amount)}</span>
              </li>
            ))}
          </ul>
        ),
      }}
      sorting={sorting}
      onSortingChange={setSorting}
      emptyState={<EmptyState title="No invoices yet" />}
    />
  );
}

interface Part {
  readonly sku: string;
  readonly name: string;
  readonly supplier: string;
  readonly inStock: number;
  readonly unitPrice: number;
}

const partNames = [
  "Shimano 105 chain, 11-speed",
  "Continental Grand Prix 5000 tyre, 700x28",
  "Schwalbe Marathon Plus tyre, 700x38",
  "SRAM PG-1130 cassette, 11-36",
  "Resin disc brake pads, B01S",
  "Inner tube, 700x25-32, Presta",
  "Shimano gear cable, 2100 mm",
  "Brake cable housing, 5 mm, per metre",
  "Bottom bracket, BSA 68 mm",
  "Tubeless sealant, 500 ml",
];
const suppliers = ["Velo Supply", "Cycle Parts Direct", "Rhein Bike Trade"];

function cycle<T>(values: ReadonlyArray<T>, index: number): T {
  const value = values[index % values.length];
  if (value === undefined) throw new Error("A seed list of the DataTable specimens is empty.");
  return value;
}

/** A full stock list that the browser already holds, long enough to scroll inside the frame. */
const parts: ReadonlyArray<Part> = Array.from({ length: 60 }, (_, index) => ({
  sku: `PRT-${String(3100 + index)}`,
  name: cycle(partNames, index),
  supplier: cycle(suppliers, index),
  inStock: (index * 7) % 23,
  unitPrice: 4.5 + ((index * 13) % 60),
}));

const maxStock = Math.max(...parts.map((part) => part.inStock));

const partColumns: ReadonlyArray<DataTableColumn<Part>> = [
  { id: "sku", accessorKey: "sku", header: "SKU", size: 112 },
  { id: "name", accessorKey: "name", header: "Part", size: 320 },
  { id: "supplier", accessorKey: "supplier", header: "Supplier", size: 176 },
  {
    id: "inStock",
    accessorKey: "inStock",
    header: "In stock",
    size: 160,
    cell: (info) => (
      <MeterCell
        label={formatInteger(info.getValue<number>())}
        value={info.getValue<number>()}
        max={maxStock}
      />
    ),
  },
  {
    id: "unitPrice",
    accessorKey: "unitPrice",
    header: "Unit price",
    size: 128,
    cell: (info) => formatCurrency(info.getValue<number>()),
  },
];

function PartsTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "sku", desc: false }]);
  const first = sorting[0];
  const sorted =
    first === undefined
      ? parts
      : parts.toSorted((left, right) => {
          const sign = first.desc ? -1 : 1;
          if (first.id === "inStock") return sign * (left.inStock - right.inStock);
          if (first.id === "unitPrice") return sign * (left.unitPrice - right.unitPrice);
          if (first.id === "name") return sign * left.name.localeCompare(right.name);
          if (first.id === "supplier") return sign * left.supplier.localeCompare(right.supplier);
          return sign * left.sku.localeCompare(right.sku);
        });
  return (
    <DataTable
      caption="Parts in stock"
      columns={partColumns}
      data={sorted}
      getRowId={(part) => part.sku}
      rowHeader="name"
      numericColumns={["inStock", "unitPrice"]}
      density="compact"
      resizableColumns
      virtualize={{ visibleRows: 8 }}
      sorting={sorting}
      onSortingChange={setSorting}
      emptyState={<EmptyState icon={PackageSearch} title="No parts in stock" />}
    />
  );
}

function LoadingAndEmptyTables() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState("brake lever");
  return (
    <div {...stylex.props(styles.stack)}>
      <DataTable
        caption="Work orders, loading"
        columns={orderColumns}
        data={[]}
        getRowId={(order) => order.id}
        numericColumns={["estimate"]}
        isLoading
        loadingRows={3}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={<EmptyState icon={Wrench} title="No work orders yet" />}
      />
      <DataTable
        caption="Work orders, no match"
        columns={orderColumns}
        data={workOrders.filter((order) => order.bike.toLowerCase().includes(query.toLowerCase()))}
        getRowId={(order) => order.id}
        numericColumns={["estimate"]}
        toolbar={
          <Toolbar label="Search work orders">
            <SearchField
              label="Search"
              hideLabel
              placeholder="Search by bike"
              value={query}
              onChange={setQuery}
              style={styles.search}
            />
          </Toolbar>
        }
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={
          <EmptyState
            icon={SearchX}
            title="No work orders match"
            description="Change the search."
            action={<Button onPress={() => setQuery("")}>Clear search</Button>}
          />
        }
      />
    </div>
  );
}

export default defineSection({
  component: "DataTable",
  specimens: [
    {
      title: "Sort, row links, and pages",
      note: "A click on a row opens the work order. A real list page keeps the sort, the page, and the search in the URL.",
      wide: true,
      render: () => <WorkOrdersTable />,
    },
    {
      title: "Narrow frame",
      note: "In a 375px frame, the customer moves under the row header. The mechanic and the date leave the table, and the status stays.",
      render: () => (
        <div {...stylex.props(styles.phone)}>
          <WorkOrdersTable />
        </div>
      ),
    },
    {
      title: "Selection, bulk actions, and column menu",
      note: "You cannot select an invoiced order. WO-1049 on page 2 stays selected, and the bulk buttons count it. Delete opens a ConfirmDialog. The frame is narrower than the columns, so the table scrolls sideways, and the pinned work order and row menu stay in view.",
      wide: true,
      render: () => (
        <div {...stylex.props(styles.scrollFrame)}>
          <SelectableWorkOrdersTable />
        </div>
      ),
    },
    {
      title: "Expandable rows, active row, and summary row",
      note: "A row press marks the row as active, as a peek sheet does. An invoice with one line has no toggle.",
      wide: true,
      render: () => <InvoicesTable />,
    },
    {
      title: "Compact, resizable, and virtualized",
      note: "Use virtualize only for a long list that the browser already holds. The MeterCell text carries the value.",
      wide: true,
      render: () => <PartsTable />,
    },
    {
      title: "Loading and empty",
      note: "Skeleton rows show during a load that the browser starts. The toolbar stays visible above the empty state.",
      wide: true,
      render: () => <LoadingAndEmptyTables />,
    },
  ],
});

const styles = stylex.create({
  muted: { color: color.textMuted, fontSize: font.sm },
  search: { flex: "1", minWidth: "12rem", maxWidth: "20rem" },
  phone: { width: "100%", maxWidth: "375px" },
  // Wider than the sm breakpoint, so the cells keep one line, and narrower than the columns.
  scrollFrame: { width: "100%", maxWidth: "42rem" },
  stack: { display: "flex", flexDirection: "column", gap: space.xl, minWidth: 0 },
  lines: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    margin: 0,
    padding: 0,
    listStyleType: "none",
    maxWidth: "28rem",
  },
  line: { display: "flex", justifyContent: "space-between", gap: space.lg, fontSize: font.sm },
  amount: { fontVariantNumeric: "tabular-nums" },
});
