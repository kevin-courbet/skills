import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Card, CardSection, DescriptionList, MetaLine } from "@/components/primitives/layout";
import { ResizablePanels } from "@/components/primitives/resizable-panels";
import { formatCurrency } from "@/lib/locale";
import { color, font, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Row } from "../../specimen";

const workOrders: ReadonlyArray<{
  readonly id: string;
  readonly bike: string;
  readonly customer: string;
  readonly status: string;
}> = [
  { id: "WO-2041", bike: "Trek Domane AL 2", customer: "Jonas Weber", status: "In repair" },
  { id: "WO-2042", bike: "Brompton C Line", customer: "Aiko Tanaka", status: "Waiting for parts" },
  { id: "WO-2043", bike: "Specialized Rockhopper", customer: "Sofia Rossi", status: "Checked in" },
  { id: "WO-2044", bike: "Riese & Müller Load 75", customer: "Tom Becker", status: "Ready" },
  { id: "WO-2045", bike: "Cannondale Topstone 2", customer: "Nadia Haddad", status: "In repair" },
];

const customers = ["Jonas Weber", "Aiko Tanaka", "Sofia Rossi", "Tom Becker", "Nadia Haddad"];

function WorkOrderList() {
  return (
    <ul {...stylex.props(styles.list)}>
      {workOrders.map((order) => (
        <li key={order.id} {...stylex.props(styles.listRow)}>
          <span {...stylex.props(styles.strong)}>{order.id}</span>
          <span {...stylex.props(styles.muted)}>
            <MetaLine items={[order.bike, order.status]} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function WorkOrderDetail() {
  return (
    <div {...stylex.props(styles.pane)}>
      <div {...stylex.props(styles.paneHeader)}>
        <h3 {...stylex.props(styles.title)}>WO-2041, Trek Domane AL 2</h3>
        <Badge intent="info">In repair</Badge>
      </div>
      <DescriptionList
        items={[
          { term: "Customer", detail: "Jonas Weber" },
          { term: "Mechanic", detail: "Marco Ruiz" },
          { term: "Promised", detail: "18 Nov 2026, 17:00" },
          { term: "Estimate", detail: formatCurrency(184.5) },
        ]}
      />
    </div>
  );
}

function Notes() {
  return (
    <div {...stylex.props(styles.pane)}>
      <h3 {...stylex.props(styles.title)}>Diagnosis notes</h3>
      <p {...stylex.props(styles.text)}>
        Chain stretch at 0.75%. The cassette is worn on the three smallest cogs. The rear derailleur
        hanger is bent about 4 mm.
      </p>
    </div>
  );
}

function PartsUsed() {
  return (
    <div {...stylex.props(styles.pane)}>
      <h3 {...stylex.props(styles.title)}>Parts used</h3>
      <DescriptionList
        items={[
          { term: "Shimano HG601 chain", detail: formatCurrency(32) },
          { term: "Shimano 105 cassette 11-34", detail: formatCurrency(64.9) },
          { term: "Derailleur hanger", detail: formatCurrency(24.6) },
        ]}
      />
    </div>
  );
}

function CustomerList() {
  return (
    <ul {...stylex.props(styles.list)}>
      {customers.map((name) => (
        <li key={name} {...stylex.props(styles.listRow)}>
          <span {...stylex.props(styles.strong)}>{name}</span>
        </li>
      ))}
    </ul>
  );
}

function InvoicePane() {
  return (
    <div {...stylex.props(styles.pane)}>
      <h3 {...stylex.props(styles.title)}>Invoice INV-2041</h3>
      <DescriptionList
        items={[
          { term: "Parts", detail: formatCurrency(121.5) },
          { term: "Labor", detail: formatCurrency(63) },
          { term: "Total", detail: formatCurrency(184.5) },
        ]}
      />
    </div>
  );
}

const defaultSizes: ReadonlyArray<number> = [35, 65];

function ControlledSpecimen() {
  const [sizes, setSizes] = useState<ReadonlyArray<number>>(defaultSizes);
  return (
    <Column>
      <Card layout="sections">
        <CardSection padding="flush">
          <ResizablePanels
            sizes={sizes}
            onSizesChange={setSizes}
            style={styles.height}
            panels={[
              {
                id: "orders",
                label: "Work order list",
                defaultSize: 35,
                minSize: 25,
                content: <WorkOrderList />,
              },
              {
                id: "detail",
                label: "Work order detail",
                defaultSize: 65,
                content: <WorkOrderDetail />,
              },
            ]}
          />
        </CardSection>
      </Card>
      <Row>
        <span {...stylex.props(styles.muted)}>
          Sizes: {sizes.map((size) => `${Math.round(size)}%`).join(" and ")}
        </span>
        <Button
          size="sm"
          isDisabled={sizes === defaultSizes}
          onPress={() => setSizes(defaultSizes)}
        >
          Reset layout
        </Button>
      </Row>
    </Column>
  );
}

export default defineSection({
  component: "ResizablePanels",
  specimens: [
    {
      title: "List and detail",
      note: "The group has no frame. In a Card, put it in a CardSection with flush padding.",
      wide: true,
      render: () => (
        <Card layout="sections">
          <CardSection padding="flush">
            <ResizablePanels
              style={styles.height}
              panels={[
                {
                  id: "orders",
                  label: "Work order list",
                  defaultSize: 35,
                  minSize: 25,
                  content: <WorkOrderList />,
                },
                {
                  id: "detail",
                  label: "Work order detail",
                  defaultSize: 65,
                  content: <WorkOrderDetail />,
                },
              ]}
            />
          </CardSection>
        </Card>
      ),
    },
    {
      title: "Vertical",
      note: "A vertical group fills the height that its style gives.",
      wide: true,
      render: () => (
        <Card layout="sections">
          <CardSection padding="flush">
            <ResizablePanels
              orientation="vertical"
              style={styles.tall}
              panels={[
                {
                  id: "notes",
                  label: "Diagnosis notes",
                  defaultSize: 45,
                  minSize: 25,
                  content: <Notes />,
                },
                {
                  id: "parts",
                  label: "Parts used",
                  defaultSize: 55,
                  minSize: 25,
                  content: <PartsUsed />,
                },
              ]}
            />
          </CardSection>
        </Card>
      ),
    },
    {
      title: "Controlled sizes",
      note: "Pass sizes with onSizesChange to remember the layout.",
      wide: true,
      render: () => <ControlledSpecimen />,
    },
    {
      title: "Three panels with limits",
      note: "A resize stops at minSize and maxSize of both panels next to the handle.",
      wide: true,
      render: () => (
        <Card layout="sections">
          <CardSection padding="flush">
            <ResizablePanels
              style={styles.height}
              panels={[
                {
                  id: "customers",
                  label: "Customers",
                  defaultSize: 25,
                  minSize: 15,
                  maxSize: 35,
                  content: <CustomerList />,
                },
                {
                  id: "orders",
                  label: "Work orders",
                  defaultSize: 40,
                  minSize: 25,
                  content: <WorkOrderList />,
                },
                {
                  id: "invoice",
                  label: "Invoice",
                  defaultSize: 35,
                  minSize: 25,
                  content: <InvoicePane />,
                },
              ]}
            />
          </CardSection>
        </Card>
      ),
    },
    {
      title: "Nested groups",
      note: "A panel content can be another group with the other orientation.",
      wide: true,
      render: () => (
        <Card layout="sections">
          <CardSection padding="flush">
            <ResizablePanels
              style={styles.tall}
              panels={[
                {
                  id: "orders",
                  label: "Work order list",
                  defaultSize: 30,
                  minSize: 20,
                  content: <WorkOrderList />,
                },
                {
                  id: "work",
                  label: "Repair work",
                  defaultSize: 70,
                  content: (
                    <ResizablePanels
                      orientation="vertical"
                      panels={[
                        {
                          id: "notes",
                          label: "Diagnosis notes",
                          defaultSize: 50,
                          content: <Notes />,
                        },
                        {
                          id: "parts",
                          label: "Parts used",
                          defaultSize: 50,
                          content: <PartsUsed />,
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </CardSection>
        </Card>
      ),
    },
  ],
});

const styles = stylex.create({
  height: { height: "18rem" },
  tall: { height: "22rem" },
  list: { margin: 0, padding: 0, listStyleType: "none" },
  listRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingBlock: space.sm,
    paddingInline: space.lg,
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  pane: { display: "flex", flexDirection: "column", gap: space.md, padding: space.lg },
  paneHeader: { display: "flex", alignItems: "center", gap: space.sm, flexWrap: "wrap" },
  title: { margin: 0, fontSize: font.lg, fontWeight: font.semibold, color: color.text },
  text: { margin: 0, fontSize: font.md, color: color.textMuted },
  strong: { fontSize: font.md, fontWeight: font.medium, color: color.text },
  muted: { fontSize: font.sm, color: color.textMuted },
});
