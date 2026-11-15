/**
 * A hook that keeps the keyboard focus in a collection when a change removes the focused item.
 *
 * @layer helper
 * @keywords focus after removal, focus management, lost focus, keyboard focus, focus restore, remove item, move item, useFocusAfterRemoval, isFocusLost
 * @related Kanban, SortableList, WorkQueue, Item
 * @notes accessibility, internal-app-composition, internal-app-adding-a-primitive
 *
 * Use `useFocusAfterRemoval` in a new collection where an action moves or
 * removes the focused item. `Kanban`, `SortableList`, and `WorkQueue` already
 * use it, so do not add it to them. Do not use it for a dialog: the dialog
 * gives the focus back to its trigger.
 *
 * ## Behavior
 * - When the focused item leaves, the focus goes to the next item in the
 *   order of `ids`, then to the item before, then to `emptyTarget()`.
 * - When the item stays but the browser drops the focus, such as after a
 *   move, the focus goes back to the item.
 * - It acts only when the focus is lost. A change that the person did not
 *   cause never takes the focus from a control in another place.
 * - It watches the elements of the container, not the renders, because a
 *   react-aria collection removes its items in a later render than the one
 *   that changes `ids`.
 * - It throws when the container is not mounted, when no item is left and
 *   `emptyTarget()` returns `null`, and when it finds no element for the next
 *   id.
 *
 * ## Rules
 * - A change never leaves the focus on the page body. With no item left, give
 *   the focus to the heading of the group or to the collection.
 * - When a panel or an inline form closes, give the focus back to the control
 *   that opened it.
 * - Before you move the focus after a change, make sure that `isFocusLost()`
 *   is true.
 *
 * ## Example
 * ```tsx
 * const listRef = useRef<HTMLDivElement>(null);
 * useFocusAfterRemoval({
 *   container: listRef,
 *   ids: rows.map((row) => row.id),
 *   itemSelector: "[data-key]",
 *   emptyTarget: () => headingRef.current,
 * });
 * ```
 */
import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

/**
 * True when no element has focus. The browser moves focus to the body when
 * it removes the focused element, so this is the sign that a change of the
 * page took the focus away from the person.
 */
export function isFocusLost(): boolean {
  const active = document.activeElement;
  return active === null || active === document.body;
}

export interface FocusAfterRemovalOptions {
  /**
   * The element that holds the items. It must stay mounted while the items
   * change, so it sees each focus change in the items.
   */
  readonly container: RefObject<HTMLElement | null>;
  /** The ids of the items in their order on the screen. */
  readonly ids: ReadonlyArray<string>;
  /**
   * A selector for the element of one item. That element has the id of the
   * item in `data-key`, as a react-aria collection item has.
   */
  readonly itemSelector: string;
  /** The element in an item that takes the focus. Without it, the item element takes it. */
  readonly focusTarget?: (item: HTMLElement) => HTMLElement;
  /**
   * The element that takes the focus when no item is left, such as the
   * heading of the group or the collection itself.
   */
  readonly emptyTarget: () => HTMLElement | null;
}

/**
 * Keeps the keyboard in a collection when the focused item leaves it. When a
 * change removes the item that has the focus, such as an action that moves a
 * card to another group, the focus goes to the next item in the same order.
 * After the last item it goes to the item before. With no item left, it goes
 * to `emptyTarget`. When the item stays but the browser dropped the focus,
 * such as after a move in the list, the focus goes back to the item.
 *
 * The hook acts only when the focus is lost. A change that the person did
 * not cause never takes the focus from a control somewhere else. It watches
 * the elements of the container, not the renders, because a react-aria
 * collection removes its items in a later render than the one that changes
 * `ids`.
 */
export function useFocusAfterRemoval(options: FocusAfterRemovalOptions): void {
  const { container, ids, itemSelector } = options;
  const latest = useRef(options);
  const focusedId = useRef<string | null>(null);
  // The last ids that held the focused item, so the next item is known after it left.
  const idsWithFocused = useRef(ids);

  useLayoutEffect(() => {
    latest.current = options;
    const focused = focusedId.current;
    if (focused === null || ids.includes(focused)) idsWithFocused.current = ids;
  });

  useEffect(() => {
    const root = container.current;
    if (root === null) throw new Error("useFocusAfterRemoval: the container is not mounted.");
    const itemElements = () => Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    // A nested collection can match the selector too, so the walk goes up to an item of this one.
    const itemOf = (target: EventTarget | null): HTMLElement | null => {
      let item = target instanceof Element ? target.closest<HTMLElement>(itemSelector) : null;
      while (item !== null && root.contains(item)) {
        if (latest.current.ids.includes(item.dataset.key ?? "")) return item;
        item = item.parentElement?.closest<HTMLElement>(itemSelector) ?? null;
      }
      return null;
    };
    const onFocusIn = (event: FocusEvent) => {
      focusedId.current = itemOf(event.target)?.dataset.key ?? null;
      idsWithFocused.current = latest.current.ids;
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
      const item = itemOf(event.target);
      // The browser sends this event also when it removes the focused element, and the
      // change can put the focus back into the item. The item is forgotten only when it
      // is still on the page and the focus is outside it.
      requestAnimationFrame(() => {
        if (item === null) return;
        if (focusedId.current !== item.dataset.key) return;
        if (item.isConnected && !item.contains(document.activeElement)) focusedId.current = null;
      });
    };
    const restore = () => {
      const lost = focusedId.current;
      if (lost === null || !isFocusLost()) return;
      const {
        ids: current,
        focusTarget = (item: HTMLElement) => item,
        emptyTarget,
      } = latest.current;
      const elements = itemElements();
      const shown = new Set(elements.map((element) => element.dataset.key));
      const before = idsWithFocused.current;
      const index = before.indexOf(lost);
      const isAvailable = (id: string) => current.includes(id) && shown.has(id);
      const nextId = isAvailable(lost)
        ? lost
        : (before.slice(index + 1).find(isAvailable) ??
          before.slice(0, Math.max(index, 0)).toReversed().find(isAvailable) ??
          current.find(isAvailable));
      focusedId.current = null;
      if (nextId === undefined) {
        const target = emptyTarget();
        if (target === null)
          throw new Error("useFocusAfterRemoval: the collection is empty and has no empty target.");
        target.focus();
        return;
      }
      const item = elements.find((element) => element.dataset.key === nextId);
      if (item === undefined) throw new Error(`useFocusAfterRemoval: no element for ${nextId}.`);
      focusTarget(item).focus();
    };
    const observer = new MutationObserver(restore);
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [container, itemSelector]);
}
