/**
 * An icon button that copies a value, such as an identifier or a URL, to the clipboard.
 *
 * @layer primitive
 * @keywords copy button, copy to clipboard, clipboard, copy id, copy url, copy link
 * @related Identifier, TextField, Layout, CodeBlock, Toaster
 * @notes ux-writing, kit-writing
 *
 * Put it next to a value that people paste elsewhere. For a record id, a SHA,
 * or a host, use `Identifier`, which already holds a `CopyButton`. A
 * `CodeBlock` with a `title` has its own copy button.
 *
 * ## Behavior
 * - A check mark confirms the copy for 1.5 seconds, and the accessible name
 *   says "copied". So a copy needs no success toast.
 * - A refused clipboard shows an error toast.
 *
 * ## Rules
 * - In a `TextField`, put it in `suffix`.
 *
 * ## Example
 * ```tsx
 * <Code>{deployment.url}</Code>
 * <CopyButton value={deployment.url} label="Copy deployment URL" />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { color, motion, radius, size } from "@/styles/tokens.stylex";
import { toast } from "./toaster";

export interface CopyButtonProps {
  /** The exact text placed on the clipboard. */
  readonly value: string;
  /** What is copied, for the accessible name: "Copy deployment ID". */
  readonly label: string;
}

const confirmationMs = 1500;

export function CopyButton({ value, label }: CopyButtonProps) {
  const [isCopied, setCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setCopied(false), confirmationMs);
    return () => window.clearTimeout(timer);
  }, [isCopied]);
  const Icon = isCopied ? Check : Copy;
  return (
    <Button
      aria-label={isCopied ? `${label}: copied` : label}
      onPress={() => {
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          (error: unknown) =>
            toast.error("The value could not be copied", {
              description:
                error instanceof Error ? error.message : "The browser refused clipboard access.",
            }),
        );
      }}
      {...stylex.props(styles.button, isCopied && styles.copied)}
    >
      <Icon aria-hidden {...stylex.props(styles.icon)} />
    </Button>
  );
}

const styles = stylex.create({
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: { default: color.textMuted, ":hover": color.text },
    cursor: "pointer",
    transitionProperty: "color, background-color",
    transitionDuration: motion.fast,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  copied: { color: { default: color.success, ":hover": color.success } },
  icon: { width: size.iconSm, height: size.iconSm },
});
