import { Schema } from "effect";

export const ItemStatus = Schema.Literals(["active", "paused", "archived"]);
export type ItemStatus = typeof ItemStatus.Type;

export const Item = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  owner: Schema.String,
  status: ItemStatus,
  amount: Schema.Number,
  updatedAt: Schema.String,
});
export type Item = typeof Item.Type;

export const CreateItem = Schema.Struct({
  name: Schema.String.pipe(
    Schema.check(
      Schema.isMinLength(2, { message: "Use at least 2 characters." }),
      Schema.isMaxLength(80, { message: "Use at most 80 characters." }),
    ),
  ),
  owner: Schema.String.pipe(Schema.check(Schema.isMinLength(1, { message: "Owner is required." }))),
  status: ItemStatus,
  amount: Schema.Number.pipe(
    Schema.check(Schema.isGreaterThanOrEqualTo(0, { message: "Amount cannot be negative." })),
  ),
});
export type CreateItem = typeof CreateItem.Type;

export const ItemSortField = Schema.Literals(["name", "owner", "status", "amount", "updatedAt"]);
export type ItemSortField = typeof ItemSortField.Type;

export const SortDirection = Schema.Literals(["asc", "desc"]);
export type SortDirection = typeof SortDirection.Type;

/** URL search state for the list route. Every field has a default so links stay short. */
export const ItemsQuery = Schema.Struct({
  q: Schema.optionalKey(Schema.String),
  status: Schema.optionalKey(ItemStatus),
  sort: Schema.optionalKey(ItemSortField),
  dir: Schema.optionalKey(SortDirection),
  page: Schema.optionalKey(Schema.Number),
});
export type ItemsQuery = typeof ItemsQuery.Type;

export const itemsQueryDefaults = {
  sort: "updatedAt",
  dir: "desc",
  page: 1,
} as const satisfies ItemsQuery;

export const ItemsPage = Schema.Struct({
  items: Schema.Array(Item),
  total: Schema.Number,
  page: Schema.Number,
  pageSize: Schema.Number,
});
export type ItemsPage = typeof ItemsPage.Type;

export const ItemsSummary = Schema.Struct({
  total: Schema.Number,
  active: Schema.Number,
  totalAmount: Schema.Number,
  series: Schema.Array(Schema.Struct({ date: Schema.String, value: Schema.Number })),
});
export type ItemsSummary = typeof ItemsSummary.Type;
