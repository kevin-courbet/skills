import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronRight } from "lucide-react";
import { createContext, type ReactNode, useContext } from "react";
import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosureGroup,
  type DisclosureGroupProps,
  DisclosurePanel,
  type DisclosureProps as AriaDisclosureProps,
  Heading,
} from "react-aria-components";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";

const AccordionContext = createContext(false);

export interface DisclosureProps extends Omit<
  AriaDisclosureProps,
  "className" | "style" | "children"
> {
  readonly title: string;
  /** Short context after the title, such as a count. */
  readonly hint?: string;
  readonly children: ReactNode;
  readonly style?: StyleXStyles;
}

/**
 * A section people can show and hide, such as advanced settings or raw
 * payloads. Inside an Accordion it renders as one row of the group.
 */
export function Disclosure({ title, hint, children, style, ...props }: DisclosureProps) {
  const inAccordion = useContext(AccordionContext);
  return (
    <AriaDisclosure {...props} {...stylex.props(styles.root, inAccordion && styles.item, style)}>
      {({ isExpanded }) => (
        <>
          <Heading level={3} {...stylex.props(styles.heading)}>
            <Button
              slot="trigger"
              {...stylex.props(styles.trigger, inAccordion && styles.itemTrigger)}
            >
              <ChevronRight
                aria-hidden
                {...stylex.props(styles.chevron, isExpanded && styles.chevronOpen)}
              />
              <span {...stylex.props(styles.title)}>{title}</span>
              {hint ? <span {...stylex.props(styles.hint)}>{hint}</span> : null}
            </Button>
          </Heading>
          <DisclosurePanel {...stylex.props(styles.panel, inAccordion && styles.itemPanel)}>
            {children}
          </DisclosurePanel>
        </>
      )}
    </AriaDisclosure>
  );
}

export interface AccordionProps extends Omit<
  DisclosureGroupProps,
  "className" | "style" | "children"
> {
  /** Disclosure elements. */
  readonly children: ReactNode;
  readonly style?: StyleXStyles;
}

/**
 * A framed list of Disclosure rows. One row opens at a time unless
 * `allowsMultipleExpanded` is set. Use it for FAQs, grouped settings, or
 * per-step details; use Tabs when people compare sections side by side.
 */
export function Accordion({ children, style, ...props }: AccordionProps) {
  return (
    <AccordionContext.Provider value>
      <DisclosureGroup {...props} {...stylex.props(styles.group, style)}>
        {children}
      </DisclosureGroup>
    </AccordionContext.Provider>
  );
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", minWidth: 0 },
  heading: { margin: 0, fontSize: "inherit", fontWeight: "inherit" },
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    width: "100%",
    minHeight: size.controlMd,
    paddingBlock: space.xs,
    paddingInline: space.xs,
    marginInline: `calc(-1 * ${space.xs})`,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.text,
    fontSize: font.md,
    textAlign: "start",
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  chevron: {
    width: size.iconSm,
    height: size.iconSm,
    flexShrink: 0,
    color: color.textMuted,
    transitionProperty: "transform",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    transitionTimingFunction: motion.ease,
  },
  chevronOpen: { transform: "rotate(90deg)" },
  title: { fontWeight: font.medium, minWidth: 0 },
  hint: { fontSize: font.sm, color: color.textMuted },
  panel: { paddingTop: space.xs, paddingBottom: space.sm, paddingInlineStart: space.xl },
  group: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: color.raised,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  item: {
    borderTopWidth: { default: "1px", ":first-child": 0 },
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
  itemTrigger: {
    minHeight: "2.75rem",
    marginInline: 0,
    paddingInline: space.md,
    borderRadius: 0,
    outlineOffset: "-2px",
  },
  itemPanel: { paddingInline: space.md, paddingInlineStart: "2.375rem", paddingBottom: space.md },
});
