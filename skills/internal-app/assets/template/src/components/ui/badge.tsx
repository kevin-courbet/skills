// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { color, font, media, radius, size, space } from "@/styles/tokens.stylex";

export type BadgeIntent = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
/** `subtle` is the default tinted badge; `solid` fills with the intent color; `outline` keeps a plain surface. */
export type BadgeAppearance = "subtle" | "solid" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  readonly intent?: BadgeIntent;
  readonly appearance?: BadgeAppearance;
  readonly size?: BadgeSize;
  /** `pill` rounds the ends fully, for counts and short tags such as "Current". */
  readonly shape?: "rounded" | "pill";
  /** A lucide icon element before the text. It is decorative; the text carries the meaning. */
  readonly icon?: ReactNode;
  readonly children: ReactNode;
}

/** Status label. The text carries the meaning; color only supports it. */
export function Badge({
  intent = "neutral",
  appearance = "subtle",
  size: sizeKey = "md",
  shape = "rounded",
  icon,
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
      {icon ? (
        <span aria-hidden {...stylex.props(styles.icon)}>
          {icon}
        </span>
      ) : null}
      {appearance === "outline" && intent !== "neutral" && icon === undefined ? (
        <span aria-hidden {...stylex.props(styles.outlineDot, dots[intent])} />
      ) : null}
      {children}
    </span>
  );
}

export interface StatusDotProps {
  readonly intent?: BadgeIntent;
  /** The status word, such as "Building". Never leave it out: the dot alone is color only. */
  readonly children: ReactNode;
  /** Secondary line under the status, such as "Build · 1m 12s". */
  readonly detail?: ReactNode;
  /** Pulses the dot for work in progress. The motion stops under reduced motion. */
  readonly isActive?: boolean;
}

/**
 * Dense status for table cells, lists, and detail headers: a colored dot and
 * the status text, with an optional secondary line. Use Badge where the
 * status stands alone.
 */
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
  icon: {
    display: "inline-flex",
    width: size.iconSm,
    height: size.iconSm,
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
