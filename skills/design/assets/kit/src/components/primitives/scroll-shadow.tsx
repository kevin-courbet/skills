// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * A native scroll area whose edges fade where more content is out of view.
 *
 * @layer primitive
 * @keywords scroll shadow, scroll fade, scroll area, overflow fade, scroll hint, more content cue, horizontal scroll, scrollable list, scroll region
 * @related Tabs, Sheet, Dialog, Scrollspy, Table, DataTable
 * @notes accessibility, finishing-details, kit-adding-a-component
 *
 * Use it for a part that scrolls inside the page, such as a tab list that is
 * wider than its panel, the body of a sheet, or a row of cards. The fade shows
 * that more content is out of view. Do not use it for the page itself: the
 * page scrolls in `AppShell`. Do not use it for a table of records: use
 * `DataTable`, which has its own scroll area.
 *
 * ## Behavior
 * - It uses the native scroll of the browser, so wheel, touch, scrollbar, and
 *   keyboard scrolling stay the same.
 * - An edge fades only while content is out of view past that edge. The fade
 *   follows scroll, resize, and changes to the content.
 * - The scrollbar does not fade. `hideScrollbar` removes it, and wheel,
 *   touch, and keyboard scrolling stay.
 * - A focused child scrolls clear of the fade.
 * - With `label`, the area is a named region. While it scrolls, it takes
 *   focus, so keyboard users can scroll it. Its focus ring sits inside the
 *   area, over the fade.
 *
 * ## Rules
 * - Give `label` when the content has no focusable child, such as text.
 * - Give a height or a maximum height with `style`, or put it in a flex
 *   column. It scrolls only when its box is smaller than its content.
 * - Keep a focus ring of a child inside the child, or give the content a
 *   padding of 4px or more, because the area clips what overflows it.
 * - Use `hideScrollbar` only when each child takes focus, such as tabs, so that
 *   the focus brings a hidden child into view.
 *
 * ## Example
 * ```tsx
 * // styles.notes = { maxHeight: "16rem" }
 * <ScrollShadow label="Release notes" style={styles.notes}>
 *   {release.notes.map((note) => <p key={note.id}>{note.text}</p>)}
 * </ScrollShadow>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from "react";
import { color, space } from "@/styles/tokens.stylex";

export type ScrollShadowOrientation = "vertical" | "horizontal";

export interface ScrollShadowProps {
  /** The axis that scrolls. `vertical` by default. */
  readonly orientation?: ScrollShadowOrientation;
  /** Names the area, and lets it take focus while it scrolls. Give it when no child takes focus. */
  readonly label?: string;
  /** The content that scrolls. */
  readonly children: ReactNode;
  /** Removes the scrollbar. Use it only when each child takes focus, such as a row of tabs. */
  readonly hideScrollbar?: boolean;
  /** Layout overrides, such as a maximum height or `flex: 1`, applied last. */
  readonly style?: StyleXStyles;
}

interface Overflow {
  readonly start: boolean;
  readonly end: boolean;
  /** The width of a scrollbar that takes space, in pixels. Overlay scrollbars give 0. */
  readonly lane: number;
  readonly rtl: boolean;
}

const noOverflow: Overflow = { start: false, end: false, lane: 0, rtl: false };

export function ScrollShadow({
  orientation = "vertical",
  label,
  children,
  hideScrollbar = false,
  style,
}: ScrollShadowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const overflow = useOverflow(scrollerRef, orientation);
  const fade = fadeFor(orientation, overflow);
  return (
    <div {...stylex.props(styles.root, style)}>
      <div
        ref={scrollerRef}
        role={label === undefined ? undefined : "region"}
        aria-label={label}
        // The area takes focus only while it scrolls, so a part that fits adds no tab stop.
        tabIndex={label !== undefined && (overflow.start || overflow.end) ? 0 : undefined}
        {...stylex.props(
          styles.scroller,
          scrollers[orientation],
          hideScrollbar && styles.noScrollbar,
          stylex.defaultMarker(),
          fade !== null && styles.mask(fade, maskSize(orientation, overflow.lane)),
          fade !== null && masks[maskPositionFor(orientation, overflow.rtl)],
        )}
      >
        {children}
      </div>
      <span aria-hidden {...stylex.props(styles.ring)} />
    </div>
  );
}

function useOverflow(
  ref: RefObject<HTMLDivElement | null>,
  orientation: ScrollShadowOrientation,
): Overflow {
  const [overflow, setOverflow] = useState<Overflow>(noOverflow);
  useLayoutEffect(() => {
    const scroller = ref.current;
    if (scroller === null) throw new Error("ScrollShadow rendered without its scroll element.");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rtl = getComputedStyle(scroller).direction === "rtl";
      const vertical = orientation === "vertical";
      // In a right-to-left layout, scrollLeft goes from 0 to a negative number.
      const position = vertical ? scroller.scrollTop : Math.abs(scroller.scrollLeft);
      const visible = vertical ? scroller.clientHeight : scroller.clientWidth;
      const total = vertical ? scroller.scrollHeight : scroller.scrollWidth;
      const lane = vertical
        ? scroller.offsetWidth - scroller.clientWidth
        : scroller.offsetHeight - scroller.clientHeight;
      // One pixel of slack, because zoom gives fractional scroll positions.
      const next: Overflow = {
        start: position > 1,
        end: position + visible < total - 1,
        lane,
        rtl,
      };
      setOverflow((current) =>
        current.start === next.start &&
        current.end === next.end &&
        current.lane === next.lane &&
        current.rtl === next.rtl
          ? current
          : next,
      );
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    const observeChildren = () => {
      resize.disconnect();
      resize.observe(scroller);
      for (const child of scroller.children) resize.observe(child);
    };
    const mutation = new MutationObserver(() => {
      observeChildren();
      schedule();
    });
    observeChildren();
    mutation.observe(scroller, { childList: true });
    scroller.addEventListener("scroll", schedule, { passive: true });
    measure();
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      scroller.removeEventListener("scroll", schedule);
    };
  }, [ref, orientation]);
  return overflow;
}

// The gradient runs from the start edge to the end edge. An edge with no
// content past it stays solid, so only the edge that hides content fades.
function fadeFor(orientation: ScrollShadowOrientation, overflow: Overflow): string | null {
  if (!overflow.start && !overflow.end) return null;
  const inline = overflow.rtl ? "to left" : "to right";
  const direction = orientation === "vertical" ? "to bottom" : inline;
  const start = overflow.start ? `transparent, black ${fadeSize}` : "black, black";
  const end = overflow.end ? `black calc(100% - ${fadeSize}), transparent` : "black, black";
  return `linear-gradient(${direction}, ${start}, ${end}), linear-gradient(black, black)`;
}

// The second mask layer is a solid lane under the scrollbar, so the scrollbar
// does not fade with the content.
function maskSize(orientation: ScrollShadowOrientation, lane: number): string {
  return orientation === "vertical"
    ? `calc(100% - ${lane}px) 100%, ${lane}px 100%`
    : `100% calc(100% - ${lane}px), 100% ${lane}px`;
}

function maskPositionFor(orientation: ScrollShadowOrientation, rtl: boolean): keyof typeof masks {
  if (orientation === "horizontal") return "horizontal";
  return rtl ? "verticalRtl" : "verticalLtr";
}

const fadeSize = space.xxl;

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
  },
  scroller: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    minHeight: 0,
    outlineStyle: "none",
  },
  noScrollbar: { scrollbarWidth: "none", "::-webkit-scrollbar": { display: "none" } },
  mask: (image: string, layerSize: string) => ({
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: layerSize,
    WebkitMaskSize: layerSize,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  }),
  // The ring is a sibling after the area, so the mask of the area does not hide it.
  ring: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    outlineStyle: {
      default: "none",
      [stylex.when.siblingBefore(":focus-visible")]: "solid",
    },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
});

const scrollers = stylex.create({
  vertical: { overflowY: "auto", overflowX: "hidden", scrollPaddingBlock: space.xxl },
  horizontal: { overflowX: "auto", overflowY: "hidden", scrollPaddingInline: space.xxl },
});

// The scrollbar lane sits at the end of the cross axis: the inline end for a
// vertical area, and the bottom for a horizontal one.
const masks = stylex.create({
  verticalLtr: { maskPosition: "left top, right top", WebkitMaskPosition: "left top, right top" },
  verticalRtl: { maskPosition: "right top, left top", WebkitMaskPosition: "right top, left top" },
  horizontal: {
    maskPosition: "left top, left bottom",
    WebkitMaskPosition: "left top, left bottom",
  },
});
