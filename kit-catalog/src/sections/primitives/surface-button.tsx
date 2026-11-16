import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { SurfaceButton } from "@/components/primitives/surface-button";
import { color, font, media, radius, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type Job = {
  readonly id: string;
  readonly title: string;
  readonly customer: string;
  readonly mechanic: string;
};

const jobs: ReadonlyArray<Job> = [
  {
    id: "WO-1042",
    title: "Brake bleed and pad swap",
    customer: "Amélie Durand",
    mechanic: "Karim",
  },
  { id: "WO-1043", title: "Hub service, rear wheel", customer: "Lucas Moreau", mechanic: "Sofia" },
];

type Bay = {
  readonly id: string;
  readonly name: string;
  readonly bike: string | null;
};

const bays: ReadonlyArray<Bay> = [
  { id: "bay-1", name: "Bay 1", bike: "Trek Domane SL 5" },
  { id: "bay-2", name: "Bay 2", bike: null },
  { id: "bay-3", name: "Bay 3", bike: "Brompton C Line" },
  { id: "bay-4", name: "Bay 4", bike: "Specialized Turbo Vado" },
];

function JobCards() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Column width="36rem">
      <Row align="start">
        {jobs.map((job) => (
          <div key={job.id} {...stylex.props(styles.card)}>
            <SurfaceButton style={styles.cardTitle} onClick={() => setOpened(job.id)}>
              {job.title}
            </SurfaceButton>
            <span {...stylex.props(styles.muted)}>
              {job.id} for {job.customer}
            </span>
            <Badge intent="info">Mechanic {job.mechanic}</Badge>
          </div>
        ))}
      </Row>
      <span {...stylex.props(styles.muted)} aria-live="polite">
        {opened === null ? "Press a card title." : `Opened ${opened}.`}
      </span>
    </Column>
  );
}

function BayMap() {
  const [selected, setSelected] = useState("bay-1");
  return (
    <div {...stylex.props(styles.bays)}>
      {bays.map((bay) => (
        <SurfaceButton
          key={bay.id}
          aria-label={`${bay.name}, ${bay.bike ?? "free"}`}
          aria-pressed={selected === bay.id}
          style={[
            styles.bay,
            bay.bike === null && styles.bayFree,
            selected === bay.id && styles.baySelected,
          ]}
          onClick={() => setSelected(bay.id)}
        >
          <span aria-hidden {...stylex.props(styles.bayName)}>
            {bay.name.replace("Bay ", "")}
          </span>
        </SurfaceButton>
      ))}
    </div>
  );
}

export default defineSection({
  component: "SurfaceButton",
  specimens: [
    {
      title: "Card title",
      note: "SurfaceButton has no look of its own. The style prop gives the whole look. The kit adds only the focus ring.",
      render: () => <JobCards />,
    },
    {
      title: "List row",
      render: () => (
        <Column width="28rem">
          <div {...stylex.props(styles.rows)}>
            {jobs.map((job) => (
              <SurfaceButton key={job.id} style={styles.row}>
                <span {...stylex.props(styles.rowTitle)}>{job.title}</span>
                <span {...stylex.props(styles.muted)}>{job.customer}</span>
              </SurfaceButton>
            ))}
          </div>
        </Column>
      ),
    },
    {
      title: "Object on a canvas",
      note: "A surface without visible text needs an aria-label, such as the bay and the bike in it.",
      render: () => <BayMap />,
    },
    {
      title: "Disabled",
      render: () => (
        <Row>
          <Labeled label="enabled">
            <SurfaceButton style={styles.row}>
              <span {...stylex.props(styles.rowTitle)}>Wheel truing</span>
              <span {...stylex.props(styles.muted)}>Hugo Petit</span>
            </SurfaceButton>
          </Labeled>
          <Labeled label="disabled">
            <SurfaceButton disabled style={[styles.row, styles.disabled]}>
              <span {...stylex.props(styles.rowTitle)}>Wheel truing</span>
              <span {...stylex.props(styles.muted)}>Hugo Petit</span>
            </SurfaceButton>
          </Labeled>
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.sm,
    width: "16rem",
    padding: space.lg,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  cardTitle: {
    fontSize: font.md,
    fontWeight: font.semibold,
    color: color.text,
    textAlign: "start",
    borderRadius: radius.sm,
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
  muted: { fontSize: font.sm, color: color.textMuted },
  rows: {
    display: "flex",
    flexDirection: "column",
    padding: space.xs,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  row: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
    width: "100%",
    minWidth: "14rem",
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderRadius: radius.md,
    backgroundColor: {
      default: "transparent",
      ":hover": { default: "transparent", [media.finePointer]: color.subtle },
      ":disabled": "transparent",
    },
  },
  rowTitle: { fontSize: font.md, fontWeight: font.medium, color: color.text },
  disabled: { opacity: 0.5 },
  bays: { display: "grid", gridTemplateColumns: "repeat(4, 4rem)", gap: space.sm },
  bay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "4rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.accentMuted,
  },
  bayFree: { backgroundColor: color.raised, borderStyle: "dashed" },
  baySelected: { borderColor: color.accent, borderWidth: "2px" },
  bayName: { fontSize: font.lg, fontWeight: font.semibold, color: color.text },
});
