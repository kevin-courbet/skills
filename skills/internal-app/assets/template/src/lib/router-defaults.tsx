import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RouterProvider as AriaRouterProvider } from "react-aria-components";
import { RouteError, RouteNotFound } from "@/components/shell/route-error";

/** getRouter runs once per request on the server, so each request gets its own cache. */
export function createQueryClient(
  options: { readonly onError?: (error: unknown) => void } = {},
): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: options.onError }),
    mutationCache: new MutationCache({ onError: options.onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: import.meta.env.SSR ? 0 : 1,
      },
    },
  });
}

/** Routes react-aria links, menu items, and breadcrumbs through the router. */
function AriaRouterBridge({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  return (
    <AriaRouterProvider navigate={(href) => void router.navigate({ href })}>
      {children}
    </AriaRouterProvider>
  );
}

/** Spread into createRouter before the app's own options. */
export const routerDefaults = {
  scrollRestoration: true,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  InnerWrap: AriaRouterBridge,
} as const;
