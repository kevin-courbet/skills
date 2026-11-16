/**
 * The density of a page, `default` or `touch`, and the hooks that pass it to overlays and to the app shell.
 *
 * @layer helper
 * @keywords density, touch density, touch page, tablet, kiosk, overlay density, useDensity, useOverlayDensity
 * @related Layout, AppShell, ControlSize, WorkQueue, Overlay
 * @notes density, kit-touch-work-view, kit-adding-a-component
 *
 * A page sets its density with `Page density`. Do not set the density with
 * these providers in a page: use `Page`. Do not use it to change the height
 * of one row: use `ControlSizeProvider`.
 *
 * ## Behavior
 * - `Page` sets `DensityProvider` and reports its density to `AppShell`
 *   through `ShellDensityProvider` and `useShellPageDensity`. `AppShell` then
 *   sets the density again for its sheet and its top bar menus.
 * - Every kit dialog, sheet, popover, hover card, menu, option list, and
 *   tooltip puts `useOverlayDensity()` on its portal root. Thus it opens with
 *   the density of the page that opens it, although it renders outside the
 *   page.
 * - Toasts and the command palette render in the app shell, outside every
 *   page, and keep the default density.
 *
 * ## Rules
 * - Only `Page` and `AppShell` use `DensityProvider`, `ShellDensityProvider`,
 *   and `useShellPageDensity`.
 * - Use `useDensity()` when a component must know that it renders on a touch
 *   page.
 * - A new overlay puts `...useOverlayDensity()` first in the styles of its
 *   portal root. Run `design read kit-density` for the touch
 *   values.
 *
 * ## Example
 * ```tsx
 * const overlayDensity = useOverlayDensity();
 * return (
 *   <AriaPopover {...renderStyles(() => [...overlayDensity, overlay.popover, styles.popover])}>
 *     {children}
 *   </AriaPopover>
 * );
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { StyleArg } from "@/lib/rac";
import { touchDensity } from "@/styles/themes";
import { font } from "@/styles/tokens.stylex";

/**
 * Size of the controls and the text of a page. `touch` is for a page on a
 * shared tablet or a kiosk. `Page density` sets it for everything in the page.
 */
export type Density = "default" | "touch";

const DensityContext = createContext<Density>("default");

/**
 * Sets the density for its subtree. `Page` sets it for the page, and
 * `AppShell` sets the density of the page for the overlays of the shell. Do not
 * set it in other places.
 */
export function DensityProvider({
  density,
  children,
}: {
  /** The density of the subtree. */
  readonly density: Density;
  /** The content that takes the density. */
  readonly children: ReactNode;
}) {
  return <DensityContext.Provider value={density}>{children}</DensityContext.Provider>;
}

/** The density of the surrounding page. */
export function useDensity(): Density {
  return useContext(DensityContext);
}

/**
 * Styles for the root element of an overlay, so that a dialog, a sheet, a
 * popover, a menu, or a tooltip opens with the density of the page that opens
 * it. Overlays render in a portal outside the page, so the page theme does not
 * reach them, but React context does.
 */
export function useOverlayDensity(): ReadonlyArray<StyleArg> {
  return useDensity() === "touch" ? [touchDensity, styles.touch] : [];
}

type ReportPageDensity = (density: Density) => void;

const ShellDensityContext = createContext<ReportPageDensity | null>(null);

/**
 * Receives the density of the page in the app shell. The shell is outside the
 * page, so `DensityProvider` of the page does not reach it. `AppShell` sets it
 * around the page, and `Page` sets `null` around its content.
 */
export function ShellDensityProvider({
  onPageDensity,
  children,
}: {
  /** Receives the density of the page. `null` stops a nested page from reporting. */
  readonly onPageDensity: ReportPageDensity | null;
  /** The page, or the content of a page. */
  readonly children: ReactNode;
}) {
  return (
    <ShellDensityContext.Provider value={onPageDensity}>{children}</ShellDensityContext.Provider>
  );
}

/**
 * Tells the app shell the density of the page. Returns true when the page is
 * the page of the shell. A page inside a page, such as a specimen on the design
 * kit page, does not change the shell.
 */
export function useShellPageDensity(density: Density): boolean {
  const onPageDensity = useContext(ShellDensityContext);
  useEffect(() => {
    if (onPageDensity === null) return;
    onPageDensity(density);
    return () => onPageDensity("default");
  }, [onPageDensity, density]);
  return onPageDensity !== null;
}

const styles = stylex.create({
  touch: { fontSize: font.md, lineHeight: font.leadingNormal },
});
