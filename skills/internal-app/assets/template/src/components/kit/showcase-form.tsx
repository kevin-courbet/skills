import * as stylex from "@stylexjs/stylex";
import { useForm, useStore } from "@tanstack/react-form";
import { Schema } from "effect";
import {
  Armchair,
  DoorClosed,
  Droplets,
  Lightbulb,
  Siren,
  SprayCan,
  Thermometer,
  Zap,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Card, Code, DescriptionList, PageHeader, Section } from "@/components/ui/layout";
import { RadioGroup } from "@/components/ui/radio-group";
import { TextField } from "@/components/ui/text-field";
import { fieldError, formErrors, formBehavior } from "@/lib/form";
import { appLocale } from "@/lib/locale";
import { color, font, space } from "@/styles/tokens.stylex";

const Building = Schema.Literals(["north", "south", "lab", "depot"]);
type Building = typeof Building.Type;
const WorkKind = Schema.Literals([
  "electrical",
  "plumbing",
  "heating",
  "lighting",
  "doors",
  "furniture",
  "cleaning",
]);
type WorkKind = typeof WorkKind.Type;
const AccessNeed = Schema.Literals(["keycard", "ladder", "escort", "afterHours"]);
type AccessNeed = typeof AccessNeed.Type;
const Priority = Schema.Literals(["normal", "urgent"]);
type Priority = typeof Priority.Type;
const Technician = Schema.Literals(["amara", "jonas", "mei", "tomas"]);
type Technician = typeof Technician.Type;

const notBlank = (message: string) => Schema.isPattern(/\S/, { message });

/** The request schema. The due date check needs today, so the schema is built per page. */
function requestSchema(today: string) {
  return Schema.Struct({
    name: Schema.String.pipe(Schema.check(notBlank("Enter your name."))),
    email: Schema.String.pipe(
      Schema.check(
        notBlank("Enter your work email. Updates about the request go to it."),
        Schema.isPattern(/^\s*$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          message: "Enter the email in the form name@example.com.",
        }),
      ),
    ),
    phone: Schema.String.pipe(
      Schema.check(
        Schema.isPattern(/^$|^\+?[\d\s-]{6,}$/, {
          message: "Enter the phone number with digits and spaces only, like 020 7946 0321.",
        }),
      ),
    ),
    building: Schema.NullOr(Building),
    floor: Schema.String.pipe(
      Schema.check(
        notBlank("Enter the floor, like 3 or G for the ground floor."),
        Schema.isMaxLength(3, {
          message: "Enter the floor in 3 characters or fewer, like 12 or B2.",
        }),
      ),
    ),
    room: Schema.String,
    work: Schema.Array(WorkKind).pipe(
      Schema.check(
        Schema.isMinLength(1, {
          message: "Pick at least one kind of work. Use the note for anything else.",
        }),
      ),
    ),
    note: Schema.String.pipe(
      Schema.check(Schema.isMaxLength(500, { message: "Shorten the note to 500 characters." })),
    ),
    access: Schema.Array(AccessNeed),
    priority: Priority,
    dueBy: Schema.NullOr(Schema.String).pipe(
      Schema.check(
        Schema.makeFilter((value: string | null) => {
          if (value === null) return "Pick a day, or enter a date in the date field.";
          if (value < today) return "Pick a due day of today or later.";
          return true;
        }),
      ),
    ),
    assignee: Schema.NullOr(Technician),
  });
}

type RequestValues = ReturnType<typeof requestSchema>["Type"];

const buildingOptions: ReadonlyArray<ChoiceOption<Building>> = [
  { id: "north", label: "North tower" },
  { id: "south", label: "South tower" },
  { id: "lab", label: "Lab block" },
  { id: "depot", label: "Depot" },
];

const workMinutes: Record<WorkKind, number> = {
  electrical: 60,
  plumbing: 120,
  heating: 120,
  lighting: 30,
  doors: 60,
  furniture: 60,
  cleaning: 30,
};

const workKinds: ReadonlyArray<ChoiceOption<WorkKind>> = [
  { id: "electrical", label: "Electrical", icon: Zap },
  { id: "plumbing", label: "Plumbing", icon: Droplets },
  { id: "heating", label: "Heating and air", icon: Thermometer },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "doors", label: "Doors and locks", icon: DoorClosed },
  { id: "furniture", label: "Furniture", icon: Armchair },
  { id: "cleaning", label: "Cleaning", icon: SprayCan },
];

const workOptions: ReadonlyArray<ChoiceOption<WorkKind>> = workKinds.map((option) => ({
  ...option,
  meta: formatMinutes(workMinutes[option.id]),
}));

const accessOptions: ReadonlyArray<ChoiceOption<AccessNeed>> = [
  { id: "keycard", label: "Keycard" },
  { id: "ladder", label: "Ladder" },
  { id: "escort", label: "Escort" },
  { id: "afterHours", label: "After hours" },
];

const priorityOptions: ReadonlyArray<ChoiceOption<Priority>> = [
  { id: "normal", label: "Normal", description: "Joins the queue in the order it arrives." },
  {
    id: "urgent",
    label: "Urgent",
    icon: Siren,
    description: "Goes to the on-call technician now. Use it for a risk to people or property.",
  },
];

const technicians: ReadonlyArray<{ id: Technician; label: string; open: number }> = [
  { id: "amara", label: "Amara", open: 0 },
  { id: "jonas", label: "Jonas", open: 3 },
  { id: "mei", label: "Mei", open: 2 },
  { id: "tomas", label: "Tomas", open: 5 },
];

const technicianOptions: ReadonlyArray<ChoiceOption<Technician>> = technicians.map(
  (technician) => ({
    id: technician.id,
    label: technician.label,
    avatar: {},
    meta: `${technician.open} open`,
  }),
);

/** Page order of the fields, for the error summary. */
const fieldOrder = [
  { name: "name", id: "request-name" },
  { name: "email", id: "request-email" },
  { name: "phone", id: "request-phone" },
  { name: "building", id: "request-building" },
  { name: "floor", id: "request-floor" },
  { name: "room", id: "request-room" },
  { name: "work", id: "request-work" },
  { name: "note", id: "request-note" },
  { name: "access", id: "request-access" },
  { name: "priority", id: "request-priority" },
  { name: "dueBy", id: "request-due" },
  { name: "assignee", id: "request-assignee" },
] as const;

const requestNumber = "WO-2318";
const formId = "facilities-request";
function formatDueDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(appLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function labelOf<Value extends string>(
  options: ReadonlyArray<ChoiceOption<Value>>,
  id: Value,
): string {
  const option = options.find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error(`No option has the id "${id}".`);
  return option.label;
}

const emptyValues: RequestValues = {
  name: "",
  email: "",
  phone: "",
  building: null,
  floor: "",
  room: "",
  work: [],
  note: "",
  access: [],
  priority: "normal",
  dueBy: null,
  assignee: null,
};

/**
 * A long form built from the kit form parts: split sections, sized fields,
 * choice cards and chips, date quick picks, a live preview, an error summary,
 * and a sticky footer. `today` is an ISO date from the route loader, so the
 * server and the browser render the same days. `cancel` is a quiet LinkButton
 * back to the page that opened the form, because the kit knows no app routes.
 */
export function FormShowcase({
  today,
  cancel,
}: {
  readonly today: string;
  readonly cancel: ReactNode;
}) {
  const [sent, setSent] = useState<RequestValues | null>(null);
  const schema = useMemo(() => Schema.toStandardSchemaV1(requestSchema(today)), [today]);
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
        <PageHeader title="Report a building problem" />
        <Alert
          intent="success"
          announce="status"
          title={
            <>
              Request <Code>{requestNumber}</Code> is in the queue
            </>
          }
          actions={
            <Button
              onPress={() => {
                form.reset();
                setSent(null);
              }}
            >
              Report another problem
            </Button>
          }
        >
          {sent.assignee === null
            ? "The next free technician takes it. Updates go to "
            : `${labelOf(technicianOptions, sent.assignee)} has it. Updates go to `}
          {sent.email}.
        </Alert>
      </>
    );

  return (
    <>
      <PageHeader
        title="Report a building problem"
        description="Facilities fixes most problems within two working days."
      />
      <FormLayout
        id={formId}
        onSubmit={() => void form.handleSubmit()}
        aria-label="Report a building problem"
        preview={
          <form.Subscribe selector={(state) => state.values}>
            {(values) => <RequestPreview values={values} />}
          </form.Subscribe>
        }
        footer={
          <FormFooter
            summary={
              <form.Subscribe selector={(state) => state.values.work}>
                {(work) => <FooterSummary work={work} />}
              </form.Subscribe>
            }
          >
            {cancel}
            <Button intent="primary" type="submit">
              Send request
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
                title={`${errors.length} ${errors.length === 1 ? "thing" : "things"} to fix before you send the request`}
                errors={errors}
                submitCount={submissionAttempts}
              />
            );
          }}
        </form.Subscribe>

        <Section
          layout="split"
          title="You"
          description="Updates about the request go to your email. The technician calls only about urgent work."
        >
          <FieldRow>
            <form.Field name="name">
              {(field) => (
                <TextField
                  id="request-name"
                  label="Name"
                  autoFocus
                  autoComplete="name"
                  width="md"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <TextField
                  id="request-email"
                  label="Work email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. sam.lee@example.com"
                  width="lg"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
          </FieldRow>
          <form.Field name="phone">
            {(field) => (
              <TextField
                id="request-phone"
                label="Phone"
                isOptional
                type="tel"
                autoComplete="tel"
                placeholder="e.g. 020 7946 0321"
                width="sm"
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
          title="Where"
          description="The technician goes here first. A room number saves a search of the floor."
        >
          <form.Field name="building">
            {(field) => (
              <RadioGroup
                id="request-building"
                label="Building"
                appearance="chips"
                options={buildingOptions}
                noneOption={{ label: "Not sure" }}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <FieldRow>
            <form.Field name="floor">
              {(field) => (
                <TextField
                  id="request-floor"
                  label="Floor"
                  placeholder="e.g. 3"
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
                  id="request-room"
                  label="Room"
                  isOptional
                  placeholder="e.g. 3.14"
                  width="sm"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errorMessage={fieldError(field, hasSubmitAttempt)}
                />
              )}
            </form.Field>
          </FieldRow>
        </Section>

        <Section
          layout="split"
          title="What needs work"
          description="Pick each kind of work. The time estimate adds up from them, and the technician brings the right tools."
        >
          <form.Field name="work">
            {(field) => (
              <CheckboxGroup
                id="request-work"
                label="Kind of work"
                description="Pick at least one."
                options={workOptions}
                value={field.state.value}
                onChange={(next) => {
                  field.handleChange(next);
                  field.handleBlur();
                }}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <form.Field name="note">
            {(field) => (
              <TextField
                id="request-note"
                label="Note"
                isOptional
                multiline
                description="Anything the kinds of work do not say, such as when the room is free."
                placeholder="e.g. The radiator under the window leaks after 4 pm."
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <form.Field name="access">
            {(field) => (
              <CheckboxGroup
                id="request-access"
                label="Access needs"
                isOptional
                description="The technician brings or books these before the visit."
                appearance="chips"
                options={accessOptions}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
        </Section>

        <Section
          layout="split"
          title="When"
          description="Past the due day, the request shows as late on the facilities board."
        >
          <form.Field name="priority">
            {(field) => (
              <RadioGroup
                id="request-priority"
                label="Priority"
                appearance="cards"
                options={priorityOptions}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
          <form.Field name="dueBy">
            {(field) => (
              <DatePicker
                id="request-due"
                label="Due by"
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
          title="Who"
          description="Give it to a technician now, or leave it in the queue for whoever is free first."
        >
          <form.Field name="assignee">
            {(field) => (
              <RadioGroup
                id="request-assignee"
                label="Technician"
                appearance="chips"
                options={technicianOptions}
                noneOption={{ label: "Leave in queue" }}
                value={field.state.value}
                onChange={field.handleChange}
                errorMessage={fieldError(field, hasSubmitAttempt)}
              />
            )}
          </form.Field>
        </Section>
      </FormLayout>
    </>
  );
}

function estimateOf(work: ReadonlyArray<WorkKind>): number {
  return work.reduce((total, kind) => total + workMinutes[kind], 0);
}

function FooterSummary({ work }: { readonly work: ReadonlyArray<WorkKind> }) {
  return (
    <>
      <Code>{requestNumber}</Code>
      <span>
        {work.length === 0
          ? "No work picked yet"
          : `${work.length} ${work.length === 1 ? "kind" : "kinds"} of work, about ${formatMinutes(estimateOf(work))}`}
      </span>
    </>
  );
}

const empty = "—";

function RequestPreview({ values }: { readonly values: RequestValues }) {
  const location = [
    values.building === null ? undefined : labelOf(buildingOptions, values.building),
    values.floor.trim() === "" ? undefined : `floor ${values.floor.trim()}`,
    values.room.trim() === "" ? undefined : `room ${values.room.trim()}`,
  ].filter((part) => part !== undefined);
  return (
    <FormPreview
      label="Work order preview"
      description="The work order as the technician sees it on the facilities board."
    >
      <Card
        title={
          <span {...stylex.props(styles.previewTitle)}>
            {requestNumber}
            {values.priority === "urgent" ? (
              <Badge intent="danger" icon={<Siren />}>
                Urgent
              </Badge>
            ) : null}
          </span>
        }
        description={
          values.work.length === 0
            ? "No work picked yet"
            : values.work.map((kind) => labelOf(workOptions, kind)).join(", ")
        }
      >
        <DescriptionList
          items={[
            { term: "From", detail: values.name.trim() || empty },
            { term: "Where", detail: location.length === 0 ? empty : location.join(", ") },
            {
              term: "Due",
              detail: values.dueBy === null ? empty : formatDueDay(values.dueBy),
            },
            {
              term: "Technician",
              detail:
                values.assignee === null ? "Queue" : labelOf(technicianOptions, values.assignee),
            },
            {
              term: "Estimate",
              detail: values.work.length === 0 ? empty : formatMinutes(estimateOf(values.work)),
            },
          ]}
        />
        {values.access.length === 0 ? null : (
          <p {...stylex.props(styles.previewNote)}>
            Bring or book: {values.access.map((need) => labelOf(accessOptions, need)).join(", ")}.
          </p>
        )}
      </Card>
    </FormPreview>
  );
}

const styles = stylex.create({
  previewTitle: { display: "inline-flex", alignItems: "center", gap: space.sm },
  previewNote: { margin: 0, marginTop: space.md, fontSize: font.sm, color: color.textMuted },
});
