import * as stylex from "@stylexjs/stylex";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Hand, Inbox, ListTodo, PackageSearch, Play, Wrench } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/primitives/alert";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import {
  Card,
  DescriptionList,
  PageHeader,
  type StatStripLink,
} from "@/components/primitives/layout";
import { RadioGroup } from "@/components/primitives/radio-group";
import { Sheet } from "@/components/primitives/sheet";
import { Switch } from "@/components/primitives/switch";
import { TextField } from "@/components/primitives/text-field";
import { toast } from "@/components/primitives/toaster";
import { QueueCard, QueueSection, WorkQueue } from "@/components/patterns/work-queue";
import { withViewTransition } from "@/components/helpers/motion";
import { color, font, space } from "@/styles/tokens.stylex";

export const technicianIds = ["sam", "lea", "ravi"] as const;
export type TechnicianId = (typeof technicianIds)[number];

const technicians: Record<TechnicianId, { readonly name: string; readonly firstName: string }> = {
  sam: { name: "Sam Okafor", firstName: "Sam" },
  lea: { name: "Léa Martin", firstName: "Léa" },
  ravi: { name: "Ravi Shah", firstName: "Ravi" },
};

type Stage = "next" | "inProgress" | "waiting" | "done";

interface WorkOrder {
  readonly id: string;
  readonly title: string;
  /** The address of the work, from the room to the building, in natural words. */
  readonly place: string;
  readonly tasks: ReadonlyArray<string>;
  /** The words of the person who reported the problem. */
  readonly note?: string;
  readonly requester: string;
  readonly due: string;
  readonly urgent: boolean;
  readonly assignee: TechnicianId | null;
  readonly stage: Stage;
  readonly waitingFor?: { readonly part: string; readonly since: string };
}

type WorkOrderChange = Pick<WorkOrder, "stage" | "assignee" | "waitingFor">;

/** Days to wait for a part before the card asks for help. */
const waitLimit = 3;

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function seedWorkOrders(today: string): ReadonlyArray<WorkOrder> {
  const day = (offset: number) => addDays(today, offset);
  return [
    {
      id: "WO-1042",
      title: "Replace the ceiling light",
      place: "Room 2.14, Building B",
      tasks: ["Replace the LED panel", "Test the emergency light"],
      note: "The light flickers all day and gives people headaches.",
      requester: "Front desk",
      due: day(0),
      urgent: false,
      assignee: "sam",
      stage: "inProgress",
    },
    {
      id: "WO-1047",
      title: "Fix the leaking tap",
      place: "Kitchen, floor 3, Building A",
      tasks: ["Change the cartridge", "Check the drain under the sink"],
      note: "Water drips onto the floor. We put a towel under it.",
      requester: "Mia Torres",
      due: day(0),
      urgent: true,
      assignee: "sam",
      stage: "next",
    },
    {
      id: "WO-1051",
      title: "Mount the meeting room screen",
      place: "Meeting room Atlas, Building A",
      tasks: ["Mount the wall bracket", "Run the HDMI cable to the table"],
      requester: "Events team",
      due: day(2),
      urgent: false,
      assignee: "sam",
      stage: "next",
    },
    {
      id: "WO-1039",
      title: "Repair the entrance door closer",
      place: "Main entrance, Building C",
      tasks: ["Replace the closer arm", "Adjust the closing speed"],
      requester: "Security",
      due: day(-1),
      urgent: false,
      assignee: "sam",
      stage: "waiting",
      waitingFor: { part: "Door closer arm, size 3", since: day(-5) },
    },
    {
      id: "WO-1053",
      title: "Unblock the shower drain",
      place: "Locker room, Building B",
      tasks: ["Clear the drain", "Clean the grate"],
      requester: "Noah Becker",
      due: day(1),
      urgent: false,
      assignee: null,
      stage: "next",
    },
    {
      id: "WO-1044",
      title: "Service the air handling unit",
      place: "Roof, Building A",
      tasks: ["Change the filters", "Check the belt tension"],
      requester: "Maintenance plan",
      due: day(1),
      urgent: false,
      assignee: "lea",
      stage: "inProgress",
    },
    {
      id: "WO-1049",
      title: "Replace the broken blind",
      place: "Office 1.08, Building C",
      tasks: ["Fit a new blind, 120 cm"],
      requester: "Ines Duarte",
      due: day(3),
      urgent: false,
      assignee: "lea",
      stage: "next",
    },
    {
      id: "WO-1050",
      title: "Reset the parking barrier",
      place: "Gate 2, car park",
      tasks: ["Reset the controller", "Test the loop sensor"],
      requester: "Security",
      due: day(0),
      urgent: true,
      assignee: "ravi",
      stage: "next",
    },
  ];
}

const arrivingWorkOrders: ReadonlyArray<Omit<WorkOrder, "due" | "id">> = [
  {
    title: "Replace the toilet seat",
    place: "Men's room, floor 2, Building A",
    tasks: ["Fit a new seat"],
    requester: "Front desk",
    urgent: false,
    assignee: null,
    stage: "next",
  },
  {
    title: "Fix the stuck window",
    place: "Room 3.02, Building B",
    tasks: ["Free the hinge", "Lubricate the handle"],
    note: "The window does not close and it rains in.",
    requester: "Omar Haddad",
    urgent: true,
    assignee: null,
    stage: "next",
  },
];

/**
 * Stands in for the server of the showcase. A real app keeps its work orders
 * in a database and reads them through server functions.
 */
const showcaseServer = {
  orders: null as ReadonlyArray<WorkOrder> | null,
  failNextSave: false,
  arrivals: 0,
  load(today: string): ReadonlyArray<WorkOrder> {
    this.orders ??= seedWorkOrders(today);
    return this.orders;
  },
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const workOrdersQueryOptions = (today: string) =>
  queryOptions({
    queryKey: ["kit", "work-orders", today],
    queryFn: async () => {
      await pause(250);
      return showcaseServer.load(today);
    },
  });

async function saveWorkOrder(today: string, id: string, change: WorkOrderChange): Promise<void> {
  await pause(600);
  if (showcaseServer.failNextSave) {
    showcaseServer.failNextSave = false;
    throw new Error("The showcase server refused the change.");
  }
  showcaseServer.orders = showcaseServer
    .load(today)
    .map((order) => (order.id === id ? { ...order, ...change } : order));
}

const byUrgencyThenDue = (left: WorkOrder, right: WorkOrder) =>
  Number(right.urgent) - Number(left.urgent) ||
  left.due.localeCompare(right.due) ||
  left.id.localeCompare(right.id);

function useQueueShowcase(today: string, person: TechnicianId | null) {
  const queryClient = useQueryClient();
  const options = workOrdersQueryOptions(today);
  const { data: orders } = useSuspenseQuery(options);
  const [failNextSave, setFailNextSave] = useState(false);
  const save = useMutation({
    mutationFn: ({ id, change }: { readonly id: string; readonly change: WorkOrderChange }) =>
      saveWorkOrder(today, id, change),
    onSettled: () => queryClient.invalidateQueries({ queryKey: options.queryKey }),
  });

  const mine = (stage: Stage) =>
    orders
      .filter((order) => order.stage === stage && order.assignee === person)
      .toSorted(byUrgencyThenDue);
  const queue = {
    inProgress: mine("inProgress"),
    next: mine("next"),
    waiting: mine("waiting").toSorted((left, right) =>
      (left.waitingFor?.since ?? "").localeCompare(right.waitingFor?.since ?? ""),
    ),
    unassigned: orders
      .filter((order) => order.stage === "next" && order.assignee === null)
      .toSorted(byUrgencyThenDue),
  };

  const replace = (id: string, order: WorkOrder) =>
    queryClient.setQueryData(options.queryKey, (current) =>
      current?.map((candidate) => (candidate.id === id ? order : candidate)),
    );

  // The cache changes inside the view transition, so the card moves at once;
  // the request runs after it. A failure moves the card back the same way.
  const change = (order: WorkOrder, next: WorkOrderChange) => {
    if (person === null) throw new Error("A technician must be chosen before a change.");
    void queryClient.cancelQueries({ queryKey: options.queryKey });
    withViewTransition(() => replace(order.id, { ...order, ...next }));
    save.mutate(
      { id: order.id, change: next },
      {
        onError: () => {
          withViewTransition(() => replace(order.id, order));
          toast.error(`${order.id} did not change. Try again.`);
        },
      },
    );
  };

  const toggleFailure = (isSelected: boolean) => {
    showcaseServer.failNextSave = isSelected;
    setFailNextSave(isSelected);
  };
  // A save that fails clears the switch on the server; the switch follows it.
  if (failNextSave && !showcaseServer.failNextSave && !save.isPending) setFailNextSave(false);

  const sendNewOrder = () => {
    const template = arrivingWorkOrders[showcaseServer.arrivals % arrivingWorkOrders.length];
    if (template === undefined) throw new Error("The showcase has no arriving work orders.");
    showcaseServer.arrivals += 1;
    const order: WorkOrder = {
      ...template,
      id: `WO-${1060 + showcaseServer.arrivals}`,
      due: today,
    };
    showcaseServer.orders = [...showcaseServer.load(today), order];
    void queryClient.invalidateQueries({ queryKey: options.queryKey });
  };

  const load = (id: TechnicianId) =>
    orders.filter(
      (order) => order.assignee === id && (order.stage === "next" || order.stage === "inProgress"),
    ).length;

  return {
    today,
    orders,
    queue,
    change,
    failNextSave,
    toggleFailure,
    sendNewOrder,
    load,
  };
}

type QueueShowcaseState = ReturnType<typeof useQueueShowcase>;

export interface QueueShowcaseProps {
  readonly today: string;
  /** The technician of this tablet, or null before someone chooses. */
  readonly person: TechnicianId | null;
  readonly onPersonChange: (person: TechnicianId) => void;
  /** The work order that the detail sheet shows. */
  readonly openOrderId: string | null;
  readonly orderLink: (id: string) => StatStripLink;
  readonly onCloseOrder: () => void;
}

/**
 * A touch work view: the queue of one technician on a shared tablet, grouped
 * by the next action. Render it in `Page density="touch"`. See Touch work view
 * in the component reference.
 */
export function QueueShowcase(props: QueueShowcaseProps) {
  const state = useQueueShowcase(props.today, props.person);
  const { person } = props;
  const personOptions = technicianIds.map((id) => ({
    id,
    label: person === null ? technicians[id].name : technicians[id].firstName,
    avatar: {},
    meta: openCount(state.load(id)),
  }));
  if (person === null)
    return (
      <div {...stylex.props(styles.root)}>
        <PageHeader
          title="Who is working on this tablet?"
          description="Choose your name to see your work orders."
        />
        <RadioGroup
          label="Your name"
          appearance="cards"
          options={personOptions}
          value={null}
          onChange={props.onPersonChange}
        />
      </div>
    );
  const count = state.queue.inProgress.length + state.queue.next.length;
  const openOrder = state.orders.find((order) => order.id === props.openOrderId);
  return (
    <div {...stylex.props(styles.root)}>
      <PageHeader
        title={`${technicians[person].firstName}, ${greeting(count)}`}
        actions={
          <RadioGroup
            label="Work orders of"
            appearance="chips"
            options={personOptions}
            value={person}
            onChange={props.onPersonChange}
          />
        }
      />
      <WorkQueue>
        <QueueSection
          title="In progress"
          icon={Wrench}
          emphasis
          items={state.queue.inProgress}
          getItemId={(order) => order.id}
          emptyMessage="Nothing in progress. Start the next work order below."
          renderItem={(order) => <WorkOrderCard order={order} state={state} {...props} />}
        />
        <QueueSection
          title="Up next"
          icon={ListTodo}
          items={state.queue.next}
          getItemId={(order) => order.id}
          emptyMessage="Your queue is clear."
          renderItem={(order) => <WorkOrderCard order={order} state={state} {...props} />}
        />
        <QueueSection
          title="Waiting for a part"
          icon={PackageSearch}
          items={state.queue.waiting}
          getItemId={(order) => order.id}
          renderItem={(order) => <WorkOrderCard order={order} state={state} {...props} />}
        />
        <QueueSection
          title="Not assigned yet"
          icon={Inbox}
          items={state.queue.unassigned}
          getItemId={(order) => order.id}
          renderItem={(order) => <WorkOrderCard order={order} state={state} {...props} />}
        />
      </WorkQueue>
      <Card
        title="Showcase controls"
        description="These controls stand in for the server, so you can see each animation."
      >
        <div {...stylex.props(styles.controls)}>
          <Button onPress={state.sendNewOrder}>Send a new work order</Button>
          <Switch isSelected={state.failNextSave} onChange={state.toggleFailure}>
            Fail the next save
          </Switch>
        </div>
      </Card>
      {openOrder === undefined ? null : (
        <Sheet
          title={openOrder.title}
          description={openOrder.place}
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) props.onCloseOrder();
          }}
        >
          <DescriptionList
            items={[
              { term: "Work order", detail: openOrder.id },
              { term: "Requested by", detail: openOrder.requester },
              { term: "Due", detail: dueLabel(openOrder.due, props.today) },
              { term: "Tasks", detail: openOrder.tasks.join(", ") },
            ]}
          />
        </Sheet>
      )}
    </div>
  );
}

function WorkOrderCard({
  order,
  state,
  person,
  orderLink,
}: QueueShowcaseProps & { readonly order: WorkOrder; readonly state: QueueShowcaseState }) {
  const [isAskingForPart, setAskingForPart] = useState(false);
  if (person === null) throw new Error("A work order card needs a technician.");
  const waitedDays =
    order.waitingFor === undefined ? null : daysBetween(order.waitingFor.since, state.today);
  const isOverdue = daysBetween(state.today, order.due) < 0;
  const needsHelp = isOverdue || (waitedDays !== null && waitedDays > waitLimit);
  const actions = (() => {
    if (order.assignee === null)
      return [
        {
          label: "Take this work order",
          icon: Hand,
          onPress: () => state.change(order, { stage: "next", assignee: person }),
        },
      ];
    switch (order.stage) {
      case "next":
        return [
          {
            label: "Start work",
            icon: Play,
            intent: "primary" as const,
            onPress: () => state.change(order, { stage: "inProgress", assignee: person }),
          },
        ];
      case "inProgress":
        return [
          {
            label: "Mark as done",
            icon: Check,
            intent: "primary" as const,
            onPress: () => state.change(order, { stage: "done", assignee: person }),
          },
          {
            label: "Waiting for a part",
            icon: PackageSearch,
            onPress: () => setAskingForPart(true),
          },
        ];
      case "waiting":
        return [
          {
            label: "Part arrived, resume",
            icon: Play,
            intent: "primary" as const,
            onPress: () =>
              state.change(order, { stage: "inProgress", assignee: person, waitingFor: undefined }),
          },
        ];
      case "done":
        throw new Error(`${order.id} is done, so it is not in the queue.`);
    }
  })();
  return (
    <QueueCard
      title={order.title}
      link={orderLink(order.id)}
      tag={
        <Badge appearance="outline" size="lg">
          {order.id}
        </Badge>
      }
      subtitle={order.place}
      tone={needsHelp ? "attention" : "default"}
      meta={
        <>
          <span>{order.requester}</span>
          <span {...stylex.props(styles.flags)}>
            {order.urgent ? (
              <Badge intent="danger" size="lg">
                Urgent
              </Badge>
            ) : null}
            <Badge intent={isOverdue ? "danger" : "neutral"} size="lg">
              {dueLabel(order.due, state.today)}
            </Badge>
          </span>
        </>
      }
      actions={isAskingForPart ? [] : actions}
      panel={
        isAskingForPart ? (
          <PartForm
            onCancel={() => setAskingForPart(false)}
            onSubmit={(part) => {
              setAskingForPart(false);
              state.change(order, {
                stage: "waiting",
                assignee: person,
                waitingFor: { part, since: state.today },
              });
            }}
          />
        ) : undefined
      }
    >
      <ul {...stylex.props(styles.tasks)}>
        {order.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
      {order.note === undefined ? null : <p {...stylex.props(styles.note)}>“{order.note}”</p>}
      {order.waitingFor === undefined || waitedDays === null ? null : (
        <Alert
          intent={waitedDays > waitLimit ? "danger" : "warning"}
          icon={PackageSearch}
          title={`Waiting for: ${order.waitingFor.part}`}
        >
          {waitedDays > waitLimit
            ? `${waitedDays} days without the part. Call the supplier.`
            : waitedLabel(waitedDays)}
        </Alert>
      )}
    </QueueCard>
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
    if (part.trim() === "") return setError("Name the part, so the store can order it.");
    onSubmit(part.trim());
  };
  return (
    <form noValidate onSubmit={submit} {...stylex.props(styles.partForm)}>
      <TextField
        label="Which part do you wait for?"
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

function dueLabel(due: string, today: string): string {
  const days = daysBetween(today, due);
  if (days < 0) return days === -1 ? "1 day overdue" : `${-days} days overdue`;
  if (days === 0) return "Due today";
  return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
}

function waitedLabel(days: number): string {
  if (days === 0) return "Since today.";
  return days === 1 ? "Since yesterday." : `For ${days} days.`;
}

function openCount(count: number): string {
  return count === 1 ? "1 open" : `${count} open`;
}

function greeting(count: number): string {
  if (count === 0) return "your queue is clear";
  return count === 1 ? "one work order for you" : `${count} work orders for you`;
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.xxxl },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.xl },
  flags: { display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: space.xs },
  tasks: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    margin: 0,
    paddingInlineStart: space.xl,
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
