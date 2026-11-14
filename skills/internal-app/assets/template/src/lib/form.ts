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
