import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { Result, Schema } from "effect";
import { createContext, useContext } from "react";

export const THEME_COOKIE = "theme";

export const ThemeChoice = Schema.Literals(["light", "dark", "system"]);
export type ThemeChoice = typeof ThemeChoice.Type;
export const ThemeContext = createContext<{
  readonly choice: ThemeChoice;
  readonly setChoice: (choice: ThemeChoice) => void;
} | null>(null);
export function useTheme() {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error("Theme controls require AppDocument");
  return value;
}

const decodeThemeChoice = Schema.decodeUnknownResult(ThemeChoice);

function parseThemeChoice(raw: string | undefined): ThemeChoice {
  const result = decodeThemeChoice(raw);
  return Result.isSuccess(result) ? result.success : "system";
}

function readCookie(source: string, name: string): string | undefined {
  for (const part of source.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** Reads the saved choice without a network round trip on client navigations. */
export const getThemeChoice = createIsomorphicFn()
  .server(async (): Promise<ThemeChoice> => {
    const { getCookie } = await import("@tanstack/react-start/server");
    return parseThemeChoice(getCookie(THEME_COOKIE));
  })
  .client((): ThemeChoice => parseThemeChoice(readCookie(document.cookie, THEME_COOKIE)));

export const setThemeChoiceFn = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(ThemeChoice))
  .handler(async ({ data }) => {
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(THEME_COOKIE, data, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return data;
  });
