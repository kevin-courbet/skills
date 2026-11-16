import { useState } from "react";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import {
  Cascader,
  type CascaderOption,
  type CascaderProps,
} from "@/components/primitives/cascader";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const repairTypes: ReadonlyArray<CascaderOption> = [
  {
    id: "brakes",
    label: "Brakes",
    children: [
      {
        id: "disc",
        label: "Disc brakes",
        children: [
          { id: "bleed", label: "Bleed" },
          { id: "pads", label: "Replace pads" },
          { id: "rotor", label: "True rotor" },
        ],
      },
      {
        id: "rim",
        label: "Rim brakes",
        children: [
          { id: "pads", label: "Replace pads" },
          { id: "cable", label: "Replace cable" },
        ],
      },
    ],
  },
  {
    id: "drivetrain",
    label: "Drivetrain",
    children: [
      { id: "chain", label: "Replace chain" },
      { id: "cassette", label: "Replace cassette" },
      { id: "derailleur", label: "Adjust derailleur" },
    ],
  },
  {
    id: "wheels",
    label: "Wheels",
    children: [
      { id: "true", label: "True wheel" },
      { id: "spoke", label: "Replace spoke" },
      { id: "tubeless", label: "Tubeless setup" },
    ],
  },
  {
    id: "ebike",
    label: "E-bike systems",
    isDisabled: true,
    children: [{ id: "motor", label: "Motor diagnostics" }],
  },
];

const storage: ReadonlyArray<CascaderOption> = [
  {
    id: "north",
    label: "North Street",
    children: [
      { id: "shelf-a", label: "Shelf A" },
      { id: "shelf-b", label: "Shelf B" },
    ],
  },
  {
    id: "harbor",
    label: "Harbor stand",
    children: [{ id: "cabinet", label: "Parts cabinet" }],
  },
];

const locations: ReadonlyArray<CascaderOption> = [
  {
    id: "workshop",
    label: "North Street workshop and showroom",
    children: [
      {
        id: "basement",
        label: "Basement storage room",
        children: [{ id: "rack-12", label: "Wheel rack 12, upper row next to the compressor" }],
      },
    ],
  },
];

type FieldProps = Omit<CascaderProps, "value" | "onChange">;

function CascaderField({
  initial,
  ...props
}: FieldProps & { readonly initial: ReadonlyArray<string> | null }) {
  const [value, setValue] = useState(initial);
  return <Cascader {...props} value={value} onChange={setValue} />;
}

export default defineSection({
  component: "Cascader",
  specimens: [
    {
      title: "Path in a hierarchy",
      note: "Open the field: Right opens a branch, Left goes back, Enter chooses. The tree has more than 12 options, so the search box shows.",
      render: () => (
        <Row align="start">
          <Labeled label="empty">
            <CascaderField
              label="Repair type"
              width="md"
              placeholder="Choose a repair"
              options={repairTypes}
              initial={null}
            />
          </Labeled>
          <Labeled label="chosen path">
            <CascaderField
              label="Repair type"
              width="md"
              options={repairTypes}
              initial={["brakes", "disc", "bleed"]}
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Branch selection and search",
      render: () => (
        <Column width="22rem">
          <Labeled label="allowsBranchSelection">
            <CascaderField
              label="Part storage"
              width="md"
              description="Choose a shop to store the part anywhere in it."
              allowsBranchSelection
              options={storage}
              initial={["north"]}
            />
          </Labeled>
          <Labeled label="isSearchable on a small tree">
            <CascaderField
              label="Part storage"
              width="md"
              isSearchable
              options={storage}
              initial={["harbor", "cabinet"]}
            />
          </Labeled>
          <Labeled label="isSearchable false on a large tree">
            <CascaderField
              label="Repair type"
              width="md"
              isSearchable={false}
              options={repairTypes}
              initial={null}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Optional and compact",
      note: "The field has no error message: validate the path before the submit, or show the error in an ErrorSummary.",
      render: () => (
        <Row align="start">
          <Labeled label="isOptional">
            <CascaderField
              label="Follow-up repair"
              width="md"
              isOptional
              options={repairTypes}
              initial={null}
            />
          </Labeled>
          <Labeled label="hideLabel, sm">
            <ControlSizeProvider size="sm">
              <CascaderField
                label="Repair type"
                hideLabel
                width="md"
                options={repairTypes}
                initial={["wheels", "tubeless"]}
              />
            </ControlSizeProvider>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Long path",
      note: "The trigger truncates a path that is longer than the field.",
      render: () => (
        <CascaderField
          label="Storage location"
          width="md"
          options={locations}
          initial={["workshop", "basement", "rack-12"]}
        />
      ),
    },
  ],
});
