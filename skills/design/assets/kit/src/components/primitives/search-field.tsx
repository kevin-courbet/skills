/**
 * A search input with a clear button, for the free-text search of a list.
 *
 * @layer primitive
 * @keywords search field, search input, search box, search a list, find, query, slash shortcut, clear search, toolbar search
 * @related Filters, DataTable, Layout, CommandPalette, ComboBox
 * @notes kit-url-filters, kit-composition, kit-recipes
 *
 * Use it for the free-text search of a list, such as the search before
 * `Filters` in a page `Toolbar`. Do not use it to find pages and app actions:
 * `AppShell` mounts the `CommandPalette` for that. Do not use it to choose one
 * value: use `ComboBox`.
 *
 * ## Behavior
 * - A clear button shows while the field has text. Escape clears the value.
 * - With `focusShortcut`, a `/` hint shows while the field is empty.
 * - The height follows the nearest `ControlSizeProvider`.
 *
 * ## Rules
 * - Put the search first in its row, before `Filters`.
 * - Keep the query in a search param, so that a reload and a link show the same
 *   results. Reset the page when the query changes.
 *
 * ## Example
 * ```tsx
 * <SearchField
 *   label="Search items"
 *   hideLabel
 *   focusShortcut
 *   placeholder="Search by name or owner"
 *   value={search.q ?? ""}
 *   onChange={(q) =>
 *     navigate({ search: (prev) => ({ ...prev, q: q || undefined, page: undefined }) })
 *   }
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Button,
  Input,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { control, field, FieldLabel, inputText } from "@/components/helpers/field";
import { useControlSize } from "@/components/helpers/control-size";

export interface SearchFieldProps extends Omit<
  AriaSearchFieldProps,
  "className" | "style" | "children"
> {
  /** Visible name of the field, such as "Search items". It names what the field searches. */
  readonly label: string;
  /** Hide the visible label in dense toolbars. The label stays available to screen readers. */
  readonly hideLabel?: boolean;
  /** Text in the empty field that tells what people can search by, such as "Search by name or owner". */
  readonly placeholder?: string;
  /** Pressing "/" outside a text field focuses this field. Use it for the main list search only. */
  readonly focusShortcut?: boolean;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function SearchField({
  label,
  hideLabel = false,
  placeholder,
  focusShortcut = false,
  style,
  ...props
}: SearchFieldProps) {
  const controlSize = useControlSize();
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
          <FieldLabel isHidden={hideLabel}>{label}</FieldLabel>
          <div
            {...stylex.props(
              control.base,
              styles.box,
              controlSize === "sm" && control.compact,
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
