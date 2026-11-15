/**
 * A section that people show and hide, alone or as one row of an `Accordion`.
 *
 * @layer primitive
 * @keywords disclosure, accordion, collapsible section, expand collapse, show more, advanced settings, raw payload, faq
 * @related Tabs, Layout, CodeBlock
 * @notes hierarchy, finishing-details
 *
 * Use `Disclosure` for one section that most people do not need, such as
 * advanced settings or a raw payload. Use `Accordion` for several such rows.
 * Do not use it when people compare sections: use `Tabs`. Do not hide
 * information that people need to finish the task.
 *
 * ## Behavior
 * - The title is a button in a level 3 heading. Enter and Space open and close
 *   it, and the chevron turns.
 * - In an `Accordion`, one row opens at a time unless
 *   `allowsMultipleExpanded` is set.
 *
 * ## Example
 * ```tsx
 * <Accordion>
 *   <Disclosure id="retry" title="Retry policy" hint="3 rules">
 *     <RetryRules rules={rules} />
 *   </Disclosure>
 *   <Disclosure id="payload" title="Raw payload">
 *     <CodeBlock language="json" code={payload} />
 *   </Disclosure>
 * </Accordion>
 * ```
 */
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
  /** The visible name of the section. */
  readonly title: string;
  /** Short context after the title, such as a count. */
  readonly hint?: string;
  /** The content that shows when the section is open. */
  readonly children: ReactNode;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

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
  /** StyleX styles for the frame, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

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
    transitionTimingFunction: motion.easeOut,
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
