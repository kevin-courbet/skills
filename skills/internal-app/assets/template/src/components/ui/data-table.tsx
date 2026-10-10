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
import { color, font, motion, size, space } from "@/styles/tokens.stylex";

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
  /** Rendered only when data resolved to zero rows. */
  readonly emptyState: ReactNode;
  readonly caption: string;
  /** Marks a numeric column so values align right with tabular figures. */
  readonly numericColumns?: ReadonlyArray<string>;
}

/**
 * Dense data table on semantic table elements. Sorting toggles through the
 * column header button and is announced with aria-sort.
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

  if (data.length === 0) return <>{emptyState}</>;

  return (
    <div {...stylex.props(styles.scroller)} tabIndex={0} role="region" aria-label={caption}>
      <table {...stylex.props(styles.table)}>
        <caption {...stylex.props(styles.caption)}>{caption}</caption>
        <thead {...stylex.props(styles.thead)}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const numeric = numericColumns.includes(header.column.id);
                const canSort = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={ariaSort[sorted === false ? "none" : sorted]}
                    {...stylex.props(styles.th, numeric && styles.numeric)}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        {...stylex.props(styles.sortButton, numeric && styles.sortButtonNumeric)}
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
            <tr key={row.id} {...stylex.props(styles.tr)}>
              {row.getAllCells().map((cell) => (
                <td
                  key={cell.id}
                  {...stylex.props(
                    styles.td,
                    numericColumns.includes(cell.column.id) && styles.numeric,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  scroller: {
    overflowX: "auto",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: "0.5rem",
    backgroundColor: color.raised,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
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
  thead: { position: "sticky", top: 0, zIndex: 1, backgroundColor: color.subtle },
  th: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    textAlign: "start",
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.textMuted,
    whiteSpace: "nowrap",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
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
    borderRadius: "0.25rem",
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
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  td: {
    paddingBlock: "0.5rem",
    paddingInline: space.md,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  numeric: { textAlign: "end", fontVariantNumeric: "tabular-nums" },
});
