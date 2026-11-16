// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A short status word with an intent color, as a `Badge` that stands alone or as a dense `StatusDot`.
 *
 * @layer primitive
 * @keywords status badge, badge, status dot, status label, tag, count badge, pill, state indicator, intent color
 * @related DataTable, Layout, Item, WorkQueue, IconTile
 * @notes internal-app-composition, internal-app-touch-work-view, color, accessibility
 *
 * Use `Badge` for a status, a count, or a tag that stands alone, such as in a
 * card header or an `Item` meta. Use `StatusDot` in table cells, dense lists,
 * and detail headers. Do not use them for a notice about the page: use
 * `Alert`. Do not use them for progress: use `Stepper` or `ProgressBar`.
 *
 * ## Behavior
 * - The `outline` appearance adds a dot before the text when the intent is not
 *   `neutral` and there is no `icon`.
 * - A `Badge` keeps its size in all densities.
 *
 * ## Rules
 * - Always write the status in text. The color only supports it.
 * - On a touch page, use `Badge size="lg"`, so the badge stays legible next to
 *   the larger text.
 * - In a `PageHeader` title, put a `StatusDot` or a `Badge size="lg"` after
 *   the `Identifier`.
 * - Use the same intent for the same status across the app.
 *
 * ## Example
 * ```tsx
 * <StatusDot intent="warning" isActive detail={<MetaLine items={["Build", "1m 12s"]} />}>
 *   Building
 * </StatusDot>
 * <Badge intent="danger" appearance="solid" shape="pill">3</Badge>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, media, radius, space } from "@/styles/tokens.stylex";

export type BadgeIntent = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
/** `subtle` is the default tinted badge; `solid` fills with the intent color; `outline` keeps a plain surface. */
export type BadgeAppearance = "subtle" | "solid" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  /** The meaning of the status. */
  readonly intent?: BadgeIntent;
  /** Use `solid` for a count and `outline` for a quiet tag. */
  readonly appearance?: BadgeAppearance;
  /** The height and the text size of the badge. */
  readonly size?: BadgeSize;
  /** `pill` rounds the ends fully, for counts and short tags such as "Current". */
  readonly shape?: "rounded" | "pill";
  /**
   * A Lucide icon component before the text, such as `Clock`. The badge sizes
   * it to its text. It is decorative; the text carries the meaning.
   */
  readonly icon?: LucideIcon;
  /** The status word, the count, or the tag. */
  readonly children: ReactNode;
}

export function Badge({
  intent = "neutral",
  appearance = "subtle",
  size: sizeKey = "md",
  shape = "rounded",
  icon: Icon,
  children,
}: BadgeProps) {
  return (
    <span
      {...stylex.props(
        styles.base,
        sizes[sizeKey],
        shape === "pill" && styles.pill,
        appearance === "subtle" && subtle[intent],
        appearance === "solid" && solid[intent],
        appearance === "outline" && styles.outlined,
        appearance === "outline" && outlineText[intent],
      )}
    >
      {Icon === undefined ? null : <Icon aria-hidden {...stylex.props(styles.icon)} />}
      {appearance === "outline" && intent !== "neutral" && Icon === undefined ? (
        <span aria-hidden {...stylex.props(styles.outlineDot, dots[intent])} />
      ) : null}
      {children}
    </span>
  );
}

export interface StatusDotProps {
  /** The meaning of the status, which sets the dot color. */
  readonly intent?: BadgeIntent;
  /** The status word, such as "Building". Never leave it out: the dot alone is color only. */
  readonly children: ReactNode;
  /**
   * Secondary line under the status, such as the stage and its duration. Put
   * separate facts in a MetaLine, not in one joined string.
   */
  readonly detail?: ReactNode;
  /** Pulses the dot for work in progress. The motion stops under reduced motion. */
  readonly isActive?: boolean;
}

export function StatusDot({
  intent = "neutral",
  children,
  detail,
  isActive = false,
}: StatusDotProps) {
  return (
    <span {...stylex.props(styles.dotLabel, detail !== undefined && styles.dotLabelStacked)}>
      <span aria-hidden {...stylex.props(styles.dotBox)}>
        {isActive ? <span {...stylex.props(styles.dotPulse, dots[intent])} /> : null}
        <span {...stylex.props(styles.dot, dots[intent])} />
      </span>
      <span {...stylex.props(styles.dotText)}>{children}</span>
      {detail === undefined ? null : <span {...stylex.props(styles.dotDetail)}>{detail}</span>}
    </span>
  );
}

const ping = stylex.keyframes({
  "0%": { transform: "scale(1)", opacity: 0.6 },
  "80%, 100%": { transform: "scale(2.4)", opacity: 0 },
});

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    flexShrink: 0,
    borderRadius: radius.sm,
    borderWidth: "1px",
    borderStyle: "solid",
    fontWeight: font.medium,
    lineHeight: "1",
    whiteSpace: "nowrap",
  },
  pill: { borderRadius: radius.full },
  outlined: { backgroundColor: color.raised, borderColor: color.border },
  outlineDot: { width: "0.375rem", height: "0.375rem", flexShrink: 0, borderRadius: radius.full },
  // The icon follows the text size, so it stays balanced in every badge size and density.
  icon: {
    width: "1.125em",
    height: "1.125em",
    marginInlineStart: "-1px",
    flexShrink: 0,
  },
  dotLabel: {
    display: "inline-grid",
    gridTemplateColumns: "auto auto",
    justifyContent: "start",
    alignItems: "center",
    columnGap: space.sm,
    minWidth: 0,
    maxWidth: "100%",
    fontSize: font.md,
    color: color.text,
  },
  dotLabelStacked: { rowGap: "2px" },
  dotBox: {
    position: "relative",
    display: "inline-flex",
    width: "0.5rem",
    height: "0.5rem",
    flexShrink: 0,
  },
  dot: { position: "relative", width: "100%", height: "100%", borderRadius: radius.full },
  dotPulse: {
    position: "absolute",
    inset: 0,
    borderRadius: radius.full,
    animationName: ping,
    animationDuration: "1.4s",
    animationIterationCount: "infinite",
    animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
    display: { default: "block", [media.reducedMotion]: "none" },
  },
  // No ellipsis: in an auto-sized table column, clipped text would let the column collapse.
  dotText: { fontWeight: font.medium, whiteSpace: "nowrap" },
  dotDetail: {
    gridColumnStart: 2,
    fontSize: font.sm,
    color: color.textMuted,
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },
});

const sizes = stylex.create({
  sm: { height: "1rem", paddingInline: "0.25rem", fontSize: font.xs },
  md: { height: "1.25rem", paddingInline: "0.375rem", fontSize: font.xs },
  lg: { height: "1.5rem", paddingInline: space.sm, fontSize: font.sm },
});

const subtle = stylex.create({
  neutral: {
    color: color.textMuted,
    backgroundColor: color.subtle,
    borderColor: color.borderSubtle,
  },
  accent: {
    color: color.accentText,
    backgroundColor: color.accentMuted,
    borderColor: color.accentBorder,
  },
  success: {
    color: color.success,
    backgroundColor: color.successMuted,
    borderColor: color.successBorder,
  },
  warning: {
    color: color.warning,
    backgroundColor: color.warningMuted,
    borderColor: color.warningBorder,
  },
  danger: {
    color: color.danger,
    backgroundColor: color.dangerMuted,
    borderColor: color.dangerBorder,
  },
  info: { color: color.info, backgroundColor: color.infoMuted, borderColor: color.infoBorder },
});

const solid = stylex.create({
  neutral: {
    color: color.textInverse,
    backgroundColor: color.textMuted,
    borderColor: "transparent",
  },
  accent: { color: color.onAccent, backgroundColor: color.accent, borderColor: "transparent" },
  success: {
    color: color.textInverse,
    backgroundColor: color.success,
    borderColor: "transparent",
  },
  warning: {
    color: color.textInverse,
    backgroundColor: color.warning,
    borderColor: "transparent",
  },
  danger: { color: color.textInverse, backgroundColor: color.danger, borderColor: "transparent" },
  info: { color: color.textInverse, backgroundColor: color.info, borderColor: "transparent" },
});

const outlineText = stylex.create({
  neutral: { color: color.textMuted },
  accent: { color: color.text },
  success: { color: color.text },
  warning: { color: color.text },
  danger: { color: color.text },
  info: { color: color.text },
});

const dots = stylex.create({
  neutral: { backgroundColor: color.textFaint },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});
