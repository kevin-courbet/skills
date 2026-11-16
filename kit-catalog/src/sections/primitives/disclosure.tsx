import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/primitives/code-block";
import { Accordion, Disclosure } from "@/components/primitives/disclosure";
import { DescriptionList } from "@/components/primitives/layout";
import { formatCurrency } from "@/lib/locale";
import { color, font } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled } from "../../specimen";

const webhookPayload = `{
  "event": "work_order.completed",
  "workOrderId": "WO-1042",
  "mechanic": "Karim Haddad",
  "laborMinutes": 75,
  "total": 184.5
}`;

/**
 * `Labeled` aligns its content at the start, so a Disclosure shrinks to its content and its title
 * wraps. This wrapper gives the Disclosure the width of the specimen column again.
 */
function FullWidth({ children }: { readonly children: ReactNode }) {
  return <div {...stylex.props(styles.fullWidth)}>{children}</div>;
}

export default defineSection({
  component: "Disclosure",
  specimens: [
    {
      title: "Closed and open",
      note: "Use one Disclosure for a section that most people do not need, such as a raw payload.",
      render: () => (
        <Column width="32rem">
          <Labeled label="closed, with a hint">
            <FullWidth>
              <Disclosure title="Pricing overrides" hint="2 rules">
                <DescriptionList
                  items={[
                    { term: "Club members", detail: "10% off labor" },
                    {
                      term: "Fleet accounts",
                      detail: `${formatCurrency(45)} flat rate per service`,
                    },
                  ]}
                />
              </Disclosure>
            </FullWidth>
          </Labeled>
          <Labeled label="defaultExpanded">
            <FullWidth>
              <Disclosure title="Raw payload" defaultExpanded>
                <CodeBlock language="json" code={webhookPayload} label="Raw payload" />
              </Disclosure>
            </FullWidth>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Accordion",
      note: "One row opens at a time.",
      render: () => (
        <Column width="32rem">
          <Accordion defaultExpandedKeys={["brakes"]}>
            <Disclosure id="brakes" title="Brakes" hint="3 checks">
              <p {...stylex.props(styles.text)}>
                Check the pad wear, bleed the hydraulic lines, and true the rotors.
              </p>
            </Disclosure>
            <Disclosure id="drivetrain" title="Drivetrain" hint="4 checks">
              <p {...stylex.props(styles.text)}>
                Measure the chain stretch, clean the cassette, and index the rear derailleur.
              </p>
            </Disclosure>
            <Disclosure id="wheels" title="Wheels" hint="2 checks">
              <p {...stylex.props(styles.text)}>Check the spoke tension and the hub bearings.</p>
            </Disclosure>
          </Accordion>
        </Column>
      ),
    },
    {
      title: "Accordion with several rows open",
      note: "allowsMultipleExpanded lets people open more than one row.",
      render: () => (
        <Column width="32rem">
          <Accordion allowsMultipleExpanded defaultExpandedKeys={["intake", "test-ride"]}>
            <Disclosure id="intake" title="Intake notes">
              <p {...stylex.props(styles.text)}>
                The customer hears a click from the bottom bracket when climbing.
              </p>
            </Disclosure>
            <Disclosure id="diagnosis" title="Diagnosis">
              <p {...stylex.props(styles.text)}>The bottom bracket bearings are worn.</p>
            </Disclosure>
            <Disclosure id="test-ride" title="Test ride">
              <p {...stylex.props(styles.text)}>
                No click after the bearing swap. Ready for pickup.
              </p>
            </Disclosure>
          </Accordion>
        </Column>
      ),
    },
    {
      title: "Disabled",
      render: () => (
        <Column width="32rem">
          <Accordion>
            <Disclosure id="estimate" title="Estimate" hint="Approved">
              <p {...stylex.props(styles.text)}>Parts and labor come to {formatCurrency(184.5)}.</p>
            </Disclosure>
            <Disclosure id="invoice" title="Invoice" hint="After the test ride" isDisabled>
              <p {...stylex.props(styles.text)}>The invoice is not ready.</p>
            </Disclosure>
          </Accordion>
        </Column>
      ),
    },
    {
      title: "Long title",
      render: () => (
        <Column width="18rem">
          <Disclosure
            title="Warranty claim details for the Specialized Turbo Vado motor"
            hint="Pending"
          >
            <p {...stylex.props(styles.text)}>
              The claim waits for the photo of the serial number.
            </p>
          </Disclosure>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  fullWidth: { alignSelf: "stretch", minWidth: 0 },
  text: { margin: 0, fontSize: font.md, lineHeight: font.leadingNormal, color: color.text },
});
