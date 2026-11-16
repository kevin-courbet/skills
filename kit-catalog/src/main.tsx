import "@/styles/app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  useRouter,
} from "@tanstack/react-router";
import { type ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, RouterProvider as AriaRouterProvider } from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { Catalog } from "./catalog";

// The catalog has one route. Kit links still need a router, so a memory history
// keeps their navigation inside the page and never changes the address bar.
const rootRoute = createRootRoute({ component: Catalog });

/**
 * Routes react-aria links, menu items, and breadcrumbs through the memory
 * history, as `routerDefaults` does in an app. The catalog cannot import
 * `routerDefaults`, because it imports the app shell and ThemeSwitch.
 */
function AriaRouterBridge({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  return (
    <AriaRouterProvider navigate={(href) => void router.navigate({ href })}>
      {children}
    </AriaRouterProvider>
  );
}

const router = createRouter({
  routeTree: rootRoute,
  InnerWrap: AriaRouterBridge,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});
const queryClient = new QueryClient();

const container = document.getElementById("root");
if (container === null) throw new Error("The catalog page has no #root element.");

createRoot(container).render(
  <StrictMode>
    <I18nProvider locale={appLocale}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
);
