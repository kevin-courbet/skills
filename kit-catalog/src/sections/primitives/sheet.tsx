import * as stylex from "@stylexjs/stylex";
import { type FormEvent, useId, useState } from "react";
import { Badge, type BadgeIntent } from "@/components/primitives/badge";
import { Button, LinkButton } from "@/components/primitives/button";
import { Identifier } from "@/components/primitives/identifier";
import { DescriptionList } from "@/components/primitives/layout";
import { Sheet, type SheetSide, type SheetSize } from "@/components/primitives/sheet";
import { TextField } from "@/components/primitives/text-field";
import { space } from "@/styles/tokens.stylex";
import { defineSection, Labeled, Row } from "../../specimen";

type WorkOrder = {
  readonly id: string;
  readonly title: string;
  readonly customer: string;
  readonly bike: string;
  readonly mechanic: string;
  readonly status: string;
  readonly statusIntent: BadgeIntent;
  readonly due: string;
  readonly notes: ReadonlyArray<string>;
};

const workOrders: ReadonlyArray<WorkOrder> = [
  {
    id: "WO-1040",
    title: "Hydraulic brake bleed",
    customer: "Thomas Bernard",
    bike: "Specialized Rockhopper, 2021",
    mechanic: "Lucas Moreau",
    status: "In repair",
    statusIntent: "info",
    due: "18 Nov 2026",
    notes: ["The front lever feels soft. Bleed both brakes with fresh mineral oil."],
  },
  {
    id: "WO-1041",
    title: "Flat tire and new tube",
    customer: "Chloé Dubois",
    bike: "Brompton C Line, black",
    mechanic: "Inès Garnier",
    status: "Ready for pickup",
    statusIntent: "success",
    due: "16 Nov 2026",
    notes: ["A glass shard was in the rear tire. Replaced the tube and the rim tape."],
  },
  {
    id: "WO-1042",
    title: "Full service and rear hub bearings",
    customer: "Margaux Lefèvre",
    bike: "Trek Domane AL 2, blue",
    mechanic: "Inès Garnier",
    status: "Waiting for parts",
    statusIntent: "warning",
    due: "21 Nov 2026",
    notes: [
      "The rear hub bearings are worn and make a grinding noise under load.",
      "The customer approved the bearing replacement by phone on 15 Nov.",
      "The chain is at 0.75% wear. A new chain and a new cassette are on order.",
      "The front derailleur cable is frayed at the clamp bolt. Replace it during the service.",
      "The rear wheel is 2 mm out of true. True it after the hub service.",
      "The bar tape is torn on the left side. The customer declined new bar tape.",
      "Test ride after the service and record the result here.",
    ],
  },
];

function WorkOrderDetail({ order }: { readonly order: WorkOrder }) {
  return (
    <div {...stylex.props(styles.detail)}>
      <DescriptionList
        items={[
          {
            term: "Status",
            detail: <Badge intent={order.statusIntent}>{order.status}</Badge>,
          },
          { term: "Customer", detail: order.customer },
          { term: "Bike", detail: order.bike },
          { term: "Mechanic", detail: order.mechanic },
          { term: "Due", detail: order.due },
        ]}
      />
      <ul {...stylex.props(styles.notes)}>
        {order.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function EditCustomerSheet() {
  const [isOpen, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onPress={() => setOpen(true)}>Edit customer</Button>
      <Sheet
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Margaux Lefèvre"
        description="Customer since March 2024, 6 work orders"
        actions={(close) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button intent="primary" type="submit" form={formId}>
              Save customer
            </Button>
          </>
        )}
      >
        {(close) => (
          <form
            id={formId}
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              close();
            }}
            {...stylex.props(styles.form)}
          >
            <TextField label="Name" name="name" isRequired defaultValue="Margaux Lefèvre" />
            <TextField
              label="Email"
              name="email"
              type="email"
              isRequired
              defaultValue="margaux.lefevre@example.com"
            />
            <TextField label="Phone" name="phone" width="md" defaultValue="+33 6 12 34 56 78" />
            <TextField
              label="Notes"
              name="notes"
              multiline
              isOptional
              defaultValue="Prefers a text message when the bike is ready."
            />
          </form>
        )}
      </Sheet>
    </>
  );
}

function SizedSheet({ size, side }: { readonly size: SheetSize; readonly side: SheetSide }) {
  const [isOpen, setOpen] = useState(false);
  const order = workOrders[1];
  return (
    <>
      <Button onPress={() => setOpen(true)}>
        Open {size} {side}
      </Button>
      {order === undefined ? null : (
        <Sheet
          isOpen={isOpen}
          onOpenChange={setOpen}
          size={size}
          side={side}
          title={order.title}
          description={`${order.id}, ${order.customer}`}
        >
          <WorkOrderDetail order={order} />
        </Sheet>
      )}
    </>
  );
}

function WorkOrderPeek() {
  const [isOpen, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const order = workOrders[index];
  return (
    <>
      <div {...stylex.props(styles.peekList)}>
        {workOrders.map((item, itemIndex) => (
          <Button
            key={item.id}
            intent="ghost"
            onPress={() => {
              setIndex(itemIndex);
              setOpen(true);
            }}
          >
            {item.id}: {item.title}
          </Button>
        ))}
      </div>
      {order === undefined ? null : (
        <Sheet
          size="peek"
          isOpen={isOpen}
          onOpenChange={setOpen}
          title={order.title}
          meta={<Identifier value={order.id} label="work order ID" size="sm" muted />}
          headerActions={
            <LinkButton to="/" intent="ghost" size="sm">
              Open page
            </LinkButton>
          }
          navigation={{
            onPrevious: index > 0 ? () => setIndex(index - 1) : undefined,
            onNext: index < workOrders.length - 1 ? () => setIndex(index + 1) : undefined,
          }}
        >
          <WorkOrderDetail order={order} />
        </Sheet>
      )}
    </>
  );
}

export default defineSection({
  component: "Sheet",
  specimens: [
    {
      title: "Edit form",
      note: "A side sheet for editing next to the list. The submit button takes type submit and the form id.",
      render: () => (
        <Row>
          <EditCustomerSheet />
        </Row>
      ),
    },
    {
      title: "Sizes and sides",
      note: "Maximum width: sm 20rem, md 28rem, lg 40rem. The side prop sets the edge that the sheet slides in from.",
      render: () => (
        <Row>
          <Labeled label="sm">
            <SizedSheet size="sm" side="right" />
          </Labeled>
          <Labeled label="md">
            <SizedSheet size="md" side="right" />
          </Labeled>
          <Labeled label="lg">
            <SizedSheet size="lg" side="right" />
          </Labeled>
          <Labeled label="side left">
            <SizedSheet size="md" side="left" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Peek with navigation",
      note: "Open a work order, then press j and k to read the next and the previous one. On the first record, the previous button is disabled. On the last record, the next button is disabled.",
      render: () => <WorkOrderPeek />,
    },
  ],
});

const styles = stylex.create({
  peekList: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: space.xs },
  form: { display: "flex", flexDirection: "column", gap: space.lg },
  detail: { display: "flex", flexDirection: "column", gap: space.lg },
  notes: { margin: 0, paddingInlineStart: space.lg, lineHeight: 1.7 },
});
