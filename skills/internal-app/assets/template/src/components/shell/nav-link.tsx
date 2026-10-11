import * as stylex from "@stylexjs/stylex";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";

export interface NavLinkProps {
  readonly to: LinkProps["to"];
  readonly params?: LinkProps["params"];
  readonly icon?: LucideIcon;
  readonly children: ReactNode;
  readonly exact?: boolean;
  readonly onNavigate?: () => void;
}

/**
 * Sidebar navigation item. The current page uses a selected surface and
 * stronger text with aria-current. Never add a left-edge border or rail.
 */
export function NavLink({
  to,
  params,
  icon: Icon,
  children,
  exact = false,
  onNavigate,
}: NavLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      onClick={onNavigate}
      activeOptions={{ exact }}
      {...stylex.props(styles.link)}
      activeProps={{ className: stylex.props(styles.link, styles.active).className ?? "" }}
    >
      {Icon ? <Icon aria-hidden {...stylex.props(styles.icon)} /> : null}
      <span {...stylex.props(styles.label)}>{children}</span>
    </Link>
  );
}

const styles = stylex.create({
  link: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    height: "1.875rem",
    paddingInline: space.sm,
    borderRadius: radius.md,
    fontSize: font.md,
    fontWeight: font.regular,
    color: { default: color.textMuted, ":hover": color.text },
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    textDecoration: "none",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  active: {
    color: color.text,
    fontWeight: font.medium,
    backgroundColor: { default: color.selected, ":hover": color.selected },
  },
  icon: { width: size.icon, height: size.icon, flexShrink: 0 },
  label: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
});
