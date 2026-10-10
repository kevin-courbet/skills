import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Search, X } from "lucide-react";
import {
  Button,
  Input,
  Label,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";
import { color, radius, size, space } from "@/styles/tokens.stylex";
import { control, field, inputText } from "./field";

export interface SearchFieldProps extends Omit<
  AriaSearchFieldProps,
  "className" | "style" | "children"
> {
  readonly label: string;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  readonly placeholder?: string;
  readonly style?: StyleXStyles;
}

/** Search input with a clear button. Escape clears the value. */
export function SearchField({
  label,
  hideLabel = false,
  placeholder,
  style,
  ...props
}: SearchFieldProps) {
  return (
    <AriaSearchField {...props} {...stylex.props(field.root, style)}>
      {({ isEmpty, isDisabled }) => (
        <>
          <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
          <div {...stylex.props(control.base, styles.box, isDisabled && control.disabled)}>
            <Search aria-hidden {...stylex.props(styles.icon)} />
            <Input placeholder={placeholder} {...stylex.props(inputText.base, styles.input)} />
            {isEmpty ? null : (
              <Button aria-label="Clear search" {...stylex.props(styles.clear)}>
                <X aria-hidden {...stylex.props(styles.clearIcon)} />
              </Button>
            )}
          </div>
        </>
      )}
    </AriaSearchField>
  );
}

const styles = stylex.create({
  box: { gap: space.xs, paddingInlineEnd: "2px" },
  icon: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.textFaint },
  // Hide the browser's own clear button; the field renders an accessible one.
  input: { "::-webkit-search-cancel-button": { display: "none" } },
  clear: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.textMuted,
    cursor: "pointer",
  },
  clearIcon: { width: size.iconSm, height: size.iconSm },
});
