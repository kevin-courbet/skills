/**
 * The shared surface and the enter and exit motion of popovers, menus, option lists, and tooltips.
 *
 * @layer helper
 * @keywords overlay styles, popover surface, dropdown surface, overlay animation, enter animation, exit animation
 * @related Popover, Menu, ListBox, Tooltip, HoverCard, Density
 * @notes depth, component-feel, reduced-motion, kit-adding-a-component
 *
 * Use it only in kit code that builds a new overlay. Pages do not use it: they
 * use `Popover`, `Menu`, `Select`, or another kit overlay.
 *
 * ## Behavior
 * - `overlay.popover` gives the surface, the border, the radius, the shadow,
 *   and the layer.
 * - `overlay.entering` and `overlay.exiting` give the closed state. The
 *   overlay grows from 0.97 to full size from the point next to its trigger
 *   and fades in. It closes faster than it opens.
 * - The motion is a CSS transition, so an overlay that people close while it
 *   opens, or open while it closes, turns back from where it is.
 * - Under reduced motion, the overlay only fades.
 * - `overlay.instant` removes the transition, for a tooltip that opens while
 *   another tooltip is open.
 * - `overlay.matchTrigger` makes a popover at least as wide as its field.
 *
 * ## Rules
 * - A new overlay puts `...useOverlayDensity()` first in the styles of its
 *   portal root, then `overlay.popover`.
 * - An overlay without the popover surface puts `overlay.transition` in its
 *   styles before `overlay.entering` and `overlay.exiting`.
 *
 * ## Example
 * ```tsx
 * <Popover
 *   {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
 *     ...overlayDensity,
 *     overlay.popover,
 *     state.isEntering && overlay.entering,
 *     state.isExiting && overlay.exiting,
 *   ])}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { color, layer, media, motion, radius, shadow } from "@/styles/tokens.stylex";

// react-aria sets --trigger-anchor-point on a popover and a tooltip, so that
// the overlay grows from its trigger. A modal has no trigger and keeps the center.
const fromTrigger = "var(--trigger-anchor-point, center)";
const closed = { opacity: 0, transform: { default: "scale(0.97)", [media.reducedMotion]: "none" } };

export const overlay = stylex.create({
  popover: {
    backgroundColor: color.overlay,
    color: color.text,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    boxShadow: shadow.lg,
    zIndex: layer.dropdown,
    outlineStyle: "none",
    transformOrigin: fromTrigger,
    transitionProperty: "opacity, transform",
    transitionDuration: motion.normal,
    transitionTimingFunction: motion.easeOut,
  },
  /** The motion of `popover` for an overlay with its own surface, such as a tooltip. */
  transition: {
    transformOrigin: fromTrigger,
    transitionProperty: "opacity, transform",
    transitionDuration: motion.normal,
    transitionTimingFunction: motion.easeOut,
  },
  /** react-aria sets --trigger-width on popovers anchored to a field. */
  matchTrigger: { minWidth: "var(--trigger-width)" },
  entering: closed,
  exiting: { ...closed, transitionDuration: motion.fast },
  instant: { transitionDuration: "0ms" },
});
