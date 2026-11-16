import { useState } from "react";
import {
  DatePicker,
  type DatePickerProps,
  dayQuickPicks,
} from "@/components/primitives/date-picker";
import { Column, defineSection, Labeled } from "../../specimen";

const today = "2026-11-16";

function isSunday(isoDate: string): boolean {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay() === 0;
}

const nextOpenDays = dayQuickPicks({ today, count: 4, skip: isSunday });

function DateField({
  initialValue,
  ...props
}: Omit<DatePickerProps, "value" | "onChange"> & { readonly initialValue: string | null }) {
  const [value, setValue] = useState<string | null>(initialValue);
  return <DatePicker {...props} value={value} onChange={setValue} />;
}

export default defineSection({
  component: "DatePicker",
  specimens: [
    {
      title: "Date field",
      note: "People type the parts of the date in the locale order, or open the calendar button.",
      render: () => (
        <Column width="20rem">
          <DateField
            label="Drop-off date"
            description="The day the customer brings the bike to the workshop."
            initialValue="2026-11-20"
          />
        </Column>
      ),
    },
    {
      title: "Quick picks",
      note: "Give quick picks when the date is usually in the next few days. dayQuickPicks skips the closed days.",
      render: () => (
        <Column>
          <DateField label="Visit date" quickPicks={nextOpenDays} initialValue={today} />
          <DateField
            label="Pickup date"
            description="The workshop is closed on Sundays."
            quickPicks={nextOpenDays}
            initialValue={null}
          />
        </Column>
      ),
    },
    {
      title: "States",
      render: () => (
        <Column width="20rem">
          <Labeled label="empty">
            <DateField label="Drop-off date" initialValue={null} />
          </Labeled>
          <Labeled label="isRequired">
            <DateField label="Drop-off date" isRequired initialValue={null} />
          </Labeled>
          <Labeled label="isOptional">
            <DateField label="Warranty end date" isOptional initialValue={null} />
          </Labeled>
          <Labeled label="isDisabled">
            <DateField label="Drop-off date" isDisabled initialValue="2026-11-20" />
          </Labeled>
          <Labeled label="isReadOnly">
            <DateField label="Invoice date" isReadOnly initialValue="2026-11-12" />
          </Labeled>
          <Labeled label="errorMessage">
            <DateField
              label="Pickup date"
              errorMessage="The pickup date is before the drop-off date. Pick 20 Nov 2026 or later."
              initialValue="2026-11-18"
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Quick picks in states",
      render: () => (
        <Column>
          <Labeled label="isDisabled">
            <DateField
              label="Visit date"
              quickPicks={nextOpenDays}
              isDisabled
              initialValue={today}
            />
          </Labeled>
          <Labeled label="errorMessage">
            <DateField
              label="Visit date"
              quickPicks={nextOpenDays}
              errorMessage="Pick a visit date."
              initialValue={null}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Limits",
      note: "Dates before minValue and after maxValue are not available in the calendar.",
      render: () => (
        <Column width="20rem">
          <DateField
            label="Pickup date"
            description="Pick a date in the next 3 weeks."
            minValue={today}
            maxValue="2026-12-07"
            initialValue="2026-11-24"
          />
        </Column>
      ),
    },
    {
      title: "Widths",
      render: () => (
        <Column>
          <Labeled label="sm (default)">
            <DateField label="Drop-off date" initialValue="2026-11-20" />
          </Labeled>
          <Labeled label="md">
            <DateField label="Drop-off date" width="md" initialValue="2026-11-20" />
          </Labeled>
          <Labeled label="lg">
            <DateField label="Drop-off date" width="lg" initialValue="2026-11-20" />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Long label and description",
      render: () => (
        <Column width="20rem">
          <DateField
            label="Date that the customer agreed to collect the repaired bike from the workshop"
            description="We keep a repaired bike for 30 days. After that date, the storage fee of the shop applies to each day."
            initialValue={null}
          />
        </Column>
      ),
    },
  ],
});
