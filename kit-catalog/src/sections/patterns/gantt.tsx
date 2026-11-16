import { ChartGantt } from "lucide-react";
import { useState } from "react";
import { type GanttChange, type GanttTask, Gantt } from "@/components/patterns/gantt";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/feedback";
import { DescriptionList } from "@/components/primitives/layout";
import { Sheet } from "@/components/primitives/sheet";
import { appLocale, appTimeZone } from "@/lib/locale";
import { Column, defineSection } from "../../specimen";

const today = "2026-11-18";

const fleetService: ReadonlyArray<GanttTask> = [
  {
    id: "intake",
    title: "Intake",
    children: [
      {
        id: "collect",
        title: "Bike pickup",
        start: "2026-11-09",
        end: "2026-11-10",
        progress: 100,
        assignee: "Tomas Berg",
      },
      {
        id: "inspect",
        title: "Inspection",
        start: "2026-11-11",
        end: "2026-11-13",
        progress: 100,
        assignee: "Ines Duarte",
        dependsOn: ["collect"],
      },
      {
        id: "quote",
        title: "Quote approved",
        start: "2026-11-16",
        milestone: true,
        intent: "success",
        dependsOn: ["inspect"],
      },
    ],
  },
  {
    id: "repairs",
    title: "Repairs",
    children: [
      {
        id: "parts",
        title: "Order parts",
        start: "2026-11-16",
        end: "2026-11-17",
        progress: 100,
        assignee: "Ana Reyes",
        dependsOn: ["quote"],
      },
      {
        id: "motors",
        title: "Motor tests",
        start: "2026-11-17",
        end: "2026-11-21",
        progress: 60,
        intent: "info",
        assignee: "Tomas Berg",
      },
      {
        id: "drivetrain",
        title: "Drivetrain",
        start: "2026-11-18",
        end: "2026-11-24",
        progress: 10,
        assignee: "Ines Duarte",
        dependsOn: ["parts"],
      },
      {
        id: "brakes",
        title: "Brake bleed",
        start: "2026-11-19",
        end: "2026-11-25",
        assignee: "Ines Duarte",
      },
      {
        id: "wheels",
        title: "Rear wheels",
        start: "2026-11-20",
        end: "2026-11-26",
        intent: "warning",
        assignee: "Ines Duarte",
        meta: "Rims back-ordered",
      },
    ],
  },
  {
    id: "handover",
    title: "Handover",
    children: [
      {
        id: "test",
        title: "Test rides",
        start: "2026-11-27",
        end: "2026-11-30",
        assignee: "Tomas Berg",
        dependsOn: ["drivetrain", "brakes", "wheels"],
      },
      {
        id: "invoice",
        title: "Invoice",
        start: "2026-12-01",
        end: "2026-12-01",
        assignee: "Ana Reyes",
        dependsOn: ["test"],
      },
      {
        id: "returned",
        title: "Fleet returned",
        start: "2026-12-02",
        milestone: true,
        intent: "success",
        dependsOn: ["test"],
      },
    ],
  },
];

const intentTasks: ReadonlyArray<GanttTask> = [
  {
    id: "neutral",
    title: "Strip and clean frame",
    start: "2026-11-16",
    end: "2026-11-17",
    progress: 100,
    intent: "neutral",
    meta: "neutral",
  },
  {
    id: "accent",
    title: "Respray in matte green",
    start: "2026-11-18",
    end: "2026-11-20",
    progress: 20,
    intent: "accent",
    meta: "accent",
    dependsOn: ["neutral"],
  },
  {
    id: "info",
    title: "Fit dynamo lights",
    start: "2026-11-19",
    end: "2026-11-20",
    intent: "info",
    meta: "info",
  },
  {
    id: "warning",
    title: "Wait for the custom-length seat post from the supplier in Milan",
    start: "2026-11-18",
    end: "2026-11-25",
    intent: "warning",
    meta: "warning: supplier late",
  },
  {
    id: "danger",
    title: "Rebuild the bottom bracket",
    start: "2026-11-23",
    end: "2026-11-24",
    intent: "danger",
    meta: "danger: thread damaged",
    dependsOn: ["accent", "warning"],
  },
  {
    id: "pickup",
    title: "Customer pickup",
    start: "2026-11-26",
    milestone: true,
    intent: "success",
    meta: "success",
    dependsOn: ["danger"],
  },
];

const dateFormat = new Intl.DateTimeFormat(appLocale, {
  dateStyle: "medium",
  timeZone: appTimeZone,
});

function leaves(task: GanttTask): ReadonlyArray<GanttTask> {
  return task.children === undefined ? [task] : task.children.flatMap(leaves);
}

function taskDates(task: GanttTask): string {
  const dates = leaves(task)
    .flatMap((leaf) => [leaf.start, leaf.end ?? leaf.start])
    .filter((date) => date !== undefined)
    .toSorted();
  const start = dates[0];
  const end = dates.at(-1);
  if (start === undefined || end === undefined) return "No dates";
  const from = dateFormat.format(new Date(start));
  return start === end ? from : `${from} to ${dateFormat.format(new Date(end))}`;
}

function changeTask(
  tasks: ReadonlyArray<GanttTask>,
  id: string,
  change: GanttChange,
): ReadonlyArray<GanttTask> {
  return tasks.map((task) => {
    if (task.id === id) return { ...task, start: change.start, end: change.end };
    if (task.children === undefined) return task;
    return { ...task, children: changeTask(task.children, id, change) };
  });
}

function findTask(tasks: ReadonlyArray<GanttTask>, id: string): GanttTask | undefined {
  for (const task of tasks) {
    if (task.id === id) return task;
    const child = findTask(task.children ?? [], id);
    if (child !== undefined) return child;
  }
  return undefined;
}

function PlanSpecimen() {
  const [plan, setPlan] = useState(fleetService);
  const [selectedId, setSelectedId] = useState<string | null>("drivetrain");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId === null ? undefined : findTask(plan, openId);

  return (
    <>
      <Gantt
        label="Riverside Couriers fleet service"
        tasks={plan}
        today={today}
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
        onTaskAction={(task) => setOpenId(task.id)}
        onTaskChange={(task, change) => setPlan((current) => changeTask(current, task.id, change))}
        onReorder={(next) => setPlan(next)}
      />
      {open === undefined ? null : (
        <Sheet
          size="peek"
          isOpen
          onOpenChange={(isOpen) => isOpen || setOpenId(null)}
          title={open.title}
        >
          <DescriptionList
            items={
              open.children === undefined
                ? [
                    { term: "Dates", detail: taskDates(open) },
                    { term: "Progress", detail: `${open.progress ?? 0}%` },
                    { term: "Mechanic", detail: open.assignee ?? "Not assigned" },
                    { term: "Note", detail: open.meta ?? "None" },
                  ]
                : [
                    { term: "Dates", detail: taskDates(open) },
                    { term: "Tasks", detail: String(leaves(open).length) },
                  ]
            }
          />
        </Sheet>
      )}
    </>
  );
}

export default defineSection({
  component: "Gantt",
  specimens: [
    {
      title: "Plan with groups, dependencies, and moves",
      wide: true,
      note: "Drag a bar or its edges to change its dates, and a row grip to reorder siblings. Groups do not move. Enter or a double click opens the task.",
      render: () => <PlanSpecimen />,
    },
    {
      title: "Week scale with a load lane",
      wide: true,
      note: "Ines Duarte has three tasks from 20 to 24 November, above the limit of 2, so those days show as a warning. Milestones and groups do not count.",
      render: () => (
        <Gantt
          label="Riverside Couriers fleet service"
          tasks={fleetService}
          today={today}
          scale="week"
          load={{ limit: 2 }}
        />
      ),
    },
    {
      title: "Collapsed groups, read-only",
      wide: true,
      note: "Only the Repairs group is open. A closed group bar spans its tasks and shows their progress weighted by length. Without `onTaskChange` or `onReorder` there is no move hint.",
      render: () => (
        <Gantt
          label="Riverside Couriers fleet service"
          tasks={fleetService}
          today={today}
          defaultExpandedIds={["repairs"]}
        />
      ),
    },
    {
      title: "Intents, milestones, and long titles",
      wide: true,
      note: "Color is not a status alone: the `meta` text after each bar names it.",
      render: () => (
        <Gantt label="Restoration of a 1984 Peugeot PX10" tasks={intentTasks} today={today} />
      ),
    },
    {
      title: "Empty plan",
      note: "With no tasks the chart renders nothing, so the app shows an EmptyState.",
      render: () => (
        <Column width="32rem">
          <EmptyState
            icon={ChartGantt}
            title="No tasks in this plan yet"
            description="Add the first task of the fleet service to see it on the time line."
            action={<Button intent="primary">Add task</Button>}
            variant="dashed"
          />
        </Column>
      ),
    },
  ],
});
