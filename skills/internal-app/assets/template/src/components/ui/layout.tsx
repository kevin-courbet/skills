import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { color, font, media, radius, size, space } from "@/styles/tokens.stylex";

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

/** Title row of a page. One primary action at most; secondary actions stay quiet. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header {...stylex.props(styles.pageHeader)}>
      <div {...stylex.props(styles.pageHeading)}>
        <h1 {...stylex.props(styles.pageTitle)}>{title}</h1>
        {description ? <p {...stylex.props(styles.pageDescription)}>{description}</p> : null}
      </div>
      {actions ? <div {...stylex.props(styles.pageActions)}>{actions}</div> : null}
    </header>
  );
}

export function Page({
  children,
  width = "full",
}: {
  readonly children: ReactNode;
  readonly width?: "full" | "reading";
}) {
  return (
    <div {...stylex.props(styles.page, width === "reading" && styles.pageReading)}>{children}</div>
  );
}

export function Section({
  title,
  description,
  children,
  actions,
}: {
  readonly title?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section {...stylex.props(styles.section)}>
      {title ? (
        <div {...stylex.props(styles.sectionHeader)}>
          <div>
            <h2 {...stylex.props(styles.sectionTitle)}>{title}</h2>
            {description ? <p {...stylex.props(styles.sectionDescription)}>{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Raised surface. Use only for distinct, comparable, or actionable groups. */
export function Card({
  children,
  style,
}: {
  readonly children: ReactNode;
  readonly style?: StyleXStyles;
}) {
  return <div {...stylex.props(styles.card, style)}>{children}</div>;
}

export interface StatTileProps {
  readonly label: string;
  readonly value: string;
  /** Short context such as "vs last month". */
  readonly hint?: string;
  /** tone states whether the change is good; it defaults to up is good. */
  readonly delta?: {
    readonly value: string;
    readonly direction: "up" | "down" | "flat";
    readonly tone?: "good" | "bad" | "neutral";
  };
}

/** Overview number. The label stays quieter than the value. */
export function StatTile({ label, value, hint, delta }: StatTileProps) {
  return (
    <div {...stylex.props(styles.stat)}>
      <span {...stylex.props(styles.statLabel)}>{label}</span>
      <span {...stylex.props(styles.statValue)}>{value}</span>
      {delta || hint ? (
        <span {...stylex.props(styles.statMeta)}>
          {delta ? (
            <span
              {...stylex.props(
                styles.statDelta,
                deltaTones[delta.tone ?? defaultTone[delta.direction]],
              )}
            >
              {deltaGlyph[delta.direction]} {delta.value}
            </span>
          ) : null}
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function DescriptionList({
  items,
}: {
  readonly items: ReadonlyArray<{ readonly term: string; readonly detail: ReactNode }>;
}) {
  return (
    <dl {...stylex.props(styles.dl)}>
      {items.map((item) => (
        <div key={item.term} {...stylex.props(styles.dlRow)}>
          <dt {...stylex.props(styles.dt)}>{item.term}</dt>
          <dd {...stylex.props(styles.dd)}>{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Row of filters and view controls above a list. Fields align on their bottom edge. */
export function Toolbar({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <div role="toolbar" aria-label={label} {...stylex.props(styles.toolbar)}>
      {children}
    </div>
  );
}

export function Kbd({ children }: { readonly children: ReactNode }) {
  return <kbd {...stylex.props(styles.kbd)}>{children}</kbd>;
}

export function Separator() {
  return <hr {...stylex.props(styles.separator)} />;
}

const deltaGlyph = { up: "▲", down: "▼", flat: "•" } as const;

const styles = stylex.create({
  page: {
    display: "flex",
    flexDirection: "column",
    gap: space.xxl,
    width: "100%",
    maxWidth: size.contentMax,
    paddingBlock: { default: space.lg, [media.md]: space.xxl },
    paddingInline: { default: space.lg, [media.md]: space.xxl },
  },
  pageReading: { maxWidth: size.readingMax },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.lg,
    flexWrap: "wrap",
  },
  pageHeading: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  pageTitle: {
    fontSize: font.xxl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
  },
  pageDescription: { fontSize: font.md, color: color.textMuted, maxWidth: "64ch" },
  pageActions: { display: "flex", alignItems: "center", gap: space.sm, flexShrink: 0 },
  section: { display: "flex", flexDirection: "column", gap: space.md },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space.md,
  },
  sectionTitle: { fontSize: font.lg, fontWeight: font.semibold, lineHeight: font.leadingTight },
  sectionDescription: { fontSize: font.md, color: color.textMuted, marginTop: space.xs },
  card: {
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    padding: space.lg,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    minWidth: 0,
  },
  statLabel: { fontSize: font.sm, color: color.textMuted },
  statValue: {
    fontSize: font.xxxl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
    fontVariantNumeric: "tabular-nums",
  },
  statMeta: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    fontSize: font.sm,
    color: color.textMuted,
  },
  statDelta: { fontWeight: font.medium, fontVariantNumeric: "tabular-nums" },
  dl: { display: "flex", flexDirection: "column", margin: 0 },
  dlRow: {
    display: "grid",
    gridTemplateColumns: "minmax(8rem, 12rem) 1fr",
    gap: space.lg,
    paddingBlock: space.sm,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  dt: { fontSize: font.md, color: color.textMuted },
  dd: { fontSize: font.md, color: color.text, margin: 0, minWidth: 0, overflowWrap: "anywhere" },
  toolbar: { display: "flex", alignItems: "flex-end", gap: space.md, flexWrap: "wrap" },
  kbd: {
    display: "inline-flex",
    alignItems: "center",
    height: "1.25rem",
    paddingInline: "0.3rem",
    fontFamily: font.mono,
    fontSize: font.xs,
    color: color.textMuted,
    backgroundColor: color.subtle,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderBottomWidth: "2px",
    borderRadius: radius.sm,
  },
  separator: {
    borderStyle: "none",
    height: "1px",
    backgroundColor: color.borderSubtle,
    marginBlock: space.lg,
  },
});

const defaultTone = { up: "good", down: "bad", flat: "neutral" } as const;

const deltaTones = stylex.create({
  good: { color: color.success },
  bad: { color: color.danger },
  neutral: { color: color.textMuted },
});
