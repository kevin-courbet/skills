import * as stylex from "@stylexjs/stylex";
import { Mail } from "lucide-react";
import { useState } from "react";
import { CopyButton } from "@/components/primitives/copy-button";
import { Spinner } from "@/components/primitives/feedback";
import { Kbd } from "@/components/primitives/layout";
import { TextField } from "@/components/primitives/text-field";
import { Column, defineSection, Labeled } from "../../specimen";

const workNotes =
  "Customer reports a squeak from the bottom bracket under load. Found a worn cassette and a stretched chain at 0.75. Replaced both and adjusted the rear derailleur. The front brake pads have about 1 mm left: offered a replacement, customer will decide at pickup.";

function SerialNumber() {
  const [serial, setSerial] = useState("");
  return (
    <TextField
      label="Serial number"
      description="On the label under the bottom bracket."
      width="md"
      placeholder="e.g. WTU204C1093"
      value={serial}
      onChange={setSerial}
    />
  );
}

function RequiredCustomer() {
  const [name, setName] = useState("");
  return (
    <TextField
      label="Customer name"
      width="lg"
      isRequired
      value={name}
      onChange={setName}
      errorMessage={name.trim() === "" ? "Enter the name of the customer." : undefined}
    />
  );
}

export default defineSection({
  component: "TextField",
  specimens: [
    {
      title: "Widths",
      note: "Give every field a width from the length of its answer, not from the space in the layout.",
      render: () => (
        <Column width="40rem">
          <Labeled label="xs">
            <TextField label="Storage bin" width="xs" defaultValue="B-14" />
          </Labeled>
          <Labeled label="sm">
            <TextField label="Phone" width="sm" type="tel" defaultValue="+33 6 12 34 56 78" />
          </Labeled>
          <Labeled label="md">
            <TextField label="Bike model" width="md" defaultValue="Trek Domane SL 5" />
          </Labeled>
          <Labeled label="lg">
            <TextField label="Customer name" width="lg" defaultValue="Camille Laurent" />
          </Labeled>
          <Labeled label="full">
            <div {...stylex.props(styles.fill)}>
              <TextField label="Street address" defaultValue="18 rue des Cyclistes, 69007 Lyon" />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Description and placeholder",
      note: "The placeholder is an example answer. It never replaces the label or the description.",
      render: () => (
        <Column width="24rem">
          <SerialNumber />
        </Column>
      ),
    },
    {
      title: "Prefix and suffix",
      render: () => (
        <Column width="28rem">
          <Labeled label="prefix icon">
            <TextField
              label="Customer email"
              type="email"
              width="lg"
              prefix={<Mail />}
              defaultValue="camille.laurent@example.com"
            />
          </Labeled>
          <Labeled label="prefix text">
            <TextField
              label="Booking page"
              width="lg"
              prefix="https://"
              defaultValue="book.spokeandchain.example"
            />
          </Labeled>
          <Labeled label="suffix domain">
            <TextField
              label="Mechanic email"
              width="md"
              suffix="@spokeandchain.example"
              defaultValue="lea.martin"
            />
          </Labeled>
          <Labeled label="suffix Kbd">
            <TextField
              label="Quick note"
              width="lg"
              suffix={<Kbd>Enter</Kbd>}
              placeholder="e.g. Called the customer"
            />
          </Labeled>
          <Labeled label="suffix Spinner, pending">
            <TextField
              label="Frame number"
              width="md"
              description="Checking the stolen bike register."
              suffix={<Spinner size="sm" label="Checking frame number" />}
              defaultValue="WTU204C1093"
            />
          </Labeled>
          <Labeled label="suffix icon button">
            <TextField
              label="Tracking link"
              width="lg"
              isReadOnly
              suffix={
                <CopyButton
                  value="https://track.spokeandchain.example/WO-1042"
                  label="Copy tracking link"
                />
              }
              defaultValue="https://track.spokeandchain.example/WO-1042"
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Multiline",
      note: "The text area grows with its text, for answers of more than one line.",
      render: () => (
        <Column width="28rem">
          <TextField label="Work notes" multiline defaultValue={workNotes} />
          <TextField
            label="Note for the customer"
            multiline
            isOptional
            placeholder="e.g. Your bike is ready, the chain was replaced."
          />
        </Column>
      ),
    },
    {
      title: "Required, invalid, optional, disabled, and read-only",
      render: () => (
        <Column width="24rem">
          <RequiredCustomer />
          <TextField label="Company" width="lg" isOptional />
          <TextField label="Invoice number" width="md" isDisabled defaultValue="INV-0318" />
          <TextField label="Created by" width="lg" isReadOnly defaultValue="Marco Rossi" />
        </Column>
      ),
    },
    {
      title: "Long text",
      note: "A long value ends with an ellipsis and scrolls when the field has focus. A long label, description, and error message wrap.",
      render: () => (
        <Column width="18rem">
          <TextField
            label="Reason the customer gives for bringing the bike back after the last service"
            description="Write what the customer says, not the diagnosis of the mechanic."
            defaultValue="The gears skip on the two smallest cogs when I ride up the hill to the station every morning"
            errorMessage="Keep the reason under 80 characters, so that it fits on the work order label."
          />
        </Column>
      ),
    },
  ],
});

// Labeled sizes its child to the content, so a full-width field needs a stretched wrapper.
const styles = stylex.create({
  fill: { alignSelf: "stretch", minWidth: 0 },
});
