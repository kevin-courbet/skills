import * as stylex from "@stylexjs/stylex";
import { categoryColor, categoryColors, type CategoryRole } from "@/styles/category";
import { color, font, radius, shadow, space } from "@/styles/tokens.stylex";
import type { Specimen } from "./specimen";

type Swatch = { readonly name: string; readonly value: string; readonly note?: string };

const surfaces: ReadonlyArray<Swatch> = [
  {
    name: "frame",
    value: color.frame,
    note: "The sidebar and the top bar. The darkest base surface.",
  },
  { name: "inset", value: color.inset, note: "A well below the panel, such as a code block." },
  { name: "page", value: color.page, note: "The content panel." },
  { name: "raised", value: color.raised, note: "A card on the panel." },
  { name: "subtle", value: color.subtle, note: "A quiet fill, such as a hovered row." },
  { name: "overlay", value: color.overlay, note: "A popover, a menu, or a dialog." },
  { name: "frameHover", value: color.frameHover },
  { name: "frameSelected", value: color.frameSelected },
  { name: "selected", value: color.selected },
];

const borders: ReadonlyArray<Swatch> = [
  { name: "borderSubtle", value: color.borderSubtle },
  { name: "border", value: color.border },
  { name: "borderStrong", value: color.borderStrong },
];

const texts: ReadonlyArray<Swatch> = [
  { name: "text", value: color.text },
  { name: "textMuted", value: color.textMuted },
  { name: "textFaint", value: color.textFaint },
  { name: "accentText", value: color.accentText },
];

const accents: ReadonlyArray<Swatch> = [
  { name: "accent", value: color.accent },
  { name: "accentHover", value: color.accentHover },
  { name: "accentStrong", value: color.accentStrong },
  { name: "accentMuted", value: color.accentMuted },
  { name: "accentBorder", value: color.accentBorder },
  { name: "focus", value: color.focus },
];

const statuses = [
  { name: "success", fill: color.success, muted: color.successMuted, border: color.successBorder },
  { name: "warning", fill: color.warning, muted: color.warningMuted, border: color.warningBorder },
  { name: "danger", fill: color.danger, muted: color.dangerMuted, border: color.dangerBorder },
  { name: "info", fill: color.info, muted: color.infoMuted, border: color.infoBorder },
] as const;

const categoryRoles: ReadonlyArray<CategoryRole> = ["text", "surface", "line", "onLine"];

const typeScale: ReadonlyArray<Swatch> = [
  { name: "xs", value: font.xs },
  { name: "sm", value: font.sm },
  { name: "md", value: font.md, note: "Body text." },
  { name: "lg", value: font.lg },
  { name: "xl", value: font.xl },
  { name: "xxl", value: font.xxl },
  { name: "xxxl", value: font.xxxl },
  { name: "display", value: font.display },
  { name: "displayLg", value: font.displayLg },
];

const spaces: ReadonlyArray<Swatch> = [
  { name: "xs", value: space.xs },
  { name: "sm", value: space.sm },
  { name: "md", value: space.md },
  { name: "lg", value: space.lg },
  { name: "xl", value: space.xl },
  { name: "xxl", value: space.xxl },
  { name: "xxxl", value: space.xxxl },
  { name: "section", value: space.section },
  { name: "page", value: space.page },
];

const radii: ReadonlyArray<Swatch> = [
  { name: "sm", value: radius.sm },
  { name: "md", value: radius.md },
  { name: "lg", value: radius.lg },
  { name: "xl", value: radius.xl },
  { name: "full", value: radius.full },
];

const shadows: ReadonlyArray<Swatch> = [
  { name: "frame", value: shadow.frame },
  { name: "sm", value: shadow.sm },
  { name: "md", value: shadow.md },
  { name: "lg", value: shadow.lg },
  { name: "xl", value: shadow.xl },
];

function FillSwatches({ swatches }: { readonly swatches: ReadonlyArray<Swatch> }) {
  return (
    <div {...stylex.props(styles.grid)}>
      {swatches.map((swatch) => (
        <figure key={swatch.name} {...stylex.props(styles.card)}>
          <div {...stylex.props(styles.fill(swatch.value))} />
          <figcaption {...stylex.props(styles.cardCaption)}>
            <code {...stylex.props(styles.tokenName)}>color.{swatch.name}</code>
            {swatch.note === undefined ? null : (
              <span {...stylex.props(styles.cardNote)}>{swatch.note}</span>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function SurfaceDepth() {
  return (
    <div {...stylex.props(styles.depthFrame)}>
      <span {...stylex.props(styles.depthLabel)}>frame</span>
      <div {...stylex.props(styles.depthPage)}>
        <span {...stylex.props(styles.depthLabel)}>page</span>
        <div {...stylex.props(styles.depthRow)}>
          <div {...stylex.props(styles.depthRaised)}>
            <span {...stylex.props(styles.depthLabel)}>raised</span>
          </div>
          <div {...stylex.props(styles.depthInset)}>
            <span {...stylex.props(styles.depthLabel)}>inset</span>
          </div>
          <div {...stylex.props(styles.depthOverlay)}>
            <span {...stylex.props(styles.depthLabel)}>overlay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const foundationSpecimens: ReadonlyArray<Specimen> = [
  {
    title: "Surface depth",
    note: "The frame is the darkest base surface, so the page panel comes forward. Cards sit on the panel, wells sit below it, and overlays float above it.",
    render: () => <SurfaceDepth />,
  },
  { title: "Surfaces", render: () => <FillSwatches swatches={surfaces} /> },
  {
    title: "Text",
    note: "Text colors on the page surface.",
    render: () => (
      <div {...stylex.props(styles.stack)}>
        {texts.map((swatch) => (
          <div key={swatch.name} {...stylex.props(styles.textRow)}>
            <code {...stylex.props(styles.tokenName, styles.tokenColumn)}>color.{swatch.name}</code>
            <span {...stylex.props(styles.textSample(swatch.value))}>
              Review the open work orders
            </span>
          </div>
        ))}
        <div {...stylex.props(styles.textRow)}>
          <code {...stylex.props(styles.tokenName, styles.tokenColumn)}>color.textInverse</code>
          <span {...stylex.props(styles.inverseSample)}>Review the open work orders</span>
        </div>
      </div>
    ),
  },
  {
    title: "Borders",
    render: () => (
      <div {...stylex.props(styles.grid)}>
        {borders.map((swatch) => (
          <figure key={swatch.name} {...stylex.props(styles.card)}>
            <div {...stylex.props(styles.borderBox(swatch.value))} />
            <figcaption {...stylex.props(styles.cardCaption)}>
              <code {...stylex.props(styles.tokenName)}>color.{swatch.name}</code>
            </figcaption>
          </figure>
        ))}
      </div>
    ),
  },
  {
    title: "Accent",
    note: "One accent for the primary action, the selection, and the focus ring.",
    render: () => (
      <div {...stylex.props(styles.stack)}>
        <FillSwatches swatches={accents} />
        <div {...stylex.props(styles.accentSample)}>Text on the accent uses color.onAccent</div>
      </div>
    ),
  },
  {
    title: "Status",
    note: "Each status has a strong value for text and icons, a muted fill, and a border.",
    render: () => (
      <div {...stylex.props(styles.grid)}>
        {statuses.map((status) => (
          <div key={status.name} {...stylex.props(styles.statusCard(status.muted, status.border))}>
            <span {...stylex.props(styles.statusText(status.fill))}>{status.name}</span>
            <code {...stylex.props(styles.tokenName)}>
              color.{status.name}, {status.name}Muted, {status.name}Border
            </code>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Category colors",
    note: "The fixed palette for projects, teams, or tags. Only the hue changes, so no category is more prominent than another.",
    wide: true,
    render: () => (
      <div {...stylex.props(styles.categoryTable)}>
        <span />
        {categoryRoles.map((role) => (
          <code key={role} {...stylex.props(styles.tokenName)}>
            {role}
          </code>
        ))}
        {categoryColors.map((entry) => [
          <span key={`${entry.key}-label`} {...stylex.props(styles.categoryLabel)}>
            {entry.label}
          </span>,
          <span
            key={`${entry.key}-text`}
            {...stylex.props(styles.textSample(categoryColor(entry.key, "text")))}
          >
            Aa {entry.label}
          </span>,
          <span
            key={`${entry.key}-surface`}
            {...stylex.props(
              styles.categoryChip(
                categoryColor(entry.key, "surface"),
                categoryColor(entry.key, "text"),
              ),
            )}
          >
            {entry.label}
          </span>,
          <span
            key={`${entry.key}-line`}
            {...stylex.props(styles.categoryLine(categoryColor(entry.key, "line")))}
          />,
          <span
            key={`${entry.key}-onLine`}
            {...stylex.props(
              styles.categoryChip(
                categoryColor(entry.key, "line"),
                categoryColor(entry.key, "onLine"),
              ),
            )}
          >
            ✓
          </span>,
        ])}
      </div>
    ),
  },
  {
    title: "Type scale",
    note: "Geist for text and Geist Mono for code. Headings use semibold, labels use medium.",
    render: () => (
      <div {...stylex.props(styles.stack)}>
        {typeScale.map((step) => (
          <div key={step.name} {...stylex.props(styles.textRow)}>
            <code {...stylex.props(styles.tokenName, styles.tokenColumn)}>font.{step.name}</code>
            <span {...stylex.props(styles.typeSample(step.value))}>Service schedule</span>
          </div>
        ))}
        <div {...stylex.props(styles.textRow)}>
          <code {...stylex.props(styles.tokenName, styles.tokenColumn)}>font.mono</code>
          <span {...stylex.props(styles.monoSample)}>WO-2041, 12:45</span>
        </div>
      </div>
    ),
  },
  {
    title: "Spacing",
    note: "A 4px scale. Adjacent steps differ by 25% or more.",
    render: () => (
      <div {...stylex.props(styles.stack)}>
        {spaces.map((step) => (
          <div key={step.name} {...stylex.props(styles.textRow)}>
            <code {...stylex.props(styles.tokenName, styles.tokenColumn)}>space.{step.name}</code>
            <span {...stylex.props(styles.spaceBar(step.value))} />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Radii and shadows",
    render: () => (
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.grid)}>
          {radii.map((step) => (
            <figure key={step.name} {...stylex.props(styles.card)}>
              <div {...stylex.props(styles.radiusBox(step.value))} />
              <figcaption {...stylex.props(styles.cardCaption)}>
                <code {...stylex.props(styles.tokenName)}>radius.{step.name}</code>
              </figcaption>
            </figure>
          ))}
        </div>
        <div {...stylex.props(styles.grid, styles.shadowGrid)}>
          {shadows.map((step) => (
            <figure key={step.name} {...stylex.props(styles.card)}>
              <div {...stylex.props(styles.shadowBox(step.value))} />
              <figcaption {...stylex.props(styles.cardCaption)}>
                <code {...stylex.props(styles.tokenName)}>shadow.{step.name}</code>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    ),
  },
];

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))",
    gap: space.lg,
  },
  stack: { display: "flex", flexDirection: "column", gap: space.md },
  card: { display: "flex", flexDirection: "column", gap: space.sm, margin: 0, minWidth: 0 },
  fill: (value: string) => ({
    height: "3.5rem",
    backgroundColor: value,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.borderSubtle,
    borderRadius: radius.lg,
  }),
  cardCaption: { display: "flex", flexDirection: "column", gap: space.xs },
  cardNote: { fontSize: font.sm, color: color.textMuted },
  tokenName: { fontFamily: font.mono, fontSize: font.sm, color: color.textMuted },
  tokenColumn: { flexShrink: 0, width: "10rem" },
  textRow: { display: "flex", alignItems: "center", gap: space.lg, minWidth: 0 },
  textSample: (value: string) => ({ color: value, fontSize: font.lg }),
  inverseSample: {
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: radius.md,
    backgroundColor: color.text,
    color: color.textInverse,
    fontSize: font.lg,
  },
  borderBox: (value: string) => ({
    height: "3.5rem",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: value,
    borderRadius: radius.lg,
    backgroundColor: color.raised,
  }),
  accentSample: {
    alignSelf: "flex-start",
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderRadius: radius.md,
    backgroundColor: color.accent,
    color: color.onAccent,
    fontWeight: font.medium,
  },
  statusCard: (muted: string, border: string) => ({
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    padding: space.md,
    backgroundColor: muted,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: border,
    borderRadius: radius.lg,
  }),
  statusText: (value: string) => ({ color: value, fontWeight: font.semibold }),
  categoryTable: {
    display: "grid",
    gridTemplateColumns: "6rem repeat(4, minmax(5rem, max-content))",
    alignItems: "center",
    columnGap: space.xl,
    rowGap: space.sm,
    overflowX: "auto",
  },
  categoryLabel: { fontSize: font.md, color: color.textMuted },
  categoryChip: (background: string, foreground: string) => ({
    justifySelf: "start",
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: radius.md,
    backgroundColor: background,
    color: foreground,
    fontWeight: font.medium,
  }),
  categoryLine: (value: string) => ({
    width: "3rem",
    height: "0.375rem",
    borderRadius: radius.full,
    backgroundColor: value,
  }),
  typeSample: (value: string) => ({ fontSize: value, lineHeight: font.leadingTight }),
  monoSample: { fontFamily: font.mono, fontSize: font.md },
  spaceBar: (value: string) => ({
    width: value,
    height: "0.75rem",
    borderRadius: radius.sm,
    backgroundColor: color.accentMuted,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.accentBorder,
  }),
  radiusBox: (value: string) => ({
    width: "4rem",
    height: "4rem",
    backgroundColor: color.raised,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: value,
  }),
  // The xl shadow reaches about 3rem below its box in the dark theme. The panel keeps it inside.
  shadowGrid: { paddingBlockEnd: "3rem" },
  shadowBox: (value: string) => ({
    height: "4rem",
    backgroundColor: color.raised,
    borderRadius: radius.lg,
    boxShadow: value,
  }),
  depthFrame: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    padding: space.md,
    backgroundColor: color.frame,
    borderRadius: radius.xl,
  },
  depthPage: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    padding: space.lg,
    backgroundColor: color.page,
    borderRadius: radius.lg,
    boxShadow: shadow.frame,
  },
  depthRow: { display: "flex", flexWrap: "wrap", gap: space.lg },
  depthRaised: {
    flexGrow: 1,
    minWidth: "7rem",
    height: "4.5rem",
    padding: space.sm,
    backgroundColor: color.raised,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.borderSubtle,
    borderRadius: radius.lg,
  },
  depthInset: {
    flexGrow: 1,
    minWidth: "7rem",
    height: "4.5rem",
    padding: space.sm,
    backgroundColor: color.inset,
    borderRadius: radius.lg,
  },
  depthOverlay: {
    flexGrow: 1,
    minWidth: "7rem",
    height: "4.5rem",
    padding: space.sm,
    backgroundColor: color.overlay,
    borderRadius: radius.lg,
    boxShadow: shadow.lg,
  },
  depthLabel: { fontFamily: font.mono, fontSize: font.sm, color: color.textMuted },
});
