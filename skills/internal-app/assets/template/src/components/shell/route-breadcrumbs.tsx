/**
 * The breadcrumbs in the top bar, made from the crumbs of the matched routes.
 *
 * @layer shell
 * @keywords breadcrumbs from routes, route crumb, staticData crumb, record name in breadcrumbs, location trail
 * @related Breadcrumbs, AppShell
 * @notes navigation
 *
 * `AppShell` renders it in the top bar. Do not render it in a page, and do not
 * build a breadcrumb trail by hand: give each route a crumb.
 *
 * ## Behavior
 * - Each matched route that sets `staticData.crumb`, or whose loader returns
 *   `{ crumb }`, adds one item. The loader crumb wins, so a detail route can
 *   show the name of its record.
 * - It renders nothing when no route has a crumb.
 *
 * ## Rules
 * - When the children of a route need the crumb of the parent, give the parent
 *   a layout route, such as `items/route.tsx`.
 *
 * ## Example
 * ```tsx
 * // items/route.tsx gives the list and its children the "Items" crumb.
 * export const Route = createFileRoute("/_app/items")({ staticData: { crumb: "Items" } });
 *
 * // items/$itemId.tsx names the record.
 * export const Route = createFileRoute("/_app/items/$itemId")({
 *   loader: async ({ context, params }) => {
 *     const item = await context.queryClient.ensureQueryData(itemQueryOptions(params.itemId));
 *     return { crumb: item.name };
 *   },
 * });
 * ```
 */
import { useMatches } from "@tanstack/react-router";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/primitives/breadcrumbs";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** Breadcrumb label. A loader can replace it by returning { crumb }. */
    crumb?: string;
  }
}

function loaderCrumb(loaderData: unknown): string | undefined {
  if (typeof loaderData !== "object" || loaderData === null) return undefined;
  const crumb: unknown = Reflect.get(loaderData, "crumb");
  return typeof crumb === "string" ? crumb : undefined;
}

/** Breadcrumbs from the matched routes that declare staticData.crumb or return a crumb. */
export function RouteBreadcrumbs() {
  const matches = useMatches();
  const items: Array<BreadcrumbItem> = [];
  for (const match of matches) {
    const label = loaderCrumb(match.loaderData) ?? match.staticData.crumb;
    if (label !== undefined) items.push({ id: match.id, label, href: match.pathname });
  }
  if (items.length === 0) return null;
  return <Breadcrumbs items={items} />;
}
