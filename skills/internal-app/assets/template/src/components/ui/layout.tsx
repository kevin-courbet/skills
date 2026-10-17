// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type ReactNode, useId } from "react";
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

export interface CardProps {
  /**
   * Names the group. With a title the card is a labelled section. A card that
   * stands for one object, such as a pull request, may lead with its icon and
   * end with a quiet identifier or a status badge.
   */
  readonly title?: ReactNode;
  /** Secondary line under the title. It may hold icons and inline metadata. */
  readonly description?: ReactNode;
  /** Heading level of the title: 2 on a page, 3 inside a Section. */
  readonly headingLevel?: 2 | 3;
  /** Quiet header content at the end of the title row: a total, a link, or one button. */
  readonly actions?: ReactNode;
  /** Footer bar under a divider, such as a line count or a "View all" link. */
  readonly footer?: ReactNode;
  /**
   * `default` pads the content. `sections` puts each child CardSection flush
   * against the edges, divided by lines, for tables, steppers, and logs.
   */
  readonly layout?: "default" | "sections";
  readonly children: ReactNode;
  readonly style?: StyleXStyles;
}

/**
 * Raised surface for a distinct, comparable, or actionable group. Content sits
 * directly on the card. Never nest a Card in a Card: divide a card with
 * CardSection rows instead.
 */
export function Card({
  title,
  description,
  headingLevel = 2,
  actions,
  footer,
  layout = "default",
  children,
  style,
}: CardProps) {
  const headingId = useId();
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const hasHeader = title !== undefined;
  const Root = hasHeader ? "section" : "div";
  return (
    <Root aria-labelledby={hasHeader ? headingId : undefined} {...stylex.props(styles.card, style)}>
      {hasHeader ? (
        <header {...stylex.props(styles.cardHeader)}>
          <div {...stylex.props(styles.cardHeading)}>
            <Heading id={headingId} {...stylex.props(styles.cardTitle)}>
              {title}
            </Heading>
            {description ? (
              <div {...stylex.props(styles.cardDescription)}>{description}</div>
            ) : null}
          </div>
          {actions ? <div {...stylex.props(styles.cardActions)}>{actions}</div> : null}
        </header>
      ) : null}
      {layout === "sections" ? (
        children
      ) : (
        <div {...stylex.props(styles.cardBody, hasHeader && styles.cardBodyAfterHeader)}>
          {children}
        </div>
      )}
      {footer ? <footer {...stylex.props(styles.cardFooter)}>{footer}</footer> : null}
    </Root>
  );
}

export interface CardSectionProps {
  /** `flush` removes the padding for content that has its own, such as a table or a log. */
  readonly padding?: "default" | "flush";
  /**
   * `inset` sinks the section into the inset surface, for raw output such as
   * logs or payloads. It is not a nested card: never use it for section content.
   */
  readonly tone?: "default" | "inset";
  readonly children: ReactNode;
}

/** One divided row of a Card with `layout="sections"`. A line separates it from the row above. */
export function CardSection({ padding = "default", tone = "default", children }: CardSectionProps) {
  return (
    <div
      {...stylex.props(
        styles.cardSection,
        padding === "default" && styles.cardSectionPadded,
        tone === "inset" && styles.cardSectionInset,
      )}
    >
      {children}
    </div>
  );
}

export interface StatDelta {
  readonly value: string;
  readonly direction: "up" | "down" | "flat";
  /** States whether the change is good; it defaults to up is good. */
  readonly tone?: "good" | "bad" | "neutral";
}

export interface StatTileProps {
  readonly label: string;
  readonly value: string;
  /** Short context such as "vs last month". */
  readonly hint?: string;
  readonly delta?: StatDelta;
  /** A compact chart under the value. Build it with Aperture; see references/charts.md. */
  readonly chart?: ReactNode;
  /** Source or method of the number, such as "Measured · catalog prices". */
  readonly footnote?: string;
}

function Delta({ delta }: { readonly delta: StatDelta }) {
  return (
    <span
      {...stylex.props(styles.statDelta, deltaTones[delta.tone ?? defaultTone[delta.direction]])}
    >
      {deltaGlyph[delta.direction]} {delta.value}
    </span>
  );
}

/** Overview number. The label stays quieter than the value. */
export function StatTile({ label, value, hint, delta, chart, footnote }: StatTileProps) {
  return (
    <div {...stylex.props(styles.stat)}>
      <span {...stylex.props(styles.statLabel)}>{label}</span>
      <span {...stylex.props(styles.statValueRow)}>
        <span {...stylex.props(styles.statValue)}>{value}</span>
        {delta ? <Delta delta={delta} /> : null}
      </span>
      {hint ? <span {...stylex.props(styles.statMeta)}>{hint}</span> : null}
      {chart ? <div {...stylex.props(styles.statChart)}>{chart}</div> : null}
      {footnote ? <span {...stylex.props(styles.statFootnote)}>{footnote}</span> : null}
    </div>
  );
}

export type StatStripTone = "danger" | "warning" | "success" | "info" | "muted";

export interface StatStripItem {
  readonly label: string;
  readonly value: ReactNode;
  /** Quiet context after the value, such as a unit or a count. */
  readonly hint?: string;
  /** Colors the value when the value itself is a status, such as failures or "Succeeded". */
  readonly tone?: StatStripTone;
  /** Secondary line under the value, such as "All stages passed in 1m 56s". */
  readonly detail?: ReactNode;
}

export interface StatStripProps {
  readonly items: ReadonlyArray<StatStripItem>;
  /**
   * `metric` shows large numbers. `status` shows one status word per cell with
   * a secondary line, such as CI, artifact, and traffic state.
   */
  readonly variant?: "metric" | "status";
  /**
   * `false` drops the border and surface so the strip sits directly in a
   * CardSection with `padding="flush"`. Keep the default on a page.
   */
  readonly framed?: boolean;
}

/**
 * Compact row of key facts separated by dividers. Use it at the top of a
 * detail page or a peek sheet, where StatTile cards would be too heavy.
 */
export function StatStrip({ items, variant = "metric", framed = true }: StatStripProps) {
  return (
    <dl {...stylex.props(styles.strip, framed && styles.stripFramed)}>
      {items.map((item) => (
        <div key={item.label} {...stylex.props(styles.stripItem)}>
          <dt {...stylex.props(styles.stripLabel)}>{item.label}</dt>
          <dd
            {...stylex.props(
              styles.stripValue,
              variant === "status" && styles.stripValueStatus,
              item.tone && stripTones[item.tone],
            )}
          >
            {item.value}
            {item.hint ? <span {...stylex.props(styles.stripHint)}>{item.hint}</span> : null}
          </dd>
          {item.detail === undefined ? null : (
            <dd {...stylex.props(styles.stripDetail)}>{item.detail}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

export interface DescriptionItem {
  readonly term: string;
  readonly detail: ReactNode;
  /** In the grid layout, `wide` spans two columns and `full` the whole row. */
  readonly span?: "wide" | "full";
}

export interface DescriptionListProps {
  readonly items: ReadonlyArray<DescriptionItem>;
  /**
   * `rows` puts each label left of its value, for detail pages and sheets.
   * `grid` puts the label above the value in columns, for the key facts of a
   * record in a card, such as status, environment, created, and duration.
   */
  readonly layout?: "rows" | "grid";
}

export function DescriptionList({ items, layout = "rows" }: DescriptionListProps) {
  if (layout === "grid")
    return (
      <dl {...stylex.props(styles.dlGrid)}>
        {items.map((item) => (
          <div
            key={item.term}
            {...stylex.props(
              styles.dlCell,
              item.span === "wide" && styles.dlCellWide,
              item.span === "full" && styles.dlCellFull,
            )}
          >
            <dt {...stylex.props(styles.dtGrid)}>{item.term}</dt>
            <dd {...stylex.props(styles.dd)}>{item.detail}</dd>
          </div>
        ))}
      </dl>
    );
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

/**
 * Card of settings rows. Each row puts the label on the left and the value or
 * control on the right. Use it for settings and configuration pages.
 */
export function SettingsCard({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section {...stylex.props(styles.settings)}>
      <header {...stylex.props(styles.settingsHeader)}>
        <div>
          <h2 {...stylex.props(styles.settingsTitle)}>{title}</h2>
          {description ? <p {...stylex.props(styles.settingsDescription)}>{description}</p> : null}
        </div>
        {actions}
      </header>
      <div {...stylex.props(styles.settingsRows)}>{children}</div>
    </section>
  );
}

export function SettingRow({
  label,
  description,
  children,
}: {
  readonly label: string;
  /** The consequence of the setting, in one short sentence. */
  readonly description?: string;
  /** The value, or the control with its own save action. */
  readonly children: ReactNode;
}) {
  return (
    <div {...stylex.props(styles.settingRow)}>
      <div {...stylex.props(styles.settingLabel)}>
        <span {...stylex.props(styles.settingName)}>{label}</span>
        {description ? (
          <span {...stylex.props(styles.settingDescription)}>{description}</span>
        ) : null}
      </div>
      <div {...stylex.props(styles.settingValue)}>{children}</div>
    </div>
  );
}

/** Row of filters and view controls above a list. */
export function Toolbar({
  children,
  label,
  density = "default",
  actions,
}: {
  readonly children: ReactNode;
  readonly label: string;
  /** `compact` centers 28px controls in one line, for a toolbar inside a DataTable frame. */
  readonly density?: "default" | "compact";
  /** View actions at the end of the row, such as refresh or export icon buttons. */
  readonly actions?: ReactNode;
}) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      {...stylex.props(styles.toolbar, density === "compact" && styles.toolbarCompact)}
    >
      {children}
      {actions ? <div {...stylex.props(styles.toolbarActions)}>{actions}</div> : null}
    </div>
  );
}

/** Identifier, hash, or code value. Mono at the small size, quieter than prose. */
export function Code({ children }: { readonly children: ReactNode }) {
  return <code {...stylex.props(styles.code)}>{children}</code>;
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
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.xl,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space.md,
    paddingBlock: space.md,
    paddingInline: space.lg,
  },
  cardHeading: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  cardTitle: {
    margin: 0,
    fontSize: font.md,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
  },
  cardDescription: { margin: 0, minWidth: 0, fontSize: font.sm, color: color.textMuted },
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: "1.25rem",
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  cardBody: { padding: space.lg, minWidth: 0 },
  cardBodyAfterHeader: { paddingTop: 0 },
  cardSection: {
    minWidth: 0,
    borderTopWidth: { default: "1px", ":first-child": 0 },
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
  cardSectionPadded: { paddingBlock: space.lg, paddingInline: space.lg },
  cardSectionInset: { backgroundColor: color.inset },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space.sm,
    minHeight: "2.5rem",
    paddingBlock: space.sm,
    paddingInline: space.lg,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
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
    borderRadius: radius.xl,
    minWidth: 0,
  },
  statLabel: { fontSize: font.sm, color: color.textMuted },
  statValueRow: { display: "flex", alignItems: "baseline", gap: space.sm, flexWrap: "wrap" },
  statValue: {
    fontSize: font.xxxl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
    fontVariantNumeric: "tabular-nums",
  },
  statMeta: { fontSize: font.sm, color: color.textMuted },
  statDelta: { fontSize: font.sm, fontWeight: font.medium, fontVariantNumeric: "tabular-nums" },
  statChart: { marginTop: space.sm, minWidth: 0 },
  statFootnote: { marginTop: space.xs, fontSize: font.xs, color: color.textMuted },
  strip: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.md]: "repeat(auto-fit, minmax(8rem, 1fr))",
    },
    margin: 0,
    overflow: "hidden",
  },
  stripFramed: {
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  stripValueStatus: { fontSize: font.md, fontWeight: font.medium },
  stripDetail: {
    margin: 0,
    fontSize: font.sm,
    color: color.textMuted,
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  dlGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 11rem), 1fr))",
    columnGap: space.xl,
    rowGap: space.lg,
    margin: 0,
  },
  dlCell: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  dlCellWide: { gridColumn: { default: "1 / -1", [media.md]: "span 2" } },
  dlCellFull: { gridColumn: "1 / -1" },
  dtGrid: { fontSize: font.sm, color: color.textMuted },
  stripItem: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
    paddingBlock: space.md,
    paddingInline: space.lg,
    // A negative margin hides the divider of the first item in each row.
    marginInlineStart: "-1px",
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
  },
  stripLabel: { fontSize: font.sm, color: color.textMuted },
  stripValue: {
    display: "flex",
    alignItems: "baseline",
    gap: space.xs,
    margin: 0,
    fontSize: font.xl,
    fontWeight: font.semibold,
    fontVariantNumeric: "tabular-nums",
    minWidth: 0,
  },
  stripHint: { fontSize: font.sm, fontWeight: font.regular, color: color.textMuted },
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
  settings: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  settingsHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
    paddingTop: space.md,
    paddingInline: space.lg,
  },
  settingsTitle: { fontSize: font.sm, fontWeight: font.medium, color: color.textMuted },
  settingsDescription: { fontSize: font.sm, color: color.textMuted, marginTop: space.xs },
  settingsRows: { display: "flex", flexDirection: "column", paddingBlock: space.xs },
  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: { default: space.xs, [media.sm]: space.lg },
    minHeight: "2.75rem",
    paddingBlock: space.sm,
    marginInline: space.lg,
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  settingLabel: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  settingName: { fontSize: font.md, fontWeight: font.medium, color: color.text },
  settingDescription: { fontSize: font.sm, color: color.textMuted, maxWidth: "48ch" },
  settingValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: space.sm,
    minWidth: 0,
    fontSize: font.md,
    color: color.text,
    textAlign: "end",
    overflowWrap: "anywhere",
  },
  toolbar: { display: "flex", alignItems: "flex-end", gap: space.md, flexWrap: "wrap" },
  toolbarCompact: { alignItems: "center", gap: space.sm },
  toolbarActions: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    marginInlineStart: "auto",
  },
  code: {
    fontFamily: font.mono,
    fontSize: font.xs,
    fontWeight: font.medium,
    color: color.textMuted,
    overflowWrap: "anywhere",
  },
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

const stripTones = stylex.create({
  danger: { color: color.danger },
  warning: { color: color.warning },
  success: { color: color.success },
  info: { color: color.info },
  muted: { color: color.textMuted },
});
