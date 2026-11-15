/**
 * A detail page: one record with its status, its facts, its main action, and a delete.
 *
 * @keywords detail page, record page, show page, view one record, single item page, record header, delete record, not found
 * @components Page, PageHeader, Badge, MetaLine, Identifier, Section, DescriptionList, Alert, Button, ConfirmDialog
 * @notes internal-app-routes, internal-app-mutations, internal-app-page-patterns, hierarchy, internal-app-writing
 * @files src/features/lab/tickets.ts
 *
 * Use it for the page that a row of a list opens, when people read a record
 * and act on it. Do not use it to read records one after another from a list:
 * use a peek `Sheet`, as the WorkBoard recipe does. Do not use it for a long
 * edit: put the form on its own route with `FormLayout`.
 *
 * The loader maps a missing record to the not-found page and names the
 * breadcrumb. The page has one primary action. A failed action shows its
 * message on the page, under the header where people acted. The delete runs
 * from `ConfirmDialog` and returns to the list.
 *
 * ## Adapt it
 * - Replace the query and the mutations with the api module of the feature.
 *   Map its `NotFoundError` wire error to `notFound()` in the loader.
 * - Choose the one primary action: the next step of the record. Other actions
 *   are secondary buttons or a `Menu`.
 * - Choose the facts in `DescriptionList`. Put the identifier in `MetaLine`
 *   with `Identifier`, not in the facts.
 * - Use `width="reading"` for a page of facts and text. Use the full width
 *   when the page holds a table.
 * - Write the consequence of the delete in the `ConfirmDialog` description.
 *   The ticket ids that end in 7 fail, so that you can see the error state.
 */
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { CircleCheck, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/primitives/alert";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { Identifier } from "@/components/primitives/identifier";
import {
  DescriptionList,
  MetaLine,
  Page,
  PageHeader,
  Section,
} from "@/components/primitives/layout";
import {
  deleteTicket,
  statusDisplay,
  type Ticket,
  teamLabel,
  ticketKeys,
  ticketQueryOptions,
  updateTicket,
} from "@/features/lab/tickets";
import { formatDateTime } from "@/lib/locale";

export const Route = createFileRoute("/_app/lab/detail-page/$ticketId")({
  loader: async ({ context, params }) => {
    const ticket = await context.queryClient.ensureQueryData(ticketQueryOptions(params.ticketId));
    // A missing record is a 404 page, not a failed load.
    if (ticket === null) throw notFound();
    return { crumb: ticket.title };
  },
  component: TicketPage,
});

function TicketPage() {
  const { ticketId } = Route.useParams();
  const { data: ticket } = useSuspenseQuery(ticketQueryOptions(ticketId));
  if (ticket === null) throw notFound();
  return <TicketDetail ticket={ticket} />;
}

function TicketDetail({ ticket }: { readonly ticket: Ticket }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const isSolved = ticket.status === "solved";
  const status = statusDisplay[ticket.status];

  const changeStatus = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: isSolved ? "open" : "solved" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });
  const remove = useMutation({
    mutationFn: () => deleteTicket(ticket.id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ticketKeys.detail(ticket.id) });
      await queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      await navigate({ to: "/lab/list-page" });
    },
  });

  return (
    <Page width="reading">
      <PageHeader
        title={
          <>
            {ticket.title}{" "}
            <Badge intent={status.intent} size="lg">
              {status.label}
            </Badge>
          </>
        }
        description={
          <MetaLine
            items={[
              `Reported by ${ticket.requester}`,
              <Identifier key="id" value={ticket.id} label="ticket ID" size="sm" muted />,
            ]}
          />
        }
        actions={
          <>
            <Button onPress={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden width={16} height={16} />
              Delete
            </Button>
            <Button
              intent="primary"
              isPending={changeStatus.isPending}
              onPress={() => changeStatus.mutate()}
            >
              {isSolved ? (
                <RotateCcw aria-hidden width={16} height={16} />
              ) : (
                <CircleCheck aria-hidden width={16} height={16} />
              )}
              {isSolved ? "Reopen ticket" : "Mark as solved"}
            </Button>
          </>
        }
      />
      {changeStatus.isError ? (
        <Alert intent="danger" title="The status did not change">
          {changeStatus.error.message} Try again, or reload the page.
        </Alert>
      ) : null}
      <Section title="Problem">
        <p>{ticket.description}</p>
      </Section>
      <Section title="Details">
        <DescriptionList
          items={[
            { term: "Team", detail: teamLabel[ticket.team] },
            { term: "Assignee", detail: ticket.assignee ?? "Not assigned" },
            { term: "Reported", detail: formatDateTime(ticket.createdAt) },
            { term: "Last updated", detail: formatDateTime(ticket.updatedAt) },
          ]}
        />
      </Section>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${ticket.id}?`}
        description="The ticket and its history are removed for everyone. This cannot be undone."
        confirmLabel="Delete ticket"
        onConfirm={() => remove.mutateAsync()}
      />
    </Page>
  );
}
