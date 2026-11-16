/**
 * The location of the page in a hierarchy, as a row of links that ends with the current page.
 *
 * @layer primitive
 * @keywords breadcrumbs, breadcrumb trail, location, hierarchy path, parent page link
 * @related RouteBreadcrumbs, AppShell, Tabs
 * @notes navigation
 *
 * The app shell renders it from route data through `RouteBreadcrumbs`. Do not
 * add a second trail to a page. Do not use it for sections of one page: use
 * `Tabs` or `Scrollspy`.
 *
 * ## Behavior
 * - The current page has priority: the items before it shrink first. A
 *   shrunk item keeps one letter and the ellipsis.
 * - Below the `sm` breakpoint, only the current page shows.
 * - The current item has `aria-current`.
 *
 * ## Rules
 * - Give a route a crumb with `staticData.crumb`, or return `{ crumb }` from a
 *   loader to show a record name. See `RouteBreadcrumbs`.
 *
 * ## Example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { id: "items", label: "Items", href: "/items" },
 *     { id: item.id, label: item.name, href: `/items/${item.id}` },
 *   ]}
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import { ChevronRight } from "lucide-react";
import { Breadcrumb, Breadcrumbs as AriaBreadcrumbs, Link } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, size, space } from "@/styles/tokens.stylex";

export interface BreadcrumbItem {
  /** A unique key in the trail. */
  readonly id: string;
  /** The name of the page. */
  readonly label: string;
  /** The URL of the page. */
  readonly href: string;
}

export function Breadcrumbs({
  items,
}: {
  /** The pages from the root to the current page. The last item is the current page. */
  readonly items: ReadonlyArray<BreadcrumbItem>;
}) {
  const currentId = items.at(-1)?.id;
  return (
    <nav aria-label="Breadcrumbs" {...stylex.props(styles.nav)}>
      <AriaBreadcrumbs items={items} {...stylex.props(styles.list)}>
        {(item) => (
          <Breadcrumb
            id={item.id}
            {...stylex.props(
              styles.item,
              item.id === currentId ? styles.currentItem : styles.ancestorItem,
              item.id !== currentId &&
                (item.label.length > SHORT_LABEL ? styles.ancestorFloor : styles.ancestorShort),
            )}
          >
            {({ isCurrent }) => (
              <>
                <Link
                  href={item.href}
                  {...renderStyles<{ isCurrent: boolean; isFocusVisible: boolean }>((state) => [
                    styles.link,
                    state.isCurrent && styles.current,
                    state.isFocusVisible && styles.focused,
                  ])}
                >
                  {item.label}
                </Link>
                {isCurrent ? null : (
                  <ChevronRight aria-hidden {...stylex.props(styles.separator)} />
                )}
              </>
            )}
          </Breadcrumb>
        )}
      </AriaBreadcrumbs>
    </nav>
  );
}

// A label of this many characters or fewer does not shrink, because one letter and an ellipsis
// are almost as wide as the label.
const SHORT_LABEL = 4;

const styles = stylex.create({
  nav: { minWidth: 0 },
  list: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    margin: 0,
    padding: 0,
    listStyle: "none",
    minWidth: 0,
  },
  item: { display: "flex", alignItems: "center", gap: space.xs, minWidth: 0 },
  ancestorItem: { display: { default: "none", [media.sm]: "flex" } },
  // A crumb that shrinks keeps room for one letter and the full ellipsis, so it reads as truncated.
  ancestorFloor: { minWidth: `calc(2.25 * ${font.lg} + ${space.xs} + ${size.iconSm})` },
  ancestorShort: { flexShrink: 0 },
  currentItem: { flexShrink: 0, maxWidth: "100%" },
  link: {
    fontSize: font.lg,
    color: { default: color.textMuted, ":hover": color.text },
    textDecoration: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderRadius: "0.25rem",
    outlineStyle: "none",
  },
  current: {
    color: { default: color.text, ":hover": color.text },
    fontWeight: font.medium,
    cursor: "default",
  },
  focused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  separator: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.textFaint },
});
