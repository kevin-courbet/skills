import { useMatches } from "@tanstack/react-router";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";

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
