/**
 * A modal search for pages and app actions that Command-K or Control-K opens.
 *
 * @layer pattern
 * @keywords command palette, command k, cmd k, quick search, search pages, jump to page, app actions, spotlight, keyboard launcher
 * @related AppShell, Menu, SearchField
 * @notes navigation, internal-app-page-patterns
 *
 * `AppShell` mounts the only palette of the app. Do not mount another one: give
 * app-wide actions to the `commands` prop of `AppShell`, and open the palette
 * from a page with `useCommandPalette().open()`. To search a list on a page,
 * use `SearchField`.
 *
 * ## Behavior
 * - Command-K or Control-K toggles the palette. The top bar of `AppShell` shows
 *   a "Search" button with the shortcut hint of the platform.
 * - The palette opens and closes at once, without motion, because people open
 *   it from the keyboard many times each day.
 * - Typing filters the commands by their label and `keywords`, and ignores case
 *   and accents.
 * - The arrow keys move, Enter runs a command or opens its route, and Escape
 *   closes the palette. The palette closes before a command runs.
 * - `AppShell` lists its `commands` first, then every navigation item under its
 *   group label.
 *
 * ## Rules
 * - A `Command` has `href` or `onAction`, never both. The type enforces it.
 * - Only app-wide actions go into the palette. Page-specific actions stay on
 *   their page.
 * - Label a command with a verb phrase or a destination in sentence case, such
 *   as "Create item" or "Settings".
 *
 * ## Example
 * ```tsx
 * const commands: ReadonlyArray<CommandGroup> = [
 *   { label: "Items", commands: [{ id: "create-item", label: "Create item", icon: Plus, href: "/items/new" }] },
 * ];
 * <AppShell appName="Repairs" nav={nav} commands={commands}>{children}</AppShell>;
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { type LucideIcon, Search } from "lucide-react";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import {
  Autocomplete,
  Collection,
  Dialog,
  Header,
  Input,
  Menu,
  MenuSection,
  Modal,
  ModalOverlay,
  SearchField,
  useFilter,
} from "react-aria-components";
import { color, font, layer, media, radius, shadow, size, space } from "@/styles/tokens.stylex";
import { Kbd } from "@/components/primitives/layout";
import { MenuItem } from "@/components/primitives/menu";

interface CommandBase {
  /** Unique in all groups. It is the key of the item. */
  readonly id: string;
  /** Sentence case verb phrase or destination, such as "Create item" or "Settings". */
  readonly label: string;
  /** Shown before the label. */
  readonly icon?: LucideIcon;
  /** Extra words that find the command, such as synonyms or the group name. */
  readonly keywords?: ReadonlyArray<string>;
  /** Shortcut that runs the command outside the palette. Shown only as a hint. */
  readonly shortcut?: string;
}

/** A command opens a route through `href` or runs `onAction`. Never both. */
export type Command = CommandBase &
  (
    | { readonly href: string; readonly onAction?: never }
    | { readonly onAction: () => void; readonly href?: never }
  );

export interface CommandGroup {
  /** Heading of the group, such as "Navigation". */
  readonly label: string;
  /** The commands of the group. A group without matching commands does not show. */
  readonly commands: ReadonlyArray<Command>;
}

export interface CommandPaletteProps {
  /** All the commands, in the order that they show. */
  readonly groups: ReadonlyArray<CommandGroup>;
  /** Whether the palette shows. */
  readonly isOpen: boolean;
  /** Receives the next state on Escape, on a click outside, on Command-K, and `false` before a command runs. */
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Text in the empty search field. */
  readonly placeholder?: string;
}

export function CommandPalette({
  groups,
  isOpen,
  onOpenChange,
  placeholder = "Search pages and actions",
}: CommandPaletteProps) {
  const { contains } = useFilter({ sensitivity: "base" });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      onOpenChange(!isOpen);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onOpenChange]);
  const visibleGroups = groups.filter((group) => group.commands.length > 0);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      {...stylex.props(styles.backdrop)}
    >
      <Modal {...stylex.props(styles.modal)}>
        <Dialog aria-label="Command palette" {...stylex.props(styles.dialog)}>
          <Autocomplete filter={contains}>
            <SearchField aria-label="Search commands" autoFocus {...stylex.props(styles.search)}>
              <Search aria-hidden {...stylex.props(styles.searchIcon)} />
              <Input placeholder={placeholder} {...stylex.props(styles.input)} />
            </SearchField>
            <Menu
              aria-label="Commands"
              items={visibleGroups}
              renderEmptyState={() => (
                <p {...stylex.props(styles.empty)}>No pages or actions match.</p>
              )}
              {...stylex.props(styles.menu)}
            >
              {(group) => (
                <MenuSection id={group.label} {...stylex.props(styles.section)}>
                  <Header {...stylex.props(styles.sectionHeader)}>{group.label}</Header>
                  <Collection items={group.commands}>
                    {(command) => (
                      <MenuItem
                        id={command.id}
                        textValue={[command.label, ...(command.keywords ?? [])].join(" ")}
                        href={command.href}
                        icon={command.icon}
                        shortcut={command.shortcut}
                        onAction={() => {
                          onOpenChange(false);
                          command.onAction?.();
                        }}
                      >
                        {command.label}
                      </MenuItem>
                    )}
                  </Collection>
                </MenuSection>
              )}
            </Menu>
          </Autocomplete>
          <footer {...stylex.props(styles.footer)}>
            <span {...stylex.props(styles.hint)}>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> to move
            </span>
            <span {...stylex.props(styles.hint)}>
              <Kbd>Enter</Kbd> to open
            </span>
            <span {...stylex.props(styles.hint)}>
              <Kbd>Esc</Kbd> to close
            </span>
          </footer>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export interface CommandPaletteControls {
  /** Opens the palette of AppShell. */
  readonly open: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteControls | null>(null);

/** AppShell provides it. Pages use `useCommandPalette` to open the palette. */
export const CommandPaletteProvider = CommandPaletteContext.Provider;

/** Opens the AppShell command palette, for example from an empty state or a help hint. */
export function useCommandPalette(): CommandPaletteControls {
  const controls = useContext(CommandPaletteContext);
  if (controls === null) throw new Error("useCommandPalette must be used inside AppShell.");
  return controls;
}

const subscribeToNothing = () => () => undefined;

/**
 * The palette shortcut label for this platform. The server and the first
 * client render use "Ctrl K", so hydration matches; Apple platforms then show "⌘ K".
 */
export function useCommandPaletteShortcut(): string {
  const isApple = useSyncExternalStore(
    subscribeToNothing,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
  return isApple ? "⌘ K" : "Ctrl K";
}

const styles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: layer.modal,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "12dvh",
    paddingInline: space.lg,
    backgroundColor: color.backdrop,
  },
  modal: {
    width: "100%",
    maxWidth: "36rem",
    backgroundColor: color.overlay,
    color: color.text,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.xl,
    boxShadow: shadow.lg,
    outlineStyle: "none",
    overflow: "hidden",
  },
  dialog: { display: "flex", flexDirection: "column", outlineStyle: "none" },
  search: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    height: "3rem",
    paddingInline: space.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  searchIcon: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
  input: {
    flex: "1",
    minWidth: 0,
    height: "100%",
    borderStyle: "none",
    outlineStyle: "none",
    backgroundColor: "transparent",
    padding: 0,
    color: color.text,
    fontSize: font.lg,
    "::placeholder": { color: color.textFaint },
    "::-webkit-search-cancel-button": { display: "none" },
  },
  menu: {
    maxHeight: "min(24rem, 60dvh)",
    overflowY: "auto",
    padding: space.xs,
    outlineStyle: "none",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    paddingBottom: { default: space.xs, ":last-child": 0 },
  },
  sectionHeader: {
    paddingInline: space.sm,
    paddingTop: space.sm,
    paddingBottom: space.xs,
    fontSize: font.xs,
    fontWeight: font.medium,
    color: color.textFaint,
  },
  empty: {
    paddingBlock: space.xxl,
    paddingInline: space.lg,
    textAlign: "center",
    fontSize: font.md,
    color: color.textMuted,
  },
  footer: {
    display: { default: "none", [media.sm]: "flex" },
    alignItems: "center",
    gap: space.lg,
    paddingBlock: space.sm,
    paddingInline: space.lg,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    fontSize: font.sm,
    color: color.textMuted,
  },
  hint: { display: "inline-flex", alignItems: "center", gap: space.xs },
});
