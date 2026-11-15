import * as stylex from "@stylexjs/stylex";
import { Check, Hand, PackageSearch, Play } from "lucide-react";
import { type FormEvent, useState } from "react";
import { QueueCard } from "@/components/patterns/work-queue";
import { Alert } from "@/components/primitives/alert";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import type { StatStripLink } from "@/components/primitives/layout";
import { TextField } from "@/components/primitives/text-field";
import {
  daysBetween,
  dueLabel,
  type TechnicianId,
  waitedLabel,
  waitLimit,
  type WorkOrder,
  type WorkOrderChange,
} from "@/features/lab/work-orders";
import { color, font, space } from "@/styles/tokens.stylex";

export interface WorkOrderCardProps {
  readonly order: WorkOrder;
  readonly today: string;
  /** The technician of this tablet, who takes, starts, and finishes the work. */
  readonly person: TechnicianId;
  readonly link: StatStripLink;
  readonly onChange: (order: WorkOrder, change: WorkOrderChange) => void;
}

/** The card of one work order, with the next actions of its stage. */
export function WorkOrderCard({ order, today, person, link, onChange }: WorkOrderCardProps) {
  const [isAskingForPart, setAskingForPart] = useState(false);
  const waitedDays =
    order.waitingFor === undefined ? null : daysBetween(order.waitingFor.since, today);
  const isOverdue = daysBetween(today, order.due) < 0;
  const needsHelp = isOverdue || (waitedDays !== null && waitedDays > waitLimit);
  const actions = (() => {
    if (order.assignee === null)
      return [
        {
          label: "Take this work order",
          icon: Hand,
          onPress: () => onChange(order, { stage: "next", assignee: person }),
        },
      ];
    switch (order.stage) {
      case "next":
        return [
          {
            label: "Start work",
            icon: Play,
            intent: "primary" as const,
            onPress: () => onChange(order, { stage: "inProgress", assignee: person }),
          },
        ];
      case "inProgress":
        return [
          {
            label: "Mark as done",
            icon: Check,
            intent: "primary" as const,
            onPress: () => onChange(order, { stage: "done", assignee: person }),
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
              onChange(order, { stage: "inProgress", assignee: person, waitingFor: undefined }),
          },
        ];
      case "done":
        throw new Error(`${order.id} is done, so it is not in the queue.`);
    }
  })();
  return (
    <QueueCard
      title={order.title}
      link={link}
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
              {dueLabel(order.due, today)}
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
              onChange(order, {
                stage: "waiting",
                assignee: person,
                waitingFor: { part, since: today },
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

const styles = stylex.create({
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
