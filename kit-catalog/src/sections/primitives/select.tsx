import { useState } from "react";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import { Button } from "@/components/primitives/button";
import { Select, type SelectOption } from "@/components/primitives/select";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type MechanicId = "lea" | "marco" | "sami" | "jonas";
type StatusId = "received" | "repair" | "parts" | "ready" | "cancelled";
type PackageId = "basic" | "full" | "ebike";
type BayId = "bay1" | "bay2" | "bay3";
type ShopId = "north" | "harbor";

const mechanics: ReadonlyArray<SelectOption<MechanicId>> = [
  { id: "lea", label: "Léa Martin" },
  { id: "marco", label: "Marco Rossi" },
  { id: "sami", label: "Sami Haddad" },
  { id: "jonas", label: "Jonas Berg" },
];

const statuses: ReadonlyArray<SelectOption<StatusId>> = [
  { id: "received", label: "Received", intent: "neutral" },
  { id: "repair", label: "In repair", intent: "info" },
  { id: "parts", label: "Waiting for parts", intent: "warning" },
  { id: "ready", label: "Ready for pickup", intent: "success" },
  { id: "cancelled", label: "Cancelled", intent: "danger" },
];

const packages: ReadonlyArray<SelectOption<PackageId>> = [
  { id: "basic", label: "Basic tune-up", description: "Brake and gear adjustment, chain lube" },
  { id: "full", label: "Full service", description: "Strip, clean, and rebuild of the drivetrain" },
  {
    id: "ebike",
    label: "E-bike check",
    description: "Motor diagnostics and battery health report",
  },
];

const bays: ReadonlyArray<SelectOption<BayId>> = [
  { id: "bay1", label: "Bay 1", color: "blue" },
  { id: "bay2", label: "Bay 2", color: "green" },
  { id: "bay3", label: "Bay 3", color: "violet" },
];

const shops: ReadonlyArray<SelectOption<ShopId>> = [
  { id: "north", label: "North Street workshop and showroom, ground floor" },
  { id: "harbor", label: "Harbor pop-up stand" },
];

function AssignMechanic() {
  const [mechanic, setMechanic] = useState<MechanicId | null>(null);
  return (
    <Select
      label="Mechanic"
      width="md"
      placeholder="Assign a mechanic"
      options={mechanics}
      value={mechanic}
      onChange={setMechanic}
    />
  );
}

export default defineSection({
  component: "Select",
  specimens: [
    {
      title: "Single choice",
      note: "Give the field a width from its longest option. In a form, show a short list as a RadioGroup.",
      render: () => (
        <Row align="start">
          <Labeled label="empty, controlled">
            <AssignMechanic />
          </Labeled>
          <Labeled label="defaultValue">
            <Select label="Mechanic" width="md" options={mechanics} defaultValue="marco" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Option marks",
      note: "Open each field: an option shows a status dot, a description, or a color swatch.",
      render: () => (
        <Row align="start">
          <Labeled label="intent">
            <Select label="Work order status" width="md" options={statuses} defaultValue="parts" />
          </Labeled>
          <Labeled label="description">
            <Select label="Service package" width="md" options={packages} defaultValue="full" />
          </Labeled>
          <Labeled label="color">
            <Select label="Repair bay" width="sm" options={bays} defaultValue="bay2" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Field states",
      render: () => (
        <Column width="22rem">
          <Labeled label="description, isRequired">
            <Select
              label="Mechanic"
              width="md"
              description="The mechanic gets a notice when the bike is checked in."
              options={mechanics}
              isRequired
            />
          </Labeled>
          <Labeled label="isOptional">
            <Select label="Repair bay" width="sm" options={bays} isOptional />
          </Labeled>
          <Labeled label="errorMessage">
            <Select
              label="Mechanic"
              width="md"
              options={mechanics}
              errorMessage="Assign a mechanic before you start the work order."
            />
          </Labeled>
          <Labeled label="isDisabled">
            <Select
              label="Mechanic"
              width="md"
              options={mechanics}
              defaultValue="sami"
              isDisabled
            />
          </Labeled>
          <Labeled label="disabledKeys">
            <Select
              label="Work order status"
              width="md"
              description="An order that is ready cannot go back to received."
              options={statuses}
              defaultValue="ready"
              disabledKeys={["received"]}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Compact toolbar",
      note: "In a dense toolbar, hide the label and set the row height with ControlSizeProvider.",
      render: () => (
        <ControlSizeProvider size="sm">
          <Row>
            <Select label="Mechanic" hideLabel width="sm" options={mechanics} defaultValue="lea" />
            <Select
              label="Work order status"
              hideLabel
              width="sm"
              options={statuses}
              defaultValue="repair"
            />
            <Button>Export</Button>
          </Row>
        </ControlSizeProvider>
      ),
    },
    {
      title: "Long option label",
      note: "The trigger truncates a label that is longer than the field.",
      render: () => (
        <Select label="Shop location" width="sm" options={shops} defaultValue="north" />
      ),
    },
  ],
});
