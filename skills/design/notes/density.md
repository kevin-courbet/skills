---
id: density
topic: layout
summary: Density follows use frequency, controls in one row share one height, touch targets stay large, and page density never changes the desktop app frame.
keywords: [density, compact, comfortable, touch density, control height, button height, input height, same height, row height, toolbar, touch target, tap target, kiosk, tablet, app frame, app shell, sidebar]
requires: [hierarchy]
related: [spacing, responsive, form-fields]
---

# Density

Density is the amount of content and control in one area. Set it for the task and the device, not for one component.

## Match Density To Use Frequency

- Match density to use frequency. Repeated operational tasks need less decoration and shorter paths.
- A page that people use away from a desk, such as on a shared tablet or a kiosk, needs larger controls and text.

## Control Size

- Make controls large enough to scan and operate.
- A 48px control height is a useful starting point, not a fixed law. A product design system can set a lower height for dense desktop work. In that product, its value wins.
- Keep touch targets large enough, also when the visible icon is small.

## One Height In A Row

Controls in one row have the same height. A button, an input, a select, and a segmented control next to each other in a toolbar or a filter row all use one height.

- Set the height for the row, not for each control.
- Do not mix control sizes in one row to show importance. Use the button emphasis instead. [[hierarchy#actions]] gives the rule.

## Keep The App Frame

Changing the density of one page must not change the app frame on desktop.

- On a desktop with a mouse, the sidebar, the top bar, and the frame keep their size and position when a page uses another density. Only the page content changes.
- On a touch device, the frame can follow the density of the page, because people then use the frame with touch too.
- A density change belongs in the product design system, not in one page or one component.
