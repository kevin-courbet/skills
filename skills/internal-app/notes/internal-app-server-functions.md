---
id: internal-app-server-functions
topic: internal-app
summary: Choose between a Start server function and Effect RPC, run each server function through runServerFn with typed wire errors, and give each feature the schemas, filters, api, and server module shape.
keywords: [server function, createServerFn, runServerFn, server fn, backend call, api.ts, feature module, wire error, ServerFnError, unwrap, failureMessage, query keys, query options, auth middleware, csrf, data boundary]
related: [internal-app-effect-services, internal-app-routes, internal-app-mutations, internal-app-error-reporting, internal-app-rpc]
---

# Internal App Server Functions

A server function is the data boundary of a feature that the Start server owns. The template feature `src/features/items/` shows each part.

## Choose The Boundary

- When an independent backend owns the data or the workflows, use Effect RPC. Run `design read internal-app-rpc` before you write code.
- When the Start server owns the feature, use the server functions of this note.
- In both cases, the `api.ts` file of the feature is the boundary that the routes use. It owns the query options for the SSR reads and the client reads.
- Do not wrap an existing RPC backend in server functions only to match the template layout.

## The runServerFn Boundary

`src/server/server-fn.server.ts` exports `runServerFn`:

```ts
export async function runServerFn<A, E extends WireError>(
  effect: Effect.Effect<A, E, AppServices>,
): Promise<ServerResult<A, WireErrorEncoded>>
```

- The effect can fail only with a `WireError`. An internal error that is not mapped is a type error at the call. Map it with `Effect.mapError` before the boundary.
- An expected failure returns `{ ok: false, error }` with the encoded tagged error.
- A defect, an interruption, or a layer failure throws. The function middleware records the failure before Start serializes the response. Nothing is swallowed.

## Wire Errors On The Client

- `unwrap(result)` from `src/lib/server-result.ts` returns the value, or throws a `ServerFnError` that carries the typed error. Use it in each `queryFn` and `mutationFn`, so that TanStack Query sees a thrown error.
- Branch on a failure with `isServerFnError<WireErrorEncoded>(error) && error.error._tag === "ConflictError"`.
- Show a failure to people with `failureMessage(error)`. It returns the `message` of the wire error, a "no longer exists" text for `NotFoundError`, or a general retry text for an unexpected error. The details of an unexpected error stay in the server log.
- The wire errors in `src/lib/wire-errors.ts` are `NotFoundError`, `ConflictError`, `ValidationError`, and `ForbiddenError`. They are kit files. When an app needs one more expected failure, add it to the kit in this skill.

## Feature Module Shape

```
features/items/
  schemas.ts        Item, CreateItem, ItemsQuery, ItemsPage (Effect Schema, client-safe)
  filters.ts        Filter fields, the route search schema, and the search-to-query mapping
  api.ts            createServerFn wrappers, query keys, queryOptions factories
  items.server.ts   Functions that build the Effect and call runServerFn
  ui/               Components that receive resolved data as props
```

## The api.ts File

```ts
export const listItemsFn = createServerFn({ method: "GET" })
  .validator(Schema.toStandardSchemaV1(ItemsQuery))
  .handler(async ({ data }) => {
    const { listItems } = await import("./items.server");
    return listItems(data);
  });

export const itemsListQueryOptions = (query: ItemsQuery) =>
  queryOptions({
    queryKey: itemKeys.list(query),
    queryFn: () => listItemsFn({ data: query }).then(unwrap),
  });
```

- Use `.validator(...)` with a Standard Schema object. The installed version marks `.inputValidator` as deprecated.
- Import the server module dynamically inside the handler. This keeps the server code out of the client bundle, also when tree shaking fails.
- Query keys are hierarchical arrays in one `itemKeys` object for each feature.

## Authorization And CSRF

- Attach a `createMiddleware({ type: "function" })` that resolves the session to each server function that reads private data. A `beforeLoad` guard on a route controls navigation. It is not a data boundary.
- Configure the CSRF middleware of Start for the server-function requests.
