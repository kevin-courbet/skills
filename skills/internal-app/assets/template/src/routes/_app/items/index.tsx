import * as stylex from "@stylexjs/stylex";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { Schema } from "effect";
import { Package, SearchX } from "lucide-react";
import { Badge, type BadgeIntent } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/feedback";
import { Page, PageHeader, Toolbar } from "@/components/ui/layout";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { Select } from "@/components/ui/select";
import { itemsListQueryOptions } from "@/features/items/api";
import {
  type Item,
  type ItemSortField,
  type ItemStatus,
  ItemsQuery,
  itemsQueryDefaults,
} from "@/features/items/schemas";
import { CreateItemDialog } from "@/features/items/ui/create-item-dialog";
import { formatCurrency, formatInteger, formatRelative } from "@/lib/locale";
import { color, font } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/items/")({
  validateSearch: Schema.toStandardSchemaV1(ItemsQuery),
  search: { middlewares: [stripSearchParams(itemsQueryDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(itemsListQueryOptions(deps));
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

const statusOptions = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "archived", label: "Archived" },
] as const;

const sortFields: ReadonlyArray<ItemSortField> = ["name", "owner", "status", "amount", "updatedAt"];

function isSortField(value: string): value is ItemSortField {
  return (sortFields as ReadonlyArray<string>).includes(value);
}

function ItemsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { now } = Route.useLoaderData();
  const { data, isFetching } = useSuspenseQuery(itemsListQueryOptions(search));

  const sort = search.sort ?? itemsQueryDefaults.sort;
  const dir = search.dir ?? itemsQueryDefaults.dir;
  const page = search.page ?? itemsQueryDefaults.page;
  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));
  const sorting: SortingState = [{ id: sort, desc: dir === "desc" }];
  const hasFilters = (search.q ?? "") !== "" || search.status !== undefined;

  const columns: ReadonlyArray<DataTableColumn<Item>> = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <Link
          to="/items/$itemId"
          params={{ itemId: info.row.original.id }}
          {...stylex.props(styles.rowLink)}
        >
          {info.getValue<string>()}
        </Link>
      ),
    },
    { id: "owner", accessorKey: "owner", header: "Owner" },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue<ItemStatus>();
        return <Badge intent={statusIntent[status]}>{statusLabel[status]}</Badge>;
      },
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => formatCurrency(info.getValue<number>()),
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
      <Toolbar label="Filter items">
        <SearchField
          label="Search"
          placeholder="Name or owner"
          value={search.q ?? ""}
          onChange={(q) =>
            void navigate({
              search: (prev) => ({ ...prev, q: q === "" ? undefined : q, page: undefined }),
              replace: true,
            })
          }
          style={styles.search}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={search.status ?? "all"}
          onChange={(status) =>
            void navigate({
              search: (prev) => ({
                ...prev,
                status: status === "all" ? undefined : status,
                page: undefined,
              }),
              replace: true,
            })
          }
          style={styles.status}
        />
        {isFetching ? <span {...stylex.props(styles.muted)}>Updating</span> : null}
      </Toolbar>
      <DataTable
        caption="Items"
        columns={columns}
        data={data.items}
        getRowId={(item) => item.id}
        numericColumns={["amount"]}
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
        emptyState={
          hasFilters ? (
            <EmptyState
              icon={<SearchX width={32} height={32} />}
              title="No items match"
              description="Change the search or the status filter."
              action={
                <Button onPress={() => void navigate({ search: {}, replace: true })}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Package width={32} height={32} />}
              title="No items yet"
              description="Create the first item to start."
              action={<CreateItemDialog />}
            />
          )
        }
      />
      <Pagination
        page={page}
        pageCount={pageCount}
        format={formatInteger}
        onPageChange={(next) =>
          void navigate({ search: (prev) => ({ ...prev, page: next === 1 ? undefined : next }) })
        }
      />
    </Page>
  );
}

const styles = stylex.create({
  search: { width: "18rem", maxWidth: "100%" },
  status: { width: "11rem" },
  rowLink: {
    fontWeight: font.medium,
    color: color.text,
    textDecoration: { default: "none", ":hover": "underline" },
    textUnderlineOffset: "2px",
    borderRadius: "0.1875rem",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  muted: { color: color.textMuted, fontSize: font.sm },
});
