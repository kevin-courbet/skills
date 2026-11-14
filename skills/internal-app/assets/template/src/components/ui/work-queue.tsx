import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { createContext, type ReactNode, useContext, useId } from "react";
import { motionStyles, useArrivals, useHasChanged, viewTransitionName } from "@/lib/motion";
import { color, font, media, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import type { StatStripLink } from "./layout";

const WorkQueueContext = createContext<string | null>(null);
const QueueSectionContext = createContext<{ readonly emphasis: boolean } | null>(null);

/**
 * The work of one person on a touch page, grouped by the next action, such as
 * "In progress", "Up next", and "Waiting". Put it in `Page density="touch"`
 * under a `PageHeader` that says whose work it is. See Touch work view in the
 * component reference.
 *
 * A card that moves to another section in a `withViewTransition` update glides
 * to its new place. A card that leaves the queue fades out, and a card that
 * arrives without a move fades in.
 */
export function WorkQueue({ children }: { readonly children: ReactNode }) {
  const scope = useId();
  return (
    <WorkQueueContext.Provider value={scope}>
      <div {...stylex.props(styles.queue)}>{children}</div>
    </WorkQueueContext.Provider>
  );
}

export interface QueueSectionProps<Item> {
  /** Names the next action of the group, such as "Up next" or "Waiting for a part". */
  readonly title: string;
  readonly icon?: LucideIcon;
  /** The items in the order of work: urgent first, then by due date. */
  readonly items: ReadonlyArray<Item>;
  /** A stable id. It must be unique in the whole `WorkQueue`. */
  readonly getItemId: (item: Item) => string;
  /** Draws one `QueueCard`. */
  readonly renderItem: (item: Item) => ReactNode;
  /**
   * The sentence that shows when the section is empty, such as "Nothing in
   * progress. Start the next request below." Without it an empty section does
   * not show.
   */
  readonly emptyMessage?: string;
  /** Wider cards with a stronger edge, for the group that people work on now. Use it once. */
  readonly emphasis?: boolean;
}

/** One group of a `WorkQueue`, with its title, its count, and its cards. */
export function QueueSection<Item>({
  title,
  icon: Icon,
  items,
  getItemId,
  renderItem,
  emptyMessage,
  emphasis = false,
}: QueueSectionProps<Item>) {
  const scope = useContext(WorkQueueContext);
  if (scope === null) throw new Error("QueueSection must render inside a WorkQueue.");
  const titleId = useId();
  const ids = items.map(getItemId);
  const arrivals = useArrivals(ids);
  const countHasChanged = useHasChanged(items.length);
  if (items.length === 0 && emptyMessage === undefined) return null;
  return (
    <section aria-labelledby={titleId} {...stylex.props(styles.section)}>
      <h2 id={titleId} {...stylex.props(styles.sectionTitle)}>
        {Icon === undefined ? null : <Icon aria-hidden {...stylex.props(styles.sectionIcon)} />}
        {title}
        <span
          key={items.length}
          {...stylex.props(styles.sectionCount, countHasChanged && motionStyles.changed)}
        >
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <p {...stylex.props(styles.empty)}>{emptyMessage}</p>
      ) : (
        <QueueSectionContext.Provider value={{ emphasis }}>
          <ul {...stylex.props(styles.cards, emphasis && styles.cardsEmphasis)}>
            {items.map((item, index) => {
              const id = ids[index] ?? getItemId(item);
              return (
                <li
                  key={id}
                  {...stylex.props(
                    styles.cardSlot,
                    motionStyles.named(viewTransitionName(scope, "item", id)),
                    arrivals.has(id) && motionStyles.enter,
                  )}
                >
                  {renderItem(item)}
                </li>
              );
            })}
          </ul>
        </QueueSectionContext.Provider>
      )}
    </section>
  );
}

export interface QueueCardAction {
  readonly label: string;
  readonly icon?: LucideIcon;
  /** One `primary` action at most: the next step of the item. */
  readonly intent?: "primary" | "secondary" | "danger";
  readonly onPress: () => void;
  readonly isDisabled?: boolean;
}

export interface QueueCardProps {
  /** The name of the item, read from arm's length, such as the subject of a request. */
  readonly title: string;
  /** Opens the record. The title becomes a link with a chevron. */
  readonly link?: StatStripLink;
  /** Short identifier or state at the top right, such as a `Badge` or a code. */
  readonly tag?: ReactNode;
  /** One line under the title, such as the place or the requester. */
  readonly subtitle?: ReactNode;
  /**
   * What people must know to do the work: a short list of tasks, a quote from
   * the requester, and an `Alert` that says why the item waits.
   */
  readonly children?: ReactNode;
  /** Quiet facts under a divider, such as the requester and the due date. */
  readonly meta?: ReactNode;
  /** The next steps as large buttons that share the width of the card. */
  readonly actions?: ReadonlyArray<QueueCardAction>;
  /** Content that replaces the actions, such as a short form that asks why work stops. */
  readonly panel?: ReactNode;
  /**
   * `attention` marks an item that needs help, such as one that waits too
   * long or is overdue. Say why in the card too: the edge color is not the
   * only cue.
   */
  readonly tone?: "default" | "attention";
}

/** One item of a `QueueSection`. Nothing depends on hover, and every target reaches 44px on a touch page. */
export function QueueCard({
  title,
  link,
  tag,
  subtitle,
  children,
  meta,
  actions = [],
  panel,
  tone = "default",
}: QueueCardProps) {
  const section = useContext(QueueSectionContext);
  if (section === null) throw new Error("QueueCard must render inside a QueueSection.");
  if (panel !== undefined && actions.length > 0)
    throw new Error(
      `QueueCard "${title}": a panel replaces the actions, so pass one or the other.`,
    );
  if (actions.filter((action) => action.intent === "primary").length > 1)
    throw new Error(`QueueCard "${title}": one primary action at most.`);
  const titleId = useId();
  const lastSpace = title.lastIndexOf(" ");
  const titleStart = title.slice(0, lastSpace + 1);
  const titleEnd = title.slice(lastSpace + 1);
  return (
    <article
      aria-labelledby={titleId}
      {...stylex.props(
        styles.card,
        section.emphasis && styles.cardEmphasis,
        tone === "attention" && styles.cardAttention,
      )}
    >
      <header {...stylex.props(styles.header)}>
        <h3 id={titleId} {...stylex.props(styles.title)}>
          {link === undefined ? (
            title
          ) : (
            <Link {...link} {...stylex.props(styles.titleLink)}>
              {titleStart}
              <span {...stylex.props(styles.titleEnd)}>
                {titleEnd}
                <ChevronRight aria-hidden {...stylex.props(styles.chevron)} />
              </span>
            </Link>
          )}
        </h3>
        {subtitle === undefined ? null : <p {...stylex.props(styles.subtitle)}>{subtitle}</p>}
        {tag === undefined ? null : <div {...stylex.props(styles.tag)}>{tag}</div>}
      </header>
      {children === undefined ? null : <div {...stylex.props(styles.body)}>{children}</div>}
      {meta === undefined ? null : <div {...stylex.props(styles.meta)}>{meta}</div>}
      {panel ??
        (actions.length === 0 ? null : (
          <div {...stylex.props(styles.actions)}>
            {actions.map(({ label, icon: Icon, intent = "secondary", onPress, isDisabled }) => (
              <Button
                key={label}
                intent={intent}
                size="lg"
                onPress={onPress}
                isDisabled={isDisabled}
              >
                {Icon === undefined ? null : (
                  <Icon aria-hidden {...stylex.props(styles.actionIcon)} />
                )}
                {label}
              </Button>
            ))}
          </div>
        ))}
    </article>
  );
}

const titleLinkPadding = `max(0px, calc((${size.controlSm} - 1lh) / 2))`;

const styles = stylex.create({
  queue: { display: "flex", flexDirection: "column", gap: space.section },
  section: { display: "flex", flexDirection: "column", gap: space.lg },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    margin: 0,
    fontSize: font.xl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    color: color.text,
  },
  sectionIcon: { width: size.iconLg, height: size.iconLg, flexShrink: 0, color: color.textMuted },
  // Inline-flex, so the change animation can scale the number.
  sectionCount: {
    display: "inline-flex",
    color: color.textFaint,
    fontVariantNumeric: "tabular-nums",
  },
  empty: {
    margin: 0,
    paddingBlock: space.xl,
    paddingInline: space.xl,
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: color.border,
    borderRadius: radius.xl,
    fontSize: font.lg,
    color: color.textMuted,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(22rem, 100%), 1fr))",
    gap: space.lg,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  cardsEmphasis: { gridTemplateColumns: "repeat(auto-fill, minmax(min(28rem, 100%), 1fr))" },
  // The slot is a grid so that the card fills the height of its row.
  cardSlot: { display: "grid" },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    paddingBlock: space.xl,
    paddingInline: space.xl,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.borderSubtle,
    borderRadius: radius.xl,
    backgroundColor: color.raised,
    boxShadow: shadow.sm,
  },
  cardEmphasis: { borderColor: color.border, boxShadow: shadow.md },
  cardAttention: {
    borderColor: color.danger,
    boxShadow: `0 0 0 1px ${color.danger}, ${shadow.sm}`,
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gridTemplateAreas: '"title tag" "subtitle tag"',
    columnGap: space.md,
    alignItems: "start",
  },
  // The padding reserves the hit area of the title link, so a one-line title is
  // as tall as a control and lines up with the tag.
  title: {
    gridArea: "title",
    margin: 0,
    paddingBlock: titleLinkPadding,
    fontSize: font.xl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
    color: color.text,
  },
  // The link is inline, so the chevron follows the last word of a title that
  // wraps. The block padding grows its hit area to the control height, so each
  // line is a full touch target on a touch page without a taller line.
  titleLink: {
    paddingBlock: titleLinkPadding,
    color: "inherit",
    textDecorationLine: {
      default: "none",
      ":hover": { default: "none", [media.finePointer]: "underline" },
    },
    textUnderlineOffset: "0.2em",
    borderRadius: radius.sm,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
    WebkitTapHighlightColor: "transparent",
  },
  // The last word and the chevron do not break, so the chevron never starts a line alone.
  titleEnd: { whiteSpace: "nowrap" },
  // The reset in app.css makes every svg a block, so the chevron opts back in to the line.
  chevron: {
    display: "inline-block",
    width: size.icon,
    height: size.icon,
    marginInlineStart: space.xs,
    verticalAlign: "-0.125em",
    color: color.textFaint,
  },
  subtitle: { gridArea: "subtitle", margin: 0, fontSize: font.md, color: color.textMuted },
  tag: {
    gridArea: "tag",
    display: "flex",
    alignItems: "center",
    minHeight: size.controlSm,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    fontSize: font.lg,
    lineHeight: font.leadingNormal,
    color: color.text,
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: space.lg,
    rowGap: space.xs,
    marginTop: "auto",
    paddingTop: space.md,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    fontSize: font.md,
    color: color.textMuted,
  },
  // Each button takes an equal share of the row. A button label does not wrap, so the
  // buttons stack before a share gets too narrow for a label such as "Waiting for a part".
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(14rem, 100%), 1fr))",
    gap: space.md,
  },
  actionIcon: { width: size.iconLg, height: size.iconLg, flexShrink: 0 },
});
