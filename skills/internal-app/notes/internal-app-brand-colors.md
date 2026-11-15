---
id: internal-app-brand-colors
topic: internal-app
summary: Apply the colors of a brand to an internal app in brand.stylex.ts only, with tinted neutrals of low chroma, the brand color on the accent, the contrast of the accent text, and a default theme.
keywords: [brand colors, apply a brand, brand.stylex.ts, lightBrand, darkBrand, brand accent, accent color, OKLCH, tinted neutrals, neutral chroma, green brand, onAccent contrast, defaultTheme, company colors]
specializes: [color]
related: [internal-app-tokens, internal-app-themes, contrast, palettes]
---

# Internal App Brand Colors

To apply a brand, change only `src/styles/brand.stylex.ts` in the app. The other token files belong to the kit. [[color]] gives the general method for roles and scales.

## Steps

1. Convert the brand colors to OKLCH. Keep the lightness and the hue of the brand. The steps around them follow from the rules below.
2. Tint the neutrals toward the warm or cool base of the brand. Use one hue for each frame, surface, text, and border role. Keep the chroma low: 0.004 to 0.02 on light surfaces, and less than 0.012 on dark surfaces. Thus large areas stay calm.
3. Keep the surface order and its gaps in the two themes. Run `design read internal-app-tokens#surface-depth`.
4. Put the main brand color on `accent`. Make `accentHover` and `accentStrong` darker in the light theme and lighter in the dark theme.
5. Give `onAccent` text 4.5:1 contrast against `accent`. Give `accentText` 4.5:1 contrast against `raised`. [[contrast]] gives the limits.
6. If the brand is green, make the accent different from `success` in hue or chroma. Thus a primary button does not look like a status.
7. If the brand starts in one theme, set `defaultTheme` in `src/lib/brand.ts`. Run `design read internal-app-themes#theme-choice`.
8. Examine each page in the two themes, as for all color changes.
