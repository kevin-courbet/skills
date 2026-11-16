/**
 * The region for toasts, and the `toast` function that shows one.
 *
 * @layer primitive
 * @keywords toast, toast after save, notification, snackbar, error toast, success message, flash message
 * @related AppShell, Alert, CopyButton, Kanban, WorkQueue
 * @notes overlays, form-errors, loading-states, ux-writing, kit-states, kit-writing
 *
 * Use `toast.error` for a failure that has no inline place, such as a move that
 * a board puts back. Do not use a toast for a form error: show it at the field.
 * For a notice about the page, use `Alert`.
 *
 * ## Behavior
 * - `AppShell` mounts the only `Toaster`, at the bottom right, with a close
 *   button on each toast. Do not mount another one.
 * - An error toast shows the danger icon, and a success toast the success icon.
 *
 * ## Rules
 * - Do not show a success toast when the UI already shows the result, such as
 *   a saved field, a new row, or a card in its new column. Show one only when
 *   the result is not on the screen.
 * - The title names the object and the problem. The description says what to
 *   do: "WO-1042 did not change. Try again."
 *
 * ## Example
 * ```tsx
 * toast.error(`${order.id} did not change. Try again.`);
 * toast.error("The theme could not be saved", { description: failureMessage(error) });
 * // The order goes to the supplier, so the page does not show the result.
 * toast.success(`Parts order sent to ${supplier.name}`);
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { Toaster as SonnerToaster } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { color, font, layer, radius, shadow, space } from "@/styles/tokens.stylex";

export { toast } from "sonner";

export function Toaster() {
  const base = stylex.props(styles.toast);
  const region = stylex.props(styles.region);
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      icons={{
        error: <CircleAlert width={16} height={16} {...stylex.props(styles.errorIcon)} />,
        success: <CircleCheck width={16} height={16} {...stylex.props(styles.successIcon)} />,
      }}
      className={region.className}
      style={region.style}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: base.className ?? "",
          icon: stylex.props(styles.icon).className ?? "",
          content: stylex.props(styles.content).className ?? "",
          title: stylex.props(styles.title).className ?? "",
          description: stylex.props(styles.description).className ?? "",
          closeButton: stylex.props(styles.close).className ?? "",
        },
      }}
    />
  );
}

const styles = stylex.create({
  region: { zIndex: layer.toast },
  toast: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    width: "22rem",
    padding: space.md,
    // Room for the close button at the top right.
    paddingInlineEnd: `calc(${space.md} + 1.5rem)`,
    fontFamily: font.sans,
    fontSize: font.md,
    color: color.text,
    backgroundColor: color.overlay,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    boxShadow: shadow.lg,
  },
  // As tall as the first line of the title, so the icon centers on it.
  icon: { display: "flex", alignItems: "center", flexShrink: 0, height: "1lh" },
  content: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  title: { fontWeight: font.medium },
  description: { color: color.textMuted, fontSize: font.sm },
  close: {
    position: "absolute",
    top: space.sm,
    insetInlineEnd: space.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.sm,
    color: { default: color.textMuted, ":hover": color.text },
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  errorIcon: { color: color.danger },
  successIcon: { color: color.success },
});
