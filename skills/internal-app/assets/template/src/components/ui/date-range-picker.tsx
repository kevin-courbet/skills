/**
 * A start date and an end date in one field, with a range calendar and preset
 * ranges.
 *
 * @layer primitive
 * @keywords date range, date range picker, period, report period, from and to dates, start and end date, last 30 days, presets, log window
 * @related DatePicker, Filters, Calendar, TrendChart
 * @notes form-choices, form-fields, internal-app-forms, internal-app-url-filters
 *
 * Use it for a period, such as a report period or a log window. Do not use it
 * for one date: use `DatePicker`. To filter a list by a period, use a
 * `dateRange` field of `Filters`, which uses the same calendar and presets.
 *
 * ## Behavior
 * - People type both dates, or press the start and the end in the calendar.
 * - The presets show beside the calendar on wide screens and above it on narrow
 *   screens. A preset sets the value and closes the popover.
 *
 * ## Rules
 * - Take the reference date of `presets` from the loader, so that the server
 *   and the browser show the same ranges.
 * - `DateRangePresetList` and `rangePanel` are parts of the `Filters` date
 *   editor. Do not use them on a page.
 * - `isOptional` together with `isRequired` throws an error.
 *
 * ## Example
 * ```tsx
 * <DateRangePicker
 *   label="Report period"
 *   presets={[
 *     { label: "Last 7 days", value: { start: addDays(today, -6), end: today } },
 *     { label: "Last 30 days", value: { start: addDays(today, -29), end: today } },
 *   ]}
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type CalendarDate, parseDate } from "@internationalized/date";
import {
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, media, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { CalendarButton, DateSegments, RangeCalendarView, calendar } from "./calendar";
import {
  control,
  field,
  FieldDescription,
  FieldErrorMessage,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
} from "./field";
import { overlay } from "./overlay";
import { useControlSize } from "./control-size";
import { useOverlayDensity } from "./density";

/** Inclusive range of ISO calendar dates. */
export interface DateRange {
  /** First day, as an ISO date. */
  readonly start: string;
  /** Last day, as an ISO date. The range includes it. */
  readonly end: string;
}

export interface DateRangePreset {
  /** Sentence case, such as "Last 7 days". */
  readonly label: string;
  /** The range that the preset sets. */
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
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** The range, or null when the field is empty. */
  readonly value: DateRange | null;
  /** Receives the range, or null when people clear the field. */
  readonly onChange: (value: DateRange | null) => void;
  /** Earliest allowed ISO date. */
  readonly minValue?: string;
  /** Latest allowed ISO date. */
  readonly maxValue?: string;
  /** Quick ranges listed next to the calendar. Compute them from a stable reference date. */
  readonly presets?: ReadonlyArray<DateRangePreset>;
  /** Hint between the label and the control, such as the format or where the answer goes. */
  readonly description?: string;
  /** Error text under the field. It also marks the field invalid. */
  readonly errorMessage?: string;
  /** Adds a quiet "optional" to the label. Do not set it with `isRequired`. */
  readonly isOptional?: boolean;
  /** Control width from the expected length of the answer. See FieldWidth. */
  readonly width?: FieldWidth;
  /** StyleX styles for the root, such as a margin from the parent layout. */
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
  isOptional = false,
  width = "full",
  style,
  ...props
}: DateRangePickerProps) {
  const controlSize = useControlSize();
  const overlayDensity = useOverlayDensity();
  if (isOptional && props.isRequired === true)
    throw new Error("DateRangePicker: a field cannot be both optional and required.");
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
      <FieldLabel isOptional={isOptional}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <Group
        {...renderStyles<{ isInvalid: boolean; isDisabled: boolean }>((state) => [
          control.base,
          fieldWidth[width],
          controlSize === "sm" && control.compact,
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
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
      <Popover
        placement="bottom end"
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          ...overlayDensity,
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
  /** The quick ranges. An empty list renders nothing. */
  readonly presets: ReadonlyArray<DateRangePreset>;
  /** Receives the range of the pressed preset. */
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
