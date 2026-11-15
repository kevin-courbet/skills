---
id: overlays
topic: components
summary: Use a modal only when the task must interrupt, keep confirmations on the object and its consequence, and match alert prominence to severity.
keywords: [modal, modal or page, dialog, overlay, popup, popover, popover api, inert, focus trap, confirmation, confirm delete, undo, destructive confirmation, alert, alerts, notice, banner, toast, warning message, sheet, drawer]
requires: [hierarchy]
related: [form-errors, dark-theme, edge-accents]
---

# Overlays And Alerts

An overlay takes the attention from the page. Use it only when the task needs that.

## Modals

Use a modal only when the task must interrupt the current context. Otherwise, use a page or an inline section.

- Open a modal with the native `<dialog>` element and `dialog.showModal()`. It traps the focus and closes on Escape.
- When you build the modal without `<dialog>`, set the `inert` attribute on the content behind it, so that people cannot focus or click it.

## Popovers

For tooltips, dropdowns, and other overlays that are not modal, use the native Popover API. It closes on an outside click, stacks correctly without z-index conflicts, and is accessible by default.

```html
<button popovertarget="menu">Open menu</button>
<div id="menu" popover>
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

## Destructive Confirmation

Undo is better than a confirmation, because people click through confirmations without reading them. Remove the item from the interface at once, show a toast with an undo action, and delete the item when the toast expires.

Use a confirmation only for an action that is truly irreversible, such as the deletion of an account, for an action with a high cost, and for a batch operation. Keep a destructive confirmation focused on the affected object and the consequence. [[ux-writing#confirmation-dialogs]] gives the labels.

## Alerts And Notices

- Match the prominence of an alert to its severity and to the required action.
- Do not make informational notices compete with the primary page content.
- Do not mark a notice with a strip on one edge. [[edge-accents]] gives the rule.
