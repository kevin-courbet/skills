// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * Buttons for actions, router links that look like buttons, and groups of joined buttons.
 *
 * @layer primitive
 * @keywords button, primary button, submit button, icon button, link button, split button, button group, danger button, action button
 * @related SurfaceButton, Menu, ConfirmDialog, SegmentedControl, ToggleGroup, ControlSize, Layout
 * @notes hierarchy, ux-writing, kit-composition, kit-writing
 *
 * Use `Button` for an action and for form submission. Do not use it for a
 * custom surface that is one control, such as a card title or a list row: use
 * `SurfaceButton`. For a choice of views, use `SegmentedControl`. For options
 * that turn on and off, use `ToggleGroup`.
 *
 * ## Behavior
 * - `Button` uses react-aria press handling, so mouse, touch, and keyboard
 *   presses work the same way.
 * - A press scales the button down a little, except under reduced motion and
 *   in a `ButtonGroup`.
 *
 * ## Rules
 * - Give one `primary` button to each view.
 * - Keep `danger` for the confirm button of a destructive step, such as in a
 *   `ConfirmDialog`. The button that opens the confirmation is not `danger`.
 * - A submit button in a `Dialog` footer takes `type="submit"` and the `form` id.
 *
 * ## LinkButton
 * A router `Link` with the look of a button, for navigation that reads as an
 * action, such as "Create item" that opens a route. It takes the `Link` props,
 * such as `to` and `params`.
 *
 * ## ButtonGroup
 * Joins buttons into one control with a `label`: a split button (an action and
 * a `MenuTrigger` with an icon-only `Button`), zoom out and in, or previous and
 * next.
 *
 * ## Example
 * ```tsx
 * <Button intent="primary" onPress={save}>Save changes</Button>
 * <LinkButton to="/items/new">Create item</LinkButton>
 * <ButtonGroup label="Deploy actions">
 *   <Button intent="primary" onPress={deploy}>Deploy</Button>
 *   <MenuTrigger>
 *     <Button intent="primary" iconOnly aria-label="Deploy targets"><ChevronDown /></Button>
 *     <Menu onAction={deployTo}>{targetItems}</Menu>
 *   </MenuTrigger>
 * </ButtonGroup>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext } from "react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";
import { useControlSize } from "@/components/helpers/control-size";

/** Set by ButtonGroup so its buttons join into one control. */
const ButtonGroupContext = createContext(false);

export interface ButtonGroupProps {
  /** Names the group, such as "Deploy actions" or "Zoom". */
  readonly label: string;
  /** Buttons, and MenuTrigger elements whose trigger is a Button. Use one intent for all. */
  readonly children: ReactNode;
}

export function ButtonGroup({ label, children }: ButtonGroupProps) {
  return (
    <div role="group" aria-label={label} {...stylex.props(styles.group)}>
      <ButtonGroupContext.Provider value>{children}</ButtonGroupContext.Provider>
    </div>
  );
}

export type ButtonIntent = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  /** Visual weight. `ghost` is for a quiet action. */
  readonly intent?: ButtonIntent;
  /**
   * Defaults to the size of the surrounding row, set by Toolbar or
   * ControlSizeProvider, and `md` elsewhere. Do not set it inside a Toolbar.
   */
  readonly size?: ButtonSize;
  /** Square control for a single icon. Pass aria-label. */
  readonly iconOnly?: boolean;
  /** A verb and an object, such as "Create item", or one icon. */
  readonly children: ReactNode;
  /** Layout overrides, applied last. */
  readonly style?: StyleXStyles;
}

export type ButtonProps = ButtonOwnProps &
  Omit<AriaButtonProps, "className" | "style" | "children">;

export function Button({
  intent = "secondary",
  size: explicitSize,
  iconOnly = false,
  style,
  children,
  ...props
}: ButtonProps) {
  const rowSize = useControlSize();
  const sizeKey = explicitSize ?? rowSize;
  const isGrouped = useContext(ButtonGroupContext);
  return (
    <AriaButton
      {...props}
      {...stylex.props(
        styles.base,
        intents[intent],
        sizes[sizeKey],
        iconOnly && squareSizes[sizeKey],
        !isGrouped && styles.press,
        isGrouped && styles.grouped,
        isGrouped && intent === "primary" && styles.groupedPrimary,
        style,
      )}
    >
      {children}
    </AriaButton>
  );
}

export type LinkButtonProps = ButtonOwnProps &
  Omit<
    LinkComponentProps<"a">,
    "className" | "style" | "children" | "activeProps" | "inactiveProps"
  >;

export function LinkButton({
  intent = "secondary",
  size: explicitSize,
  iconOnly = false,
  style,
  children,
  ...props
}: LinkButtonProps) {
  const rowSize = useControlSize();
  const sizeKey = explicitSize ?? rowSize;
  const resolved = stylex.props(
    styles.base,
    intents[intent],
    sizes[sizeKey],
    iconOnly && squareSizes[sizeKey],
    styles.press,
    props.disabled === true && styles.disabledLink,
    style,
  );
  return (
    <Link {...props} className={resolved.className} style={resolved.style}>
      {children}
    </Link>
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
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    fontWeight: font.medium,
    lineHeight: "1",
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    opacity: { default: "1", ":disabled": "0.5" },
    textDecoration: "none",
    userSelect: "none",
    transitionProperty: "background-color, border-color, color, box-shadow, transform",
    transitionDuration: motion.fast,
    transitionTimingFunction: `${motion.ease}, ${motion.ease}, ${motion.ease}, ${motion.ease}, ${motion.easeOut}`,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  // The button gives a little under the finger, so a tap shows that it landed. Joined buttons stay still.
  press: {
    transform: {
      default: null,
      ":active": { default: "scale(0.97)", [media.reducedMotion]: "none" },
    },
  },
  disabledLink: { opacity: "0.5", pointerEvents: "none" },
  group: {
    display: "inline-flex",
    flexShrink: 0,
    borderRadius: radius.md,
    // Clips the outer corners of the joined buttons; their focus rings sit inside.
    overflow: "hidden",
  },
  grouped: {
    position: "relative",
    zIndex: { default: 0, ":hover": 1, ":focus-visible": 2 },
    borderRadius: 0,
    marginInlineStart: { default: "-1px", ":first-child": 0 },
    outlineOffset: "-3px",
  },
  // Primary buttons have no border; a darker line keeps the joined parts apart.
  groupedPrimary: {
    borderInlineStartColor: { default: color.accentHover, ":first-child": "transparent" },
  },
});

const intents = stylex.create({
  primary: {
    backgroundColor: {
      default: color.accent,
      ":hover": color.accentHover,
      ":active": color.accentStrong,
    },
    borderColor: "transparent",
    color: color.onAccent,
  },
  secondary: {
    backgroundColor: { default: color.raised, ":hover": color.subtle, ":active": color.inset },
    borderColor: color.border,
    color: color.text,
  },
  ghost: {
    backgroundColor: { default: "transparent", ":hover": color.subtle, ":active": color.inset },
    borderColor: "transparent",
    color: color.text,
  },
  /** Reserve for confirmed destructive steps. Copy and placement carry the warning first. */
  danger: {
    backgroundColor: {
      default: color.raised,
      ":hover": color.dangerMuted,
      ":active": color.dangerMuted,
    },
    borderColor: color.dangerBorder,
    color: color.danger,
  },
});

const sizes = stylex.create({
  sm: { height: size.controlSm, paddingInline: space.sm, fontSize: font.sm },
  md: { height: size.controlMd, paddingInline: space.md, fontSize: font.md },
  lg: { height: size.controlLg, paddingInline: space.lg, fontSize: font.lg },
});

const squareSizes = stylex.create({
  sm: { width: size.controlSm, paddingInline: 0 },
  md: { width: size.controlMd, paddingInline: 0 },
  lg: { width: size.controlLg, paddingInline: 0 },
});
