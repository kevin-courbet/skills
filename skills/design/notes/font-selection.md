---
id: font-selection
topic: type
summary: Select and pair typefaces for the reading task, the product tone, the languages, the performance budget, and the license.
keywords: [font, fonts, typeface, how to pick a font, choose font, font pairing, web font, woff2, font license, font loading, fallback font, layout shift, display font, serif, sans serif]
requires: [typography]
related: [sources]
---

# Font Selection

Choose type for the reading task, the product tone, the language coverage, the performance budget, and the available license.

## Selection Workflow

1. Classify the interface: application UI, long-form content, marketing, or a combination.
2. Check the existing product font and design tokens before you add a family.
3. Verify the font license for the required web, application, or document use.
4. Test the real character set, numerals, punctuation, and target languages.
5. Test body text, metadata, controls, headings, and dense numeric content at real sizes.
6. Check the loading cost, the fallback metrics, and the layout shift.
7. Define a small type system by role. Do not use every available style.

## Application UI

Prefer a family with:

- Clear forms at small sizes.
- A useful x-height and neutral proportions.
- Distinct ambiguous characters, such as `I`, `l`, `1`, `O`, and `0`.
- Regular, medium or semibold, and bold weights.
- Tabular numerals when data comparison matters.
- Broad language coverage for the product audience.

Use a fixed `rem` scale for dense product UI, unless the existing design system uses another accessible method.

## Long-Form Content

Prioritize a comfortable texture, clear punctuation, suitable italics, and stable reading at the target line length. A serif or a sans serif can work. Test paragraphs, not isolated specimen words.

The source examples include Freight Text, Source Sans, Open Sans, Merriweather, Proxima Nova, Franklin Gothic, and Camphor. Treat these as references, not defaults. Verify the current availability and license terms.

## Headlines And Display Text

Display type can carry more personality than body text. The source examples include Proxima Nova, Freight Sans, Futura PT, Harmonia Sans, Graphik, Meta Serif, Roboto, Jubilat, Interstate, Neue Plak, and Adelle.

- Do not use a display face for body text only because it works at a large size.
- Check line-height, letter spacing, and weight again after every font change.

## Pairing

- Start with one strong family and multiple weights.
- Add a second family only when it gives the content a distinct voice or a useful structural contrast.
- Pair clearly different families, not two sans serifs that almost match.
- Keep the metrics compatible enough to prevent unstable line breaks and controls.
- Limit a product to the smallest number of families that serves the content.

## Delivery

- Prefer WOFF2 for web delivery.
- Subset only after you know the required languages and symbols.
- Use an explicit fallback stack.
- Match the fallback metrics when layout shift matters.
