import { ChartProvider } from "@kevin-courbet/aperture";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, Palette, Settings } from "lucide-react";
import { AppShell, type NavGroup } from "@/components/shell/app-shell";
import { appLocale, appTimeZone } from "@/lib/locale";

const nav: ReadonlyArray<NavGroup> = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/items", label: "Items", icon: Package },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/design-kit", label: "Design kit", icon: Palette },
    ],
  },
];

/**
 * Pathless layout for every signed-in page. Add the auth guard in beforeLoad
 * and return the session into context. Server functions still check auth
 * themselves; beforeLoad is not a data boundary.
 */
export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { theme } = Route.useRouteContext();
  return (
    <ChartProvider locale={appLocale} timeZone={appTimeZone}>
      <AppShell appName="Internal app" theme={theme} nav={nav}>
        <Outlet />
      </AppShell>
    </ChartProvider>
  );
}
