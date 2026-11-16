/**
 * An approval list: requests that wait for a decision, with the decided requests beside them, and motion that shows where each request goes.
 *
 * @keywords approval list, approvals, access requests, review queue, approve or decline, inbox, decisions, view transition, arrivals, animate list changes
 * @components ItemList, Item, Card, Badge, Avatar, Button, toast, withViewTransition, useArrivals, useHasChanged, motionStyles
 * @notes kit-motion, motion, internal-app-mutations, kit-composition, kit-states
 * @files src/features/lab/access-requests.ts
 *
 * Use it when people decide on short requests one after another, such as
 * access requests, expense claims, or leave requests, and each decision takes
 * one press. Do not use it when a decision needs a form or a long reading:
 * use the DetailPage recipe for each request.
 *
 * It is also the motion reference of the lab. Approve moves the request to
 * the other card, and Decline removes it, both in a view transition. A request
 * that arrives with a refetch slides in with `motionStyles.enter`, because a
 * refetch does not run in a view transition. The count badge marks its change
 * with `motionStyles.changed`. A failed decision moves the request back.
 *
 * ## Adapt it
 * - Replace `src/features/lab/access-requests.ts` with the api module of the
 *   feature. An Admin request always fails, so that you can see the rollback.
 * - Choose the decisions. Put the decision that people make most often last,
 *   as the primary button. Add a `ConfirmDialog` only to a decision that
 *   people cannot undo.
 * - Write each row as the person and the thing that they ask for. Put the
 *   reason in the description when people need it to decide.
 * - Choose how new requests arrive: a `refetchInterval` for a shared inbox,
 *   or the refetch on window focus for a quiet list.
 */
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useId } from "react";
import {
  motionStyles,
  useArrivals,
  useHasChanged,
  viewTransitionName,
  withViewTransition,
} from "@/components/helpers/motion";
import { Avatar } from "@/components/primitives/avatar";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Item, ItemList } from "@/components/primitives/item";
import { Card, Page, PageHeader } from "@/components/primitives/layout";
import { toast } from "@/components/primitives/toaster";
import {
  type AccessRequest,
  accessRequestKeys,
  accessRequestsQueryOptions,
  type Decision,
  decideAccessRequest,
} from "@/features/lab/access-requests";
import { color, font, space } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/lab/approval-list")({
  staticData: { crumb: "Access requests" },
  loader: ({ context }) => context.queryClient.ensureQueryData(accessRequestsQueryOptions()),
  component: AccessRequestsPage,
});

function useAccessRequests() {
  const queryClient = useQueryClient();
  const { queryKey } = accessRequestsQueryOptions();
  const { data: requests } = useSuspenseQuery({
    ...accessRequestsQueryOptions(),
    refetchInterval: 10_000,
  });
  const save = useMutation({
    mutationFn: ({ id, decision }: { readonly id: string; readonly decision: Decision }) =>
      decideAccessRequest(id, decision),
    onSettled: () => queryClient.invalidateQueries({ queryKey: accessRequestKeys.all }),
  });

  // The cache changes inside the view transition, so the row moves or leaves
  // at once. A failure puts the old list back in the same way.
  const decide = (request: AccessRequest, decision: Decision) => {
    void queryClient.cancelQueries({ queryKey });
    const previous = requests;
    withViewTransition(() =>
      queryClient.setQueryData(queryKey, (current) =>
        decision === "declined"
          ? current?.filter((candidate) => candidate.id !== request.id)
          : current?.map((candidate) =>
              candidate.id === request.id
                ? { ...candidate, status: "approved" as const }
                : candidate,
            ),
      ),
    );
    save.mutate(
      { id: request.id, decision },
      {
        onError: (error) => {
          withViewTransition(() => queryClient.setQueryData(queryKey, previous));
          toast.error(`The request of ${request.person} did not change. ${error.message}`);
        },
      },
    );
  };
  return {
    decide,
    pending: requests.filter((request) => request.status === "pending"),
    approved: requests.filter((request) => request.status === "approved"),
  };
}

function AccessRequestsPage() {
  const scope = useId();
  const { decide, pending, approved } = useAccessRequests();
  const arrivals = useArrivals(pending.map((request) => request.id));
  const rowStyle = (id: string) => [
    motionStyles.named(viewTransitionName(scope, "request", id)),
    arrivals.has(id) && motionStyles.enter,
  ];
  const row = (request: AccessRequest) => ({
    style: rowStyle(request.id),
    media: <Avatar name={request.person} size="sm" />,
    title: request.person,
    description: `${request.level} access to ${request.system}`,
  });

  return (
    <Page>
      <PageHeader
        title="Access requests"
        description="Each decision applies at once. The person gets an email."
      />
      <div {...stylex.props(styles.grid)}>
        <Card
          title="Waiting for a decision"
          headingLevel={2}
          actions={<PendingCount count={pending.length} />}
        >
          {pending.length === 0 ? (
            <p {...stylex.props(styles.empty)}>No requests wait for a decision.</p>
          ) : (
            <ItemList label="Requests that wait for a decision" framed={false}>
              {pending.map((request) => (
                <Item
                  key={request.id}
                  {...row(request)}
                  actions={
                    <>
                      <Button size="sm" onPress={() => decide(request, "declined")}>
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        intent="primary"
                        onPress={() => decide(request, "approved")}
                      >
                        Approve
                      </Button>
                    </>
                  }
                />
              ))}
            </ItemList>
          )}
        </Card>
        <Card title="Approved" headingLevel={2}>
          {approved.length === 0 ? (
            <p {...stylex.props(styles.empty)}>Approved requests show here.</p>
          ) : (
            <ItemList label="Approved requests" framed={false}>
              {approved.map((request) => (
                <Item
                  key={request.id}
                  {...row(request)}
                  meta={<Badge intent="success">Approved</Badge>}
                />
              ))}
            </ItemList>
          )}
        </Card>
      </div>
    </Page>
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
