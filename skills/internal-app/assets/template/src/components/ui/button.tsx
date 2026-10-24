// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext } from "react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

/** Set by ButtonGroup so its buttons join into one control. */
const ButtonGroupContext = createContext(false);

export interface ButtonGroupProps {
  /** Names the group, such as "Deploy actions" or "Zoom". */
  readonly label: string;
  /** Buttons, and MenuTrigger elements whose trigger is a Button. Use one intent for all. */
  readonly children: ReactNode;
}

/**
 * Buttons joined into one control, such as a split button ("Deploy" and a
 * menu of targets), zoom in and out, or previous and next. Use
 * SegmentedControl for a choice of views.
 */
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
  readonly intent?: ButtonIntent;
  readonly size?: ButtonSize;
  /** Square control for a single icon. Pass aria-label. */
  readonly iconOnly?: boolean;
  readonly children: ReactNode;
  readonly style?: StyleXStyles;
}

export type ButtonProps = ButtonOwnProps &
  Omit<AriaButtonProps, "className" | "style" | "children">;

export function Button({
  intent = "secondary",
  size: sizeKey = "md",
  iconOnly = false,
  style,
  children,
  ...props
}: ButtonProps) {
  const isGrouped = useContext(ButtonGroupContext);
  return (
    <AriaButton
      {...props}
      {...stylex.props(
        styles.base,
        intents[intent],
        sizes[sizeKey],
        iconOnly && squareSizes[sizeKey],
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

/** Router link with button appearance. Use for navigation that reads as an action. */
export function LinkButton({
  intent = "secondary",
  size: sizeKey = "md",
  iconOnly = false,
  style,
  children,
  ...props
}: LinkButtonProps) {
  const resolved = stylex.props(
    styles.base,
    intents[intent],
    sizes[sizeKey],
    iconOnly && squareSizes[sizeKey],
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
    transitionProperty: "background-color, border-color, color, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
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
