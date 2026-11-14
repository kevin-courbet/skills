import * as stylex from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext } from "react";
import type { StyleArg } from "@/lib/rac";
import { touchDensity } from "@/styles/themes";
import { font } from "@/styles/tokens.stylex";

/**
 * Size of the controls and the text of a page. `touch` is for a page on a
 * shared tablet or a kiosk. `Page density` sets it for everything in the page.
 */
export type Density = "default" | "touch";

const DensityContext = createContext<Density>("default");

/** Sets the density for its subtree. `Page` sets it; do not set it in other places. */
export function DensityProvider({
  density,
  children,
}: {
  readonly density: Density;
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

const styles = stylex.create({
  touch: { fontSize: font.md, lineHeight: font.leadingNormal },
});
