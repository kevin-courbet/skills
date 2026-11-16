import * as stylex from "@stylexjs/stylex";
import { Ellipsis, NotebookPen, Printer } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/primitives/button";
import { Dialog, type DialogSize, DialogTrigger } from "@/components/primitives/dialog";
import { Code } from "@/components/primitives/layout";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/components/primitives/menu";
import { TextField } from "@/components/primitives/text-field";
import { space } from "@/styles/tokens.stylex";
import { defineSection, Labeled, Row } from "../../specimen";

const dialogSizes: ReadonlyArray<DialogSize> = ["sm", "md", "lg"];

const checklist: ReadonlyArray<string> = [
  "Check the tire pressure and the tread on both wheels.",
  "Check the brake pads and adjust the brake cable tension.",
  "Clean the chain, the cassette, and the chainrings, then lubricate the chain.",
  "Measure the chain wear with a gauge. Replace the chain at 0.5% wear.",
  "Index the rear derailleur and check the hanger alignment.",
  "True both wheels and check the spoke tension.",
  "Check the headset for play and the stem bolts for torque.",
  "Check the bottom bracket for play and noise.",
  "Grease the seat post and check the saddle rails.",
  "Check the lights, the reflectors, and the bell.",
  "Check the frame and the fork for cracks and dents.",
  "Check the brake rotors for wear and true them if they rub.",
  "Bleed the hydraulic brakes if the levers feel soft.",
  "Replace the brake and shifter cables if they are frayed or corroded.",
  "Check the front derailleur height and its limit screws.",
  "Check the crank bolts and the chainring bolts for torque.",
  "Check the pedals for play and grease the pedal threads.",
  "Service the hubs and replace worn bearings.",
  "Check the rim tape and the valves of both wheels.",
  "Check the handlebar tape or the grips and replace them if they are worn.",
  "Check the quick releases or the thru axles for correct closing force.",
  "Clean the frame and polish the painted parts.",
  "Do a test ride of 500 m and record the result on the work order.",
];

function CreateWorkOrderDialog() {
  const formId = useId();
  return (
    <DialogTrigger>
      <Button intent="primary">Create work order</Button>
      <Dialog
        title="Create work order"
        description="The work order goes to the queue of the next free mechanic."
        actions={(close) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button intent="primary" type="submit" form={formId}>
              Create work order
            </Button>
          </>
        )}
      >
        {(close) => (
          <form
            id={formId}
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              close();
            }}
            {...stylex.props(styles.form)}
          >
            <TextField label="Customer" name="customer" isRequired defaultValue="Margaux Lefèvre" />
            <TextField
              label="Bike"
              name="bike"
              isRequired
              placeholder="e.g. Trek Domane AL 2, blue"
            />
            <TextField
              label="Problem"
              name="problem"
              multiline
              description="What the customer reports, in their words."
            />
          </form>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

function ControlledFromMenu() {
  const [isNotesOpen, setNotesOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <MenuTrigger>
        <Button intent="ghost" iconOnly icon={Ellipsis} aria-label="Work order actions" />
        <Menu
          onAction={(id) => {
            if (id === "notes") setNotesOpen(true);
          }}
        >
          <MenuItem id="notes" icon={NotebookPen}>
            Edit mechanic notes
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="print" icon={Printer}>
            Print work order
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <Dialog
        isOpen={isNotesOpen}
        onOpenChange={setNotesOpen}
        title="Edit mechanic notes"
        description="WO-1042, Trek Domane AL 2"
        actions={(close) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <Button intent="primary" type="submit" form={formId}>
              Save notes
            </Button>
          </>
        )}
      >
        <form
          id={formId}
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setNotesOpen(false);
          }}
        >
          <TextField
            label="Notes"
            name="notes"
            multiline
            defaultValue="Rear hub bearings are worn. Customer approved the replacement by phone."
          />
        </form>
      </Dialog>
    </>
  );
}

export default defineSection({
  component: "Dialog",
  specimens: [
    {
      title: "Create form",
      note: "The submit button in actions takes type submit and the form id, so Enter in a field also submits.",
      render: () => (
        <Row>
          <CreateWorkOrderDialog />
        </Row>
      ),
    },
    {
      title: "Sizes",
      note: "Maximum width: sm 24rem, md 32rem, lg 44rem.",
      render: () => (
        <Row>
          {dialogSizes.map((size) => (
            <Labeled key={size} label={size}>
              <DialogTrigger>
                <Button>Open {size} dialog</Button>
                <Dialog
                  size={size}
                  title="Reassign work order"
                  description="Lucas Moreau gets WO-1042 and its 2 reserved parts."
                  actions={(close) => (
                    <>
                      <Button onPress={close}>Cancel</Button>
                      <Button intent="primary" onPress={close}>
                        Reassign
                      </Button>
                    </>
                  )}
                >
                  <p {...stylex.props(styles.paragraph)}>
                    Inès Garnier keeps her other 4 work orders. The customer sees the new mechanic
                    on the tracking page.
                  </p>
                </Dialog>
              </DialogTrigger>
            </Labeled>
          ))}
        </Row>
      ),
    },
    {
      title: "Description with inline code",
      render: () => (
        <Row>
          <DialogTrigger>
            <Button>Connect the parts supplier</Button>
            <Dialog
              title="Connect the parts supplier"
              description={
                <>
                  Paste the API key from the supplier portal. It starts with <Code>sk_live_</Code>.
                </>
              }
              actions={(close) => (
                <>
                  <Button onPress={close}>Cancel</Button>
                  <Button intent="primary" onPress={close}>
                    Connect
                  </Button>
                </>
              )}
            >
              <TextField label="API key" name="apiKey" isRequired />
            </Dialog>
          </DialogTrigger>
        </Row>
      ),
    },
    {
      title: "Long body",
      note: "The body scrolls between the header and the footer, and its edges fade while content is out of view.",
      render: () => (
        <Row>
          <DialogTrigger>
            <Button>View service checklist</Button>
            <Dialog
              title="Full service checklist"
              actions={(close) => (
                <Button intent="primary" onPress={close}>
                  Done
                </Button>
              )}
            >
              <ol {...stylex.props(styles.steps)}>
                {checklist.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Dialog>
          </DialogTrigger>
        </Row>
      ),
    },
    {
      title: "Not dismissable, and controlled",
      note: "isDismissable false keeps the dialog open on a backdrop click. A menu item opens a controlled dialog with isOpen.",
      render: () => (
        <Row>
          <Labeled label="isDismissable false">
            <DialogTrigger>
              <Button>Record a payment</Button>
              <Dialog
                isDismissable={false}
                title="Record a payment"
                description="INV-2291, €184.50 due"
                actions={(close) => (
                  <>
                    <Button onPress={close}>Cancel</Button>
                    <Button intent="primary" onPress={close}>
                      Record payment
                    </Button>
                  </>
                )}
              >
                <TextField
                  label="Amount"
                  name="amount"
                  width="sm"
                  defaultValue="184.50"
                  prefix="€"
                />
              </Dialog>
            </DialogTrigger>
          </Labeled>
          <Labeled label="isOpen from a menu item">
            <ControlledFromMenu />
          </Labeled>
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  form: { display: "flex", flexDirection: "column", gap: space.lg },
  paragraph: { margin: 0 },
  steps: { margin: 0, paddingInlineStart: space.lg, lineHeight: 1.8 },
});
