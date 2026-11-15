/**
 * One item of the sidebar navigation, which `AppShell` renders from the `nav` groups.
 *
 * @layer shell
 * @keywords nav link, sidebar item, navigation item, active link, current page link
 * @related AppShell, Tabs, Scrollspy
 * @notes navigation, edge-accents
 *
 * Do not render it in a page: give the item to the `nav` of `AppShell`. For
 * links inside a page, use a router `Link` or a `LinkButton`. For sections of
 * one page, use `Tabs` or `Scrollspy`.
 *
 * ## Behavior
 * - The link of the current page has `aria-current`, the selected surface,
 *   and stronger text.
 *
 * ## Rules
 * - Never add a border or a rail on the left edge of the current item.
 *
 * ## Example
 * ```tsx
 * <NavLink to="/items" icon={Package} onNavigate={closeSheet}>
 *   Items
 * </NavLink>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";

export interface NavLinkProps {
  /** The route of the item. */
  readonly to: LinkProps["to"];
  /** The params of a typed dynamic route. */
  readonly params?: LinkProps["params"];
  /** A lucide icon before the label. */
  readonly icon?: LucideIcon;
  /** The label of the item. */
  readonly children: ReactNode;
  /** Match only this exact path, for the index route. */
  readonly exact?: boolean;
  /** Runs on a click, such as to close the navigation sheet. */
  readonly onNavigate?: () => void;
}

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
    height: size.controlSm,
    paddingInline: space.sm,
    borderRadius: radius.lg,
    fontSize: font.md,
    fontWeight: font.regular,
    color: { default: color.textMuted, ":hover": color.text },
    backgroundColor: { default: "transparent", ":hover": color.frameHover },
    textDecoration: "none",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  active: {
    color: color.text,
    fontWeight: font.medium,
    backgroundColor: { default: color.frameSelected, ":hover": color.frameSelected },
  },
  icon: { width: size.iconSm, height: size.iconSm, flexShrink: 0 },
  label: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
});
