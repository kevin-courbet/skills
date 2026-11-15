/**
 * The shared surface and the enter and exit motion of popovers, menus, option lists, and tooltips.
 *
 * @layer helper
 * @keywords overlay styles, popover surface, dropdown surface, overlay animation, enter animation, exit animation
 * @related Popover, Menu, ListBox, Tooltip, HoverCard, Density
 * @notes depth, component-feel, reduced-motion, internal-app-adding-a-primitive
 *
 * Use it only in kit code that builds a new overlay. Pages do not use it: they
 * use `Popover`, `Menu`, `Select`, or another kit overlay.
 *
 * ## Behavior
 * - `overlay.popover` gives the surface, the border, the radius, the shadow,
 *   and the layer.
 * - `overlay.entering` fades in from a slightly smaller scale.
 *   `overlay.exiting` fades out faster. Under reduced motion, both take 0 ms.
 * - `overlay.matchTrigger` makes a popover at least as wide as its field.
 *
 * ## Rules
 * - A new overlay puts `...useOverlayDensity()` first in the styles of its
 *   portal root, then `overlay.popover`.
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

const fadeIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(-2px) scale(0.98)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

const fadeOut = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

/** Shared surface styles for popovers, menus, list boxes, and tooltips. */
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
  },
  /** react-aria sets --trigger-width on popovers anchored to a field. */
  matchTrigger: { minWidth: "var(--trigger-width)" },
  entering: {
    animationName: fadeIn,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.easeOut,
  },
  exiting: {
    animationName: fadeOut,
    animationDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.ease,
  },
});
