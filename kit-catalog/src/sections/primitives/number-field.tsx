import { useState } from "react";
import { SettingRow, SettingsCard } from "@/components/primitives/layout";
import { NumberField } from "@/components/primitives/number-field";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const euros: Intl.NumberFormatOptions = { style: "currency", currency: "EUR" };

function TubesInStock() {
  const [tubes, setTubes] = useState(12);
  return (
    <NumberField
      label="Inner tubes in stock"
      width="sm"
      minValue={0}
      showStepper
      value={tubes}
      onChange={setTubes}
    />
  );
}

function RequiredQuantity() {
  const [quantity, setQuantity] = useState(Number.NaN);
  return (
    <NumberField
      label="Quantity"
      width="xs"
      isRequired
      minValue={1}
      value={quantity}
      onChange={setQuantity}
      errorMessage={Number.isNaN(quantity) ? "Enter how many parts the order uses." : undefined}
    />
  );
}

export default defineSection({
  component: "NumberField",
  specimens: [
    {
      title: "Units and widths",
      note: "Give every field a width from the length of its answer. The value is right-aligned in tabular figures.",
      render: () => (
        <Row align="start">
          <NumberField label="Quantity" width="xs" minValue={1} defaultValue={2} />
          <NumberField
            label="Labor time"
            unit="h"
            width="xs"
            minValue={0}
            step={0.25}
            defaultValue={1.5}
          />
          <NumberField label="Rotor size" unit="mm" width="xs" defaultValue={180} />
          <NumberField
            label="Tire pressure"
            unit="psi"
            width="sm"
            minValue={0}
            maxValue={120}
            defaultValue={65}
          />
        </Row>
      ),
    },
    {
      title: "Currency",
      note: "Give a currency through formatOptions, not through unit.",
      render: () => (
        <Row align="start">
          <NumberField
            label="Labor rate"
            width="sm"
            formatOptions={euros}
            minValue={0}
            defaultValue={68}
          />
          <NumberField
            label="Invoice total"
            width="md"
            formatOptions={euros}
            defaultValue={1284.5}
          />
        </Row>
      ),
    },
    {
      title: "Step buttons",
      note: "The buttons change the value by the step. Arrow keys also step without them.",
      render: () => (
        <Row align="start">
          <TubesInStock />
          <NumberField
            label="Spokes to replace"
            width="sm"
            minValue={0}
            maxValue={36}
            showStepper
            defaultValue={0}
          />
        </Row>
      ),
    },
    {
      title: "Description, placeholder, and optional",
      note: "An empty field gives NaN. Handle it as an empty answer.",
      render: () => (
        <Column width="20rem">
          <NumberField
            label="Odometer"
            description="The distance on the bike computer, for e-bike warranty claims."
            unit="km"
            width="sm"
            placeholder="e.g. 4200"
            isOptional
          />
        </Column>
      ),
    },
    {
      title: "Required, invalid, disabled, and read-only",
      render: () => (
        <Row align="start">
          <Labeled label="isRequired, empty">
            <RequiredQuantity />
          </Labeled>
          <Labeled label="isDisabled">
            <NumberField label="Discount" unit="%" width="xs" defaultValue={10} isDisabled />
          </Labeled>
          <Labeled label="isReadOnly">
            <NumberField
              label="Invoice total"
              width="sm"
              formatOptions={euros}
              defaultValue={312.4}
              isReadOnly
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Hidden label in a SettingRow",
      note: "The SettingRow names the field, so the label is hidden. Screen readers keep it.",
      render: () => (
        <Column width="36rem">
          <SettingsCard title="Pricing">
            <SettingRow label="Default labor rate" description="Applies to new estimates.">
              <NumberField
                label="Default labor rate"
                hideLabel
                width="sm"
                formatOptions={euros}
                defaultValue={68}
              />
            </SettingRow>
            <SettingRow label="Free storage" description="Days before the storage fee starts.">
              <NumberField
                label="Free storage"
                hideLabel
                unit="days"
                width="xs"
                minValue={0}
                defaultValue={14}
              />
            </SettingRow>
          </SettingsCard>
        </Column>
      ),
    },
  ],
});
