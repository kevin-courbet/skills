import { useState } from "react";
import { SettingRow, SettingsCard } from "@/components/primitives/layout";
import { Switch } from "@/components/primitives/switch";
import { Column, defineSection, Labeled, Row } from "../../specimen";

function ShopNotifications() {
  const [readyText, setReadyText] = useState(true);
  const [partsEmail, setPartsEmail] = useState(false);
  return (
    <SettingsCard
      title="Customer notifications"
      description="Messages that the shop sends for each work order."
    >
      <SettingRow
        label="Ready for pickup"
        description="Sends a text message when a mechanic closes the work order."
      >
        <Switch aria-label="Ready for pickup" isSelected={readyText} onChange={setReadyText} />
      </SettingRow>
      <SettingRow
        label="Parts delay"
        description="Sends an email when an ordered part arrives late."
      >
        <Switch aria-label="Parts delay" isSelected={partsEmail} onChange={setPartsEmail} />
      </SettingRow>
    </SettingsCard>
  );
}

export default defineSection({
  component: "Switch",
  specimens: [
    {
      title: "Labeled switch",
      note: "Use a switch for a setting that applies at once, not for an answer that a form submits.",
      render: () => (
        <Row align="start">
          <Labeled label="defaultSelected">
            <Switch defaultSelected>Online booking</Switch>
          </Labeled>
          <Labeled label="not selected">
            <Switch>Show stock levels to customers</Switch>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "In a SettingRow",
      note: "The SettingRow names the setting, so the switch takes an aria-label. The change applies when onChange runs.",
      render: () => (
        <Column width="36rem">
          <ShopNotifications />
        </Column>
      ),
    },
    {
      title: "Disabled and read-only",
      render: () => (
        <Row align="start">
          <Labeled label="isDisabled">
            <Switch isDisabled>Card payments</Switch>
          </Labeled>
          <Labeled label="isDisabled selected">
            <Switch isDisabled defaultSelected>
              Card payments
            </Switch>
          </Labeled>
          <Labeled label="isReadOnly selected">
            <Switch isReadOnly defaultSelected>
              Card payments
            </Switch>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Long label",
      render: () => (
        <Column width="18rem">
          <Switch defaultSelected>
            Add a free safety check to each work order for a bike with no service in the last twelve
            months
          </Switch>
        </Column>
      ),
    },
  ],
});
