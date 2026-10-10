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
