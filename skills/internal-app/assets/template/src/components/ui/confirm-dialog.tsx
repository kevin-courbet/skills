import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useState } from "react";
import { failureMessage } from "@/lib/server-result";
import { color, font, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { Dialog } from "./dialog";

export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Names the action and the object: "Roll back production to dpl_rxt8gA84n?" */
  readonly title: string;
  /**
   * States the result in one or two sentences, with the exact objects:
   * "app.example.com serves dpl_rxt8gA84n again. Automatic promotion pauses."
   */
  readonly description: ReactNode;
  /**
   * Each further effect as one short line, such as "1 staged deployment
   * stays staged". Use it when the action has more than one effect.
   */
  readonly consequences?: ReadonlyArray<ReactNode>;
  /** A choice the action needs, such as a RadioGroup of rollback targets. */
  readonly children?: ReactNode;
  /** The verb and the object, repeated on the button: "Roll back production". */
  readonly confirmLabel: string;
  /**
   * `danger` for destructive or irreversible actions, `primary` for
   * high-impact actions that people can undo, such as a promotion.
   */
  readonly intent?: "danger" | "primary";
  /** Keeps the confirm button disabled until the choice in `children` is complete. */
  readonly isConfirmDisabled?: boolean;
  /** Runs the action. A rejection keeps the dialog open and shows the failure. */
  readonly onConfirm: () => Promise<void>;
}

/**
 * Confirmation for irreversible or high-impact actions. The copy names the
 * exact object and every effect; the confirm button repeats the verb.
 */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  consequences = [],
  children,
  confirmLabel,
  intent = "danger",
  isConfirmDisabled = false,
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

  const hasBody = consequences.length > 0 || children !== undefined || failure !== undefined;
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
          <Button
            intent={intent}
            onPress={() => void confirm()}
            isDisabled={isPending || isConfirmDisabled}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {hasBody ? (
        <div {...stylex.props(styles.body)}>
          {consequences.length > 0 ? (
            <ul {...stylex.props(styles.consequences)}>
              {consequences.map((consequence, index) => (
                <li key={index} {...stylex.props(styles.consequence)}>
                  {consequence}
                </li>
              ))}
            </ul>
          ) : null}
          {children}
          {failure ? (
            <p role="alert" {...stylex.props(styles.failure)}>
              {failure}
            </p>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}

const styles = stylex.create({
  body: { display: "flex", flexDirection: "column", gap: space.md },
  consequences: {
    margin: 0,
    paddingInlineStart: space.lg,
    listStyleType: "disc",
    fontSize: font.md,
    color: color.text,
  },
  consequence: { paddingInlineStart: "2px", marginTop: { default: space.xs, ":first-child": 0 } },
  failure: { margin: 0, fontSize: font.md, color: color.danger },
});
