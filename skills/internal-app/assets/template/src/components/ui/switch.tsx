import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";

export interface SwitchProps extends Omit<AriaSwitchProps, "className" | "style" | "children"> {
  readonly children?: ReactNode;
  readonly style?: StyleXStyles;
}

export function Switch({ children, style, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} {...stylex.props(styles.root, style)}>
      {({ isSelected, isFocusVisible, isDisabled }) => (
        <>
          <span
            aria-hidden
            {...stylex.props(
              styles.track,
              isSelected && styles.trackSelected,
              isFocusVisible && styles.trackFocused,
              isDisabled && styles.disabled,
            )}
          >
            <span {...stylex.props(styles.thumb, isSelected && styles.thumbSelected)} />
          </span>
          {children ? (
            <span {...stylex.props(styles.label, isDisabled && styles.disabled)}>{children}</span>
          ) : null}
        </>
      )}
    </AriaSwitch>
  );
}

const styles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    paddingBlock: size.togglePadding,
    fontSize: font.md,
    cursor: "pointer",
    outlineStyle: "none",
  },
  track: {
    position: "relative",
    width: size.switchWidth,
    height: size.switchHeight,
    flexShrink: 0,
    borderRadius: radius.full,
    backgroundColor: color.borderStrong,
    transitionProperty: "background-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  trackSelected: { backgroundColor: color.accent },
  trackFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  thumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: `calc(${size.switchHeight} - 4px)`,
    height: `calc(${size.switchHeight} - 4px)`,
    borderRadius: radius.full,
    backgroundColor: color.raised,
    transitionProperty: "transform",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  thumbSelected: { transform: `translateX(calc(${size.switchWidth} - ${size.switchHeight}))` },
  label: { color: color.text, userSelect: "none" },
  disabled: { opacity: "0.5", cursor: "not-allowed" },
});
