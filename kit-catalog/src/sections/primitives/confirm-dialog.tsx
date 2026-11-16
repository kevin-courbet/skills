import { type ReactNode, useState } from "react";
import { Button } from "@/components/primitives/button";
import { ConfirmDialog, type ConfirmDialogProps } from "@/components/primitives/confirm-dialog";
import { RadioGroup } from "@/components/primitives/radio-group";
import type { ChoiceOption } from "@/components/helpers/choice";
import { ConflictError } from "@/lib/wire-errors";
import { defineSection, Labeled, Row } from "../../specimen";

/** A short wait, so that the reviewer sees the disabled buttons while `onConfirm` runs. */
function settleAfter(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type RefundTarget = "card" | "credit";

const refundTargets: ReadonlyArray<ChoiceOption<RefundTarget>> = [
  {
    id: "card",
    label: "Card that paid the deposit",
    description: "Visa ending in 4417. The bank shows the refund in 3 to 5 days.",
  },
  {
    id: "credit",
    label: "Store credit",
    description: "Margaux can use it at once on her next work order.",
  },
];

type ConfirmSpecimenProps = Omit<ConfirmDialogProps, "isOpen" | "onOpenChange"> & {
  /** The label of the button that opens the dialog. */
  readonly trigger: string;
};

function ConfirmSpecimen({ trigger, ...props }: ConfirmSpecimenProps) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Row>
        <Button onPress={() => setOpen(true)}>{trigger}</Button>
      </Row>
      <ConfirmDialog {...props} isOpen={isOpen} onOpenChange={setOpen} />
    </>
  );
}

function RefundChoice() {
  const [isOpen, setOpen] = useState(false);
  const [target, setTarget] = useState<RefundTarget | null>(null);
  return (
    <>
      <Row>
        <Button onPress={() => setOpen(true)}>Refund deposit</Button>
      </Row>
      <ConfirmDialog
        isOpen={isOpen}
        onOpenChange={(next) => {
          if (!next) setTarget(null);
          setOpen(next);
        }}
        title="Refund the €40.00 deposit of WO-1042?"
        description="The deposit goes back to Margaux Lefèvre. You cannot undo a refund."
        confirmLabel="Refund deposit"
        isConfirmDisabled={target === null}
        onConfirm={() => settleAfter(900)}
      >
        <RadioGroup
          label="Refund to"
          appearance="cards"
          options={refundTargets}
          value={target}
          onChange={setTarget}
          isRequired
        />
      </ConfirmDialog>
    </>
  );
}

const cancelConsequences: ReadonlyArray<ReactNode> = [
  "2 reserved parts go back to stock: 1 chain and 1 rear brake cable",
  "The €40.00 deposit is refunded to the card that paid it",
  "Margaux Lefèvre gets an email that the work order is cancelled",
];

export default defineSection({
  component: "ConfirmDialog",
  specimens: [
    {
      title: "Destructive action",
      note: "Only the confirm button is danger. The button that opens the dialog is not.",
      render: () => (
        <ConfirmSpecimen
          trigger="Delete work order"
          title="Delete WO-1042?"
          description="The work order, its 3 photos, and its mechanic notes are deleted. You cannot undo this."
          confirmLabel="Delete work order"
          onConfirm={() => settleAfter(900)}
        />
      ),
    },
    {
      title: "Consequences",
      note: "Each further effect gets one short line. A bulk action names the count in the title and on the button.",
      render: () => (
        <Row>
          <Labeled label="consequences">
            <ConfirmSpecimen
              trigger="Cancel work order"
              title="Cancel WO-1042?"
              description="The work order leaves the queue of Inès Garnier and shows as cancelled."
              consequences={cancelConsequences}
              confirmLabel="Cancel work order"
              onConfirm={() => settleAfter(900)}
            />
          </Labeled>
          <Labeled label="bulk action">
            <ConfirmSpecimen
              trigger="Void 3 invoices"
              title="Void 3 invoices?"
              description="INV-2287, INV-2289, and INV-2291 are voided. The customers cannot pay them."
              consequences={["The totals of October drop by €412.00"]}
              confirmLabel="Void 3 invoices"
              onConfirm={() => settleAfter(900)}
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Primary intent",
      note: "Use primary for a high-impact action that people can undo.",
      render: () => (
        <ConfirmSpecimen
          trigger="Pause online booking"
          title="Pause online booking?"
          description="Customers cannot book a service visit on the website until you resume booking. Booked visits stay in the schedule."
          confirmLabel="Pause online booking"
          intent="primary"
          onConfirm={() => settleAfter(900)}
        />
      ),
    },
    {
      title: "Choice before confirm",
      note: "isConfirmDisabled keeps the confirm button disabled until people choose an option.",
      render: () => <RefundChoice />,
    },
    {
      title: "Failure",
      note: "When onConfirm rejects, the dialog stays open and shows the failure under the content.",
      render: () => (
        <ConfirmSpecimen
          trigger="Delete customer"
          title="Delete Margaux Lefèvre?"
          description="The customer and her bike records are deleted. You cannot undo this."
          confirmLabel="Delete customer"
          onConfirm={async () => {
            await settleAfter(900);
            throw new ConflictError({
              message: "Margaux Lefèvre has an open work order, WO-1042. Close it first.",
            });
          }}
        />
      ),
    },
  ],
});
