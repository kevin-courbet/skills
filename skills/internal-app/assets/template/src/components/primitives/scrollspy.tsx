// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * Links to the sections of a long page that mark the section in view.
 *
 * @layer primitive
 * @keywords scrollspy, on this page, table of contents, section links, jump links, anchor navigation, page outline, settings navigation
 * @related Tabs, Layout, Breadcrumbs, Disclosure, ScrollShadow
 * @notes navigation, internal-app-page-patterns
 *
 * Use it on a long page with named parts, such as settings or a record with
 * many sections. Do not use it to switch between views of the same content:
 * use `Tabs`. Do not use it to move between routes: use the app navigation.
 *
 * ## Behavior
 * The links do these things. Do not build them again:
 * - The link of the section in view has `aria-current="location"` and the
 *   selected surface. At the end of the scroll, the last link is current.
 * - It finds the scroll container of the sections, or uses the window.
 * - A link scrolls its section into view, instantly under reduced motion, and
 *   moves the focus to the section.
 * - An `id` with no element on the page throws an error when people press its
 *   link.
 * - A `horizontal` list that is wider than its frame scrolls sideways, and
 *   its edges fade.
 *
 * ## Rules
 * - Give each section on the page the `id` of its item and a heading with the
 *   same words as the label.
 * - Set `offset` to the height of a sticky bar above the sections.
 *
 * ## Example
 * ```tsx
 * <Scrollspy
 *   label="On this page"
 *   items={[
 *     { id: "general", label: "General" },
 *     { id: "alerts", label: "Alerts" },
 *     { id: "danger-zone", label: "Danger zone" },
 *   ]}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { Link } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { ScrollShadow } from "./scroll-shadow";
import { color, font, media, motion, radius, space } from "@/styles/tokens.stylex";

export interface ScrollspyItem {
  /** Id of the section element on the page. */
  readonly id: string;
  /** Visible link text. Use the words of the section heading. */
  readonly label: string;
}

export interface ScrollspyProps {
  /** Names the navigation, such as "On this page". */
  readonly label: string;
  /** The sections, in page order. */
  readonly items: ReadonlyArray<ScrollspyItem>;
  /** `vertical` for a side column; `horizontal` for a bar above the sections. */
  readonly orientation?: "vertical" | "horizontal";
  /** Space above a section when the page scrolls to it, in pixels, such as the height of a sticky bar. */
  readonly offset?: number;
  /** StyleX styles for the navigation, such as a sticky position in a side column. */
  readonly style?: StyleXStyles;
}

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

  const list = (
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
  );

  return (
    <nav aria-label={label} {...stylex.props(styles.nav, style)}>
      {orientation === "horizontal" ? (
        <ScrollShadow orientation="horizontal" hideScrollbar>
          {list}
        </ScrollShadow>
      ) : (
        list
      )}
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
