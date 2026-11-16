/**
 * The shared height of the kit controls in one row: `sm` (28px) or `md` (32px, the default).
 *
 * @layer helper
 * @keywords control size, control height, row height, compact controls, small toolbar, same height row, useControlSize
 * @related Layout, DataTable, Button, Density
 * @notes density, kit-composition, kit-adding-a-component
 *
 * Controls in one row share one height. Every kit control reads the size of
 * its row, so pages do not set a size on each control. Do not use it to make
 * a page larger for touch: use `Page density="touch"`.
 *
 * ## Behavior
 * - `Toolbar`, the `DataTable` toolbar row, bulk bar, and pagination footer,
 *   and the `LogViewer` and `EventCalendar` headers set the size already.
 * - Dialogs, sheets, and popovers set `md` again, because React context
 *   passes into portals.
 *
 * ## Rules
 * - Put a row of filters and view controls in a `Toolbar`, not in this
 *   provider.
 * - Wrap a row that is not a toolbar, such as a card header with a
 *   `SegmentedControl` and a `Button`, in `ControlSizeProvider` only when it
 *   must be `sm`.
 * - A new primitive with a control height reads `useControlSize()` and has no
 *   `size` prop.
 *
 * ## Example
 * ```tsx
 * <ControlSizeProvider size="sm">
 *   <SegmentedControl label="Range" options={ranges} value={range} onChange={setRange} />
 *   <Button>Export</Button>
 * </ControlSizeProvider>
 * ```
 */
import { createContext, type ReactNode, useContext } from "react";

/**
 * Height of the kit controls in one row. `md` is the default height. `sm` is
 * the compact height for a row inside a frame, such as the DataTable toolbar.
 */
export type ControlSize = "sm" | "md";

const ControlSizeContext = createContext<ControlSize>("md");

export function ControlSizeProvider({
  size,
  children,
}: {
  /** The height of every kit control inside. */
  readonly size: ControlSize;
  /** The row of controls. */
  readonly children: ReactNode;
}) {
  return <ControlSizeContext.Provider value={size}>{children}</ControlSizeContext.Provider>;
}

/** The control size of the surrounding row. */
export function useControlSize(): ControlSize {
  return useContext(ControlSizeContext);
}
