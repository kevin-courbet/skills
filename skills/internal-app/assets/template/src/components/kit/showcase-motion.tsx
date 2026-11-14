import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemList } from "@/components/ui/item";
import { Card, Section } from "@/components/ui/layout";
import {
  motionStyles,
  useArrivals,
  useHasChanged,
  viewTransitionName,
  withViewTransition,
} from "@/lib/motion";
import { color, font, space } from "@/styles/tokens.stylex";

type AccessLevel = "View" | "Edit" | "Admin";

interface AccessRequest {
  readonly id: string;
  readonly person: string;
  readonly system: string;
  readonly level: AccessLevel;
  readonly status: "pending" | "approved";
}

const seedRequests: ReadonlyArray<AccessRequest> = [
  {
    id: "req-1",
    person: "Amara Diallo",
    system: "Finance reports",
    level: "Edit",
    status: "pending",
  },
  {
    id: "req-2",
    person: "Jonas Weber",
    system: "Customer records",
    level: "View",
    status: "pending",
  },
  {
    id: "req-3",
    person: "Priya Nair",
    system: "Release pipeline",
    level: "Admin",
    status: "pending",
  },
  {
    id: "req-4",
    person: "Tomás Rivera",
    system: "Shared drive",
    level: "Edit",
    status: "approved",
  },
];

/** Requests that "Receive a request" adds in turn, as a refetch would. */
const incomingRequests: ReadonlyArray<Omit<AccessRequest, "id" | "status">> = [
  { person: "Noor Haddad", system: "Payroll", level: "View" },
  { person: "Ines Costa", system: "Support inbox", level: "Edit" },
  { person: "Kenji Mori", system: "Analytics workspace", level: "View" },
];

/**
 * Each motion helper in `src/lib/motion.ts` on one list of access requests.
 * With reduced motion, each change happens at once.
 */
export function MotionShowcase() {
  const scope = useId();
  const [requests, setRequests] = useState(seedRequests);
  const [received, setReceived] = useState(0);
  const pending = requests.filter((request) => request.status === "pending");
  const approved = requests.filter((request) => request.status === "approved");
  const arrivals = useArrivals(pending.map((request) => request.id));

  const approve = (id: string) =>
    withViewTransition(() =>
      setRequests((current) =>
        current.map((request) =>
          request.id === id ? { ...request, status: "approved" } : request,
        ),
      ),
    );
  const decline = (id: string) =>
    withViewTransition(() =>
      setRequests((current) => current.filter((request) => request.id !== id)),
    );
  // A refetch does not run in a view transition, so the new row uses `motionStyles.enter`.
  const receive = () => {
    const incoming = incomingRequests[received % incomingRequests.length];
    if (incoming === undefined) throw new Error("MotionShowcase: no incoming request.");
    setReceived(received + 1);
    setRequests((current) => [
      ...current,
      { ...incoming, id: `req-incoming-${received}`, status: "pending" },
    ]);
  };

  const rowStyle = (id: string) => [
    motionStyles.named(viewTransitionName(scope, "request", id)),
    arrivals.has(id) && motionStyles.enter,
  ];

  return (
    <Section
      title="Motion"
      description="Approve moves a request, Decline removes it, and a received request arrives. Turn on reduced motion to see each change happen at once."
      actions={<Button onPress={receive}>Receive a request</Button>}
    >
      <div {...stylex.props(styles.grid)}>
        <Card
          title="Waiting for a decision"
          headingLevel={3}
          actions={<PendingCount count={pending.length} />}
        >
          {pending.length === 0 ? (
            <p {...stylex.props(styles.empty)}>No requests wait for a decision.</p>
          ) : (
            <ItemList label="Requests that wait for a decision" framed={false}>
              {pending.map((request) => (
                <Item
                  key={request.id}
                  style={rowStyle(request.id)}
                  media={<Avatar name={request.person} size="sm" />}
                  title={request.person}
                  description={`${request.level} access to ${request.system}`}
                  actions={
                    <>
                      <Button size="sm" onPress={() => decline(request.id)}>
                        Decline
                      </Button>
                      <Button size="sm" intent="primary" onPress={() => approve(request.id)}>
                        Approve
                      </Button>
                    </>
                  }
                />
              ))}
            </ItemList>
          )}
        </Card>
        <Card title="Approved" headingLevel={3}>
          {approved.length === 0 ? (
            <p {...stylex.props(styles.empty)}>Approved requests show here.</p>
          ) : (
            <ItemList label="Approved requests" framed={false}>
              {approved.map((request) => (
                <Item
                  key={request.id}
                  style={rowStyle(request.id)}
                  media={<Avatar name={request.person} size="sm" />}
                  title={request.person}
                  description={`${request.level} access to ${request.system}`}
                  meta={<Badge intent="success">Approved</Badge>}
                />
              ))}
            </ItemList>
          )}
        </Card>
      </div>
    </Section>
  );
}

function PendingCount({ count }: { readonly count: number }) {
  const hasChanged = useHasChanged(count);
  return (
    // A transform does not apply to an inline element, so the wrapper is inline-flex.
    <span key={count} {...stylex.props(styles.count, hasChanged && motionStyles.changed)}>
      <Badge intent={count === 0 ? "neutral" : "warning"}>{`${count} waiting`}</Badge>
    </span>
  );
}

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(24rem, 100%), 1fr))",
    gap: space.lg,
    alignItems: "start",
  },
  count: { display: "inline-flex" },
  empty: { margin: 0, paddingBlock: space.md, fontSize: font.md, color: color.textMuted },
});
