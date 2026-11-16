// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A button that stays pressed or not pressed, and the change applies at once.
 *
 * @layer primitive
 * @keywords toggle button, pressed button, on off button, icon toggle, wrap lines toggle, pin button, star button, follow button, mute button
 * @related ToggleGroup, Switch, Button, SegmentedControl, CodeBlock, ControlSize
 * @notes form-choices, hierarchy, density, internal-app-composition
 *
 * Use it for one view option of a toolbar or a header, such as "Wrap long
 * lines" or "Show archived". Do not use it for a setting with an on and off
 * label, such as "Email alerts": use `Switch`. For several options of the same
 * kind, use `ToggleGroup`. For an action that does not stay pressed, use
 * `Button`.
 *
 * ## Behavior
 * - Space, Enter, a click, or a tap toggles it. Screen readers hear the
 *   pressed state from `aria-pressed`.
 * - A pressed button with text and no `icon` shows a check mark, so the state
 *   does not depend on color only.
 * - The height follows the control size of its row, so it has no `size` prop.
 * - It gives a little under the pointer. Under reduced motion, it stays still.
 *
 * ## Rules
 * - Write the label as the option, such as "Wrap long lines". Do not change
 *   the label when the state changes.
 * - Use `iconOnly` only for an icon that people know. The label becomes the
 *   accessible name.
 * - Use `ghost` in a header or a dense toolbar, and `secondary` elsewhere.
 *
 * ## Example
 * ```tsx
 * <ToggleButton
 *   label="Show archived"
 *   icon={Archive}
 *   isSelected={search.archived}
 *   onChange={(archived) => navigate({ search: (prev) => ({ ...prev, archived }) })}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Check, type LucideIcon } from "lucide-react";
import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";
import { useControlSize } from "@/components/helpers/control-size";

/** `secondary` has a border and a raised surface. `ghost` has no border until it is pressed. */
export type ToggleButtonIntent = "secondary" | "ghost";

export interface ToggleButtonProps extends Omit<
  AriaToggleButtonProps,
  "className" | "style" | "children" | "aria-label"
> {
  /** The option, such as "Wrap long lines". With `iconOnly`, it becomes the accessible name. */
  readonly label: string;
  /** Lucide icon before the label. It replaces the check mark of a pressed button. */
  readonly icon?: LucideIcon;
  /** Shows only the icon. Give an `icon`. */
  readonly iconOnly?: boolean;
  /** `secondary` by default. Use `ghost` in a header or a dense toolbar. */
  readonly intent?: ToggleButtonIntent;
  /** Layout overrides, applied last. */
  readonly style?: StyleXStyles;
}

export function ToggleButton({
  label,
  icon: Icon,
  iconOnly = false,
  intent = "secondary",
  style,
  ...props
}: ToggleButtonProps) {
  if (iconOnly && Icon === undefined)
    throw new Error(
      `ToggleButton "${label}" has iconOnly but no icon. Give an icon or remove iconOnly.`,
    );
  const controlSize = useControlSize();
  return (
    <AriaToggleButton
      {...props}
      aria-label={iconOnly ? label : undefined}
      {...renderStyles<{ isSelected: boolean; isDisabled: boolean }>((state) => [
        styles.base,
        intents[intent],
        sizes[controlSize],
        iconOnly && squares[controlSize],
        state.isSelected && selectedIntents[intent],
        state.isDisabled && styles.disabled,
        style,
      ])}
    >
      {({ isSelected }) => (
        <>
          {Icon === undefined && isSelected ? (
            <Check aria-hidden {...stylex.props(styles.icon)} />
          ) : null}
          {Icon === undefined ? null : <Icon aria-hidden {...stylex.props(styles.icon)} />}
          {iconOnly ? null : label}
        </>
      )}
    </AriaToggleButton>
  );
}

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    flexShrink: 0,
    whiteSpace: "nowrap",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: radius.md,
    fontWeight: font.medium,
    lineHeight: "1",
    cursor: "pointer",
    userSelect: "none",
    transitionProperty: "background-color, border-color, color, transform",
    transitionDuration: motion.fast,
    transitionTimingFunction: `${motion.ease}, ${motion.ease}, ${motion.ease}, ${motion.easeOut}`,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
    WebkitTapHighlightColor: "transparent",
    // The button gives a little under the finger, so a tap shows that it landed.
    transform: {
      default: null,
      ":active": { default: "scale(0.97)", [media.reducedMotion]: "none" },
    },
  },
  disabled: { opacity: "0.5", cursor: "not-allowed", transform: "none" },
  icon: { flexShrink: 0, width: size.iconSm, height: size.iconSm },
});

const intents = stylex.create({
  secondary: {
    backgroundColor: { default: color.raised, ":hover": color.subtle },
    borderColor: color.border,
    color: color.textMuted,
  },
  ghost: {
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    borderColor: "transparent",
    color: { default: color.textMuted, ":hover": color.text },
  },
});

const selectedIntents = stylex.create({
  secondary: {
    backgroundColor: { default: color.accentMuted, ":hover": color.accentMuted },
    borderColor: color.accentBorder,
    color: color.accentText,
  },
  ghost: {
    backgroundColor: { default: color.selected, ":hover": color.selected },
    color: { default: color.accentText, ":hover": color.accentText },
  },
});

const sizes = stylex.create({
  sm: { height: size.controlSm, paddingInline: space.sm, fontSize: font.sm },
  md: { height: size.controlMd, paddingInline: space.md, fontSize: font.md },
});

const squares = stylex.create({
  sm: { width: size.controlSm, paddingInline: 0 },
  md: { width: size.controlMd, paddingInline: 0 },
});
