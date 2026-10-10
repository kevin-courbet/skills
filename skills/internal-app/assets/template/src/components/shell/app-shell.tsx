import * as stylex from "@stylexjs/stylex";
import { Link, type LinkProps } from "@tanstack/react-router";
import { type LucideIcon, Menu } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toaster";
import type { ThemeChoice } from "@/lib/theme";
import { color, font, layer, media, size, space } from "@/styles/tokens.stylex";
import { NavLink } from "./nav-link";
import { RouteBreadcrumbs } from "./route-breadcrumbs";
import { ThemeSwitch } from "./theme-switch";

export interface NavItem {
  readonly to: LinkProps["to"];
  readonly label: string;
  readonly icon: LucideIcon;
  /** Match only this exact path, for the index route. */
  readonly exact?: boolean;
}

export interface NavGroup {
  /** Group label by user goal, such as "Workspace" or "System". */
  readonly label: string;
  readonly items: ReadonlyArray<NavItem>;
}

export interface AppShellProps {
  readonly appName: string;
  readonly theme: ThemeChoice;
  readonly nav: ReadonlyArray<NavGroup>;
  /** Global actions next to the theme switch, such as a user menu. */
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

function Navigation({
  nav,
  onNavigate,
}: {
  readonly nav: ReadonlyArray<NavGroup>;
  readonly onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main" {...stylex.props(styles.nav)}>
      {nav.map((group) => (
        <div key={group.label} {...stylex.props(styles.group)}>
          <span {...stylex.props(styles.groupLabel)}>{group.label}</span>
          {group.items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              icon={item.icon}
              exact={item.exact}
              onNavigate={onNavigate}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

/**
 * Sidebar, top bar with breadcrumbs, and the scrolling page region. Below the
 * md breakpoint the sidebar moves into a sheet opened from the top bar.
 */
export function AppShell({ appName, theme, nav, actions, children }: AppShellProps) {
  const [isNavOpen, setNavOpen] = useState(false);
  return (
    <div {...stylex.props(styles.root)}>
      <aside {...stylex.props(styles.sidebar)}>
        <Link to="/" {...stylex.props(styles.brand)}>
          {appName}
        </Link>
        <Navigation nav={nav} />
      </aside>
      <div {...stylex.props(styles.column)}>
        <header {...stylex.props(styles.topbar)}>
          <div {...stylex.props(styles.topbarStart)}>
            <Button
              intent="ghost"
              size="sm"
              iconOnly
              aria-label="Open navigation"
              onPress={() => setNavOpen(true)}
              style={styles.menuButton}
            >
              <Menu aria-hidden {...stylex.props(styles.menuIcon)} />
            </Button>
            <RouteBreadcrumbs />
          </div>
          <div {...stylex.props(styles.topbarActions)}>
            {actions}
            <ThemeSwitch value={theme} />
          </div>
        </header>
        <main {...stylex.props(styles.main)}>{children}</main>
      </div>
      <Sheet isOpen={isNavOpen} onOpenChange={setNavOpen} side="left" size="sm" title={appName}>
        <Navigation nav={nav} onNavigate={() => setNavOpen(false)} />
      </Sheet>
      <Toaster />
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.md]: `${size.sidebar} minmax(0, 1fr)`,
    },
    minHeight: "100dvh",
  },
  sidebar: {
    display: { default: "none", [media.md]: "flex" },
    flexDirection: "column",
    gap: space.md,
    position: "sticky",
    top: 0,
    height: "100dvh",
    overflowY: "auto",
    paddingBlock: space.md,
    paddingInline: space.sm,
    backgroundColor: color.subtle,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: color.borderSubtle,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    height: size.controlMd,
    paddingInline: space.sm,
    fontSize: font.md,
    fontWeight: font.semibold,
    color: color.text,
    textDecoration: "none",
  },
  nav: { display: "flex", flexDirection: "column", gap: space.md },
  group: { display: "flex", flexDirection: "column", gap: "2px" },
  groupLabel: {
    paddingInline: space.sm,
    paddingBottom: space.xs,
    fontSize: font.xs,
    fontWeight: font.medium,
    color: color.textFaint,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  column: { display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: layer.sticky,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    height: size.topbar,
    paddingInline: { default: space.md, [media.md]: space.xxl },
    backgroundColor: color.page,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  topbarStart: { display: "flex", alignItems: "center", gap: space.sm, minWidth: 0, flex: "1" },
  menuButton: { display: { default: "inline-flex", [media.md]: "none" } },
  menuIcon: { width: size.icon, height: size.icon },
  topbarActions: { display: "flex", alignItems: "center", gap: space.xs },
  main: { flex: "1", minWidth: 0 },
});
