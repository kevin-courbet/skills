import { parseDate } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useState } from "react";
import {
  type DateRange,
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangePreset,
} from "@/components/primitives/date-range-picker";
import { Column, defineSection, Labeled } from "../../specimen";

const today = "2026-11-16";

function addDays(isoDate: string, days: number): string {
  return parseDate(isoDate).add({ days }).toString();
}

const reportPresets: ReadonlyArray<DateRangePreset> = [
  { label: "Last 7 days", value: { start: addDays(today, -6), end: today } },
  { label: "Last 30 days", value: { start: addDays(today, -29), end: today } },
  { label: "This month", value: { start: "2026-11-01", end: today } },
  { label: "Last month", value: { start: "2026-10-01", end: "2026-10-31" } },
  { label: "This year", value: { start: "2026-01-01", end: today } },
];

function RangeField({
  initialValue,
  ...props
}: Omit<DateRangePickerProps, "value" | "onChange"> & { readonly initialValue: DateRange | null }) {
  const [value, setValue] = useState<DateRange | null>(initialValue);
  return <DateRangePicker {...props} value={value} onChange={setValue} />;
}

/**
 * `Labeled` aligns its content at the start, so a field with the default full width shrinks to
 * its content. This wrapper gives the field the width of the specimen column again.
 */
function FullWidth({ children }: { readonly children: ReactNode }) {
  return <div {...stylex.props(styles.fullWidth)}>{children}</div>;
}

const lastWeek: DateRange = { start: "2026-11-09", end: "2026-11-15" };

export default defineSection({
  component: "DateRangePicker",
  specimens: [
    {
      title: "Range with presets",
      note: "Open the calendar to see the presets. A preset sets the range and closes the popover.",
      render: () => (
        <Column width="28rem">
          <RangeField
            label="Invoice period"
            description="The report lists the invoices of each day in the period."
            presets={reportPresets}
            initialValue={lastWeek}
          />
        </Column>
      ),
    },
    {
      title: "Without presets",
      note: "People type both dates, or press the start and the end in the calendar.",
      render: () => (
        <Column width="28rem">
          <RangeField
            label="Leave of Marco Rossi"
            initialValue={{ start: "2026-12-21", end: "2027-01-03" }}
          />
        </Column>
      ),
    },
    {
      title: "States",
      render: () => (
        <Column width="28rem">
          <Labeled label="empty">
            <FullWidth>
              <RangeField label="Invoice period" presets={reportPresets} initialValue={null} />
            </FullWidth>
          </Labeled>
          <Labeled label="isRequired">
            <FullWidth>
              <RangeField label="Invoice period" isRequired initialValue={null} />
            </FullWidth>
          </Labeled>
          <Labeled label="isOptional">
            <FullWidth>
              <RangeField label="Closure of the workshop" isOptional initialValue={null} />
            </FullWidth>
          </Labeled>
          <Labeled label="isDisabled">
            <FullWidth>
              <RangeField label="Invoice period" isDisabled initialValue={lastWeek} />
            </FullWidth>
          </Labeled>
          <Labeled label="isReadOnly">
            <FullWidth>
              <RangeField
                label="Warranty period"
                isReadOnly
                initialValue={{ start: "2026-03-14", end: "2028-03-13" }}
              />
            </FullWidth>
          </Labeled>
          <Labeled label="errorMessage">
            <FullWidth>
              <RangeField
                label="Invoice period"
                errorMessage="The period is longer than 12 months. Pick a shorter period."
                initialValue={{ start: "2025-01-01", end: today }}
              />
            </FullWidth>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Limits",
      note: "Dates before minValue and after maxValue are not available in the calendar.",
      render: () => (
        <Column width="28rem">
          <RangeField
            label="Warranty claim period"
            description="Claims cover the last 12 months only."
            minValue="2025-11-17"
            maxValue={today}
            initialValue={{ start: "2026-10-01", end: "2026-10-31" }}
          />
        </Column>
      ),
    },
    {
      title: "Widths",
      render: () => (
        <Column>
          <Labeled label="md">
            <RangeField label="Invoice period" width="md" initialValue={lastWeek} />
          </Labeled>
          <Labeled label="lg">
            <RangeField label="Invoice period" width="lg" initialValue={lastWeek} />
          </Labeled>
          <Labeled label="full (default)">
            <FullWidth>
              <RangeField label="Invoice period" initialValue={lastWeek} />
            </FullWidth>
          </Labeled>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  fullWidth: { alignSelf: "stretch", minWidth: 0 },
});
