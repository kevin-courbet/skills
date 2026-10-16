import * as stylex from "@stylexjs/stylex";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

/** Shared styles for form fields. Imported by text-field, select, and friends. */
export const field = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
  },
  label: {
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.text,
  },
  description: {
    fontSize: font.sm,
    color: color.textMuted,
  },
  error: {
    fontSize: font.sm,
    color: color.danger,
  },
  /** Keeps the label for assistive technology when a toolbar shows only the placeholder. */
  hiddenLabel: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});

export const control = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: size.controlMd,
    paddingInline: space.sm,
    fontSize: font.md,
    color: color.text,
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: {
      default: color.border,
      ":hover": color.borderStrong,
      ":focus-within": color.accent,
    },
    borderRadius: radius.md,
    boxShadow: {
      default: "none",
      ":focus-within": `0 0 0 3px color-mix(in oklab, ${color.focus} 28%, transparent)`,
    },
    outlineStyle: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  invalid: {
    borderColor: {
      default: color.dangerBorder,
      ":hover": color.danger,
      ":focus-within": color.danger,
    },
  },
  disabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  /** Toolbar and table density: the controlSm height. */
  compact: { height: size.controlSm },
  placeholder: {
    color: color.textFaint,
  },
  /** For an <input> or <textarea> that is itself the control box. */
  textInput: {
    "::placeholder": { color: color.textFaint },
  },
});

/** For an <input> nested inside a control box such as a NumberField Group. */
export const inputText = stylex.create({
  base: {
    flex: "1",
    minWidth: 0,
    height: "100%",
    borderStyle: "none",
    outlineStyle: "none",
    backgroundColor: "transparent",
    padding: 0,
    color: "inherit",
    fontSize: "inherit",
    "::placeholder": { color: color.textFaint },
  },
});
