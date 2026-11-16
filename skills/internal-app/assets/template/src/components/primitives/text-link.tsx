// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A link inside text: in a sentence, in a `DescriptionList` value, or in a table cell.
 *
 * @layer primitive
 * @keywords text link, inline link, link in text, link in a sentence, external link, open in new tab, link to a record, link in a table cell, anchor
 * @related LinkButton, Button, Layout, Table, DataTable
 * @notes ux-writing, accessibility, internal-app-writing
 *
 * Use it for a link that is part of the text, such as a customer name in a
 * table cell or "the runbook" in a sentence. Do not use it for navigation
 * that reads as an action, such as "Create item": use `LinkButton`. Do not use
 * it for an action that stays on the page: use `Button` with `intent="ghost"`.
 *
 * ## Behavior
 * - With `to`, it is a router `Link`. It takes the same props as `LinkButton`,
 *   such as `to`, `params`, and `search`, and the router checks their types.
 * - With `href`, it is an external link. It opens in a new tab with
 *   `rel="noreferrer"` and shows an external-link icon. Screen readers hear
 *   "opens in a new tab".
 * - `inline` has the accent color and an underline. `quiet` has the color of
 *   the text, and the underline shows on hover with a mouse.
 *
 * ## Rules
 * - Use `inline` in running text, so that the underline shows the link
 *   without the color.
 * - Use `quiet` where the place already shows a link, such as the name column
 *   of a table.
 * - Give `href` an absolute `http` or `https` URL. It throws for other values.
 * - Write the destination as the link text, such as "Invoice 2041". Do not
 *   write "click here".
 *
 * ## Example
 * ```tsx
 * <TextLink to="/customers/$customerId" params={{ customerId: job.customerId }}>
 *   {job.customerName}
 * </TextLink>
 * <TextLink href="https://status.example.com">Status page</TextLink>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { color, media, motion, radius } from "@/styles/tokens.stylex";
import { field } from "@/components/helpers/field";

/** `inline` for running text. `quiet` for a place that already shows a link, such as a table cell. */
export type TextLinkVariant = "inline" | "quiet";

interface TextLinkOwnProps {
  /** `inline` has the accent color and an underline. `quiet` keeps the text color. */
  readonly variant?: TextLinkVariant;
  /** The name of the destination, such as "Invoice 2041". */
  readonly children: ReactNode;
  /** Layout overrides, applied last. */
  readonly style?: StyleXStyles;
}

export type TextLinkRouterProps = TextLinkOwnProps &
  Omit<
    LinkComponentProps<"a">,
    "className" | "style" | "children" | "activeProps" | "inactiveProps" | "href" | "target" | "rel"
  > & {
    /** Not used for a route. Give `to`. */
    readonly href?: never;
  };

export interface TextLinkExternalProps extends TextLinkOwnProps {
  /** An absolute `http` or `https` URL outside the app. The link opens in a new tab. */
  readonly href: string;
}

export type TextLinkProps = TextLinkRouterProps | TextLinkExternalProps;

export function TextLink(props: TextLinkProps) {
  if (isExternal(props)) {
    const { href, variant = "inline", style, children } = props;
    if (!/^https?:\/\//.test(href))
      throw new Error(
        `TextLink takes an absolute http or https URL in href, not "${href}". Give a route of the app in to.`,
      );
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        {...stylex.props(styles.base, variants[variant], style)}
      >
        {children}
        <ExternalLink aria-hidden {...stylex.props(styles.icon)} />
        <span {...stylex.props(field.hiddenLabel)}> (opens in a new tab)</span>
      </a>
    );
  }
  const { variant = "inline", style, children, ...linkProps } = props;
  const resolved = stylex.props(styles.base, variants[variant], style);
  return (
    <Link {...linkProps} className={resolved.className} style={resolved.style}>
      {children}
    </Link>
  );
}

function isExternal(props: TextLinkProps): props is TextLinkExternalProps {
  return props.href !== undefined;
}

const styles = stylex.create({
  base: {
    borderRadius: radius.sm,
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.2em",
    cursor: "pointer",
    transitionProperty: "color, text-decoration-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
    WebkitTapHighlightColor: "transparent",
  },
  // The icon sits on the last word, so a link that wraps does not leave it alone on a line.
  icon: {
    display: "inline-block",
    width: "0.85em",
    height: "0.85em",
    marginInlineStart: "0.2em",
    verticalAlign: "-0.1em",
    opacity: 0.7,
  },
});

const variants = stylex.create({
  inline: {
    color: color.accentText,
    textDecorationLine: "underline",
    textDecorationColor: {
      default: color.accentBorder,
      ":hover": { default: color.accentBorder, [media.finePointer]: "currentColor" },
    },
  },
  quiet: {
    color: "inherit",
    textDecorationLine: {
      default: "none",
      ":hover": { default: "none", [media.finePointer]: "underline" },
    },
    textDecorationColor: color.borderStrong,
  },
});
