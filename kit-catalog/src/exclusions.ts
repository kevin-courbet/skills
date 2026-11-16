/**
 * Kit components that have no section in the catalog, with the reason. The
 * check of `scripts/kit-catalog` fails when another component has no section,
 * and when a component in this list has one.
 */
export const catalogExclusions: Readonly<Record<string, string>> = {
  AppDocument: "It renders the html element of the app and needs the TanStack Start runtime.",
  AppShell:
    "It imports ThemeSwitch, which needs the TanStack Start runtime. The lab recipes show it.",
  ThemeSwitch: "It calls a server function to keep the theme choice.",
  ShellStylex: "It is the StyleX marker on the root of AppShell and renders nothing.",
  RouteBreadcrumbs: "It reads the matches of the app routes, and the catalog has one route.",
};

/** The helpers layer has no sections. Its files give context and hooks to the other layers. */
export const excludedLayers: ReadonlyArray<string> = ["helper"];
