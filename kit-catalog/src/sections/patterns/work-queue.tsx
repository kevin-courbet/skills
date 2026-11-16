import * as stylex from "@stylexjs/stylex";
import {
  CalendarClock,
  Check,
  Hand,
  ListTodo,
  PackageSearch,
  Play,
  Trash2,
  Wrench,
} from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { withViewTransition } from "@/components/helpers/motion";
import {
  QueueCard,
  type QueueCardAction,
  QueueSection,
  WorkQueue,
} from "@/components/patterns/work-queue";
import { Alert } from "@/components/primitives/alert";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { TextField } from "@/components/primitives/text-field";
import { toast } from "@/components/primitives/toaster";
import { color, font, space } from "@/styles/tokens.stylex";
import { defineSection } from "../../specimen";

type Stage = "inProgress" | "next" | "waiting" | "done";

interface RepairOrder {
  readonly id: string;
  readonly bike: string;
  readonly customer: string;
  readonly stage: Stage;
  readonly checkedIn: string;
  readonly due: string;
  readonly isOverdue?: boolean;
  readonly isUrgent?: boolean;
  readonly tasks: ReadonlyArray<string>;
  readonly note?: string;
  readonly waitingFor?: { readonly part: string; readonly days: number };
}

/** The shop asks the supplier after this number of days without the part. */
const waitLimit = 3;

const repairOrders: ReadonlyArray<RepairOrder> = [
  {
    id: "WO-1042",
    bike: "Trek Domane AL 2",
    customer: "Amara Diallo",
    stage: "inProgress",
    checkedIn: "Checked in today, 08:40",
    due: "Due today, 17:00",
    tasks: ["Replace the chain", "Index the rear derailleur", "Check the brake pads"],
    note: "It skips gears on the climb to the office.",
  },
  {
    id: "WO-1046",
    bike: "Cannondale Topstone 3",
    customer: "Noor Haddad",
    stage: "next",
    checkedIn: "Checked in today, 09:15",
    due: "Due today, 18:00",
    isUrgent: true,
    tasks: ["Replace the chain and the cassette"],
    note: "I race on Sunday.",
  },
  {
    id: "WO-1052",
    bike: "Raleigh Pioneer",
    customer: "Hannah Becker",
    stage: "next",
    checkedIn: "Checked in on Sat 14 Nov",
    due: "Due tomorrow",
    tasks: ["Replace the front brake pads"],
  },
  {
    id: "WO-1043",
    bike: "Brompton C Line",
    customer: "Jonas Weber",
    stage: "waiting",
    checkedIn: "Checked in on Fri 13 Nov",
    due: "Due on Thu 19 Nov",
    tasks: ["Overhaul the rear hub"],
    waitingFor: { part: "Sturmey-Archer 3-speed hub axle", days: 2 },
  },
];

function stageActions(
  order: RepairOrder,
  move: (stage: Stage, waitingFor?: RepairOrder["waitingFor"]) => void,
  askForPart: () => void,
): ReadonlyArray<QueueCardAction> {
  switch (order.stage) {
    case "next":
      return [
        { label: "Start work", icon: Play, intent: "primary", onPress: () => move("inProgress") },
      ];
    case "inProgress":
      return [
        { label: "Mark as done", icon: Check, intent: "primary", onPress: () => move("done") },
        { label: "Waiting for a part", icon: PackageSearch, onPress: askForPart },
      ];
    case "waiting":
      return [
        {
          label: "Part arrived, resume",
          icon: Play,
          intent: "primary",
          onPress: () => move("inProgress"),
        },
      ];
    case "done":
      throw new Error(`${order.id} is done, so it is not in the queue.`);
  }
}

function RepairCard({
  order,
  onMove,
  isAskingAtStart = false,
}: {
  readonly order: RepairOrder;
  readonly onMove: (order: RepairOrder) => void;
  readonly isAskingAtStart?: boolean;
}) {
  const [isAskingForPart, setAskingForPart] = useState(isAskingAtStart);
  const waited = order.waitingFor;
  const move = (stage: Stage, waitingFor?: RepairOrder["waitingFor"]) =>
    onMove({ ...order, stage, waitingFor });
  return (
    <QueueCard
      title={order.bike}
      link={{ to: "/" }}
      tag={
        <Badge appearance="outline" size="lg">
          {order.id}
        </Badge>
      }
      subtitle={order.customer}
      tone={
        order.isOverdue === true || (waited !== undefined && waited.days > waitLimit)
          ? "attention"
          : "default"
      }
      meta={<Flags order={order} />}
      actions={isAskingForPart ? [] : stageActions(order, move, () => setAskingForPart(true))}
      panel={
        isAskingForPart ? (
          <PartForm
            onCancel={() => setAskingForPart(false)}
            onSubmit={(part) => {
              setAskingForPart(false);
              move("waiting", { part, days: 0 });
            }}
          />
        ) : undefined
      }
    >
      <Tasks order={order} />
    </QueueCard>
  );
}

function Flags({ order }: { readonly order: RepairOrder }) {
  return (
    <>
      <span>{order.checkedIn}</span>
      <span {...stylex.props(styles.flags)}>
        {order.isUrgent === true ? (
          <Badge intent="danger" size="lg">
            Urgent
          </Badge>
        ) : null}
        <Badge intent={order.isOverdue === true ? "danger" : "neutral"} size="lg">
          {order.due}
        </Badge>
      </span>
    </>
  );
}

function waitedText(days: number): string {
  if (days > waitLimit) return `${String(days)} days without the part. Call the supplier.`;
  if (days === 0) return "Ordered today.";
  return `Ordered ${String(days)} days ago.`;
}

function Tasks({ order }: { readonly order: RepairOrder }) {
  const waited = order.waitingFor;
  return (
    <>
      <ul {...stylex.props(styles.tasks)}>
        {order.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
      {order.note === undefined ? null : <p {...stylex.props(styles.note)}>“{order.note}”</p>}
      {waited === undefined ? null : (
        <Alert
          intent={waited.days > waitLimit ? "danger" : "warning"}
          icon={PackageSearch}
          title={`Waiting for: ${waited.part}`}
        >
          {waitedText(waited.days)}
        </Alert>
      )}
    </>
  );
}

function PartForm({
  onSubmit,
  onCancel,
}: {
  readonly onSubmit: (part: string) => void;
  readonly onCancel: () => void;
}) {
  const [part, setPart] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (part.trim() === "") {
      setError("Name the part, so that the counter can order it.");
      return;
    }
    onSubmit(part.trim());
  };
  return (
    <form noValidate onSubmit={submit} {...stylex.props(styles.partForm)}>
      <TextField
        label="Which part do you wait for?"
        placeholder="e.g. Shimano BR-MT200 brake caliper"
        value={part}
        onChange={(value) => {
          setPart(value);
          if (value.trim() !== "") setError(undefined);
        }}
        errorMessage={error}
      />
      <div {...stylex.props(styles.partActions)}>
        <Button type="submit" intent="primary" size="lg">
          Save
        </Button>
        <Button size="lg" onPress={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function MechanicQueue() {
  const [orders, setOrders] = useState(repairOrders);
  const move = (next: RepairOrder) =>
    withViewTransition(() =>
      setOrders((current) => current.map((order) => (order.id === next.id ? next : order))),
    );
  const inStage = (stage: Stage) => orders.filter((order) => order.stage === stage);
  const card = (order: RepairOrder) => <RepairCard order={order} onMove={move} />;
  return (
    <WorkQueue>
      <QueueSection
        title="In progress"
        icon={Wrench}
        emphasis
        items={inStage("inProgress")}
        getItemId={(order) => order.id}
        emptyMessage="Nothing in progress. Start the next work order below."
        renderItem={card}
      />
      <QueueSection
        title="Up next"
        icon={ListTodo}
        items={inStage("next")}
        getItemId={(order) => order.id}
        emptyMessage="Your queue is clear."
        renderItem={card}
      />
      <QueueSection
        title="Waiting for a part"
        icon={PackageSearch}
        items={inStage("waiting")}
        getItemId={(order) => order.id}
        renderItem={card}
      />
    </WorkQueue>
  );
}

/** The shop server of this specimen rejects every change, so the card goes back. */
function sendRejectedMove(order: RepairOrder): Promise<void> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`The server rejected the change of ${order.id}.`)), 1200);
  });
}

function FailingQueue() {
  const [orders, setOrders] = useState(repairOrders.slice(0, 3));
  const replace = (next: RepairOrder) =>
    withViewTransition(() =>
      setOrders((current) => current.map((order) => (order.id === next.id ? next : order))),
    );
  const move = (next: RepairOrder) => {
    const previous = orders.find((order) => order.id === next.id);
    if (previous === undefined) throw new Error(`${next.id} is not in the queue.`);
    replace(next);
    sendRejectedMove(next).catch(() => {
      replace(previous);
      toast.error(`${next.id} did not change. Try again.`);
    });
  };
  const inStage = (stage: Stage) => orders.filter((order) => order.stage === stage);
  const card = (order: RepairOrder) => <RepairCard order={order} onMove={move} />;
  return (
    <WorkQueue>
      <QueueSection
        title="In progress"
        icon={Wrench}
        emphasis
        items={inStage("inProgress")}
        getItemId={(order) => order.id}
        emptyMessage="Nothing in progress. Start the next work order below."
        renderItem={card}
      />
      <QueueSection
        title="Up next"
        icon={ListTodo}
        items={inStage("next")}
        getItemId={(order) => order.id}
        emptyMessage="Your queue is clear."
        renderItem={card}
      />
      <QueueSection
        title="Waiting for a part"
        icon={PackageSearch}
        items={inStage("waiting")}
        getItemId={(order) => order.id}
        renderItem={card}
      />
    </WorkQueue>
  );
}

const noOrders: ReadonlyArray<RepairOrder> = [];

function EmptyQueue() {
  return (
    <WorkQueue>
      <QueueSection
        title="In progress"
        icon={Wrench}
        emphasis
        items={noOrders}
        getItemId={(order) => order.id}
        emptyMessage="Nothing in progress. Start the next work order below."
        renderItem={(order) => <QueueCard title={order.bike} />}
      />
      <QueueSection
        title="Up next"
        icon={ListTodo}
        items={noOrders}
        getItemId={(order) => order.id}
        emptyMessage="Your queue is clear."
        renderItem={(order) => <QueueCard title={order.bike} />}
      />
      <QueueSection
        title="Waiting for a part"
        icon={PackageSearch}
        items={noOrders}
        getItemId={(order) => order.id}
        renderItem={(order) => <QueueCard title={order.bike} />}
      />
    </WorkQueue>
  );
}

interface VariantCard {
  readonly id: string;
  readonly render: (leave: () => void) => ReactNode;
}

const overdueOrder: RepairOrder = {
  id: "WO-1037",
  bike: "Gazelle Ultimate C380",
  customer: "Tomás Rivera",
  stage: "inProgress",
  checkedIn: "Checked in on Fri 6 Nov",
  due: "2 days overdue",
  isOverdue: true,
  tasks: ["Replace the rear tyre", "Adjust the hub gear"],
};

const longWaitOrder: RepairOrder = {
  id: "WO-1047",
  bike: "Riese & Müller Load 75 Rohloff HS cargo bike with the child seat and the rain cover",
  customer: "Ines Costa",
  stage: "waiting",
  checkedIn: "Checked in on Mon 9 Nov",
  due: "Due on Mon 23 Nov",
  tasks: ["Read the error code of the motor", "Replace the speed sensor"],
  note: "The display shows error 503 after about ten minutes of riding, and then the motor stops until I switch the bike off and on again.",
  waitingFor: { part: "Bosch speed sensor, slim, 815 mm cable", days: 6 },
};

const variantCards: ReadonlyArray<VariantCard> = [
  {
    id: "overdue",
    render: (leave) => (
      <QueueCard
        title={overdueOrder.bike}
        link={{ to: "/" }}
        tag={
          <Badge appearance="outline" size="lg">
            {overdueOrder.id}
          </Badge>
        }
        subtitle={overdueOrder.customer}
        tone="attention"
        meta={<Flags order={overdueOrder} />}
        actions={[
          {
            label: "Mark as done",
            icon: Check,
            intent: "primary",
            onPress: leave,
            isDisabled: true,
          },
          { label: "Move to tomorrow", icon: CalendarClock, intent: "secondary", onPress: leave },
        ]}
      >
        <Tasks order={overdueOrder} />
        <Alert intent="warning" title="The tyre is not in stock">
          Mark as done is off until the new tyre is on the bike.
        </Alert>
      </QueueCard>
    ),
  },
  {
    id: "long-wait",
    render: (leave) => (
      <QueueCard
        title={longWaitOrder.bike}
        link={{ to: "/" }}
        tag={
          <Badge appearance="outline" size="lg">
            {longWaitOrder.id}
          </Badge>
        }
        subtitle={longWaitOrder.customer}
        tone="attention"
        meta={<Flags order={longWaitOrder} />}
        actions={[
          { label: "Part arrived, resume", icon: Play, intent: "primary", onPress: leave },
          { label: "Cancel the work order", icon: Trash2, intent: "danger", onPress: leave },
        ]}
      >
        <Tasks order={longWaitOrder} />
      </QueueCard>
    ),
  },
  {
    id: "walk-in",
    render: (leave) => (
      <QueueCard
        title="Walk-in: puncture repair"
        subtitle="Customer waits at the counter"
        actions={[{ label: "Take this work order", icon: Hand, onPress: leave }]}
      />
    ),
  },
  {
    id: "no-actions",
    render: () => (
      <QueueCard
        title="Bianchi Via Nirone 7"
        tag={
          <Badge appearance="outline" size="lg">
            WO-1051
          </Badge>
        }
        subtitle="Chiara Bruno"
        meta={<span>The counter hands the bike over at pickup.</span>}
      />
    ),
  },
];

function CardVariants() {
  const [cards, setCards] = useState(variantCards);
  const leave = (id: string) =>
    withViewTransition(() => setCards((current) => current.filter((card) => card.id !== id)));
  return (
    <WorkQueue>
      <QueueSection
        title="Today"
        icon={Wrench}
        items={cards}
        getItemId={(card) => card.id}
        emptyMessage="Nothing for today."
        renderItem={(card) => card.render(() => leave(card.id))}
      />
    </WorkQueue>
  );
}

function PanelOpen() {
  const [orders, setOrders] = useState(repairOrders.slice(0, 1));
  const [isAskingAtStart, setAskingAtStart] = useState(true);
  const move = (next: RepairOrder) => {
    setAskingAtStart(false);
    withViewTransition(() => setOrders([next]));
  };
  return (
    <WorkQueue>
      <QueueSection
        title="In progress"
        icon={Wrench}
        emphasis
        items={orders.filter((order) => order.stage === "inProgress")}
        getItemId={(order) => order.id}
        emptyMessage="Nothing in progress. Start the next work order below."
        renderItem={(order) => (
          <RepairCard order={order} isAskingAtStart={isAskingAtStart} onMove={move} />
        )}
      />
      <QueueSection
        title="Waiting for a part"
        icon={PackageSearch}
        items={orders.filter((order) => order.stage === "waiting")}
        getItemId={(order) => order.id}
        renderItem={(order) => <RepairCard order={order} onMove={move} />}
      />
    </WorkQueue>
  );
}

export default defineSection({
  component: "WorkQueue",
  specimens: [
    {
      title: "Queue of one mechanic",
      note: 'An app page puts the queue in Page density="touch". Set Density to Touch to see that size. Press an action to move the card to its next section.',
      wide: true,
      render: () => <MechanicQueue />,
    },
    {
      title: "Move that fails",
      note: "In this specimen, the server rejects each change. The card moves at once, then goes back to its section. An error toast names the work order.",
      wide: true,
      render: () => <FailingQueue />,
    },
    {
      title: "Empty sections",
      note: "A section without items shows its empty message. The waiting section has no empty message, so it does not show.",
      wide: true,
      render: () => <EmptyQueue />,
    },
    {
      title: "Card variants",
      note: "Each attention card says why it needs help. The other variants are a disabled action, a danger action, a long title, a card without a link, and a card without actions.",
      wide: true,
      render: () => <CardVariants />,
    },
    {
      title: "Card with its panel open",
      note: "The panel replaces the actions. Press Save without a part name to see the field error.",
      wide: true,
      render: () => <PanelOpen />,
    },
  ],
});

const styles = stylex.create({
  flags: { display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: space.xs },
  tasks: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    margin: 0,
    padding: 0,
    listStyleType: "none",
    fontWeight: font.medium,
  },
  note: { margin: 0, color: color.textMuted },
  partForm: { display: "flex", flexDirection: "column", gap: space.md },
  partActions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(12rem, 100%), 1fr))",
    gap: space.md,
  },
});
