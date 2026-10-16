import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { color, font, radius, space } from "@/styles/tokens.stylex";

/**  sits inline in a metadata line, next to 12px text. */
export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps {
  /** Full name. It is the accessible name and the source of the initials. */
  readonly name: string;
  /** Image URL. The initials show when it is missing or fails to load. */
  readonly src?: string;
  readonly size?: AvatarSize;
}

/** A person or service account. Pair it with the name in text where the name matters. */
export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src !== undefined && failedSrc !== src;
  return (
    <span role="img" aria-label={name} title={name} {...stylex.props(styles.avatar, sizes[size])}>
      {showImage ? (
        <img src={src} alt="" onError={() => setFailedSrc(src)} {...stylex.props(styles.image)} />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}

export interface AvatarGroupProps {
  /** Names the group, such as "Owners". */
  readonly label: string;
  readonly people: ReadonlyArray<{ readonly name: string; readonly src?: string }>;
  /** Avatars shown before the rest collapse into a count. */
  readonly max?: number;
  readonly size?: AvatarSize;
}

/** Overlapping avatars for a team or the people on a record. */
export function AvatarGroup({ label, people, max = 4, size = "sm" }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.slice(max);
  return (
    <span role="group" aria-label={label} {...stylex.props(styles.group)}>
      {shown.map((person) => (
        <span key={person.name} {...stylex.props(styles.groupItem)}>
          <Avatar name={person.name} src={person.src} size={size} />
        </span>
      ))}
      {rest.length > 0 ? (
        <span
          role="img"
          aria-label={`and ${rest.length} more: ${rest.map((person) => person.name).join(", ")}`}
          title={rest.map((person) => person.name).join(", ")}
          {...stylex.props(styles.avatar, styles.overflow, sizes[size], styles.groupItem)}
        >
          <span aria-hidden>+{rest.length}</span>
        </span>
      ) : null}
    </span>
  );
}

function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

const styles = stylex.create({
  avatar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: color.subtle,
    color: color.textMuted,
    fontWeight: font.medium,
    lineHeight: "1",
    userSelect: "none",
    boxShadow: `inset 0 0 0 1px ${color.borderSubtle}`,
  },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  overflow: { backgroundColor: color.inset, fontVariantNumeric: "tabular-nums" },
  group: { display: "inline-flex", alignItems: "center", paddingInlineStart: space.xs },
  groupItem: {
    display: "inline-flex",
    marginInlineStart: `calc(-1 * ${space.xs})`,
    borderRadius: radius.full,
    boxShadow: `0 0 0 2px ${color.raised}`,
  },
});

const sizes = stylex.create({
  // The initials scale with the circle; 0.8 of the smallest font token fits two letters.
  xs: { width: "1.125rem", height: "1.125rem", fontSize: `calc(${font.xs} * 0.8)` },
  sm: { width: "1.5rem", height: "1.5rem", fontSize: font.xs },
  md: { width: "2rem", height: "2rem", fontSize: font.sm },
  lg: { width: "2.5rem", height: "2.5rem", fontSize: font.md },
});
