import { CircleAlert, Info, Mail, MessageSquare, Phone, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import {
  ToggleGroup,
  type ToggleGroupProps,
  type ToggleOption,
} from "@/components/primitives/toggle-group";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type ChannelId = "email" | "sms" | "phone";
type LevelId = "info" | "warning" | "error";

const weekdays: ReadonlyArray<ToggleOption<DayId>> = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun", isDisabled: true },
];

const channels: ReadonlyArray<ToggleOption<ChannelId>> = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "Text message", icon: MessageSquare },
  { id: "phone", label: "Phone call", icon: Phone },
];

const levels: ReadonlyArray<ToggleOption<LevelId>> = [
  { id: "info", label: "Info", icon: Info },
  { id: "warning", label: "Warning", icon: TriangleAlert },
  { id: "error", label: "Error", icon: CircleAlert },
];

function Group<Value extends string>({
  initial,
  ...props
}: Omit<ToggleGroupProps<Value>, "value" | "onChange"> & {
  readonly initial: ReadonlyArray<Value>;
}) {
  const [value, setValue] = useState(initial);
  return <ToggleGroup {...props} value={value} onChange={setValue} />;
}

export default defineSection({
  component: "ToggleGroup",
  specimens: [
    {
      title: "Text options",
      note: "Each option turns on or off, and the change applies at once. A pressed text option shows a check mark.",
      render: () => (
        <Labeled label="disabled Sunday option">
          <Group
            label="Open for repairs on days"
            options={weekdays}
            initial={["tue", "wed", "thu", "fri", "sat"]}
          />
        </Labeled>
      ),
    },
    {
      title: "Icons",
      render: () => (
        <Row align="start">
          <Labeled label="icon and label">
            <Group label="Notify the customer by" options={channels} initial={["email", "sms"]} />
          </Labeled>
          <Labeled label="iconOnly">
            <Group label="Log levels" iconOnly options={levels} initial={["warning", "error"]} />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "States and compact size",
      render: () => (
        <Column>
          <Labeled label="none pressed">
            <Group label="Notify the customer by" options={channels} initial={[]} />
          </Labeled>
          <Labeled label="isDisabled">
            <Group
              label="Notify the customer by"
              isDisabled
              options={channels}
              initial={["email"]}
            />
          </Labeled>
          <Labeled label="sm row">
            <ControlSizeProvider size="sm">
              <Group label="Log levels" iconOnly options={levels} initial={["error"]} />
            </ControlSizeProvider>
          </Labeled>
        </Column>
      ),
    },
  ],
});
