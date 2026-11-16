import { Archive, Bell, Pin, WrapText } from "lucide-react";
import { useState } from "react";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import { Button } from "@/components/primitives/button";
import { ToggleButton, type ToggleButtonProps } from "@/components/primitives/toggle-button";
import { Column, defineSection, Labeled, Row } from "../../specimen";

function Toggle({
  initial,
  ...props
}: Omit<ToggleButtonProps, "isSelected" | "onChange"> & { readonly initial: boolean }) {
  const [isSelected, setSelected] = useState(initial);
  return <ToggleButton {...props} isSelected={isSelected} onChange={setSelected} />;
}

export default defineSection({
  component: "ToggleButton",
  specimens: [
    {
      title: "Pressed and not pressed",
      note: "Write the label as the option. Keep it the same in both states. A pressed button with text and no icon shows a check mark.",
      render: () => (
        <Row>
          <Labeled label="not pressed">
            <Toggle label="Show archived" initial={false} />
          </Labeled>
          <Labeled label="pressed">
            <Toggle label="Show archived" initial />
          </Labeled>
          <Labeled label="icon, pressed">
            <Toggle label="Show archived" icon={Archive} initial />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Intents",
      note: "Use ghost in a header or a dense toolbar, and secondary elsewhere.",
      render: () => (
        <Column>
          <Row>
            <Labeled label="secondary">
              <Toggle label="Wrap long lines" icon={WrapText} initial={false} />
            </Labeled>
            <Labeled label="secondary pressed">
              <Toggle label="Wrap long lines" icon={WrapText} initial />
            </Labeled>
          </Row>
          <Row>
            <Labeled label="ghost">
              <Toggle intent="ghost" label="Wrap long lines" icon={WrapText} initial={false} />
            </Labeled>
            <Labeled label="ghost pressed">
              <Toggle intent="ghost" label="Wrap long lines" icon={WrapText} initial />
            </Labeled>
          </Row>
        </Column>
      ),
    },
    {
      title: "Icon only",
      note: "Use iconOnly only for an icon that people know. The label becomes the accessible name.",
      render: () => (
        <Row>
          <Labeled label="secondary">
            <Toggle iconOnly label="Pin work order" icon={Pin} initial={false} />
          </Labeled>
          <Labeled label="secondary pressed">
            <Toggle iconOnly label="Pin work order" icon={Pin} initial />
          </Labeled>
          <Labeled label="ghost pressed">
            <Toggle iconOnly intent="ghost" label="Notify the customer" icon={Bell} initial />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Disabled and compact",
      render: () => (
        <Column>
          <Row>
            <Labeled label="isDisabled">
              <Toggle label="Show archived" isDisabled initial={false} />
            </Labeled>
            <Labeled label="isDisabled pressed">
              <Toggle label="Show archived" isDisabled initial />
            </Labeled>
          </Row>
          <Labeled label="sm row">
            <ControlSizeProvider size="sm">
              <Row>
                <Toggle intent="ghost" label="Show archived" icon={Archive} initial />
                <Button>Export</Button>
              </Row>
            </ControlSizeProvider>
          </Labeled>
        </Column>
      ),
    },
  ],
});
