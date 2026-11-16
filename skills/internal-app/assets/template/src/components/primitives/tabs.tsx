/**
 * Tabs that switch between sections of one page, with a tab list and one panel for each tab.
 *
 * @layer primitive
 * @keywords tabs, tab list, tab panel, sections of a page, switch views, tabbed content
 * @related SegmentedControl, Disclosure, Scrollspy, ScrollShadow, AppShell
 * @notes navigation, hierarchy
 *
 * Use it for sections that people read one at a time. Do not use it to go to
 * another route: use the app navigation or a link. Do not use it to switch
 * between views of the same content: use `SegmentedControl`. Do not use it
 * for a section that people show and hide: use `Disclosure`.
 *
 * ## Behavior
 * The tabs come from react-aria-components. Do not build them again:
 * - Arrow keys move between tabs, and Tab moves into the panel.
 * - The selected tab has an accent underline and `aria-selected`.
 * - A tab list wider than its frame scrolls sideways, and its edges fade.
 *
 * ## Rules
 * - Give each `Tab` and its `TabPanel` the same `id`.
 * - Keep the selected tab in a search param when people share the view, with
 *   `selectedKey` and `onSelectionChange`.
 *
 * ## Example
 * ```tsx
 * <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))}>
 *   <TabList aria-label="Run">
 *     <Tab id="summary">Summary</Tab>
 *     <Tab id="logs">Logs</Tab>
 *   </TabList>
 *   <TabPanel id="summary">{summary}</TabPanel>
 *   <TabPanel id="logs">{logs}</TabPanel>
 * </Tabs>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, motion, space } from "@/styles/tokens.stylex";
import { ScrollShadow } from "./scroll-shadow";

export function Tabs(props: Omit<AriaTabsProps, "className" | "style">) {
  return <AriaTabs {...props} {...stylex.props(styles.tabs)} />;
}

export function TabList<Item extends object>(
  props: Omit<AriaTabListProps<Item>, "className" | "style">,
) {
  return (
    <ScrollShadow orientation="horizontal" hideScrollbar style={styles.listFrame}>
      <AriaTabList {...props} {...stylex.props(styles.list)} />
    </ScrollShadow>
  );
}

export function Tab({
  children,
  ...props
}: Omit<AriaTabProps, "className" | "style" | "children"> & {
  /** The visible name of the tab. */
  readonly children: ReactNode;
}) {
  return (
    <AriaTab
      {...props}
      {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean; isDisabled: boolean }>(
        (state) => [
          styles.tab,
          state.isSelected && styles.tabSelected,
          state.isFocusVisible && styles.tabFocused,
          state.isDisabled && styles.tabDisabled,
        ],
      )}
    >
      {children}
    </AriaTab>
  );
}

export function TabPanel(props: Omit<AriaTabPanelProps, "className" | "style">) {
  return <AriaTabPanel {...props} {...stylex.props(styles.panel)} />;
}

const styles = stylex.create({
  tabs: { display: "flex", flexDirection: "column", gap: space.lg },
  // The rule is a shadow on the frame, outside the scroll area, so it does not
  // fade and the scroll area does not clip it.
  listFrame: { boxShadow: `inset 0 -1px 0 ${color.borderSubtle}` },
  list: { display: "flex", gap: space.lg },
  tab: {
    position: "relative",
    flexShrink: 0,
    paddingBlock: space.sm,
    whiteSpace: "nowrap",
    fontSize: font.md,
    fontWeight: font.medium,
    color: { default: color.textMuted, ":hover": color.text },
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    cursor: "pointer",
    outlineStyle: "none",
    transitionProperty: "color, border-color",
    transitionDuration: motion.fast,
  },
  tabSelected: { color: color.text, borderBottomColor: color.accent },
  tabFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  tabDisabled: { opacity: "0.5", cursor: "not-allowed" },
  panel: { outline: "none" },
});
