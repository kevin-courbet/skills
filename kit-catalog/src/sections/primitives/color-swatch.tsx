import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { ColorSwatch, ColorSwatchPicker } from "@/components/primitives/color-swatch";
import { TagGroup } from "@/components/primitives/tag-group";
import type { CategoryColor } from "@/styles/category";
import { color, font, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const serviceTypes: ReadonlyArray<{ readonly name: string; readonly color: CategoryColor }> = [
  { name: "Brakes", color: "red" },
  { name: "Drivetrain", color: "orange" },
  { name: "Wheels", color: "amber" },
  { name: "Tune-up", color: "green" },
  { name: "E-bike", color: "teal" },
  { name: "Suspension", color: "blue" },
  { name: "Bike fitting", color: "indigo" },
  { name: "Custom build", color: "violet" },
  { name: "Kids bikes", color: "pink" },
];

const workshopColors: ReadonlyArray<CategoryColor> = ["green", "teal", "blue", "violet"];

function ServiceTypePicker() {
  const [value, setValue] = useState<CategoryColor | null>("teal");
  return (
    <Column width="22rem">
      <ColorSwatchPicker
        label="Service type color"
        description="The color shows on work order cards and in the schedule."
        value={value}
        onChange={setValue}
      />
      {value === null ? null : (
        <TagGroup label="Preview" items={[{ id: "e-bike", label: "E-bike", color: value }]} />
      )}
    </Column>
  );
}

function RequiredPicker() {
  const [value, setValue] = useState<CategoryColor | null>(null);
  return (
    <Column width="22rem">
      <ColorSwatchPicker
        label="Mechanic color"
        isRequired
        value={value}
        onChange={setValue}
        errorMessage={value === null ? "Pick a color for Bruno Costa." : undefined}
      />
    </Column>
  );
}

function SubsetPicker({ isDisabled }: { readonly isDisabled: boolean }) {
  const [value, setValue] = useState<CategoryColor | null>("blue");
  return (
    <ColorSwatchPicker
      label="Workshop color"
      colors={workshopColors}
      value={value}
      onChange={setValue}
      isDisabled={isDisabled}
    />
  );
}

export default defineSection({
  component: "ColorSwatch",
  specimens: [
    {
      title: "Palette next to category names",
      note: "Always show the name of the category in text next to a swatch.",
      render: () => (
        <div {...stylex.props(styles.list)}>
          {serviceTypes.map((type) => (
            <span key={type.name} {...stylex.props(styles.inline, styles.textSm)}>
              <ColorSwatch color={type.color} />
              {type.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Sizes",
      note: "sm sits before 12px or 13px text. md sits before larger text.",
      render: () => (
        <div {...stylex.props(styles.bottomRow)}>
          <Labeled label="sm">
            <span {...stylex.props(styles.inline, styles.textSm)}>
              <ColorSwatch color="blue" size="sm" />
              Suspension
            </span>
          </Labeled>
          <Labeled label="md">
            <span {...stylex.props(styles.inline, styles.textLg)}>
              <ColorSwatch color="blue" size="md" />
              Suspension
            </span>
          </Labeled>
        </div>
      ),
    },
    {
      title: "ColorSwatchPicker",
      note: "Show the result where it is used, such as a TagGroup tag next to the field.",
      render: () => <ServiceTypePicker />,
    },
    {
      title: "Required with no pick",
      note: "An error message marks the field invalid.",
      render: () => <RequiredPicker />,
    },
    {
      title: "Subset of the palette and disabled",
      render: () => (
        <Row align="start">
          <Labeled label="colors">
            <SubsetPicker isDisabled={false} />
          </Labeled>
          <Labeled label="isDisabled">
            <SubsetPicker isDisabled />
          </Labeled>
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  list: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: space.sm },
  // Aligns the items at the bottom, so captions under text of different sizes stay on one line.
  bottomRow: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: space.lg },
  inline: { display: "inline-flex", alignItems: "center", gap: space.sm, color: color.text },
  textSm: { fontSize: font.md },
  textLg: { fontSize: font.xl },
});
