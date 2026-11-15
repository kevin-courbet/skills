import { queryOptions } from "@tanstack/react-query";
import { Schema } from "effect";
import { CircleDot, UsersRound } from "lucide-react";
import {
  type FilterField,
  filterSearchFields,
  parseFilters,
} from "@/components/helpers/filter-params";
import type { BadgeIntent } from "@/components/primitives/badge";

/**
 * The example data of the ticket recipes: ListPage, DetailPage, WorkBoard, and
 * OverviewPage.
 * It stands in for the api module of a feature. A real app reads the same
 * shapes through server functions: run `design read internal-app-server-functions`.
 */

export const TicketStatus = Schema.Literals(["new", "open", "pending", "solved"]);
export type TicketStatus = typeof TicketStatus.Type;
export const TicketTeam = Schema.Literals(["billing", "accounts", "hardware", "network"]);
export type TicketTeam = typeof TicketTeam.Type;
export const TicketSortField = Schema.Literals(["title", "team", "status", "updatedAt"]);
export type TicketSortField = typeof TicketSortField.Type;
export const SortDirection = Schema.Literals(["asc", "desc"]);

export interface Ticket {
  readonly id: string;
  readonly title: string;
  readonly requester: string;
  readonly team: TicketTeam;
  readonly status: TicketStatus;
  readonly assignee: string | null;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const statusDisplay: Record<TicketStatus, { label: string; intent: BadgeIntent }> = {
  new: { label: "New", intent: "info" },
  open: { label: "Open", intent: "accent" },
  pending: { label: "Waiting for reply", intent: "warning" },
  solved: { label: "Solved", intent: "success" },
};

export const teamLabel: Record<TicketTeam, string> = {
  billing: "Billing",
  accounts: "Accounts",
  hardware: "Hardware",
  network: "Network",
};

export const ticketFilterFields = [
  {
    id: "status",
    kind: "multiSelect",
    label: "Status",
    icon: CircleDot,
    options: TicketStatus.literals.map((id) => ({ id, ...statusDisplay[id] })),
  },
  {
    id: "team",
    kind: "select",
    label: "Team",
    icon: UsersRound,
    options: TicketTeam.literals.map((id) => ({ id, label: teamLabel[id] })),
  },
] as const satisfies ReadonlyArray<FilterField>;

export const TicketsSearch = Schema.Struct({
  q: Schema.optionalKey(Schema.String),
  sort: Schema.optionalKey(TicketSortField),
  dir: Schema.optionalKey(SortDirection),
  page: Schema.optionalKey(Schema.Number),
  ...filterSearchFields(ticketFilterFields),
});
export type TicketsSearch = typeof TicketsSearch.Type;

export const ticketsSearchDefaults = {
  sort: "updatedAt",
  dir: "desc",
  page: 1,
} as const satisfies TicketsSearch;

const pageSize = 10;

const requesters = ["Amara Diallo", "Jonas Weber", "Priya Nair", "Tomás Rivera", "Noor Haddad"];
const assignees = ["Ines Costa", "Kenji Mori", null] as const;
const subjects: ReadonlyArray<readonly [string, TicketTeam]> = [
  ["Invoice shows the wrong VAT number", "billing"],
  ["Cannot sign in after the password reset", "accounts"],
  ["Laptop battery drains in two hours", "hardware"],
  ["VPN drops every few minutes", "network"],
  ["Refund for a double charge", "billing"],
  ["Add a new starter to the payroll group", "accounts"],
  ["Printer on floor 3 jams on every job", "hardware"],
  ["Guest Wi-Fi is slow in the meeting rooms", "network"],
  ["Credit note for the cancelled order", "billing"],
  ["Remove access for a leaver", "accounts"],
  ["Second monitor does not wake up", "hardware"],
  ["Shared drive is not reachable from home", "network"],
];

// Fixed dates keep the server render and the browser render the same.
const seedTime = Date.parse("2026-11-02T09:00:00Z");

/** Reads the seed lists round-robin. */
function cycle<T>(values: ReadonlyArray<T>, index: number): T {
  const value = values[index % values.length];
  if (value === undefined) throw new Error("A seed list of the ticket recipes is empty.");
  return value;
}

const store: { tickets: ReadonlyArray<Ticket> } = {
  tickets: Array.from({ length: 24 }, (_, index) => {
    const [title, team] = cycle(subjects, index);
    const created = seedTime + index * 7 * 3_600_000;
    const requester = cycle(requesters, index);
    return {
      id: `TCK-${4100 + index}`,
      title,
      requester,
      team,
      status: cycle(TicketStatus.literals, index * 7),
      assignee: cycle(assignees, index),
      description: `${requester} reported: ${title.toLowerCase()}.`,
      createdAt: new Date(created).toISOString(),
      updatedAt: new Date(created + ((index * 5) % 11) * 3_600_000).toISOString(),
    };
  }),
};

export interface TicketsPage {
  readonly tickets: ReadonlyArray<Ticket>;
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

function listTickets(search: TicketsSearch): TicketsPage {
  const filters = parseFilters(ticketFilterFields, search);
  const status = filters.find((filter) => filter.field === "status");
  const team = filters.find((filter) => filter.field === "team");
  if (status !== undefined && status.kind !== "multiSelect")
    throw new Error("The status filter must be a multiSelect filter.");
  if (team !== undefined && team.kind !== "select")
    throw new Error("The team filter must be a select filter.");
  const q = (search.q ?? "").toLowerCase();
  const sort = search.sort ?? ticketsSearchDefaults.sort;
  const sign = (search.dir ?? ticketsSearchDefaults.dir) === "asc" ? 1 : -1;
  const page = search.page ?? ticketsSearchDefaults.page;
  const matches = store.tickets
    .filter((ticket) => q === "" || `${ticket.title} ${ticket.requester}`.toLowerCase().includes(q))
    .filter((ticket) => status === undefined || status.value.includes(ticket.status))
    .filter((ticket) => team === undefined || ticket.team === team.value)
    .toSorted((left, right) => sign * left[sort].localeCompare(right[sort]));
  return {
    tickets: matches.slice((page - 1) * pageSize, page * pageSize),
    total: matches.length,
    page,
    pageSize,
  };
}

export const ticketKeys = {
  all: ["lab", "tickets"] as const,
  list: (search: TicketsSearch) => ["lab", "tickets", "list", search] as const,
  board: () => ["lab", "tickets", "board"] as const,
  detail: (id: string) => ["lab", "tickets", "detail", id] as const,
  overview: () => ["lab", "tickets", "overview"] as const,
};

export const ticketsListQueryOptions = (search: TicketsSearch) =>
  queryOptions({ queryKey: ticketKeys.list(search), queryFn: async () => listTickets(search) });

export const ticketsBoardQueryOptions = () =>
  queryOptions({ queryKey: ticketKeys.board(), queryFn: async () => store.tickets });

/** Resolves to null for an unknown id, as the not-found wire error of a server function does. */
export const ticketQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ticketKeys.detail(id),
    queryFn: async () => store.tickets.find((ticket) => ticket.id === id) ?? null,
  });

export interface DailyPoint {
  readonly date: string;
  readonly value: number;
}

export interface TicketsOverview {
  readonly byStatus: Record<TicketStatus, number>;
  readonly unassigned: number;
  readonly opened: ReadonlyArray<DailyPoint>;
  readonly solved: ReadonlyArray<DailyPoint>;
  readonly firstReplyHours: ReadonlyArray<DailyPoint>;
}

/** Fourteen UTC days that end on the seed day, with a value from the day index. */
const daily = (value: (index: number) => number): ReadonlyArray<DailyPoint> =>
  Array.from({ length: 14 }, (_, index) => ({
    date: new Date(seedTime - (13 - index) * 86_400_000).toISOString().slice(0, 10),
    value: value(index),
  }));

function ticketsOverview(): TicketsOverview {
  const count = (status: TicketStatus) =>
    store.tickets.filter((ticket) => ticket.status === status).length;
  return {
    byStatus: {
      new: count("new"),
      open: count("open"),
      pending: count("pending"),
      solved: count("solved"),
    },
    unassigned: store.tickets.filter(
      (ticket) => ticket.assignee === null && ticket.status !== "solved",
    ).length,
    opened: daily((index) => 9 + ((index * 5) % 7) - (index % 6 === 5 ? 6 : 0)),
    solved: daily((index) => 8 + ((index * 3) % 6) - (index % 6 === 5 ? 5 : 0)),
    firstReplyHours: daily((index) => 6 - index * 0.25 + ((index * 7) % 3)),
  };
}

export const ticketsOverviewQueryOptions = () =>
  queryOptions({ queryKey: ticketKeys.overview(), queryFn: async () => ticketsOverview() });

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function refuse(id: string) {
  if (id.endsWith("7")) throw new Error(`The example server refused the change of ${id}.`);
}

/** Saves a change of one ticket. A ticket id that ends in 7 fails, so that the recipes show the rollback. */
export async function updateTicket(
  id: string,
  change: Partial<Pick<Ticket, "status" | "assignee">>,
) {
  await pause(400);
  refuse(id);
  store.tickets = store.tickets.map((ticket) =>
    ticket.id === id ? { ...ticket, ...change, updatedAt: new Date().toISOString() } : ticket,
  );
}

/**
 * Moves a ticket to a status and puts it at `index` among the tickets of that
 * status, as a board shows them. A ticket id that ends in 7 fails.
 */
export async function moveTicket(id: string, status: TicketStatus, index: number) {
  await pause(400);
  refuse(id);
  const moved = store.tickets.find((ticket) => ticket.id === id);
  if (moved === undefined) throw new Error(`${id} does not exist.`);
  const rest = store.tickets.filter((ticket) => ticket.id !== id);
  const column = rest.filter((ticket) => ticket.status === status);
  const before = column[index];
  const at = before === undefined ? rest.length : rest.indexOf(before);
  store.tickets = rest.toSpliced(at, 0, { ...moved, status, updatedAt: new Date().toISOString() });
}

export async function deleteTicket(id: string) {
  await pause(400);
  store.tickets = store.tickets.filter((ticket) => ticket.id !== id);
}
