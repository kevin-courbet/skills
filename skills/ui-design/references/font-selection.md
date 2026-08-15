# Font Selection

Choose type for the reading task, product tone, language coverage, performance budget, and available license.

## Selection Workflow

1. Classify the interface as application UI, long-form content, marketing, or a combination.
2. Check the existing product font and design tokens before adding a family.
3. Verify the font license and the required web, application, or document use.
4. Test the actual character set, numerals, punctuation, and target languages.
5. Test body text, metadata, controls, headings, and dense numeric content at real sizes.
6. Check loading cost, fallback metrics, and layout shift.
7. Define a small role-based type system instead of using every available style.

## Application UI

Prefer a family with:

- Clear forms at small sizes.
- A useful x-height.
- Distinct ambiguous characters such as `I`, `l`, `1`, `O`, and `0`.
- Regular, medium or semibold, and bold weights.
- Tabular numerals when data comparison matters.
- Broad language coverage for the product audience.

Use a fixed `rem` scale for dense product UI unless the existing design system uses another accessible method.

## Long-Form Content

Prioritize comfortable texture, clear punctuation, suitable italics, and stable reading at the target line length. A serif or sans serif can work. Test paragraphs, not isolated specimen words.

The source examples include families such as Freight Text, Source Sans, Open Sans, Merriweather, Proxima Nova, Franklin Gothic, and Camphor. Treat these as references, not defaults. Verify current availability and license terms.

## Headlines And Display Text

Display type can carry more personality than body text. The source examples include Proxima Nova, Freight Sans, Futura PT, Harmonia Sans, Graphik, Meta Serif, Roboto, Jubilat, Interstate, Neue Plak, and Adelle.

Do not use a display face for body text only because it works at a large size. Recheck line-height, letter spacing, and weight after every font change.

## Pairing

- Start with one family and multiple weights.
- Add a second family only when it creates a useful voice or structural contrast.
- Pair clearly different families rather than two almost-matching sans serifs.
- Keep metrics compatible enough to avoid unstable line breaks and controls.
- Limit a product to the smallest number of families that serves the content.

## Delivery

- Prefer WOFF2 for web delivery.
- Subset only after required languages and symbols are known.
- Use an explicit fallback stack.
- Match fallback metrics when layout shift matters.
- Respect user zoom and browser font settings.
