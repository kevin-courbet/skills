/**
 * A bar that shows the progress of a task that finishes, such as an upload or an import.
 *
 * @layer primitive
 * @keywords progress bar, progress, upload progress, import progress, loading bar, percent complete, indeterminate progress
 * @related Meter, ProgressCircle, Feedback, FileUpload, Stepper
 * @notes loading-states, kit-states
 *
 * Use it while a task runs toward an end. Do not use it for a level that
 * stays, such as quota or disk use: use `Meter`. For the steps of a pipeline,
 * use `Stepper`. For the same task in a table row or another narrow place, use
 * `ProgressCircle`. For a short wait with no measure, in a button or a field,
 * use `Spinner` of `Feedback`.
 *
 * ## Behavior
 * - The label and the value text connect to the bar for screen readers.
 * - The fill grows to each new value.
 * - `isIndeterminate` shows a moving fill and hides the value text. Under
 *   reduced motion, a full fill pulses in place.
 *
 * ## Rules
 * - Pass `isIndeterminate` while the total is unknown.
 *
 * ## Example
 * ```tsx
 * <ProgressBar label="Import" value={done} maxValue={total} valueLabel={`${done} of ${total} files`} />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Label,
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from "react-aria-components";
import { color, font, media, motion, radius, space } from "@/styles/tokens.stylex";
import { field } from "@/components/helpers/field";

export interface ProgressBarProps extends Omit<
  AriaProgressBarProps,
  "className" | "style" | "children" | "aria-label"
> {
  /** Names the task, such as "Import". */
  readonly label: string;
  /** Keeps the label for assistive technology only, for example in a file row. */
  readonly hideLabel?: boolean;
  /** Text next to the label, such as "3 of 12 files". Defaults to the percentage. */
  readonly valueLabel?: string;
  /** Layout overrides, such as a width. */
  readonly style?: StyleXStyles;
}

export function ProgressBar({
  label,
  hideLabel = false,
  valueLabel,
  style,
  ...props
}: ProgressBarProps) {
  return (
    <AriaProgressBar
      {...props}
      valueLabel={valueLabel}
      {...stylex.props(field.root, styles.root, style)}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <span {...stylex.props(styles.labels, hideLabel && field.hiddenLabel)}>
            <Label {...stylex.props(field.label)}>{label}</Label>
            {isIndeterminate ? null : <span {...stylex.props(styles.value)}>{valueText}</span>}
          </span>
          <span {...stylex.props(styles.track)}>
            <span
              {...stylex.props(
                styles.fill,
                isIndeterminate ? styles.indeterminate : styles.width(percentage ?? 0),
              )}
            />
          </span>
        </>
      )}
    </AriaProgressBar>
  );
}

const slide = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(250%)" },
});

const pulse = stylex.keyframes({
  "0%": { opacity: 1 },
  "50%": { opacity: 0.4 },
  "100%": { opacity: 1 },
});

const styles = stylex.create({
  root: { gap: space.xs, minWidth: "8rem" },
  labels: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
  },
  value: { fontSize: font.sm, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  track: {
    display: "block",
    height: "0.375rem",
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: color.inset,
  },
  fill: {
    display: "block",
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: color.accent,
    transitionProperty: "width",
    transitionDuration: motion.normal,
    transitionTimingFunction: motion.easeOut,
  },
  width: (percentage: number) => ({ width: `${percentage}%` }),
  indeterminate: {
    width: { default: "40%", [media.reducedMotion]: "100%" },
    animationName: { default: slide, [media.reducedMotion]: pulse },
    animationDuration: { default: "1.2s", [media.reducedMotion]: "1.6s" },
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
});
