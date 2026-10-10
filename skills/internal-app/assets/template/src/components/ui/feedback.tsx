import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { color, font, media, radius, space } from "@/styles/tokens.stylex";

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

export function Spinner({ label = "Loading" }: { readonly label?: string }) {
  return <output aria-label={label} {...stylex.props(styles.spinner)} />;
}

export interface EmptyStateProps {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Render only after data resolved to empty. Filtered-to-zero states need a clear-filters action. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div {...stylex.props(styles.empty)}>
      {icon ? <div {...stylex.props(styles.emptyIcon)}>{icon}</div> : null}
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
  emptyIcon: {
    display: "inline-flex",
    color: color.textFaint,
    width: "2rem",
    height: "2rem",
    marginBottom: space.xs,
  },
  emptyTitle: { fontSize: font.lg, fontWeight: font.semibold },
  emptyDescription: { fontSize: font.md, color: color.textMuted, maxWidth: "36ch" },
  emptyAction: { marginTop: space.sm },
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
