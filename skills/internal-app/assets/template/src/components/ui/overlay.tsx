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
