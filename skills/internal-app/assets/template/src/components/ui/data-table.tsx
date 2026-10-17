// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import {
  type Column,
  type ColumnDef,
  type ColumnSizingState,
  type Header,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  flexRender,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3 } from "lucide-react";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { Button as AriaButton } from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { color, container, font, motion, radius, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./feedback";
import { field } from "./field";
import { Toolbar } from "./layout";
import { Menu, MenuItem, MenuTrigger } from "./menu";
import { Select } from "./select";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
});
export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

export interface DataTableSelection<TData extends RowData> {
  /** Selected row ids. Ids of rows on other pages stay selected. */
  readonly selectedIds: ReadonlyArray<string>;
  readonly onChange: (ids: ReadonlyArray<string>) => void;
  /** Names the row in its checkbox label, such as "Select Ledger sync". */
  readonly rowLabel: (row: TData) => string;
  /** Rows that return false show a disabled checkbox. */
  readonly canSelect?: (row: TData) => boolean;
  /** Bulk actions for the selected rows. They replace the toolbar while rows are selected. */
  readonly actions: (ids: ReadonlyArray<string>) => ReactNode;
}

export interface DataTableColumnVisibility {
  /** Ids of hidden columns. Columns with `enableHiding: false` always show. */
  readonly hidden: ReadonlyArray<string>;
  readonly onChange: (hidden: ReadonlyArray<string>) => void;
}

/** Table frame widths, at the `media` breakpoints: `sm` 640px, `md` 768px, `lg` 1024px. */
export type DataTableBreakpoint = "sm" | "md" | "lg";

/**
 * How a column gives way when the table frame is narrow, such as on a phone.
 * The frame width decides, not the window width, so a table in a side panel
 * adapts too.
 */
export interface DataTableResponsiveColumn {
  /** The column leaves the table while the frame is narrower than this breakpoint. */
  readonly hideBelow: DataTableBreakpoint;
  /**
   * Shows the cell under the row header while the column is hidden, so the
   * value stays in the row without its own column. Use it for short values.
   */
  readonly stack?: boolean;
}

export interface DataTableVirtualization {
  /** Rows visible before the body scrolls inside the table frame. */
  readonly visibleRows: number;
}

/**
 * What a row opens. The row header cell becomes a link or a button, so the
 * keyboard reaches it with Tab and opens it with Enter; a click anywhere else
 * on the row does the same.
 */
export type DataTableRowAction<TData extends RowData> =
  | {
      /** Router link props for the row's detail route: `{ to: "/items/$itemId", params }`. */
      readonly link: (row: TData) => DataTableRowLink;
    }
  | { readonly onAction: (row: TData) => void };

export type DataTableRowLink = Omit<
  LinkComponentProps<"a">,
  "children" | "className" | "style" | "activeProps" | "inactiveProps"
>;

export interface DataTableExpansion<TData extends RowData> {
  readonly expandedIds: ReadonlyArray<string>;
  readonly onChange: (ids: ReadonlyArray<string>) => void;
  /** Detail under the row, such as the stages of a run or a raw payload. */
  readonly render: (row: TData) => ReactNode;
  /** Names the row in the toggle label, such as "Show details for Ledger sync". */
  readonly rowLabel: (row: TData) => string;
  /** Rows that return false have no toggle. */
  readonly canExpand?: (row: TData) => boolean;
}

export interface DataTablePinning {
  /** Column ids that stay at the start while the table scrolls sideways, in order. */
  readonly start?: ReadonlyArray<string>;
  /** Column ids that stay at the end, such as a row actions menu. */
  readonly end?: ReadonlyArray<string>;
}

export interface DataTablePagination {
  /** One-based page number. */
  readonly page: number;
  readonly pageSize: number;
  /** Total rows across all pages, from the server. */
  readonly total: number;
  readonly onPageChange: (page: number) => void;
  /** Adds a rows-per-page select. Keep the size in the URL with the page. */
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly pageSizeOptions?: ReadonlyArray<number>;
}

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
  /** Opens the record of a row from its header cell and from a click on the row. */
  readonly rowAction?: DataTableRowAction<TData>;
  /** Column whose cells name the row: a row header, and the link or button of `rowAction`. Defaults to the first data column. */
  readonly rowHeader?: string;
  /** Keeps columns visible while the table scrolls sideways. The checkbox and expand columns pin with the start. */
  readonly pinnedColumns?: DataTablePinning;
  /** Highlights the row whose detail is open, for example in a peek sheet. */
  readonly activeRowId?: string;
  /** Adds a checkbox column and a bulk-action bar. */
  readonly selection?: DataTableSelection<TData>;
  /** Adds a toggle column; an expanded row shows its detail in a full-width row below it. */
  readonly expansion?: DataTableExpansion<TData>;
  /** Adds a column menu to the toolbar row. Column headers must be strings. */
  readonly columnVisibility?: DataTableColumnVisibility;
  /** Lets people drag or use arrow keys on header edges to resize columns. Headers must be strings. */
  readonly resizableColumns?: boolean;
  /** Renders only the rows in view. Use for long client-side lists, not for server pages. */
  readonly virtualize?: DataTableVirtualization;
  /** `compact` uses 28px rows for long scanning lists. Two-line cells need `default`. */
  readonly density?: "default" | "compact";
  /** Shows skeleton rows during a client-triggered load. Never for SSR data. */
  readonly isLoading?: boolean;
  /** Skeleton rows while loading. Match the page size the table usually shows. */
  readonly loadingRows?: number;
  /** Adds a footer bar in the frame with the row range, page buttons, and rows per page. */
  readonly pagination?: DataTablePagination;
  /**
   * Columns that leave the table, or move under the row header, when the
   * frame is narrow. Keep the row header and the status in view at 375px and
   * hide secondary facts, such as the source or the author.
   */
  readonly responsiveColumns?: Readonly<Record<string, DataTableResponsiveColumn>>;
}

const selectColumnId = "__select";
const expandColumnId = "__expand";
const utilityColumns = [selectColumnId, expandColumnId];
/** Matches the 36px row from the density table: 8px padding, one line, and the border. */
const rowHeightPx = 36;
const resizeStepPx = 16;
const columnSizeDefaults = { size: 160, minSize: 64, maxSize: 640 } as const;
const interactiveSelector =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="checkbox"], [role="link"], [role="menuitem"], [role="switch"], [tabindex]:not([tabindex="-1"])';

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
  rowAction,
  rowHeader,
  pinnedColumns,
  activeRowId,
  selection,
  expansion,
  columnVisibility,
  resizableColumns = false,
  virtualize,
  density = "default",
  isLoading = false,
  loadingRows = 5,
  pagination,
  responsiveColumns = {},
}: DataTableProps<TData>) {
  if (virtualize !== undefined && expansion !== undefined)
    throw new Error("DataTable cannot expand rows while it virtualizes them.");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const headRowRef = useRef<HTMLTableRowElement>(null);
  const detailIdPrefix = useId();
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const rowSelection: RowSelectionState = Object.fromEntries(
    (selection?.selectedIds ?? []).map((id) => [id, true] as const),
  );
  const pinStart = pinnedColumns?.start ?? [];
  const pinEnd = pinnedColumns?.end ?? [];
  const utility = [
    ...(selection === undefined ? [] : [selectionColumn(selection)]),
    ...(expansion === undefined ? [] : [expansionColumn(expansion, detailIdPrefix)]),
  ];
  const ordered = [
    ...pinStart.map((id) => findColumn(columns, id)),
    ...columns.filter(
      (column) => !pinStart.includes(columnId(column)) && !pinEnd.includes(columnId(column)),
    ),
    ...pinEnd.map((id) => findColumn(columns, id)),
  ];
  const table = useTable({
    features: dataTableFeatures,
    columns: [...utility, ...ordered],
    data,
    getRowId,
    defaultColumn: columnSizeDefaults,
    manualSorting: true,
    enableMultiSort: false,
    enableRowSelection:
      selection?.canSelect === undefined
        ? selection !== undefined
        : (row) => selection.canSelect?.(row.original) === true,
    enableColumnResizing: resizableColumns,
    columnResizeMode: "onChange",
    state: {
      sorting,
      rowSelection,
      columnSizing,
      columnVisibility: Object.fromEntries(
        (columnVisibility?.hidden ?? []).map((id) => [id, false] as const),
      ),
    },
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
    onRowSelectionChange: (updater) => {
      if (selection === undefined) return;
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      selection.onChange(Object.keys(next));
    },
    onColumnSizingChange: setColumnSizing,
  });
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => rowHeightPx,
    overscan: 8,
    enabled: virtualize !== undefined,
    // Server rendering has no scroll element; render the first screen of rows.
    initialRect: { width: 0, height: (virtualize?.visibleRows ?? 0) * rowHeightPx },
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const visibleIds = visibleColumns.map((column) => column.id);
  const headerColumnId =
    rowHeader ?? visibleColumns.find((column) => !utilityColumns.includes(column.id))?.id;
  const startIds = [...(pinStart.length > 0 ? utilityColumns : []), ...pinStart].filter((id) =>
    visibleIds.includes(id),
  );
  const endIds = pinEnd.filter((id) => visibleIds.includes(id));
  const offsets = usePinOffsets(
    headRowRef,
    startIds,
    endIds,
    (id) => table.getColumn(id)?.getSize() ?? columnSizeDefaults.size,
  );
  for (const id of Object.keys(responsiveColumns)) {
    if (!columns.some((column) => columnId(column) === id))
      throw new Error(`DataTable makes the unknown column "${id}" responsive.`);
    if (id === headerColumnId)
      throw new Error(`DataTable cannot hide the row header column "${id}" on narrow frames.`);
  }
  const stackedIds = visibleIds.filter((id) => responsiveColumns[id]?.stack === true);
  const hasFooter = columns.some((column) => column.footer !== undefined);
  const selectedCount = selection?.selectedIds.length ?? 0;
  const hasToolbarRow =
    toolbar !== undefined || columnVisibility !== undefined || selectedCount > 0;
  const expandedIds = expansion?.expandedIds ?? [];

  useRowClick(bodyRef, rowAction !== undefined);

  const cellStyles = (id: string) => {
    const startIndex = startIds.indexOf(id);
    const endIndex = endIds.indexOf(id);
    const responsive = responsiveColumns[id];
    return [
      responsive !== undefined && hideBelow[responsive.hideBelow],
      numericColumns.includes(id) && styles.numeric,
      utilityColumns.includes(id) && styles.utilityCell,
      startIndex !== -1 && styles.sticky,
      startIndex !== -1 && styles.stickyStart(offsets.start[id] ?? 0),
      startIndex === startIds.length - 1 && styles.stickyStartEdge,
      endIndex !== -1 && styles.sticky,
      endIndex !== -1 && styles.stickyEnd(offsets.end[id] ?? 0),
      endIndex === 0 && styles.stickyEndEdge,
    ];
  };
  const isPinned = (id: string) => startIds.includes(id) || endIds.includes(id);

  const renderCells = (row: Row<DataTableFeatures, TData>) =>
    row.getVisibleCells().map((cell) => {
      const id = cell.column.id;
      const content = flexRender(cell.column.columnDef.cell, cell.getContext());
      const cellStyle = [
        styles.td,
        densities[density],
        resizableColumns && styles.tdClipped,
        ...cellStyles(id),
        isPinned(id) && styles.stickyRowSurface,
      ];
      if (id === headerColumnId)
        return (
          <th key={cell.id} scope="row" {...stylex.props(...cellStyle, styles.rowHeader)}>
            {rowAction === undefined ? (
              content
            ) : (
              <RowActionControl action={rowAction} row={row.original}>
                {content}
              </RowActionControl>
            )}
            {stackedIds.length === 0 ? null : (
              <StackedCells row={row} ids={stackedIds} responsive={responsiveColumns} />
            )}
          </th>
        );
      return (
        <td key={cell.id} {...stylex.props(...cellStyle)}>
          {content}
        </td>
      );
    });

  const renderRow = (row: Row<DataTableFeatures, TData>, index: number, measure: boolean) => {
    const isExpanded = expandedIds.includes(row.id);
    return [
      <tr
        key={row.id}
        ref={measure ? virtualizer.measureElement : undefined}
        data-index={index}
        aria-rowindex={virtualize === undefined ? undefined : index + 2}
        aria-current={row.id === activeRowId ? "true" : undefined}
        {...stylex.props(
          styles.tr,
          rowAction !== undefined && styles.trAction,
          isExpanded && styles.trExpanded,
          row.getIsSelected() && styles.trSelected,
          row.id === activeRowId && styles.trSelected,
        )}
      >
        {renderCells(row)}
      </tr>,
      expansion !== undefined && isExpanded ? (
        <tr
          key={`${row.id}-detail`}
          id={detailId(detailIdPrefix, row.id)}
          {...stylex.props(styles.detailRow)}
        >
          <td colSpan={visibleColumns.length} {...stylex.props(styles.detailCell)}>
            <div {...stylex.props(styles.detailContent)}>{expansion.render(row.original)}</div>
          </td>
        </tr>
      ) : null,
    ];
  };

  const virtualRows = virtualize === undefined ? null : virtualizer.getVirtualItems();
  const firstVirtual = virtualRows?.[0];
  const lastVirtual = virtualRows?.[virtualRows.length - 1];
  const paddingTop = firstVirtual?.start ?? 0;
  const paddingBottom =
    lastVirtual === undefined ? 0 : virtualizer.getTotalSize() - lastVirtual.end;

  const body = (() => {
    if (isLoading)
      return Array.from({ length: loadingRows }, (_, index) => (
        <tr key={`loading-${index}`} aria-hidden {...stylex.props(styles.tr)}>
          {visibleColumns.map((column, columnIndex) => (
            <td
              key={column.id}
              {...stylex.props(styles.td, densities[density], ...cellStyles(column.id))}
            >
              {utilityColumns.includes(column.id) ? null : (
                <Skeleton
                  style={skeletonWidthList[(index + columnIndex) % skeletonWidthList.length]}
                />
              )}
            </td>
          ))}
        </tr>
      ));
    if (virtualRows === null) return rows.map((row, index) => renderRow(row, index, false));
    return (
      <>
        {paddingTop > 0 ? <SpacerRow height={paddingTop} columns={visibleColumns.length} /> : null}
        {virtualRows.map((item) => {
          const row = rows[item.index];
          return row === undefined ? null : renderRow(row, item.index, true);
        })}
        {paddingBottom > 0 ? (
          <SpacerRow height={paddingBottom} columns={visibleColumns.length} />
        ) : null}
      </>
    );
  })();

  return (
    <div {...stylex.props(styles.frame)}>
      <span aria-live="polite" {...stylex.props(field.hiddenLabel)}>
        {selectedCount > 0 ? `${selectedCount.toLocaleString(appLocale)} selected` : ""}
        {isLoading ? "Loading rows" : ""}
      </span>
      {hasToolbarRow ? (
        <div {...stylex.props(styles.toolbar)}>
          <div {...stylex.props(styles.toolbarMain)}>
            {selection !== undefined && selectedCount > 0 ? (
              <BulkActions selection={selection} />
            ) : (
              toolbar
            )}
          </div>
          {columnVisibility === undefined ? null : (
            <ColumnsMenu table={table} onChange={columnVisibility.onChange} />
          )}
        </div>
      ) : null}
      {data.length === 0 && !isLoading ? (
        <div {...stylex.props(styles.empty)}>{emptyState}</div>
      ) : (
        <div
          ref={scrollerRef}
          {...stylex.props(
            styles.scroller,
            virtualize !== undefined && styles.scrollerHeight(virtualize.visibleRows),
          )}
          tabIndex={0}
          role="region"
          aria-label={caption}
        >
          <table
            aria-rowcount={virtualize === undefined ? undefined : rows.length + 1}
            aria-busy={isLoading || undefined}
            {...stylex.props(
              styles.table,
              resizableColumns && styles.tableFixed(table.getTotalSize()),
            )}
          >
            <caption {...stylex.props(styles.caption)}>{caption}</caption>
            <thead {...stylex.props(styles.thead)}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  ref={headRowRef}
                  aria-rowindex={virtualize === undefined ? undefined : 1}
                >
                  {headerGroup.headers.map((header) => (
                    <HeaderCell
                      key={header.id}
                      header={header}
                      table={table}
                      isResizable={resizableColumns && header.column.getCanResize()}
                      isNumeric={numericColumns.includes(header.column.id)}
                      cellStyle={[densitiesHead[density], ...cellStyles(header.column.id)]}
                      width={resizableColumns ? header.getSize() : undefined}
                    />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody ref={bodyRef}>{body}</tbody>
            {hasFooter && !isLoading ? (
              <tfoot>
                {table.getFooterGroups().map((footerGroup) => (
                  <tr key={footerGroup.id}>
                    {footerGroup.headers.map((header) => (
                      <td
                        key={header.id}
                        {...stylex.props(styles.tfootCell, ...cellStyles(header.column.id))}
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
      {pagination === undefined ? null : <PaginationBar pagination={pagination} />}
    </div>
  );
}

function columnId<TData extends RowData>(column: DataTableColumn<TData>): string {
  if (column.id !== undefined) return column.id;
  if ("accessorKey" in column && typeof column.accessorKey === "string") return column.accessorKey;
  throw new Error("DataTable columns need an `id` or a string `accessorKey`.");
}

function findColumn<TData extends RowData>(
  columns: ReadonlyArray<DataTableColumn<TData>>,
  id: string,
): DataTableColumn<TData> {
  const column = columns.find((candidate) => columnId(candidate) === id);
  if (column === undefined) throw new Error(`DataTable pins the unknown column "${id}".`);
  return column;
}

function detailId(prefix: string, rowId: string): string {
  return `${prefix}-detail-${rowId}`;
}

/**
 * Sticky offsets of the pinned columns, measured from the header cells so
 * auto-sized columns pin correctly. Before the first measurement, such as in
 * server rendering, the column sizes stand in.
 */
function usePinOffsets(
  headRowRef: RefObject<HTMLTableRowElement | null>,
  startIds: ReadonlyArray<string>,
  endIds: ReadonlyArray<string>,
  fallbackSize: (id: string) => number,
): {
  readonly start: Readonly<Record<string, number>>;
  readonly end: Readonly<Record<string, number>>;
} {
  const estimate = () => ({
    start: cumulative(startIds, fallbackSize),
    end: cumulative([...endIds].reverse(), fallbackSize),
  });
  const [offsets, setOffsets] = useState(estimate);
  const key = `${startIds.join(",")}|${endIds.join(",")}`;
  useLayoutEffect(() => {
    const row = headRowRef.current;
    if (row === null || key === "|") return;
    const measure = () => {
      const widths = new Map<string, number>();
      for (const cell of Array.from(row.children)) {
        if (cell instanceof HTMLElement && cell.dataset.columnId !== undefined)
          widths.set(cell.dataset.columnId, cell.getBoundingClientRect().width);
      }
      const width = (id: string) => widths.get(id) ?? 0;
      const [startPart = "", endPart = ""] = key.split("|");
      const start = cumulative(startPart === "" ? [] : startPart.split(","), width);
      const end = cumulative(endPart === "" ? [] : endPart.split(",").reverse(), width);
      setOffsets((previous) =>
        sameOffsets(previous.start, start) && sameOffsets(previous.end, end)
          ? previous
          : { start, end },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const cell of Array.from(row.children)) observer.observe(cell);
    return () => observer.disconnect();
  }, [headRowRef, key]);
  return offsets;
}

function cumulative(
  ids: ReadonlyArray<string>,
  width: (id: string) => number,
): Record<string, number> {
  const result: Record<string, number> = {};
  let offset = 0;
  for (const id of ids) {
    result[id] = offset;
    offset += width(id);
  }
  return result;
}

function sameOffsets(left: Record<string, number>, right: Record<string, number>): boolean {
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => left[key] === right[key]);
}

/**
 * A click on a row that misses its controls activates the row header link or
 * button. Text selection and clicks on other controls are left alone.
 */
function useRowClick(bodyRef: RefObject<HTMLTableSectionElement | null>, isEnabled: boolean) {
  useEffect(() => {
    const body = bodyRef.current;
    if (body === null || !isEnabled) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const row = event.target.closest("tr");
      if (row === null || !body.contains(row)) return;
      // Only controls inside the row count; the scroll region around the table is focusable too.
      const hit = event.target.closest(interactiveSelector);
      if (hit !== null && row.contains(hit)) return;
      if ((document.getSelection()?.toString() ?? "") !== "") return;
      const control = row.querySelector<HTMLElement>("[data-row-action]");
      if (control === null) return;
      control.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        }),
      );
    };
    body.addEventListener("click", onClick);
    return () => body.removeEventListener("click", onClick);
  }, [bodyRef, isEnabled]);
}

/**
 * The cells of stacked columns, repeated under the row header. Each shows only
 * while its own column is hidden, so the value appears once at every width.
 */
function StackedCells<TData extends RowData>({
  row,
  ids,
  responsive,
}: {
  readonly row: Row<DataTableFeatures, TData>;
  readonly ids: ReadonlyArray<string>;
  readonly responsive: Readonly<Record<string, DataTableResponsiveColumn>>;
}) {
  return ids.map((id) => {
    const cell = row.getVisibleCells().find((candidate) => candidate.column.id === id);
    const breakpoint = responsive[id]?.hideBelow;
    if (cell === undefined || breakpoint === undefined) return null;
    return (
      <div key={id} {...stylex.props(styles.stacked, showBelow[breakpoint])}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    );
  });
}

function RowActionControl<TData extends RowData>({
  action,
  row,
  children,
}: {
  readonly action: DataTableRowAction<TData>;
  readonly row: TData;
  readonly children: ReactNode;
}) {
  if ("link" in action) {
    const resolved = stylex.props(styles.rowControl);
    return (
      <Link
        {...action.link(row)}
        data-row-action
        className={resolved.className}
        style={resolved.style}
      >
        {children}
      </Link>
    );
  }
  return (
    <AriaButton
      data-row-action
      onPress={() => action.onAction(row)}
      {...stylex.props(styles.rowControl, styles.rowButton)}
    >
      {children}
    </AriaButton>
  );
}

function selectionColumn<TData extends RowData>(
  selection: DataTableSelection<TData>,
): DataTableColumn<TData> {
  return {
    id: selectColumnId,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        isSelected={table.getIsAllPageRowsSelected()}
        isIndeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onChange={(isSelected) => table.toggleAllPageRowsSelected(isSelected)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${selection.rowLabel(row.original)}`}
        isSelected={row.getIsSelected()}
        isDisabled={!row.getCanSelect()}
        onChange={(isSelected) => row.toggleSelected(isSelected)}
      />
    ),
  };
}

function expansionColumn<TData extends RowData>(
  expansion: DataTableExpansion<TData>,
  prefix: string,
): DataTableColumn<TData> {
  return {
    id: expandColumnId,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    header: () => <span {...stylex.props(field.hiddenLabel)}>Details</span>,
    cell: ({ row }) => {
      if (expansion.canExpand !== undefined && !expansion.canExpand(row.original)) return null;
      const isExpanded = expansion.expandedIds.includes(row.id);
      const name = expansion.rowLabel(row.original);
      return (
        <AriaButton
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? detailId(prefix, row.id) : undefined}
          aria-label={`${isExpanded ? "Hide" : "Show"} details for ${name}`}
          onPress={() =>
            expansion.onChange(
              isExpanded
                ? expansion.expandedIds.filter((id) => id !== row.id)
                : [...expansion.expandedIds, row.id],
            )
          }
          {...stylex.props(styles.expandButton)}
        >
          <ChevronRight
            aria-hidden
            {...stylex.props(styles.expandIcon, isExpanded && styles.expandIconOpen)}
          />
        </AriaButton>
      );
    },
  };
}

/** The header text, required where the column is named outside its header cell. */
function columnLabel<TData extends RowData>(
  column: Column<DataTableFeatures, TData, unknown>,
): string {
  const header = column.columnDef.header;
  if (typeof header === "string") return header;
  throw new Error(
    `DataTable column "${column.id}" needs a string header to appear in the column menu or to be resized.`,
  );
}

function HeaderCell<TData extends RowData>({
  header,
  table,
  isResizable,
  isNumeric,
  cellStyle,
  width,
}: {
  readonly header: Header<DataTableFeatures, TData, unknown>;
  readonly table: Table<DataTableFeatures, TData>;
  readonly isResizable: boolean;
  readonly isNumeric: boolean;
  readonly cellStyle: ReadonlyArray<false | stylex.StyleXStyles>;
  readonly width: number | undefined;
}) {
  const sorted = header.column.getIsSorted();
  const content = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext());
  return (
    <th
      scope="col"
      data-column-id={header.column.id}
      aria-sort={ariaSort[sorted === false ? "none" : sorted]}
      {...stylex.props(
        styles.th,
        isResizable && styles.thResizable,
        ...cellStyle,
        width !== undefined && styles.columnWidth(width),
      )}
    >
      {header.column.getCanSort() ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          {...stylex.props(styles.sortButton, isNumeric && styles.sortButtonNumeric)}
        >
          {content}
          <SortIcon sorted={sorted} />
        </button>
      ) : (
        content
      )}
      {isResizable ? <ColumnResizer header={header} table={table} /> : null}
    </th>
  );
}

/**
 * Drag handle on the header edge. It is a focusable separator, so arrow keys
 * resize the column and the size is announced. Double-click resets the width.
 */
function ColumnResizer<TData extends RowData>({
  header,
  table,
}: {
  readonly header: Header<DataTableFeatures, TData, unknown>;
  readonly table: Table<DataTableFeatures, TData>;
}) {
  const column = header.column;
  const minSize = column.columnDef.minSize ?? columnSizeDefaults.minSize;
  const maxSize = column.columnDef.maxSize ?? columnSizeDefaults.maxSize;
  // Read the size from the updater state so repeated key presses before a render add up.
  const resizeBy = (delta: number) =>
    table.setColumnSizing((previous) => ({
      ...previous,
      [column.id]: Math.min(
        maxSize,
        Math.max(minSize, (previous[column.id] ?? column.getSize()) + delta),
      ),
    }));
  const onPointerResize = header.getResizeHandler();
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${columnLabel(column)} column`}
      aria-valuenow={column.getSize()}
      aria-valuemin={minSize}
      aria-valuemax={maxSize}
      tabIndex={0}
      onMouseDown={onPointerResize}
      onTouchStart={onPointerResize}
      onDoubleClick={() => column.resetSize()}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") resizeBy(-resizeStepPx);
        else if (event.key === "ArrowRight") resizeBy(resizeStepPx);
        else if (event.key === "Home") column.resetSize();
        else return;
        event.preventDefault();
      }}
      {...stylex.props(styles.resizer)}
    />
  );
}

function ColumnsMenu<TData extends RowData>({
  table,
  onChange,
}: {
  readonly table: Table<DataTableFeatures, TData>;
  readonly onChange: (hidden: ReadonlyArray<string>) => void;
}) {
  const hideable = table.getAllLeafColumns().filter((column) => column.getCanHide());
  const visibleIds = hideable.filter((column) => column.getIsVisible()).map((column) => column.id);
  return (
    <MenuTrigger>
      <Button intent="ghost" size="sm" iconOnly aria-label="Choose columns">
        <Columns3 aria-hidden {...stylex.props(styles.toolbarIcon)} />
      </Button>
      <Menu
        aria-label="Visible columns"
        selectionMode="multiple"
        disallowEmptySelection
        selectedKeys={visibleIds}
        onSelectionChange={(keys) => {
          if (keys === "all") onChange([]);
          else
            onChange(hideable.filter((column) => !keys.has(column.id)).map((column) => column.id));
        }}
      >
        {hideable.map((column) => (
          <MenuItem key={column.id} id={column.id}>
            {columnLabel(column)}
          </MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  );
}

function BulkActions<TData extends RowData>({
  selection,
}: {
  readonly selection: DataTableSelection<TData>;
}) {
  return (
    <Toolbar
      label="Bulk actions"
      density="compact"
      actions={
        <Button intent="ghost" size="sm" onPress={() => selection.onChange([])}>
          Clear selection
        </Button>
      }
    >
      <span {...stylex.props(styles.selectedCount)}>
        {selection.selectedIds.length.toLocaleString(appLocale)} selected
      </span>
      {selection.actions(selection.selectedIds)}
    </Toolbar>
  );
}

const defaultPageSizes = [10, 25, 50, 100] as const;

function PaginationBar({ pagination }: { readonly pagination: DataTablePagination }) {
  const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const format = (value: number) => value.toLocaleString(appLocale);
  const sizes = pagination.pageSizeOptions ?? defaultPageSizes;
  return (
    <nav aria-label="Pagination" {...stylex.props(styles.pagination)}>
      {onPageSizeChange === undefined ? (
        <span />
      ) : (
        <span {...stylex.props(styles.pageSize)}>
          <span aria-hidden>Rows per page</span>
          <Select
            label="Rows per page"
            hideLabel
            size="sm"
            value={String(pageSize)}
            options={sizes.map((option) => ({ id: String(option), label: String(option) }))}
            onChange={(next) => onPageSizeChange(Number(next))}
            style={styles.pageSizeSelect}
          />
        </span>
      )}
      <span {...stylex.props(styles.pageNav)}>
        <span {...stylex.props(styles.pageRange)}>
          {format(from)}–{format(to)} of {format(total)}
        </span>
        <Button
          intent="ghost"
          size="sm"
          iconOnly
          aria-label="Previous page"
          isDisabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden {...stylex.props(styles.toolbarIcon)} />
        </Button>
        <Button
          intent="ghost"
          size="sm"
          iconOnly
          aria-label="Next page"
          isDisabled={page >= pageCount}
          onPress={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden {...stylex.props(styles.toolbarIcon)} />
        </Button>
      </span>
    </nav>
  );
}

function SpacerRow({ height, columns }: { readonly height: number; readonly columns: number }) {
  return (
    <tr aria-hidden>
      <td colSpan={columns} {...stylex.props(styles.spacer(height))} />
    </tr>
  );
}

export interface TwoLineCellProps {
  /** The main value, such as a run name or an identifier. */
  readonly primary: ReactNode;
  /** Quiet context under it, such as "Production · attempt 1". */
  readonly secondary?: ReactNode;
}

/** A cell with a main line and a quieter second line. Use the `default` density. */
export function TwoLineCell({ primary, secondary }: TwoLineCellProps) {
  return (
    <span {...stylex.props(styles.twoLine)}>
      <span {...stylex.props(styles.twoLinePrimary)}>{primary}</span>
      {secondary === undefined ? null : (
        <span {...stylex.props(styles.twoLineSecondary)}>{secondary}</span>
      )}
    </span>
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
    position: "relative",
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
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    minHeight: `calc(${size.controlSm} + 2 * ${space.sm})`,
    paddingBlock: space.sm,
    paddingInline: space.sm,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  toolbarMain: { flex: "1", minWidth: 0 },
  toolbarIcon: { width: size.iconSm, height: size.iconSm },
  selectedCount: {
    paddingInline: space.xs,
    fontSize: font.md,
    fontWeight: font.medium,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  empty: { padding: space.lg },
  scroller: {
    overflowX: "auto",
    containerType: "inline-size",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  scrollerHeight: (rows: number) => ({
    maxHeight: `${(rows + 1) * 2.25}rem`,
    overflowY: "auto",
  }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: font.md },
  tableFixed: (width: number) => ({ tableLayout: "fixed", width, minWidth: "100%" }),
  caption: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  // The header sits on its own band with full-strength text so the grid reads as a
  // table at a glance, not as a list of loose rows.
  thead: { position: "sticky", top: 0, zIndex: 2, backgroundColor: color.subtle },
  th: {
    paddingInline: { default: space.md, [container.belowSm]: space.sm },
    textAlign: "start",
    fontSize: font.md,
    fontWeight: font.medium,
    color: color.text,
    whiteSpace: "nowrap",
    backgroundColor: color.subtle,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  thResizable: { position: "relative", overflow: "hidden", textOverflow: "ellipsis" },
  columnWidth: (width: number) => ({ width }),
  resizer: {
    position: "absolute",
    top: space.sm,
    bottom: space.sm,
    right: 0,
    width: "0.25rem",
    borderRadius: radius.full,
    backgroundColor: {
      default: color.borderSubtle,
      ":hover": color.borderStrong,
      ":focus-visible": color.focus,
    },
    cursor: "col-resize",
    touchAction: "none",
    userSelect: "none",
    outlineStyle: "none",
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
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
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
  trAction: { cursor: "pointer" },
  trExpanded: { borderBottomColor: "transparent" },
  trSelected: { backgroundColor: { default: color.selected, ":hover": color.selected } },
  // In a narrow frame cell text wraps and the padding tightens, so the columns that stay fit
  // the frame instead of pushing the last ones out of view.
  td: {
    paddingInline: { default: space.md, [container.belowSm]: space.sm },
    verticalAlign: "middle",
    whiteSpace: { default: "nowrap", [container.belowSm]: "normal" },
    textAlign: "start",
    fontWeight: font.regular,
  },
  tdClipped: { overflow: "hidden", textOverflow: "ellipsis" },
  rowHeader: { color: color.text },
  stacked: {
    marginTop: "2px",
    fontSize: font.sm,
    fontWeight: font.regular,
    color: color.textMuted,
  },
  rowControl: {
    color: "inherit",
    textDecoration: { default: "none", ":hover": "underline" },
    textUnderlineOffset: "2px",
    textDecorationColor: color.borderStrong,
    borderRadius: radius.sm,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
    cursor: "pointer",
  },
  rowButton: {
    display: "inline",
    padding: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    textAlign: "start",
  },
  utilityCell: { width: "2.5rem", paddingInlineEnd: 0, lineHeight: "0" },
  expandButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.inset },
    color: color.textMuted,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  expandIcon: {
    width: size.iconSm,
    height: size.iconSm,
    transitionProperty: "transform",
    transitionDuration: motion.fast,
  },
  expandIconOpen: { transform: "rotate(90deg)" },
  detailRow: {
    backgroundColor: color.subtle,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  detailCell: { padding: 0, whiteSpace: "normal" },
  // The scroller is the size container, so the detail stays as wide as the visible table
  // and in view while a wide table scrolls sideways.
  detailContent: {
    position: "sticky",
    left: 0,
    boxSizing: "border-box",
    width: "100cqi",
    paddingBlock: space.md,
    paddingInlineEnd: space.lg,
    paddingInlineStart: "3.25rem",
  },
  spacer: (height: number) => ({ height, padding: 0 }),
  tfootCell: {
    height: "2.25rem",
    paddingInline: space.md,
    fontSize: font.sm,
    color: color.textMuted,
    whiteSpace: "nowrap",
    backgroundColor: color.raised,
  },
  sticky: { position: "sticky", zIndex: 1 },
  stickyStart: (offset: number) => ({ left: offset }),
  stickyEnd: (offset: number) => ({ right: offset }),
  stickyStartEdge: { boxShadow: `1px 0 0 ${color.borderSubtle}` },
  stickyEndEdge: { boxShadow: `-1px 0 0 ${color.borderSubtle}` },
  // Inherit the row surface so hover and selection reach the pinned cell.
  stickyRowSurface: { backgroundColor: "inherit" },
  numeric: { textAlign: "end", fontVariantNumeric: "tabular-nums" },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space.sm,
    minHeight: `calc(${size.controlSm} + 2 * ${space.sm})`,
    paddingBlock: space.sm,
    paddingInlineStart: space.md,
    paddingInlineEnd: space.sm,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    fontSize: font.sm,
    color: color.textMuted,
  },
  pageSize: { display: "inline-flex", alignItems: "center", gap: space.sm, whiteSpace: "nowrap" },
  pageSizeSelect: { width: "4.5rem" },
  pageNav: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    marginInlineStart: "auto",
  },
  pageRange: {
    paddingInlineEnd: space.xs,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  twoLine: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  twoLinePrimary: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" },
  twoLineSecondary: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: font.sm,
    color: color.textMuted,
  },
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

const hideBelow = stylex.create({
  sm: { display: { default: null, [container.belowSm]: "none" } },
  md: { display: { default: null, [container.belowMd]: "none" } },
  lg: { display: { default: null, [container.belowLg]: "none" } },
});

const showBelow = stylex.create({
  sm: { display: { default: "none", [container.belowSm]: "block" } },
  md: { display: { default: "none", [container.belowMd]: "block" } },
  lg: { display: { default: "none", [container.belowLg]: "block" } },
});

const densities = stylex.create({
  default: { paddingBlock: space.sm },
  compact: { paddingBlock: space.xs },
});

const densitiesHead = stylex.create({
  default: { height: "2.5rem" },
  compact: { height: size.controlLg },
});

const skeletonWidths = stylex.create({
  a: { width: "70%" },
  b: { width: "45%" },
  c: { width: "85%" },
  d: { width: "55%" },
});

// Indexable list of the skeleton widths, so neighbouring cells differ.
const skeletonWidthList = [skeletonWidths.a, skeletonWidths.b, skeletonWidths.c, skeletonWidths.d];
