import * as stylex from "@stylexjs/stylex";
import { Button } from "@/components/primitives/button";
import { ScrollShadow } from "@/components/primitives/scroll-shadow";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled } from "../../specimen";

const mechanicNotes: ReadonlyArray<{ readonly id: string; readonly text: string }> = [
  { id: "n1", text: "Checked in a Cannondale Topstone 2 with a loud creak from the drivetrain." },
  {
    id: "n2",
    text: "Chain stretch measured 0.75%. The cassette shows wear on the three smallest cogs.",
  },
  {
    id: "n3",
    text: "The rear derailleur hanger is bent about 4 mm. Straightened it with the alignment gauge.",
  },
  { id: "n4", text: "Front brake pads are at 1.2 mm. The customer approved new pads by phone." },
  {
    id: "n5",
    text: "Bottom bracket turns smoothly. The creak came from the chainring bolts, now torqued to 8 Nm.",
  },
  { id: "n6", text: "Tubeless sealant in both tires had dried. Refilled with 60 ml in each tire." },
  { id: "n7", text: "Test ride of 2 km: shifting is clean in all gears and the creak is gone." },
];

const parts: ReadonlyArray<{
  readonly sku: string;
  readonly name: string;
  readonly stock: string;
}> = [
  { sku: "CN-HG601", name: "Shimano HG601 chain", stock: "14 in stock" },
  { sku: "CS-R7101", name: "Shimano 105 cassette 11-34", stock: "3 in stock" },
  { sku: "BP-L05A", name: "Resin disc brake pads", stock: "22 in stock" },
  { sku: "TB-700C", name: "Inner tube 700x32c", stock: "41 in stock" },
  { sku: "SL-ORG", name: "Tubeless sealant 500 ml", stock: "6 in stock" },
  { sku: "CB-SHFT", name: "Shift cable kit", stock: "Backordered" },
];

const bikeTypes = [
  "All bikes",
  "Road bikes",
  "Gravel bikes",
  "Mountain bikes",
  "City bikes",
  "Cargo bikes",
  "E-bikes",
  "Kids' bikes",
  "Tandems",
  "Folding bikes",
];

export default defineSection({
  component: "ScrollShadow",
  specimens: [
    {
      title: "Vertical text with a label",
      note: "Give a label when no child takes focus, so keyboard users can scroll the area.",
      render: () => (
        <Column width="24rem">
          <ScrollShadow label="Mechanic notes" style={styles.notes}>
            <div {...stylex.props(styles.padded)}>
              {mechanicNotes.map((note) => (
                <p key={note.id} {...stylex.props(styles.paragraph)}>
                  {note.text}
                </p>
              ))}
            </div>
          </ScrollShadow>
        </Column>
      ),
    },
    {
      title: "Horizontal row of cards",
      render: () => (
        <Column width="28rem">
          <ScrollShadow orientation="horizontal" label="Parts for this repair">
            <div {...stylex.props(styles.cardRow)}>
              {parts.map((part) => (
                <div key={part.sku} {...stylex.props(styles.card)}>
                  <span {...stylex.props(styles.cardTitle)}>{part.name}</span>
                  <span {...stylex.props(styles.cardMeta)}>{part.sku}</span>
                  <span {...stylex.props(styles.cardMeta)}>{part.stock}</span>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </Column>
      ),
    },
    {
      title: "Hidden scrollbar with focusable children",
      note: "Use hideScrollbar only when each child takes focus, so that the focus brings a hidden child into view.",
      render: () => (
        <Column width="20rem">
          <ScrollShadow orientation="horizontal" hideScrollbar>
            <div {...stylex.props(styles.buttonRow)}>
              {bikeTypes.map((type) => (
                <Button key={type} size="sm">
                  {type}
                </Button>
              ))}
            </div>
          </ScrollShadow>
        </Column>
      ),
    },
    {
      title: "Content that fits",
      note: "No edge fades and the area adds no tab stop while nothing is out of view.",
      render: () => (
        <Column width="24rem">
          <Labeled label="vertical, no overflow">
            <ScrollShadow label="Pick-up instructions" style={styles.notes}>
              <div {...stylex.props(styles.padded)}>
                <p {...stylex.props(styles.paragraph)}>
                  Pick-up from 9:00 to 18:00 at the back door on Canal Street.
                </p>
              </div>
            </ScrollShadow>
          </Labeled>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  notes: {
    maxHeight: "10rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  padded: { display: "flex", flexDirection: "column", gap: space.sm, padding: space.md },
  paragraph: { margin: 0, fontSize: font.md, color: color.text },
  cardRow: { display: "flex", gap: space.md, padding: space.xs },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    flexShrink: 0,
    width: "11rem",
    padding: space.md,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  cardTitle: { fontSize: font.md, fontWeight: font.medium, color: color.text },
  cardMeta: { fontSize: font.sm, color: color.textMuted },
  buttonRow: { display: "flex", gap: space.sm, padding: space.xs, width: "max-content" },
});
