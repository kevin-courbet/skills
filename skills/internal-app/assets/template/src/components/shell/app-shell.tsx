import * as stylex from "@stylexjs/stylex";
import { Link, type LinkProps, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  type LucideIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Button as AriaButton, Disclosure, DisclosurePanel } from "react-aria-components";
import { Button } from "@/components/ui/button";
import {
  type CommandGroup,
  CommandPalette,
  CommandPaletteProvider,
  useCommandPaletteShortcut,
} from "@/components/ui/command-palette";
import { Kbd } from "@/components/ui/layout";
import { Sheet } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toaster";
import {
  color,
  font,
  layer,
  media,
  motion,
  radius,
  shadow,
  size,
  space,
} from "@/styles/tokens.stylex";
import { NavLink } from "./nav-link";
import { RouteBreadcrumbs } from "./route-breadcrumbs";
import { ThemeSwitch } from "./theme-switch";

export interface NavItem {
  readonly to: LinkProps["to"];
  readonly params?: LinkProps["params"];
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
  /** Short context under the app name, such as the environment or the tenant. */
  readonly environment?: string;
  readonly nav: ReadonlyArray<NavGroup>;
  /** Global actions at the end of the top bar, such as a user menu. */
  readonly actions?: ReactNode;
  /** Quiet links at the bottom of the sidebar, such as help or system status. */
  readonly sidebarFooter?: ReactNode;
  /**
   * App-wide actions in the command palette, listed before the navigation
   * items. Page-specific actions stay on their page.
   */
  readonly commands?: ReadonlyArray<CommandGroup>;
  readonly children: ReactNode;
}

/** Element id of the scrolling page region. The router resets it to the top on navigation. */
export const mainContentId = "main-content";

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
        <Disclosure key={group.label} defaultExpanded {...stylex.props(styles.group)}>
          {({ isExpanded }) => (
            <>
              <AriaButton slot="trigger" {...stylex.props(styles.groupTrigger)}>
                {group.label}
                <ChevronDown
                  aria-hidden
                  {...stylex.props(styles.groupChevron, !isExpanded && styles.groupChevronClosed)}
                />
              </AriaButton>
              <DisclosurePanel {...stylex.props(styles.groupItems)}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    params={item.params}
                    icon={item.icon}
                    exact={item.exact}
                    onNavigate={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </nav>
  );
}

function Brand({
  appName,
  environment,
}: {
  readonly appName: string;
  readonly environment?: string;
}) {
  return (
    <Link to="/" {...stylex.props(styles.brand)}>
      <span aria-hidden {...stylex.props(styles.brandMark)}>
        {appName.slice(0, 1)}
      </span>
      <span {...stylex.props(styles.brandText)}>
        <span {...stylex.props(styles.brandName)}>{appName}</span>
        {environment ? <span {...stylex.props(styles.brandContext)}>{environment}</span> : null}
      </span>
    </Link>
  );
}

/**
 * Sidebar on the frame color and the page in a raised panel next to it. The
 * panel holds the top bar with breadcrumbs and scrolls on its own. Below the
 * md breakpoint the sidebar moves into a sheet opened from the top bar.
 */
export function AppShell({
  appName,
  environment,
  nav,
  actions,
  sidebarFooter,
  commands = [],
  children,
}: AppShellProps) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isSidebarHidden, setSidebarHidden] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const shortcut = useCommandPaletteShortcut();
  const paletteControls = useMemo(() => ({ open: () => setPaletteOpen(true) }), []);
  const paletteGroups: ReadonlyArray<CommandGroup> = [
    ...commands,
    ...nav.map((group) => ({
      label: group.label,
      commands: group.items.map((item) => ({
        id: `nav:${group.label}:${item.label}`,
        label: item.label,
        icon: item.icon,
        keywords: [group.label],
        onAction: () => void navigate({ to: item.to, params: item.params }),
      })),
    })),
  ];
  const footer = (
    <div {...stylex.props(styles.sidebarFooter)}>
      <div {...stylex.props(styles.sidebarFooterLinks)}>{sidebarFooter}</div>
      <ThemeSwitch />
    </div>
  );
  return (
    <div {...stylex.props(styles.root, isSidebarHidden && styles.rootSidebarHidden)}>
      <aside {...stylex.props(styles.sidebar, isSidebarHidden && styles.sidebarHidden)}>
        <div {...stylex.props(styles.sidebarHeader)}>
          <Brand appName={appName} environment={environment} />
          <Button
            intent="ghost"
            size="sm"
            iconOnly
            aria-label="Hide sidebar"
            onPress={() => setSidebarHidden(true)}
          >
            <PanelLeftClose aria-hidden {...stylex.props(styles.icon)} />
          </Button>
        </div>
        <Navigation nav={nav} />
        {footer}
      </aside>
      <div {...stylex.props(styles.column, isSidebarHidden && styles.columnSidebarHidden)}>
        <div {...stylex.props(styles.panel)}>
          <header {...stylex.props(styles.topbar)}>
            <div {...stylex.props(styles.topbarStart)}>
              <Button
                intent="ghost"
                size="sm"
                iconOnly
                aria-label="Open navigation"
                onPress={() => setNavOpen(true)}
                style={styles.mobileOnly}
              >
                <Menu aria-hidden {...stylex.props(styles.icon)} />
              </Button>
              {isSidebarHidden ? (
                <Button
                  intent="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Show sidebar"
                  onPress={() => setSidebarHidden(false)}
                  style={styles.desktopOnly}
                >
                  <PanelLeftOpen aria-hidden {...stylex.props(styles.icon)} />
                </Button>
              ) : null}
              <RouteBreadcrumbs />
            </div>
            <div {...stylex.props(styles.topbarActions)}>
              <Button
                intent="ghost"
                size="sm"
                aria-label="Search pages and actions"
                aria-keyshortcuts="Meta+K Control+K"
                onPress={() => setPaletteOpen(true)}
              >
                <Search aria-hidden {...stylex.props(styles.icon)} />
                <span {...stylex.props(styles.searchLabel)}>Search</span>
                <span {...stylex.props(styles.searchShortcut)}>
                  <Kbd>{shortcut}</Kbd>
                </span>
              </Button>
              {actions}
            </div>
          </header>
          <main
            id={mainContentId}
            data-scroll-restoration-id={mainContentId}
            {...stylex.props(styles.main)}
          >
            <CommandPaletteProvider value={paletteControls}>{children}</CommandPaletteProvider>
          </main>
        </div>
      </div>
      <Sheet isOpen={isNavOpen} onOpenChange={setNavOpen} side="left" size="sm" title={appName}>
        <div {...stylex.props(styles.sheetNav)}>
          <Navigation nav={nav} onNavigate={() => setNavOpen(false)} />
          {footer}
        </div>
      </Sheet>
      <CommandPalette groups={paletteGroups} isOpen={isPaletteOpen} onOpenChange={setPaletteOpen} />
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
    // One full-height row; the panel scrolls inside it, never the document.
    gridTemplateRows: "minmax(0, 1fr)",
    height: "100dvh",
    backgroundColor: color.frame,
  },
  rootSidebarHidden: { gridTemplateColumns: "minmax(0, 1fr)" },
  sidebar: {
    display: { default: "none", [media.md]: "flex" },
    flexDirection: "column",
    gap: space.lg,
    minHeight: 0,
    overflowY: "auto",
    paddingBlock: space.sm,
    paddingInline: space.sm,
  },
  sidebarHidden: { display: "none" },
  sidebarHeader: { display: "flex", alignItems: "center", gap: space.xs },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    flex: "1",
    minWidth: 0,
    height: size.controlLg,
    paddingInline: space.xs,
    borderRadius: radius.lg,
    color: color.text,
    textDecoration: "none",
    backgroundColor: { default: "transparent", ":hover": color.frameHover },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  brandMark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.iconLg,
    height: size.iconLg,
    flexShrink: 0,
    borderRadius: radius.sm,
    backgroundColor: color.text,
    color: color.textInverse,
    fontSize: font.xs,
    fontWeight: font.semibold,
    lineHeight: "1",
  },
  brandText: { display: "flex", flexDirection: "column", minWidth: 0 },
  brandName: {
    fontSize: font.md,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  brandContext: {
    fontSize: font.xs,
    color: color.textMuted,
    lineHeight: font.leadingTight,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nav: { display: "flex", flexDirection: "column", gap: space.md, flex: "1" },
  group: { display: "flex", flexDirection: "column", gap: "1px" },
  groupTrigger: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    alignSelf: "flex-start",
    height: size.controlSm,
    paddingInline: space.sm,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.frameHover },
    color: { default: color.textFaint, ":hover": color.textMuted },
    fontSize: font.sm,
    fontWeight: font.medium,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  groupChevron: {
    width: size.iconSm,
    height: size.iconSm,
    transitionProperty: "transform",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    transitionTimingFunction: motion.ease,
  },
  groupChevronClosed: { transform: "rotate(-90deg)" },
  groupItems: { display: "flex", flexDirection: "column", gap: "1px" },
  sidebarFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.xs,
    paddingTop: space.sm,
  },
  sidebarFooterLinks: { display: "flex", alignItems: "center", gap: space.xs, minWidth: 0 },
  sheetNav: { display: "flex", flexDirection: "column", gap: space.lg, minHeight: "100%" },
  column: {
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    paddingTop: { default: 0, [media.md]: size.frameGap },
    paddingBottom: { default: 0, [media.md]: size.frameGap },
    paddingInlineEnd: { default: 0, [media.md]: size.frameGap },
  },
  columnSidebarHidden: { paddingInlineStart: { default: 0, [media.md]: size.frameGap } },
  panel: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: color.page,
    borderWidth: { default: 0, [media.md]: "1px" },
    borderStyle: "solid",
    borderColor: color.borderSubtle,
    borderRadius: { default: 0, [media.md]: radius.xl },
    boxShadow: { default: "none", [media.md]: shadow.frame },
  },
  topbar: {
    zIndex: layer.sticky,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    flexShrink: 0,
    height: size.topbar,
    paddingInline: { default: space.md, [media.md]: space.lg },
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  topbarStart: { display: "flex", alignItems: "center", gap: space.xs, minWidth: 0, flex: "1" },
  mobileOnly: { display: { default: "inline-flex", [media.md]: "none" } },
  desktopOnly: { display: { default: "none", [media.md]: "inline-flex" } },
  icon: { width: size.icon, height: size.icon },
  topbarActions: { display: "flex", alignItems: "center", gap: space.xs },
  searchLabel: { display: { default: "none", [media.sm]: "inline" }, color: color.textMuted },
  searchShortcut: { display: { default: "none", [media.md]: "inline-flex" } },
  // Positioned so visually hidden, absolutely positioned content stays inside the scroller.
  main: { position: "relative", flex: "1", minWidth: 0, minHeight: 0, overflowY: "auto" },
});
