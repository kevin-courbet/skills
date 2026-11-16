---
id: kit-icons
topic: kit
summary: Use lucide-react icons by name at 16 or 14 px, hide decorative icons from screen readers, and use one icon for one concept.
keywords: [icons, lucide, icon size, icon button, aria-hidden, icon only button, icon set, svg icon]
specializes: [icons]
related: [kit-composition]
---

# Kit Icons

## Rules

- Use `lucide-react` only, and import each icon by name.
- Give an icon to a kit control with its `icon` prop, such as on `Button`, `LinkButton`, `ToggleButton`, and `MenuItem`. The control sizes the icon and hides it from screen readers. Do not put an icon in the children of a `Button`.
- Size other icons with StyleX, with `size.icon` (16 px) or `size.iconSm` (14 px), or with `width` and `height` props of 16.
- Give a decorative icon `aria-hidden`. Give an icon-only button an `aria-label`.
- Use the same icon for the same concept in all of the app.
- Put an icon on a surface with `IconTile`, and the icon of a file with `FileTypeIcon`.
