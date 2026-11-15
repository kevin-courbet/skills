/**
 * The TanStack Form options and the message helpers that every kit form uses.
 *
 * @layer helper
 * @keywords form validation, field error, error message, error summary entries, tanstack form, useForm, formBehavior, submit attempt
 * @related FormLayout, TextField, RadioGroup, Checkbox
 * @notes form-errors, form-fields, internal-app-forms
 *
 * Use these helpers in each form that uses TanStack Form `useForm` and a
 * schema. Do not use them for a single control that saves at once, such as a
 * `Switch` in a settings row: that control has no submit.
 *
 * ## Behavior
 * - The submit stays enabled when the form is invalid. A submit attempt
 *   shows every message and the ErrorSummary.
 * - A field shows its message after a change and a blur, or after a submit
 *   attempt. See `fieldError`.
 *
 * ## Rules
 * - Do not disable the submit button while the form is invalid.
 * - Give `fieldError` to the `errorMessage` of each field. Do not write a
 *   different rule for when a message shows.
 * - Call `formErrors` only after a submit attempt. Give each entry the `id`
 *   of its field, so that the ErrorSummary link moves the focus to it.
 *
 * ## Example
 * ```tsx
 * const form = useForm({
 *   ...formBehavior,
 *   defaultValues,
 *   validators: { onDynamic: schema },
 *   onSubmit: ({ value }) => save(value),
 * });
 * const hasSubmitAttempt = useStore(form.store, (state) => state.submissionAttempts > 0);
 *
 * <form.Field name="title">
 *   {(field) => (
 *     <TextField
 *       id="title"
 *       label="Title"
 *       value={field.state.value}
 *       onChange={field.handleChange}
 *       onBlur={field.handleBlur}
 *       errorMessage={fieldError(field, hasSubmitAttempt)}
 *     />
 *   )}
 * </form.Field>
 *
 * const errors = hasSubmitAttempt ? formErrors(fieldMeta, [{ name: "title", id: "title" }]) : [];
 * ```
 */
import { revalidateLogic } from "@tanstack/react-form";
import type { FormError } from "@/components/ui/form-layout";

/**
 * Options for every `useForm`: spread them first, then pass the schema as
 * `validators: { onDynamic: schema }`. The schema runs on every change, so
 * the errors of every field always match the answers. fieldError decides
 * when a message shows. A form that validates only on blur keeps the errors
 * of the fields that people did not visit yet, and a submit then reports
 * those old errors without a new check.
 */
export const formBehavior = {
  validationLogic: revalidateLogic({ mode: "change", modeAfterSubmission: "change" }),
  canSubmitWhenInvalid: true,
} as const;

interface ValidatedField {
  readonly state: {
    readonly meta: {
      readonly errors: ReadonlyArray<unknown>;
      readonly isBlurred: boolean;
      readonly isDirty: boolean;
    };
  };
}

/**
 * The message that a TanStack Form field shows. A form-level schema checks
 * every field at once, so a field that people did not visit yet already has
 * errors. A message shows after people change the field and leave it, or
 * after a submit attempt. A field that people pass with Tab and leave empty
 * shows nothing until they submit, because they may come back to it.
 *
 * Read `hasSubmitAttempt` in the form component with
 * `useStore(form.store, (state) => state.submissionAttempts > 0)`. A field
 * renders again only when its own state changes, so it must get the value
 * from its parent.
 */
export function fieldError(field: ValidatedField, hasSubmitAttempt: boolean): string | undefined {
  const { isBlurred, isDirty, errors } = field.state.meta;
  if (!(isBlurred && isDirty) && !hasSubmitAttempt) return undefined;
  return firstMessage(errors);
}

/**
 * The entries of the ErrorSummary: the first message of each field in
 * `fields`, in their order. List the fields in the order of the page.
 */
export function formErrors<Name extends string>(
  fieldMeta: Partial<Record<Name, { readonly errors: ReadonlyArray<unknown> } | undefined>>,
  fields: ReadonlyArray<{ readonly name: Name; readonly id: string }>,
): ReadonlyArray<FormError> {
  return fields.flatMap(({ name, id }) => {
    const message = firstMessage(fieldMeta[name]?.errors ?? []);
    return message === undefined ? [] : [{ fieldId: id, message }];
  });
}

// Standard Schema validators report issue objects; custom validators report strings.
function firstMessage(errors: ReadonlyArray<unknown>): string | undefined {
  for (const error of errors) {
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null) {
      const message: unknown = Reflect.get(error, "message");
      if (typeof message === "string") return message;
    }
  }
  return undefined;
}
