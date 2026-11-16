/**
 * A long form with a live preview: named sections of fields beside a preview of the thing that the form makes.
 *
 * @keywords long form, live preview, form preview, create form, registration form, badge preview, label preview, split sections, error summary, sticky footer
 * @components FormLayout, FormPreview, FormFooter, ErrorSummary, Section, TextField, RadioGroup, CheckboxGroup, DatePicker, Alert, LinkButton, Button
 * @notes form-preview, kit-form-preview, form-layout, kit-forms, internal-app-form-submit, form-errors, form-choices
 * @files src/features/lab/visits.ts, src/features/lab/ui/visitor-badge.tsx
 *
 * Use it when a form has more than about six fields and makes a thing that
 * people see or hold outside the app, such as a printed badge or a shipping
 * label. For a short task, use a `Dialog`.
 *
 * The preview shows a placeholder for each empty answer. The submit button
 * stays enabled. After a submit with errors, the error summary links to each
 * field. After a good submit, a success alert replaces the form.
 *
 * ## Adapt it
 * - Replace `src/features/lab/visits.ts` with the schema of the feature and
 *   `src/features/lab/ui/visitor-badge.tsx` with the preview of the thing,
 *   an app component under `src/features/<name>/ui/`.
 * - Choose the sections and the order of the fields. Give each section one
 *   sentence that says where its answers go.
 * - Size each field to the answer with `width`. Show a small closed set of
 *   choices as chips or cards, not in a dropdown.
 * - Call the mutation of the feature in `onSubmit` and name the new record in
 *   the alert: run `design read internal-app-form-submit`.
 */
import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { useMemo, useState } from "react";
import { fieldError, formBehavior, formErrors } from "@/components/helpers/form";
import {
  ErrorSummary,
  FormFooter,
  FormLayout,
  FormPreview,
} from "@/components/patterns/form-layout";
import { Alert } from "@/components/primitives/alert";
import { Button, LinkButton } from "@/components/primitives/button";
import { CheckboxGroup } from "@/components/primitives/checkbox";
import { DatePicker, dayQuickPicks } from "@/components/primitives/date-picker";
import { Page, PageHeader, Section } from "@/components/primitives/layout";
import { RadioGroup } from "@/components/primitives/radio-group";
import { TextField } from "@/components/primitives/text-field";
import { VisitorBadge } from "@/features/lab/ui/visitor-badge";
import {
  areaOptions,
  badgeNumber,
  badgeTypeOptions,
  emptyVisit,
  hostOptions,
  type VisitValues,
  validity,
  visitFieldOrder,
  visitSchema,
} from "@/features/lab/visits";

export const Route = createFileRoute("/_app/lab/preview-form")({
  staticData: { crumb: "Register a visitor" },
  // The quick picks and the visit day check need one today that is stable across SSR and hydration.
  loader: () => ({ today: new Date().toISOString().slice(0, 10) }),
  component: RegisterVisitorPage,
});

function RegisterVisitorPage() {
  const { today } = Route.useLoaderData();
  const schema = useMemo(() => Schema.toStandardSchemaV1(visitSchema(today)), [today]);
  const quickPicks = useMemo(() => dayQuickPicks({ today, count: 4 }), [today]);
  const [printed, setPrinted] = useState<VisitValues | null>(null);
  const form = useForm({
    ...formBehavior,
    defaultValues: emptyVisit,
    validators: { onDynamic: schema },
    onSubmit: ({ value, formApi }) => {
      setPrinted(value);
      formApi.reset();
    },
  });
  const submitted = useStore(form.store, (state) => state.submissionAttempts > 0);
  const header = (
    <PageHeader
      title="Register a visitor"
      description="Reception prints the badge before the visitor arrives."
    />
  );
  if (printed !== null)
    return (
      <Page>
        {header}
        <Alert
          intent="success"
          announce="status"
          title={`Badge ${badgeNumber} for ${printed.name} is printing at reception`}
          actions={<Button onPress={() => setPrinted(null)}>Register another visitor</Button>}
        >
          The visit details go to {printed.email}.
        </Alert>
      </Page>
    );

  return (
    <Page>
      {header}
      <FormLayout
        onSubmit={() => void form.handleSubmit()}
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
              <form.Subscribe selector={(state) => validity(state.values.areas)}>
                {(text) => <span>{text}</span>}
              </form.Subscribe>
            }
          >
            <LinkButton to="/lab" intent="ghost">
              Cancel
            </LinkButton>
            <Button intent="primary" type="submit">
              Print badge
            </Button>
          </FormFooter>
        }
      >
        <form.Subscribe
          selector={(state) => ({ fieldMeta: state.fieldMeta, attempts: state.submissionAttempts })}
        >
          {({ fieldMeta, attempts }) => (
            <ErrorSummary
              title="Fix these answers before you print the badge"
              errors={attempts === 0 ? [] : formErrors(fieldMeta, visitFieldOrder)}
              submitCount={attempts}
            />
          )}
        </form.Subscribe>
        <Section
          layout="split"
          title="Visitor"
          description="The name goes on the badge. The visit details go to the email."
        >
          <form.Field name="name">
            {(field) => (
              <TextField
                id="visit-name"
                label="Full name"
                autoComplete="off"
                width="md"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field, submitted)}
              />
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <TextField
                id="visit-email"
                label="Email"
                type="email"
                autoComplete="off"
                width="lg"
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
          title="Visit"
          description="The host gets a message when the visitor arrives. The badge works only on this day."
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
                errorMessage={fieldError(field, submitted)}
              />
            )}
          </form.Field>
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
                errorMessage={fieldError(field, submitted)}
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
                errorMessage={fieldError(field, submitted)}
              />
            )}
          </form.Field>
          <form.Field name="areas">
            {(field) => (
              <CheckboxGroup
                id="visit-areas"
                label="Areas"
                options={areaOptions}
                value={field.state.value}
                onChange={(next) => {
                  field.handleChange(next);
                  field.handleBlur();
                }}
                errorMessage={fieldError(field, submitted)}
              />
            )}
          </form.Field>
        </Section>
      </FormLayout>
    </Page>
  );
}
