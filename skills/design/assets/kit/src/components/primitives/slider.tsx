// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * A number or a range that people pick on a track, such as a threshold or a
 * latency band.
 *
 * @layer primitive
 * @keywords slider, range slider, track, threshold, percentage, min and max, latency band, sampling rate, drag a value
 * @related NumberField, Meter, Filters
 * @notes form-fields, kit-forms
 *
 * Use `Slider` for one value and `RangeSlider` for a low and a high value, when
 * the place on the scale matters more than the exact number. Do not use it when
 * people type an exact value: use `NumberField`. Do not use it to show a level
 * that people do not change: use `Meter`.
 *
 * ## Behavior
 * - Arrow keys step by `step`. Page Up and Page Down move a tenth of the range.
 *   Home and End go to the ends.
 * - The value text above the track follows `formatOptions`.
 * - Screen readers skip the `marks`, because the value text already gives the
 *   value.
 *
 * ## Rules
 * - Set `minValue`, `maxValue`, and `step` from the domain.
 * - Give a unit through `formatOptions`, such as `{ style: "unit", unit:
 *   "millisecond" }`.
 *
 * ## Example
 * ```tsx
 * <RangeSlider
 *   label="Latency band"
 *   maxValue={2000}
 *   step={50}
 *   marks={[0, 1000, 2000]}
 *   formatOptions={{ style: "unit", unit: "millisecond" }}
 *   value={band}
 *   onChange={setBand}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Slider as AriaSlider,
  Label,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { color, font, motion, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { field } from "@/components/helpers/field";

interface SliderBaseProps {
  /** Visible name of the slider, in sentence case. */
  readonly label: string;
  /** Lowest value of the track. */
  readonly minValue?: number;
  /** Highest value of the track. */
  readonly maxValue?: number;
  /** Distance between two values that people can pick. */
  readonly step?: number;
  /** Formats the value text, such as `{ style: "percent" }` or a unit. */
  readonly formatOptions?: Intl.NumberFormatOptions;
  /** Values labeled under the track, such as `[0, 50, 100]`. */
  readonly marks?: ReadonlyArray<number>;
  /** Shows the slider and blocks changes. */
  readonly isDisabled?: boolean;
  /** StyleX styles for the root, such as a width in a toolbar. */
  readonly style?: StyleXStyles;
}

export interface SliderProps extends SliderBaseProps {
  /** The current value. */
  readonly value: number;
  /** Receives the next value during a drag and after each key press. */
  readonly onChange: (value: number) => void;
}

export function Slider({ value, onChange, ...props }: SliderProps) {
  return (
    <SliderFrame
      {...props}
      value={[value]}
      onChange={(values) => {
        const next = values[0];
        if (next !== undefined) onChange(next);
      }}
      thumbLabels={[props.label]}
    />
  );
}

export interface RangeSliderProps extends SliderBaseProps {
  /** The low and the high value. */
  readonly value: readonly [number, number];
  /** Receives the next low and high value. */
  readonly onChange: (value: readonly [number, number]) => void;
  /** Names the two thumbs. Default "Minimum" and "Maximum". */
  readonly thumbLabels?: readonly [string, string];
}

export function RangeSlider({
  value,
  onChange,
  thumbLabels = ["Minimum", "Maximum"],
  ...props
}: RangeSliderProps) {
  return (
    <SliderFrame
      {...props}
      value={value}
      onChange={(values) => {
        const [start, end] = values;
        if (start !== undefined && end !== undefined) onChange([start, end]);
      }}
      thumbLabels={thumbLabels}
    />
  );
}

interface SliderFrameProps extends SliderBaseProps {
  readonly value: ReadonlyArray<number>;
  readonly onChange: (values: ReadonlyArray<number>) => void;
  readonly thumbLabels: ReadonlyArray<string>;
}

function SliderFrame({
  label,
  value,
  onChange,
  minValue = 0,
  maxValue = 100,
  step = 1,
  formatOptions,
  marks,
  isDisabled,
  thumbLabels,
  style,
}: SliderFrameProps) {
  const share = (point: number) => ((point - minValue) / (maxValue - minValue)) * 100;
  return (
    <AriaSlider
      value={[...value]}
      onChange={(next) => onChange(Array.isArray(next) ? next : [next])}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      formatOptions={formatOptions}
      isDisabled={isDisabled}
      {...stylex.props(styles.root, isDisabled === true && styles.disabled, style)}
    >
      <div {...stylex.props(styles.header)}>
        <Label {...stylex.props(field.label)}>{label}</Label>
        <SliderOutput {...stylex.props(styles.output)} />
      </div>
      <SliderTrack {...stylex.props(styles.track)}>
        {({ state }) => {
          const low = value.length > 1 ? share(state.getThumbValue(0)) : 0;
          const high = share(state.getThumbValue(value.length - 1));
          return (
            <>
              <span {...stylex.props(styles.rail)} />
              <span {...stylex.props(styles.fill, styles.fillAt(low, high))} />
              {value.map((_, index) => (
                <SliderThumb
                  key={thumbLabels[index] ?? index}
                  index={index}
                  aria-label={thumbLabels[index]}
                  // react-aria positions each thumb through its default style, so keep it.
                  className={(thumb) =>
                    stylex.props(
                      styles.thumb,
                      thumb.isDragging && styles.thumbDragging,
                      thumb.isFocusVisible && styles.thumbFocused,
                    ).className ?? ""
                  }
                  style={(thumb) => ({
                    ...thumb.defaultStyle,
                    ...stylex.props(styles.thumb).style,
                  })}
                />
              ))}
            </>
          );
        }}
      </SliderTrack>
      {marks === undefined ? null : (
        <div aria-hidden {...stylex.props(styles.marks)}>
          {marks.map((mark) => (
            <span
              key={mark}
              {...stylex.props(styles.mark, styles.markAt(share(mark), markShift(share(mark))))}
            >
              {mark.toLocaleString(appLocale, formatOptions)}
            </span>
          ))}
        </div>
      )}
    </AriaSlider>
  );
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: "10rem" },
  disabled: { opacity: "0.5" },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
  },
  output: { fontSize: font.sm, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  // The track insets by half a thumb, so a thumb at either end stays inside the slider.
  track: {
    position: "relative",
    height: size.sliderTrack,
    marginInline: `calc(${size.sliderThumb} / 2)`,
    cursor: "pointer",
  },
  rail: {
    position: "absolute",
    top: "50%",
    left: `calc(${size.sliderThumb} / -2)`,
    right: `calc(${size.sliderThumb} / -2)`,
    height: "0.25rem",
    transform: "translateY(-50%)",
    borderRadius: radius.full,
    backgroundColor: color.inset,
    boxShadow: `inset 0 0 0 1px ${color.border}`,
  },
  fill: {
    position: "absolute",
    top: "50%",
    height: "0.25rem",
    transform: "translateY(-50%)",
    borderRadius: radius.full,
    backgroundColor: color.accent,
  },
  fillAt: (low: number, high: number) => ({ left: `${low}%`, width: `${high - low}%` }),
  thumb: {
    top: "50%",
    width: size.sliderThumb,
    height: size.sliderThumb,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: color.accent,
    borderRadius: radius.full,
    backgroundColor: color.raised,
    boxShadow: shadow.sm,
    transitionProperty: "box-shadow",
    transitionDuration: motion.fast,
  },
  thumbDragging: { boxShadow: `0 0 0 4px ${color.accentMuted}` },
  thumbFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  marks: { position: "relative", height: "1lh", marginInline: `calc(${size.sliderThumb} / 2)` },
  mark: {
    position: "absolute",
    top: 0,
    fontSize: font.xs,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  // Labels center on their value; the end labels align to the track ends so they stay inside.
  markAt: (left: number, shift: number) => ({
    left: `${left}%`,
    transform: `translateX(-${shift}%)`,
  }),
});

function markShift(share: number): number {
  if (share <= 0) return 0;
  if (share >= 100) return 100;
  return 50;
}
