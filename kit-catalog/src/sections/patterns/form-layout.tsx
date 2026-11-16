import * as stylex from "@stylexjs/stylex";
import { useForm, useStore } from "@tanstack/react-form";
import { Schema } from "effect";
import { useId, useState } from "react";
import type { ChoiceOption } from "@/components/helpers/choice";
import { fieldError, formBehavior, formErrors } from "@/components/helpers/form";
import {
  ErrorSummary,
  FieldRow,
  type FormError,
  FormFooter,
  FormLayout,
  FormPreview,
} from "@/components/patterns/form-layout";
import { Alert } from "@/components/primitives/alert";
import { Button, LinkButton } from "@/components/primitives/button";
import { CheckboxGroup } from "@/components/primitives/checkbox";
import { Section } from "@/components/primitives/layout";
import { RadioGroup } from "@/components/primitives/radio-group";
import { TextField } from "@/components/primitives/text-field";
import { formatCurrency } from "@/lib/locale";
import { lightTheme } from "@/styles/themes";
import { color, font, radius, shadow, space } from "@/styles/tokens.stylex";
import { defineSection } from "../../specimen";

const Service = Schema.Literals([
  "fullService",
  "brakeBleed",
  "gearTuneUp",
  "puncture",
  "wheelTruing",
]);
type Service = typeof Service.Type;
const Mechanic = Schema.Literals(["lena", "marco", "sam"]);
type Mechanic = typeof Mechanic.Type;

const notBlank = (message: string) => Schema.isPattern(/\S/, { message });

const checkInSchema = Schema.Struct({
  customer: Schema.String.pipe(
    Schema.check(notBlank("Enter the name of the customer, as it goes on the repair tag.")),
  ),
  phone: Schema.String.pipe(
    Schema.check(
      notBlank("Enter a phone number. The shop calls it when the bike is ready."),
      Schema.isPattern(/^\s*$|^\+?[0-9 ]{6,}$/, {
        message: "Enter the phone number in digits, like +49 30 1234 5678.",
      }),
    ),
  ),
  bike: Schema.String.pipe(Schema.check(notBlank("Enter the brand and the model of the bike."))),
  frameNumber: Schema.String.pipe(
    Schema.check(
      Schema.isPattern(/^\s*$|^[A-Za-z0-9-]{6,}$/, {
        message: "Enter the frame number in 6 or more letters and digits, like WTU123C4567.",
      }),
    ),
  ),
  services: Schema.Array(Service).pipe(
    Schema.check(
      Schema.isMinLength(1, {
        message: "Pick at least one service. The estimate comes from the services.",
      }),
    ),
  ),
  mechanic: Schema.NullOr(Mechanic),
  notes: Schema.String,
});

type CheckInValues = typeof checkInSchema.Type;

const checkInStandardSchema = Schema.toStandardSchemaV1(checkInSchema);

const emptyCheckIn: CheckInValues = {
  customer: "",
  phone: "",
  bike: "",
  frameNumber: "",
  services: [],
  mechanic: null,
  notes: "",
};

const longCheckIn: CheckInValues = {
  customer: "Maximilian Alexander von Hohenberg-Schwarzenfeld",
  phone: "+49 30 9876 5432",
  bike: "Riese & Müller Load 75 Rohloff HS cargo bike with the child seat",
  frameNumber: "RM75-2024-DE-118842",
  services: ["fullService", "brakeBleed", "gearTuneUp", "wheelTruing"],
  mechanic: "marco",
  notes:
    "The rear brake squeals on long descents. The customer also hears a click from the bottom bracket when the cargo box is full, and asks for a call before any part over 50 euros.",
};

const servicePrices: Record<Service, number> = {
  fullService: 129,
  brakeBleed: 79,
  gearTuneUp: 45,
  puncture: 22,
  wheelTruing: 35,
};

const serviceOptions: ReadonlyArray<ChoiceOption<Service>> = [
  {
    id: "fullService",
    label: "Full service",
    description: "Clean, adjust, and check every part.",
    meta: formatCurrency(servicePrices.fullService),
  },
  {
    id: "brakeBleed",
    label: "Brake bleed",
    description: "New fluid in both hydraulic brakes.",
    meta: formatCurrency(servicePrices.brakeBleed),
  },
  {
    id: "gearTuneUp",
    label: "Gear tune-up",
    description: "Index the gears and lube the cables.",
    meta: formatCurrency(servicePrices.gearTuneUp),
  },
  {
    id: "puncture",
    label: "Puncture repair",
    description: "Patch or replace one inner tube.",
    meta: formatCurrency(servicePrices.puncture),
  },
  {
    id: "wheelTruing",
    label: "Wheel truing",
    description: "True one wheel and tension the spokes.",
    meta: formatCurrency(servicePrices.wheelTruing),
  },
];

const mechanicOptions: ReadonlyArray<ChoiceOption<Mechanic>> = [
  { id: "lena", label: "Lena Fischer", avatar: {}, meta: "3 open" },
  { id: "marco", label: "Marco Rossi", avatar: {}, meta: "5 open" },
  { id: "sam", label: "Sam Okafor", avatar: {}, meta: "1 open" },
];

const workOrderNumber = "WO-1054";

function labelOf<Value extends string>(
  options: ReadonlyArray<ChoiceOption<Value>>,
  id: Value,
): string {
  const option = options.find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error(`No option has the id "${id}".`);
  return option.label;
}

function estimate(services: ReadonlyArray<Service>): string {
  if (services.length === 0) return "No services picked yet";
  return `Estimate ${formatCurrency(services.reduce((sum, service) => sum + servicePrices[service], 0))}`;
}

/** The repair tag that hangs on the handlebar. It is an app part, built from tokens. */
function RepairTag({ values }: { readonly values: CheckInValues }) {
  const customer = values.customer.trim();
  const bike = values.bike.trim();
  return (
    <div {...stylex.props(styles.tag)}>
      {/* The tag is printed on white card, so it keeps the light theme on a dark page. */}
      <div {...stylex.props(lightTheme, styles.paper)}>
        <span aria-hidden {...stylex.props(styles.hole)} />
        <div {...stylex.props(styles.tagBody)}>
          <p {...stylex.props(styles.eyebrow)}>{workOrderNumber}</p>
          <p {...stylex.props(styles.customer, customer === "" && styles.placeholder)}>
            {customer === "" ? "Customer name" : customer}
          </p>
          <p {...stylex.props(styles.bike, bike === "" && styles.placeholder)}>
            {bike === "" ? "Bike" : bike}
          </p>
          <dl {...stylex.props(styles.facts)}>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Services</dt>
              <dd {...stylex.props(styles.detail)}>
                {values.services.length === 0 ? (
                  <span {...stylex.props(styles.placeholder)}>No services yet</span>
                ) : (
                  <ul {...stylex.props(styles.services)}>
                    {serviceOptions
                      .filter((option) => values.services.includes(option.id))
                      .map((option) => (
                        <li key={option.id}>{option.label}</li>
                      ))}
                  </ul>
                )}
              </dd>
            </div>
            <div {...stylex.props(styles.fact)}>
              <dt {...stylex.props(styles.term)}>Mechanic</dt>
              <dd {...stylex.props(styles.detail)}>
                {values.mechanic === null
                  ? "Next free mechanic"
                  : labelOf(mechanicOptions, values.mechanic)}
              </dd>
            </div>
          </dl>
        </div>
        <div {...stylex.props(styles.band)}>
          <span>Frame</span>
          <span
            {...stylex.props(
              styles.mono,
              values.frameNumber.trim() === "" && styles.bandPlaceholder,
            )}
          >
            {values.frameNumber.trim() === "" ? "Not recorded" : values.frameNumber.trim()}
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckInSuccess({
  customer,
  onNext,
}: {
  readonly customer: string;
  readonly onNext: () => void;
}) {
  return (
    <Alert
      intent="success"
      announce="status"
      title={`Repair tag ${workOrderNumber} for ${customer} is printing at the counter`}
      actions={<Button onPress={onNext}>Check in another bike</Button>}
    >
      The work order goes to the queue of the mechanic. The customer gets a text message when the
      bike is ready.
    </Alert>
  );
}

function CheckInForm({ initial }: { readonly initial: CheckInValues }) {
  const prefix = useId();
  const ids = {
    customer: `${prefix}-customer`,
    phone: `${prefix}-phone`,
    bike: `${prefix}-bike`,
    frameNumber: `${prefix}-frame-number`,
    services: `${prefix}-services`,
    mechanic: `${prefix}-mechanic`,
    notes: `${prefix}-notes`,
  };
  const fieldOrder = [
    { name: "customer", id: ids.customer },
    { name: "phone", id: ids.phone },
    { name: "bike", id: ids.bike },
    { name: "frameNumber", id: ids.frameNumber },
    { name: "services", id: ids.services },
    { name: "mechanic", id: ids.mechanic },
    { name: "notes", id: ids.notes },
  ] as const;
  const [printedFor, setPrintedFor] = useState<string | null>(null);
  const form = useForm({
    ...formBehavior,
    defaultValues: initial,
    validators: { onDynamic: checkInStandardSchema },
    onSubmit: ({ value, formApi }) => {
      setPrintedFor(value.customer.trim());
      formApi.reset();
    },
  });
  const submitted = useStore(form.store, (state) => state.submissionAttempts > 0);

  if (printedFor !== null)
    return <CheckInSuccess customer={printedFor} onNext={() => setPrintedFor(null)} />;

  return (
    <FormLayout
      aria-label="Check in a bike"
      onSubmit={() => void form.handleSubmit()}
      preview={
        <FormPreview
          label="Repair tag preview"
          description="Prints at the counter and hangs on the handlebar."
        >
          <form.Subscribe selector={(state) => state.values}>
            {(values) => <RepairTag values={values} />}
          </form.Subscribe>
        </FormPreview>
      }
      footer={
        <FormFooter
          summary={
            <form.Subscribe selector={(state) => estimate(state.values.services)}>
              {(text) => <span>{text}</span>}
            </form.Subscribe>
          }
        >
          <LinkButton to="/" intent="ghost">
            Cancel
          </LinkButton>
          <Button intent="primary" type="submit">
            Print repair tag
          </Button>
        </FormFooter>
      }
    >
      <form.Subscribe
        selector={(state) => ({ fieldMeta: state.fieldMeta, attempts: state.submissionAttempts })}
      >
        {({ fieldMeta, attempts }) => (
          <ErrorSummary
            title="Fix these answers before you print the repair tag"
            errors={attempts === 0 ? [] : formErrors(fieldMeta, fieldOrder)}
            submitCount={attempts}
          />
        )}
      </form.Subscribe>
      <Section
        layout="split"
        title="Customer"
        description="The name goes on the tag. The shop calls the phone number when the bike is ready."
      >
        <form.Field name="customer">
          {(field) => (
            <TextField
              id={ids.customer}
              label="Customer name"
              autoComplete="name"
              width="md"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errorMessage={fieldError(field, submitted)}
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(field) => (
            <TextField
              id={ids.phone}
              label="Phone"
              type="tel"
              autoComplete="tel"
              width="sm"
              placeholder="e.g. +49 30 1234 5678"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errorMessage={fieldError(field, submitted)}
            />
          )}
        </form.Field>
      </Section>
      <Section
        layout="split"
        title="Bike"
        description="The frame number identifies the bike if the customer loses the tag."
      >
        <FieldRow>
          <form.Field name="bike">
            {(field) => (
              <TextField
                id={ids.bike}
                label="Brand and model"
                width="md"
                placeholder="e.g. Trek Domane AL 2"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field, submitted)}
              />
            )}
          </form.Field>
          <form.Field name="frameNumber">
            {(field) => (
              <TextField
                id={ids.frameNumber}
                label="Frame number"
                description="Under the bottom bracket."
                isOptional
                width="sm"
                placeholder="e.g. WTU123C4567"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field, submitted)}
              />
            )}
          </form.Field>
        </FieldRow>
      </Section>
      <Section
        layout="split"
        title="Work"
        description="The services set the estimate. The mechanic gets the work order in the queue."
      >
        <form.Field name="services">
          {(field) => (
            <CheckboxGroup
              id={ids.services}
              label="Services"
              options={serviceOptions}
              value={field.state.value}
              onChange={(next) => {
                field.handleChange(next);
                field.handleBlur();
              }}
              errorMessage={fieldError(field, submitted)}
            />
          )}
        </form.Field>
        <form.Field name="mechanic">
          {(field) => (
            <RadioGroup
              id={ids.mechanic}
              label="Mechanic"
              appearance="chips"
              options={mechanicOptions}
              noneOption={{ label: "Decide later" }}
              value={field.state.value}
              onChange={field.handleChange}
              errorMessage={fieldError(field, submitted)}
            />
          )}
        </form.Field>
        <form.Field name="notes">
          {(field) => (
            <TextField
              id={ids.notes}
              label="Notes for the mechanic"
              description="What the customer hears or sees, and when."
              isOptional
              multiline
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errorMessage={fieldError(field, submitted)}
            />
          )}
        </form.Field>
      </Section>
    </FormLayout>
  );
}

type ContactChannel = "phone" | "text" | "email";

const contactOptions: ReadonlyArray<ChoiceOption<ContactChannel>> = [
  { id: "phone", label: "Phone call" },
  { id: "text", label: "Text message" },
  { id: "email", label: "Email" },
];

interface CustomerValues {
  readonly name: string;
  readonly email: string;
  readonly channel: ContactChannel | null;
}

function customerErrors(values: CustomerValues) {
  return {
    name: /\S/.test(values.name)
      ? undefined
      : "Enter the name of the customer, as it goes on the invoices.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
      ? undefined
      : "Enter the email in the form name@example.com. The invoices go to it.",
    channel:
      values.channel === null
        ? "Pick how the shop tells the customer that the bike is ready."
        : undefined,
  };
}

/**
 * The state after one failed submit. The catalog shows it at load, so it does
 * not use TanStack Form, which has no submit attempt before people press the button.
 */
function CustomerForm() {
  const prefix = useId();
  const ids = { name: `${prefix}-name`, email: `${prefix}-email`, channel: `${prefix}-channel` };
  const [values, setValues] = useState<CustomerValues>({
    name: "",
    email: "noor.haddad@example",
    channel: null,
  });
  const [submitCount, setSubmitCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const errors = customerErrors(values);
  const summary: ReadonlyArray<FormError> = [
    { fieldId: ids.name, message: errors.name },
    { fieldId: ids.email, message: errors.email },
    { fieldId: ids.channel, message: errors.channel },
  ].flatMap((entry) =>
    entry.message === undefined ? [] : [{ fieldId: entry.fieldId, message: entry.message }],
  );

  if (saved)
    return (
      <Alert
        intent="success"
        announce="status"
        title={`The details of ${values.name.trim()} are saved`}
      >
        The next invoice goes to {values.email.trim()}.
      </Alert>
    );

  return (
    <FormLayout
      aria-label="Edit a customer"
      onSubmit={() => {
        setSubmitCount((count) => count + 1);
        if (summary.length === 0) setSaved(true);
      }}
      footer={
        <FormFooter>
          <LinkButton to="/" intent="ghost">
            Cancel
          </LinkButton>
          <Button intent="primary" type="submit">
            Save customer
          </Button>
        </FormFooter>
      }
    >
      <ErrorSummary
        title={`${String(summary.length)} things to fix before you save the customer`}
        errors={summary}
        submitCount={submitCount}
      />
      <Section
        layout="split"
        title="Customer"
        description="The name and the email go on each invoice."
      >
        <FieldRow>
          <TextField label="Customer number" width="sm" value="C-0418" isReadOnly />
          <TextField
            label="Loyalty discount"
            description="Starts after 5 paid work orders."
            width="xs"
            value="0%"
            isDisabled
          />
        </FieldRow>
        <TextField
          id={ids.name}
          label="Customer name"
          autoComplete="name"
          width="md"
          value={values.name}
          onChange={(name) => setValues((current) => ({ ...current, name }))}
          errorMessage={errors.name}
        />
        <TextField
          id={ids.email}
          label="Email"
          type="email"
          autoComplete="email"
          width="lg"
          value={values.email}
          onChange={(email) => setValues((current) => ({ ...current, email }))}
          errorMessage={errors.email}
        />
      </Section>
      <Section
        layout="split"
        title="Contact"
        description="The shop uses this channel when a bike is ready or needs a part."
      >
        <RadioGroup
          id={ids.channel}
          label="Tell the customer by"
          appearance="chips"
          options={contactOptions}
          value={values.channel}
          onChange={(channel) => setValues((current) => ({ ...current, channel }))}
          errorMessage={errors.channel}
        />
      </Section>
    </FormLayout>
  );
}

function SuccessThenForm() {
  const [isDone, setDone] = useState(true);
  if (isDone) return <CheckInSuccess customer="Amara Diallo" onNext={() => setDone(false)} />;
  return <CheckInForm initial={emptyCheckIn} />;
}

export default defineSection({
  component: "FormLayout",
  specimens: [
    {
      title: "Check-in form with a repair tag preview",
      note: "Submit the empty form to see the ErrorSummary. Fill in the form and submit it to see the success Alert that replaces the form.",
      wide: true,
      render: () => <CheckInForm initial={emptyCheckIn} />,
    },
    {
      title: "Long answers",
      note: "A long name and a long bike wrap in the tag. The tag grows taller to fit them.",
      wide: true,
      render: () => <CheckInForm initial={longCheckIn} />,
    },
    {
      title: "Errors after a failed submit, without a preview",
      note: "A form that only changes a record has no preview. The ErrorSummary lists the problems in the order of the fields and links each one to its field.",
      wide: true,
      render: () => <CustomerForm />,
    },
    {
      title: "Success after a submit",
      note: "After a successful submit, a success Alert replaces the form. Its action starts the next task.",
      wide: true,
      render: () => <SuccessThenForm />,
    },
  ],
});

/** The punched hole for the tag string: its radius and its gap to the top edge. */
const holeRadius = "0.375rem";
const holeTop = "0.875rem";

const styles = stylex.create({
  // The shadow sits on a wrapper without a mask, because the mask that punches the hole would cut it away.
  tag: {
    alignSelf: "center",
    width: "100%",
    // The tag has a fixed print size, so it grows with the text of touch density as one piece.
    fontSize: font.md,
    maxWidth: "17em",
    borderRadius: radius.lg,
    boxShadow: shadow.lg,
    transform: "rotate(1.5deg)",
  },
  paper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "24em",
    borderRadius: radius.lg,
    backgroundColor: color.raised,
    color: color.text,
    clipPath: "polygon(18% 0, 82% 0, 100% 9%, 100% 100%, 0 100%, 0 9%)",
    maskImage: `radial-gradient(circle at 50% calc(${holeTop} + ${holeRadius}), transparent ${holeRadius}, black calc(${holeRadius} + 0.5px))`,
  },
  hole: {
    position: "absolute",
    top: `calc(${holeTop} - 0.1875rem)`,
    insetInlineStart: `calc(50% - ${holeRadius} - 0.1875rem)`,
    width: `calc(2 * (${holeRadius} + 0.1875rem))`,
    height: `calc(2 * (${holeRadius} + 0.1875rem))`,
    borderRadius: radius.full,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
  },
  tagBody: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: space.sm,
    paddingTop: `calc(${holeTop} + 2 * ${holeRadius} + ${space.lg})`,
    paddingInline: space.lg,
    paddingBottom: space.lg,
  },
  eyebrow: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.xs,
    fontWeight: font.semibold,
    letterSpacing: "0.08em",
    color: color.textMuted,
    textAlign: "center",
  },
  customer: {
    margin: 0,
    fontSize: font.xxxl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
    letterSpacing: font.trackingTight,
    overflowWrap: "break-word",
    hyphens: "auto",
  },
  bike: { margin: 0, fontSize: font.lg, color: color.textMuted, overflowWrap: "break-word" },
  placeholder: { color: color.textFaint },
  facts: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    margin: 0,
    marginTop: space.md,
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
  services: { margin: 0, padding: 0, listStyleType: "none" },
  band: {
    display: "flex",
    justifyContent: "space-between",
    gap: space.md,
    paddingBlock: space.sm,
    paddingInline: space.lg,
    fontSize: font.xs,
    fontWeight: font.semibold,
    color: color.onAccent,
    backgroundColor: color.accent,
  },
  bandPlaceholder: { opacity: 0.7 },
  mono: { fontFamily: font.mono, overflowWrap: "anywhere" },
});
