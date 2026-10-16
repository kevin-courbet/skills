import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type CalendarDate, parseDate } from "@internationalized/date";
import {
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  Dialog,
  FieldError,
  Group,
  Label,
  Popover,
  Text,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, media, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { CalendarButton, DateSegments, RangeCalendarView, calendar } from "./calendar";
import { control, field } from "./field";
import { overlay } from "./overlay";

/** Inclusive range of ISO calendar dates. */
export interface DateRange {
  readonly start: string;
  readonly end: string;
}

export interface DateRangePreset {
  /** Sentence case, such as "Last 7 days". */
  readonly label: string;
  readonly value: DateRange;
}

export interface DateRangePickerProps extends Omit<
  AriaDateRangePickerProps<CalendarDate>,
  | "className"
  | "style"
  | "children"
  | "value"
  | "defaultValue"
  | "onChange"
  | "minValue"
  | "maxValue"
> {
  readonly label: string;
  readonly value: DateRange | null;
  readonly onChange: (value: DateRange | null) => void;
  readonly minValue?: string;
  readonly maxValue?: string;
  /** Quick ranges listed next to the calendar. Compute them from a stable reference date. */
  readonly presets?: ReadonlyArray<DateRangePreset>;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/**
 * Start and end date in one field, with a two-click range calendar. Values are
 * ISO date strings, like DatePicker. Use it for report periods and log windows.
 */
export function DateRangePicker({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  presets = [],
  description,
  errorMessage,
  style,
  ...props
}: DateRangePickerProps) {
  const isInvalid = props.isInvalid ?? errorMessage !== undefined;
  return (
    <AriaDateRangePicker
      {...props}
      isInvalid={isInvalid}
      value={value === null ? null : { start: parseDate(value.start), end: parseDate(value.end) }}
      onChange={(next) =>
        onChange(next === null ? null : { start: next.start.toString(), end: next.end.toString() })
      }
      minValue={minValue === undefined ? undefined : parseDate(minValue)}
      maxValue={maxValue === undefined ? undefined : parseDate(maxValue)}
      {...stylex.props(field.root, style)}
    >
      <Label {...stylex.props(field.label)}>{label}</Label>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          calendar.group,
          state.isInvalid && control.invalid,
          state.isDisabled && control.disabled,
        ])}
      >
        <DateSegments slot="start" />
        <span aria-hidden {...stylex.props(styles.dash)}>
          –
        </span>
        <DateSegments slot="end" />
        <CalendarButton />
      </Group>
      {description ? (
        <Text slot="description" {...stylex.props(field.description)}>
          {description}
        </Text>
      ) : null}
      <FieldError {...stylex.props(field.error)}>{errorMessage}</FieldError>
      <Popover
        placement="bottom end"
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          overlay.popover,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
        <Dialog {...stylex.props(calendar.dialog, rangePanel.root)}>
          {({ close }) => (
            <>
              <DateRangePresetList
                presets={presets}
                onSelect={(range) => {
                  onChange(range);
                  close();
                }}
              />
              <RangeCalendarView />
            </>
          )}
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
}

/** Preset buttons next to a range calendar. Renders nothing without presets. */
export function DateRangePresetList({
  presets,
  onSelect,
}: {
  readonly presets: ReadonlyArray<DateRangePreset>;
  readonly onSelect: (range: DateRange) => void;
}) {
  if (presets.length === 0) return null;
  return (
    <div role="group" aria-label="Preset ranges" {...stylex.props(styles.presets)}>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          intent="ghost"
          size="sm"
          style={styles.preset}
          onPress={() => onSelect(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

/** Lays out presets beside the calendar on wide screens and above it on narrow ones. */
export const rangePanel = stylex.create({
  root: {
    display: "flex",
    flexDirection: { default: "column", [media.sm]: "row" },
    gap: space.md,
  },
});

const styles = stylex.create({
  dash: { color: color.textFaint, paddingInline: "2px" },
  presets: {
    display: "flex",
    flexDirection: { default: "row", [media.sm]: "column" },
    flexWrap: "wrap",
    gap: "2px",
    paddingBottom: { default: space.sm, [media.sm]: 0 },
    paddingInlineEnd: { default: 0, [media.sm]: space.md },
    borderWidth: 0,
    borderBottomWidth: { default: "1px", [media.sm]: 0 },
    borderInlineEndWidth: { default: 0, [media.sm]: "1px" },
    borderStyle: "solid",
    borderColor: color.borderSubtle,
  },
  preset: { justifyContent: "flex-start", fontWeight: "inherit" },
});
