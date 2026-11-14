import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { media, motion } from "@/styles/tokens.stylex";

/**
 * Motion that helps people follow an object when the state changes. See
 * Motion in the styling reference for what to animate and what to leave still.
 *
 * - `withViewTransition` animates a move between lanes or groups and an item
 *   that leaves a list. Give each moving element a `viewTransitionName`.
 * - `useDropTransition` does the same for a drag-and-drop collection.
 * - `motionStyles.enter` with `useArrivals` animates items that arrive from
 *   the server, such as a new ticket after a refetch.
 * - `motionStyles.changed` with `useHasChanged` marks a value that changes in
 *   place, such as a status badge.
 */

let runningTransitions = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Runs `update` inside a view transition, so elements with a
 * `viewTransitionName` move from their old place to their new place and other
 * named elements fade in or out. Without the API, with reduced motion, or in a
 * hidden tab, it runs `update` at once. Call it from an event handler, not
 * during a render.
 *
 * `update` must change the state synchronously: a React state setter, a
 * `queryClient.setQueryData`, or a router navigation. Put the request after it.
 * An error from `update` goes to the window error handlers, like an error in
 * an event handler.
 */
export function withViewTransition(update: () => void): void {
  if (
    typeof document.startViewTransition !== "function" ||
    document.visibilityState === "hidden" ||
    prefersReducedMotion()
  ) {
    update();
    return;
  }
  runningTransitions += 1;
  const transition = document.startViewTransition(async () => {
    try {
      flushSync(update);
    } catch (error) {
      reportError(error);
      return;
    }
    // TanStack Query tells its observers in a later task, so the browser must
    // wait one task before it captures the new state.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  transition.ready.catch((error: unknown) => {
    // A newer transition replaces this one with an AbortError; that is expected.
    // A duplicate `viewTransitionName` is an InvalidStateError and a bug.
    if (error instanceof DOMException && error.name === "AbortError") return;
    reportError(error);
  });
  const done = () => {
    runningTransitions -= 1;
  };
  transition.finished.then(done, done);
}

/** True while a `withViewTransition` update runs or animates. */
export function isViewTransitionRunning(): boolean {
  return runningTransitions > 0;
}

/**
 * A `view-transition-name` for one element in one component. A name must be
 * unique in the document, so take `scope` from `useId()` and the parts from
 * the kind and the id of the element, such as `"card", item.id`. Pass the
 * result to `motionStyles.named`.
 */
export function viewTransitionName(scope: string, ...parts: ReadonlyArray<string>): string {
  return ["vt", ...[scope, ...parts].map(encodeIdent)].join("-");
}

// Letters and digits stay; every other character becomes `_<hex>_`, so two
// different inputs never give the same name and "-" only joins the parts.
function encodeIdent(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/gu, (char) => `_${(char.codePointAt(0) ?? 0).toString(16)}_`);
}

let lastInput: "pointer" | "keyboard" = "keyboard";
let isInputTracked = false;

function trackInput() {
  if (isInputTracked) return;
  isInputTracked = true;
  const options = { capture: true, passive: true };
  document.addEventListener("pointerdown", () => (lastInput = "pointer"), options);
  document.addEventListener("keydown", () => (lastInput = "keyboard"), options);
}

/**
 * View transitions for a drag-and-drop collection, such as a board or a
 * sortable list. Call `commit(ids, update)` in the drop handler with the ids
 * of the moved items. Give every item a `viewTransitionName`, except the items
 * in `droppedByPointer`.
 *
 * An item that moves by the keyboard glides from its old place to its new
 * place. An item that people drop with the pointer is already at its new
 * place, so it has no name during the transition and lands at once. The other
 * items make room in both cases.
 */
export function useDropTransition(): {
  readonly droppedByPointer: ReadonlySet<string>;
  readonly commit: (ids: Iterable<string>, update: () => void) => void;
} {
  const [droppedByPointer, setDroppedByPointer] = useState<ReadonlySet<string>>(noKeys);
  useEffect(trackInput, []);
  const commit = (ids: Iterable<string>, update: () => void) => {
    // The browser captures the old state after this handler, so the dropped
    // items lose their names first.
    flushSync(() => setDroppedByPointer(lastInput === "pointer" ? new Set(ids) : noKeys));
    withViewTransition(update);
  };
  return { droppedByPointer, commit };
}

/**
 * The keys that were not in the previous `keys`. It is empty on the first
 * render, so a page that loads does not animate, and while a view transition
 * runs, because the transition moves those items. Give the arriving items
 * `motionStyles.enter`.
 */
export function useArrivals(keys: ReadonlyArray<string>): ReadonlySet<string> {
  const [previous, setPrevious] = useState(keys);
  const [arrivals, setArrivals] = useState<ReadonlySet<string>>(noKeys);
  if (!sameKeys(previous, keys)) {
    setPrevious(keys);
    const before = new Set(previous);
    setArrivals(
      isViewTransitionRunning() ? noKeys : new Set(keys.filter((key) => !before.has(key))),
    );
  }
  return arrivals;
}

const noKeys: ReadonlySet<string> = new Set();

function sameKeys(left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

/**
 * True after `value` changes, and false on the first render. Give the element
 * that shows the value `key={value}` and `hasChanged && motionStyles.changed`,
 * so each change mounts a new element and plays the animation once.
 */
export function useHasChanged(value: string | number | boolean | null): boolean {
  const [previous, setPrevious] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);
  if (!Object.is(previous, value)) {
    setPrevious(value);
    setHasChanged(true);
  }
  return hasChanged;
}

const enterFrames = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
  to: { opacity: 1, transform: "none" },
});

const changedFrames = stylex.keyframes({
  from: { opacity: 0.4, transform: "scale(0.9)" },
  to: { opacity: 1, transform: "none" },
});

export const motionStyles = stylex.create({
  /** An item that arrives in a list without a view transition. */
  enter: {
    animationName: enterFrames,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.easeOut,
  },
  /**
   * A value that changes in place, such as a status badge. A transform does
   * not apply to an inline element, so put it on a block or an inline-flex element.
   */
  changed: {
    animationName: changedFrames,
    animationDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
    animationTimingFunction: motion.easeOut,
  },
  /** Sets the `view-transition-name` from `viewTransitionName`. */
  named: (name: string) => ({ viewTransitionName: name }),
});
