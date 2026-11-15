/**
 * The parts and the styles of every kit field: the label, the hint, the error,
 * the control box, and the widths.
 *
 * @layer helper
 * @keywords field label, field hint, field error message, optional marker, field width, control styles, build a new field, input styles, hidden label
 * @related TextField, NumberField, Select, FormLayout, ControlSize
 * @notes form-fields, form-errors, internal-app-forms, internal-app-adding-a-primitive
 *
 * Use these parts only to build a new kit field in
 * `src/components/primitives`. Do not use them on a page: use `TextField`,
 * `NumberField`, `Select`, or another kit field, which already composes them.
 *
 * ## Behavior
 * - `FieldLabel` with `isOptional` adds a quiet "optional", which is part of
 *   the accessible name.
 * - `FieldDescription` renders nothing when its content is empty.
 * - `FieldErrorMessage` shows only while the react-aria field is invalid, and
 *   starts with an icon.
 * - `control.invalid` doubles the border with an inset ring, so that an invalid
 *   field stands out in both themes.
 *
 * ## Rules
 * - Put the parts in this order: `FieldLabel`, `FieldDescription`, the control,
 *   and `FieldErrorMessage`.
 * - Style an input that is itself the box with `control.base` and
 *   `control.textInput`. Reset an input inside a box with `inputText.base`.
 *   Never put both on one element: the reset removes the box.
 * - Size the control with `fieldWidth[width]`. Read the control size with
 *   `useControlSize()` and add `control.compact` for `sm`. A field has no
 *   `size` prop.
 * - A text-like kit field takes `width` and `isOptional`, and throws an error
 *   when `isOptional` and `isRequired` are both set. A new field does the same.
 * - `field.hiddenLabel` keeps a label for screen readers only.
 *
 * ## Example
 * ```tsx
 * <AriaTextField isInvalid={isInvalid} {...stylex.props(field.root)}>
 *   <FieldLabel isOptional={isOptional}>{label}</FieldLabel>
 *   <FieldDescription>{description}</FieldDescription>
 *   <Input {...stylex.props(control.base, control.textInput, fieldWidth[width])} />
 *   <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
 * </AriaTextField>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { FieldError, Label, Text } from "react-aria-components";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

/**
 * Width of a field control, from the expected length of the answer. `xs` holds
 * about 4 characters (a quantity or a floor), `sm` about 12 (a phone number,
 * a date, an amount), `md` about 24 (a name), `lg` about 40 (an email or an
 * address line). `full` fills the column, for free text. The touch density
 * makes each width larger together with the text.
 */
export type FieldWidth = "xs" | "sm" | "md" | "lg" | "full";

export interface FieldLabelProps {
  /** The label text. */
  readonly children: ReactNode;
  /** Adds a quiet "optional" after the label text. Mark the optional fields, not the required ones. */
  readonly isOptional?: boolean;
  /** Hides the label visually. Screen readers keep it. */
  readonly isHidden?: boolean;
  /** For a field that is not a react-aria field, which links the label by id. */
  readonly id?: string;
  /** A `span` for a group that is not a form control, such as a choice group. */
  readonly elementType?: "label" | "span";
}

export function FieldLabel({
  children,
  isOptional = false,
  isHidden = false,
  id,
  elementType,
}: FieldLabelProps) {
  return (
    <Label
      id={id}
      elementType={elementType}
      {...stylex.props(field.label, isHidden && field.hiddenLabel)}
    >
      {children}
      {isOptional ? <span {...stylex.props(field.optional)}>optional</span> : null}
    </Label>
  );
}

/**
 * The hint of a field. It sits between the label and the control, so people
 * read it before they answer and an open keyboard or list never covers it.
 */
export function FieldDescription({
  children,
  id,
}: {
  /** The hint text. An empty hint renders nothing. */
  readonly children: ReactNode;
  /** For a field that is not a react-aria field, which links the hint by id. */
  readonly id?: string;
}) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <Text
      slot={id === undefined ? "description" : undefined}
      id={id}
      {...stylex.props(field.description)}
    >
      {children}
    </Text>
  );
}

/**
 * The error of a react-aria field, under the control. It shows only while the
 * field is invalid. Write what to do, such as "Enter the floor as a number from
 * 0 to 40", not only what is wrong.
 */
export function FieldErrorMessage({
  children,
}: {
  /** The error text. Without it, the message joins the validation errors of react-aria. */
  readonly children?: string;
}) {
  return (
    <FieldError {...stylex.props(field.error)}>
      {({ validationErrors }) => (
        <>
          <FieldErrorIcon />
          <span>{children ?? validationErrors.join(" ")}</span>
        </>
      )}
    </FieldError>
  );
}

/** The icon at the start of a field error, for a field that renders its own error element. */
export function FieldErrorIcon() {
  return <CircleAlert aria-hidden {...stylex.props(field.errorIcon)} />;
}

export const field = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
  },
  label: {
    display: "flex",
    alignItems: "baseline",
    gap: space.sm,
    fontSize: font.sm,
    fontWeight: font.semibold,
    color: color.text,
  },
  optional: {
    fontWeight: font.medium,
    color: color.textFaint,
  },
  description: {
    fontSize: font.sm,
    lineHeight: font.leadingNormal,
    color: color.textMuted,
    maxWidth: size.readingMax,
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.xs,
    fontSize: font.sm,
    fontWeight: font.medium,
    lineHeight: font.leadingNormal,
    color: color.danger,
  },
  errorIcon: {
    flexShrink: 0,
    width: size.iconSm,
    height: size.iconSm,
    // Centers the icon on the first line of the message.
    marginTop: "0.15em",
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
  // The inset ring doubles the border without moving the content, so an invalid field stands out in both themes.
  invalid: {
    borderColor: color.danger,
    boxShadow: {
      default: `inset 0 0 0 1px ${color.danger}`,
      ":focus-within": `inset 0 0 0 1px ${color.danger}, 0 0 0 3px color-mix(in oklab, ${color.danger} 28%, transparent)`,
    },
  },
  disabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  /** The `sm` control size from ControlSizeProvider: the controlSm height. */
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

/** Control widths for the `width` prop of a field. See FieldWidth. */
export const fieldWidth = stylex.create({
  xs: { width: size.fieldXs, maxWidth: "100%" },
  sm: { width: size.fieldSm, maxWidth: "100%" },
  md: { width: size.fieldMd, maxWidth: "100%" },
  lg: { width: size.fieldLg, maxWidth: "100%" },
  full: { width: "100%" },
});
