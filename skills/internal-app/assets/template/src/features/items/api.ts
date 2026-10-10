import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { Schema } from "effect";
import { unwrap } from "@/lib/server-result";
import { CreateItem, ItemsQuery } from "./schemas";

/**
 * The only module routes and components import for item data.
 * Server code is loaded inside handlers, so this file stays client-safe.
 */
export const listItemsFn = createServerFn({ method: "GET" })
  .validator(Schema.toStandardSchemaV1(ItemsQuery))
  .handler(async ({ data }) => {
    const { listItems } = await import("./items.server");
    return listItems(data);
  });

export const getItemsSummaryFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getItemsSummary } = await import("./items.server");
  return getItemsSummary();
});

export const getItemFn = createServerFn({ method: "GET" })
  .validator(Schema.toStandardSchemaV1(Schema.Struct({ id: Schema.String })))
  .handler(async ({ data }) => {
    const { getItem } = await import("./items.server");
    return getItem(data.id);
  });

export const createItemFn = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(CreateItem))
  .handler(async ({ data }) => {
    const { createItem } = await import("./items.server");
    return createItem(data);
  });

export const deleteItemFn = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(Schema.Struct({ id: Schema.String })))
  .handler(async ({ data }) => {
    const { deleteItem } = await import("./items.server");
    return deleteItem(data.id);
  });

export const itemKeys = {
  all: ["items"] as const,
  list: (query: ItemsQuery) => ["items", "list", query] as const,
  summary: () => ["items", "summary"] as const,
  detail: (id: string) => ["items", "detail", id] as const,
};

export const itemsListQueryOptions = (query: ItemsQuery) =>
  queryOptions({
    queryKey: itemKeys.list(query),
    queryFn: () => listItemsFn({ data: query }).then(unwrap),
  });

export const itemsSummaryQueryOptions = () =>
  queryOptions({
    queryKey: itemKeys.summary(),
    queryFn: () => getItemsSummaryFn().then(unwrap),
  });

export const itemQueryOptions = (id: string) =>
  queryOptions({
    queryKey: itemKeys.detail(id),
    queryFn: () => getItemFn({ data: { id } }).then(unwrap),
  });
