import * as stylex from "@stylexjs/stylex";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { NumberField } from "@/components/ui/number-field";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { fieldError } from "@/lib/form";
import { failureMessage, unwrap } from "@/lib/server-result";
import { color, font, media, space } from "@/styles/tokens.stylex";
import { createItemFn, itemKeys } from "../api";
import { CreateItem, type ItemStatus } from "../schemas";

const createItemSchema = Schema.toStandardSchemaV1(CreateItem);
const formId = "create-item-form";

const statusOptions: ReadonlyArray<{ id: ItemStatus; label: string }> = [
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "archived", label: "Archived" },
];

export function CreateItemDialog() {
  const [isOpen, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (input: CreateItem) => createItemFn({ data: input }).then(unwrap),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemKeys.all }),
  });

  const form = useForm({
    defaultValues: { name: "", owner: "", status: "active" as ItemStatus, amount: 0 },
    validators: { onSubmit: createItemSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);
      try {
        await create.mutateAsync(value);
        form.reset();
        setOpen(false);
      } catch (error) {
        setSubmitError(failureMessage(error));
      }
    },
  });

  return (
    <>
      <Button intent="primary" onPress={() => setOpen(true)}>
        New item
      </Button>
      <Dialog
        isOpen={isOpen}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            form.reset();
            setSubmitError(undefined);
          }
        }}
        title="New item"
        description="Items appear in the list as soon as they are saved."
        actions={(close) => (
          <>
            <Button onPress={close}>Cancel</Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  intent="primary"
                  type="submit"
                  form={formId}
                  isDisabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Saving" : "Create item"}
                </Button>
              )}
            </form.Subscribe>
          </>
        )}
      >
        <form
          id={formId}
          {...stylex.props(styles.form)}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <TextField
                label="Name"
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field name="owner">
            {(field) => (
              <TextField
                label="Owner"
                description="Team that maintains the item."
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errorMessage={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <div {...stylex.props(styles.row)}>
            <form.Field name="status">
              {(field) => (
                <Select
                  label="Status"
                  options={statusOptions}
                  value={field.state.value}
                  onChange={field.handleChange}
                  errorMessage={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
            <form.Field name="amount">
              {(field) => (
                <NumberField
                  label="Amount"
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  minValue={0}
                  formatOptions={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
                  errorMessage={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
          </div>
          {submitError ? (
            <p role="alert" {...stylex.props(styles.submitError)}>
              {submitError}
            </p>
          ) : null}
        </form>
      </Dialog>
    </>
  );
}

const styles = stylex.create({
  form: { display: "flex", flexDirection: "column", gap: space.lg },
  row: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.sm]: "1fr 1fr" },
    gap: space.md,
  },
  submitError: { fontSize: font.sm, color: color.danger },
});
