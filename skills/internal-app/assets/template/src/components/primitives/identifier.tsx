/**
 * A monospaced record ID, commit SHA, or host with a copy button.
 *
 * @layer primitive
 * @keywords identifier, record id, id with copy, commit sha, hash, host name, copy id, monospace id
 * @related CopyButton, Layout, DataTable, Sheet
 * @notes internal-app-writing, typography
 *
 * Use it for a value that people paste elsewhere. Do not use it for inline
 * code or a command: use `Code` from `Layout`. Do not use it for a long
 * payload: use `CodeBlock`.
 *
 * ## Behavior
 * - The copy button copies the full `value`, also when `display` shows a
 *   short form. The full value shows on hover.
 * - Long values end with an ellipsis instead of wrapping.
 *
 * ## Example
 * ```tsx
 * <Identifier value={deployment.sha} display={deployment.sha.slice(0, 7)} label="commit SHA" />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "@/styles/tokens.stylex";
import { CopyButton } from "./copy-button";

export interface IdentifierProps {
  /** The full value. It is what the copy button puts on the clipboard. */
  readonly value: string;
  /** What the value is, for the copy button name: "deployment ID" gives "Copy deployment ID". */
  readonly label: string;
  /** Shorter text to show, such as the first 7 characters of a commit SHA. */
  readonly display?: string;
  /** `sm` for table cells and metadata, `md` for body text, `lg` for a detail page title. */
  readonly size?: "sm" | "md" | "lg";
  /** Quieter text for an identifier next to a primary name. */
  readonly muted?: boolean;
  /** Set to false where people never paste the value elsewhere. */
  readonly copyable?: boolean;
}

export function Identifier({
  value,
  label,
  display,
  size = "md",
  muted = false,
  copyable = true,
}: IdentifierProps) {
  return (
    <span {...stylex.props(styles.root)}>
      <span
        title={display === undefined ? undefined : value}
        {...stylex.props(styles.text, sizes[size], muted && styles.muted)}
      >
        {display ?? value}
      </span>
      {copyable ? <CopyButton value={value} label={`Copy ${label}`} /> : null}
    </span>
  );
}

const styles = stylex.create({
  root: { display: "inline-flex", alignItems: "center", gap: space.xs, minWidth: 0 },
  text: {
    fontFamily: font.mono,
    color: color.text,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontVariantLigatures: "none",
  },
  muted: { color: color.textMuted },
});

const sizes = stylex.create({
  sm: { fontSize: font.sm },
  md: { fontSize: font.md },
  lg: { fontSize: font.xxl, fontWeight: font.semibold, letterSpacing: font.trackingTight },
});
