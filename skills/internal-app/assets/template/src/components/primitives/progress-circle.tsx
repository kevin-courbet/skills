// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A small ring that shows the progress of a task that finishes, in a place too narrow for a bar.
 *
 * @layer primitive
 * @keywords progress circle, progress ring, circular progress, radial progress, percent ring, task progress in a row, sync progress, progress in a table cell, indeterminate ring
 * @related ProgressBar, Feedback, Meter, DataTable, Table, Badge
 * @notes loading-states, internal-app-states, internal-app-motion
 *
 * Use it for the progress of a task in a table row, a list item, or a card
 * header, where a bar has no room. Do not use it where the width allows a
 * bar with a label: use `ProgressBar`. Do not use it for a wait that has no
 * measure, such as a list that loads: use `Spinner` of `Feedback`. Do not use
 * it for a level that stays, such as quota: use `Meter`.
 *
 * ## Behavior
 * - `label` is the accessible name. Screen readers hear the value as a
 *   percentage, or as `valueLabel`.
 * - The ring fills to each new value.
 * - `isIndeterminate` shows a turning arc and hides the value text. Under
 *   reduced motion, the arc turns more slowly, so it still shows that the
 *   work goes on.
 * - `showValue` puts the value text after the ring, in tabular figures.
 *
 * ## Rules
 * - Pass `isIndeterminate` until the total is known. Then pass the value in
 *   the same place, so the ring does not jump to a new place.
 * - Use `sm` in a table row or next to body text, `md` in a card header, and
 *   `lg` next to a control.
 *
 * ## Example
 * ```tsx
 * <ProgressCircle
 *   label={`Sync of ${source.name}`}
 *   value={source.synced}
 *   maxValue={source.total}
 *   size="sm"
 *   showValue
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from "react-aria-components";
import { color, font, media, motion, size, space } from "@/styles/tokens.stylex";

export type ProgressCircleSize = "sm" | "md" | "lg";

export interface ProgressCircleProps extends Omit<
  AriaProgressBarProps,
  "className" | "style" | "children" | "aria-label"
> {
  /** Names the task for screen readers, such as "Sync of Orders". */
  readonly label: string;
  /** Text that replaces the percentage, such as "3 of 12". */
  readonly valueLabel?: string;
  /** Shows the value text after the ring. */
  readonly showValue?: boolean;
  /** `sm` is 16px, `md` is 24px, and `lg` is 36px, the height of a large control. */
  readonly size?: ProgressCircleSize;
  /** Layout overrides, applied last. */
  readonly style?: StyleXStyles;
}

const viewBox = 24;
const radiusUnits = 10;

export function ProgressCircle({
  label,
  valueLabel,
  showValue = false,
  size: ringSize = "md",
  style,
  ...props
}: ProgressCircleProps) {
  return (
    <AriaProgressBar
      {...props}
      aria-label={label}
      valueLabel={valueLabel}
      {...stylex.props(styles.root, style)}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <svg
            aria-hidden
            viewBox={`0 0 ${viewBox} ${viewBox}`}
            {...stylex.props(styles.ring, sizes[ringSize], isIndeterminate && styles.turning)}
          >
            <circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={radiusUnits}
              {...stylex.props(styles.track, strokes[ringSize])}
            />
            <circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={radiusUnits}
              pathLength={100}
              {...stylex.props(
                styles.fill,
                strokes[ringSize],
                isIndeterminate ? styles.arc : styles.offset(100 - (percentage ?? 0)),
                !isIndeterminate && (percentage ?? 0) === 0 && styles.empty,
              )}
            />
          </svg>
          {showValue && !isIndeterminate ? (
            <span {...stylex.props(styles.value)}>{valueText}</span>
          ) : null}
        </>
      )}
    </AriaProgressBar>
  );
}

const turn = stylex.keyframes({
  from: { transform: "rotate(-90deg)" },
  to: { transform: "rotate(270deg)" },
});

const styles = stylex.create({
  root: { display: "inline-flex", alignItems: "center", gap: space.xs, flexShrink: 0 },
  // The fill starts at the top, as a clock does.
  ring: { display: "block", flexShrink: 0, transform: "rotate(-90deg)" },
  track: { fill: "none", stroke: color.border },
  fill: {
    fill: "none",
    stroke: color.accent,
    strokeLinecap: "round",
    strokeDasharray: 100,
    transitionProperty: "stroke-dashoffset",
    transitionDuration: motion.normal,
    transitionTimingFunction: motion.easeOut,
  },
  offset: (offset: number) => ({ strokeDashoffset: offset }),
  arc: { strokeDashoffset: 75 },
  // A round cap draws a dot on a path of length zero, so an empty ring hides its fill.
  empty: { strokeOpacity: 0 },
  // A spinner is the one place for a linear curve: a constant turn reads as work that goes on.
  turning: {
    animationName: turn,
    animationDuration: { default: "1s", [media.reducedMotion]: "2s" },
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  value: {
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
});

const sizes = stylex.create({
  sm: { width: size.icon, height: size.icon },
  md: { width: "1.5rem", height: "1.5rem" },
  lg: { width: size.controlLg, height: size.controlLg },
});

// In units of the 24-unit view box: about 2px, 2.5px, and 3px on the screen.
const strokes = stylex.create({
  sm: { strokeWidth: 3 },
  md: { strokeWidth: 2.5 },
  lg: { strokeWidth: 2 },
});
