// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import { Circle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { Avatar } from "./avatar";
import type { BadgeIntent } from "./badge";
import { field } from "./field";

export interface TimelineActor {
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
  readonly actor?: TimelineActor;
  readonly time: TimelineTime;
  /** Extra detail under the title, such as a reason or a comment. */
  readonly description?: ReactNode;
  /** Trailing item in the metadata line, such as an "Inspect" link. */
  readonly meta?: ReactNode;
}

export interface TimelineProps {
  /** Names the feed, such as "Activity" or "Audit history". */
  readonly label: string;
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
                    <span>{event.actor.name}</span>
                  </span>
                ) : null}
                {event.actor ? <Dot /> : null}
                <time
                  dateTime={event.time.dateTime}
                  title={event.time.title}
                  {...stylex.props(styles.time)}
                >
                  {event.time.label}
                </time>
                {event.meta ? (
                  <>
                    <Dot />
                    {event.meta}
                  </>
                ) : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Dot() {
  return (
    <span aria-hidden {...stylex.props(styles.dot)}>
      ·
    </span>
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
    columnGap: space.sm,
    rowGap: "2px",
    margin: 0,
    fontSize: font.sm,
    color: color.textMuted,
  },
  actor: { display: "inline-flex", alignItems: "center", gap: space.xs },
  time: { fontVariantNumeric: "tabular-nums" },
  dot: { color: color.textFaint },
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
