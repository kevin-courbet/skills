import { Disc, Link2, Wrench } from "lucide-react";
import { useState } from "react";
import type { ChoiceOption } from "@/components/helpers/choice";
import { Checkbox, CheckboxGroup, type CheckboxGroupProps } from "@/components/primitives/checkbox";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type ServiceId = "bleed" | "drivetrain" | "truing" | "suspension";
type RepairId = "flat" | "chain" | "brakes" | "gears" | "wheel" | "headset";
type ChannelId = "sms" | "email" | "call";
type CheckId = "frame" | "torque" | "ride";

const services: ReadonlyArray<ChoiceOption<ServiceId>> = [
  {
    id: "bleed",
    label: "Brake bleed",
    description: "New fluid in both hydraulic brakes and a check of the pads.",
    meta: "45 min",
  },
  {
    id: "drivetrain",
    label: "Drivetrain clean",
    description: "Chain, cassette, and chainrings cleaned in the parts washer and lubed.",
    meta: "1 h",
  },
  {
    id: "truing",
    label: "Wheel truing",
    description: "Both wheels trued and the spoke tension set.",
    meta: "30 min",
  },
  {
    id: "suspension",
    label: "Suspension service",
    description:
      "Fork lowers removed, new seals and oil, and a sag check with the customer on the bike at pickup.",
    meta: "2 h",
  },
];

const repairs: ReadonlyArray<ChoiceOption<RepairId>> = [
  { id: "flat", label: "Flat tire", icon: Disc },
  { id: "chain", label: "Chain", icon: Link2, meta: "€24" },
  { id: "brakes", label: "Brakes" },
  { id: "gears", label: "Gears" },
  { id: "wheel", label: "Wheel true" },
  { id: "headset", label: "Headset", icon: Wrench },
];

const channels: ReadonlyArray<ChoiceOption<ChannelId>> = [
  { id: "sms", label: "Text message", description: "Sent when the bike is ready for pickup." },
  { id: "email", label: "Email", description: "Includes the invoice as a PDF." },
  { id: "call", label: "Phone call" },
];

const finalChecks: ReadonlyArray<ChoiceOption<CheckId>> = [
  { id: "frame", label: "Frame inspected for cracks" },
  { id: "torque", label: "Bolts set to torque" },
  { id: "ride", label: "Test ride done", isDisabled: true },
];

function DemoCheckboxGroup<Value extends string>({
  initial,
  ...props
}: Omit<CheckboxGroupProps<Value>, "value" | "onChange"> & {
  readonly initial: ReadonlyArray<Value>;
}) {
  const [value, setValue] = useState<ReadonlyArray<Value>>(initial);
  return <CheckboxGroup {...props} value={value} onChange={setValue} />;
}

function RequiredChecks() {
  const [value, setValue] = useState<ReadonlyArray<CheckId>>([]);
  return (
    <CheckboxGroup
      label="Final checks"
      appearance="list"
      isRequired
      options={finalChecks}
      value={value}
      onChange={setValue}
      errorMessage={value.length < 2 ? "Do the frame and torque checks before pickup." : undefined}
    />
  );
}

export default defineSection({
  component: "Checkbox",
  specimens: [
    {
      title: "Checkbox states",
      note: "Use one Checkbox for one independent answer. The dash shows a select-all box when only some rows are selected.",
      render: () => (
        <Row align="start">
          <Labeled label="not selected">
            <Checkbox>Ask before extra work</Checkbox>
          </Labeled>
          <Labeled label="defaultSelected">
            <Checkbox defaultSelected>Email the invoice to the customer</Checkbox>
          </Labeled>
          <Labeled label="isIndeterminate">
            <Checkbox isIndeterminate>Select all parts</Checkbox>
          </Labeled>
          <Labeled label="aria-label, no visible label">
            <Checkbox aria-label="Select work order WO-1042" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Checkbox disabled and invalid",
      render: () => (
        <Row align="start">
          <Labeled label="isDisabled">
            <Checkbox isDisabled>Add to loyalty card</Checkbox>
          </Labeled>
          <Labeled label="isDisabled selected">
            <Checkbox isDisabled defaultSelected>
              Warranty repair
            </Checkbox>
          </Labeled>
          <Labeled label="isInvalid">
            <Checkbox isInvalid>I accept the storage fee after 14 days</Checkbox>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "CheckboxGroup cards",
      note: "Cards, the default, fit options with a description or a meta, such as a duration.",
      render: () => (
        <Column width="36rem">
          <DemoCheckboxGroup
            label="Services"
            description="Each service adds to the estimate."
            options={services}
            initial={["bleed", "suspension"]}
          />
        </Column>
      ),
    },
    {
      title: "CheckboxGroup chips",
      note: "Chips fit short labels. A selected chip shows a check mark instead of its icon.",
      render: () => (
        <Column width="36rem">
          <DemoCheckboxGroup
            label="Repairs requested"
            appearance="chips"
            isOptional
            options={repairs}
            initial={["flat", "brakes"]}
          />
        </Column>
      ),
    },
    {
      title: "CheckboxGroup list",
      note: "The list fits a dense panel or a dialog.",
      render: () => (
        <Column width="24rem">
          <DemoCheckboxGroup
            label="Notify the customer"
            appearance="list"
            options={channels}
            initial={["sms"]}
          />
        </Column>
      ),
    },
    {
      title: "CheckboxGroup required, invalid, and disabled",
      note: "The error message marks the group invalid. One option is disabled in the first group, and the full group in the second.",
      render: () => (
        <Row align="start">
          <Column width="20rem">
            <RequiredChecks />
          </Column>
          <Column width="20rem">
            <DemoCheckboxGroup
              label="Notify the customer"
              appearance="list"
              isDisabled
              options={channels}
              initial={["email"]}
            />
          </Column>
        </Row>
      ),
    },
  ],
});
