/**
 * A work board: columns of cards that people move between stages, with a peek sheet for one card.
 *
 * @keywords kanban, work board, board page, stages, columns of cards, drag and drop, move between columns, pipeline, peek sheet
 * @components Kanban, Sheet, LinkButton, Identifier, DescriptionList, Avatar, Code, toast, withViewTransition
 * @notes internal-app-mutations, kit-composition, kit-motion, internal-app-page-patterns
 * @files src/features/lab/tickets.ts
 *
 * Use it when the stage of a record is the main fact and people change the
 * stage by hand, such as tickets, repair jobs, or requests. Do not use it to
 * compare values across many records: use the ListPage recipe. Do not use it
 * for the queue of one person on a tablet: use the TouchQueue recipe.
 *
 * A move changes the board at once and saves in the background. A failed
 * move glides the card back and says which card did not move. A card opens in
 * a peek sheet over the board. The id of the open card is in the URL, so that
 * a reload and a link show the same card.
 *
 * ## Adapt it
 * - Replace `src/features/lab/tickets.ts` with the api module of the feature.
 *   The move mutation saves the column and the position of the card.
 * - Choose the columns: one per stage, in the order of the work. Give a
 *   `limit` to the stage where work piles up.
 * - Keep each card to a title and two or three facts. Put the rest in the
 *   sheet.
 * - Give the sheet the facts that people read one card after another, and a
 *   link to the detail page for the rest.
 * - The ticket ids that end in 7 fail each move, so that you can see the
 *   rollback.
 */
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { CircleCheck, CircleDashed, CircleDot, Clock } from "lucide-react";
import { withViewTransition } from "@/components/helpers/motion";
import { Kanban, type KanbanColumn, type KanbanMove } from "@/components/patterns/kanban";
import { Avatar } from "@/components/primitives/avatar";
import { LinkButton } from "@/components/primitives/button";
import { Identifier } from "@/components/primitives/identifier";
import { Code, DescriptionList, Page, PageHeader } from "@/components/primitives/layout";
import { Sheet } from "@/components/primitives/sheet";
import { toast } from "@/components/primitives/toaster";
import {
  moveTicket,
  type Ticket,
  TicketStatus,
  teamLabel,
  ticketKeys,
  ticketsBoardQueryOptions,
} from "@/features/lab/tickets";
import { formatDateTime } from "@/lib/locale";
import { color, font, space } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/lab/work-board")({
  staticData: { crumb: "Ticket board" },
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({ ticket: Schema.optionalKey(Schema.String) }),
  ),
  loader: ({ context }) => context.queryClient.ensureQueryData(ticketsBoardQueryOptions()),
  component: TicketBoardPage,
});

const columns: ReadonlyArray<KanbanColumn> = [
  { id: "new", title: "New", icon: CircleDashed },
  { id: "open", title: "Open", icon: CircleDot, limit: 6 },
  { id: "pending", title: "Waiting for reply", icon: Clock },
  { id: "solved", title: "Solved", icon: CircleCheck },
];

const isStatus = Schema.is(TicketStatus);

function byStatus(tickets: ReadonlyArray<Ticket>): Record<string, ReadonlyArray<Ticket>> {
  return Object.fromEntries(
    columns.map((column) => [column.id, tickets.filter((ticket) => ticket.status === column.id)]),
  );
}

function fromBoard(board: Record<string, ReadonlyArray<Ticket>>): ReadonlyArray<Ticket> {
  return columns.flatMap((column) => {
    const status = column.id;
    if (!isStatus(status)) throw new Error(`${status} is not a ticket status.`);
    return (board[status] ?? []).map((ticket) => ({ ...ticket, status }));
  });
}

function useTicketBoard() {
  const queryClient = useQueryClient();
  const { queryKey } = ticketsBoardQueryOptions();
  const { data: tickets } = useSuspenseQuery(ticketsBoardQueryOptions());
  const save = useMutation({
    mutationFn: (move: KanbanMove) => {
      if (!isStatus(move.toColumn)) throw new Error(`${move.toColumn} is not a ticket status.`);
      return moveTicket(move.itemId, move.toColumn, move.index);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  });

  // Kanban calls onChange inside its view transition, so the cache must
  // change in this call, before any await, for the card to glide.
  const move = (next: Record<string, ReadonlyArray<Ticket>>, change: KanbanMove) => {
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(queryKey, fromBoard(next));
    save.mutate(change, {
      onError: () => {
        withViewTransition(() => queryClient.setQueryData(queryKey, tickets));
        toast.error(`${change.itemId} did not move. Try again.`);
      },
    });
  };
  return { tickets, move };
}

function TicketBoardPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { tickets, move } = useTicketBoard();
  const board = byStatus(tickets);
  const order = columns.flatMap((column) => board[column.id] ?? []);
  const openIndex = order.findIndex((ticket) => ticket.id === search.ticket);
  const open = order[openIndex];
  const show = (ticket: Ticket | undefined) =>
    void navigate({ search: { ticket: ticket?.id }, replace: true });

  return (
    <Page>
      <PageHeader title="Ticket board" description="Move a ticket to the column of its stage." />
      <Kanban
        label="Ticket board"
        columns={columns}
        value={board}
        onChange={move}
        getItemId={(ticket) => ticket.id}
        getItemLabel={(ticket) => `${ticket.id} ${ticket.title}`}
        renderItem={(ticket) => <TicketCard ticket={ticket} />}
        onItemAction={show}
        emptyLabel="No tickets"
      />
      {open === undefined ? null : (
        <Sheet
          size="peek"
          isOpen
          onOpenChange={(isOpen) => isOpen || show(undefined)}
          title={open.title}
          meta={<Identifier value={open.id} label="ticket ID" size="sm" muted />}
          headerActions={
            <LinkButton
              to="/lab/detail-page/$ticketId"
              params={{ ticketId: open.id }}
              intent="ghost"
            >
              Open page
            </LinkButton>
          }
          navigation={{
            onPrevious: () => show(order[openIndex - 1] ?? order.at(-1)),
            onNext: () => show(order[openIndex + 1] ?? order[0]),
          }}
        >
          <p>{open.description}</p>
          <DescriptionList
            items={[
              { term: "Requester", detail: open.requester },
              { term: "Team", detail: teamLabel[open.team] },
              { term: "Assignee", detail: open.assignee ?? "Not assigned" },
              { term: "Last updated", detail: formatDateTime(open.updatedAt) },
            ]}
          />
        </Sheet>
      )}
    </Page>
  );
}

function TicketCard({ ticket }: { readonly ticket: Ticket }) {
  return (
    <>
      <span {...stylex.props(styles.title)}>{ticket.title}</span>
      <span {...stylex.props(styles.meta)}>
        <Code>{ticket.id}</Code>
        <span>{teamLabel[ticket.team]}</span>
      </span>
      <span {...stylex.props(styles.meta)}>
        {ticket.assignee === null ? (
          <span>Not assigned</span>
        ) : (
          <>
            <Avatar name={ticket.assignee} size="xs" />
            <span>{ticket.assignee}</span>
          </>
        )}
      </span>
    </>
  );
}

const styles = stylex.create({
  title: { fontWeight: font.medium },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
    fontSize: font.sm,
    color: color.textMuted,
  },
});
