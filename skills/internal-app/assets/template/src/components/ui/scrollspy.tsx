// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { Link } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, space } from "@/styles/tokens.stylex";

export interface ScrollspyItem {
  /** Id of the section element on the page. */
  readonly id: string;
  readonly label: string;
}

export interface ScrollspyProps {
  /** Names the navigation, such as "On this page". */
  readonly label: string;
  readonly items: ReadonlyArray<ScrollspyItem>;
  /** `vertical` for a side column; `horizontal` for a bar above the sections. */
  readonly orientation?: "vertical" | "horizontal";
  /** Space above a section when the page scrolls to it, in pixels, such as the height of a sticky bar. */
  readonly offset?: number;
  readonly style?: StyleXStyles;
}

/**
 * Links to the sections of a long page, such as settings or a record with
 * many parts. The link of the section in view is marked as the current
 * location. A link scrolls its section into view and moves focus to it.
 */
export function Scrollspy({
  label,
  items,
  orientation = "vertical",
  offset = 16,
  style,
}: ScrollspyProps) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    const first = items[0] === undefined ? null : document.getElementById(items[0].id);
    const container = first === null ? null : scrollParent(first);
    const target: HTMLElement | Window = container ?? window;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = container === null ? 0 : container.getBoundingClientRect().top;
      const atEnd =
        container === null
          ? window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
          : container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
      let current = items[0]?.id;
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section !== null && section.getBoundingClientRect().top - top <= offset + 8)
          current = item.id;
      }
      setActiveId(atEnd ? items[items.length - 1]?.id : current);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [items, offset]);

  const jump = (id: string) => {
    const section = document.getElementById(id);
    if (section === null) throw new Error(`Scrollspy: no section with id "${id}".`);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    const container = scrollParent(section);
    const containerTop = container === null ? 0 : container.getBoundingClientRect().top;
    const distance = section.getBoundingClientRect().top - containerTop - offset;
    if (container === null) window.scrollBy({ top: distance, behavior });
    else container.scrollBy({ top: distance, behavior });
    if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
    section.focus({ preventScroll: true });
    setActiveId(id);
  };

  return (
    <nav aria-label={label} {...stylex.props(styles.nav, style)}>
      <ul {...stylex.props(styles.list, orientation === "horizontal" && styles.listHorizontal)}>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              aria-current={item.id === activeId ? "location" : undefined}
              onPress={() => jump(item.id)}
              {...renderStyles<{ isFocusVisible: boolean }>((state) => [
                styles.link,
                item.id === activeId && styles.linkActive,
                state.isFocusVisible && styles.linkFocused,
              ])}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node !== null; node = node.parentElement) {
    const overflow = window.getComputedStyle(node).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight)
      return node;
  }
  return null;
}

const styles = stylex.create({
  nav: { minWidth: 0 },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  listHorizontal: {
    flexDirection: "row",
    flexWrap: { default: "nowrap", [media.md]: "wrap" },
    overflowX: "auto",
  },
  link: {
    display: "flex",
    alignItems: "center",
    minHeight: "1.75rem",
    paddingInline: space.sm,
    borderRadius: radius.md,
    fontSize: font.md,
    color: { default: color.textMuted, ":hover": color.text },
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    outlineStyle: "none",
    transitionProperty: "background-color, color",
    transitionDuration: motion.fast,
  },
  linkActive: {
    backgroundColor: color.selected,
    color: { default: color.text, ":hover": color.text },
    fontWeight: font.medium,
  },
  linkFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
});
