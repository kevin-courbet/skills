import { queryOptions } from "@tanstack/react-query";

/**
 * The example data of the TouchQueue recipe: the work orders of a facilities
 * team. It stands in for the api module of a feature. The example server keeps
 * the orders in memory, and the save of WO-1047 always fails, so that the
 * recipe shows the rollback.
 */

export const technicianIds = ["sam", "lea", "ravi"] as const;
export type TechnicianId = (typeof technicianIds)[number];

export const technicians: Record<
  TechnicianId,
  { readonly name: string; readonly firstName: string }
> = {
  sam: { name: "Sam Okafor", firstName: "Sam" },
  lea: { name: "Léa Martin", firstName: "Léa" },
  ravi: { name: "Ravi Shah", firstName: "Ravi" },
};

export type Stage = "next" | "inProgress" | "waiting" | "done";

export interface WorkOrder {
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

export type WorkOrderChange = Pick<WorkOrder, "stage" | "assignee" | "waitingFor">;

/** Days to wait for a part before the card asks for help. */
export const waitLimit = 3;

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
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

const store: { orders: ReadonlyArray<WorkOrder> | null } = { orders: null };

function load(today: string): ReadonlyArray<WorkOrder> {
  store.orders ??= seedWorkOrders(today);
  return store.orders;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const workOrderKeys = { all: ["lab", "work-orders"] as const };

export const workOrdersQueryOptions = (today: string) =>
  queryOptions({
    queryKey: [...workOrderKeys.all, today] as const,
    queryFn: async () => load(today),
  });

export async function saveWorkOrder(today: string, id: string, change: WorkOrderChange) {
  await pause(600);
  if (id === "WO-1047") throw new Error(`The example server refused the change of ${id}.`);
  store.orders = load(today).map((order) => (order.id === id ? { ...order, ...change } : order));
}

export function dueLabel(due: string, today: string): string {
  const days = daysBetween(today, due);
  if (days < 0) return days === -1 ? "1 day overdue" : `${-days} days overdue`;
  if (days === 0) return "Due today";
  return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
}

export function waitedLabel(days: number): string {
  if (days === 0) return "Since today.";
  return days === 1 ? "Since yesterday." : `For ${days} days.`;
}

export function openCount(count: number): string {
  return count === 1 ? "1 open" : `${count} open`;
}

export function greeting(count: number): string {
  if (count === 0) return "your queue is clear";
  return count === 1 ? "one work order for you" : `${count} work orders for you`;
}
