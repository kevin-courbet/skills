// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * A preview card that opens on hover, focus, or long press of a link or a button.
 *
 * @layer primitive
 * @keywords hover card, hover preview, preview on hover, person preview, mouse over card, record preview, popover on hover
 * @related Tooltip, Popover, Sheet, Avatar, DataTable
 * @notes overlays, accessibility, internal-app-composition
 *
 * Use it for a short preview of a person or a record that the page names, such
 * as in a table cell. Do not use it for a short hint: use `Tooltip`. Do not use
 * it for fields: use `Popover`. To read a full record over its list, use `Sheet`
 * with `size="peek"`.
 *
 * ## Behavior
 * - The card opens after `delay` on hover, on keyboard focus, and on a long
 *   press. It takes the density of the page and the `md` control size.
 * - The card can hold links and buttons.
 *
 * ## Rules
 * - Never put information in the card that the page does not show or link to.
 *   A touch screen has no hover, and the card is a shortcut only.
 *
 * ## Example
 * ```tsx
 * <HoverCard content={<PersonPreview person={owner} />}>
 *   <HoverCardLink href={`/people/${owner.id}`}>{owner.name}</HoverCardLink>
 * </HoverCard>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Link, Popover, PreviewTrigger } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { overlay } from "@/components/helpers/overlay";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import { useOverlayDensity } from "@/components/helpers/density";

export interface HoverCardProps {
  /**
   * The element that shows the card: a HoverCardLink, or a kit Button. It must
   * be a react-aria element so it receives the hover and focus handlers.
   */
  readonly children: ReactNode;
  /** Card content: a short preview of the record, such as a person or a deployment. */
  readonly content: ReactNode;
  /** Side of the trigger where the card opens. */
  readonly placement?: "bottom start" | "bottom" | "top start" | "top" | "right" | "left";
  /** Wait before the card opens, in milliseconds. */
  readonly delay?: number;
}

/**
 * A preview that opens when people hover, focus, or long-press a link, such
 * as a person or a record in a table. It may hold links and buttons. Never
 * put information there that the page does not also show or link to.
 */
export function HoverCard({
  children,
  content,
  placement = "bottom start",
  delay,
}: HoverCardProps) {
  const overlayDensity = useOverlayDensity();
  return (
    <PreviewTrigger delay={delay}>
      {children}
      <ControlSizeProvider size="md">
        <Popover
          placement={placement}
          offset={6}
          {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
            ...overlayDensity,
            overlay.popover,
            styles.card,
            state.isEntering && overlay.entering,
            state.isExiting && overlay.exiting,
          ])}
        >
          {content}
        </Popover>
      </ControlSizeProvider>
    </PreviewTrigger>
  );
}

export interface HoverCardLinkProps {
  /** The link text, such as the name of a person. */
  readonly children: ReactNode;
  /** Where the link goes, such as the record's detail page. Without it the link only previews. */
  readonly href?: string;
}

/** Inline text link that triggers a HoverCard, such as a name in a table cell. */
export function HoverCardLink({ children, href }: HoverCardLinkProps) {
  return (
    <Link
      href={href}
      {...renderStyles<{ isFocusVisible: boolean; isHovered: boolean }>((state) => [
        styles.link,
        state.isHovered && styles.linkHovered,
        state.isFocusVisible && styles.linkFocused,
      ])}
    >
      {children}
    </Link>
  );
}

const styles = stylex.create({
  card: {
    width: "18rem",
    maxWidth: "calc(100vw - 2rem)",
    padding: space.md,
    fontSize: font.md,
  },
  link: {
    color: color.text,
    fontWeight: font.medium,
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
    textDecorationColor: color.borderStrong,
    textUnderlineOffset: "3px",
    cursor: "pointer",
    borderRadius: radius.sm,
    outlineStyle: "none",
  },
  linkHovered: { textDecorationStyle: "solid", textDecorationColor: color.text },
  linkFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
});
