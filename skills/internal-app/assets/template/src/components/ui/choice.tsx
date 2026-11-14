import * as stylex from "@stylexjs/stylex";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";
import { Avatar } from "./avatar";

/**
 * How a RadioGroup or a CheckboxGroup shows its options.
 *
 * - `list`: small marks in a column, for a short list in a dense panel or a dialog.
 * - `cards`: large tiles with a description, for a few choices that people compare,
 *   such as a priority or a plan.
 * - `chips`: compact pills in a wrapping row, for a short closed list with short
 *   labels, such as a category, a day, or a person.
 */
export type ChoiceAppearance = "list" | "cards" | "chips";

export interface ChoiceOption<Value extends string> {
  readonly id: Value;
  readonly label: string;
  /** A sentence under the label, in `list` and `cards`. Chips show no description. */
  readonly description?: string;
  /**
   * Secondary fact that helps the choice, such as a price, a duration, or the
   * open work of a person ("3 open"). Cards put it at the end; chips put it
   * after the label in quiet text.
   */
  readonly meta?: ReactNode;
  /** Icon before the label, in `cards` and `chips`. */
  readonly icon?: LucideIcon;
  /**
   * Shows the avatar of the person that the label names, in `cards` and
   * `chips`. The initials show when `src` is missing.
   */
  readonly avatar?: { readonly src?: string };
  readonly isDisabled?: boolean;
}

/**
 * An explicit choice for "no value", such as "Decide later" or "Not sure". It
 * comes last and its value is null. Use it instead of a choice that people
 * clear by pressing it again, which nobody discovers.
 */
export interface ChoiceNoneOption {
  readonly label: string;
  readonly description?: string;
}

/** Throws on option fields that the appearance cannot show, so no option data is lost. */
export function assertChoiceOptions<Value extends string>(
  component: string,
  appearance: ChoiceAppearance,
  options: ReadonlyArray<ChoiceOption<Value>>,
): void {
  for (const option of options) {
    if (option.icon !== undefined && option.avatar !== undefined)
      throw new Error(`${component}: option "${option.id}" has both an icon and an avatar.`);
    if (appearance === "chips" && option.description !== undefined)
      throw new Error(
        `${component}: chips show no description, but option "${option.id}" has one. Use cards, or move the fact to meta.`,
      );
    if (appearance === "list" && (option.icon !== undefined || option.avatar !== undefined))
      throw new Error(
        `${component}: the list appearance shows no icon or avatar, but option "${option.id}" has one. Use cards or chips.`,
      );
  }
}

/** The leading icon or avatar of a card or a chip. */
export function ChoiceLeading<Value extends string>({
  option,
  isSelected,
  placement,
}: {
  readonly option: ChoiceOption<Value>;
  readonly isSelected: boolean;
  readonly placement: "card" | "chip";
}) {
  const Icon = option.icon;
  if (Icon !== undefined)
    return (
      <Icon
        aria-hidden
        {...stylex.props(
          choice.icon,
          placement === "card" && choice.cardIcon,
          isSelected && choice.iconSelected,
        )}
      />
    );
  if (option.avatar !== undefined)
    return (
      // The label names the person, so the avatar is decoration here.
      <span aria-hidden {...stylex.props(choice.avatar)}>
        <Avatar name={option.label} src={option.avatar.src} size="sm" />
      </span>
    );
  return null;
}

/**
 * Shared look of choice cards and chips. Selection changes the surface, the
 * border weight, and the text color, so it never depends on hue alone. An
 * invalid group marks the borders of the options that are not selected.
 */
export const choice = stylex.create({
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
    gap: space.sm,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: space.sm },
  itemRoot: { display: "flex", minWidth: 0, cursor: "pointer", outlineStyle: "none" },
  base: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: { default: color.border, ":hover": color.borderStrong },
    backgroundColor: color.raised,
    color: color.text,
    transitionProperty: "background-color, border-color, box-shadow, color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  selected: {
    backgroundColor: color.accentMuted,
    borderColor: { default: color.accentBorder, ":hover": color.accentBorder },
    // The inset ring doubles the border without moving the content.
    boxShadow: `inset 0 0 0 1px ${color.accentBorder}`,
  },
  invalid: { borderColor: { default: color.dangerBorder, ":hover": color.danger } },
  focused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  disabled: { opacity: "0.5", cursor: "not-allowed" },
  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.md,
    width: "100%",
    minHeight: size.controlLg,
    paddingBlock: space.md,
    paddingInline: space.lg,
    fontSize: font.md,
    borderRadius: radius.lg,
  },
  cardText: { display: "flex", flexDirection: "column", gap: space.xs, flex: "1", minWidth: 0 },
  cardLabel: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
  },
  cardDescription: {
    fontSize: font.sm,
    lineHeight: font.leadingNormal,
    color: color.textMuted,
  },
  cardMeta: {
    flexShrink: 0,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    lineHeight: font.leadingTight,
  },
  /** Centers a card's radio or checkbox mark on the first line of the label in every density. */
  cardMark: { lineHeight: font.leadingTight, marginTop: `calc((1lh - ${size.toggle}) / 2)` },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    whiteSpace: "nowrap",
    borderRadius: radius.full,
    fontWeight: font.medium,
  },
  chipSelected: { color: color.accentText },
  chipMeta: {
    fontWeight: "normal",
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  icon: { flexShrink: 0, width: size.iconSm, height: size.iconSm, color: color.textMuted },
  // A card label can wrap, so the icon stays centered on the first line instead of the whole label.
  cardIcon: { alignSelf: "flex-start", marginBlock: `calc((1lh - ${size.iconSm}) / 2)` },
  iconSelected: { color: color.accentText },
  avatar: { display: "inline-flex", marginInlineStart: `calc(-1 * ${space.xs})` },
});

/** Chip heights follow the control size of the row, so chips line up with fields and buttons. */
export const chipSizes = stylex.create({
  sm: { height: size.controlSm, paddingInline: space.md, fontSize: font.sm },
  md: { height: size.controlMd, paddingInline: space.lg, fontSize: font.md },
});
