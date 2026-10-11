import { Effect } from "effect";
import { ItemsService } from "@/server/items.service";
import { runServerFn } from "@/server/server-fn.server";
import type { CreateItem, ItemsQuery } from "./schemas";

export const listItems = (query: ItemsQuery) =>
  runServerFn(Effect.flatMap(ItemsService, (items) => items.list(query)));

export const getItemsSummary = () =>
  runServerFn(Effect.flatMap(ItemsService, (items) => items.summary()));

export const getItem = (id: string) =>
  runServerFn(Effect.flatMap(ItemsService, (items) => items.get(id)));

export const createItem = (input: CreateItem) =>
  runServerFn(Effect.flatMap(ItemsService, (items) => items.create(input)));

export const deleteItem = (id: string) =>
  runServerFn(Effect.flatMap(ItemsService, (items) => items.remove(id)));
