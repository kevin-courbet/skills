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

/**
 * Monospaced identifier, hash, or host with a copy button. Use it for record
 * IDs, commit SHAs, and URLs that people paste elsewhere. Use Code for inline
 * code or command text.
 */
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
