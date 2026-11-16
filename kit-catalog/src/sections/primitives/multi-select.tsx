import { useState } from "react";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import type { ListOption } from "@/components/helpers/list-box";
import { MultiSelect, type MultiSelectProps } from "@/components/primitives/multi-select";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type SkillId = "brakes" | "wheels" | "suspension" | "ebike" | "drivetrain" | "frame";
type LabelId = "warranty" | "rush" | "loaner" | "fleet";

const skills: ReadonlyArray<ListOption<SkillId>> = [
  { id: "brakes", label: "Hydraulic brakes" },
  { id: "wheels", label: "Wheel building", description: "Truing, spoke replacement, and lacing" },
  { id: "suspension", label: "Suspension service", description: "Fork and shock rebuilds" },
  { id: "ebike", label: "E-bike systems", description: "Motor, battery, and display diagnostics" },
  { id: "drivetrain", label: "Drivetrain" },
  { id: "frame", label: "Frame alignment" },
];

const orderLabels: ReadonlyArray<ListOption<LabelId>> = [
  { id: "warranty", label: "Warranty claim", color: "blue" },
  { id: "rush", label: "Rush job", color: "red" },
  { id: "loaner", label: "Loaner bike out", color: "amber" },
  { id: "fleet", label: "Fleet customer", color: "teal" },
];

type SkillFieldProps = Omit<MultiSelectProps<SkillId>, "label" | "options" | "value" | "onChange">;

function SkillField({
  initial,
  ...props
}: SkillFieldProps & { readonly initial: ReadonlyArray<SkillId> }) {
  const [value, setValue] = useState(initial);
  return (
    <MultiSelect
      label="Skills"
      placeholder="Choose skills"
      options={skills}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

function OrderLabelFilter() {
  const [value, setValue] = useState<ReadonlyArray<LabelId>>(["rush", "fleet"]);
  return (
    <MultiSelect
      label="Order labels"
      hideLabel
      width="sm"
      placeholder="All labels"
      options={orderLabels}
      value={value}
      onChange={setValue}
    />
  );
}

export default defineSection({
  component: "MultiSelect",
  specimens: [
    {
      title: "Several choices",
      note: "The trigger names the first choice and counts the rest. The popover stays open while people choose.",
      render: () => (
        <Row align="start">
          <Labeled label="empty">
            <SkillField width="md" initial={[]} />
          </Labeled>
          <Labeled label="three chosen">
            <SkillField width="md" initial={["brakes", "suspension", "ebike"]} />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Removable tags",
      note: "With showTags, the chosen values show as tags under the field. Use it in forms, not in toolbars.",
      render: () => (
        <SkillField
          width="md"
          showTags
          description="The planner gives this mechanic only the jobs that match."
          initial={["wheels", "drivetrain", "frame"]}
        />
      ),
    },
    {
      title: "Field states",
      render: () => (
        <Column width="22rem">
          <Labeled label="isRequired">
            <SkillField width="md" isRequired initial={["brakes"]} />
          </Labeled>
          <Labeled label="isOptional">
            <SkillField width="md" isOptional initial={[]} />
          </Labeled>
          <Labeled label="errorMessage">
            <SkillField width="md" initial={[]} errorMessage="Choose at least one skill." />
          </Labeled>
          <Labeled label="isDisabled, showTags">
            <SkillField width="md" isDisabled showTags initial={["ebike", "drivetrain"]} />
          </Labeled>
          <Labeled label="disabledKeys">
            <SkillField
              width="md"
              description="E-bike systems needs the certification course first."
              disabledKeys={["ebike"]}
              initial={["brakes"]}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Compact toolbar",
      note: "Hide the label in a dense toolbar. The options show color swatches.",
      render: () => (
        <ControlSizeProvider size="sm">
          <OrderLabelFilter />
        </ControlSizeProvider>
      ),
    },
    {
      title: "Long summary",
      note: "The trigger truncates a summary that is longer than the field.",
      render: () => <SkillField width="sm" initial={["suspension", "ebike", "frame", "wheels"]} />,
    },
  ],
});
