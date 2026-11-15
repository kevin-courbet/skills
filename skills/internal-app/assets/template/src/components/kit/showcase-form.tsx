import * as stylex from "@stylexjs/stylex";
import { useForm, useStore } from "@tanstack/react-form";
import { Schema } from "effect";
import {
  Briefcase,
  Coffee,
  FlaskConical,
  HardHat,
  Presentation,
  Truck,
  Wrench,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox";
import type { ChoiceOption } from "@/components/ui/choice";
import { DatePicker, dayQuickPicks } from "@/components/ui/date-picker";
import {
  ErrorSummary,
  FieldRow,
  FormFooter,
  FormLayout,
  FormPreview,
} from "@/components/ui/form-layout";
import { Code, PageHeader, Section } from "@/components/ui/layout";
import { RadioGroup } from "@/components/ui/radio-group";
import { TextField } from "@/components/ui/text-field";
import { fieldError, formErrors, formBehavior } from "@/lib/form";
import { appLocale } from "@/lib/locale";
import { lightTheme } from "@/styles/themes";
import { color, font, radius, shadow, space } from "@/styles/tokens.stylex";

const Host = Schema.Literals(["amara", "jonas", "mei", "tomas"]);
type Host = typeof Host.Type;
const Building = Schema.Literals(["harbour", "canal", "hill"]);
type Building = typeof Building.Type;
const BadgeType = Schema.Literals(["visitor", "contractor"]);
type BadgeType = typeof BadgeType.Type;
const Area = Schema.Literals(["lobby", "offices", "meeting", "labs", "workshop", "dock"]);
type Area = typeof Area.Type;
const Extra = Schema.Literals(["parking", "wifi", "stepFree", "locker"]);
type Extra = typeof Extra.Type;

const notBlank = (message: string) => Schema.isPattern(/\S/, { message });

/** The visit schema. The visit day check needs today, so the schema is built per page. */
function visitSchema(today: string) {
  return Schema.Struct({
    name: Schema.String.pipe(
      Schema.check(notBlank("Enter the full name of the visitor, as it goes on the badge.")),
    ),
    company: Schema.String,
    email: Schema.String.pipe(
      Schema.check(
        notBlank("Enter the email of the visitor. The visit details go to it."),
        Schema.isPattern(/^\s*$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          message: "Enter the email in the form name@example.com.",
        }),
      ),
    ),
    host: Schema.NullOr(Host),
    building: Schema.NullOr(Building).pipe(
      Schema.check(
        Schema.makeFilter(
          (value: Building | null) => value !== null || "Pick the building of the visit.",
        ),
      ),
    ),
    floor: Schema.String.pipe(
      Schema.check(
        Schema.isMaxLength(3, {
          message: "Enter the floor in 3 characters or fewer, like 12 or B2.",
        }),
      ),
    ),
    room: Schema.String,
    visitDay: Schema.NullOr(Schema.String).pipe(
      Schema.check(
        Schema.makeFilter((value: string | null) => {
          if (value === null) return "Pick a day, or enter a date in the date field.";
          if (value < today) return "Pick a visit day of today or later.";
          return true;
        }),
      ),
    ),
    badgeType: BadgeType,
    areas: Schema.Array(Area).pipe(
      Schema.check(
        Schema.isMinLength(1, {
          message: "Pick at least one area. The badge opens only the areas on it.",
        }),
      ),
    ),
    extras: Schema.Array(Extra),
    note: Schema.String.pipe(
      Schema.check(Schema.isMaxLength(500, { message: "Shorten the note to 500 characters." })),
    ),
  });
}

type VisitValues = ReturnType<typeof visitSchema>["Type"];

const hosts: ReadonlyArray<{ id: Host; label: string; floor: string }> = [
  { id: "amara", label: "Amara Okafor", floor: "4" },
  { id: "jonas", label: "Jonas Berg", floor: "2" },
  { id: "mei", label: "Mei Tanaka", floor: "6" },
  { id: "tomas", label: "Tomas Silva", floor: "3" },
];

const hostOptions: ReadonlyArray<ChoiceOption<Host>> = hosts.map((host) => ({
  id: host.id,
  label: host.label,
  avatar: {},
  meta: `Floor ${host.floor}`,
}));

const buildingOptions: ReadonlyArray<ChoiceOption<Building>> = [
  { id: "harbour", label: "Harbour House" },
  { id: "canal", label: "Canal Works" },
  { id: "hill", label: "Hill Lab" },
];

const badgeTypeOptions: ReadonlyArray<ChoiceOption<BadgeType>> = [
  {
    id: "visitor",
    label: "Visitor",
    description: "Walks with the host in every area.",
  },
  {
    id: "contractor",
    label: "Contractor",
    icon: HardHat,
    description: "Works alone in the areas on the badge after a safety briefing.",
  },
];

/** The time each area closes, as 24-hour text. The badge is valid until the earliest one. */
const areaCloses: Record<Area, string> = {
  lobby: "20:00",
  offices: "18:00",
  meeting: "19:00",
  labs: "17:00",
  workshop: "16:00",
  dock: "15:00",
};

const areaKinds: ReadonlyArray<ChoiceOption<Area>> = [
  { id: "lobby", label: "Lobby and café", icon: Coffee },
  { id: "offices", label: "Office floors", icon: Briefcase },
  { id: "meeting", label: "Meeting rooms", icon: Presentation },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "workshop", label: "Workshop", icon: Wrench },
  { id: "dock", label: "Loading dock", icon: Truck },
];

const areaOptions: ReadonlyArray<ChoiceOption<Area>> = areaKinds.map((option) => ({
  ...option,
  meta: `until ${areaCloses[option.id]}`,
}));

const extraOptions: ReadonlyArray<ChoiceOption<Extra>> = [
  { id: "parking", label: "Parking space" },
  { id: "wifi", label: "Guest Wi-Fi" },
  { id: "stepFree", label: "Step-free route" },
  { id: "locker", label: "Locker" },
];

/** Page order of the fields, for the error summary. */
const fieldOrder = [
  { name: "name", id: "visit-name" },
  { name: "company", id: "visit-company" },
  { name: "email", id: "visit-email" },
  { name: "host", id: "visit-host" },
  { name: "building", id: "visit-building" },
  { name: "floor", id: "visit-floor" },
  { name: "room", id: "visit-room" },
  { name: "visitDay", id: "visit-day" },
  { name: "badgeType", id: "visit-badge-type" },
  { name: "areas", id: "visit-areas" },
  { name: "extras", id: "visit-extras" },
  { name: "note", id: "visit-note" },
] as const;

const badgeNumber = "V-2318";
const formId = "visitor-registration";

function formatVisitDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(appLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function labelOf<Value extends string>(
  options: ReadonlyArray<ChoiceOption<Value>>,
  id: Value,
): string {
  const option = options.find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error(`No option has the id "${id}".`);
  return option.label;
}

/** The earliest closing time of the areas, or null when no area is picked. */
function validUntil(areas: ReadonlyArray<Area>): string | null {
  const times = areas.map((area) => areaCloses[area]).toSorted();
  return times[0] ?? null;
}

const emptyValues: VisitValues = {
  name: "",
  company: "",
  email: "",
  host: null,
  building: null,
  floor: "",
  room: "",
  visitDay: null,
  badgeType: "visitor",
  areas: [],
  extras: [],
  note: "",
};

/**
 * A long form built from the kit form parts: split sections, sized fields,
 * choice cards and chips, date quick picks, a live preview of the printed
 * badge, an error summary, and a sticky footer. `today` is an ISO date from
 * the route loader, so the server and the browser render the same days.
 * `cancel` is a quiet LinkButton back to the page that opened the form,
 * because the kit knows no app routes.
 */
export function FormShowcase({
  today,
  cancel,
}: {
  readonly today: string;
  readonly cancel: ReactNode;
}) {
  const [sent, setSent] = useState<VisitValues | null>(null);
  const schema = useMemo(() => Schema.toStandardSchemaV1(visitSchema(today)), [today]);
  const quickPicks = useMemo(
    () =>
      dayQuickPicks({
        today,
        count: 4,
        skip: (date) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()),
      }),
    [today],
  );
  const form = useForm({
    ...formBehavior,
    defaultValues: emptyValues,
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => setSent(value),
  });
  const hasSubmitAttempt = useStore(form.store, (state) => state.submissionAttempts > 0);

  if (sent !== null)
    return (
      <>
        <PageHeader title="Register a visitor" />
        <Alert
          intent="success"
          announce="status"
          title={
            <>
              Badge <Code>{badgeNumber}</Code> is printing at reception
            </>
          }
          actions={
            <Button
              onPress={() => {
                form.reset();
                setSent(null);
              }}
            >
              Register another visitor
            </Button>
          }
        >
          {sent.host === null
            ? "Reception meets the visitor at the desk. The visit details go to "
            : `${labelOf(hostOptions, sent.host)} gets a message when the visitor arrives. The visit details go to `}
          {sent.email}.
        </Alert>
      </>
    );

  return (
    <>
      <PageHeader
        title="Register a visitor"
        description="Reception prints the badge before the visitor arrives."
      />
      <FormLayout
        id={formId}
        onSubmit={() => void form.handleSubmit()}
        aria-label="Register a visitor"
        preview={
          <FormPreview label="Visitor badge preview" description="Prints at the reception desk.">
            <form.Subscribe selector={(state) => state.values}>
              {(values) => <VisitorBadge values={values} />}
            </form.Subscribe>
          </FormPreview>
        }
        footer={
          <FormFooter
            summary={
              <form.Subscribe selector={(state) => state.values.areas}>
                {(areas) => <FooterSummary areas={areas} />}
              </form.Subscribe>
            }
          >
            {cancel}
            <Button intent="primary" type="submit">
              Print badge
            </Button>
          </FormFooter>
        }
      >
        <form.Subscribe
          selector={(state) => ({
            fieldMeta: state.fieldMeta,
            submissionAttempts: state.submissionAttempts,
          })}
        >
          {({ fieldMeta, submissionAttempts }) => {
            const errors = submissionAttempts === 0 ? [] : formErrors(fieldMeta, fieldOrder);
            return (
              <ErrorSummary
                title={`${errors.length} ${errors.length === 1 ? "thing" : "things"} to fix before you print the badge`}
                errors={errors}
                submitCount={submissionAttempts}
              />
            );
          }}
        </form.Subscribe>

        <Section
          layout="split"
          title="Visitor"
          description="The name and the company go on the badge. The visit details go to the email."
        >
          <FieldRow>
            <form.Field name="name">
              {(field) => (
                <TextField
                  id="visit-name"
                  label="Full name"
                  autoFocus
                  autoComplete="off"
                  width="md"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
            <form.Field name="company">
              {(field) => (
                <TextField
                  id="visit-company"
                  label="Company"
                  isOptional
                  autoComplete="off"
                  width="md"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
          </FieldRow>
          <form.Field name="email">
            {(field) => (
              <TextField
                id="visit-email"
                label="Email"
                type="email"
                autoComplete="off"
                placeholder="e.g. sam.lee@example.com"
                width="lg"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
        </Section>

        <Section
          layout="split"
          title="Host"
          description="The host gets a message when the visitor arrives and walks them in."
        >
          <form.Field name="host">
            {(field) => (
              <RadioGroup
                id="visit-host"
                label="Host"
                appearance="chips"
                options={hostOptions}
                noneOption={{ label: "Reception" }}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
        </Section>

        <Section
          layout="split"
          title="Visit"
          description="The badge works only in this building and on this day."
        >
          <form.Field name="building">
            {(field) => (
              <RadioGroup
                id="visit-building"
                label="Building"
                appearance="chips"
                options={buildingOptions}
                value={field.state.value}
                onChange={(next) => {
                  field.handleChange(next);
                  field.handleBlur();
                }}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <FieldRow>
            <form.Field name="floor">
              {(field) => (
                <TextField
                  id="visit-floor"
                  label="Floor"
                  isOptional
                  placeholder="e.g. 4"
                  width="xs"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
            <form.Field name="room">
              {(field) => (
                <TextField
                  id="visit-room"
                  label="Room"
                  isOptional
                  placeholder="e.g. 4.12"
                  width="sm"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
          </FieldRow>
          <form.Field name="visitDay">
            {(field) => (
              <DatePicker
                id="visit-day"
                label="Visit day"
                quickPicks={quickPicks}
                minValue={today}
                value={field.state.value}
                onChange={(next) => {
                  field.handleChange(next);
                  field.handleBlur();
                }}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
        </Section>

        <Section
          layout="split"
          title="Badge"
          description="The badge opens only the areas on it, until the first of them closes."
        >
          <form.Field name="badgeType">
            {(field) => (
              <RadioGroup
                id="visit-badge-type"
                label="Badge type"
                appearance="cards"
                options={badgeTypeOptions}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <form.Field name="areas">
            {(field) => (
              <CheckboxGroup
                id="visit-areas"
                label="Areas"
                description="Pick at least one."
                options={areaOptions}
                value={field.state.value}
                onChange={(next) => {
                  field.handleChange(next);
                  field.handleBlur();
                }}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <form.Field name="extras">
            {(field) => (
              <CheckboxGroup
                id="visit-extras"
                label="Extras"
                isOptional
                description="Reception prepares these before the visitor arrives."
                appearance="chips"
                options={extraOptions}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <form.Field name="note">
            {(field) => (
              <TextField
                id="visit-note"
                label="Note for reception"
                isOptional
                multiline
                description="Anything the other answers do not say, such as equipment the visitor brings."
                placeholder="e.g. Brings two cases of test equipment."
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
        </Section>
      </FormLayout>
    </>
  );
}

function FooterSummary({ areas }: { readonly areas: ReadonlyArray<Area> }) {
  const until = validUntil(areas);
  return (
    <>
      <Code>{badgeNumber}</Code>
      <span>
        {until === null
          ? "No areas picked yet"
          : `${areas.length} ${areas.length === 1 ? "area" : "areas"}, valid until ${until}`}
      </span>
    </>
  );
}

/**
 * The printed visitor badge, the signature element of this form. It is
 * app-owned and built from tokens, because no kit frame can have the shape of
 * every printed thing.
 */
function VisitorBadge({ values }: { readonly values: VisitValues }) {
  const name = values.name.trim();
  const company = values.company.trim();
  const floor = values.floor.trim();
  const room = values.room.trim();
  const host = values.host === null ? undefined : hosts.find((item) => item.id === values.host);
  const until = validUntil(values.areas);
  const place = [
    values.building === null ? undefined : labelOf(buildingOptions, values.building),
    floor === "" ? undefined : `Floor ${floor}`,
    room === "" ? undefined : `Room ${room}`,
  ].filter((part) => part !== undefined);
  return (
    <div {...stylex.props(styles.badge)}>
      {/* The paper is printed on white card, so it keeps the light theme on a dark page. */}
      <div {...stylex.props(lightTheme, styles.paper)}>
        <span aria-hidden {...stylex.props(styles.hole)} />
        <div {...stylex.props(styles.body)}>
          <p {...stylex.props(styles.eyebrow)}>
            {values.visitDay === null ? "Visit day" : formatVisitDay(values.visitDay)}
          </p>
          <div>
            <p {...stylex.props(styles.name, name === "" && styles.placeholder)}>
              {name === "" ? "Visitor name" : name}
            </p>
            <p {...stylex.props(styles.company, company === "" && styles.placeholder)}>
              {company === "" ? "Company" : company}
            </p>
          </div>
          <dl {...stylex.props(styles.facts)}>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Host</dt>
              <dd {...stylex.props(styles.detail, styles.host)}>
                {host === undefined ? (
                  "Reception"
                ) : (
                  <>
                    <Avatar name={host.label} size="xs" />
                    {host.label}
                  </>
                )}
              </dd>
            </div>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Where</dt>
              <dd {...stylex.props(styles.detail, place.length === 0 && styles.placeholder)}>
                {place.length === 0 ? "Building" : place.join(", ")}
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
  company: {
    margin: 0,
    marginTop: space.xs,
    fontSize: font.lg,
    color: color.textMuted,
    overflowWrap: "anywhere",
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
