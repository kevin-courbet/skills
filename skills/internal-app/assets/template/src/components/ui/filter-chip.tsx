import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";
import { Button } from "react-aria-components";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";

export interface FilterChipProps {
  /** Filter name, such as "Status". */
  readonly label: string;
  /** Selected value, such as "Failed". */
  readonly value: string;
  readonly onRemove: () => void;
}

/**
 * An active filter in a list toolbar. The chip names the filter and its value;
 * its button removes the filter. Render one chip for each filter in the URL.
 */
export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span {...stylex.props(styles.chip)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <span {...stylex.props(styles.value)}>{value}</span>
      <Button
        aria-label={`Remove filter ${label}: ${value}`}
        onPress={onRemove}
        {...stylex.props(styles.remove)}
      >
        <X aria-hidden {...stylex.props(styles.icon)} />
      </Button>
    </span>
  );
}

const styles = stylex.create({
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    height: "1.5rem",
    paddingInlineStart: space.sm,
    paddingInlineEnd: "2px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.accentBorder,
    borderRadius: radius.md,
    backgroundColor: color.accentMuted,
    color: color.accentText,
    fontSize: font.sm,
    whiteSpace: "nowrap",
  },
  label: { opacity: "0.8" },
  value: { fontWeight: font.medium },
  remove: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.25rem",
    height: "1.25rem",
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.accentBorder },
    color: "inherit",
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  icon: { width: size.iconSm, height: size.iconSm },
});
