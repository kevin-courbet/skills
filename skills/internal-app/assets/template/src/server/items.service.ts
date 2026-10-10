import { Context, Effect, Layer, Ref } from "effect";
import {
  type CreateItem,
  type Item,
  type ItemsPage,
  type ItemsQuery,
  type ItemsSummary,
  itemsQueryDefaults,
} from "@/features/items/schemas";
import { ConflictError, NotFoundError } from "@/lib/wire-errors";

const PAGE_SIZE = 25;

interface ItemsServiceShape {
  readonly list: (query: ItemsQuery) => Effect.Effect<ItemsPage>;
  readonly summary: () => Effect.Effect<ItemsSummary>;
  readonly get: (id: string) => Effect.Effect<Item, NotFoundError>;
  readonly create: (input: CreateItem) => Effect.Effect<Item, ConflictError>;
  readonly remove: (id: string) => Effect.Effect<void, NotFoundError>;
}

export class ItemsService extends Context.Service<ItemsService, ItemsServiceShape>()(
  "@app/ItemsService",
) {
  /** In-memory store. Replace with a repository layer backed by a database. */
  static readonly layer = Layer.effect(
    ItemsService,
    Effect.gen(function* () {
      const store = yield* Ref.make<ReadonlyArray<Item>>(seedItems());

      const list: ItemsServiceShape["list"] = (query) =>
        Effect.map(Ref.get(store), (all) => {
          const sort = query.sort ?? itemsQueryDefaults.sort;
          const dir = query.dir ?? itemsQueryDefaults.dir;
          const page = query.page ?? itemsQueryDefaults.page;
          const needle = query.q?.trim().toLowerCase();
          const filtered = all.filter(
            (item) =>
              (query.status === undefined || item.status === query.status) &&
              (needle === undefined ||
                needle === "" ||
                item.name.toLowerCase().includes(needle) ||
                item.owner.toLowerCase().includes(needle)),
          );
          const sorted = [...filtered].sort((left, right) => {
            const a = left[sort];
            const b = right[sort];
            const order =
              typeof a === "number" && typeof b === "number"
                ? a - b
                : String(a).localeCompare(String(b));
            return dir === "asc" ? order : -order;
          });
          const start = (page - 1) * PAGE_SIZE;
          return {
            items: sorted.slice(start, start + PAGE_SIZE),
            total: sorted.length,
            page,
            pageSize: PAGE_SIZE,
          };
        });

      const summary: ItemsServiceShape["summary"] = () =>
        Effect.map(Ref.get(store), (all) => ({
          total: all.length,
          active: all.filter((item) => item.status === "active").length,
          totalAmount: all.reduce((sum, item) => sum + item.amount, 0),
          series: seedSeries(),
        }));

      const get: ItemsServiceShape["get"] = (id) =>
        Effect.flatMap(Ref.get(store), (all) => {
          const found = all.find((item) => item.id === id);
          return found === undefined
            ? Effect.fail(new NotFoundError({ entity: "item", id }))
            : Effect.succeed(found);
        });

      const create: ItemsServiceShape["create"] = (input) =>
        Effect.gen(function* () {
          const all = yield* Ref.get(store);
          if (all.some((item) => item.name.toLowerCase() === input.name.toLowerCase())) {
            return yield* new ConflictError({ message: `An item named "${input.name}" exists.` });
          }
          const item: Item = {
            id: `item_${String(all.length + 1).padStart(4, "0")}`,
            updatedAt: new Date().toISOString(),
            ...input,
          };
          yield* Ref.set(store, [item, ...all]);
          return item;
        });

      const remove: ItemsServiceShape["remove"] = (id) =>
        Effect.gen(function* () {
          const all = yield* Ref.get(store);
          if (!all.some((item) => item.id === id)) {
            return yield* new NotFoundError({ entity: "item", id });
          }
          yield* Ref.set(
            store,
            all.filter((item) => item.id !== id),
          );
        });

      return { list, summary, get, create, remove };
    }),
  );
}

function seedItems(): ReadonlyArray<Item> {
  const owners = ["ops", "finance", "sales", "support"];
  const statuses = ["active", "active", "paused", "archived"] as const;
  return Array.from({ length: 57 }, (_, index) => ({
    id: `item_${String(index + 1).padStart(4, "0")}`,
    name: `Workspace ${index + 1}`,
    owner: owners[index % owners.length] ?? "ops",
    status: statuses[index % statuses.length] ?? "active",
    amount: Math.round(((index * 7919) % 100_000) / 100) * 10,
    updatedAt: new Date(Date.UTC(2026, 8, 1 + (index % 30), 9, 0, 0)).toISOString(),
  }));
}

function seedSeries(): ReadonlyArray<{ date: string; value: number }> {
  return Array.from({ length: 30 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 8, 1 + index)).toISOString(),
    value: 40 + Math.round(20 * Math.sin(index / 4)) + (index % 5),
  }));
}
