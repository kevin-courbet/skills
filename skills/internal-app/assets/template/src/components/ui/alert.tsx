import * as stylex from "@stylexjs/stylex";
import { CircleAlert, CircleCheck, Info, type LucideIcon, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";

export type AlertIntent = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  readonly intent?: AlertIntent;
  readonly title: string;
  readonly children?: ReactNode;
  readonly action?: ReactNode;
}

const icons: Record<AlertIntent, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

/**
 * Inline notice about the current page or object. The title states the fact;
 * the body says what to do. Use ErrorState for a failed load.
 */
export function Alert({ intent = "info", title, children, action }: AlertProps) {
  const Icon = icons[intent];
  return (
    <div {...stylex.props(styles.root, intents[intent])}>
      <Icon aria-hidden {...stylex.props(styles.icon, iconColors[intent])} />
      <div {...stylex.props(styles.body)}>
        <p {...stylex.props(styles.title)}>{title}</p>
        {children ? <div {...stylex.props(styles.text)}>{children}</div> : null}
      </div>
      {action ? <div {...stylex.props(styles.action)}>{action}</div> : null}
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.md,
    padding: space.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: radius.lg,
    color: color.text,
  },
  icon: { width: size.icon, height: size.icon, flexShrink: 0, marginTop: "0.125rem" },
  body: { display: "flex", flexDirection: "column", gap: space.xs, flex: "1", minWidth: 0 },
  title: { fontSize: font.md, fontWeight: font.semibold },
  text: { fontSize: font.md, color: color.textMuted },
  action: { flexShrink: 0 },
});

const intents = stylex.create({
  info: { backgroundColor: color.infoMuted, borderColor: color.infoBorder },
  success: { backgroundColor: color.successMuted, borderColor: color.successBorder },
  warning: { backgroundColor: color.warningMuted, borderColor: color.warningBorder },
  danger: { backgroundColor: color.dangerMuted, borderColor: color.dangerBorder },
});

const iconColors = stylex.create({
  info: { color: color.info },
  success: { color: color.success },
  warning: { color: color.warning },
  danger: { color: color.danger },
});
