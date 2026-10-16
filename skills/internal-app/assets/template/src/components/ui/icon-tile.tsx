// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { LucideIcon } from "lucide-react";
import { color, radius, shadow } from "@/styles/tokens.stylex";
import type { BadgeIntent } from "./badge";

export interface IconTileProps {
  readonly icon: LucideIcon;
  /** `neutral` by default. A tone supports the meaning; the text next to the tile carries it. */
  readonly tone?: BadgeIntent;
  /** `soft` tints the tile, `solid` fills it, `outline` keeps a plain bordered surface. */
  readonly variant?: "soft" | "solid" | "outline";
  /** `sm` 24px for dense rows, `md` 32px for lists, `lg` 40px for empty states and headers. */
  readonly size?: "sm" | "md" | "lg";
  readonly shape?: "square" | "circle";
}

/**
 * An icon on a small square surface, such as the media of a list row, the
 * kind of an integration, or the icon of an empty state. It is decorative:
 * put the meaning in the text next to it.
 */
export function IconTile({
  icon: Icon,
  tone = "neutral",
  variant = "soft",
  size = "md",
  shape = "square",
}: IconTileProps) {
  return (
    <span
      aria-hidden
      {...stylex.props(
        styles.tile,
        sizes[size],
        shape === "circle" && styles.circle,
        variant === "soft" && soft[tone],
        variant === "solid" && solid[tone],
        variant === "outline" && styles.outlined,
        variant === "outline" && outlineIcon[tone],
      )}
    >
      <Icon {...stylex.props(iconSizes[size])} />
    </span>
  );
}

const styles = stylex.create({
  tile: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
  },
  circle: { borderRadius: radius.full },
  outlined: { backgroundColor: color.raised, borderColor: color.border, boxShadow: shadow.sm },
});

const sizes = stylex.create({
  sm: { width: "1.5rem", height: "1.5rem", borderRadius: radius.sm },
  md: { width: "2rem", height: "2rem", borderRadius: radius.md },
  lg: { width: "2.5rem", height: "2.5rem", borderRadius: radius.lg },
});

const iconSizes = stylex.create({
  sm: { width: "0.875rem", height: "0.875rem" },
  md: { width: "1rem", height: "1rem" },
  lg: { width: "1.25rem", height: "1.25rem" },
});

const soft = stylex.create({
  neutral: {
    backgroundColor: color.subtle,
    borderColor: color.borderSubtle,
    color: color.textMuted,
  },
  accent: {
    backgroundColor: color.accentMuted,
    borderColor: color.accentBorder,
    color: color.accentText,
  },
  success: {
    backgroundColor: color.successMuted,
    borderColor: color.successBorder,
    color: color.success,
  },
  warning: {
    backgroundColor: color.warningMuted,
    borderColor: color.warningBorder,
    color: color.warning,
  },
  danger: {
    backgroundColor: color.dangerMuted,
    borderColor: color.dangerBorder,
    color: color.danger,
  },
  info: { backgroundColor: color.infoMuted, borderColor: color.infoBorder, color: color.info },
});

const solid = stylex.create({
  neutral: { backgroundColor: color.textMuted, color: color.textInverse },
  accent: { backgroundColor: color.accent, color: color.onAccent },
  success: { backgroundColor: color.success, color: color.textInverse },
  warning: { backgroundColor: color.warning, color: color.textInverse },
  danger: { backgroundColor: color.danger, color: color.textInverse },
  info: { backgroundColor: color.info, color: color.textInverse },
});

const outlineIcon = stylex.create({
  neutral: { color: color.textMuted },
  accent: { color: color.accentText },
  success: { color: color.success },
  warning: { color: color.warning },
  danger: { color: color.danger },
  info: { color: color.info },
});
