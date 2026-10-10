import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, layer, media, motion, radius, shadow, space } from "@/styles/tokens.stylex";
import { Button } from "./button";

export { DialogTrigger };

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "onOpenChange" | "defaultOpen" | "isDismissable" | "isKeyboardDismissDisabled"
> {
  readonly title: string;
  readonly description?: string;
  readonly size?: DialogSize;
  /** Footer content, usually the primary and cancel buttons. */
  readonly actions?: (close: () => void) => ReactNode;
  readonly children: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * Centered modal dialog. Use for tasks that must interrupt the page.
 * Use Sheet for secondary detail that benefits from page context.
 */
export function Dialog({
  title,
  description,
  size = "md",
  actions,
  children,
  isDismissable = true,
  ...props
}: DialogProps) {
  return (
    <ModalOverlay
      {...props}
      isDismissable={isDismissable}
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        styles.backdrop,
        state.isEntering && styles.backdropEntering,
        state.isExiting && styles.backdropExiting,
      ])}
    >
      <Modal
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          styles.modal,
          sizes[size],
          state.isEntering && styles.modalEntering,
          state.isExiting && styles.modalExiting,
        ])}
      >
        <AriaDialog {...stylex.props(styles.dialog)}>
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
                  <X {...stylex.props(styles.closeIcon)} />
                </Button>
              </header>
              <div {...stylex.props(styles.body)}>
                {typeof children === "function" ? children(close) : children}
              </div>
              {actions ? <footer {...stylex.props(styles.footer)}>{actions(close)}</footer> : null}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

const backdropIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const backdropOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const modalIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});
const modalOut = stylex.keyframes({
  from: { opacity: 1, transform: "translateY(0) scale(1)" },
  to: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
});

const styles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: layer.modal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: space.lg,
    backgroundColor: color.backdrop,
  },
  backdropEntering: {
    animationName: backdropIn,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
  },
  backdropExiting: {
    animationName: backdropOut,
    animationDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
  },
  modal: {
    width: "100%",
    maxHeight: "calc(100dvh - 2rem)",
    display: "flex",
    backgroundColor: color.overlay,
    color: color.text,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.xl,
    boxShadow: shadow.lg,
    outlineStyle: "none",
  },
  modalEntering: {
    animationName: modalIn,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.ease,
  },
  modalExiting: {
    animationName: modalOut,
    animationDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
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
    padding: space.lg,
    paddingBottom: space.sm,
  },
  headingGroup: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  title: { fontSize: font.lg, fontWeight: font.semibold, lineHeight: font.leadingTight, margin: 0 },
  description: { fontSize: font.md, color: color.textMuted },
  closeIcon: { width: "1rem", height: "1rem" },
  body: { padding: space.lg, paddingTop: space.sm, overflow: "auto", minHeight: 0 },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: space.sm,
    padding: space.lg,
    paddingTop: space.md,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
});

const sizes = stylex.create({
  sm: { maxWidth: "24rem" },
  md: { maxWidth: "32rem" },
  lg: { maxWidth: "44rem" },
});
