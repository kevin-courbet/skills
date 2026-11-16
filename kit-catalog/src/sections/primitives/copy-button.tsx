import * as stylex from "@stylexjs/stylex";
import { CopyButton } from "@/components/primitives/copy-button";
import { Code, DescriptionList } from "@/components/primitives/layout";
import { TextField } from "@/components/primitives/text-field";
import { space } from "@/styles/tokens.stylex";
import { Column, defineSection } from "../../specimen";

const trackingUrl = "https://track.example.com/wo/WO-1042";
const paymentLink = "https://pay.example.com/invoices/INV-2291?token=7f3c9a12e4b8";
const customerEmail = "margaux.lefevre@example.com";

export default defineSection({
  component: "CopyButton",
  specimens: [
    {
      title: "Next to a value",
      note: "A check mark confirms the copy for 1.5 seconds, so a copy needs no success toast.",
      render: () => (
        <span {...stylex.props(styles.inline)}>
          <Code>{trackingUrl}</Code>
          <CopyButton value={trackingUrl} label="Copy tracking link" />
        </span>
      ),
    },
    {
      title: "In a TextField suffix",
      render: () => (
        <Column width="28rem">
          <TextField
            label="Payment link"
            description="Send it to the customer with the invoice."
            isReadOnly
            value={paymentLink}
            suffix={<CopyButton value={paymentLink} label="Copy payment link" />}
          />
        </Column>
      ),
    },
    {
      title: "In a description list",
      render: () => (
        <Column width="28rem">
          <DescriptionList
            items={[
              { term: "Customer", detail: "Margaux Lefèvre" },
              {
                term: "Email",
                detail: (
                  <span {...stylex.props(styles.inline)}>
                    {customerEmail}
                    <CopyButton value={customerEmail} label="Copy customer email" />
                  </span>
                ),
              },
              {
                term: "Phone",
                detail: (
                  <span {...stylex.props(styles.inline)}>
                    +33 6 12 34 56 78
                    <CopyButton value="+33612345678" label="Copy customer phone number" />
                  </span>
                ),
              },
            ]}
          />
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  inline: { display: "inline-flex", alignItems: "center", gap: space.xs, minWidth: 0 },
});
