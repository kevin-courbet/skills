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

export interface StatStripItem {
  readonly label: string;
  readonly value: ReactNode;
  /** Quiet context after the value, such as a unit or a count. */
  readonly hint?: string;
  /** Colors the value when the number itself is a status, such as failures. */
  readonly tone?: "danger" | "warning" | "success";
}

/**
 * Compact row of key facts separated by dividers. Use it at the top of a
 * detail page or a peek sheet, where StatTile cards would be too heavy.
 */
export function StatStrip({ items }: { readonly items: ReadonlyArray<StatStripItem> }) {
  return (
    <dl {...stylex.props(styles.strip)}>
      {items.map((item) => (
        <div key={item.label} {...stylex.props(styles.stripItem)}>
          <dt {...stylex.props(styles.stripLabel)}>{item.label}</dt>
          <dd {...stylex.props(styles.stripValue, item.tone && stripTones[item.tone])}>
            {item.value}
            {item.hint ? <span {...stylex.props(styles.stripHint)}>{item.hint}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
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
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.xl,
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
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
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
});
