// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * The parts of a page: the header, sections, cards, overview numbers, read-only facts, settings rows, and the toolbar of a list.
 *
 * @layer primitive
 * @keywords page layout, page header, section, split form section, card, card sections, stat tiles, overview numbers, kpi, stat strip, description list, key facts, settings page, settings card, setting row, toolbar, filter row, meta line, inline code, keyboard key, separator, reading width
 * @related DataTable, Filters, FormLayout, ControlSize, Density, Identifier, Badge, Sparkline, AppShell
 * @notes kit-recipes, kit-composition, kit-cards, kit-forms, kit-writing, hierarchy, spacing, dashboards
 *
 * Build every page from these parts, and do not restyle them in an app. Do
 * not use them for the fields of a long form: use `FormLayout` with one
 * `Section layout="split"` for each part. Do not use `Card` rows for records
 * that people compare: use `DataTable`, or `ItemList` for records that people
 * act on one at a time.
 *
 * ## Behavior
 * - `Page` sets the width, the padding, and the density of all its content,
 *   and of the overlays that the content opens.
 * - `PageHeader` renders the only `<h1>` of the page. `Section`,
 *   `SettingsCard`, and `Card` render an `<h2>`, or an `<h3>` for a `Card`
 *   with `headingLevel={3}`.
 *
 * ## Rules
 * - Start each page with a `PageHeader`.
 * - Use `Page width="reading"` for a detail page, a form, and a settings page.
 * - For the general page rules, see kit-composition and kit-recipes.
 *
 * ## Example
 * ```tsx
 * <Page width="reading">
 *   <PageHeader title="Settings" description="These settings apply to the whole workspace." />
 *   <SettingsCard title="Notifications">
 *     <SettingRow label="Daily summary" description="A summary of failed runs arrives at 08:00.">
 *       <Switch aria-label="Daily summary" isSelected={daily} onChange={setDaily} />
 *     </SettingRow>
 *   </SettingsCard>
 * </Page>
 * ```
 *
 * ## PageHeader
 * - Put a `{" "}` between the parts of a rich title, so that the heading
 *   reads with a space.
 * - Put one primary action at most in `actions`. The actions never grow wider
 *   than the header, so a wrapping control such as
 *   `RadioGroup appearance="chips"` wraps in place.
 *
 * ## Section
 * A `Section` holds its content directly, with spacing. It has two layouts:
 * - `stacked` puts the title over the content, with `actions` at the end of
 *   the title row.
 * - `split` puts the title and the description in a column on the left and
 *   the content on the right. Use it for the parts of a long form or a
 *   settings page, and let the description say what the answers change.
 *
 * The split section is a container, so its own width sets the layout. The
 * title column is 15rem wide, 10rem wide when the section is narrower than
 * the `md` breakpoint, and goes over the content when the section is
 * narrower than `sm` (640px). The 10rem column keeps a section next to a
 * `FormPreview` split on a wide screen. A line divides consecutive split
 * sections.
 *
 * Put a `Card` in a `Section` only for distinct, comparable, or actionable
 * groups, such as two cards side by side.
 *
 * ## Card
 * A raised surface for one distinct, comparable, or actionable group. Do not
 * put a card, a framed panel, or any second bordered box in a card. To divide
 * a card, use `layout="sections"` with one `CardSection` for each block. See
 * kit-cards.
 *
 * ## StatTile
 * - Put the tiles of an overview in a grid that has one column below
 *   `media.sm`.
 * - Format `value` with `src/lib/locale.ts`, and name the source of the
 *   number in `footnote`.
 * - Use the kit `Sparkline` (`src/components/primitives/sparkline.tsx`) for
 *   `chart`.
 *
 * ## StatStrip
 * A divided row of key facts. Use it at the top of a detail page or a peek
 * sheet, where `StatTile` cards are too heavy.
 *
 * ## DescriptionList
 * The read-only facts of a record, as label and value pairs. Use `StatStrip`
 * for the few facts that people read first.
 *
 * ## SettingsCard
 * A card of `SettingRow` rows for a settings page. Each row puts the label on
 * the left and the value or the control on the right.
 * - Set `hideLabel` on a field in a `SettingRow`, because the row names it.
 *
 * ## Toolbar
 * A row of filters and view controls above a list. It sets the control size
 * of its row, so all controls in it have the same height.
 * - Put the search field first.
 * - Put the toolbar on the page, above the table, when it holds only a search
 *   and `Filters` and the table is the one subject of the page.
 * - Put it in the `DataTable` frame, with the `toolbar` prop, when it holds
 *   more controls, such as a scope `Select` or the column menu. Do this also
 *   when the page has several tables, so the controls show which table they
 *   change.
 * - Do not set `size` on the controls in a toolbar. `check` fails on a
 *   `Button` with a `size` in a `Toolbar`. Set `size` on the `Toolbar` only
 *   when the default is wrong.
 *
 * ## MetaLine
 * Separate facts on one line, such as an environment and an attempt under a
 * run name. A gap separates the facts, so do not add a separator character.
 * The line wraps between facts, never in one fact. Give the identifying fact
 * a stronger role, such as `Code` or a status word, when it needs one.
 *
 * ## Code
 * Use `Code` for inline code and commands, and `Kbd` for a key. Use
 * `Identifier` for a value that people copy, and `CodeBlock` for code on
 * several lines.
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { LinkComponentProps } from "@tanstack/react-router";
import { type ReactNode, useId } from "react";
import { touchDensity } from "@/styles/themes";
import {
  type ControlSize,
  ControlSizeProvider,
  useControlSize,
} from "@/components/helpers/control-size";
import {
  type Density,
  DensityProvider,
  ShellDensityProvider,
  useShellPageDensity,
} from "@/components/helpers/density";
import { color, container, font, media, radius, size, space } from "@/styles/tokens.stylex";
import { TextLink } from "./text-link";

export interface PageHeaderProps {
  /**
   * The page name, inside the page's only `<h1>`. A detail page may lead with
   * the record `Identifier size="lg"` and follow it with a status `Badge` or
   * `StatusDot`; the parts wrap as one heading line.
   */
  readonly title: ReactNode;
  /** Secondary line under the title. Inline content flows as text: links, `Code`, and a `Kbd`. */
  readonly description?: ReactNode;
  /** Controls at the end of the title row. */
  readonly actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header {...stylex.props(styles.pageHeader)}>
      <div {...stylex.props(styles.pageHeading)}>
        <h1 {...stylex.props(styles.pageTitle)}>{title}</h1>
        {description === undefined ? null : (
          <div {...stylex.props(styles.pageDescription)}>{description}</div>
        )}
      </div>
      {actions ? <div {...stylex.props(styles.pageActions)}>{actions}</div> : null}
    </header>
  );
}

export function Page({
  children,
  width = "full",
  density = "default",
}: {
  /** The content of the page: a `PageHeader`, then the sections. */
  readonly children: ReactNode;
  /** `reading` makes the page narrower, for a detail page, a form, or a settings page. */
  readonly width?: "full" | "reading";
  /**
   * "touch" makes controls and text larger for a shared tablet or kiosk. Use it
   * for a whole page, never for one control. Dialogs, sheets, popovers, menus,
   * and tooltips that the page opens follow it. On a touch device (a coarse
   * pointer, or a window below the lg breakpoint), the app shell then moves its
   * sidebar into the navigation sheet, and its top bar, that sheet, and the top
   * bar menus take the same density. On a desktop with a mouse, the shell keeps
   * its sidebar and its top bar. Toasts and the command palette keep the
   * default density.
   */
  readonly density?: Density;
}) {
  const isShellPage = useShellPageDensity(density);
  return (
    <DensityProvider density={density}>
      <ShellDensityProvider onPageDensity={null}>
        {/* AppShell reads this attribute with :has(), so the server renders the shell for the page. */}
        <div
          data-page-density={isShellPage ? density : undefined}
          {...stylex.props(
            density === "touch" && touchDensity,
            styles.page,
            width === "reading" && styles.pageReading,
            density === "touch" && styles.pageTouch,
          )}
        >
          {children}
        </div>
      </ShellDensityProvider>
    </DensityProvider>
  );
}

export function Section({
  title,
  description,
  children,
  actions,
  layout = "stacked",
}: {
  /** The name of the part. The split layout needs it. */
  readonly title?: string;
  /** One sentence under the title. In the split layout, it says what the answers change. */
  readonly description?: string;
  /** Content at the end of the title row, such as one button. The split layout has no actions. */
  readonly actions?: ReactNode;
  /** `stacked` puts the title over the content. `split` puts the title in a column on the left. */
  readonly layout?: "stacked" | "split";
  /** The content of the part. */
  readonly children: ReactNode;
}) {
  const titleId = useId();
  if (layout === "split") {
    if (title === undefined) throw new Error("Section: the split layout needs a title.");
    if (actions !== undefined) throw new Error("Section: the split layout has no actions.");
    return (
      <section aria-labelledby={titleId} {...stylex.props(styles.splitSection)}>
        <div {...stylex.props(styles.split)}>
          <div {...stylex.props(styles.splitHeader)}>
            <h2 id={titleId} {...stylex.props(styles.sectionTitle)}>
              {title}
            </h2>
            {description ? (
              <p {...stylex.props(styles.sectionDescription, styles.splitDescription)}>
                {description}
              </p>
            ) : null}
          </div>
          <div {...stylex.props(styles.splitBody)}>{children}</div>
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby={title ? titleId : undefined} {...stylex.props(styles.section)}>
      {title ? (
        <div {...stylex.props(styles.sectionHeader)}>
          <div>
            <h2 id={titleId} {...stylex.props(styles.sectionTitle)}>
              {title}
            </h2>
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
  /** The content, or `CardSection` rows with `layout="sections"`. */
  readonly children: ReactNode;
  /** StyleX styles for the root, such as a width or a grid position. */
  readonly style?: StyleXStyles;
}

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
  /** The content of the row. */
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
  /** The formatted change, such as "12%". */
  readonly value: string;
  /** Sets the arrow before the value. */
  readonly direction: "up" | "down" | "flat";
  /** States whether the change is good; it defaults to up is good. */
  readonly tone?: "good" | "bad" | "neutral";
}

export interface StatTileProps {
  /** What the number counts, such as "Open incidents". */
  readonly label: string;
  /** The formatted number. */
  readonly value: string;
  /** Short context such as "vs last month". */
  readonly hint?: string;
  /** The change since the previous period, after the value. */
  readonly delta?: StatDelta;
  /** A compact chart under the value, such as a `Sparkline`. */
  readonly chart?: ReactNode;
  /** Source or method of the number, such as "Measured from catalog prices". */
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

/** Router link props of a stat that opens the records it counts. */
export type StatStripLink = Omit<
  LinkComponentProps<"a">,
  | "children"
  | "className"
  | "style"
  | "activeProps"
  | "inactiveProps"
  | "id"
  | "aria-label"
  | "aria-labelledby"
>;

export interface StatStripItem {
  /** The name of the fact. It must be unique in the strip. */
  readonly label: string;
  /** The number or the status word. */
  readonly value: ReactNode;
  /** Quiet context after the value, such as a unit or a count. */
  readonly hint?: string;
  /** Colors the value when the value itself is a status, such as failures or "Succeeded". */
  readonly tone?: StatStripTone;
  /** Secondary line under the value, such as "All stages passed in 1m 56s". */
  readonly detail?: ReactNode;
  /**
   * Makes the whole cell open the records it counts, such as the list filtered
   * to them. The link name is the label and the value, such as "Overdue 12".
   */
  readonly link?: StatStripLink;
}

export interface StatStripProps {
  /** The facts, in the order that people read them. */
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

export function StatStrip({ items, variant = "metric", framed = true }: StatStripProps) {
  return (
    <dl {...stylex.props(styles.strip, framed && styles.stripFramed)}>
      {items.map((item) => (
        <StatStripCell key={item.label} item={item} variant={variant} />
      ))}
    </dl>
  );
}

function StatStripCell({
  item,
  variant,
}: {
  readonly item: StatStripItem;
  readonly variant: NonNullable<StatStripProps["variant"]>;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  return (
    <div {...stylex.props(styles.stripItem, item.link && styles.stripItemLinked)}>
      <dt id={item.link ? labelId : undefined} {...stylex.props(styles.stripLabel)}>
        {item.label}
      </dt>
      <dd
        {...stylex.props(
          styles.stripValue,
          variant === "status" && styles.stripValueStatus,
          item.tone && stripTones[item.tone],
        )}
      >
        {item.link ? (
          // The name keeps the visible label and value, so screen reader and voice control users hear and say the count.
          <TextLink
            {...item.link}
            variant="quiet"
            id={valueId}
            aria-labelledby={`${labelId} ${valueId}`}
          >
            {item.value}
            {/* Covers the cell, so a click on the label or the detail opens the link too. */}
            <span aria-hidden {...stylex.props(styles.stripLinkCover)} />
          </TextLink>
        ) : (
          item.value
        )}
        {item.hint ? <span {...stylex.props(styles.stripHint)}>{item.hint}</span> : null}
      </dd>
      {item.detail === undefined ? null : (
        <dd {...stylex.props(styles.stripDetail)}>{item.detail}</dd>
      )}
    </div>
  );
}

export interface DescriptionItem {
  /** The label. It must be unique in the list. */
  readonly term: string;
  /** The value. */
  readonly detail: ReactNode;
  /** In the grid layout, `wide` spans two columns and `full` the whole row. */
  readonly span?: "wide" | "full";
}

export interface DescriptionListProps {
  /** The facts, in the order that people read them. */
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

export function SettingsCard({
  title,
  description,
  actions,
  children,
}: {
  /** The name of the group of settings. */
  readonly title: string;
  /** One sentence that says what the group changes. */
  readonly description?: string;
  /** Content at the end of the title row, such as one button. */
  readonly actions?: ReactNode;
  /** `SettingRow` elements. */
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
  /** The name of the setting. */
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

export function Toolbar({
  children,
  label,
  size: explicitSize,
  actions,
}: {
  /** The controls of the row. */
  readonly children: ReactNode;
  /** The accessible name of the row, such as "Filter items". */
  readonly label: string;
  /**
   * Height of every control in the row. Defaults to the size of the
   * surrounding row: `sm` inside a DataTable frame, `md` elsewhere. `sm`
   * also centers the controls in one line.
   */
  readonly size?: ControlSize;
  /** View actions at the end of the row, such as refresh or export icon buttons. */
  readonly actions?: ReactNode;
}) {
  const rowSize = useControlSize();
  const sizeKey = explicitSize ?? rowSize;
  return (
    <ControlSizeProvider size={sizeKey}>
      <div
        role="toolbar"
        aria-label={label}
        {...stylex.props(styles.toolbar, sizeKey === "sm" && styles.toolbarCompact)}
      >
        {children}
        {actions ? <div {...stylex.props(styles.toolbarActions)}>{actions}</div> : null}
      </div>
    </ControlSizeProvider>
  );
}

export interface MetaLineProps {
  /**
   * One element per fact, such as a team and a time zone. Never pass a string
   * that joins facts with a separator.
   */
  readonly items: ReadonlyArray<ReactNode>;
}

export function MetaLine({ items }: MetaLineProps) {
  return (
    <span {...stylex.props(styles.metaLine)}>
      {items.map((item, index) =>
        item === null || item === undefined || item === false ? null : (
          <span key={index} {...stylex.props(styles.metaLineItem)}>
            {item}
          </span>
        ),
      )}
    </span>
  );
}

export function Code({
  children,
}: {
  /** The code, the command, or the value. */
  readonly children: ReactNode;
}) {
  return <code {...stylex.props(styles.code)}>{children}</code>;
}

export function Kbd({
  children,
}: {
  /** The name of the key, such as "Esc" or "/". */
  readonly children: ReactNode;
}) {
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
  // Text inherits the computed body size, so the touch page sets its own size again.
  pageTouch: { fontSize: font.md, lineHeight: font.leadingNormal },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.lg,
    flexWrap: "wrap",
  },
  pageHeading: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
    maxWidth: "100%",
  },
  pageTitle: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: space.md,
    rowGap: space.xs,
    minWidth: 0,
    margin: 0,
    fontSize: font.xxl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
    overflowWrap: "anywhere",
  },
  pageDescription: { minWidth: 0, maxWidth: "64ch", fontSize: font.md, color: color.textMuted },
  // The actions keep their width beside the title, but never grow wider than the
  // header, so a wrapping control such as a chip group wraps instead of overflowing.
  pageActions: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    flexShrink: 0,
    maxWidth: "100%",
  },
  section: { display: "flex", flexDirection: "column", gap: space.md },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space.md,
  },
  sectionTitle: { fontSize: font.lg, fontWeight: font.semibold, lineHeight: font.leadingTight },
  sectionDescription: { fontSize: font.md, color: color.textMuted, marginTop: space.xs },
  // The section is its own container, so the split follows the width it gets, not the window.
  splitSection: {
    containerType: "inline-size",
    paddingTop: { default: space.xxl, ":first-child": 0 },
    borderTopWidth: { default: "1px", ":first-child": 0 },
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
  split: {
    display: "grid",
    // Next to a form preview, a section on a wide screen is just under the md width.
    // A narrower title column there keeps the fields beside their title.
    gridTemplateColumns: {
      default: "minmax(10rem, 15rem) minmax(0, 1fr)",
      [container.belowMd]: {
        default: "10rem minmax(0, 1fr)",
        [container.belowSm]: "minmax(0, 1fr)",
      },
    },
    columnGap: space.xxxl,
    rowGap: space.lg,
  },
  splitHeader: { display: "flex", flexDirection: "column", minWidth: 0 },
  splitDescription: { lineHeight: font.leadingNormal, maxWidth: "36ch" },
  splitBody: { display: "flex", flexDirection: "column", gap: space.xxl, minWidth: 0 },
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
  stripItemLinked: {
    position: "relative",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  stripLinkCover: { position: "absolute", inset: 0 },
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
  // The term column takes the width of the longest term, so the list also fits a narrow card.
  dl: { display: "grid", gridTemplateColumns: "fit-content(12rem) minmax(0, 1fr)", margin: 0 },
  dlRow: {
    display: "grid",
    gridColumn: "1 / -1",
    gridTemplateColumns: "subgrid",
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
  metaLine: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: space.md,
    rowGap: "2px",
    minWidth: 0,
    maxWidth: "100%",
  },
  metaLineItem: { minWidth: 0 },
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
