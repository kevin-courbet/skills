import { Schema } from "effect";
import { CircleDot, UserRound } from "lucide-react";
import {
  type ActiveFilter,
  type FilterField,
  filterSearchFields,
  parseFilters,
} from "@/lib/filter-params";
import { ItemSortField, ItemStatus, type ItemsQuery, SortDirection } from "./schemas";

/** Filters of the items list. The ids are the URL params. */
export const itemFilterFields = [
  {
    id: "status",
    kind: "multiSelect",
    label: "Status",
    icon: CircleDot,
    options: [
      { id: "active", label: "Active", intent: "success" },
      { id: "paused", label: "Paused", intent: "warning" },
      { id: "archived", label: "Archived", intent: "neutral" },
    ],
  },
  {
    id: "owner",
    kind: "select",
    label: "Owner",
    icon: UserRound,
    operators: [
      { id: "is", label: "is" },
      { id: "not", label: "is not" },
    ],
    options: [
      { id: "finance", label: "Finance" },
      { id: "ops", label: "Operations" },
      { id: "sales", label: "Sales" },
      { id: "support", label: "Support" },
    ],
  },
] as const satisfies ReadonlyArray<FilterField>;

/** URL search of the list route: the server query fields plus the filter params. */
export const ItemsSearch = Schema.Struct({
  q: Schema.optionalKey(Schema.String),
  sort: Schema.optionalKey(ItemSortField),
  dir: Schema.optionalKey(SortDirection),
  page: Schema.optionalKey(Schema.Number),
  ...filterSearchFields(itemFilterFields),
});
export type ItemsSearch = typeof ItemsSearch.Type;

const decodeStatuses = Schema.decodeUnknownSync(Schema.Array(ItemStatus));

/** Builds the server query from the validated URL search. */
export function itemsQueryFromSearch(search: ItemsSearch): ItemsQuery {
  const filters = parseFilters(itemFilterFields, search);
  const status = filters.find((filter) => filter.field === "status");
  const owner = filters.find((filter) => filter.field === "owner");
  return {
    ...(search.q === undefined ? {} : { q: search.q }),
    ...(search.sort === undefined ? {} : { sort: search.sort }),
    ...(search.dir === undefined ? {} : { dir: search.dir }),
    ...(search.page === undefined ? {} : { page: search.page }),
    ...(status === undefined ? {} : { status: decodeStatuses(status.value) }),
    ...(owner === undefined ? {} : { owner: ownerQuery(owner) }),
  };
}

function ownerQuery(filter: ActiveFilter): NonNullable<ItemsQuery["owner"]> {
  if (filter.kind !== "select") throw new Error("The owner filter must be a select filter.");
  return { value: filter.value, negate: filter.operator === "not" };
}
