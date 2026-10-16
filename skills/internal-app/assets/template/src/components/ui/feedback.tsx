// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, media, radius, space } from "@/styles/tokens.stylex";
import { IconTile } from "./icon-tile";

const pulse = stylex.keyframes({
  "0%": { opacity: 1 },
  "50%": { opacity: 0.5 },
  "100%": { opacity: 1 },
});

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

/** Placeholder block for content that loads after the first paint. Not for SSR-loaded data. */
export function Skeleton({ style }: { readonly style?: StyleXStyles }) {
  return <div aria-hidden {...stylex.props(styles.skeleton, style)} />;
}

export function Spinner({
  label = "Loading",
  size = "md",
}: {
  readonly label?: string;
  /** `sm` 12px inside a button, `md` 16px inline, `lg` 24px for a panel. */
  readonly size?: "sm" | "md" | "lg";
}) {
  return <output aria-label={label} {...stylex.props(styles.spinner, spinnerSizes[size])} />;
}

export interface EmptyStateProps {
  /** Shown on an IconTile above the title. Use the icon of the missing object. */
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description?: string;
  /** One primary action, or a primary and a secondary button. */
  readonly action?: ReactNode;
  /**
   * `plain` sits in a table, card, or panel. `dashed` frames a first-run area
   * on a page, such as "No integrations yet" or a place to drop files.
   */
  readonly variant?: "plain" | "dashed";
  /** `sm` uses less space, for a card section or a popover. */
  readonly size?: "sm" | "md";
}

/** Render only after data resolved to empty. Filtered-to-zero states need a clear-filters action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "plain",
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      {...stylex.props(
        styles.empty,
        size === "sm" && styles.emptySm,
        variant === "dashed" && styles.emptyDashed,
      )}
    >
      {icon === undefined ? null : (
        <div {...stylex.props(styles.emptyIcon)}>
          <IconTile icon={icon} size={size === "sm" ? "md" : "lg"} />
        </div>
      )}
      <h2 {...stylex.props(styles.emptyTitle)}>{title}</h2>
      {description ? <p {...stylex.props(styles.emptyDescription)}>{description}</p> : null}
      {action ? <div {...stylex.props(styles.emptyAction)}>{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly action?: ReactNode;
}

/** Visible failure. Never replace an error with an empty state. */
export function ErrorState({ title = "Something failed", message, action }: ErrorStateProps) {
  return (
    <div role="alert" {...stylex.props(styles.error)}>
      <h2 {...stylex.props(styles.errorTitle)}>{title}</h2>
      <p {...stylex.props(styles.errorMessage)}>{message}</p>
      {action ? <div {...stylex.props(styles.emptyAction)}>{action}</div> : null}
    </div>
  );
}

const styles = stylex.create({
  skeleton: {
    height: "1rem",
    borderRadius: radius.sm,
    backgroundColor: color.inset,
    animationName: pulse,
    animationDuration: { default: "1.6s", [media.reducedMotion]: "0s" },
    animationIterationCount: "infinite",
  },
  spinner: {
    display: "inline-block",
    width: "1rem",
    height: "1rem",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: color.border,
    borderTopColor: color.accent,
    borderRadius: radius.full,
    animationName: spin,
    animationDuration: "0.8s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: space.sm,
    paddingBlock: space.page,
    paddingInline: space.lg,
  },
  emptySm: { paddingBlock: space.xl, gap: space.xs },
  emptyDashed: {
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: color.borderStrong,
    borderRadius: radius.xl,
  },
  emptyIcon: { display: "inline-flex", marginBottom: space.xs },
  emptyTitle: { fontSize: font.lg, fontWeight: font.semibold },
  emptyDescription: { fontSize: font.md, color: color.textMuted, maxWidth: "36ch" },
  emptyAction: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
    marginTop: space.sm,
  },
  error: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    padding: space.lg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.dangerBorder,
    borderRadius: radius.lg,
    backgroundColor: color.dangerMuted,
    color: color.text,
  },
  errorTitle: { fontSize: font.md, fontWeight: font.semibold, color: color.danger },
  errorMessage: { fontSize: font.md, color: color.text },
});

const spinnerSizes = stylex.create({
  sm: { width: "0.75rem", height: "0.75rem", borderWidth: "1.5px" },
  md: { width: "1rem", height: "1rem" },
  lg: { width: "1.5rem", height: "1.5rem", borderWidth: "2.5px" },
});
