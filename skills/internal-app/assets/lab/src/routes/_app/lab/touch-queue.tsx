/**
 * A touch work queue: the work of one person on a shared tablet, grouped by the next action, with large direct actions.
 *
 * @keywords touch queue, work queue, tablet page, kiosk, shared tablet, field work, technician queue, my work, person picker, large buttons
 * @components WorkQueue, QueueSection, QueueCard, RadioGroup, PageHeader, Sheet, DescriptionList, Page, toast, withViewTransition
 * @notes internal-app-touch-work-view, internal-app-density, internal-app-mutations, internal-app-motion, density
 * @files src/features/lab/work-orders.ts, src/features/lab/ui/work-order-card.tsx
 *
 * Use it when people work away from a desk and use a shared tablet or a
 * phone, such as technicians, warehouse staff, or nurses, and each person
 * needs only their own next steps. Do not use it for the planning of the
 * whole team: use the WorkBoard recipe or the ListPage recipe on a desk.
 *
 * The page has the touch density. It asks who works on the tablet first, and
 * keeps the answer in the URL. Each card shows only the actions of its stage.
 * An action moves the card to its next section at once and saves in the
 * background. A failed save moves the card back and says which card did not
 * change.
 *
 * ## Adapt it
 * - Replace `src/features/lab/work-orders.ts` with the api module of the
 *   feature, and the technicians with the people of the team.
 * - Choose the sections: one per next action, in the order of the work. Put
 *   the work in progress first, with `emphasis`.
 * - Choose the actions of each stage in `WorkOrderCard`. Give each one a verb,
 *   and make the next step of the stage the primary action.
 * - Decide when a card asks for help with `tone="attention"`, such as an
 *   overdue order or a long wait.
 * - The save of WO-1047 always fails, so that you can see the rollback.
 */
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { Inbox, ListTodo, PackageSearch, Wrench } from "lucide-react";
import { withViewTransition } from "@/components/helpers/motion";
import { QueueSection, WorkQueue } from "@/components/patterns/work-queue";
import { DescriptionList, Page, PageHeader } from "@/components/primitives/layout";
import { RadioGroup } from "@/components/primitives/radio-group";
import { Sheet } from "@/components/primitives/sheet";
import { toast } from "@/components/primitives/toaster";
import { WorkOrderCard } from "@/features/lab/ui/work-order-card";
import {
  dueLabel,
  greeting,
  openCount,
  type Stage,
  saveWorkOrder,
  type TechnicianId,
  technicianIds,
  technicians,
  type WorkOrder,
  type WorkOrderChange,
  workOrderKeys,
  workOrdersQueryOptions,
} from "@/features/lab/work-orders";
import { space } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/lab/touch-queue")({
  staticData: { crumb: "Work orders" },
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({
      person: Schema.optionalKey(Schema.Literals(technicianIds)),
      order: Schema.optionalKey(Schema.String),
    }),
  ),
  // The due dates need one today that is stable across SSR and hydration.
  loader: async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    await context.queryClient.ensureQueryData(workOrdersQueryOptions(today));
    return { today };
  },
  component: WorkOrdersPage,
});

const byUrgencyThenDue = (left: WorkOrder, right: WorkOrder) =>
  Number(right.urgent) - Number(left.urgent) ||
  left.due.localeCompare(right.due) ||
  left.id.localeCompare(right.id);

function useWorkOrders(today: string, person: TechnicianId | undefined) {
  const queryClient = useQueryClient();
  const { queryKey } = workOrdersQueryOptions(today);
  const { data: orders } = useSuspenseQuery(workOrdersQueryOptions(today));
  const save = useMutation({
    mutationFn: ({ id, change }: { readonly id: string; readonly change: WorkOrderChange }) =>
      saveWorkOrder(today, id, change),
    onSettled: () => queryClient.invalidateQueries({ queryKey: workOrderKeys.all }),
  });
  const mine = (stage: Stage) =>
    orders
      .filter((order) => order.stage === stage && order.assignee === person)
      .toSorted(byUrgencyThenDue);
  const replace = (order: WorkOrder) =>
    queryClient.setQueryData(queryKey, (current) =>
      current?.map((candidate) => (candidate.id === order.id ? order : candidate)),
    );

  // The cache changes inside the view transition, so the card moves at once;
  // the request runs after it. A failure moves the card back the same way.
  const change = (order: WorkOrder, next: WorkOrderChange) => {
    void queryClient.cancelQueries({ queryKey });
    withViewTransition(() => replace({ ...order, ...next }));
    save.mutate(
      { id: order.id, change: next },
      {
        onError: () => {
          withViewTransition(() => replace(order));
          toast.error(`${order.id} did not change. Try again.`);
        },
      },
    );
  };
  const load = (id: TechnicianId) =>
    orders.filter(
      (order) => order.assignee === id && (order.stage === "next" || order.stage === "inProgress"),
    ).length;
  return {
    orders,
    change,
    load,
    inProgress: mine("inProgress"),
    next: mine("next"),
    waiting: mine("waiting"),
    unassigned: orders
      .filter((order) => order.stage === "next" && order.assignee === null)
      .toSorted(byUrgencyThenDue),
  };
}

function WorkOrdersPage() {
  const { today } = Route.useLoaderData();
  const { person, order: openId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queue = useWorkOrders(today, person);
  const choose = (next: TechnicianId) => void navigate({ search: { person: next } });
  const options = technicianIds.map((id) => ({
    id,
    label: person === undefined ? technicians[id].name : technicians[id].firstName,
    avatar: {},
    meta: openCount(queue.load(id)),
  }));

  if (person === undefined)
    return (
      <Page density="touch">
        <PageHeader
          title="Who is working on this tablet?"
          description="Choose your name to see your work orders."
        />
        <RadioGroup
          label="Your name"
          appearance="cards"
          options={options}
          value={null}
          onChange={choose}
        />
      </Page>
    );

  const open = queue.orders.find((order) => order.id === openId);
  const card = (order: WorkOrder) => (
    <WorkOrderCard
      order={order}
      today={today}
      person={person}
      link={{ to: "/lab/touch-queue", search: { person, order: order.id } }}
      onChange={queue.change}
    />
  );
  return (
    <Page density="touch">
      <div {...stylex.props(styles.root)}>
        <PageHeader
          title={`${technicians[person].firstName}, ${greeting(queue.inProgress.length + queue.next.length)}`}
          actions={
            <RadioGroup
              label="Work orders of"
              appearance="chips"
              options={options}
              value={person}
              onChange={choose}
            />
          }
        />
        <WorkQueue>
          <QueueSection
            title="In progress"
            icon={Wrench}
            emphasis
            items={queue.inProgress}
            getItemId={(order) => order.id}
            emptyMessage="Nothing in progress. Start the next work order below."
            renderItem={card}
          />
          <QueueSection
            title="Up next"
            icon={ListTodo}
            items={queue.next}
            getItemId={(order) => order.id}
            emptyMessage="Your queue is clear."
            renderItem={card}
          />
          <QueueSection
            title="Waiting for a part"
            icon={PackageSearch}
            items={queue.waiting}
            getItemId={(order) => order.id}
            renderItem={card}
          />
          <QueueSection
            title="Not assigned yet"
            icon={Inbox}
            items={queue.unassigned}
            getItemId={(order) => order.id}
            renderItem={card}
          />
        </WorkQueue>
      </div>
      {open === undefined ? null : (
        <Sheet
          title={open.title}
          description={open.place}
          isOpen
          onOpenChange={(isOpen) => isOpen || void navigate({ search: { person } })}
        >
          <DescriptionList
            items={[
              { term: "Work order", detail: open.id },
              { term: "Requested by", detail: open.requester },
              { term: "Due", detail: dueLabel(open.due, today) },
              { term: "Tasks", detail: open.tasks.join(", ") },
            ]}
          />
        </Sheet>
      )}
    </Page>
  );
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.xxxl },
});
