import * as stylex from "@stylexjs/stylex";
import { ChevronRight } from "lucide-react";
import { Breadcrumb, Breadcrumbs as AriaBreadcrumbs, Link } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, size, space } from "@/styles/tokens.stylex";

export interface BreadcrumbItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

/** Location within a hierarchy. The last item is the current page. */
export function Breadcrumbs({ items }: { readonly items: ReadonlyArray<BreadcrumbItem> }) {
  return (
    <nav aria-label="Breadcrumbs" {...stylex.props(styles.nav)}>
      <AriaBreadcrumbs items={items} {...stylex.props(styles.list)}>
        {(item) => (
          <Breadcrumb id={item.id} {...stylex.props(styles.item)}>
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
  link: {
    fontSize: font.md,
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
