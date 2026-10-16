// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Link, Popover, PreviewTrigger } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, space } from "@/styles/tokens.stylex";
import { overlay } from "./overlay";

export interface HoverCardProps {
  /**
   * The element that shows the card: a HoverCardLink, or a kit Button. It must
   * be a react-aria element so it receives the hover and focus handlers.
   */
  readonly children: ReactNode;
  /** Card content: a short preview of the record, such as a person or a deployment. */
  readonly content: ReactNode;
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
  return (
    <PreviewTrigger delay={delay}>
      {children}
      <Popover
        placement={placement}
        offset={6}
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
          overlay.popover,
          styles.card,
          state.isEntering && overlay.entering,
          state.isExiting && overlay.exiting,
        ])}
      >
        {content}
      </Popover>
    </PreviewTrigger>
  );
}

export interface HoverCardLinkProps {
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
