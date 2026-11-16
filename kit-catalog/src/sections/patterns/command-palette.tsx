import * as stylex from "@stylexjs/stylex";
import {
  Bike,
  ClipboardList,
  FilePlus,
  Package,
  ReceiptText,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import {
  type CommandGroup,
  CommandPalette,
  CommandPaletteProvider,
  useCommandPalette,
  useCommandPaletteShortcut,
} from "@/components/patterns/command-palette";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/feedback";
import { Kbd } from "@/components/primitives/layout";
import { color, font, space } from "@/styles/tokens.stylex";
import { defineSection } from "../../specimen";

/**
 * The commands that the palette lists. An action reports its label below the
 * trigger. A page command opens "/", because the catalog has only that route.
 */
function shopGroups(run: (label: string) => void): ReadonlyArray<CommandGroup> {
  return [
    {
      label: "Actions",
      commands: [
        {
          id: "check-in",
          label: "Check in a bike",
          icon: Bike,
          onAction: () => run("Check in a bike"),
        },
        {
          id: "create-order",
          label: "Create work order",
          icon: FilePlus,
          onAction: () => run("Create work order"),
        },
        {
          id: "create-invoice",
          label: "Create invoice",
          icon: ReceiptText,
          onAction: () => run("Create invoice"),
        },
      ],
    },
    {
      label: "Navigation",
      commands: [
        { id: "work-orders", label: "Work orders", icon: ClipboardList, href: "/" },
        { id: "customers", label: "Customers", icon: Users, href: "/" },
        { id: "mechanics", label: "Mechanics", icon: Wrench, href: "/" },
        { id: "parts", label: "Parts", icon: Package, href: "/" },
        { id: "invoices", label: "Invoices", icon: ReceiptText, href: "/" },
      ],
    },
  ];
}

function shortcutGroups(run: (label: string) => void): ReadonlyArray<CommandGroup> {
  return [
    {
      label: "Actions",
      commands: [
        {
          id: "check-in",
          label: "Check in a bike",
          icon: Bike,
          shortcut: "C",
          keywords: ["drop off", "repair tag", "intake"],
          onAction: () => run("Check in a bike"),
        },
        {
          id: "create-invoice",
          label: "Create invoice",
          icon: ReceiptText,
          shortcut: "I",
          keywords: ["bill", "payment"],
          onAction: () => run("Create invoice"),
        },
      ],
    },
    {
      label: "Navigation",
      commands: [
        {
          id: "customers",
          label: "Customers",
          icon: Users,
          shortcut: "G C",
          keywords: ["clients", "people", "contacts"],
          href: "/",
        },
        {
          id: "parts",
          label: "Parts",
          icon: Package,
          shortcut: "G P",
          keywords: ["stock", "inventory", "suppliers"],
          href: "/",
        },
      ],
    },
  ];
}

function longLabelGroups(): ReadonlyArray<CommandGroup> {
  return [
    {
      label: "Recent work orders",
      commands: [
        {
          id: "wo-1047",
          label:
            "WO-1047, Riese & Müller Load 75 Rohloff HS cargo bike, motor diagnostics after an error code",
          icon: ClipboardList,
          href: "/",
        },
        {
          id: "wo-1043",
          label: "WO-1043, Brompton C Line, rear hub overhaul",
          icon: ClipboardList,
          href: "/",
        },
      ],
    },
    { label: "Saved searches", commands: [] },
  ];
}

function LastCommand({ label }: { readonly label: string | null }) {
  return (
    <p aria-live="polite" {...stylex.props(styles.result)}>
      {label === null ? "No command has run yet." : `Ran: ${label}`}
    </p>
  );
}

function SearchTrigger({ onPress }: { readonly onPress: () => void }) {
  const shortcut = useCommandPaletteShortcut();
  return (
    <Button icon={Search} onPress={onPress}>
      Search
      <span {...stylex.props(styles.keys)}>
        {shortcut.split(" ").map((key) => (
          <Kbd key={key}>{key}</Kbd>
        ))}
      </span>
    </Button>
  );
}

/**
 * The palette mounts only while it is open. Each mounted palette listens for
 * Command-K on the whole document, so each specimen in each theme column would
 * open at the same time.
 */
function PaletteSpecimen({
  groups,
  placeholder,
}: {
  readonly groups: (run: (label: string) => void) => ReadonlyArray<CommandGroup>;
  readonly placeholder?: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const hasActions = groups(setLastCommand).some((group) =>
    group.commands.some((command) => command.onAction !== undefined),
  );
  return (
    <div {...stylex.props(styles.stack)}>
      <SearchTrigger onPress={() => setOpen(true)} />
      {hasActions ? <LastCommand label={lastCommand} /> : null}
      {isOpen ? (
        <CommandPalette
          groups={groups(setLastCommand)}
          isOpen
          onOpenChange={setOpen}
          placeholder={placeholder}
        />
      ) : null}
    </div>
  );
}

function NoMatchingCustomers() {
  const palette = useCommandPalette();
  return (
    <EmptyState
      icon={Users}
      title="No customers match “Weber Jonas”"
      description="Search the whole shop for the customer, a work order, or an invoice."
      action={<Button onPress={palette.open}>Search the shop</Button>}
    />
  );
}

function OpenFromPage() {
  const [isOpen, setOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  return (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.page)}>
        <CommandPaletteProvider value={{ open: () => setOpen(true) }}>
          <NoMatchingCustomers />
        </CommandPaletteProvider>
      </div>
      <LastCommand label={lastCommand} />
      {isOpen ? (
        <CommandPalette groups={shopGroups(setLastCommand)} isOpen onOpenChange={setOpen} />
      ) : null}
    </div>
  );
}

export default defineSection({
  component: "CommandPalette",
  specimens: [
    {
      title: "Palette with groups",
      note: "In an app, AppShell mounts the only palette, and Command-K opens it. Here, press Search. An action shows its label below the button. A page command opens its route.",
      render: () => <PaletteSpecimen groups={shopGroups} />,
    },
    {
      title: "Shortcuts and keywords",
      note: "Type “stock” to find Parts. Type “bill” to find Create invoice. The shortcuts show only as hints.",
      render: () => <PaletteSpecimen groups={shortcutGroups} />,
    },
    {
      title: "Long labels, empty group, and no match",
      note: "A long label wraps. A group without commands does not show. Type “saddle” to see the empty state of the search.",
      render: () => <PaletteSpecimen groups={longLabelGroups} placeholder="Search work orders" />,
    },
    {
      title: "Open from a page",
      note: "A page opens the palette with useCommandPalette().open(). AppShell gives the CommandPaletteProvider.",
      render: () => <OpenFromPage />,
    },
  ],
});

const styles = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.sm,
    minWidth: 0,
  },
  result: { margin: 0, fontSize: font.sm, color: color.textMuted },
  keys: { display: "inline-flex", gap: "2px" },
  page: { alignSelf: "stretch" },
});
