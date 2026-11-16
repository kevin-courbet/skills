import { useState } from "react";
import { TagGroup, type TagItem } from "@/components/primitives/tag-group";
import { Column, defineSection, Labeled } from "../../specimen";

const recipients: ReadonlyArray<TagItem<string>> = [
  { id: "amira", label: "Amira Benali" },
  { id: "tom", label: "Tom Becker" },
  { id: "front-desk", label: "Front desk" },
];

const orderLabels: ReadonlyArray<TagItem<string>> = [
  { id: "warranty", label: "Warranty claim", color: "blue" },
  { id: "rush", label: "Rush job", color: "red" },
  { id: "loaner", label: "Loaner bike out", color: "amber" },
  { id: "fleet", label: "Fleet customer", color: "teal" },
];

const replacedParts: ReadonlyArray<TagItem<string>> = [
  { id: "chain", label: "Chain, 11-speed" },
  { id: "pads-front", label: "Brake pads, front" },
  { id: "pads-rear", label: "Brake pads, rear" },
  { id: "tube", label: "Inner tube, 700x28c" },
  { id: "cable", label: "Shift cable" },
  { id: "tape", label: "Bar tape, black" },
  { id: "cassette", label: "Cassette, 11-32T" },
  { id: "bb", label: "Bottom bracket, BSA threaded" },
  { id: "valve", label: "Tubeless valve, 44 mm" },
];

function RemovableTags({
  label,
  initial,
  emptyLabel,
  description,
}: {
  readonly label: string;
  readonly initial: ReadonlyArray<TagItem<string>>;
  readonly emptyLabel: string;
  readonly description?: string;
}) {
  const [items, setItems] = useState(initial);
  return (
    <TagGroup
      label={label}
      description={description}
      items={items}
      emptyLabel={emptyLabel}
      onRemove={(ids) => setItems((current) => current.filter((item) => !ids.includes(item.id)))}
    />
  );
}

export default defineSection({
  component: "TagGroup",
  specimens: [
    {
      title: "Read-only tags",
      note: "Give each tag one short value. For one status, use a Badge.",
      render: () => <TagGroup label="Invoice recipients" items={recipients} />,
    },
    {
      title: "Removable tags",
      note: 'Each tag gets a remove button with the name "Remove <label>". Backspace and Delete remove the focused tag.',
      render: () => (
        <RemovableTags
          label="Recipients"
          description="They get the invoice by email when the order closes."
          initial={recipients}
          emptyLabel="No recipients"
        />
      ),
    },
    {
      title: "Color tags",
      note: "A tag with color shows a ColorSwatch, for a category such as an order label.",
      render: () => (
        <Column>
          <Labeled label="read-only">
            <TagGroup label="Order labels" items={orderLabels} />
          </Labeled>
          <Labeled label="onRemove">
            <RemovableTags label="Order labels" initial={orderLabels} emptyLabel="No labels" />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Empty and hidden label",
      render: () => (
        <Column>
          <Labeled label="emptyLabel">
            <TagGroup label="Order labels" items={[]} emptyLabel="No labels" />
          </Labeled>
          <Labeled label="hideLabel">
            <TagGroup label="Invoice recipients" hideLabel items={recipients} />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Many tags",
      note: "The tags wrap to the next line.",
      render: () => (
        <Column width="22rem">
          <TagGroup label="Replaced parts" items={replacedParts} />
        </Column>
      ),
    },
  ],
});
