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

/**
 * Small icon button next to an identifier or URL. A check mark confirms the
 * copy in place, so no success toast is shown. A refused clipboard shows an error.
 */
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
