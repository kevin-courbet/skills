import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Button,
  Input,
  Label,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { control, field, inputText } from "./field";

export interface SearchFieldProps extends Omit<
  AriaSearchFieldProps,
  "className" | "style" | "children"
> {
  readonly label: string;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  readonly placeholder?: string;
  /** `sm` uses the compact control height for toolbars inside a table frame. */
  readonly size?: "sm" | "md";
  /** Pressing "/" outside a text field focuses this field. Use it for the main list search only. */
  readonly focusShortcut?: boolean;
  readonly style?: StyleXStyles;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Search input with a clear button. Escape clears the value. */
export function SearchField({
  label,
  hideLabel = false,
  placeholder,
  size: sizeKey = "md",
  focusShortcut = false,
  style,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!focusShortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusShortcut]);
  return (
    <AriaSearchField {...props} {...stylex.props(field.root, style)}>
      {({ isEmpty, isDisabled }) => (
        <>
          <Label {...stylex.props(field.label, hideLabel && field.hiddenLabel)}>{label}</Label>
          <div
            {...stylex.props(
              control.base,
              styles.box,
              sizeKey === "sm" && control.compact,
              isDisabled && control.disabled,
            )}
          >
            <Search aria-hidden {...stylex.props(styles.icon)} />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              aria-keyshortcuts={focusShortcut ? "/" : undefined}
              {...stylex.props(inputText.base, styles.input)}
            />
            {isEmpty && focusShortcut ? (
              <kbd aria-hidden {...stylex.props(styles.shortcut)}>
                /
              </kbd>
            ) : null}
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
  shortcut: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "1.25rem",
    height: "1.25rem",
    marginInlineEnd: "2px",
    fontFamily: font.mono,
    fontSize: font.xs,
    color: color.textFaint,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.sm,
  },
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
