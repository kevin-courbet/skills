/**
 * The HTML document of the root route, with the global CSS, the theme, the locale, and the router head and scripts.
 *
 * @layer shell
 * @keywords html document, root document, theme provider, dark theme setup, locale provider, head and scripts
 * @related AppShell, ThemeSwitch, RouteError
 * @notes dark-theme
 *
 * The root route renders it once, around every page. Do not render it in a
 * layout route or a page. For the frame of the signed-in pages, use
 * `AppShell`.
 *
 * ## Behavior
 * - It owns the theme state through `ThemeContext`. `ThemeSwitch` and
 *   `useTheme()` read and change it. A change of the theme does not reload
 *   the app data.
 * - It sets `data-theme` on `<html>` before the first paint, also for the
 *   system theme, so that CSS keyed on `[data-theme]`, such as the dark series
 *   palette of Aperture, matches. It follows a later change of the system
 *   theme.
 * - It gives every react-aria field the app locale, so that dates and numbers
 *   match the formatters of `src/lib/locale.ts`.
 *
 * ## Rules
 * - Render it in the `shellComponent` of the root route, so that the
 *   document and the app scripts stay available when `beforeLoad` fails.
 * - Read the theme in `beforeLoad` of the root route with `getThemeChoice()`,
 *   which reads the cookie without a request on client navigations.
 * - When the first theme lookup fails, give the system theme until a lookup
 *   succeeds. `AppDocument` then uses the recovered document snapshot until
 *   people choose a theme.
 *
 * ## Example
 * ```tsx
 * function RootDocument({ children }: { readonly children: ReactNode }) {
 *   const { theme } = Route.useRouteContext();
 *   return <AppDocument theme={theme ?? "system"}>{children}</AppDocument>;
 * }
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { I18nProvider } from "react-aria-components";
import "@/styles/app.css";
import { appLocale } from "@/lib/locale";
import { ThemeContext, type ThemeChoice } from "@/lib/theme";
import { darkTheme, lightTheme } from "@/styles/themes";
import { color, font } from "@/styles/tokens.stylex";

export interface AppDocumentProps {
  /** The saved theme choice from the cookie, which the root route reads in `beforeLoad`. */
  readonly theme: ThemeChoice;
  /** The root route content. */
  readonly children: ReactNode;
}

/**
 * Sets data-theme before first paint when the user has no saved choice, so
 * third-party CSS keyed on [data-theme] (Aperture) matches the system theme.
 */
const systemThemeScript =
  "document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'";

function themeStyles(choice: ThemeChoice) {
  if (choice === "dark") return darkTheme;
  if (choice === "light") return lightTheme;
  return [];
}

function effectiveTheme(choice: ThemeChoice) {
  if (choice !== "system") return choice;
  if (import.meta.env.SSR) return undefined;
  // Match the system-theme script's attribute before React hydrates the document.
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Loads the StyleX hot-reload client in development only. */
function DevStyleXRuntime() {
  useEffect(() => {
    if (import.meta.env.DEV) void import("virtual:stylex:runtime");
  }, []);
  return null;
}

/**
 * The HTML document for the root route: global CSS, theme classes, the
 * development StyleX stylesheet, the router head and scripts, and one locale
 * for every react-aria field so dates and numbers match the app formatters.
 */
export function AppDocument({ theme: initialTheme, children }: AppDocumentProps) {
  const [selection, setSelection] = useState<
    | { readonly _tag: "DocumentSnapshot" }
    | { readonly _tag: "UserChoice"; readonly choice: ThemeChoice }
  >({ _tag: "DocumentSnapshot" });
  const theme = selection._tag === "UserChoice" ? selection.choice : initialTheme;
  const setTheme = useCallback(
    (choice: ThemeChoice) => setSelection({ _tag: "UserChoice", choice }),
    [],
  );
  useEffect(() => {
    if (theme !== "system") return;
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      document.documentElement.dataset.theme = preference.matches ? "dark" : "light";
    };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [theme]);
  const explicitTheme = theme === "system" ? undefined : theme;
  return (
    <ThemeContext.Provider value={{ choice: theme, setChoice: setTheme }}>
      <html
        lang={appLocale}
        data-theme={effectiveTheme(theme)}
        {...stylex.props(styles.html, themeStyles(theme))}
      >
        <head>
          <HeadContent />
          {import.meta.env.DEV ? <link rel="stylesheet" href="/virtual:stylex.css" /> : null}
          {explicitTheme === undefined ? <script>{systemThemeScript}</script> : null}
        </head>
        <body {...stylex.props(styles.body)}>
          <I18nProvider locale={appLocale}>{children}</I18nProvider>
          <DevStyleXRuntime />
          <Scripts />
        </body>
      </html>
    </ThemeContext.Provider>
  );
}

const styles = stylex.create({
  // Keep the root font size at the browser default so rem tokens stay 16px-based.
  html: {
    colorScheme: color.scheme,
    backgroundColor: color.frame,
    color: color.text,
  },
  body: {
    minHeight: "100dvh",
    fontFamily: font.sans,
    fontSize: font.md,
    lineHeight: font.leadingNormal,
    fontWeight: font.regular,
  },
});
