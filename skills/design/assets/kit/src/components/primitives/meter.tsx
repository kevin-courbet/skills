/**
 * A bar that shows a level within a known range, such as quota, capacity, or disk use.
 *
 * @layer primitive
 * @keywords meter, quota, usage bar, capacity, disk use, level, gauge, limit
 * @related ProgressBar, DataTable, Layout, Badge
 * @notes dashboards, color, accessibility
 *
 * Use it for a level that stays. Do not use it for a task that finishes: use
 * `ProgressBar`. In a table, use `MeterCell` of `DataTable`. For a key number
 * with a trend, use `StatTile` of `Layout`.
 *
 * ## Behavior
 * - The label and the value text connect to the bar for screen readers.
 * - The bar turns to the warning color at `warningAt` and to the danger color
 *   at `dangerAt`. At `dangerAt`, the value text also takes the danger color.
 *
 * ## Rules
 * - The value text carries the meaning. Do not let the color be the only cue.
 *
 * ## Example
 * ```tsx
 * <Meter label="Storage" value={72} maxValue={100} valueLabel="72 GB of 100 GB" warningAt={80} dangerAt={95} />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Label,
  Meter as AriaMeter,
  type MeterProps as AriaMeterProps,
} from "react-aria-components";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { field } from "@/components/helpers/field";

export interface MeterProps extends Omit<
  AriaMeterProps,
  "className" | "style" | "children" | "aria-label"
> {
  /** Names what the bar measures, such as "Storage". */
  readonly label: string;
  /** Text next to the label, such as "72 GB of 100 GB". Defaults to the percentage. */
  readonly valueLabel?: string;
  /** Value at which the bar turns to the warning color. The value text carries the meaning. */
  readonly warningAt?: number;
  /** Value at which the bar turns to the danger color. */
  readonly dangerAt?: number;
  /** Layout overrides, such as a width. */
  readonly style?: StyleXStyles;
}

export function Meter({ label, valueLabel, warningAt, dangerAt, style, ...props }: MeterProps) {
  const tone = meterTone(props.value ?? 0, warningAt, dangerAt);
  return (
    <AriaMeter {...props} valueLabel={valueLabel} {...stylex.props(field.root, styles.root, style)}>
      {({ percentage, valueText }) => (
        <>
          <span {...stylex.props(styles.labels)}>
            <Label {...stylex.props(field.label)}>{label}</Label>
            <span {...stylex.props(styles.value, tone === "danger" && styles.valueDanger)}>
              {valueText}
            </span>
          </span>
          <span {...stylex.props(styles.track)}>
            <span {...stylex.props(styles.fill, tones[tone], styles.width(percentage))} />
          </span>
        </>
      )}
    </AriaMeter>
  );
}

function meterTone(
  value: number,
  warningAt: number | undefined,
  dangerAt: number | undefined,
): keyof typeof tones {
  if (dangerAt !== undefined && value >= dangerAt) return "danger";
  if (warningAt !== undefined && value >= warningAt) return "warning";
  return "accent";
}

const styles = stylex.create({
  root: { gap: space.xs, minWidth: "8rem" },
  labels: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
  },
  value: { fontSize: font.sm, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  valueDanger: { color: color.danger, fontWeight: font.medium },
  track: {
    display: "block",
    height: "0.375rem",
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: color.inset,
  },
  fill: { display: "block", height: "100%", borderRadius: radius.full },
  width: (percentage: number) => ({ width: `${percentage}%` }),
});

const tones = stylex.create({
  accent: { backgroundColor: color.accent },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
});
