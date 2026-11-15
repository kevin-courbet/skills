import * as stylex from "@stylexjs/stylex";
import { Avatar } from "@/components/primitives/avatar";
import {
  areaOptions,
  badgeNumber,
  badgeTypeOptions,
  formatVisitDay,
  hostOptions,
  labelOf,
  validUntil,
  type VisitValues,
} from "@/features/lab/visits";
import { lightTheme } from "@/styles/themes";
import { color, font, radius, shadow, space } from "@/styles/tokens.stylex";

/**
 * The printed visitor badge, the signature element of this form. It is
 * app-owned and built from tokens, because no kit frame can have the shape of
 * every printed thing.
 */
export function VisitorBadge({ values }: { readonly values: VisitValues }) {
  const name = values.name.trim();
  const host = values.host === null ? undefined : labelOf(hostOptions, values.host);
  const until = validUntil(values.areas);
  return (
    <div {...stylex.props(styles.badge)}>
      {/* The paper is printed on white card, so it keeps the light theme on a dark page. */}
      <div {...stylex.props(lightTheme, styles.paper)}>
        <span aria-hidden {...stylex.props(styles.hole)} />
        <div {...stylex.props(styles.body)}>
          <p {...stylex.props(styles.eyebrow)}>
            {values.visitDay === null ? "Visit day" : formatVisitDay(values.visitDay)}
          </p>
          <p {...stylex.props(styles.name, name === "" && styles.placeholder)}>
            {name === "" ? "Visitor name" : name}
          </p>
          <dl {...stylex.props(styles.facts)}>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Host</dt>
              <dd {...stylex.props(styles.detail, styles.host)}>
                {host === undefined ? (
                  "Reception"
                ) : (
                  <>
                    <Avatar name={host} size="xs" />
                    {host}
                  </>
                )}
              </dd>
            </div>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Areas</dt>
              <dd {...stylex.props(styles.detail)}>
                {values.areas.length === 0 ? (
                  <span {...stylex.props(styles.placeholder)}>No areas yet</span>
                ) : (
                  <ul {...stylex.props(styles.areas)}>
                    {areaOptions
                      .filter((option) => values.areas.includes(option.id))
                      .map((option) => (
                        <li key={option.id} {...stylex.props(styles.area)}>
                          {option.label}
                        </li>
                      ))}
                  </ul>
                )}
              </dd>
            </div>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Valid until</dt>
              <dd
                {...stylex.props(styles.detail, styles.time, until === null && styles.placeholder)}
              >
                {until ?? "--:--"}
              </dd>
            </div>
          </dl>
        </div>
        <div
          {...stylex.props(
            styles.band,
            values.badgeType === "contractor" ? styles.bandContractor : styles.bandVisitor,
          )}
        >
          <span {...stylex.props(styles.bandType)}>
            {labelOf(badgeTypeOptions, values.badgeType)}
          </span>
          <span {...stylex.props(styles.bandNumber)}>{badgeNumber}</span>
        </div>
      </div>
    </div>
  );
}

/** The punched hole for the lanyard clip: its radius and its gap to the top edge. */
const holeRadius = "0.4375rem";
const holeTop = "1rem";
const ringGap = "0.1875rem";

const styles = stylex.create({
  // The shadow sits on an unmasked wrapper, because the mask that punches the
  // hole in the paper would also cut away a shadow on the paper itself.
  badge: {
    alignSelf: "center",
    width: "100%",
    // The card is a fixed print size, so it grows with the text of a touch
    // density as one piece instead of wrapping the larger name more often.
    fontSize: font.md,
    maxWidth: "18.5em",
    borderRadius: radius.xl,
    boxShadow: shadow.lg,
    transform: "rotate(-1.5deg)",
  },
  paper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    // The card grows past its print proportions for a long name, so it must not clip its content.
    aspectRatio: "54 / 86",
    borderRadius: radius.xl,
    backgroundColor: color.raised,
    color: color.text,
    maskImage: `radial-gradient(circle at 50% calc(${holeTop} + ${holeRadius}), transparent ${holeRadius}, black calc(${holeRadius} + 0.5px))`,
  },
  hole: {
    position: "absolute",
    top: `calc(${holeTop} - ${ringGap})`,
    insetInlineStart: `calc(50% - ${holeRadius} - ${ringGap})`,
    width: `calc(2 * (${holeRadius} + ${ringGap}))`,
    height: `calc(2 * (${holeRadius} + ${ringGap}))`,
    borderRadius: radius.full,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: space.lg,
    paddingTop: `calc(${holeTop} + 2 * ${holeRadius} + ${space.md})`,
    paddingInline: space.lg,
    paddingBottom: space.lg,
  },
  eyebrow: {
    margin: 0,
    fontSize: font.xs,
    fontWeight: font.semibold,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: color.textMuted,
    textAlign: "center",
  },
  name: {
    margin: 0,
    fontSize: font.displayLg,
    fontWeight: font.bold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
    overflowWrap: "break-word",
    hyphens: "auto",
  },
  placeholder: { color: color.textFaint },
  facts: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    margin: 0,
    marginTop: "auto",
  },
  fact: { display: "flex", flexDirection: "column", gap: space.xs },
  term: {
    fontSize: font.xs,
    fontWeight: font.semibold,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: color.textFaint,
  },
  detail: { margin: 0, fontSize: font.md, overflowWrap: "anywhere" },
  host: { display: "flex", alignItems: "center", gap: space.sm },
  time: { fontFamily: font.mono },
  areas: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  area: {
    paddingBlock: "0.0625rem",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    backgroundColor: color.subtle,
    fontSize: font.sm,
  },
  // The angled top edge reads as the color band of a printed card, across the
  // full width, so it never becomes a strip along one edge of a box.
  band: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
    paddingTop: space.xxl,
    paddingInline: space.lg,
    paddingBottom: space.md,
    borderEndStartRadius: radius.xl,
    borderEndEndRadius: radius.xl,
    clipPath: `polygon(0 ${space.md}, 100% 0, 100% 100%, 0 100%)`,
  },
  bandVisitor: { backgroundColor: color.accent, color: color.onAccent },
  bandContractor: { backgroundColor: color.warningBorder, color: color.text },
  bandType: {
    fontSize: font.xl,
    fontWeight: font.bold,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  bandNumber: { flexShrink: 0, fontFamily: font.mono, fontSize: font.sm, whiteSpace: "nowrap" },
});
