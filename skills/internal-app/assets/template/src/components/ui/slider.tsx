// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
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
import { color, font, motion, radius, shadow, space } from "@/styles/tokens.stylex";
import { field } from "./field";

interface SliderBaseProps {
  readonly label: string;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly step?: number;
  /** Formats the value text, such as `{ style: "percent" }` or a unit. */
  readonly formatOptions?: Intl.NumberFormatOptions;
  /** Values labeled under the track, such as `[0, 50, 100]`. */
  readonly marks?: ReadonlyArray<number>;
  readonly isDisabled?: boolean;
  readonly style?: StyleXStyles;
}

export interface SliderProps extends SliderBaseProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
}

/**
 * A number picked on a track, such as a sampling rate or an alert threshold.
 * Arrow keys step by `step`, Page Up and Page Down by a tenth, Home and End
 * jump to the ends. Use NumberField when people type exact values.
 */
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
  readonly value: readonly [number, number];
  readonly onChange: (value: readonly [number, number]) => void;
  /** Names the two thumbs. Default "Minimum" and "Maximum". */
  readonly thumbLabels?: readonly [string, string];
}

/** A range picked on a track, such as a latency band or an amount filter. */
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
  track: { position: "relative", height: "1.25rem", marginInline: "0.5rem", cursor: "pointer" },
  rail: {
    position: "absolute",
    top: "50%",
    left: "-0.5rem",
    right: "-0.5rem",
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
    width: "1rem",
    height: "1rem",
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
  marks: { position: "relative", height: "1rem", marginInline: "0.5rem" },
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
