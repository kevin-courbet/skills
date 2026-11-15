/**
 * A centered modal dialog for a short task, such as a create form of up to about six fields.
 *
 * @layer primitive
 * @keywords dialog, modal, modal dialog, popup form, create dialog, edit dialog, modal window
 * @related ConfirmDialog, Sheet, Popover, FormLayout, Button
 * @notes overlays, forms, internal-app-page-patterns, internal-app-forms
 *
 * Use it for a short task that must interrupt the page. Do not use it for a
 * form of more than about six fields or of several parts: use a route with
 * `FormLayout`. For detail or editing next to the list behind it, use `Sheet`.
 * To confirm a destructive step, use `ConfirmDialog`.
 *
 * ## Behavior
 * - Focus moves into the dialog and stays there. Escape, the close button, and
 *   a click on the backdrop close it, and the focus goes back to the trigger.
 * - The dialog takes the density of the page and the `md` control size.
 * - It fades and rises in. Under reduced motion, it appears at once.
 *
 * ## Rules
 * - Wrap the trigger and the `Dialog` in `DialogTrigger`, or control it with
 *   `isOpen` and `onOpenChange`.
 * - Give the form in the body an `id`. The submit `Button` in `actions` takes
 *   `type="submit"` and `form={formId}`.
 *
 * ## Example
 * ```tsx
 * <DialogTrigger>
 *   <Button intent="primary">Create item</Button>
 *   <Dialog
 *     title="Create item"
 *     actions={(close) => (
 *       <>
 *         <Button onPress={close}>Cancel</Button>
 *         <Button intent="primary" type="submit" form={formId}>Create item</Button>
 *       </>
 *     )}
 *   >
 *     <CreateItemForm id={formId} />
 *   </Dialog>
 * </DialogTrigger>
 * ```
 */
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
import {
  color,
  font,
  layer,
  media,
  motion,
  radius,
  shadow,
  size,
  space,
} from "@/styles/tokens.stylex";
import { Button } from "./button";
import { ControlSizeProvider } from "./control-size";
import { useOverlayDensity } from "./density";

export { DialogTrigger };

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "onOpenChange" | "defaultOpen" | "isDismissable" | "isKeyboardDismissDisabled"
> {
  /** Heading and accessible name. It names the task, such as "Create item". */
  readonly title: string;
  /** One paragraph under the title. It can hold inline elements such as Code. */
  readonly description?: ReactNode;
  /** Maximum width: `sm` 24rem, `md` 32rem, and `lg` 44rem. */
  readonly size?: DialogSize;
  /** Footer content, usually the primary and cancel buttons. */
  readonly actions?: (close: () => void) => ReactNode;
  /** The body. A function receives `close`, for a form that closes after its submit. */
  readonly children: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * Centered modal dialog. Use for tasks that must interrupt the page.
 * Use Sheet for secondary detail that benefits from page context.
 */
export function Dialog({
  title,
  description,
  size: width = "md",
  actions,
  children,
  isDismissable = true,
  ...props
}: DialogProps) {
  const overlayDensity = useOverlayDensity();
  return (
    <ControlSizeProvider size="md">
      <ModalOverlay
        {...props}
        isDismissable={isDismissable}
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          ...overlayDensity,
          styles.backdrop,
          state.isEntering && styles.backdropEntering,
          state.isExiting && styles.backdropExiting,
        ])}
      >
        <Modal
          {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
            styles.modal,
            sizes[width],
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
                    {description ? (
                      <p {...stylex.props(styles.description)}>{description}</p>
                    ) : null}
                  </div>
                  <Button intent="ghost" size="sm" iconOnly aria-label="Close" onPress={close}>
                    <X {...stylex.props(styles.closeIcon)} />
                  </Button>
                </header>
                <div {...stylex.props(styles.body)}>
                  {typeof children === "function" ? children(close) : children}
                </div>
                {actions ? (
                  <footer {...stylex.props(styles.footer)}>{actions(close)}</footer>
                ) : null}
              </>
            )}
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    </ControlSizeProvider>
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
    animationTimingFunction: motion.easeOut,
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
  closeIcon: { width: size.icon, height: size.icon },
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
