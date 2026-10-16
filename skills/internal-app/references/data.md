# Data: Effect Server, Server Functions, Queries, Forms

## Choose the boundary

Use Effect RPC when an independent backend owns the data or workflows. Read `rpc.md` before implementation.
The feature `api.ts` remains the route-facing boundary and owns the same query options for SSR and client reads.
For a feature owned by the Start server, use the server-function pattern in this document.
Do not add server-function wrappers around an existing RPC backend merely to satisfy the template layout.

## Error ownership

Configure `createQueryClient({ onError })` with the application's error reporter. Both `QueryCache` and `MutationCache` use that callback. Exclude expected workflow failures and preserve the ownership of server-correlated incidents.

Wrap `RouteError` in an app-owned error component when the app needs diagnostic correlation. Pass `onError` for reporting and `describeError` for final presentation. The reporter must deduplicate errors that also reach a query or mutation cache.

Export `unexpectedFailureMessage` from the app-owned `src/lib/error-presentation.ts`. The kit's `failureMessage` uses it for unexpected action errors, including theme-save errors. Keep diagnostic references in this final presentation function. Expected wire errors retain their precise messages.

Own HTTP observability in the application's Start server entry. Record handled loader failures at that boundary, including failures that return an error page. Preserve request references through SSR hydration.

Export `recordEffectCause` from the app-owned `src/server/runtime.server.ts`. Connect it to the application's request boundary. `runServerFn` sends each full failed cause to this recorder before serialization. The starter recorder writes safe reason counts to stderr. Replace that starter recorder with the application's boundary recorder when you add HTTP observability.

Configure global function middleware in the app-owned `src/start.ts` to observe validation and handler exceptions before serialization. Start can serialize a rejected server function with HTTP 200. Status-only HTTP classification therefore does not own these failures. Keep the original error and its request reference through the app's serialization adapter and client middleware.

Theme validation throws the kit's schema-backed `ValidationError`. The wire-error serializer preserves that expected class, and `failureMessage` provides its precise copy. Configure the Start CSRF middleware for server-function requests.

Keep `AppDocument` in the root route's `shellComponent`. The document and application scripts must remain available when `beforeLoad` fails. Use the system theme for an initial theme-lookup error until the lookup succeeds. `AppDocument` uses the recovered document snapshot unless the user selects a theme.

`routerDefaults.serializationAdapters` preserves `SearchParamError` through SSR hydration. Register `config: typeof routerConfig` in the router's `Register` interface so serializer types match the runtime configuration. Keep these adapters when an application adds its own. Otherwise the router's shallow error serializer loses the expected validation class and the reset-filters action.

## Effect 4 On The Server

Use the Effect 4 API that the installed package exposes. Verify names against
`node_modules/effect/dist/*.d.ts` before using anything not listed here.

- Services: `class ItemsService extends Context.Service<ItemsService, Shape>()("@app/ItemsService")` with a `static readonly layer = Layer.effect(ItemsService, Effect.gen(...))`. Never `Context.Tag`, `Effect.Service`, or `ServiceMap`.
- Composition: `Layer.mergeAll(...)` and `Layer.provideMerge(...)` into one `AppLayer`; `export const runtime = ManagedRuntime.make(AppLayer)` in `src/server/runtime.server.ts`. One runtime per process, disposed on `SIGTERM`.
- Config: `Config.all({ name: Config.String("APP_NAME").pipe(Config.withDefault("x")) })` exposed as a service through `Layer.effect(AppConfig, config)`. Secrets use `Config.Redacted`.
- Workflows: `Effect.gen` inline; `Effect.fn("Service.method")` for reusable traced functions. Do not wrap an `Effect.gen` in a function that only returns it.
- Internal errors: `Data.TaggedError` in `src/server/errors.ts`.
- Wire errors: `Schema.TaggedError` classes in `src/lib/wire-errors.ts`, joined in `WireError = Schema.Union([...])`. They serialize with their fields.
- Error handling: `Effect.catchTag`, `Effect.catchTags`, `Effect.mapError`. Check `Cause.isFailReason`, `Cause.isDieReason`, `Exit.isSuccess` before writing a custom guard.
- Schema: `Schema.Struct`, `Schema.Literals([...])`, `Schema.optionalKey`, `Schema.Array`, checks through `Schema.check(Schema.isMinLength(2, { message: "..." }))`. Decoding: `Schema.decodeUnknownResult`, `Schema.decodeUnknownEffect`. Standard Schema: `Schema.toStandardSchemaV1(schema)`.

## The Server-Function Boundary

`src/server/server-fn.server.ts` exports `runServerFn`:

```ts
export async function runServerFn<A, E extends WireError>(
  effect: Effect.Effect<A, E, AppServices>,
): Promise<ServerResult<A, WireErrorEncoded>>
```

- The effect may only fail with `WireError`. An unmapped internal error is a type error at the call site. Map it with `Effect.mapError` before the boundary.
- Expected failures return `{ ok: false, error }` with the encoded tagged error. Defects, interruptions, and layer failures throw. Function middleware records these failures before Start serializes the response. Nothing is swallowed.
- On the client, `unwrap(result)` from `src/lib/server-result.ts` returns the value or throws `ServerFnError` carrying the typed error. Use it in `queryFn` and `mutationFn` so TanStack Query sees a thrown error.
- Branch on failures with `isServerFnError<WireErrorEncoded>(error) && error.error._tag === "ConflictError"`.
- Show a failure to users with `failureMessage(error)`. It returns the wire error's own `message`, a "no longer exists" text for `NotFoundError`, or a generic retry text for anything unexpected. Unexpected details stay in the server log.
- Wire errors in `src/lib/wire-errors.ts` are `NotFoundError`, `ConflictError`, `ValidationError`, and `ForbiddenError`. They are kit-owned. If an app needs another expected failure, add it to the kit.

## Feature Module Shape

```
features/items/
  schemas.ts        Item, CreateItem, ItemsQuery, ItemsPage (Effect Schema, client-safe)
  filters.ts        Filter fields, the route search schema, and the search-to-query mapping
  api.ts            createServerFn wrappers, query keys, queryOptions factories
  items.server.ts   Functions that build the Effect and call runServerFn
  ui/               Components that receive resolved data as props
```

`api.ts` pattern:

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

- `.validator(...)` with a Standard Schema object. The installed version reports `.inputValidator` as deprecated.
- The dynamic import inside the handler keeps server code out of the client bundle without relying on tree shaking.
- Query keys are hierarchical arrays in one `itemKeys` object per feature.
- Auth: attach a `createMiddleware({ type: "function" })` that resolves the session to every server function that reads private data. A route `beforeLoad` guard is for navigation, not a data boundary.

## Routes

```ts
export const Route = createFileRoute("/_app/items/")({
  validateSearch: Schema.toStandardSchemaV1(ItemsSearch),
  search: { middlewares: [stripSearchParams(itemsQueryDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(itemsListQueryOptions(itemsQueryFromSearch(deps)));
    return { now: Date.now() };
  },
  component: ItemsPage,
});

function ItemsPage() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(itemsListQueryOptions(itemsQueryFromSearch(search)));
}
```

- Search params are schema-validated. Every field is `optionalKey` with a default in `itemsQueryDefaults`, and `stripSearchParams` keeps the URL clean.
- Filter params come from `filterSearchFields` (see `components.md`, Filters in the URL). `itemsQueryFromSearch` in `features/items/filters.ts` turns the validated search into the server query.
- The loader calls `ensureQueryData` with the same factory the component reads through `useSuspenseQuery`. SSR data never shows a loading state.
- Return values that must be stable across SSR and hydration (for example a reference time for relative dates) from the loader.
- Update search with `navigate({ search: (prev) => ({ ...prev, q }), replace: true })`. Reset paging when a filter changes.
- Keep `routeTree.gen.ts` generated; never edit it.
- `routerDefaults` sets `defaultErrorComponent` and `defaultNotFoundComponent` to the shell components. `SearchParamError` renders a "Reset filters" action.
- Set `staticData: { crumb: "Items" }` on a route to show it in the breadcrumbs.

Detail routes map a missing record to the not-found page and name the
breadcrumb after the record:

```ts
export const Route = createFileRoute("/_app/items/$itemId")({
  loader: async ({ context, params }) => {
    try {
      const item = await context.queryClient.ensureQueryData(itemQueryOptions(params.itemId));
      return { crumb: item.name };
    } catch (error) {
      if (isServerFnError<WireErrorEncoded>(error) && error.error._tag === "NotFoundError") throw notFound();
      throw error;
    }
  },
  component: ItemPage,
});
```

## Mutations

```ts
const create = useMutation({
  mutationFn: (input: CreateItem) => createItemFn({ data: input }).then(unwrap),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: itemKeys.all }),
});
```

- Invalidate by key prefix. Do not call `router.invalidate()` for query data.
- Show expected failures inline where the user acted (form error, row message). Use a toast only when there is no inline place.
- Do not toast success when the list, row, or dialog closing already shows the result.
- Optimistic updates are optional for internal tools. Add them only for interactions that feel slow.

Destructive mutations run from `ConfirmDialog`. Pass `mutateAsync` as
`onConfirm`; a rejection keeps the dialog open and shows `failureMessage`.
After a delete, remove the detail query, invalidate the list keys, and
navigate to the list:

```ts
const remove = useMutation({
  mutationFn: () => deleteItemFn({ data: { id: itemId } }).then(unwrap),
  onSuccess: async () => {
    queryClient.removeQueries({ queryKey: itemKeys.detail(itemId) });
    await queryClient.invalidateQueries({ queryKey: itemKeys.all });
    await navigate({ to: "/items" });
  },
});
```

## Forms

TanStack Form with Effect Schema through Standard Schema:

```ts
const form = useForm({
  defaultValues: { name: "", owner: "", status: "active" as ItemStatus, amount: 0 },
  validators: { onSubmit: Schema.toStandardSchemaV1(CreateItem) },
  onSubmit: async ({ value }) => {
    await create.mutateAsync(value);
  },
});
```

- Field errors arrive as Standard Schema issue objects. Pass `field.state.meta.errors` to `fieldError` from `src/lib/form.ts`.
- Bind RAC fields: `value={field.state.value}`, `onChange={field.handleChange}`, `onBlur={field.handleBlur}`, `errorMessage={...}`.
- Use `NumberField` for numbers; its value is a number and it formats with the app locale.
- Give the `<form>` an `id`. Put the primary action in the dialog footer as `<Button type="submit" form={formId}>` inside `form.Subscribe` reading `canSubmit` and `isSubmitting`. Enter in any field submits through the native form.
- Catch the mutation failure in `onSubmit` and show `failureMessage(error)` above the footer. Keep the input.
- Reset the form when the dialog closes.

## Locale And Time

`src/lib/locale.ts` fixes one locale and one time zone and exports the
formatters. `AppDocument` gives the locale to react-aria fields, and
`ChartProvider` in `_app.tsx` receives the same values. Do not create `Intl`
formatters inside components; `check` fails on them. Date fields exchange ISO
date strings, so schemas use `Schema.String` with a date check, not calendar
objects.
