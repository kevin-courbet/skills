import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import {
  useRouter,
  createSerializationAdapter,
  createRouterConfig,
  SearchParamError,
} from "@tanstack/react-router";
import { Schema } from "effect";
import type { ReactNode } from "react";
import { RouterProvider as AriaRouterProvider } from "react-aria-components";
import { RouteError, RouteNotFound } from "@/components/shell/route-error";
import { WireError, isWireError } from "@/lib/wire-errors";

const decodeSearchParamError = Schema.decodeUnknownSync(Schema.Struct({ message: Schema.String }));
const searchParamErrorAdapter = createSerializationAdapter({
  key: "InternalAppSearchParamError",
  test: (value): value is SearchParamError => value instanceof SearchParamError,
  toSerializable: (error) => ({ message: error.message }),
  fromSerializable: (value) => new SearchParamError(decodeSearchParamError(value).message),
});
export const routerConfig = createRouterConfig({
  serializationAdapters: [
    searchParamErrorAdapter,
    createSerializationAdapter({
      key: "InternalAppWireError",
      test: (value): value is WireError => value instanceof Error && isWireError(value),
      toSerializable: Schema.encodeSync(WireError),
      fromSerializable: Schema.decodeUnknownSync(WireError),
    }),
  ],
});

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
  serializationAdapters: routerConfig.serializationAdapters,
  scrollRestoration: true,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  InnerWrap: AriaRouterBridge,
} as const;
