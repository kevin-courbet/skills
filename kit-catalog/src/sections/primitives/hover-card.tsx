import * as stylex from "@stylexjs/stylex";
import { Avatar } from "@/components/primitives/avatar";
import { Badge } from "@/components/primitives/badge";
import { Button, LinkButton } from "@/components/primitives/button";
import { HoverCard, HoverCardLink } from "@/components/primitives/hover-card";
import { DescriptionList, MetaLine } from "@/components/primitives/layout";
import { color, font, space } from "@/styles/tokens.stylex";
import { defineSection, Labeled, Row } from "../../specimen";

function MechanicPreview() {
  return (
    <div {...stylex.props(styles.person)}>
      <Avatar name="Inès Garnier" size="lg" />
      <div {...stylex.props(styles.personText)}>
        <span {...stylex.props(styles.name)}>Inès Garnier</span>
        <span {...stylex.props(styles.muted)}>Senior mechanic, road and gravel</span>
        <MetaLine items={["5 open work orders", "Since 2019"]} />
      </div>
    </div>
  );
}

interface Customer {
  readonly name: string;
  readonly bikes: string;
  readonly workOrders: string;
}

const thomas: Customer = { name: "Thomas Bernard", bikes: "2 bikes", workOrders: "4 work orders" };
const margaux: Customer = { name: "Margaux Lefèvre", bikes: "1 bike", workOrders: "7 work orders" };
const noah: Customer = { name: "Noah Weber", bikes: "3 bikes", workOrders: "2 work orders" };

function CustomerPreview({ customer }: { readonly customer: Customer }) {
  return (
    <div {...stylex.props(styles.person)}>
      <Avatar name={customer.name} size="md" />
      <div {...stylex.props(styles.personText)}>
        <span {...stylex.props(styles.name)}>{customer.name}</span>
        <MetaLine items={[customer.bikes, customer.workOrders]} />
      </div>
    </div>
  );
}

function WorkOrderPreview() {
  return (
    <div {...stylex.props(styles.record)}>
      <div {...stylex.props(styles.recordTitle)}>
        <span {...stylex.props(styles.name)}>Full service and rear hub bearings</span>
        <Badge intent="warning">Waiting for parts</Badge>
      </div>
      <DescriptionList
        items={[
          { term: "Customer", detail: "Margaux Lefèvre" },
          { term: "Mechanic", detail: "Inès Garnier" },
          { term: "Due", detail: "21 Nov 2026" },
        ]}
      />
      <LinkButton to="/" size="sm">
        Open work order
      </LinkButton>
    </div>
  );
}

export default defineSection({
  component: "HoverCard",
  specimens: [
    {
      title: "Person preview on a link",
      note: "Hover or focus the name. The card only repeats what the linked page shows, because a touch screen has no hover.",
      render: () => (
        <p {...stylex.props(styles.sentence)}>
          WO-1042 is assigned to{" "}
          <HoverCard content={<MechanicPreview />}>
            <HoverCardLink href="/">Inès Garnier</HoverCardLink>
          </HoverCard>{" "}
          and is due on 21 Nov.
        </p>
      ),
    },
    {
      title: "Record preview on a button",
      note: "A kit Button can also open the card. The card can hold links and buttons.",
      render: () => (
        <Row>
          <HoverCard content={<WorkOrderPreview />}>
            <Button intent="ghost" size="sm">
              WO-1042
            </Button>
          </HoverCard>
        </Row>
      ),
    },
    {
      title: "Link without href",
      note: "Without href, the link only previews.",
      render: () => (
        <p {...stylex.props(styles.sentence)}>
          Customer:{" "}
          <HoverCard content={<CustomerPreview customer={thomas} />}>
            <HoverCardLink>{thomas.name}</HoverCardLink>
          </HoverCard>
        </p>
      ),
    },
    {
      title: "Placement and delay",
      note: "Hover each name. The card opens on the side that placement gives, and delay 0 opens it at once.",
      render: () => (
        <Row>
          <Labeled label="placement top">
            <HoverCard content={<CustomerPreview customer={thomas} />} placement="top">
              <HoverCardLink>{thomas.name}</HoverCardLink>
            </HoverCard>
          </Labeled>
          <Labeled label="placement right">
            <HoverCard content={<CustomerPreview customer={margaux} />} placement="right">
              <HoverCardLink>{margaux.name}</HoverCardLink>
            </HoverCard>
          </Labeled>
          <Labeled label="delay 0">
            <HoverCard content={<CustomerPreview customer={noah} />} delay={0}>
              <HoverCardLink>{noah.name}</HoverCardLink>
            </HoverCard>
          </Labeled>
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  sentence: { margin: 0 },
  person: { display: "flex", alignItems: "flex-start", gap: space.md },
  personText: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  name: { fontWeight: font.semibold },
  muted: { color: color.textMuted, fontSize: font.sm },
  record: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: space.md },
  recordTitle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.xs,
  },
});
