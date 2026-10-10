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

export function Tabs(props: Omit<AriaTabsProps, "className" | "style">) {
  return <AriaTabs {...props} {...stylex.props(styles.tabs)} />;
}

export function TabList<Item extends object>(
  props: Omit<AriaTabListProps<Item>, "className" | "style">,
) {
  return <AriaTabList {...props} {...stylex.props(styles.list)} />;
}

export function Tab({
  children,
  ...props
}: Omit<AriaTabProps, "className" | "style" | "children"> & { readonly children: ReactNode }) {
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
  list: {
    display: "flex",
    gap: space.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  tab: {
    position: "relative",
    paddingBlock: space.sm,
    marginBottom: "-1px",
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
