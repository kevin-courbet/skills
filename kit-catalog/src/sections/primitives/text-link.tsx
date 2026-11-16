import * as stylex from "@stylexjs/stylex";
import { DescriptionList } from "@/components/primitives/layout";
import { Table } from "@/components/primitives/table";
import { TextLink } from "@/components/primitives/text-link";
import { EmptyState } from "@/components/primitives/feedback";
import { formatCurrency } from "@/lib/locale";
import { color, font } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type WorkOrder = {
  readonly id: string;
  readonly customer: string;
  readonly bike: string;
  readonly total: number;
};

const workOrders: ReadonlyArray<WorkOrder> = [
  { id: "WO-1042", customer: "Amélie Durand", bike: "Trek Domane SL 5", total: 156.4 },
  { id: "WO-1043", customer: "Lucas Moreau", bike: "Brompton C Line", total: 62 },
  { id: "WO-1044", customer: "Chloé Bernard", bike: "Specialized Turbo Vado", total: 312.9 },
];

export default defineSection({
  component: "TextLink",
  specimens: [
    {
      title: "Variants",
      note: "Use inline in running text. Use quiet where the place already shows a link, such as a table cell.",
      render: () => (
        <Row>
          <Labeled label="inline">
            <TextLink to="/">Invoice 2041</TextLink>
          </Labeled>
          <Labeled label="quiet">
            <TextLink to="/" variant="quiet">
              Amélie Durand
            </TextLink>
          </Labeled>
          <Labeled label="external inline">
            <TextLink href="https://www.shimano.com">Shimano dealer manual</TextLink>
          </Labeled>
          <Labeled label="external quiet">
            <TextLink href="https://www.shimano.com" variant="quiet">
              Shimano dealer manual
            </TextLink>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "In running text",
      note: "Write the destination as the link text. An external link opens in a new tab and shows an icon.",
      render: () => (
        <p {...stylex.props(styles.text)}>
          The brake bleed on <TextLink to="/">work order WO-1042</TextLink> follows the{" "}
          <TextLink href="https://www.shimano.com">Shimano dealer manual</TextLink>. Send the
          customer <TextLink to="/">Invoice 2041</TextLink> when the test ride passes.
        </p>
      ),
    },
    {
      title: "Long link text that wraps",
      note: "The external icon stays on the last word, so it never sits alone on a line.",
      render: () => (
        <Column width="16rem">
          <p {...stylex.props(styles.text)}>
            Torque values are in the{" "}
            <TextLink href="https://www.sram.com">
              SRAM service manual for Rival AXS hydraulic disc brakes
            </TextLink>
            .
          </p>
          <p {...stylex.props(styles.text)}>
            Parts are on{" "}
            <TextLink to="/">
              the estimate for the Specialized Turbo Vado drivetrain overhaul
            </TextLink>
            .
          </p>
        </Column>
      ),
    },
    {
      title: "In a DescriptionList value",
      render: () => (
        <Column width="28rem">
          <DescriptionList
            items={[
              {
                term: "Customer",
                detail: <TextLink to="/">Amélie Durand</TextLink>,
              },
              { term: "Bike", detail: "Trek Domane SL 5" },
              {
                term: "Invoice",
                detail: <TextLink to="/">Invoice 2041</TextLink>,
              },
              {
                term: "Warranty",
                detail: <TextLink href="https://www.trekbikes.com">Trek warranty terms</TextLink>,
              },
            ]}
          />
        </Column>
      ),
    },
    {
      title: "In a table cell",
      note: "A Table has no row actions. Link a record from a cell with the quiet variant.",
      wide: true,
      render: () => (
        <Table
          label="Work orders"
          rows={workOrders}
          getRowId={(order) => order.id}
          rowHeader="id"
          emptyState={<EmptyState title="No work orders" size="sm" />}
          columns={[
            {
              id: "id",
              header: "Work order",
              cell: (order) => (
                <TextLink to="/" variant="quiet">
                  {order.id}
                </TextLink>
              ),
            },
            {
              id: "customer",
              header: "Customer",
              cell: (order) => (
                <TextLink to="/" variant="quiet">
                  {order.customer}
                </TextLink>
              ),
            },
            { id: "bike", header: "Bike", cell: (order) => order.bike },
            {
              id: "total",
              header: "Total",
              numeric: true,
              cell: (order) => formatCurrency(order.total),
            },
          ]}
        />
      ),
    },
  ],
});

const styles = stylex.create({
  text: {
    margin: 0,
    maxWidth: "36rem",
    fontSize: font.md,
    lineHeight: font.leadingNormal,
    color: color.text,
  },
});
