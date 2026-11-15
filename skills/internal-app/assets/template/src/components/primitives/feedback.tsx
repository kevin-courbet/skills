// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * The loading placeholder, the spinner, the empty state, and the error state of a page or of a part of it.
 *
 * @layer primitive
 * @keywords empty state, no results, no data yet, loading spinner, spinner, skeleton, loading placeholder, error state, failed to load, first run
 * @related Alert, IconTile, ProgressBar, RouteError, DataTable, Button
 * @notes loading-states, finishing-details, ux-writing, internal-app-states
 *
 * Use these for data that is not there yet, that is empty, or that failed. Do
 * not use them for a notice about data that loaded: use `Alert`. For a task
 * with a total, use `ProgressBar`. A route failure renders `RouteError`.
 *
 * ## Behavior
 * - `Skeleton` pulses and `Spinner` turns. Under reduced motion, both stay
 *   still.
 * - `EmptyState` shows its `icon` on an `IconTile`.
 * - `ErrorState` has `role="alert"`, so screen readers read it at once.
 *
 * ## Rules
 * - Data that the server loads renders directly. Do not show a `Skeleton` or a
 *   `Spinner` for it. See `design read internal-app-states`.
 *
 * ## Skeleton
 * A block with no meaning for screen readers. Use it only for a load that the
 * client starts and that takes more than about 300 ms. `style` gives its size.
 *
 * ## Spinner
 * An `output` element whose accessible name is `label`. Use `sm` in a button or
 * in the `suffix` of a field.
 *
 * ## EmptyState
 * Show it only after the data resolved to zero items. A result that filters
 * empty gets a "Clear filters" action.
 *
 * ## ErrorState
 * A visible failure in place of the data. Never replace an error with an empty
 * state.
 *
 * ## Example
 * ```tsx
 * <EmptyState
 *   icon={Webhook}
 *   variant="dashed"
 *   title="No webhooks yet"
 *   description="Add a webhook to send events to another service."
 *   action={<Button intent="primary" onPress={openCreate}>Add webhook</Button>}
 * />
 * ```
 */
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
export function Skeleton({
  style,
}: {
  /** Size and shape of the block, such as a width, a height, and a radius. */
  readonly style?: StyleXStyles;
}) {
  return <div aria-hidden {...stylex.props(styles.skeleton, style)} />;
}

export function Spinner({
  label = "Loading",
  size = "md",
}: {
  /** Accessible name. Name what loads, such as "Loading jobs". */
  readonly label?: string;
  /** `sm` 12px inside a button, `md` 16px inline, `lg` 24px for a panel. */
  readonly size?: "sm" | "md" | "lg";
}) {
  return <output aria-label={label} {...stylex.props(styles.spinner, spinnerSizes[size])} />;
}

export interface EmptyStateProps {
  /** Shown on an IconTile above the title. Use the icon of the missing object. */
  readonly icon?: LucideIcon;
  /** Names what is missing, such as "No webhooks yet". */
  readonly title: string;
  /** Says how to add the first item, or how to change the filters. */
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
  /** Names what failed, such as "Jobs did not load". */
  readonly title?: string;
  /** What happened and how to fix it. */
  readonly message: string;
  /** One button that fixes the problem or tries again, such as "Try again". */
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
    animationDuration: { default: "0.8s", [media.reducedMotion]: "0s" },
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
