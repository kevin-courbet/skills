/**
 * The work of one person on a touch page, in sections by the next action, with large action buttons on each card.
 *
 * @layer pattern
 * @keywords work queue, work list for a tablet, touch work view, my work, task queue, technician tablet, shared tablet, kiosk, next action, work orders
 * @related Kanban, Layout, RadioGroup, Sheet, Badge, Alert, Motion, Focus
 * @notes internal-app-touch-work-view, density, responsive, loading-states
 *
 * Use it when one person works through their own items on a tablet, a phone,
 * or a shared screen, and changes the state of an item more often than its
 * fields. Do not use it for the people who plan and assign the work: use a
 * `DataTable` or a `Kanban` on a desktop page. Read
 * `design read internal-app-touch-work-view` before you build the page.
 *
 * ## Behavior
 * The queue does these things. Do not build them again:
 * - A card that moves to another section in a `withViewTransition` update
 *   glides there. A card that leaves fades out, a card that arrives without a
 *   move fades in, and the count of a section animates when it changes.
 * - When an action moves or removes the focused card, the focus goes to the
 *   next card of the section, or to the section heading when it is empty. When
 *   the section does not show any more, the next heading takes the focus.
 * - Nothing depends on hover, and every target is 44px or more on a touch page.
 * - Each part throws an error outside its parent. A `QueueCard` with a `panel`
 *   and `actions`, or with two primary actions, throws an error.
 *
 * ## Rules
 * - Put it in `Page density="touch"`.
 * - Change the query cache in `withViewTransition`, then send the request. On
 *   failure, restore the item in `withViewTransition` and show a toast that
 *   names the item. Do not show a toast on success: the card in its new
 *   section shows the result. Do not add motion.
 * - Do not add `autoFocus` to a field in a `panel`.
 *
 * ## QueueSection
 * One group of cards for one next action. It shows its count beside the title.
 *
 * ## QueueCard
 * One item: a title, the facts that people need to do the work, and the next
 * steps. Label each action with a verb, such as "Mark as done". Use a
 * `panel`, not a dialog, for a short answer of one or two fields.
 *
 * ## Example
 * ```tsx
 * <WorkQueue>
 *   <QueueSection
 *     title="In progress"
 *     icon={Wrench}
 *     emphasis
 *     items={queue.inProgress}
 *     getItemId={(order) => order.id}
 *     emptyMessage="Nothing in progress. Start the next work order below."
 *     renderItem={(order) => (
 *       <QueueCard
 *         title={order.title}
 *         link={{ to: "/work", search: (previous) => ({ ...previous, order: order.id }) }}
 *         subtitle={order.place}
 *         actions={[{ label: "Mark as done", icon: Check, intent: "primary", onPress: () => finish(order) }]}
 *       />
 *     )}
 *   />
 * </WorkQueue>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import { isFocusLost, useFocusAfterRemoval } from "@/components/helpers/focus";
import {
  motionStyles,
  useArrivals,
  useHasChanged,
  viewTransitionName,
} from "@/components/helpers/motion";
import { color, font, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { Button } from "@/components/primitives/button";
import type { StatStripLink } from "@/components/primitives/layout";
import { TextLink } from "@/components/primitives/text-link";

interface WorkQueueValue {
  readonly scope: string;
  readonly root: RefObject<HTMLDivElement | null>;
}

const WorkQueueContext = createContext<WorkQueueValue | null>(null);
const QueueSectionContext = createContext<{ readonly emphasis: boolean } | null>(null);

export function WorkQueue({
  children,
}: {
  /** The `QueueSection` elements, in the order of work. */
  readonly children: ReactNode;
}) {
  const scope = useId();
  const root = useRef<HTMLDivElement>(null);
  return (
    <WorkQueueContext.Provider value={{ scope, root }}>
      {/* The queue takes the focus only when no section is left to take it. */}
      <div ref={root} tabIndex={-1} {...stylex.props(styles.queue, styles.focusTarget)}>
        {children}
      </div>
    </WorkQueueContext.Provider>
  );
}

export interface QueueSectionProps<Item> {
  /** Names the next action of the group, such as "Up next" or "Waiting for a part". */
  readonly title: string;
  /** Lucide icon before the title. */
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

export function QueueSection<Item>({
  title,
  icon: Icon,
  items,
  getItemId,
  renderItem,
  emptyMessage,
  emphasis = false,
}: QueueSectionProps<Item>) {
  const queue = useContext(WorkQueueContext);
  if (queue === null) throw new Error("QueueSection must render inside a WorkQueue.");
  const { scope, root } = queue;
  const titleId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The place of the section among the sections of the queue, at the last render that showed it.
  const place = useRef(-1);
  const ids = items.map(getItemId);
  const arrivals = useArrivals(ids);
  const countHasChanged = useHasChanged(items.length);
  useFocusAfterRemoval({
    container: root,
    ids,
    itemSelector: "li[data-key]",
    focusTarget: (item) => {
      const card = item.querySelector<HTMLElement>(":scope > article");
      if (card === null)
        throw new Error(`QueueSection "${title}": renderItem must draw a QueueCard.`);
      return card;
    },
    emptyTarget: () => {
      if (headingRef.current !== null) return headingRef.current;
      const queueElement = root.current;
      if (queueElement === null) return null;
      const headings = Array.from(
        queueElement.querySelectorAll<HTMLElement>(":scope > section > h2"),
      );
      return headings[place.current] ?? headings.at(-1) ?? queueElement;
    },
  });
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const queueElement = root.current;
    if (section === null || queueElement === null) return;
    place.current = Array.from(queueElement.querySelectorAll(":scope > section")).indexOf(section);
  });
  if (items.length === 0 && emptyMessage === undefined) return null;
  return (
    <section ref={sectionRef} aria-labelledby={titleId} {...stylex.props(styles.section)}>
      <h2
        ref={headingRef}
        id={titleId}
        tabIndex={-1}
        {...stylex.props(styles.sectionTitle, styles.focusTarget)}
      >
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
                  data-key={id}
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
  /** A verb and an object, such as "Start work". Never an icon alone. */
  readonly label: string;
  /** Lucide icon before the label. */
  readonly icon?: LucideIcon;
  /** One `primary` action at most: the next step of the item. */
  readonly intent?: "primary" | "secondary" | "danger";
  /** Runs the move. */
  readonly onPress: () => void;
  /** Disables the button, such as while the move is not possible. */
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
  /**
   * Content that replaces the actions, such as a short form that asks why work
   * stops. When the panel opens, its first control takes the focus. When it
   * closes and the card stays, the action that opened it takes the focus again.
   */
  readonly panel?: ReactNode;
  /**
   * `attention` marks an item that needs help, such as one that waits too
   * long or is overdue. Say why in the card too: the edge color is not the
   * only cue.
   */
  readonly tone?: "default" | "attention";
}

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
  const cardRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const openedBy = useRef<string | null>(null);
  const hadPanel = useRef(panel !== undefined);
  // The panel and the actions replace each other, so the focused control leaves the page
  // when one of them opens. The focus goes to the content that took its place.
  useLayoutEffect(() => {
    const hasPanel = panel !== undefined;
    if (hasPanel === hadPanel.current) return;
    hadPanel.current = hasPanel;
    if (!isFocusLost()) return;
    if (hasPanel) {
      (firstControl(panelRef.current) ?? cardRef.current)?.focus();
      return;
    }
    const opener = Array.from(
      actionsRef.current?.querySelectorAll<HTMLElement>("[data-queue-action]") ?? [],
    ).find((button) => button.dataset.queueAction === openedBy.current);
    openedBy.current = null;
    (opener ?? cardRef.current)?.focus();
  });
  const lastSpace = title.lastIndexOf(" ");
  const titleStart = title.slice(0, lastSpace + 1);
  const titleEnd = title.slice(lastSpace + 1);
  return (
    <article
      ref={cardRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      {...stylex.props(
        styles.card,
        section.emphasis && styles.cardEmphasis,
        tone === "attention" && styles.cardAttention,
        styles.focusTarget,
      )}
    >
      <header {...stylex.props(styles.header)}>
        <h3 id={titleId} {...stylex.props(styles.title)}>
          {link === undefined ? (
            title
          ) : (
            <TextLink {...link} variant="quiet" style={styles.titleLink}>
              {titleStart}
              <span {...stylex.props(styles.titleEnd)}>
                {titleEnd}
                <ChevronRight aria-hidden {...stylex.props(styles.chevron)} />
              </span>
            </TextLink>
          )}
        </h3>
        {subtitle === undefined ? null : <p {...stylex.props(styles.subtitle)}>{subtitle}</p>}
        {tag === undefined ? null : <div {...stylex.props(styles.tag)}>{tag}</div>}
      </header>
      {children === undefined ? null : <div {...stylex.props(styles.body)}>{children}</div>}
      {meta === undefined ? null : <div {...stylex.props(styles.meta)}>{meta}</div>}
      {panel === undefined ? null : (
        <div ref={panelRef} {...stylex.props(styles.panel)}>
          {panel}
        </div>
      )}
      {panel !== undefined || actions.length === 0 ? null : (
        <div ref={actionsRef} {...stylex.props(styles.actions)}>
          {actions.map(({ label, icon: Icon, intent = "secondary", onPress, isDisabled }) => (
            <Button
              key={label}
              data-queue-action={label}
              intent={intent}
              size="lg"
              onPress={() => {
                openedBy.current = label;
                onPress();
              }}
              isDisabled={isDisabled}
            >
              {Icon === undefined ? null : (
                <Icon aria-hidden {...stylex.props(styles.actionIcon)} />
              )}
              {label}
            </Button>
          ))}
        </div>
      )}
    </article>
  );
}

const controlSelector =
  'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

function firstControl(container: HTMLElement | null): HTMLElement | null {
  const controls = container?.querySelectorAll<HTMLElement>(controlSelector) ?? [];
  return Array.from(controls).find((control) => !control.matches(":disabled")) ?? null;
}

const titleLinkPadding = `max(0px, calc((${size.controlSm} - 1lh) / 2))`;

const styles = stylex.create({
  queue: { display: "flex", flexDirection: "column", gap: space.section },
  // The queue, a section heading, and a card take the focus from the script, not from Tab.
  // The ring shows only after keyboard use.
  focusTarget: {
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
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
  titleLink: { paddingBlock: titleLinkPadding },
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
  panel: { display: "contents" },
  // Each button takes an equal share of the row. A button label does not wrap, so the
  // buttons stack before a share gets too narrow for a label such as "Waiting for a part".
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(14rem, 100%), 1fr))",
    gap: space.md,
  },
  actionIcon: { width: size.iconLg, height: size.iconLg, flexShrink: 0 },
});
