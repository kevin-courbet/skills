import * as stylex from "@stylexjs/stylex";
import { HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { I18nProvider } from "react-aria-components";
import "@/styles/app.css";
import { appLocale } from "@/lib/locale";
import { ThemeContext, type ThemeChoice } from "@/lib/theme";
import { darkTheme, lightTheme } from "@/styles/themes";
import { color, font } from "@/styles/tokens.stylex";

export interface AppDocumentProps {
  readonly theme: ThemeChoice;
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
  const [theme, setTheme] = useState(initialTheme);
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
    backgroundColor: color.page,
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
