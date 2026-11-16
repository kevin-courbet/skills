// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * A dot or a count on the corner of an avatar, an icon button, or an icon,
 * such as unread messages or a person who is online.
 *
 * @layer primitive
 * @keywords indicator, notification dot, notification count, unread count, count on icon, badge on avatar, online status, presence dot, corner badge, 99+
 * @related Badge, Avatar, Button, Tooltip
 * @notes accessibility, kit-composition, color
 *
 * Use it to mark an element with a number or a state that belongs to it. Do
 * not use it for a status that stands alone, such as in a table cell or a
 * card header: use `Badge` or `StatusDot`. For a count next to a navigation
 * label, put a `Badge` after the label.
 *
 * ## Behavior
 * - With `count`, the mark shows the number, or "99+" above a `max` of 99.
 *   Without `count`, the mark is a dot.
 * - The mark is hidden from screen readers. `children` receives the
 *   accessible name, which joins `label` and the mark, such as
 *   "Notifications, 3 unread" or "Sam Lee, online". When the mark is hidden,
 *   the name is `label` alone.
 * - The mark comes in with a short scale. Under reduced motion, it only fades.
 *
 * ## Rules
 * - Give the name from `children` to the marked element, such as the
 *   `aria-label` of a `Button` or the `label` of an `Avatar`.
 * - Write `meaning` in lowercase words that follow the count or the label,
 *   such as "unread" or "waiting for review".
 * - Do not put it in a parent that clips its overflow.
 *
 * ## Example
 * ```tsx
 * <Indicator label="Notifications" meaning="unread" count={unread} intent="danger">
 *   {(name) => (
 *     <Button intent="ghost" iconOnly icon={Bell} aria-label={name} />
 *   )}
 * </Indicator>
 * <Indicator label="Sam Lee" meaning="online" intent="success" placement="bottom-end" anchor="circle">
 *   {(name) => <Avatar name="Sam Lee" label={name} />}
 * </Indicator>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import type { BadgeIntent } from "@/components/primitives/badge";
import { color, font, media, motion, radius } from "@/styles/tokens.stylex";

interface IndicatorBaseProps {
  /** The name of the marked element without the mark, such as "Notifications". */
  readonly label: string;
  /** What the mark tells, such as "unread" or "online". The name puts it after the count or `label`. */
  readonly meaning: string;
  /** The color of the mark. Use `danger` for work that waits for people, and `success` for presence. */
  readonly intent?: BadgeIntent;
  /** The corner of the mark. Use `bottom-end` for presence on an `Avatar`. */
  readonly placement?: "top-end" | "bottom-end";
  /** Use `circle` on a round element, such as an `Avatar`, so the mark sits on its edge. */
  readonly anchor?: "rectangle" | "circle";
  /** `sm` fits an icon, a small button, or a small avatar. `md` fits a `md` or `lg` avatar. */
  readonly size?: "sm" | "md";
  /** Renders the marked element. Give it the accessible name that this function receives. */
  readonly children: (accessibleName: string) => ReactNode;
}

type IndicatorMarkProps =
  | {
      /** A whole number of 0 or more, such as unread messages. */
      readonly count: number;
      /** The largest number that shows. A larger count shows as "99+" for a max of 99. */
      readonly max?: number;
      /** Shows the mark with "0". By default, the mark is hidden at zero. */
      readonly showZero?: boolean;
      /** A count hides only at zero. */
      readonly isVisible?: undefined;
    }
  | {
      /** Without `count`, the mark is a dot. */
      readonly count?: undefined;
      /** Only a count has a max. */
      readonly max?: undefined;
      /** Only a count can be zero. */
      readonly showZero?: undefined;
      /** Shows the dot, such as while a person is online. */
      readonly isVisible?: boolean;
    };

export type IndicatorProps = IndicatorBaseProps & IndicatorMarkProps;

export function Indicator({
  label,
  meaning,
  intent = "accent",
  placement = "top-end",
  anchor = "rectangle",
  size = "sm",
  count,
  max = 99,
  showZero = false,
  isVisible = true,
  children,
}: IndicatorProps) {
  if (count !== undefined && (!Number.isInteger(count) || count < 0)) {
    throw new RangeError(`Indicator: count must be a whole number of 0 or more, not ${count}.`);
  }
  if (!Number.isInteger(max) || max < 1) {
    throw new RangeError(`Indicator: max must be a whole number of 1 or more, not ${max}.`);
  }
  const mark = markOf({ count, max, showZero, isVisible, meaning });
  return (
    <span {...stylex.props(styles.root)}>
      {children(mark === null ? label : `${label}, ${mark.spoken}`)}
      {mark === null ? null : (
        <span
          aria-hidden
          {...stylex.props(
            styles.mark,
            intents[intent],
            mark.text === null ? dotSizes[size] : countSizes[size],
            placements[placement],
            anchor === "circle" &&
              (placement === "top-end" ? styles.circleTop : styles.circleBottom),
          )}
        >
          {mark.text}
        </span>
      )}
    </span>
  );
}

interface Mark {
  /** The visible text, or null for a dot. */
  readonly text: string | null;
  /** The words of the mark in the accessible name. */
  readonly spoken: string;
}

function markOf({
  count,
  max,
  showZero,
  isVisible,
  meaning,
}: {
  readonly count: number | undefined;
  readonly max: number;
  readonly showZero: boolean;
  readonly isVisible: boolean;
  readonly meaning: string;
}): Mark | null {
  if (count === undefined) return isVisible ? { text: null, spoken: meaning } : null;
  if (count === 0 && !showZero) return null;
  if (count > max) return { text: `${max}+`, spoken: `more than ${max} ${meaning}` };
  return { text: String(count), spoken: `${count} ${meaning}` };
}

const appear = stylex.keyframes({
  from: { opacity: 0, scale: "0.5" },
  to: { opacity: 1, scale: "1" },
});

const fade = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

// On a circle, the corner of the box is outside the shape. The point on the
// circle at 45 degrees is 14.6% of the size in from each edge.
const circleInset = "14.6%";

const styles = stylex.create({
  root: { position: "relative", display: "inline-flex", flexShrink: 0, verticalAlign: "middle" },
  mark: {
    position: "absolute",
    insetInlineEnd: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    borderRadius: radius.full,
    // The ring cuts the mark out of the element below it.
    boxShadow: `0 0 0 2px ${color.raised}`,
    fontWeight: font.semibold,
    lineHeight: "1",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    animationName: { default: appear, [media.reducedMotion]: fade },
    animationDuration: motion.fast,
    animationTimingFunction: motion.easeOut,
  },
  circleTop: { top: circleInset, insetInlineEnd: circleInset },
  circleBottom: { bottom: circleInset, insetInlineEnd: circleInset },
});

const placements = stylex.create({
  "top-end": { top: 0, transform: "translate(50%, -50%)" },
  "bottom-end": { bottom: 0, transform: "translate(50%, 50%)" },
});

const dotSizes = stylex.create({
  sm: { width: "0.5rem", height: "0.5rem" },
  md: { width: "0.625rem", height: "0.625rem" },
});

const countSizes = stylex.create({
  sm: {
    minWidth: "1rem",
    height: "1rem",
    paddingInline: "0.25rem",
    fontSize: `calc(${font.xs} * 0.9)`,
  },
  md: { minWidth: "1.125rem", height: "1.125rem", paddingInline: "0.3125rem", fontSize: font.xs },
});

const intents = stylex.create({
  neutral: { backgroundColor: color.textMuted, color: color.textInverse },
  accent: { backgroundColor: color.accent, color: color.onAccent },
  success: { backgroundColor: color.success, color: color.textInverse },
  warning: { backgroundColor: color.warning, color: color.textInverse },
  danger: { backgroundColor: color.danger, color: color.textInverse },
  info: { backgroundColor: color.info, color: color.textInverse },
});
