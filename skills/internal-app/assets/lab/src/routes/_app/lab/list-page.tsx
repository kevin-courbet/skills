/**
 * A list page: one table of records with a search, URL filters, sorting, and pages.
 *
 * @keywords list page, index page, records list, table page, url filters, search and filter, sortable table, paginated list, admin list
 * @components Page, PageHeader, Toolbar, SearchField, Filters, DataTable, StatusDot, EmptyState, Button
 * @notes internal-app-routes, internal-app-url-filters, tables, internal-app-states, internal-app-page-patterns
 * @files src/features/lab/tickets.ts
 *
 * Use it when people look for records, compare them in columns, and open one.
 * Do not use it when the stage of a record is the main fact and people move
 * records by hand: use the WorkBoard recipe. Do not use it for the work of one
 * person on a shared tablet: use the TouchQueue recipe.
 *
 * Every state that a link must keep lives in the URL: the search text, the
 * filters, the sort, and the page. A change to the search or the filters
 * resets the page. The loader prefetches the query, so the server render
 * shows the rows and no loading state.
 *
 * ## Adapt it
 * - Replace `src/features/lab/tickets.ts` with the schemas, filters, and api
 *   module of the feature. Keep the search schema and its defaults there.
 * - Choose the columns. Keep the name column first and pinned. Hide or stack
 *   the secondary columns on narrow screens with `responsiveColumns`.
 * - Choose the filter fields: a small closed set of values is a filter, free
 *   text is the search.
 * - Write the two empty states: no match for the filters, and no records yet
 *   with the create action.
 * - Point `rowAction.link` at the detail route of the record.
 */
import * as stylex from "@stylexjs/stylex";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { Schema } from "effect";
import { Inbox, SearchX } from "lucide-react";
import { parseFilters, serializeFilters } from "@/components/helpers/filter-params";
import { DataTable, type DataTableColumn } from "@/components/patterns/data-table";
import { Filters } from "@/components/patterns/filters";
import { StatusDot } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/feedback";
import { Page, PageHeader, Toolbar } from "@/components/primitives/layout";
import { SearchField } from "@/components/primitives/search-field";
import {
  statusDisplay,
  type Ticket,
  TicketSortField,
  type TicketStatus,
  type TicketTeam,
  TicketsSearch,
  ticketFilterFields,
  ticketsListQueryOptions,
  ticketsSearchDefaults,
  teamLabel,
} from "@/features/lab/tickets";
import { formatInteger, formatRelative } from "@/lib/locale";
import { color, font, space } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/lab/list-page")({
  staticData: { crumb: "Tickets" },
  validateSearch: Schema.toStandardSchemaV1(TicketsSearch),
  // Default values stay out of the URL, so that links stay short.
  search: { middlewares: [stripSearchParams(ticketsSearchDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(ticketsListQueryOptions(deps));
    // Relative dates need one reference time that is stable across SSR and hydration.
    return { now: Date.now() };
  },
  component: TicketsPage,
});

const isSortField = Schema.is(TicketSortField);

function TicketsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { now } = Route.useLoaderData();
  const { data, isFetching } = useSuspenseQuery(ticketsListQueryOptions(search));
  const filters = parseFilters(ticketFilterFields, search);
  const sorting: SortingState = [
    {
      id: search.sort ?? ticketsSearchDefaults.sort,
      desc: (search.dir ?? ticketsSearchDefaults.dir) === "desc",
    },
  ];
  const hasFilters = (search.q ?? "") !== "" || filters.length > 0;

  const columns: ReadonlyArray<DataTableColumn<Ticket>> = [
    {
      id: "title",
      accessorKey: "title",
      header: "Ticket",
      cell: (info) => <span {...stylex.props(styles.title)}>{info.getValue<string>()}</span>,
    },
    { id: "requester", accessorKey: "requester", header: "Requester", enableSorting: false },
    {
      id: "team",
      accessorKey: "team",
      header: "Team",
      cell: (info) => teamLabel[info.getValue<TicketTeam>()],
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = statusDisplay[info.getValue<TicketStatus>()];
        return <StatusDot intent={status.intent}>{status.label}</StatusDot>;
      },
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: "Updated",
      cell: (info) => (
        <span {...stylex.props(styles.muted)}>{formatRelative(info.getValue<string>(), now)}</span>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader title="Tickets" description={`${formatInteger(data.total)} tickets`} />
      <div {...stylex.props(styles.list)}>
        <Toolbar
          label="Filter tickets"
          actions={isFetching ? <span {...stylex.props(styles.muted)}>Updating</span> : null}
        >
          <SearchField
            label="Search"
            hideLabel
            focusShortcut
            placeholder="Search by title or requester"
            value={search.q ?? ""}
            onChange={(q) =>
              void navigate({
                search: (prev) => ({ ...prev, q: q === "" ? undefined : q, page: undefined }),
                replace: true,
              })
            }
            style={styles.search}
          />
          <Filters
            label="Ticket filters"
            fields={ticketFilterFields}
            value={filters}
            onChange={(next) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  ...serializeFilters(ticketFilterFields, next),
                  page: undefined,
                }),
                replace: true,
              })
            }
          />
        </Toolbar>
        <DataTable
          caption="Tickets"
          columns={columns}
          data={data.tickets}
          getRowId={(ticket) => ticket.id}
          pinnedColumns={{ start: ["title"] }}
          responsiveColumns={{
            requester: { hideBelow: "md", stack: true },
            team: { hideBelow: "lg" },
            updatedAt: { hideBelow: "sm" },
          }}
          rowAction={{
            link: (ticket) => ({
              to: "/lab/detail-page/$ticketId",
              params: { ticketId: ticket.id },
            }),
          }}
          sorting={sorting}
          onSortingChange={(next) => {
            const first = next[0];
            if (first === undefined || !isSortField(first.id)) return;
            const sort: TicketSortField = first.id;
            void navigate({
              search: (prev) => ({
                ...prev,
                sort,
                dir: first.desc ? "desc" : "asc",
                page: undefined,
              }),
              replace: true,
            });
          }}
          pagination={{
            page: data.page,
            pageSize: data.pageSize,
            total: data.total,
            onPageChange: (page) =>
              void navigate({
                search: (prev) => ({ ...prev, page: page === 1 ? undefined : page }),
              }),
          }}
          emptyState={
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No tickets match"
                description="Change the search or the filters."
                action={
                  <Button onPress={() => void navigate({ search: {}, replace: true })}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="No tickets yet"
                description="New tickets show here when people report a problem."
              />
            )
          }
        />
      </div>
    </Page>
  );
}

const styles = stylex.create({
  // The search and the filters belong to the only table of the page, so they sit next to it.
  list: { display: "flex", flexDirection: "column", gap: space.md, minWidth: 0 },
  search: { flex: "1", minWidth: "12rem", maxWidth: "20rem" },
  title: { fontWeight: font.medium },
  muted: { color: color.textMuted, fontSize: font.sm },
});
