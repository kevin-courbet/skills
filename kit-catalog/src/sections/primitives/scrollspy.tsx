import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { Scrollspy, type ScrollspyItem } from "@/components/primitives/scrollspy";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { defineSection } from "../../specimen";

type WorkOrderPart = { readonly key: string; readonly label: string; readonly body: string };

const workOrderParts: ReadonlyArray<WorkOrderPart> = [
  {
    key: "customer",
    label: "Customer",
    body: "Jonas Weber, customer since 2023. Prefers a text message when the bike is ready.",
  },
  {
    key: "bike",
    label: "Bike",
    body: "Trek Domane AL 2, size 56, frame number WTU123G4567H. Last service in March.",
  },
  {
    key: "diagnosis",
    label: "Diagnosis",
    body: "Chain stretch at 0.75%. The cassette is worn and the rear derailleur hanger is bent.",
  },
  {
    key: "parts",
    label: "Parts",
    body: "Shimano HG601 chain, Shimano 105 cassette 11-34, derailleur hanger for Trek ALR.",
  },
  {
    key: "labor",
    label: "Labor",
    body: "Drivetrain replacement 45 minutes, hanger alignment 15 minutes, test ride 10 minutes.",
  },
  {
    key: "invoice",
    label: "Invoice",
    body: "Invoice INV-2041 for 184.50 euros, sent by email. Payment is due at pick-up.",
  },
];

const manyParts: ReadonlyArray<WorkOrderPart> = [
  ...workOrderParts,
  {
    key: "payment",
    label: "Payment",
    body: "Paid by card at the counter. The receipt is attached to the invoice.",
  },
  {
    key: "warranty",
    label: "Warranty",
    body: "Parts carry a 2-year warranty. Labor carries a 30-day warranty.",
  },
  {
    key: "history",
    label: "Service history",
    body: "Four earlier work orders since 2023, all closed.",
  },
];

/** Gives each section an id that is unique on the page, because each theme column renders the specimen. */
function useSectionItems(sections: ReadonlyArray<WorkOrderPart>): ReadonlyArray<ScrollspyItem> {
  const base = useId();
  return sections.map((section) => ({ id: `${base}-${section.key}`, label: section.label }));
}

function SectionList({
  sections,
  items,
}: {
  readonly sections: ReadonlyArray<WorkOrderPart>;
  readonly items: ReadonlyArray<ScrollspyItem>;
}) {
  return sections.map((section, index) => (
    <section key={section.key} id={items[index]?.id} {...stylex.props(styles.section)}>
      <h3 {...stylex.props(styles.heading)}>{section.label}</h3>
      <p {...stylex.props(styles.body)}>{section.body}</p>
    </section>
  ));
}

function VerticalSpecimen() {
  const items = useSectionItems(workOrderParts);
  return (
    <div {...stylex.props(styles.split)}>
      <Scrollspy label="On this page" items={items} style={styles.side} />
      <div {...stylex.props(styles.scroller)}>
        <SectionList sections={workOrderParts} items={items} />
      </div>
    </div>
  );
}

function HorizontalSpecimen() {
  const items = useSectionItems(manyParts);
  return (
    <div {...stylex.props(styles.stack)}>
      <Scrollspy label="On this page" orientation="horizontal" items={items} />
      <div {...stylex.props(styles.scroller)}>
        <SectionList sections={manyParts} items={items} />
      </div>
    </div>
  );
}

// The sticky bar is 3rem high, so the offset keeps each heading clear of it.
const stickyBarHeight = 48;

function StickySpecimen() {
  const items = useSectionItems(workOrderParts);
  return (
    <div {...stylex.props(styles.scroller, styles.stickyScroller)}>
      <Scrollspy
        label="On this page"
        orientation="horizontal"
        items={items}
        offset={stickyBarHeight}
        style={styles.stickyBar}
      />
      <div {...stylex.props(styles.stickyContent)}>
        <SectionList sections={workOrderParts} items={items} />
      </div>
    </div>
  );
}

export default defineSection({
  component: "Scrollspy",
  specimens: [
    {
      title: "Vertical in a side column",
      note: "Give each section the id of its item and a heading with the same words as the label.",
      render: () => <VerticalSpecimen />,
    },
    {
      title: "Horizontal bar above the sections",
      note: "A list that is wider than its frame scrolls sideways, and its edges fade.",
      render: () => <HorizontalSpecimen />,
    },
    {
      title: "Sticky bar with an offset",
      note: "Set offset to the height of a sticky bar above the sections.",
      render: () => <StickySpecimen />,
    },
  ],
});

const styles = stylex.create({
  split: {
    display: "grid",
    gridTemplateColumns: "9rem minmax(0, 1fr)",
    gap: space.lg,
    width: "100%",
    maxWidth: "36rem",
  },
  side: { alignSelf: "start" },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    width: "100%",
    maxWidth: "28rem",
    minWidth: 0,
  },
  scroller: {
    height: "14rem",
    overflowY: "auto",
    paddingInline: space.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  stickyScroller: { width: "100%", maxWidth: "28rem", paddingInline: 0 },
  stickyBar: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    height: "3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingInline: space.sm,
    backgroundColor: color.raised,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  stickyContent: { paddingInline: space.md },
  section: { paddingBlock: space.md, outlineStyle: "none" },
  heading: { margin: 0, fontSize: font.lg, fontWeight: font.semibold, color: color.text },
  body: {
    marginBlock: space.xs,
    marginInline: 0,
    fontSize: font.md,
    color: color.textMuted,
    minHeight: "5rem",
  },
});
