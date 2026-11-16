import { Package } from "lucide-react";
import { Badge } from "@/components/primitives/badge";
import { EmptyState } from "@/components/primitives/feedback";
import { Card, CardSection, DescriptionList } from "@/components/primitives/layout";
import { Table, type TableColumn } from "@/components/primitives/table";
import { TextLink } from "@/components/primitives/text-link";
import { formatCurrency, formatInteger } from "@/lib/locale";
import { Column, defineSection } from "../../specimen";

type EstimateLine = {
  readonly id: string;
  readonly item: string;
  readonly quantity: number;
  readonly unitPrice: number;
};

const estimateLines: ReadonlyArray<EstimateLine> = [
  { id: "pads", item: "Shimano B05S resin brake pads", quantity: 2, unitPrice: 14.95 },
  { id: "oil", item: "Shimano mineral oil, 100 ml", quantity: 1, unitPrice: 12.5 },
  { id: "rotor", item: "Shimano RT-MT800 rotor, 160 mm", quantity: 1, unitPrice: 54 },
  { id: "bleed", item: "Labor: hydraulic brake bleed", quantity: 2, unitPrice: 30 },
];

const lineTotal = (line: EstimateLine) => line.quantity * line.unitPrice;
const estimateTotal = estimateLines.reduce((sum, line) => sum + lineTotal(line), 0);

function estimateColumns(
  lines: ReadonlyArray<EstimateLine>,
): ReadonlyArray<TableColumn<EstimateLine>> {
  const total = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  return [
    { id: "item", header: "Item", cell: (line) => line.item, footer: "Estimate total" },
    { id: "quantity", header: "Qty", numeric: true, cell: (line) => formatInteger(line.quantity) },
    {
      id: "unitPrice",
      header: "Unit price",
      numeric: true,
      cell: (line) => formatCurrency(line.unitPrice),
    },
    {
      id: "total",
      header: "Total",
      numeric: true,
      cell: (line) => formatCurrency(lineTotal(line)),
      footer: formatCurrency(total),
    },
  ];
}

type Invoice = {
  readonly id: string;
  readonly customer: string;
  readonly workOrder: string;
  readonly status: "paid" | "due" | "overdue";
  readonly amount: number;
};

const invoices: ReadonlyArray<Invoice> = [
  {
    id: "INV-2041",
    customer: "Amélie Durand",
    workOrder: "WO-1042",
    status: "paid",
    amount: 156.4,
  },
  { id: "INV-2040", customer: "Lucas Moreau", workOrder: "WO-1039", status: "due", amount: 62 },
  {
    id: "INV-2039",
    customer: "Chloé Bernard",
    workOrder: "WO-1037",
    status: "overdue",
    amount: 312.9,
  },
];

const invoiceStatus = {
  paid: { intent: "success", label: "Paid" },
  due: { intent: "warning", label: "Due" },
  overdue: { intent: "danger", label: "Overdue" },
} as const;

type Stock = {
  readonly sku: string;
  readonly part: string;
  readonly supplier: string;
  readonly location: string;
  readonly onHand: number;
  readonly reorderLevel: number;
  readonly unitCost: number;
};

const stock: ReadonlyArray<Stock> = [
  {
    sku: "SH-B05S",
    part: "Shimano B05S resin brake pads",
    supplier: "Cycles Europe",
    location: "Shelf A3",
    onHand: 3,
    reorderLevel: 10,
    unitCost: 8.4,
  },
  {
    sku: "CO-GP5000-28",
    part: "Continental Grand Prix 5000 tire, 700 x 28 mm",
    supplier: "Velo Distribution",
    location: "Rack T1",
    onHand: 12,
    reorderLevel: 6,
    unitCost: 38.9,
  },
];

export default defineSection({
  component: "Table",
  specimens: [
    {
      title: "Estimate with a total row",
      note: "A numeric column aligns right with tabular figures. A column footer adds the total row.",
      wide: true,
      render: () => (
        <Table
          label="Estimate for WO-1042"
          rows={estimateLines}
          getRowId={(line) => line.id}
          rowHeader="item"
          emptyState={<EmptyState icon={Package} title="No parts on this estimate" size="sm" />}
          columns={estimateColumns(estimateLines)}
        />
      ),
    },
    {
      title: "Links and badges in cells",
      note: "The table has no row actions. Link a record from a cell with TextLink variant quiet.",
      wide: true,
      render: () => (
        <Table
          label="Invoices"
          rows={invoices}
          getRowId={(invoice) => invoice.id}
          emptyState={<EmptyState title="No invoices" size="sm" />}
          columns={[
            {
              id: "id",
              header: "Invoice",
              cell: (invoice) => (
                <TextLink to="/" variant="quiet">
                  {invoice.id}
                </TextLink>
              ),
            },
            {
              id: "customer",
              header: "Customer",
              cell: (invoice) => (
                <TextLink to="/" variant="quiet">
                  {invoice.customer}
                </TextLink>
              ),
            },
            { id: "workOrder", header: "Work order", cell: (invoice) => invoice.workOrder },
            {
              id: "status",
              header: "Status",
              cell: (invoice) => (
                <Badge intent={invoiceStatus[invoice.status].intent}>
                  {invoiceStatus[invoice.status].label}
                </Badge>
              ),
            },
            {
              id: "amount",
              header: "Amount",
              numeric: true,
              cell: (invoice) => formatCurrency(invoice.amount),
            },
          ]}
        />
      ),
    },
    {
      title: "Empty",
      note: "emptyState shows under the header. The footer row shows only when there are rows.",
      wide: true,
      render: () => (
        <Table
          label="Estimate for WO-1045"
          rows={[]}
          getRowId={(line: EstimateLine) => line.id}
          emptyState={
            <EmptyState
              icon={Package}
              title="No parts on this estimate"
              description="Add the parts and the labor that the repair needs."
              size="sm"
            />
          }
          columns={estimateColumns([])}
        />
      ),
    },
    {
      title: "Inside a Card",
      note: "Put the table in a CardSection with padding flush, and set framed={false}.",
      wide: true,
      render: () => (
        <Card
          title="Estimate"
          description="WO-1042, Trek Domane SL 5"
          layout="sections"
          actions={formatCurrency(estimateTotal)}
        >
          <CardSection>
            <DescriptionList
              items={[
                { term: "Customer", detail: "Amélie Durand" },
                { term: "Approved", detail: "16 Nov 2026" },
              ]}
            />
          </CardSection>
          <CardSection padding="flush">
            <Table
              label="Estimate lines"
              rows={estimateLines}
              getRowId={(line) => line.id}
              emptyState={<EmptyState title="No parts on this estimate" size="sm" />}
              framed={false}
              columns={estimateColumns(estimateLines)}
            />
          </CardSection>
        </Card>
      ),
    },
    {
      title: "Wider than its frame",
      note: "The table scrolls sideways, the edges fade, and the scroll area takes focus for the keyboard.",
      render: () => (
        <Column width="24rem">
          <Table
            label="Parts in stock"
            rows={stock}
            getRowId={(row) => row.sku}
            rowHeader="part"
            emptyState={<EmptyState title="No parts in stock" size="sm" />}
            columns={[
              { id: "sku", header: "SKU", cell: (row) => row.sku },
              { id: "part", header: "Part", cell: (row) => row.part },
              { id: "supplier", header: "Supplier", cell: (row) => row.supplier },
              { id: "location", header: "Location", cell: (row) => row.location },
              {
                id: "onHand",
                header: "On hand",
                numeric: true,
                cell: (row) => formatInteger(row.onHand),
              },
              {
                id: "reorderLevel",
                header: "Reorder level",
                numeric: true,
                cell: (row) => formatInteger(row.reorderLevel),
              },
              {
                id: "unitCost",
                header: "Unit cost",
                numeric: true,
                cell: (row) => formatCurrency(row.unitCost),
              },
            ]}
          />
        </Column>
      ),
    },
  ],
});
