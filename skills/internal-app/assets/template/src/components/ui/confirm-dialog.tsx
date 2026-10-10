import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { failureMessage } from "@/lib/server-result";
import { color, font } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { Dialog } from "./dialog";

export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Names the action and the object: "Delete Workspace 12?" */
  readonly title: string;
  /** States the consequence: "The item and its history are removed. This cannot be undone." */
  readonly description: string;
  /** The verb, repeated on the button: "Delete item". */
  readonly confirmLabel: string;
  readonly intent?: "danger" | "primary";
  /** Runs the action. A rejection keeps the dialog open and shows the failure. */
  readonly onConfirm: () => Promise<void>;
}

/** Confirmation for irreversible or high-impact actions. */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  intent = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [isPending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | undefined>(undefined);

  async function confirm() {
    setPending(true);
    setFailure(undefined);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      setFailure(failureMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(next) => {
        if (!next) setFailure(undefined);
        onOpenChange(next);
      }}
      size="sm"
      title={title}
      description={description}
      actions={(close) => (
        <>
          <Button onPress={close} isDisabled={isPending}>
            Cancel
          </Button>
          <Button intent={intent} onPress={() => void confirm()} isDisabled={isPending}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {failure ? (
        <p role="alert" {...stylex.props(styles.failure)}>
          {failure}
        </p>
      ) : null}
    </Dialog>
  );
}

const styles = stylex.create({
  failure: { fontSize: font.md, color: color.danger },
});
