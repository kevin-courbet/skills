import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { color, font, space } from "@/styles/tokens.stylex";

/** One variant group or one state of a kit component. The catalog shows it in each theme. */
export type Specimen = {
  /** What the specimen shows, such as "Intents" or "Disabled and pending". */
  readonly title: string;
  /** One sentence for the reviewer, such as the rule that the specimen shows. */
  readonly note?: string;
  /** Renders the specimen. The catalog calls it once for each theme column. */
  readonly render: () => ReactNode;
  /** Puts the theme columns one above the other, for a wide pattern such as a table or a board. */
  readonly wide?: boolean;
};

/** The specimens of one kit component. */
export type Section = {
  /** The kit doc id, as `design components` prints it, such as "Button". */
  readonly component: string;
  /** The specimens, from the most common use to the edge cases. */
  readonly specimens: ReadonlyArray<Specimen>;
};

/** Declares the section of one kit component. Each file in `sections/` exports one as default. */
export function defineSection(section: Section): Section {
  return section;
}

/** Items in a row that wraps, such as the intents of a button. */
export function Row({
  children,
  align = "center",
}: {
  readonly children: ReactNode;
  /** Vertical alignment of the items. */
  readonly align?: "center" | "start";
}) {
  return <div {...stylex.props(styles.row, align === "start" && styles.alignStart)}>{children}</div>;
}

/** Items in a column, such as fields in their states. */
export function Column({
  children,
  width,
}: {
  readonly children: ReactNode;
  /** A maximum width, such as "20rem" for fields. */
  readonly width?: string;
}) {
  return <div {...stylex.props(styles.column, width !== undefined && styles.width(width))}>{children}</div>;
}

/** One item with a caption under it that names its variant or state. */
export function Labeled({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <figure {...stylex.props(styles.labeled)}>
      {children}
      <figcaption {...stylex.props(styles.caption)}>{label}</figcaption>
    </figure>
  );
}

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.lg },
  alignStart: { alignItems: "flex-start" },
  column: { display: "flex", flexDirection: "column", gap: space.lg, minWidth: 0 },
  width: (width: string) => ({ maxWidth: width, width: "100%" }),
  labeled: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.sm,
    margin: 0,
    minWidth: 0,
  },
  caption: { fontSize: font.sm, color: color.textFaint },
});
