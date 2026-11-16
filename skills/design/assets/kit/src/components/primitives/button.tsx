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
 * - Mouse, touch, and keyboard presses work the same way. A press scales the
 *   button down a little, except under reduced motion and in a `ButtonGroup`.
 * - The `icon` size follows the button size: `size.iconSm`, `size.icon`, or
 *   `size.iconLg`.
 * - `isPending` shows a spinner in place of the content and keeps the width.
 *   The button keeps the focus, ignores presses, and screen readers hear that
 *   it is pending. Do not put a `Spinner` in a button.
 *
 * ## Rules
 * - Pass an icon with `icon`, never in the children.
 * - Give an `iconOnly` button an `aria-label` that names the action.
 * - Give one `primary` button to each view.
 * - Keep `danger` for the confirm button of a destructive step, such as in a
 *   `ConfirmDialog`. The button that opens the confirmation is not `danger`.
 * - A submit button in a `Dialog` footer takes `type="submit"` and the `form` id.
 *
 * ## LinkButton
 * A router `Link` with the look of a button, for navigation that reads as an
 * action, such as "Create item". It takes the `Link` props.
 *
 * ## ButtonGroup
 * Joins buttons into one control with a `label`: a split button (an action and
 * a `MenuTrigger` with an icon-only `Button`), zoom out and in, or previous and
 * next.
 *
 * ## Example
 * ```tsx
 * <Button intent="primary" onPress={save}>Save changes</Button>
 * <Button icon={Download} onPress={exportRows}>Export</Button>
 * <LinkButton to="/items/new" icon={Plus}>Create item</LinkButton>
 * <ButtonGroup label="Deploy actions">
 *   <Button intent="primary" onPress={deploy}>Deploy</Button>
 *   <MenuTrigger>
 *     <Button intent="primary" iconOnly icon={ChevronDown} aria-label="Deploy targets" />
 *     <Menu onAction={deployTo}>{targetItems}</Menu>
 *   </MenuTrigger>
 * </ButtonGroup>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  ProgressBar,
} from "react-aria-components";
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
  /** Defaults to the row size from Toolbar or ControlSizeProvider, else `md`. Not in a Toolbar. */
  readonly size?: ButtonSize;
  /** Lucide icon before the label. Screen readers do not hear it. */
  readonly icon?: LucideIcon;
  /** Square control that shows only `icon`. Needs `icon` and `aria-label`, and throws without them. */
  readonly iconOnly?: boolean;
  /** The label: a verb and an object, such as "Create item". Leave it out with `iconOnly`. */
  readonly children?: ReactNode;
  /** Layout overrides, applied last. */
  readonly style?: StyleXStyles;
}

export type ButtonProps = ButtonOwnProps &
  Omit<AriaButtonProps, "className" | "style" | "children">;

export function Button({
  intent = "secondary",
  size: explicitSize,
  icon,
  iconOnly = false,
  style,
  children,
  ...props
}: ButtonProps) {
  const rowSize = useControlSize();
  const sizeKey = explicitSize ?? rowSize;
  const isGrouped = useContext(ButtonGroupContext);
  const content = buttonContent("Button", {
    icon,
    iconOnly,
    sizeKey,
    name: props["aria-label"] ?? props["aria-labelledby"],
    children,
  });
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
      {props.isPending === true ? (
        <>
          <span {...stylex.props(styles.pendingContent)}>{content}</span>
          <ProgressBar
            aria-label="Pending"
            isIndeterminate
            {...stylex.props(styles.pendingIndicator)}
          >
            <span {...stylex.props(styles.pendingSpinner)} />
          </ProgressBar>
        </>
      ) : (
        content
      )}
    </AriaButton>
  );
}

/**
 * The icon and the label of a Button or a LinkButton. It throws on an `iconOnly` button that has
 * no icon, no accessible name, or children, and on a text button that has no label.
 */
function buttonContent(
  component: "Button" | "LinkButton",
  {
    icon: Icon,
    iconOnly,
    sizeKey,
    name,
    children,
  }: {
    readonly icon: LucideIcon | undefined;
    readonly iconOnly: boolean;
    readonly sizeKey: ButtonSize;
    readonly name: string | undefined;
    readonly children: ReactNode;
  },
): ReactNode {
  if (iconOnly) {
    if (name === undefined)
      throw new Error(
        `${component} has iconOnly but no aria-label. Give an aria-label that names the action.`,
      );
    if (Icon === undefined)
      throw new Error(
        `${component} "${name}" has iconOnly but no icon. Give an icon or remove iconOnly.`,
      );
    if (children !== undefined)
      throw new Error(
        `${component} "${name}" has iconOnly and children. Remove the children: the aria-label names an icon-only button.`,
      );
  } else if (children === undefined) {
    throw new Error(
      `${component} has no children. Give a label, or set iconOnly with an icon and an aria-label.`,
    );
  }
  return (
    <>
      {Icon === undefined ? null : (
        <Icon aria-hidden {...stylex.props(styles.icon, iconSizes[sizeKey])} />
      )}
      {children}
    </>
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
  icon,
  iconOnly = false,
  style,
  children,
  ...props
}: LinkButtonProps) {
  const rowSize = useControlSize();
  const sizeKey = explicitSize ?? rowSize;
  const content = buttonContent("LinkButton", {
    icon,
    iconOnly,
    sizeKey,
    name: props["aria-label"] ?? props["aria-labelledby"],
    children,
  });
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
      {content}
    </Link>
  );
}

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
  base: {
    position: "relative",
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
  icon: { flexShrink: 0 },
  // The content keeps the width, so the row does not move when the work starts and ends. It
  // stays in the accessibility tree, so the button keeps its name.
  pendingContent: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    opacity: 0,
  },
  pendingIndicator: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingSpinner: {
    width: "0.875rem",
    height: "0.875rem",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: radius.full,
    animationName: spin,
    animationDuration: { default: "0.8s", [media.reducedMotion]: "1.6s" },
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
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

// The icon steps with the control, as in IconTile, so it keeps its weight next to the label.
const iconSizes = stylex.create({
  sm: { width: size.iconSm, height: size.iconSm },
  md: { width: size.icon, height: size.icon },
  lg: { width: size.iconLg, height: size.iconLg },
});

const squareSizes = stylex.create({
  sm: { width: size.controlSm, paddingInline: 0 },
  md: { width: size.controlMd, paddingInline: 0 },
  lg: { width: size.controlLg, paddingInline: 0 },
});
