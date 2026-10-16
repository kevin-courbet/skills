// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Fragment,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { color, motion, radius, space } from "@/styles/tokens.stylex";

export interface ResizablePanel {
  readonly id: string;
  /** Names the panel for the resize handle, such as "Job list". */
  readonly label: string;
  /** Start size in percent of the group. The sizes of all panels add up to 100. */
  readonly defaultSize: number;
  /** Smallest size in percent. Default 10. */
  readonly minSize?: number;
  /** Largest size in percent. Default 90. */
  readonly maxSize?: number;
  readonly content: ReactNode;
}

export interface ResizablePanelsProps {
  /** `horizontal` puts panels side by side; `vertical` stacks them. */
  readonly orientation?: "horizontal" | "vertical";
  readonly panels: ReadonlyArray<ResizablePanel>;
  /** Sizes in percent, in panel order. Pass it with `onSizesChange` to remember the layout. */
  readonly sizes?: ReadonlyArray<number>;
  readonly onSizesChange?: (sizes: ReadonlyArray<number>) => void;
  /** Sets the height of a horizontal group, or a minimum height. */
  readonly style?: StyleXStyles;
}

const keyStep = 2;
const largeKeyStep = 10;

/**
 * Panels that people resize, such as a list beside its detail or a query
 * above its results. Drag a handle, or focus it and use the arrow keys
 * (Shift for bigger steps), Home, and End. Panels nest: a panel's content can
 * be another ResizablePanels with the other orientation.
 */
export function ResizablePanels({
  orientation = "horizontal",
  panels,
  sizes,
  onSizesChange,
  style,
}: ResizablePanelsProps) {
  const [localSizes, setLocalSizes] = useState<ReadonlyArray<number>>(
    panels.map((panel) => panel.defaultSize),
  );
  const current = sizes ?? localSizes;
  const groupRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const isHorizontal = orientation === "horizontal";

  if (current.length !== panels.length)
    throw new Error("ResizablePanels: give one size for each panel.");

  const setSizes = (next: ReadonlyArray<number>) => {
    if (sizes === undefined) setLocalSizes(next);
    onSizesChange?.(next);
  };

  /** Moves the boundary after panel `index` so that panel gets `target` percent. */
  const resize = (index: number, target: number) => {
    const before = panels[index];
    const after = panels[index + 1];
    const beforeSize = current[index];
    const afterSize = current[index + 1];
    if (
      before === undefined ||
      after === undefined ||
      beforeSize === undefined ||
      afterSize === undefined
    )
      return;
    const pair = beforeSize + afterSize;
    const lowest = Math.max(before.minSize ?? 10, pair - (after.maxSize ?? 90));
    const highest = Math.min(before.maxSize ?? 90, pair - (after.minSize ?? 10));
    const size = Math.min(highest, Math.max(lowest, target));
    if (size === beforeSize) return;
    setSizes(
      current.map((value, position) => {
        if (position === index) return size;
        if (position === index + 1) return pair - size;
        return value;
      }),
    );
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const size = current[index] ?? 0;
    const step = event.shiftKey ? largeKeyStep : keyStep;
    const smaller = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const larger = isHorizontal ? "ArrowRight" : "ArrowDown";
    if (event.key === smaller) resize(index, size - step);
    else if (event.key === larger) resize(index, size + step);
    else if (event.key === "Home") resize(index, 0);
    else if (event.key === "End") resize(index, 100);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>, index: number) => {
    const group = groupRef.current;
    if (group === null) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    handle.focus();
    const rect = group.getBoundingClientRect();
    const total = isHorizontal ? rect.width : rect.height;
    const origin = isHorizontal ? event.clientX : event.clientY;
    const startSize = current[index] ?? 0;
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const position = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      resize(index, startSize + ((position - origin) / total) * 100);
    };
    const onUp = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  };

  return (
    <div
      ref={groupRef}
      {...stylex.props(styles.group, isHorizontal ? styles.row : styles.column, style)}
    >
      {panels.map((panel, index) => {
        const panelId = `${baseId}-${panel.id}`;
        const size = current[index] ?? panel.defaultSize;
        const next = panels[index + 1];
        return (
          <Fragment key={panel.id}>
            <div id={panelId} {...stylex.props(styles.panel, styles.basis(size))}>
              {panel.content}
            </div>
            {next === undefined ? null : (
              <Handle
                label={`Resize ${panel.label} and ${next.label}`}
                controls={panelId}
                isHorizontal={isHorizontal}
                value={Math.round(size)}
                min={panel.minSize ?? 10}
                max={panel.maxSize ?? 90}
                onKeyDown={(event) => onKeyDown(event, index)}
                onPointerDown={(event) => onPointerDown(event, index)}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

interface HandleProps {
  readonly label: string;
  readonly controls: string;
  readonly isHorizontal: boolean;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onKeyDown: (event: KeyboardEvent) => void;
  readonly onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}

/** A window splitter: a focusable separator with its value in percent. */
function Handle({
  label,
  controls,
  isHorizontal,
  value,
  min,
  max,
  onKeyDown,
  onPointerDown,
}: HandleProps) {
  const [isHovered, setHovered] = useState(false);
  const [isFocusVisible, setFocusVisible] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const isActive = isHovered || isFocusVisible || isDragging;
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-controls={controls}
      aria-orientation={isHorizontal ? "vertical" : "horizontal"}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        setDragging(true);
        onPointerDown(event);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => setFocusVisible(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFocusVisible(false)}
      {...stylex.props(styles.handle, isHorizontal ? styles.handleColumn : styles.handleRow)}
    >
      <span
        {...stylex.props(
          styles.line,
          isHorizontal ? styles.lineVertical : styles.lineHorizontal,
          isActive && styles.lineActive,
          isFocusVisible && (isHorizontal ? styles.lineFocusVertical : styles.lineFocusHorizontal),
        )}
      />
      <span
        aria-hidden
        {...stylex.props(
          styles.pill,
          isHorizontal ? styles.pillVertical : styles.pillHorizontal,
          isActive && styles.pillActive,
        )}
      />
    </div>
  );
}

const handleSize = "0.75rem";

const styles = stylex.create({
  group: { display: "flex", minWidth: 0, minHeight: 0, overflow: "hidden" },
  row: { flexDirection: "row", minHeight: "16rem" },
  column: { flexDirection: "column", height: "100%" },
  panel: { minWidth: 0, minHeight: 0, overflow: "auto" },
  basis: (size: number) => ({ flexBasis: 0, flexGrow: size, flexShrink: 1 }),
  handle: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    touchAction: "none",
    outlineStyle: "none",
  },
  handleColumn: {
    width: handleSize,
    marginInline: `calc(${handleSize} / -2)`,
    cursor: "col-resize",
    zIndex: 1,
  },
  handleRow: {
    height: handleSize,
    marginBlock: `calc(${handleSize} / -2)`,
    cursor: "row-resize",
    zIndex: 1,
  },
  line: {
    position: "absolute",
    backgroundColor: color.border,
    transitionProperty: "background-color",
    transitionDuration: motion.fast,
  },
  lineVertical: { top: 0, bottom: 0, width: "1px", left: `calc(50% - 0.5px)` },
  lineHorizontal: { left: 0, right: 0, height: "1px", top: `calc(50% - 0.5px)` },
  pill: {
    position: "relative",
    borderRadius: radius.full,
    backgroundColor: color.borderStrong,
    opacity: 0,
    transitionProperty: "opacity, background-color",
    transitionDuration: motion.fast,
  },
  lineActive: { backgroundColor: color.accent },
  lineFocusVertical: { width: "2px", left: "calc(50% - 1px)", backgroundColor: color.focus },
  lineFocusHorizontal: { height: "2px", top: "calc(50% - 1px)", backgroundColor: color.focus },
  pillVertical: { width: "0.25rem", height: space.xl },
  pillHorizontal: { height: "0.25rem", width: space.xl },
  pillActive: { opacity: 1, backgroundColor: color.accent },
});
