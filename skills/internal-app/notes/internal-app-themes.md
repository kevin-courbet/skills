---
id: internal-app-themes
topic: internal-app
summary: How the kit renders the light and dark themes on the server, reads the theme cookie, applies createTheme and data-theme on the html element, sets the locale of react-aria, and the lightness steps of the dark surfaces.
keywords: [dark theme tokens, dark mode, night mode, light theme, theme cookie, ThemeSwitch, defaultTheme, system theme, prefers-color-scheme, createTheme, data-theme, color-scheme, flash of the wrong theme, I18nProvider, lang attribute, dark surfaces, dark neutrals]
specializes: [dark-theme]
related: [internal-app-tokens, internal-app-brand-colors, internal-app-stylex]
---

# Internal App Themes

The kit `AppDocument`, `ThemeSwitch`, and `src/styles/themes.ts` implement the themes. An app sets only its default theme and its brand values. Run `internal-app docs AppDocument` for the document.

## Theme Choice

- The tokens have the light values by default and the dark values under `@media (prefers-color-scheme: dark)`. Thus the server renders the correct theme without the knowledge of the user.
- An explicit choice is a cookie. The root `beforeLoad` reads it.
- Without a cookie, the choice is `defaultTheme` from the app file `src/lib/brand.ts`. The template uses `"system"`. Use `"light"` or `"dark"` for an app whose brand starts in one theme.
- The `ThemeSwitch` in the top bar writes the cookie through a server function, and then invalidates the router.

## The HTML Element

- `src/styles/themes.ts` makes `lightTheme` and `darkTheme` with `stylex.createTheme`. `AppDocument` applies the chosen theme to `<html>`.
- Bind each `createTheme` result to a bare `const`. The compiler rejects an inline call in an array.
- `AppDocument` also sets `data-theme` on `<html>`. When the choice is `"light"` or `"dark"`, the value comes from the choice. Otherwise an inline script sets it before the first paint. Aperture and other third-party CSS that use `[data-theme]` follow it.
- `color.scheme` sets `color-scheme` on `<html>`, so native controls and scroll bars match the theme.
- `AppDocument` sets `lang`. It also wraps the app in the `I18nProvider` of react-aria with `appLocale`. Thus date segments and number fields format like the formatters of `src/lib/locale.ts`, and not like the locale of the browser.

## Dark Values

Dark values are not inverted light values. They follow [[dark-theme]]. The kit adds these values:

- Dark neutrals keep their chroma near 0.003. Thus the frame, the panel, and the cards are neutral grey steps.
- The lightness steps are `page` (L 0.13) < `inset` (0.158) < `frame` (0.195) < `raised` (0.205) < `subtle` and `overlay` (0.245).
- Each step stays visible without a border.
