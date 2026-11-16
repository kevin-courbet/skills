import { CalendarClock, Truck, Zap } from "lucide-react";
import { useState } from "react";
import type { ChoiceOption } from "@/components/helpers/choice";
import { RadioGroup } from "@/components/primitives/radio-group";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type HandoverId = "pickup" | "delivery" | "storage";
type WheelId = "26" | "275" | "29" | "700c";
type PriorityId = "standard" | "express" | "sameDay";
type MechanicId = "lea" | "marco" | "sami" | "jonas";
type FrameId = "aluminum" | "steel" | "carbon" | "titanium";

const handovers: ReadonlyArray<ChoiceOption<HandoverId>> = [
  {
    id: "pickup",
    label: "Customer picks up",
    description: "At the North Street workshop, 09:00 to 18:30.",
  },
  {
    id: "delivery",
    label: "Deliver to the customer",
    description: "Cargo bike delivery inside the city.",
  },
  {
    id: "storage",
    label: "Keep in storage",
    description: "Free for 14 days, then €2 for each day.",
  },
];

const wheelSizes: ReadonlyArray<ChoiceOption<WheelId>> = [
  { id: "26", label: "26 in" },
  { id: "275", label: "27.5 in" },
  { id: "29", label: "29 in" },
  { id: "700c", label: "700c" },
];

const priorities: ReadonlyArray<ChoiceOption<PriorityId>> = [
  {
    id: "standard",
    label: "Standard",
    description: "Ready in 3 working days.",
    meta: "Included",
    icon: CalendarClock,
  },
  {
    id: "express",
    label: "Express",
    description: "Ready the next working day, before the shop closes.",
    meta: "+€15",
    icon: Truck,
  },
  {
    id: "sameDay",
    label: "Same day",
    description:
      "Ready on the same day when the bike arrives before 10:00. A mechanic stops the current job for it, so other orders can move by one day.",
    meta: "+€30",
    icon: Zap,
  },
];

const mechanics: ReadonlyArray<ChoiceOption<MechanicId>> = [
  { id: "lea", label: "Léa Martin", meta: "3 open", avatar: {} },
  { id: "marco", label: "Marco Rossi", meta: "5 open", avatar: {} },
  { id: "sami", label: "Sami Haddad", meta: "1 open", avatar: {} },
  { id: "jonas", label: "Jonas Berg", meta: "Off today", avatar: {}, isDisabled: true },
];

const frames: ReadonlyArray<ChoiceOption<FrameId>> = [
  { id: "aluminum", label: "Aluminum" },
  { id: "steel", label: "Steel" },
  { id: "carbon", label: "Carbon", description: "We send carbon repairs to a partner shop." },
  {
    id: "titanium",
    label: "Titanium",
    description: "We do not repair titanium frames.",
    isDisabled: true,
  },
];

function AssignMechanic() {
  const [mechanic, setMechanic] = useState<MechanicId | null>("lea");
  return (
    <RadioGroup
      label="Mechanic"
      appearance="chips"
      options={mechanics}
      noneOption={{ label: "Assign later" }}
      value={mechanic}
      onChange={setMechanic}
    />
  );
}

function RequiredFrame() {
  const [frame, setFrame] = useState<FrameId | null>(null);
  return (
    <RadioGroup
      label="Frame material"
      isRequired
      options={frames}
      value={frame}
      onChange={setFrame}
      errorMessage={frame === null ? "Choose the frame material." : undefined}
    />
  );
}

export default defineSection({
  component: "RadioGroup",
  specimens: [
    {
      title: "List",
      note: "The list, the default, fits a dense panel or a dialog.",
      render: () => (
        <Column width="24rem">
          <RadioGroup label="Handover" options={handovers} defaultValue="pickup" />
        </Column>
      ),
    },
    {
      title: "Horizontal list",
      render: () => (
        <RadioGroup
          label="Wheel size"
          orientation="horizontal"
          options={wheelSizes}
          defaultValue="29"
        />
      ),
    },
    {
      title: "Cards",
      note: "Cards fit options that people compare, with a description each and a fact in the meta. The last description wraps.",
      render: () => (
        <Column width="40rem">
          <RadioGroup
            label="Priority"
            description="The priority sets the ready date on the work order."
            appearance="cards"
            options={priorities}
            defaultValue="standard"
          />
        </Column>
      ),
    },
    {
      title: "Chips with a none option",
      note: "Add a none option when people may skip the answer. Do not make people press a selected chip again to clear it.",
      render: () => (
        <Column width="40rem">
          <AssignMechanic />
        </Column>
      ),
    },
    {
      title: "Required, invalid, disabled, and read-only",
      note: "errorMessage marks the group invalid. isDisabled on an option disables only that option.",
      render: () => (
        <Row align="start">
          <Column width="20rem">
            <Labeled label="isRequired, errorMessage, one disabled option">
              <RequiredFrame />
            </Labeled>
          </Column>
          <Column width="20rem">
            <Labeled label="isDisabled">
              <RadioGroup label="Handover" isDisabled options={handovers} defaultValue="delivery" />
            </Labeled>
          </Column>
          <Column width="20rem">
            <Labeled label="isReadOnly">
              <RadioGroup label="Handover" isReadOnly options={handovers} defaultValue="storage" />
            </Labeled>
          </Column>
        </Row>
      ),
    },
  ],
});
