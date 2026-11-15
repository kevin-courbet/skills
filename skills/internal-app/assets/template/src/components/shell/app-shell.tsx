/**
 * The frame of every signed-in page: the sidebar navigation, the top bar, and the page in a recessed panel.
 *
 * @layer shell
 * @keywords app shell, sidebar navigation, side nav, app frame, top bar, layout of the app, navigation groups, brand, command palette, mobile navigation
 * @related NavLink, RouteBreadcrumbs, ThemeSwitch, CommandPalette, Toaster, Sheet, Density, Layout
 * @notes navigation, responsive, density, internal-app-touch-work-view, internal-app-page-patterns
 *
 * The `_app` layout route renders it once around the `Outlet`. Do not render
 * it in a page, and do not build a second sidebar or top bar: a page starts
 * with `Page` from `Layout`. For the `<html>` document, use `AppDocument`.
 *
 * ## Behavior
 * - The sidebar is on the lighter `frame` color. The page panel is inset by
 *   `size.frameGap` and scrolls on its own, in the element with the id
 *   `mainContentId`.
 * - The top bar holds the breadcrumbs, the search button, the `actions`, and
 *   the `ThemeSwitch`.
 * - "Hide sidebar" gives the panel the full width, and the top bar then shows
 *   "Show sidebar". The choice does not persist after a reload.
 * - The shell mounts the `CommandPalette` and the `Toaster`. Do not mount
 *   them again.
 *
 * ## Navigation
 * - Each group of `nav` is a collapsible section of the sidebar, open at
 *   first. `NavLink` renders each item.
 * - The brand block links to "/".
 * - The command palette lists every navigation item under its group label,
 *   after `commands`. A search for the group label also finds the item. Pages
 *   open the palette with `useCommandPalette().open()`.
 *
 * ## Responsive
 * - Below `lg` (1024px), the sidebar moves into a left `Sheet` that the menu
 *   button of the top bar opens. A 240px sidebar takes 23% to 31% of a tablet
 *   in portrait, so the page gets that width. The sheet and the command
 *   palette keep the navigation one tap away.
 * - Below `md`, the panel loses its border, its radius, and its inset.
 * - Below `sm`, the page title has priority: the breadcrumbs show only the
 *   current page, and the search button shows only its icon. The shortcut
 *   keys of the search button show from `md`.
 *
 * ## Touch density
 * On a page with `density="touch"` on a touch device, which is a coarse
 * pointer or a window below `lg`, the sidebar stays in the sheet at every
 * width. The top bar, the sheet, and the top bar menus then take the touch
 * density. On a desktop with a mouse, the frame does not change, and only the
 * page content takes the touch density. See Touch density in
 * `references/styling.md`.
 *
 * ## Rules
 * - Give each group a unique label, and each item a unique label in its
 *   group. The labels are the keys of the items.
 * - Never put a banner in `sidebarFooter` or across the page.
 *
 * ## Example
 * ```tsx
 * // src/routes/_app.tsx
 * const nav: ReadonlyArray<NavGroup> = [
 *   {
 *     label: "Workspace",
 *     items: [
 *       { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
 *       { to: "/items", label: "Items", icon: Package },
 *     ],
 *   },
 *   { label: "System", items: [{ to: "/settings", label: "Settings", icon: Settings }] },
 * ];
 *
 * function AppLayout() {
 *   return (
 *     <ChartProvider locale={appLocale} timeZone={appTimeZone}>
 *       <AppShell appName="Repair desk" environment="Preview" nav={nav}>
 *         <Outlet />
 *       </AppShell>
 *     </ChartProvider>
 *   );
 * }
 * ```
 */
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
import { type ReactNode, useMemo, useState, useSyncExternalStore } from "react";
import { Button as AriaButton, Disclosure, DisclosurePanel } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { type Density, DensityProvider, ShellDensityProvider } from "@/components/ui/density";
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
  touchFont,
  touchSize,
} from "@/styles/tokens.stylex";
import { NavLink } from "./nav-link";
import { RouteBreadcrumbs } from "./route-breadcrumbs";
import { shellMarker } from "./shell.stylex";
import { ThemeSwitch } from "./theme-switch";

export interface NavItem {
  /** The route of the item. */
  readonly to: LinkProps["to"];
  /** The params of a typed dynamic route. */
  readonly params?: LinkProps["params"];
  /** The name of the page in the sidebar and in the command palette. */
  readonly label: string;
  /** A lucide icon before the label. */
  readonly icon: LucideIcon;
  /** Match only this exact path, for the index route. */
  readonly exact?: boolean;
}

export interface NavGroup {
  /** Group label by user goal, such as "Workspace" or "System". */
  readonly label: string;
  /** The pages of the group, in order. */
  readonly items: ReadonlyArray<NavItem>;
}

export type AppLogo = "initial" | "wordmark";

export interface AppShellProps {
  /** The name of the app in the brand block and the title of the navigation sheet. */
  readonly appName: string;
  /** Short context under the app name, such as the environment or the tenant. */
  readonly environment?: string;
  /**
   * How the app name reads in the sidebar. "initial" adds a square mark with the
   * first letter. "wordmark" sets the name alone in bold, for a brand whose logo is
   * its name in type.
   */
  readonly logo?: AppLogo;
  /** The groups of the sidebar navigation. */
  readonly nav: ReadonlyArray<NavGroup>;
  /**
   * Global actions at the end of the top bar, such as a user menu. Below the
   * sm breakpoint, they move to the top of the navigation sheet, so the page
   * title keeps the width of the top bar.
   */
  readonly actions?: ReactNode;
  /**
   * Quiet controls at the bottom of the sidebar, such as help, system status, or a
   * switcher for review data. Keep the page area for the page's own content.
   */
  readonly sidebarFooter?: ReactNode;
  /**
   * App-wide actions in the command palette, listed before the navigation
   * items. Page-specific actions stay on their page.
   */
  readonly commands?: ReadonlyArray<CommandGroup>;
  /** The page, usually the router `Outlet`. */
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
  logo,
}: {
  readonly appName: string;
  readonly environment?: string;
  readonly logo: AppLogo;
}) {
  return (
    <Link to="/" {...stylex.props(styles.brand)}>
      {logo === "initial" ? (
        <span aria-hidden {...stylex.props(styles.brandMark)}>
          {appName.slice(0, 1)}
        </span>
      ) : null}
      <span {...stylex.props(styles.brandText)}>
        <span {...stylex.props(styles.brandName, logo === "wordmark" && styles.brandWordmark)}>
          {appName}
        </span>
        {environment ? <span {...stylex.props(styles.brandContext)}>{environment}</span> : null}
      </span>
    </Link>
  );
}

/**
 * Sidebar on the lighter frame color and the page in a recessed panel next to it. The
 * panel holds the top bar with breadcrumbs and scrolls on its own. Below the
 * lg breakpoint the sidebar moves into a sheet opened from the top bar, so a
 * tablet in portrait gives its full width to the page.
 *
 * Below the sm breakpoint, the top bar shows only the current page in the
 * breadcrumbs, and the global actions move to the top of the sheet. Thus a
 * phone shows the full page title.
 *
 * A page with `density="touch"` is work at a bench or on a shared tablet,
 * where people stay on one page. On a touch device (a coarse pointer, or a
 * window below lg), the shell then keeps the sidebar in the sheet at every
 * width, and its top bar, sheet, and menus take the touch density. On a desktop
 * with a mouse, the frame does not change; only the page content is larger.
 */
export function AppShell({
  appName,
  environment,
  logo = "initial",
  nav,
  actions,
  sidebarFooter,
  commands = [],
  children,
}: AppShellProps) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isSidebarHidden, setSidebarHidden] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  // The top bar follows the page through CSS, which also works in the server render.
  // The sheet and the menus render in portals, which only this state reaches. They
  // open only after hydration, so the server value of the media query is never seen.
  const [pageDensity, setPageDensity] = useState<Density>("default");
  const isTouchDevice = useSyncExternalStore(subscribeTouchDevice, isTouchDeviceNow, () => false);
  const frameDensity: Density = pageDensity === "touch" && isTouchDevice ? "touch" : "default";
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
  const footer =
    sidebarFooter === undefined ? null : (
      <div {...stylex.props(styles.sidebarFooter)}>
        <div {...stylex.props(styles.sidebarFooterLinks)}>{sidebarFooter}</div>
      </div>
    );
  return (
    <div {...stylex.props(shellMarker, styles.root, isSidebarHidden && styles.rootSidebarHidden)}>
      <aside {...stylex.props(styles.sidebar, isSidebarHidden && styles.sidebarHidden)}>
        <div {...stylex.props(styles.sidebarHeader)}>
          <Brand appName={appName} environment={environment} logo={logo} />
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
          <DensityProvider density={frameDensity}>
            <header {...stylex.props(styles.topbar)}>
              <div {...stylex.props(styles.topbarStart)}>
                <Button
                  intent="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Open navigation"
                  onPress={() => setNavOpen(true)}
                  style={styles.navButton}
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
                    style={styles.showSidebarButton}
                  >
                    <PanelLeftOpen aria-hidden {...stylex.props(styles.icon)} />
                  </Button>
                ) : null}
                <RouteBreadcrumbs />
              </div>
              <div {...stylex.props(styles.topbarActions)}>
                {/* Drawn as a field, not a ghost button, so the palette reads as search at a glance. */}
                <AriaButton
                  aria-label="Search pages and actions"
                  aria-keyshortcuts="Meta+K Control+K"
                  onPress={() => setPaletteOpen(true)}
                  {...stylex.props(styles.searchField)}
                >
                  <Search aria-hidden {...stylex.props(styles.icon)} />
                  <span {...stylex.props(styles.searchPlaceholder)}>Search…</span>
                  <span {...stylex.props(styles.searchKeys)}>
                    {shortcut.split(" ").map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </span>
                </AriaButton>
                {actions === undefined ? null : (
                  <div {...stylex.props(styles.topbarSlot)}>{actions}</div>
                )}
                <ThemeSwitch />
              </div>
            </header>
          </DensityProvider>
          <main
            id={mainContentId}
            data-scroll-restoration-id={mainContentId}
            {...stylex.props(styles.main)}
          >
            <ShellDensityProvider onPageDensity={setPageDensity}>
              <CommandPaletteProvider value={paletteControls}>{children}</CommandPaletteProvider>
            </ShellDensityProvider>
          </main>
        </div>
      </div>
      <DensityProvider density={frameDensity}>
        <Sheet isOpen={isNavOpen} onOpenChange={setNavOpen} side="left" size="sm" title={appName}>
          <div {...stylex.props(styles.sheetNav)}>
            {actions === undefined ? null : (
              <div {...stylex.props(styles.sheetActions)}>{actions}</div>
            )}
            <Navigation nav={nav} onNavigate={() => setNavOpen(false)} />
            {footer}
          </div>
        </Sheet>
      </DensityProvider>
      <CommandPalette groups={paletteGroups} isOpen={isPaletteOpen} onOpenChange={setPaletteOpen} />
      <Toaster />
    </div>
  );
}

// The same condition as `media.belowLg` and `media.coarsePointer` in the styles below.
const touchDeviceQuery = "(max-width: 1023.98px), (pointer: coarse)";

function subscribeTouchDevice(onChange: () => void): () => void {
  const query = window.matchMedia(touchDeviceQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function isTouchDeviceNow(): boolean {
  return window.matchMedia(touchDeviceQuery).matches;
}

// Page in layout.tsx sets this attribute on the page of the shell. StyleX compiles
// `stylex.when.ancestor` only inside `stylex.create`, so each style calls it there.
const touchPageInShell = ':has([data-page-density="touch"])';

const styles = stylex.create({
  root: {
    // On a touch device, the top bar takes the control sizes and the type scale of a
    // touch page. The page sets the same values itself. On a desktop with a mouse,
    // the frame stays the same on every page, and only the page content changes.
    [size.controlSm]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.controlSm,
        [media.coarsePointer]: touchSize.controlSm,
      },
    },
    [size.controlMd]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.controlMd,
        [media.coarsePointer]: touchSize.controlMd,
      },
    },
    [size.controlLg]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.controlLg,
        [media.coarsePointer]: touchSize.controlLg,
      },
    },
    [size.iconSm]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.iconSm,
        [media.coarsePointer]: touchSize.iconSm,
      },
    },
    [size.icon]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.icon,
        [media.coarsePointer]: touchSize.icon,
      },
    },
    [size.iconLg]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.iconLg,
        [media.coarsePointer]: touchSize.iconLg,
      },
    },
    [size.topbar]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchSize.topbar,
        [media.coarsePointer]: touchSize.topbar,
      },
    },
    [font.xs]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.xs,
        [media.coarsePointer]: touchFont.xs,
      },
    },
    [font.sm]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.sm,
        [media.coarsePointer]: touchFont.sm,
      },
    },
    [font.md]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.md,
        [media.coarsePointer]: touchFont.md,
      },
    },
    [font.lg]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.lg,
        [media.coarsePointer]: touchFont.lg,
      },
    },
    [font.xl]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.xl,
        [media.coarsePointer]: touchFont.xl,
      },
    },
    [font.xxl]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.xxl,
        [media.coarsePointer]: touchFont.xxl,
      },
    },
    [font.xxxl]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.xxxl,
        [media.coarsePointer]: touchFont.xxxl,
      },
    },
    [font.display]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.display,
        [media.coarsePointer]: touchFont.display,
      },
    },
    [font.displayLg]: {
      default: null,
      [touchPageInShell]: {
        default: null,
        [media.belowLg]: touchFont.displayLg,
        [media.coarsePointer]: touchFont.displayLg,
      },
    },
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.lg]: {
        default: `${size.sidebar} minmax(0, 1fr)`,
        [touchPageInShell]: {
          default: `${size.sidebar} minmax(0, 1fr)`,
          [media.coarsePointer]: "minmax(0, 1fr)",
        },
      },
    },
    // One full-height row; the panel scrolls inside it, never the document.
    gridTemplateRows: "minmax(0, 1fr)",
    height: "100dvh",
    backgroundColor: color.frame,
  },
  rootSidebarHidden: { gridTemplateColumns: "minmax(0, 1fr)" },
  sidebar: {
    display: {
      default: "none",
      [media.lg]: {
        default: "flex",
        [stylex.when.ancestor(touchPageInShell, shellMarker)]: {
          default: "flex",
          [media.coarsePointer]: "none",
        },
      },
    },
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
  brandWordmark: {
    fontSize: font.lg,
    fontWeight: font.bold,
    letterSpacing: font.trackingTight,
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
    paddingInlineStart: {
      default: 0,
      [media.md]: size.frameGap,
      [media.lg]: {
        default: 0,
        [stylex.when.ancestor(touchPageInShell, shellMarker)]: {
          default: 0,
          [media.coarsePointer]: size.frameGap,
        },
      },
    },
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
  navButton: {
    display: {
      default: "inline-flex",
      [media.lg]: {
        default: "none",
        [stylex.when.ancestor(touchPageInShell, shellMarker)]: {
          default: "none",
          [media.coarsePointer]: "inline-flex",
        },
      },
    },
  },
  showSidebarButton: {
    display: {
      default: "none",
      [media.lg]: {
        default: "inline-flex",
        [stylex.when.ancestor(touchPageInShell, shellMarker)]: {
          default: "inline-flex",
          [media.coarsePointer]: "none",
        },
      },
    },
  },
  icon: { width: size.icon, height: size.icon },
  topbarActions: { display: "flex", alignItems: "center", gap: space.sm },
  // On a phone, the page title has priority over the global actions. They move to the sheet.
  topbarSlot: { display: { default: "none", [media.sm]: "contents" } },
  sheetActions: {
    display: { default: "flex", [media.sm]: "none" },
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
  },
  searchField: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: { default: "center", [media.sm]: "flex-start" },
    gap: space.sm,
    width: { default: size.controlMd, [media.sm]: "14rem", [media.lg]: "18rem" },
    height: size.controlMd,
    paddingInline: { default: 0, [media.sm]: space.sm },
    paddingInlineEnd: { default: 0, [media.sm]: space.xs },
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: { default: color.border, ":hover": color.borderStrong },
    borderRadius: radius.md,
    backgroundColor: color.raised,
    color: color.textMuted,
    fontFamily: "inherit",
    fontSize: font.md,
    cursor: "pointer",
    transitionProperty: "border-color",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  searchPlaceholder: {
    display: { default: "none", [media.sm]: "inline" },
    flex: "1",
    textAlign: "start",
  },
  searchKeys: { display: { default: "none", [media.md]: "inline-flex" }, gap: "2px" },
  // Positioned so visually hidden, absolutely positioned content stays inside the scroller.
  main: { position: "relative", flex: "1", minWidth: 0, minHeight: 0, overflowY: "auto" },
});
