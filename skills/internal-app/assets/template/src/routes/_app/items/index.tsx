import * as stylex from "@stylexjs/stylex";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { Schema } from "effect";
import { Package, SearchX } from "lucide-react";
import { type BadgeIntent, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/feedback";
import { Filters } from "@/components/ui/filters";
import { Page, PageHeader, Toolbar } from "@/components/ui/layout";
import { SearchField } from "@/components/ui/search-field";
import { itemsListQueryOptions } from "@/features/items/api";
import { ItemsSearch, itemFilterFields, itemsQueryFromSearch } from "@/features/items/filters";
import {
  type Item,
  type ItemSortField,
  type ItemStatus,
  itemsQueryDefaults,
} from "@/features/items/schemas";
import { CreateItemDialog } from "@/features/items/ui/create-item-dialog";
import { parseFilters, serializeFilters } from "@/lib/filter-params";
import { formatCurrency, formatInteger, formatRelative } from "@/lib/locale";
import { color, font } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/items/")({
  validateSearch: Schema.toStandardSchemaV1(ItemsSearch),
  search: { middlewares: [stripSearchParams(itemsQueryDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(itemsListQueryOptions(itemsQueryFromSearch(deps)));
    // Relative dates need one reference time that is stable across SSR and hydration.
    return { now: Date.now() };
  },
  component: ItemsPage,
});

const statusIntent: Record<ItemStatus, BadgeIntent> = {
  active: "success",
  paused: "warning",
  archived: "neutral",
};
const statusLabel: Record<ItemStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

const sortFields: ReadonlyArray<ItemSortField> = ["name", "owner", "status", "amount", "updatedAt"];

function isSortField(value: string): value is ItemSortField {
  return (sortFields as ReadonlyArray<string>).includes(value);
}

function ItemsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { now } = Route.useLoaderData();
  const { data, isFetching } = useSuspenseQuery(
    itemsListQueryOptions(itemsQueryFromSearch(search)),
  );
  const filters = parseFilters(itemFilterFields, search);

  const sort = search.sort ?? itemsQueryDefaults.sort;
  const dir = search.dir ?? itemsQueryDefaults.dir;
  const page = search.page ?? itemsQueryDefaults.page;
  const sorting: SortingState = [{ id: sort, desc: dir === "desc" }];
  const hasFilters = (search.q ?? "") !== "" || filters.length > 0;

  const columns: ReadonlyArray<DataTableColumn<Item>> = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: (info) => <span {...stylex.props(styles.name)}>{info.getValue<string>()}</span>,
    },
    { id: "owner", accessorKey: "owner", header: "Owner" },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue<ItemStatus>();
        return <StatusDot intent={statusIntent[status]}>{statusLabel[status]}</StatusDot>;
      },
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => formatCurrency(info.getValue<number>()),
      footer: () =>
        `${formatCurrency(data.items.reduce((sum, item) => sum + item.amount, 0))} on this page`,
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
      <PageHeader
        title="Items"
        description={`${formatInteger(data.total)} items`}
        actions={<CreateItemDialog />}
      />
      <DataTable
        caption="Items"
        columns={columns}
        data={data.items}
        getRowId={(item) => item.id}
        numericColumns={["amount"]}
        pinnedColumns={{ start: ["name"] }}
        rowAction={{ link: (item) => ({ to: "/items/$itemId", params: { itemId: item.id } }) }}
        toolbar={
          <Toolbar
            label="Filter items"
            density="compact"
            actions={isFetching ? <span {...stylex.props(styles.muted)}>Updating</span> : null}
          >
            <SearchField
              label="Search"
              hideLabel
              size="sm"
              focusShortcut
              placeholder="Search by name or owner"
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
              label="Item filters"
              fields={itemFilterFields}
              value={filters}
              onChange={(next) =>
                void navigate({
                  search: (prev) => ({
                    ...prev,
                    ...serializeFilters(itemFilterFields, next),
                    page: undefined,
                  }),
                  replace: true,
                })
              }
            />
          </Toolbar>
        }
        sorting={sorting}
        onSortingChange={(next) => {
          const first = next[0];
          if (first === undefined) return;
          const id = first.id;
          if (!isSortField(id)) return;
          const nextDir = first.desc ? "desc" : "asc";
          void navigate({
            search: (prev) => ({ ...prev, sort: id, dir: nextDir, page: undefined }),
            replace: true,
          });
        }}
        pagination={{
          page,
          pageSize: data.pageSize,
          total: data.total,
          onPageChange: (next) =>
            void navigate({
              search: (prev) => ({ ...prev, page: next === 1 ? undefined : next }),
            }),
        }}
        emptyState={
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No items match"
              description="Change the search or the filters."
              action={
                <Button onPress={() => void navigate({ search: {}, replace: true })}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No items yet"
              description="Create the first item to start."
              action={<CreateItemDialog />}
            />
          )
        }
      />
    </Page>
  );
}

const styles = stylex.create({
  search: { flex: "1", minWidth: "12rem", maxWidth: "20rem" },
  name: { fontWeight: font.medium },
  muted: { color: color.textMuted, fontSize: font.sm },
});
