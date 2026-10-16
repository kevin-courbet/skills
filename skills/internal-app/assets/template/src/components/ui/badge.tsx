import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { color, font, radius, space } from "@/styles/tokens.stylex";

export type BadgeIntent = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  readonly intent?: BadgeIntent;
  readonly children: ReactNode;
}

/** Status label. The text carries the meaning; color only supports it. */
export function Badge({ intent = "neutral", children }: BadgeProps) {
  return <span {...stylex.props(styles.base, intents[intent])}>{children}</span>;
}

/**
 * Dense status for table cells and lists: a colored dot and the status text.
 * Use Badge where the status stands alone.
 */
export function StatusDot({ intent = "neutral", children }: BadgeProps) {
  return (
    <span {...stylex.props(styles.dotLabel)}>
      <span aria-hidden {...stylex.props(styles.dot, dots[intent])} />
      {children}
    </span>
  );
}

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    height: "1.25rem",
    paddingInline: "0.375rem",
    borderRadius: radius.sm,
    borderWidth: "1px",
    borderStyle: "solid",
    fontSize: font.xs,
    fontWeight: font.medium,
    lineHeight: "1",
    whiteSpace: "nowrap",
  },
  dotLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    fontSize: font.md,
    color: color.text,
    whiteSpace: "nowrap",
  },
  dot: { width: "0.375rem", height: "0.375rem", flexShrink: 0, borderRadius: radius.full },
});

const intents = stylex.create({
  neutral: {
    color: color.textMuted,
    backgroundColor: color.subtle,
    borderColor: color.borderSubtle,
  },
  accent: {
    color: color.accentText,
    backgroundColor: color.accentMuted,
    borderColor: "transparent",
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

const dots = stylex.create({
  neutral: { backgroundColor: color.textFaint },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});
