// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A small read-only table, such as the parts of an estimate with a total row.
 *
 * @layer primitive
 * @keywords table, simple table, static table, small table, parts list, line items, estimate total, totals row, invoice lines, price breakdown, read-only table, numeric columns
 * @related DataTable, Layout, ScrollShadow, TextLink, ProgressCircle, Card
 * @notes tables, internal-app-cards, internal-app-composition
 *
 * Use it for up to about 20 rows that a page shows in full, such as the parts
 * and the labor of one repair estimate, or the line items of one invoice. Do
 * not use it for records that people sort, filter, page, select, or open:
 * use `DataTable`. Do not use it for the facts of one object, such as the
 * customer and the due date of a job: use `DescriptionList` of `Layout`.
 *
 * ## Behavior
 * - It is a native `<table>` with a hidden caption, so screen readers name it
 *   and read the column headers with each cell.
 * - The cells of the `rowHeader` column are row headers.
 * - A `numeric` column aligns right with tabular figures, in the body, the
 *   header, and the footer.
 * - A column `footer` adds a footer row, such as "Estimate total". The footer
 *   shows only when there are rows.
 * - `emptyState` shows under the header when `rows` is empty.
 * - When the table is wider than its frame, it scrolls sideways. The edges
 *   fade, and the scroll area takes focus so the keyboard can scroll it.
 *
 * ## Rules
 * - Format numbers and money with `src/lib/locale.ts` before you give them.
 * - Use `framed={false}` inside a `Card` or a `CardSection`, which has a frame.
 * - The table has no row actions. Put a link to a record in a cell with
 *   `TextLink variant="quiet"`.
 *
 * ## Example
 * ```tsx
 * <Table
 *   label="Parts"
 *   rows={estimate.parts}
 *   getRowId={(part) => part.id}
 *   rowHeader="part"
 *   emptyState={<EmptyState icon={Package} title="No parts on this estimate" />}
 *   columns={[
 *     { id: "part", header: "Part", cell: (part) => part.name, footer: "Estimate total" },
 *     { id: "quantity", header: "Qty", numeric: true, cell: (part) => formatInteger(part.quantity) },
 *     { id: "price", header: "Price", numeric: true, cell: (part) => formatCurrency(part.total), footer: formatCurrency(estimate.total) },
 *   ]}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { field } from "@/components/helpers/field";
import { ScrollShadow } from "./scroll-shadow";

export interface TableColumn<Row> {
  /** A stable id. `rowHeader` names a column by this id. */
  readonly id: string;
  /** The visible column header, such as "Price". */
  readonly header: string;
  /** The content of the cell of one row. Format numbers before you return them. */
  readonly cell: (row: Row) => ReactNode;
  /** Aligns the column right with tabular figures, for counts and money. */
  readonly numeric?: boolean;
  /** The content of this column in the footer row, such as a total or "Estimate total". */
  readonly footer?: ReactNode;
}

export interface TableProps<Row> {
  /** The name of the table for screen readers, such as "Parts". It is also the name of the scroll area. */
  readonly label: string;
  /** The columns, in the order that they show. */
  readonly columns: ReadonlyArray<TableColumn<Row>>;
  /** All rows, in the order that they show. Keep them to about 20. */
  readonly rows: ReadonlyArray<Row>;
  /** A stable id for each row. */
  readonly getRowId: (row: Row) => string;
  /** The id of the column whose cells name the rows. Defaults to the first column. */
  readonly rowHeader?: string;
  /** Shows under the header when `rows` is empty. */
  readonly emptyState: ReactNode;
  /** `false` removes the border and the corners, for a table inside a `Card`. */
  readonly framed?: boolean;
}

export function Table<Row>({
  label,
  columns,
  rows,
  getRowId,
  rowHeader,
  emptyState,
  framed = true,
}: TableProps<Row>) {
  const first = columns[0];
  if (first === undefined) throw new Error(`Table "${label}" has no columns.`);
  const headerId = rowHeader ?? first.id;
  if (!columns.some((column) => column.id === headerId))
    throw new Error(`Table "${label}" has rowHeader "${headerId}", but no column has that id.`);
  const hasFooter = rows.length > 0 && columns.some((column) => column.footer !== undefined);
  const cellStyles = (column: TableColumn<Row>) => [
    styles.cell,
    column.numeric === true && styles.numeric,
  ];
  return (
    <div {...stylex.props(styles.frame, framed && styles.framed)}>
      <ScrollShadow orientation="horizontal" label={label}>
        <table {...stylex.props(styles.table)}>
          <caption {...stylex.props(field.hiddenLabel)}>{label}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} scope="col" {...stylex.props(...cellStyles(column), styles.th)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} {...stylex.props(styles.empty)}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={getRowId(row)} {...stylex.props(styles.row)}>
                  {columns.map((column) =>
                    column.id === headerId ? (
                      <th
                        key={column.id}
                        scope="row"
                        {...stylex.props(...cellStyles(column), styles.rowHeader)}
                      >
                        {column.cell(row)}
                      </th>
                    ) : (
                      <td key={column.id} {...stylex.props(...cellStyles(column))}>
                        {column.cell(row)}
                      </td>
                    ),
                  )}
                </tr>
              ))
            )}
          </tbody>
          {hasFooter ? (
            <tfoot>
              <tr>
                {columns.map((column) =>
                  column.id === headerId ? (
                    <th
                      key={column.id}
                      scope="row"
                      {...stylex.props(...cellStyles(column), styles.foot)}
                    >
                      {column.footer}
                    </th>
                  ) : (
                    <td key={column.id} {...stylex.props(...cellStyles(column), styles.foot)}>
                      {column.footer}
                    </td>
                  ),
                )}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </ScrollShadow>
    </div>
  );
}

const styles = stylex.create({
  frame: { minWidth: 0, overflow: "hidden" },
  framed: {
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: font.md },
  cell: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    textAlign: "start",
    verticalAlign: "middle",
    fontWeight: font.regular,
    color: color.text,
  },
  numeric: { textAlign: "end", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  th: {
    height: "2.5rem",
    paddingBlock: 0,
    fontWeight: font.medium,
    color: color.textMuted,
    whiteSpace: "nowrap",
    backgroundColor: color.subtle,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  // A rule only between rows: the frame closes the last row.
  row: {
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  rowHeader: { fontWeight: font.regular },
  foot: {
    fontWeight: font.semibold,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
  empty: { padding: space.lg },
});
