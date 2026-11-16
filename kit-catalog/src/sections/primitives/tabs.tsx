import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { DescriptionList } from "@/components/primitives/layout";
import { Tab, TabList, TabPanel, Tabs } from "@/components/primitives/tabs";
import { formatCurrency } from "@/lib/locale";
import { color, font } from "@/styles/tokens.stylex";
import { Column, defineSection } from "../../specimen";

type WorkOrderTab = "summary" | "parts" | "labor" | "history";

const workOrderTabs: ReadonlyArray<WorkOrderTab> = ["summary", "parts", "labor", "history"];

function isWorkOrderTab(key: string): key is WorkOrderTab {
  return workOrderTabs.some((tab) => tab === key);
}

function WorkOrderTabs() {
  const [tab, setTab] = useState<WorkOrderTab>("summary");
  return (
    <Column width="36rem">
      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => {
          const next = String(key);
          if (!isWorkOrderTab(next)) throw new Error(`Unknown work order tab "${next}".`);
          setTab(next);
        }}
      >
        <TabList aria-label="Work order WO-1042">
          <Tab id="summary">Summary</Tab>
          <Tab id="parts">Parts</Tab>
          <Tab id="labor">Labor</Tab>
          <Tab id="history">History</Tab>
        </TabList>
        <TabPanel id="summary">
          <DescriptionList
            items={[
              { term: "Customer", detail: "Amélie Durand" },
              { term: "Bike", detail: "Trek Domane SL 5" },
              { term: "Mechanic", detail: "Karim Haddad" },
            ]}
          />
        </TabPanel>
        <TabPanel id="parts">
          <p {...stylex.props(styles.text)}>
            Shimano B05S resin pads and Shimano mineral oil, {formatCurrency(42.9)}.
          </p>
        </TabPanel>
        <TabPanel id="labor">
          <p {...stylex.props(styles.text)}>Brake bleed, 75 minutes, {formatCurrency(90)}.</p>
        </TabPanel>
        <TabPanel id="history">
          <p {...stylex.props(styles.text)}>
            Two earlier visits: a tune-up in March and a flat repair in June.
          </p>
        </TabPanel>
      </Tabs>
    </Column>
  );
}

export default defineSection({
  component: "Tabs",
  specimens: [
    {
      title: "Sections of a work order",
      note: "Give each Tab and its TabPanel the same id. Keep the selected tab in a search param when people share the view.",
      render: () => <WorkOrderTabs />,
    },
    {
      title: "Disabled tab",
      render: () => (
        <Column width="36rem">
          <Tabs defaultSelectedKey="estimate" disabledKeys={["invoice"]}>
            <TabList aria-label="Billing">
              <Tab id="estimate">Estimate</Tab>
              <Tab id="payments">Payments</Tab>
              <Tab id="invoice">Invoice</Tab>
            </TabList>
            <TabPanel id="estimate">
              <p {...stylex.props(styles.text)}>
                The customer approved the estimate of {formatCurrency(132.9)}.
              </p>
            </TabPanel>
            <TabPanel id="payments">
              <p {...stylex.props(styles.text)}>A deposit of {formatCurrency(50)} is paid.</p>
            </TabPanel>
            <TabPanel id="invoice">
              <p {...stylex.props(styles.text)}>The invoice opens after the test ride.</p>
            </TabPanel>
          </Tabs>
        </Column>
      ),
    },
    {
      title: "Tab list wider than its frame",
      note: "The tab list scrolls sideways, and its edges fade.",
      render: () => (
        <Column width="20rem">
          <Tabs defaultSelectedKey="brakes">
            <TabList aria-label="Service checklist">
              <Tab id="brakes">Brakes</Tab>
              <Tab id="drivetrain">Drivetrain</Tab>
              <Tab id="wheels">Wheels</Tab>
              <Tab id="suspension">Suspension</Tab>
              <Tab id="cockpit">Cockpit</Tab>
              <Tab id="electrics">Electrics</Tab>
            </TabList>
            <TabPanel id="brakes">
              <p {...stylex.props(styles.text)}>Pads at 1.5 mm. Rotors true.</p>
            </TabPanel>
            <TabPanel id="drivetrain">
              <p {...stylex.props(styles.text)}>Chain stretch at 0.5%.</p>
            </TabPanel>
            <TabPanel id="wheels">
              <p {...stylex.props(styles.text)}>Spoke tension even.</p>
            </TabPanel>
            <TabPanel id="suspension">
              <p {...stylex.props(styles.text)}>Fork seals due for service.</p>
            </TabPanel>
            <TabPanel id="cockpit">
              <p {...stylex.props(styles.text)}>Bar tape worn on the left.</p>
            </TabPanel>
            <TabPanel id="electrics">
              <p {...stylex.props(styles.text)}>Battery health at 92%.</p>
            </TabPanel>
          </Tabs>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  text: { margin: 0, fontSize: font.md, lineHeight: font.leadingNormal, color: color.text },
});
