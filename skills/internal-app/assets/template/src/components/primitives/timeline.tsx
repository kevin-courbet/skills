// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * An activity or audit feed of events, newest first, with the actor and the time of each event.
 *
 * @layer primitive
 * @keywords timeline, activity feed, audit log, audit history, history, event feed, changelog, who did what
 * @related Stepper, Trace, Avatar, Badge, LogViewer
 * @notes ux-writing, grouped-values, internal-app-composition
 *
 * Use it for the history of a record: what happened, who did it, and when. Do
 * not use it for steps that have a status, such as pipeline stages: use
 * `Stepper` with `mode="status"`. Do not use it for the steps of one run: use
 * `Trace`. For raw output lines, use `LogViewer`.
 *
 * ## Behavior
 * - The feed is an ordered list. It shows the events in the order of `events`,
 *   so sort them newest first before you pass them.
 * - Each event shows its icon on a rail, the title sentence, the description,
 *   and one line with the actor, the time, and `meta`, with gaps between them.
 * - The actor name has the text color and the time is muted. An actor with
 *   `isSystem` shows the name without an avatar.
 * - `kind` is read before the title for screen readers only.
 *
 * ## Rules
 * - Keep the events neutral. Give `tone` only to an event that needs
 *   attention, such as a failure. A feed is a record, not a progress bar.
 * - Write `title` as one sentence that names the action and the object.
 * - Format `time.label` with `src/lib/locale.ts`, from a reference time that
 *   the loader returns.
 *
 * ## Example
 * ```tsx
 * <Timeline
 *   label="Activity"
 *   events={[
 *     {
 *       id: "e1",
 *       kind: "Rollback",
 *       icon: Undo2,
 *       title: <>Rolled back to <Code>dpl_rxt8gA84n</Code></>,
 *       actor: { name: "Sam Lee" },
 *       time: { label: "3h ago", dateTime: "2026-10-12T15:30:00Z" },
 *     },
 *   ]}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { Circle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { Avatar } from "./avatar";
import type { BadgeIntent } from "./badge";
import { field } from "@/components/helpers/field";

export interface TimelineActor {
  /** Name of the person or the service. */
  readonly name: string;
  /** Avatar image URL. The initials show when it is missing. */
  readonly src?: string;
  /** An automated actor, such as "System" or a bot. It shows the name without an avatar. */
  readonly isSystem?: boolean;
}

export interface TimelineTime {
  /** Visible text, usually relative: "3h ago". Format it with src/lib/locale.ts. */
  readonly label: string;
  /** ISO timestamp for the time element. */
  readonly dateTime: string;
  /** Exact date and time shown on hover, such as "12 Oct 2026, 18:30". */
  readonly title?: string;
}

export interface TimelineEvent {
  /** Stable id of the event. */
  readonly id: string;
  /** One sentence that names the actor's action and the object. Inline Code is allowed. */
  readonly title: ReactNode;
  /** Event type in words, read before the title by screen readers: "Rollback". */
  readonly kind?: string;
  /** Icon for the event type. Use the same icon for the same type everywhere. */
  readonly icon?: LucideIcon;
  /**
   * Tints the icon for events that need attention, such as `danger` for a
   * failure. The default is neutral: a feed is a record, not a progress bar.
   */
  readonly tone?: BadgeIntent;
  /** Who did it. Leave it out for an event without an actor. */
  readonly actor?: TimelineActor;
  /** When it happened. */
  readonly time: TimelineTime;
  /** Extra detail under the title, such as a reason or a comment. */
  readonly description?: ReactNode;
  /** Trailing item in the metadata line, such as an "Inspect" link. */
  readonly meta?: ReactNode;
}

export interface TimelineProps {
  /** Names the feed, such as "Activity" or "Audit history". */
  readonly label: string;
  /** The events, newest first. The feed keeps this order. */
  readonly events: ReadonlyArray<TimelineEvent>;
}

/**
 * Activity or audit feed, newest first: an icon per event type, the event
 * sentence, and the actor and time. Items are neutral by default. For steps
 * with a status, such as pipeline stages, use Stepper with `mode="status"`.
 */
export function Timeline({ label, events }: TimelineProps) {
  return (
    <ol aria-label={label} {...stylex.props(styles.list)}>
      {events.map((event, index) => {
        const Icon = event.icon ?? Circle;
        const tone = event.tone ?? "neutral";
        const isLast = index === events.length - 1;
        return (
          <li key={event.id} {...stylex.props(styles.item)}>
            <span aria-hidden {...stylex.props(styles.rail)}>
              <span {...stylex.props(styles.marker, markers[tone])}>
                <Icon {...stylex.props(styles.icon)} />
              </span>
              {isLast ? null : <span {...stylex.props(styles.line)} />}
            </span>
            <div {...stylex.props(styles.body, isLast && styles.bodyLast)}>
              <p {...stylex.props(styles.title)}>
                {event.kind ? (
                  <span {...stylex.props(field.hiddenLabel)}>{event.kind}: </span>
                ) : null}
                {event.title}
              </p>
              {event.description ? (
                <div {...stylex.props(styles.description)}>{event.description}</div>
              ) : null}
              <p {...stylex.props(styles.meta)}>
                {event.actor ? (
                  <span {...stylex.props(styles.actor)}>
                    {event.actor.isSystem === true ? null : (
                      <Avatar name={event.actor.name} src={event.actor.src} size="xs" />
                    )}
                    <span {...stylex.props(styles.actorName)}>{event.actor.name}</span>
                  </span>
                ) : null}
                <time
                  dateTime={event.time.dateTime}
                  title={event.time.title}
                  {...stylex.props(styles.time)}
                >
                  {event.time.label}
                </time>
                {event.meta ?? null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const styles = stylex.create({
  list: { display: "flex", flexDirection: "column", margin: 0, padding: 0, listStyleType: "none" },
  item: { display: "grid", gridTemplateColumns: "1.5rem minmax(0, 1fr)", columnGap: space.md },
  rail: { display: "flex", flexDirection: "column", alignItems: "center" },
  marker: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0,
    borderRadius: radius.full,
  },
  icon: { width: size.iconSm, height: size.iconSm },
  line: {
    flex: "1",
    width: "1px",
    minHeight: space.md,
    marginBlock: space.xs,
    backgroundColor: color.border,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
    paddingTop: "0.125rem",
    paddingBottom: space.xl,
  },
  bodyLast: { paddingBottom: 0 },
  title: {
    margin: 0,
    fontSize: font.md,
    color: color.text,
    lineHeight: font.leadingNormal,
    overflowWrap: "anywhere",
    textWrap: "pretty",
  },
  description: { fontSize: font.md, color: color.textMuted, overflowWrap: "anywhere" },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: space.md,
    rowGap: "2px",
    margin: 0,
    fontSize: font.sm,
    color: color.textMuted,
  },
  actor: { display: "inline-flex", alignItems: "center", gap: space.xs },
  actorName: { color: color.text, fontWeight: font.medium },
  time: { fontVariantNumeric: "tabular-nums" },
});

const markers = stylex.create({
  neutral: {
    backgroundColor: color.subtle,
    color: color.textMuted,
    boxShadow: `inset 0 0 0 1px ${color.border}`,
  },
  accent: { backgroundColor: color.accentMuted, color: color.accentText },
  success: { backgroundColor: color.successMuted, color: color.success },
  warning: { backgroundColor: color.warningMuted, color: color.warning },
  danger: { backgroundColor: color.dangerMuted, color: color.danger },
  info: { backgroundColor: color.infoMuted, color: color.info },
});
