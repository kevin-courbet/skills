import { queryOptions } from "@tanstack/react-query";

/**
 * The example data of the ApprovalList recipe. It stands in for the api
 * module of a feature. The server render reads the seed. In the browser, a
 * new request arrives every 20 seconds, up to three, as other people who ask
 * for access would, so that the recipe shows an arrival after a refetch.
 */

export type AccessLevel = "View" | "Edit" | "Admin";
export type Decision = "approved" | "declined";

export interface AccessRequest {
  readonly id: string;
  readonly person: string;
  readonly system: string;
  readonly level: AccessLevel;
  readonly status: "pending" | "approved";
}

const incoming: ReadonlyArray<Omit<AccessRequest, "id" | "status">> = [
  { person: "Noor Haddad", system: "Payroll", level: "View" },
  { person: "Ines Costa", system: "Support inbox", level: "Edit" },
  { person: "Kenji Mori", system: "Analytics workspace", level: "View" },
];

const store: { requests: ReadonlyArray<AccessRequest>; arrivals: number; since: number } = {
  arrivals: 0,
  since: Date.now(),
  requests: [
    {
      id: "REQ-301",
      person: "Amara Diallo",
      system: "Finance reports",
      level: "Edit",
      status: "pending",
    },
    {
      id: "REQ-302",
      person: "Jonas Weber",
      system: "Customer records",
      level: "View",
      status: "pending",
    },
    {
      id: "REQ-303",
      person: "Priya Nair",
      system: "Release pipeline",
      level: "Admin",
      status: "pending",
    },
    {
      id: "REQ-304",
      person: "Tomás Rivera",
      system: "Shared drive",
      level: "Edit",
      status: "approved",
    },
  ],
};

function listAccessRequests(): ReadonlyArray<AccessRequest> {
  if (typeof window === "undefined") return store.requests;
  const due = Math.min(incoming.length, Math.floor((Date.now() - store.since) / 20_000));
  for (const next of incoming.slice(store.arrivals, due)) {
    store.arrivals += 1;
    store.requests = [
      ...store.requests,
      { ...next, id: `REQ-${310 + store.arrivals}`, status: "pending" },
    ];
  }
  return store.requests;
}

export const accessRequestKeys = { all: ["lab", "access-requests"] as const };

export const accessRequestsQueryOptions = () =>
  queryOptions({ queryKey: accessRequestKeys.all, queryFn: async () => listAccessRequests() });

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Saves a decision. An Admin request fails, so that the recipe shows the rollback. */
export async function decideAccessRequest(id: string, decision: Decision) {
  await pause(400);
  const request = store.requests.find((candidate) => candidate.id === id);
  if (request === undefined) throw new Error(`${id} does not exist.`);
  if (request.level === "Admin") throw new Error("Only an owner can decide on Admin access.");
  store.requests =
    decision === "declined"
      ? store.requests.filter((candidate) => candidate.id !== id)
      : store.requests.map((candidate) =>
          candidate.id === id ? { ...candidate, status: "approved" } : candidate,
        );
}
