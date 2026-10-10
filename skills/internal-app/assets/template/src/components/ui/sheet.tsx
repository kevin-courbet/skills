import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, layer, media, motion, shadow, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";

export type SheetSide = "right" | "left";
export type SheetSize = "sm" | "md" | "lg";

export interface SheetProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "onOpenChange" | "defaultOpen"
> {
  readonly title: string;
  readonly description?: string;
  readonly side?: SheetSide;
  readonly size?: SheetSize;
  readonly actions?: (close: () => void) => ReactNode;
  readonly children: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * Edge panel for secondary detail or editing next to the page context, and
 * for navigation on narrow screens. Use Dialog for tasks that must interrupt.
 */
export function Sheet({
  title,
  description,
  side = "right",
  size: width = "md",
  actions,
  children,
  ...props
}: SheetProps) {
  return (
    <ModalOverlay
      {...props}
      isDismissable
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        styles.backdrop,
        state.isEntering && styles.backdropEntering,
        state.isExiting && styles.backdropExiting,
      ])}
    >
      <Modal
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          styles.panel,
          sides[side],
          widths[width],
          state.isEntering && (side === "right" ? styles.enterRight : styles.enterLeft),
          state.isExiting && (side === "right" ? styles.exitRight : styles.exitLeft),
        ])}
      >
        <Dialog {...stylex.props(styles.dialog)}>
          {({ close }) => (
            <>
              <header {...stylex.props(styles.header)}>
                <div {...stylex.props(styles.headingGroup)}>
                  <Heading slot="title" {...stylex.props(styles.title)}>
                    {title}
                  </Heading>
                  {description ? <p {...stylex.props(styles.description)}>{description}</p> : null}
                </div>
                <Button intent="ghost" size="sm" iconOnly aria-label="Close" onPress={close}>
                  <X aria-hidden {...stylex.props(styles.closeIcon)} />
                </Button>
              </header>
              <div {...stylex.props(styles.body)}>
                {typeof children === "function" ? children(close) : children}
              </div>
              {actions ? <footer {...stylex.props(styles.footer)}>{actions(close)}</footer> : null}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const slideInRight = stylex.keyframes({
  from: { transform: "translateX(100%)" },
  to: { transform: "translateX(0)" },
});
const slideOutRight = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(100%)" },
});
const slideInLeft = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(0)" },
});
const slideOutLeft = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(-100%)" },
});

const enterDuration = { default: motion.slow, [media.reducedMotion]: "0ms" } as const;
const exitDuration = { default: motion.normal, [media.reducedMotion]: "0ms" } as const;

const styles = stylex.create({
  backdrop: { position: "fixed", inset: 0, zIndex: layer.modal, backgroundColor: color.backdrop },
  backdropEntering: { animationName: fadeIn, animationDuration: enterDuration },
  backdropExiting: { animationName: fadeOut, animationDuration: exitDuration },
  panel: {
    position: "fixed",
    top: 0,
    bottom: 0,
    display: "flex",
    width: "100%",
    backgroundColor: color.overlay,
    color: color.text,
    boxShadow: shadow.lg,
    outlineStyle: "none",
  },
  enterRight: {
    animationName: slideInRight,
    animationDuration: enterDuration,
    animationTimingFunction: motion.ease,
  },
  exitRight: {
    animationName: slideOutRight,
    animationDuration: exitDuration,
    animationTimingFunction: motion.ease,
  },
  enterLeft: {
    animationName: slideInLeft,
    animationDuration: enterDuration,
    animationTimingFunction: motion.ease,
  },
  exitLeft: {
    animationName: slideOutLeft,
    animationDuration: exitDuration,
    animationTimingFunction: motion.ease,
  },
  dialog: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: 0,
    outlineStyle: "none",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
    paddingBlock: space.md,
    paddingInline: space.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  headingGroup: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  title: { fontSize: font.lg, fontWeight: font.semibold, lineHeight: font.leadingTight, margin: 0 },
  description: { fontSize: font.md, color: color.textMuted },
  closeIcon: { width: size.icon, height: size.icon },
  body: { flex: "1", minHeight: 0, overflow: "auto", padding: space.lg },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: space.sm,
    paddingBlock: space.md,
    paddingInline: space.lg,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
});

const sides = stylex.create({
  right: {
    right: 0,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: color.border,
  },
  left: {
    left: 0,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: color.border,
  },
});

const widths = stylex.create({
  sm: { maxWidth: "20rem" },
  md: { maxWidth: "28rem" },
  lg: { maxWidth: "40rem" },
});
