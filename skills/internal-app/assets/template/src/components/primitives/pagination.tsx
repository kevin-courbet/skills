/**
 * Previous and next buttons with the page position, for a server-paged list that is not a table.
 *
 * @layer primitive
 * @keywords pagination, pager, next page, previous page, paging, page buttons, card grid paging
 * @related DataTable, Item, Layout
 * @notes navigation, internal-app-url-filters
 *
 * Use it under a card grid or an `ItemList` that the server pages. Do not use
 * it for a table: use the `pagination` footer of `DataTable`. Do not use it for
 * a list that the client already holds.
 *
 * ## Behavior
 * - It renders nothing when there is one page or no page.
 * - Previous is disabled on the first page, and Next on the last page.
 *
 * ## Rules
 * - Keep the page in a search param, so a reload and a link show the same
 *   page.
 *
 * ## Example
 * ```tsx
 * <Pagination
 *   page={search.page ?? 1}
 *   pageCount={Math.ceil(total / pageSize)}
 *   onPageChange={(page) => navigate({ search: (previous) => ({ ...previous, page }) })}
 *   format={formatInteger}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "@/styles/tokens.stylex";
import { Button } from "./button";

export interface PaginationProps {
  /** The current page. The first page is 1. */
  readonly page: number;
  /** The number of pages, from the server total. */
  readonly pageCount: number;
  /** Receives the page that people go to. */
  readonly onPageChange: (page: number) => void;
  /** Formats page numbers with the app locale. */
  readonly format?: (value: number) => string;
}

/** Previous and next paging for server-paged lists. Renders nothing for one page. */
export function Pagination({ page, pageCount, onPageChange, format = String }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" {...stylex.props(styles.root)}>
      <span {...stylex.props(styles.status)}>
        Page {format(page)} of {format(pageCount)}
      </span>
      <div {...stylex.props(styles.buttons)}>
        <Button size="sm" isDisabled={page <= 1} onPress={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button size="sm" isDisabled={page >= pageCount} onPress={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}

const styles = stylex.create({
  root: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.md },
  status: { fontSize: font.sm, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  buttons: { display: "flex", gap: space.sm },
});
