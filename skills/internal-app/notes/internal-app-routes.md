---
id: internal-app-routes
topic: internal-app
summary: Write a list route with validated search params and a loader that prefetches the query of the page, and a detail route that maps a missing record to the not-found page and names its breadcrumb.
keywords: [route, file route, createFileRoute, loader, ensureQueryData, useSuspenseQuery, search params, validateSearch, stripSearchParams, detail route, not found, breadcrumb, crumb, routeTree, navigate]
related: [internal-app-server-functions, internal-app-url-filters, internal-app-states, internal-app-page-patterns]
---

# Internal App Routes

Routes are app files in `src/routes/`. The template route `src/routes/_app/items/` shows each part.

## List Routes

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

- The loader calls `ensureQueryData` with the same factory that the component reads through `useSuspenseQuery`. Thus SSR data never shows a loading state.
- When a value must be the same in SSR and in the hydration, return it from the loader. An example is the reference time of relative dates.

## Search Params

- A schema validates the search params. Each field is `optionalKey`, with its default in `itemsQueryDefaults`. `stripSearchParams` removes the defaults from the URL.
- The filter params come from `filterSearchFields`. Run `design read internal-app-url-filters`. `itemsQueryFromSearch` in `features/items/filters.ts` changes the validated search into the server query.
- Change the search with `navigate({ search: (prev) => ({ ...prev, q }), replace: true })`. When a filter changes, reset the page number.

## Detail Routes

A detail route maps a missing record to the not-found page, and names the breadcrumb after the record:

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

## Router Setup

- The build generates `routeTree.gen.ts`. Never edit it.
- `routerDefaults` sets `defaultErrorComponent` and `defaultNotFoundComponent` to the shell components. Run `internal-app docs RouteError`.
- To show a route in the breadcrumbs, set `staticData: { crumb: "Items" }` on it.
