import * as stylex from "@stylexjs/stylex";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import {
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import {
  color,
  font,
  layer,
  media,
  motion,
  radius,
  shadow,
  size,
  space,
} from "@/styles/tokens.stylex";
import { Button } from "./button";

export type SheetSide = "right" | "left";
/** `peek` is a large panel over the list for reading a record without leaving the list. */
export type SheetSize = "sm" | "md" | "lg" | "peek";

export interface SheetNavigation {
  /** Opens the previous record of the list. Undefined on the first record. */
  readonly onPrevious?: () => void;
  /** Opens the next record of the list. Undefined on the last record. */
  readonly onNext?: () => void;
}

export interface SheetProps extends Pick<
  ModalOverlayProps,
  "isOpen" | "onOpenChange" | "defaultOpen"
> {
  readonly title: string;
  readonly description?: string;
  /** Inline context after the title, such as an identifier with a CopyButton. */
  readonly meta?: ReactNode;
  /** Header actions before the close button, such as "Open page". */
  readonly headerActions?: ReactNode;
  /** Previous and next buttons, also bound to the k and j keys. */
  readonly navigation?: SheetNavigation;
  readonly side?: SheetSide;
  readonly size?: SheetSize;
  readonly actions?: (close: () => void) => ReactNode;
  readonly children: ReactNode | ((close: () => void) => ReactNode);
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function NavigationKeys({ navigation }: { readonly navigation: SheetNavigation }) {
  const { onPrevious, onNext } = navigation;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return;
      if (event.key === "j" && onNext) onNext();
      if (event.key === "k" && onPrevious) onPrevious();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onPrevious, onNext]);
  return null;
}

/**
 * Edge panel for secondary detail or editing next to the page context, and
 * for navigation on narrow screens. The `peek` size opens a record from a
 * list over the list. Use Dialog for tasks that must interrupt.
 */
export function Sheet({
  title,
  description,
  meta,
  headerActions,
  navigation,
  side = "right",
  size: width = "md",
  actions,
  children,
  ...props
}: SheetProps) {
  const isPeek = width === "peek";
  return (
    <ModalOverlay
      {...props}
      isDismissable
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        styles.backdrop,
        state.isEntering && styles.backdropEntering,
        state.isExiting && styles.backdropExiting,
      ])}
    >
      <Modal
        {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) =>
          isPeek
            ? [
                styles.panel,
                styles.peek,
                state.isEntering && styles.enterPeek,
                state.isExiting && styles.exitPeek,
              ]
            : [
                styles.panel,
                sides[side],
                widths[width],
                state.isEntering && (side === "right" ? styles.enterRight : styles.enterLeft),
                state.isExiting && (side === "right" ? styles.exitRight : styles.exitLeft),
              ],
        )}
      >
        <Dialog {...stylex.props(styles.dialog)}>
          {({ close }) => (
            <>
              {navigation ? <NavigationKeys navigation={navigation} /> : null}
              <header {...stylex.props(styles.header, isPeek && styles.headerPeek)}>
                <div {...stylex.props(styles.headingGroup)}>
                  <div {...stylex.props(styles.titleRow)}>
                    <Heading slot="title" {...stylex.props(styles.title)}>
                      {title}
                    </Heading>
                    {meta}
                  </div>
                  {description ? <p {...stylex.props(styles.description)}>{description}</p> : null}
                </div>
                <div {...stylex.props(styles.headerActions)}>
                  {navigation ? (
                    <>
                      <Button
                        intent="ghost"
                        size="sm"
                        iconOnly
                        aria-label="Previous"
                        aria-keyshortcuts="k"
                        isDisabled={navigation.onPrevious === undefined}
                        onPress={navigation.onPrevious}
                      >
                        <ChevronUp aria-hidden {...stylex.props(styles.icon)} />
                      </Button>
                      <Button
                        intent="ghost"
                        size="sm"
                        iconOnly
                        aria-label="Next"
                        aria-keyshortcuts="j"
                        isDisabled={navigation.onNext === undefined}
                        onPress={navigation.onNext}
                      >
                        <ChevronDown aria-hidden {...stylex.props(styles.icon)} />
                      </Button>
                    </>
                  ) : null}
                  {headerActions}
                  <Button intent="ghost" size="sm" iconOnly aria-label="Close" onPress={close}>
                    <X aria-hidden {...stylex.props(styles.icon)} />
                  </Button>
                </div>
              </header>
              <div {...stylex.props(styles.body)}>
                {typeof children === "function" ? children(close) : children}
              </div>
              {actions ? <footer {...stylex.props(styles.footer)}>{actions(close)}</footer> : null}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const slideInRight = stylex.keyframes({
  from: { transform: "translateX(100%)" },
  to: { transform: "translateX(0)" },
});
const slideOutRight = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(100%)" },
});
const slideInLeft = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(0)" },
});
const slideOutLeft = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(-100%)" },
});
const peekIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(8px) scale(0.99)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});
const peekOut = stylex.keyframes({
  from: { opacity: 1, transform: "scale(1)" },
  to: { opacity: 0, transform: "scale(0.99)" },
});

const enterDuration = { default: motion.slow, [media.reducedMotion]: "0ms" } as const;
const exitDuration = { default: motion.normal, [media.reducedMotion]: "0ms" } as const;

const styles = stylex.create({
  backdrop: { position: "fixed", inset: 0, zIndex: layer.modal, backgroundColor: color.backdrop },
  backdropEntering: { animationName: fadeIn, animationDuration: enterDuration },
  backdropExiting: { animationName: fadeOut, animationDuration: exitDuration },
  panel: {
    position: "fixed",
    top: 0,
    bottom: 0,
    display: "flex",
    width: "100%",
    backgroundColor: color.overlay,
    color: color.text,
    boxShadow: shadow.lg,
    outlineStyle: "none",
  },
  // Left and right insets with a max width and auto margins center the panel.
  peek: {
    top: { default: 0, [media.md]: space.xxl },
    bottom: { default: 0, [media.md]: space.xxl },
    left: { default: 0, [media.md]: space.xxl },
    right: { default: 0, [media.md]: space.xxl },
    width: "auto",
    maxWidth: "80rem",
    marginInline: "auto",
    overflow: "hidden",
    backgroundColor: color.page,
    borderWidth: { default: 0, [media.md]: "1px" },
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: { default: 0, [media.md]: radius.xl },
  },
  enterPeek: {
    animationName: peekIn,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.easeOut,
  },
  exitPeek: {
    animationName: peekOut,
    animationDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.ease,
  },
  enterRight: {
    animationName: slideInRight,
    animationDuration: enterDuration,
    animationTimingFunction: motion.easeOut,
  },
  exitRight: {
    animationName: slideOutRight,
    animationDuration: exitDuration,
    animationTimingFunction: motion.ease,
  },
  enterLeft: {
    animationName: slideInLeft,
    animationDuration: enterDuration,
    animationTimingFunction: motion.easeOut,
  },
  exitLeft: {
    animationName: slideOutLeft,
    animationDuration: exitDuration,
    animationTimingFunction: motion.ease,
  },
  dialog: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: 0,
    outlineStyle: "none",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
    paddingBlock: space.md,
    paddingInline: space.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  headerPeek: { alignItems: "center", paddingBlock: space.sm },
  headingGroup: { display: "flex", flexDirection: "column", gap: space.xs, minWidth: 0 },
  titleRow: { display: "flex", alignItems: "center", gap: space.sm, minWidth: 0, flexWrap: "wrap" },
  title: { fontSize: font.lg, fontWeight: font.semibold, lineHeight: font.leadingTight, margin: 0 },
  description: { fontSize: font.md, color: color.textMuted },
  headerActions: { display: "flex", alignItems: "center", gap: space.xs, flexShrink: 0 },
  icon: { width: size.icon, height: size.icon },
  body: { flex: "1", minHeight: 0, overflow: "auto", padding: space.lg },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: space.sm,
    paddingBlock: space.md,
    paddingInline: space.lg,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
});

const sides = stylex.create({
  right: {
    right: 0,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: color.border,
  },
  left: {
    left: 0,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: color.border,
  },
});

const widths = stylex.create({
  sm: { maxWidth: "20rem" },
  md: { maxWidth: "28rem" },
  lg: { maxWidth: "40rem" },
});
