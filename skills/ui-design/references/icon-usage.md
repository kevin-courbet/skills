# Icon Usage

Use the project's existing icon library when one is present. If the project has no icon standard, use Lucide as the default general-purpose set.

## Source Order

1. Reuse the project's current icon package and wrapper components.
2. Use icons already provided by the product design system.
3. If neither source exists, use Lucide from its official package.

Do not add Lucide only to replace an equivalent project icon.

## Lucide Packages

Lucide is distributed under the ISC License. Use the package that matches the target:

- `lucide-react` for React.
- `lucide-vue-next` for Vue.
- `lucide-svelte` for Svelte.
- `lucide-static` for individual SVG files, SVG sprites, icon fonts, or framework-free sites.

Use the project's package manager. Do not use a different package manager only for the icon dependency. Import icons by name so JavaScript bundlers can remove unused icons.

Official documentation: `https://lucide.dev/guide/`

Official license: `https://lucide.dev/license`

## Selection Workflow

1. Search the active library for the action or object, such as `search`, `calendar`, `user`, `warning`, or `chart`.
2. Inspect the rendered icon before use. Similar concepts can have different directional or state meanings.
3. Prefer one icon family within a surface. Do not mix stroke and fill styles without a deliberate reason.
4. Keep the icon subordinate to its label unless the icon is the primary control.
5. Verify optical alignment at the rendered size.

## Rendering

Lucide icons use a `24 24` view box, `currentColor`, round line caps, and round line joins. Set equal width and height, preserve the view box, and control color through the surrounding text color. Change stroke width only through the library API or a shared project wrapper.

When copying SVG files from `lucide-static`, preserve the complete license file supplied by Lucide. It contains the ISC terms and the MIT terms for icons derived from Feather.

## Accessibility

- Mark decorative icons with `aria-hidden="true"`.
- Give an icon-only control an accessible name on the control, not on the SVG alone.
- Do not repeat visible button text as an SVG title.
- Keep a visible focus indicator around the complete interactive target.
- Do not use an icon as the only signal for status, error, or selection.
- Keep touch targets large enough even when the visible icon is small.

## Avoid

- Do not add icons to every label or heading.
- Do not use an unfamiliar icon without text where recognition matters.
- Do not use different icons for the same action across one product.
- Do not import the complete library into an application bundle.
