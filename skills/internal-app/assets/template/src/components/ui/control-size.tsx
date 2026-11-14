import { createContext, type ReactNode, useContext } from "react";

/**
 * Height of the kit controls in one row. `md` is the default height. `sm` is
 * the compact height for a row inside a frame, such as the DataTable toolbar.
 */
export type ControlSize = "sm" | "md";

const ControlSizeContext = createContext<ControlSize>("md");

/**
 * Sets the height of every kit control inside it, so the controls in one row
 * share one height. Toolbar, the DataTable toolbar row, and the LogViewer and
 * EventCalendar headers set it. Overlays set `md` again, because React context
 * passes into portals.
 */
export function ControlSizeProvider({
  size,
  children,
}: {
  readonly size: ControlSize;
  readonly children: ReactNode;
}) {
  return <ControlSizeContext.Provider value={size}>{children}</ControlSizeContext.Provider>;
}

/** The control size of the surrounding row. */
export function useControlSize(): ControlSize {
  return useContext(ControlSizeContext);
}
