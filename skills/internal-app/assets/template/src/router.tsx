import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createQueryClient, routerDefaults, routerConfig } from "@/lib/router-defaults";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = createQueryClient();
  const router = createRouter({ ...routerDefaults, routeTree, context: { queryClient } });
  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    config: typeof routerConfig;
    router: ReturnType<typeof getRouter>;
  }
}
