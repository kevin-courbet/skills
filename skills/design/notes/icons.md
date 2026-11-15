---
id: icons
topic: components
summary: Reuse the project icon set or else Lucide, render icons at equal width and height with currentColor, and keep them accessible and subordinate to labels.
keywords: [icon, icons, icon size, icon library, lucide, lucide react, lucide-react, svg icon, icon button, icon only button, aria-hidden, icon font, sprite, feather icons]
requires: [accessibility]
related: [hierarchy, density, depth, sources]
---

# Icons

Use the icon library of the project when it has one. If the project has no icon standard, use Lucide as the default general-purpose set.

## Source Order

1. Reuse the current icon package and wrapper components of the project.
2. Use the icons that the product design system gives.
3. If neither source exists, use Lucide from its official package.

Do not add Lucide only to replace an equivalent project icon.

## Lucide Packages

Lucide has the ISC License. Use the package for the target:

- `lucide-react` for React.
- `lucide-vue-next` for Vue.
- `lucide-svelte` for Svelte.
- `lucide-static` for individual SVG files, SVG sprites, icon fonts, or sites without a framework.

Use the package manager of the project. Do not use a different package manager only for the icon dependency. Import icons by name, so that JavaScript bundlers can remove unused icons. Do not import the complete library into an application bundle.

## Selection

1. Search the active library for the action or the object, such as `search`, `calendar`, `user`, `warning`, or `chart`.
2. Inspect the rendered icon before use. Similar concepts can have different directional or state meanings.
3. Prefer one icon family on one surface. Do not mix stroke and fill styles without a deliberate reason.
4. Keep the icon subordinate to its label, unless the icon is the primary control.
5. Verify the optical alignment at the rendered size.

## Size And Rendering

- Lucide icons use a `24 24` view box, `currentColor`, round line caps, and round line joins.
- Set equal width and height. Keep the view box.
- Control the color through the color of the surrounding text.
- Change the stroke width only through the library API or a shared project wrapper.
- A large or solid icon often needs a softer color than the text near it. [[hierarchy#build-hierarchy]] gives the rule.
- Keep the touch target large enough, also when the visible icon is small. [[density#control-size]] gives the rule.

## License Files

When you copy SVG files from `lucide-static`, keep the complete license file that Lucide supplies. It contains the ISC terms and the MIT terms for the icons that come from Feather.

## Accessibility

- Mark decorative icons with `aria-hidden="true"`.
- Give an icon-only control an accessible name on the control, not on the SVG alone.
- Do not repeat visible button text as an SVG title.
- Do not use an icon as the only signal for status, error, or selection.
- Put the focus indicator around the complete interactive target. [[accessibility#keyboard-and-focus]] gives the rule.

## Avoid

- Do not add icons to every label or heading.
- Do not use an unfamiliar icon without text where recognition matters.
- Do not use different icons for the same action in one product.
