import * as stylex from "@stylexjs/stylex";
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

export const dataTableFeatures = tableFeatures({ rowSortingFeature });
export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

export interface DataTableProps<TData extends RowData> {
  readonly columns: ReadonlyArray<DataTableColumn<TData>>;
  readonly data: ReadonlyArray<TData>;
  readonly getRowId: (row: TData) => string;
  /** Sorting is server-driven and lives in the URL. */
  readonly sorting: SortingState;
  readonly onSortingChange: (next: SortingState) => void;
  /** Rendered only when data resolved to zero rows. The toolbar stays visible. */
  readonly emptyState: ReactNode;
  readonly caption: string;
  /** Marks a numeric column so values align right with tabular figures. */
  readonly numericColumns?: ReadonlyArray<string>;
  /** A compact Toolbar rendered inside the table frame, above the header. */
  readonly toolbar?: ReactNode;
  /** Keeps the first column visible while the table scrolls sideways. */
  readonly stickyFirstColumn?: boolean;
  /** Highlights the row whose detail is open, for example in a peek sheet. */
  readonly activeRowId?: string;
}

/**
 * Dense data table on semantic table elements. Sorting toggles through the
 * column header button and is announced with aria-sort. A column `footer`
 * renders a summary row, such as totals for the visible page.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sorting,
  onSortingChange,
  emptyState,
  caption,
  numericColumns = [],
  toolbar,
  stickyFirstColumn = false,
  activeRowId,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    manualSorting: true,
    enableMultiSort: false,
    state: { sorting },
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
  });
  const hasFooter = columns.some((column) => column.footer !== undefined);
  const isSticky = (index: number) => stickyFirstColumn && index === 0;

  return (
    <div {...stylex.props(styles.frame)}>
      {toolbar ? <div {...stylex.props(styles.toolbar)}>{toolbar}</div> : null}
      {data.length === 0 ? (
        <div {...stylex.props(styles.empty)}>{emptyState}</div>
      ) : (
        <div {...stylex.props(styles.scroller)} tabIndex={0} role="region" aria-label={caption}>
          <table {...stylex.props(styles.table)}>
            <caption {...stylex.props(styles.caption)}>{caption}</caption>
            <thead {...stylex.props(styles.thead)}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const sorted = header.column.getIsSorted();
                    const numeric = numericColumns.includes(header.column.id);
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={ariaSort[sorted === false ? "none" : sorted]}
                        {...stylex.props(
                          styles.th,
                          numeric && styles.numeric,
                          isSticky(index) && styles.sticky,
                        )}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            {...stylex.props(
                              styles.sortButton,
                              numeric && styles.sortButtonNumeric,
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon sorted={sorted} />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  aria-current={row.id === activeRowId ? "true" : undefined}
                  {...stylex.props(styles.tr, row.id === activeRowId && styles.trActive)}
                >
                  {row.getAllCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      {...stylex.props(
                        styles.td,
                        numericColumns.includes(cell.column.id) && styles.numeric,
                        isSticky(index) && styles.sticky,
                        isSticky(index) && styles.stickyRowSurface,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {hasFooter ? (
              <tfoot>
                {table.getFooterGroups().map((footerGroup) => (
                  <tr key={footerGroup.id}>
                    {footerGroup.headers.map((header, index) => (
                      <td
                        key={header.id}
                        {...stylex.props(
                          styles.tfootCell,
                          numericColumns.includes(header.column.id) && styles.numeric,
                          isSticky(index) && styles.sticky,
                        )}
                      >
                        {flexRender(header.column.columnDef.footer, header.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tfoot>
            ) : null}
          </table>
        </div>
      )}
    </div>
  );
}

export interface MeterCellProps {
  /** Formatted value shown as text. */
  readonly label: string;
  readonly value: number;
  /** The largest value in the column, usually from the visible page. */
  readonly max: number;
}

/**
 * Numeric cell with a short bar that compares the value with the column
 * maximum. The text carries the value; the bar only supports scanning.
 */
export function MeterCell({ label, value, max }: MeterCellProps) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <span {...stylex.props(styles.meter)}>
      <span aria-hidden {...stylex.props(styles.meterTrack)}>
        <span {...stylex.props(styles.meterFill(share))} />
      </span>
      {label}
    </span>
  );
}

const ariaSort = { none: undefined, asc: "ascending", desc: "descending" } as const;

function SortIcon({ sorted }: { readonly sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <ArrowUp {...stylex.props(styles.sortIcon, styles.sortIconActive)} />;
  if (sorted === "desc")
    return <ArrowDown {...stylex.props(styles.sortIcon, styles.sortIconActive)} />;
  return <ArrowUpDown {...stylex.props(styles.sortIcon)} />;
}

const styles = stylex.create({
  frame: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  toolbar: {
    paddingBlock: space.sm,
    paddingInline: space.sm,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  empty: { padding: space.lg },
  scroller: {
    overflowX: "auto",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: font.md },
  caption: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  thead: { position: "sticky", top: 0, zIndex: 2, backgroundColor: color.raised },
  th: {
    height: "2.25rem",
    paddingInline: space.md,
    textAlign: "start",
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.textMuted,
    whiteSpace: "nowrap",
    backgroundColor: color.raised,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  sortButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    margin: `calc(-1 * ${space.xs})`,
    paddingBlock: space.xs,
    paddingInline: space.xs,
    borderStyle: "none",
    backgroundColor: "transparent",
    borderRadius: radius.sm,
    color: { default: "inherit", ":hover": color.text },
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  sortButtonNumeric: { flexDirection: "row-reverse" },
  sortIcon: {
    width: size.iconSm,
    height: size.iconSm,
    flexShrink: 0,
    color: color.textFaint,
    transitionProperty: "color",
    transitionDuration: motion.fast,
  },
  sortIconActive: { color: color.accentText },
  tr: {
    backgroundColor: { default: color.raised, ":hover": color.subtle },
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  trActive: { backgroundColor: { default: color.selected, ":hover": color.selected } },
  td: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  tfootCell: {
    height: "2.25rem",
    paddingInline: space.md,
    fontSize: font.sm,
    color: color.textMuted,
    whiteSpace: "nowrap",
    backgroundColor: color.raised,
  },
  sticky: {
    position: "sticky",
    left: 0,
    zIndex: 1,
    boxShadow: `1px 0 0 ${color.borderSubtle}`,
  },
  // Inherit the row surface so hover and selection reach the pinned cell.
  stickyRowSurface: { backgroundColor: "inherit" },
  numeric: { textAlign: "end", fontVariantNumeric: "tabular-nums" },
  meter: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: space.sm,
    fontVariantNumeric: "tabular-nums",
  },
  meterTrack: {
    display: "inline-flex",
    width: "2.5rem",
    height: "0.25rem",
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: color.inset,
  },
  meterFill: (share: number) => ({
    width: `${share * 100}%`,
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: color.accent,
  }),
});
