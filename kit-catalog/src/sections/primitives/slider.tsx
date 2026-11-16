import { useState } from "react";
import { RangeSlider, Slider } from "@/components/primitives/slider";
import { Column, defineSection } from "../../specimen";

const millimeters: Intl.NumberFormatOptions = { style: "unit", unit: "millimeter" };
const euros: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
};
const percent: Intl.NumberFormatOptions = { style: "percent" };
const hours: Intl.NumberFormatOptions = { style: "unit", unit: "hour", unitDisplay: "long" };

function SaddleHeight() {
  const [height, setHeight] = useState(725);
  return (
    <Slider
      label="Saddle height"
      minValue={600}
      maxValue={900}
      step={5}
      marks={[600, 750, 900]}
      formatOptions={millimeters}
      value={height}
      onChange={setHeight}
    />
  );
}

function LoyaltyDiscount() {
  const [discount, setDiscount] = useState(0.1);
  return (
    <Slider
      label="Loyalty discount"
      minValue={0}
      maxValue={0.3}
      step={0.05}
      formatOptions={percent}
      value={discount}
      onChange={setDiscount}
    />
  );
}

function PartPrice() {
  const [range, setRange] = useState<readonly [number, number]>([40, 220]);
  return (
    <RangeSlider
      label="Part price"
      maxValue={500}
      step={10}
      marks={[0, 250, 500]}
      formatOptions={euros}
      thumbLabels={["Lowest price", "Highest price"]}
      value={range}
      onChange={setRange}
    />
  );
}

function LaborBand() {
  const [band, setBand] = useState<readonly [number, number]>([0, 8]);
  return (
    <RangeSlider
      label="Labor time"
      maxValue={8}
      step={0.5}
      marks={[0, 4, 8]}
      formatOptions={hours}
      value={band}
      onChange={setBand}
    />
  );
}

export default defineSection({
  component: "Slider",
  specimens: [
    {
      title: "Slider with a unit and marks",
      note: "Set the range and the step from the domain, and give the unit through formatOptions.",
      render: () => (
        <Column width="24rem">
          <SaddleHeight />
        </Column>
      ),
    },
    {
      title: "Percent without marks",
      render: () => (
        <Column width="24rem">
          <LoyaltyDiscount />
        </Column>
      ),
    },
    {
      title: "RangeSlider",
      note: "A low and a high value, such as a price filter. Each thumb has its own name for screen readers.",
      render: () => (
        <Column width="24rem">
          <PartPrice />
        </Column>
      ),
    },
    {
      title: "RangeSlider at both ends",
      note: "The thumbs stay inside the slider at the lowest and the highest value.",
      render: () => (
        <Column width="24rem">
          <LaborBand />
        </Column>
      ),
    },
    {
      title: "Disabled",
      render: () => (
        <Column width="24rem">
          <Slider
            label="Saddle height"
            minValue={600}
            maxValue={900}
            step={5}
            marks={[600, 750, 900]}
            formatOptions={millimeters}
            isDisabled
            value={780}
            onChange={() => undefined}
          />
        </Column>
      ),
    },
  ],
});
