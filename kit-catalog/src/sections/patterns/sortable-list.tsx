import * as stylex from "@stylexjs/stylex";
import { Banknote, Bike, PackageX, Wrench, X } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/feedback";
import { IconTile } from "@/components/primitives/icon-tile";
import { Item } from "@/components/primitives/item";
import { Card } from "@/components/primitives/layout";
import { Avatar } from "@/components/primitives/avatar";
import { SortableList } from "@/components/patterns/sortable-list";
import type { BadgeIntent } from "@/components/primitives/badge";
import { color, font, space } from "@/styles/tokens.stylex";
import { Column, defineSection } from "../../specimen";

type WorkOrder = {
  readonly id: string;
  readonly bike: string;
  readonly customer: string;
  readonly due: string;
  readonly status: string;
  readonly intent: BadgeIntent;
};

const workOrders: ReadonlyArray<WorkOrder> = [
  {
    id: "WO-2381",
    bike: "Trek Domane SL 6, full tune-up",
    customer: "Claire Moreau",
    due: "Due today 12:00",
    status: "Waiting for parts",
    intent: "warning",
  },
  {
    id: "WO-2379",
    bike: "Specialized Turbo Vado, e-bike diagnostic",
    customer: "Hugo Bernard",
    due: "Due today 15:00",
    status: "In repair",
    intent: "info",
  },
  {
    id: "WO-2384",
    bike: "Brompton C Line, rear wheel true",
    customer: "Amélie Petit",
    due: "Due today 17:30",
    status: "Bike received",
    intent: "neutral",
  },
  {
    id: "WO-2376",
    bike: "Cannondale Topstone 2, hydraulic brake bleed on both calipers and new pads front and rear",
    customer: "Julien Lefèvre, on behalf of Lefèvre Courier Services",
    due: "Due tomorrow 10:00",
    status: "In repair",
    intent: "info",
  },
];

type Mechanic = { readonly id: string; readonly name: string; readonly role: string };

const mechanics: ReadonlyArray<Mechanic> = [
  { id: "ines", name: "Inès Laurent", role: "Lead mechanic, e-bikes and suspension" },
  { id: "marc", name: "Marc Dubois", role: "Mechanic, brakes and wheels" },
  { id: "sofia", name: "Sofia Marin", role: "Mechanic, road and gravel builds" },
  { id: "theo", name: "Théo Garnier", role: "Apprentice, weekdays only" },
];

type Widget = {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly icon: LucideIcon;
  readonly tone: BadgeIntent;
};

const widgets: ReadonlyArray<Widget> = [
  { id: "open", title: "Open work orders", value: "18", icon: Wrench, tone: "info" },
  { id: "pickup", title: "Bikes ready for pickup", value: "6", icon: Bike, tone: "success" },
  { id: "stock", title: "Parts below reorder point", value: "4", icon: PackageX, tone: "warning" },
  { id: "revenue", title: "Invoiced this week", value: "€4,860", icon: Banknote, tone: "accent" },
];

type InvoiceColumn = { readonly id: string; readonly label: string; readonly hint: string };

const invoiceColumns: ReadonlyArray<InvoiceColumn> = [
  { id: "number", label: "Invoice number", hint: "INV-2041" },
  { id: "customer", label: "Customer", hint: "Name and phone" },
  { id: "work-order", label: "Work order", hint: "WO-2381" },
  { id: "total", label: "Total", hint: "Amount with VAT" },
  { id: "due", label: "Due date", hint: "Date in the app time zone" },
];

function WorkOrderPriority() {
  const [items, setItems] = useState(workOrders);
  return (
    <SortableList
      label="Repair priority for today"
      items={items}
      getItemId={(order) => order.id}
      getItemLabel={(order) => `${order.id}, ${order.bike}`}
      renderItem={(order) => (
        <Item
          title={order.bike}
          description={`${order.id}, ${order.customer}, ${order.due}`}
          meta={<Badge intent={order.intent}>{order.status}</Badge>}
        />
      )}
      onReorder={(next) => setItems(next)}
      showPosition
    />
  );
}

function EscalationChain() {
  const [items, setItems] = useState(mechanics);
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Column>
      <SortableList
        label="Escalation order for warranty claims"
        items={items}
        getItemId={(person) => person.id}
        getItemLabel={(person) => person.name}
        renderItem={(person) => (
          <Item
            media={<Avatar name={person.name} size="sm" />}
            title={person.name}
            description={person.role}
          />
        )}
        itemActions={(person) => (
          <Button
            intent="ghost"
            size="sm"
            iconOnly
            icon={X}
            aria-label={`Remove ${person.name} from the escalation order`}
            onPress={() => setItems((current) => current.filter((item) => item.id !== person.id))}
          />
        )}
        onItemAction={(person) => setOpened(person.name)}
        onReorder={(next) => setItems(next)}
        showPosition
        emptyState={
          <EmptyState
            title="No one in the escalation order"
            description="Add a mechanic to receive warranty claims."
            action={<Button onPress={() => setItems(mechanics)}>Restore the default order</Button>}
          />
        }
      />
      <p {...stylex.props(styles.status)}>
        {opened === null ? "Press a row to open the mechanic." : `Opened ${opened}.`}
      </p>
    </Column>
  );
}

function DashboardTiles() {
  const [items, setItems] = useState(widgets);
  return (
    <SortableList
      label="Dashboard widgets"
      layout="grid"
      items={items}
      getItemId={(widget) => widget.id}
      getItemLabel={(widget) => widget.title}
      renderItem={(widget) => (
        <div {...stylex.props(styles.tile)}>
          <IconTile icon={widget.icon} tone={widget.tone} size="sm" />
          <span {...stylex.props(styles.tileValue)}>{widget.value}</span>
          <span {...stylex.props(styles.tileTitle)}>{widget.title}</span>
        </div>
      )}
      onReorder={(next) => setItems(next)}
    />
  );
}

function InvoiceColumnsCard() {
  const [items, setItems] = useState(invoiceColumns);
  return (
    <Card
      title="Invoice table columns"
      description="Drag the columns into the order of the printed invoice list."
    >
      <SortableList
        label="Invoice table columns"
        items={items}
        framed={false}
        getItemId={(column) => column.id}
        getItemLabel={(column) => column.label}
        renderItem={(column) => <Item size="sm" title={column.label} description={column.hint} />}
        onReorder={(next) => setItems(next)}
      />
    </Card>
  );
}

export default defineSection({
  component: "SortableList",
  specimens: [
    {
      title: "Priority order with positions",
      note: "Drag a row by its grip, or focus the grip, press Enter, move with the arrow keys, and press Enter to drop. The last row has long text that wraps.",
      render: () => <WorkOrderPriority />,
    },
    {
      title: "Row actions and empty state",
      note: "A click on a row opens it. Remove every row to see the empty state and the focus move to the list.",
      render: () => <EscalationChain />,
    },
    {
      title: "Grid of tiles",
      note: "A grid has no frame, so framed has no effect.",
      wide: true,
      render: () => <DashboardTiles />,
    },
    {
      title: "Unframed in a Card",
      note: "Set framed to false so that the list sits directly in the Card.",
      render: () => <InvoiceColumnsCard />,
    },
    {
      title: "Empty list",
      render: () => (
        <SortableList
          label="Parts reorder priority"
          items={[]}
          getItemId={(part: InvoiceColumn) => part.id}
          getItemLabel={(part) => part.label}
          renderItem={(part) => <Item title={part.label} />}
          onReorder={() => undefined}
          emptyState={
            <EmptyState
              title="No parts to reorder"
              description="Parts show here when their stock falls below the reorder point."
            />
          }
        />
      ),
    },
  ],
});

const styles = stylex.create({
  status: { margin: 0, fontSize: font.sm, color: color.textFaint },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.sm,
    minWidth: "10rem",
  },
  tileValue: {
    fontSize: font.xxl,
    fontWeight: font.semibold,
    fontVariantNumeric: "tabular-nums",
    color: color.text,
  },
  tileTitle: { fontSize: font.sm, color: color.textMuted },
});
