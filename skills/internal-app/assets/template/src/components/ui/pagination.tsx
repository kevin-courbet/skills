import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "@/styles/tokens.stylex";
import { Button } from "./button";

export interface PaginationProps {
  readonly page: number;
  readonly pageCount: number;
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
