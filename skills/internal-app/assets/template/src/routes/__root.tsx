import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AppDocument } from "@/components/shell/app-document";
import { getThemeChoice } from "@/lib/theme";
import type { ReactNode } from "react";

interface RouterContext {
  readonly queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => ({ theme: await getThemeChoice() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Internal app" },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
});

function RootDocument({ children }: { readonly children: ReactNode }) {
  const { theme } = Route.useRouteContext();
  return <AppDocument theme={theme ?? "system"}>{children}</AppDocument>;
}
