import { Pause } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/primitives/alert";
import { Button } from "@/components/primitives/button";
import { Code } from "@/components/primitives/layout";
import { TextField } from "@/components/primitives/text-field";
import { Column, defineSection, Row } from "../../specimen";

function DismissibleAlert() {
  const [isShown, setIsShown] = useState(true);
  if (!isShown) {
    return (
      <Button size="sm" onPress={() => setIsShown(true)}>
        Show the notice again
      </Button>
    );
  }
  return (
    <Alert
      intent="info"
      title="The shop closes at 14:00 on Saturday 21 November"
      onDismiss={() => setIsShown(false)}
    >
      Book pickups for that day before noon.
    </Alert>
  );
}

function SubmitResult() {
  const [step, setStep] = useState<"loaded" | "form" | "submitted">("loaded");
  const [order, setOrder] = useState({ number: 1048, customer: "Lena Fischer" });
  if (step === "form") {
    return (
      <form
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const customer = new FormData(event.currentTarget).get("customer");
          setOrder({ number: order.number + 1, customer: String(customer) });
          setStep("submitted");
        }}
      >
        <Column>
          <TextField label="Customer" name="customer" isRequired defaultValue="Margaux Lefèvre" />
          <Row>
            <Button intent="primary" type="submit">
              Open work order
            </Button>
          </Row>
        </Column>
      </form>
    );
  }
  return (
    <Alert
      intent="success"
      // The first alert renders with the page, and the docs say to announce only an alert that
      // appears after the page loaded.
      announce={step === "submitted" ? "status" : undefined}
      title={`Work order WO-${order.number} is open for ${order.customer}`}
      actions={<Button onPress={() => setStep("form")}>Create another work order</Button>}
    >
      Bruno Costa is the mechanic. The customer gets a text when the bike is ready.
    </Alert>
  );
}

export default defineSection({
  component: "Alert",
  specimens: [
    {
      title: "Intents",
      note: "Match the intent to the severity. Do not use danger for information.",
      render: () => (
        <Column width="40rem">
          <Alert intent="neutral" title="Lena Fischer prefers a call before extra work starts" />
          <Alert intent="info" title="Shimano parts ship from the new warehouse from Monday">
            Delivery estimates on open work orders include the extra day.
          </Alert>
          <Alert intent="success" title="Invoice INV-2207 is paid">
            The receipt went to the customer by email.
          </Alert>
          <Alert intent="warning" title="Two brake pads are left in stock">
            Three work orders this week need brake pads.
          </Alert>
          <Alert intent="danger" title="The card terminal at the front desk is offline">
            Take payments at the back desk until the terminal is back.
          </Alert>
        </Column>
      ),
    },
    {
      title: "Result of a submit",
      note: 'After a successful submit, a success alert with announce="status" replaces the form. The title names the new record, and one action starts the next task.',
      render: () => (
        <Column width="40rem">
          <SubmitResult />
        </Column>
      ),
    },
    {
      title: "Custom icon for a held state",
      render: () => (
        <Column width="40rem">
          <Alert
            intent="warning"
            icon={Pause}
            title="Work order WO-1031 is on hold"
            actions={
              <>
                <Button>Order parts</Button>
                <Button intent="ghost">Resume</Button>
              </>
            }
          >
            The rear derailleur hanger is on back order until 24 November.
          </Alert>
        </Column>
      ),
    },
    {
      title: "Dismissible",
      note: "Add a close button only when the notice is safe to hide.",
      render: () => (
        <Column width="40rem">
          <DismissibleAlert />
        </Column>
      ),
    },
    {
      title: "Long text in a narrow frame",
      note: "The title and the text wrap, and the actions move under the text.",
      render: () => (
        <Column width="22rem">
          <Alert
            intent="danger"
            title={
              <>
                The price import of <Code>supplier-prices-2026-11.csv</Code> stopped at row 418
              </>
            }
            actions={
              <>
                <Button>Download the error report</Button>
                <Button intent="ghost">Try again</Button>
              </>
            }
          >
            The part number <Code>SH-BR-M8100-F</Code> has no price. Parts after this row keep their
            old prices until the import finishes.
          </Alert>
        </Column>
      ),
    },
  ],
});
