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
import { renderStyles } from "@/lib/rac";
import {
  color,
  font,
  layer,
  media,
  motion,
  radius,
  shadow,
  size,
  space,
} from "@/styles/tokens.stylex";
import { Kbd } from "./layout";
import { MenuItem } from "./menu";
import { overlay } from "./overlay";

interface CommandBase {
  readonly id: string;
  /** Sentence case verb phrase or destination, such as "Create item" or "Settings". */
  readonly label: string;
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
  readonly label: string;
  readonly commands: ReadonlyArray<Command>;
}

export interface CommandPaletteProps {
  readonly groups: ReadonlyArray<CommandGroup>;
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly placeholder?: string;
}

/**
 * Searchable list of navigation targets and actions in a modal. Command-K or
 * Control-K toggles it while it is mounted, so mount one palette per app.
 * AppShell mounts it with the navigation items and its `commands` prop.
 */
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
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        styles.backdrop,
        state.isEntering && styles.backdropEntering,
        state.isExiting && styles.backdropExiting,
      ])}
    >
      <Modal
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          styles.modal,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
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
                        icon={
                          command.icon === undefined ? undefined : (
                            <command.icon aria-hidden {...stylex.props(styles.itemIcon)} />
                          )
                        }
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

const backdropIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const backdropOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });

const styles = stylex.create({
  backdropEntering: {
    animationName: backdropIn,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
  },
  backdropExiting: {
    animationName: backdropOut,
    animationDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
  },
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
  itemIcon: { width: size.icon, height: size.icon },
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
