import * as stylex from "@stylexjs/stylex";
import { Toaster as SonnerToaster } from "sonner";
import { color, font, layer, radius, shadow, space } from "@/styles/tokens.stylex";

export { toast } from "sonner";

/**
 * Mount once in the app shell. Use toast.error for failures that have no
 * inline place. Do not toast success when the UI already shows the result.
 */
export function Toaster() {
  const base = stylex.props(styles.toast);
  const region = stylex.props(styles.region);
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      className={region.className}
      style={region.style}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: base.className ?? "",
          title: stylex.props(styles.title).className ?? "",
          description: stylex.props(styles.description).className ?? "",
          closeButton: stylex.props(styles.close).className ?? "",
          error: stylex.props(styles.error).className ?? "",
          success: stylex.props(styles.success).className ?? "",
        },
      }}
    />
  );
}

const styles = stylex.create({
  region: { zIndex: layer.toast },
  toast: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    width: "22rem",
    padding: space.md,
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
  title: { fontWeight: font.medium },
  description: { color: color.textMuted, fontSize: font.sm },
  close: { color: color.textMuted },
  error: { borderColor: color.dangerBorder },
  success: { borderColor: color.successBorder },
});
