// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * An inline notice about the page or the object on it.
 *
 * @layer primitive
 * @keywords alert, notice, banner, callout, inline message, warning message, success message, info box, held state
 * @related Feedback, FormLayout, Toaster, Badge, Layout
 * @notes overlays, form-errors, ux-writing, edge-accents, kit-states, kit-writing
 *
 * Use it for a fact that people must see on the page, such as a paused deploy
 * or the result of a submit. Do not use it for a failed load: use `ErrorState`
 * of `Feedback`. For a failure with no place on the page, use a toast. For the
 * errors of a form, use `ErrorSummary` of `FormLayout`.
 *
 * ## Behavior
 * - Each intent has its own icon and colors. `icon` replaces the icon.
 *
 * ## Rules
 * - Match the intent to the severity. Do not use `danger` for information.
 * - After a successful submit, replace the form with a success `Alert` with
 *   `announce="status"`. The title names the new record, and one action starts
 *   the next task.
 *
 * ## Example
 * ```tsx
 * <Alert
 *   intent="success"
 *   announce="status"
 *   title="Badge V-2318 is printing at reception"
 *   actions={<Button onPress={reset}>Register another visitor</Button>}
 * >
 *   The host gets a message when the visitor arrives.
 * </Alert>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import {
  CircleAlert,
  CircleCheck,
  Info,
  type LucideIcon,
  MessageSquare,
  TriangleAlert,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";

export type AlertIntent = "neutral" | "info" | "success" | "warning" | "danger";

export interface AlertProps {
  /** Severity: `success` for a result, `warning` for a risk, `danger` for a failure or a block, and `neutral` for a plain note. */
  readonly intent?: AlertIntent;
  /**
   * States the fact in one sentence. It wraps to as many lines as it needs and
   * can hold inline elements such as Code.
   */
  readonly title: ReactNode;
  /** What it means or what to do. Inline text and Code stay in one flowing paragraph. */
  readonly children?: ReactNode;
  /** One or two buttons. They sit at the end on wide screens and wrap under the text on narrow ones. */
  readonly actions?: ReactNode;
  /** Replaces the intent icon, for example a pause icon for a held state. */
  readonly icon?: LucideIcon;
  /** Adds a close button. Use only when the notice is safe to hide. */
  readonly onDismiss?: () => void;
  /**
   * Announces the alert when it appears after the page loaded: `status` for
   * information, `alert` for a failure that needs attention now. Leave it out
   * for notices that render with the page.
   */
  readonly announce?: "status" | "alert";
}

const icons: Record<AlertIntent, LucideIcon> = {
  neutral: MessageSquare,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export function Alert({
  intent = "info",
  title,
  children,
  actions,
  icon,
  onDismiss,
  announce,
}: AlertProps) {
  const Icon = icon ?? icons[intent];
  return (
    <div role={announce} {...stylex.props(styles.root, intents[intent])}>
      <Icon aria-hidden {...stylex.props(styles.icon, iconColors[intent])} />
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.body)}>
          <p {...stylex.props(styles.title)}>{title}</p>
          {children ? <div {...stylex.props(styles.text)}>{children}</div> : null}
        </div>
        {actions ? <div {...stylex.props(styles.actions)}>{actions}</div> : null}
      </div>
      {onDismiss ? (
        <Button
          intent="ghost"
          size="sm"
          iconOnly
          icon={X}
          aria-label="Dismiss"
          onPress={onDismiss}
          style={styles.dismiss}
        />
      ) : null}
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.md,
    paddingBlock: space.md,
    paddingInline: space.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: radius.lg,
    color: color.text,
  },
  icon: { width: size.icon, height: size.icon, flexShrink: 0, marginTop: "0.125rem" },
  content: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: space.lg,
    rowGap: space.sm,
    flex: "1",
    minWidth: 0,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "20rem",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: font.md,
    fontWeight: font.semibold,
    lineHeight: font.leadingNormal,
    overflowWrap: "anywhere",
  },
  text: {
    fontSize: font.md,
    lineHeight: font.leadingNormal,
    color: color.textMuted,
    overflowWrap: "anywhere",
  },
  actions: { display: "flex", alignItems: "center", gap: space.sm, flexShrink: 0 },
  dismiss: { marginBlock: "-0.25rem", marginInlineEnd: "-0.25rem" },
});

const intents = stylex.create({
  neutral: { backgroundColor: color.subtle, borderColor: color.border },
  info: { backgroundColor: color.infoMuted, borderColor: color.infoBorder },
  success: { backgroundColor: color.successMuted, borderColor: color.successBorder },
  warning: { backgroundColor: color.warningMuted, borderColor: color.warningBorder },
  danger: { backgroundColor: color.dangerMuted, borderColor: color.dangerBorder },
});

const iconColors = stylex.create({
  neutral: { color: color.textMuted },
  info: { color: color.info },
  success: { color: color.success },
  warning: { color: color.warning },
  danger: { color: color.danger },
});
