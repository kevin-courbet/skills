// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import {
  type CalendarDate,
  endOfWeek,
  isSameDay,
  isWeekend,
  maxDate,
  minDate,
  parseDate,
  startOfWeek,
} from "@internationalized/date";
import { ChevronRight, Diamond, GripVertical } from "lucide-react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Button,
  Collection,
  type Key,
  Tree,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { appLocale, appTimeZone } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";
import type { BadgeIntent } from "./badge";

export interface GanttTask {
  readonly id: string;
  readonly title: string;
  /** First day, as an ISO date. Groups take their dates from their tasks. */
  readonly start?: string;
  /** Last day, inclusive, as an ISO date, like the DateRangePicker value. */
  readonly end?: string;
  /** Percent done, 0 to 100. */
  readonly progress?: number;
  readonly intent?: BadgeIntent;
  /** Who does the task. The load lane counts tasks per assignee and day. */
  readonly assignee?: string;
  /** Quiet text after the bar. It defaults to the assignee. */
  readonly meta?: string;
  /** A one-day gate, drawn as a diamond at `start`. */
  readonly milestone?: boolean;
  /** Ids of the tasks that must finish first. Arrows run from their end to this start. */
  readonly dependsOn?: ReadonlyArray<string>;
  /** Tasks of a group. The group bar spans them and shows their progress. */
  readonly children?: ReadonlyArray<GanttTask>;
}

export interface GanttChange {
  readonly start: string;
  readonly end: string;
}

/** A task moved among its siblings. `parentId` is null for top-level tasks. */
export interface GanttMove {
  readonly taskId: string;
  readonly parentId: string | null;
  readonly fromIndex: number;
  readonly toIndex: number;
}

export interface GanttLoad {
  /** Tasks one assignee can carry on a day. Days above it show as a warning. */
  readonly limit: number;
}

export interface GanttProps {
  /** Names the chart, such as "Migration plan". */
  readonly label: string;
  readonly tasks: ReadonlyArray<GanttTask>;
  /** Today's ISO date from the loader. A line marks it. */
  readonly today: string;
  /** `day` shows each day; `week` fits longer plans. */
  readonly scale?: "day" | "week";
  readonly defaultExpandedIds?: ReadonlyArray<string>;
  readonly selectedId?: string | null;
  readonly onSelectionChange?: (id: string | null) => void;
  /** Opens a task, such as a sheet with its details. Enter and a double click call it. */
  readonly onTaskAction?: (task: GanttTask) => void;
  /**
   * Makes task bars movable: drag a bar to move it or its edges to change its
   * dates, or press Alt with the arrow keys on the selected task. Persist the
   * change and update `tasks`.
   */
  readonly onTaskChange?: (task: GanttTask, change: GanttChange) => void;
  /**
   * Makes the task order changeable among siblings: drag a row by its grip,
   * or press Alt with Up or Down on the selected task. Receives the tasks in
   * their new order and the move; apply it optimistically and persist it.
   */
  readonly onReorder?: (tasks: ReadonlyArray<GanttTask>, move: GanttMove) => void;
  /**
   * Adds a load lane under the tasks: one row per assignee with the number of
   * their tasks on each day. Groups and milestones do not count.
   */
  readonly load?: GanttLoad;
}

interface Row {
  readonly task: GanttTask;
  readonly start: CalendarDate;
  /** Inclusive. */
  readonly end: CalendarDate;
  readonly progress: number;
  readonly isGroup: boolean;
}

const dayWidths = { day: 2, week: 0.625 } as const;
const nameWidth = "15rem";
const nameWidthNarrow = "9.5rem";
const rowHeight = 2.25;

/**
 * Tasks on a time line, such as a migration plan or a release schedule. The
 * task list is a tree: arrow keys move between tasks, Right and Left open and
 * close groups. Bars show progress, milestones are diamonds, and arrows join
 * dependent tasks. The chart scrolls sideways; the task names stay in view.
 */
export function Gantt({
  label,
  tasks,
  today,
  scale = "day",
  defaultExpandedIds,
  selectedId,
  onSelectionChange,
  onTaskAction,
  onTaskChange,
  onReorder,
  load,
}: GanttProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<Key>>(
    new Set(defaultExpandedIds ?? groupIds(tasks)),
  );
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const selected = selectedId === undefined ? localSelected : selectedId;
  const [preview, setPreview] = useState<{
    id: string;
    start: CalendarDate;
    end: CalendarDate;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLSpanElement>(null);
  const nameHeaderRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [rowDrop, setRowDrop] = useState<{ id: string; toIndex: number } | null>(null);
  const focusAfterMove = useRef<string | null>(null);

  // A moved row re-renders in its new place; keep the keyboard on it.
  useEffect(() => {
    const id = focusAfterMove.current;
    if (id === null) return;
    focusAfterMove.current = null;
    const row = bodyRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(id)}"]`);
    if (row !== null && row !== undefined && document.activeElement !== row) row.focus();
  });

  // Opens the chart with today in view; the plan usually starts earlier.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const marker = todayRef.current;
    const names = nameHeaderRef.current;
    if (scroller === null || marker === null || names === null) return;
    const left = marker.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
    scroller.scrollLeft = Math.max(0, left - names.offsetWidth - marker.offsetWidth * 3);
  }, [scale]);
  const markerId = `gantt-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const rows = new Map<string, Row>();
  const resolve = (task: GanttTask): Row => {
    const children = (task.children ?? []).map(resolve);
    const isGroup = children.length > 0;
    let row: Row;
    if (isGroup) {
      const totalDays = children.reduce((sum, child) => sum + span(child.start, child.end), 0);
      row = {
        task,
        start: children.map((child) => child.start).reduce((a, b) => minDate(a, b) ?? a),
        end: children.map((child) => child.end).reduce((a, b) => maxDate(a, b) ?? a),
        progress:
          totalDays === 0
            ? 0
            : children.reduce(
                (sum, child) => sum + child.progress * span(child.start, child.end),
                0,
              ) / totalDays,
        isGroup,
      };
    } else {
      if (task.start === undefined) throw new Error(`Gantt: task ${task.id} needs a start date.`);
      const isPreview = preview !== null && preview.id === task.id;
      const start = isPreview ? preview.start : parseDate(task.start);
      const end = isPreview ? preview.end : parseDate(task.end ?? task.start);
      if (end.compare(start) < 0) throw new Error(`Gantt: task ${task.id} ends before it starts.`);
      row = { task, start, end, progress: task.progress ?? 0, isGroup };
    }
    rows.set(task.id, row);
    return row;
  };
  const roots = tasks.map(resolve);
  if (roots.length === 0) return null;

  const todayDate = parseDate(today);
  const first = startOfWeek(
    [...rows.values(), { start: todayDate }]
      .map((row) => row.start)
      .reduce((a, b) => minDate(a, b) ?? a)
      .subtract({ days: 2 }),
    appLocale,
  );
  const last = endOfWeek(
    [...rows.values(), { end: todayDate }]
      .map((row) => row.end)
      .reduce((a, b) => maxDate(a, b) ?? a)
      .add({ days: 3 }),
    appLocale,
  );
  const days = span(first, last);
  const dayWidth = dayWidths[scale];
  const offset = (date: CalendarDate) => date.compare(first);
  const visible = visibleRows(tasks, expanded);
  const visibleCount = visible.length;
  const indexOf = new Map(visible.map((task, index) => [task.id, index]));
  const dropLine = rowDropLine(rowDrop, tasks, visible, indexOf);

  const commit = (task: GanttTask, start: CalendarDate, end: CalendarDate) => {
    onTaskChange?.(task, { start: start.toString(), end: end.toString() });
    setAnnouncement(`${task.title}: ${rangeLabel(start, end)}`);
  };

  const reorder = (taskId: string, toIndex: number) => {
    const place = siblingsOf(tasks, taskId, null);
    if (onReorder === undefined || place === undefined) return;
    const fromIndex = place.siblings.findIndex((task) => task.id === taskId);
    const target = Math.min(place.siblings.length - 1, Math.max(0, toIndex));
    if (target === fromIndex) return;
    const task = place.siblings[fromIndex];
    if (task === undefined) return;
    focusAfterMove.current = taskId;
    setAnnouncement(`${task.title}: position ${target + 1} of ${place.siblings.length}`);
    onReorder(moveTask(tasks, place.parentId, fromIndex, target), {
      taskId,
      parentId: place.parentId,
      fromIndex,
      toIndex: target,
    });
  };

  const onKeyDownCapture = (event: KeyboardEvent) => {
    if (selected === null || !event.altKey) return;
    if (onReorder !== undefined && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      event.stopPropagation();
      const place = siblingsOf(tasks, selected, null);
      if (place === undefined) return;
      const index = place.siblings.findIndex((task) => task.id === selected);
      reorder(selected, index + (event.key === "ArrowDown" ? 1 : -1));
      return;
    }
    if (onTaskChange === undefined) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const row = rows.get(selected);
    if (row === undefined || row.isGroup) return;
    event.preventDefault();
    event.stopPropagation();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    if (event.shiftKey && row.task.milestone !== true) {
      const end = row.end.add({ days: delta });
      if (end.compare(row.start) >= 0) commit(row.task, row.start, end);
      return;
    }
    commit(row.task, row.start.add({ days: delta }), row.end.add({ days: delta }));
  };

  const startDrag = (
    event: PointerEvent<HTMLElement>,
    row: Row,
    mode: "move" | "start" | "end",
  ) => {
    if (onTaskChange === undefined || row.isGroup) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const timeline = timelineRef.current;
    const pxPerDay = timeline === null ? 16 : timeline.getBoundingClientRect().width / days;
    const originX = event.clientX;
    let next = { id: row.task.id, start: row.start, end: row.end };
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const delta = Math.round((moveEvent.clientX - originX) / pxPerDay);
      const start = mode === "end" ? row.start : row.start.add({ days: delta });
      const end = mode === "start" ? row.end : row.end.add({ days: delta });
      if (end.compare(start) < 0) return;
      next = { id: row.task.id, start, end };
      setPreview(next);
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      setPreview(null);
      if (!isSameDay(next.start, row.start) || !isSameDay(next.end, row.end))
        commit(row.task, next.start, next.end);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  /**
   * Drags a row by its grip. The row lands before the sibling whose middle the
   * pointer is above; a line shows the place while the pointer moves.
   */
  const startRowDrag = (event: PointerEvent<HTMLElement>, taskId: string) => {
    const body = bodyRef.current;
    const place = siblingsOf(tasks, taskId, null);
    if (onReorder === undefined || body === null || place === undefined || event.button !== 0)
      return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const rowPx = body.getBoundingClientRect().height / Math.max(1, visibleCount);
    const fromIndex = place.siblings.findIndex((task) => task.id === taskId);
    let toIndex = fromIndex;
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const pointerRow = (moveEvent.clientY - body.getBoundingClientRect().top) / rowPx;
      toIndex = place.siblings.filter((sibling, index) => {
        if (index === fromIndex) return false;
        const at = indexOf.get(sibling.id);
        return at !== undefined && pointerRow > at + 0.5;
      }).length;
      setRowDrop({ id: taskId, toIndex });
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      setRowDrop(null);
      reorder(taskId, toIndex);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  const dayList = Array.from({ length: days }, (_, index) => first.add({ days: index }));
  const timelineWidth = `${days * dayWidth}rem`;

  return (
    <div {...stylex.props(styles.root)}>
      <div ref={scrollerRef} {...stylex.props(styles.scroller)} onKeyDownCapture={onKeyDownCapture}>
        <div {...stylex.props(styles.canvas)}>
          <div aria-hidden {...stylex.props(styles.header)}>
            <div ref={nameHeaderRef} {...stylex.props(styles.headerName)}>
              Task
            </div>
            <div {...stylex.props(styles.headerTimeline, styles.width(timelineWidth))}>
              <span
                ref={todayRef}
                {...stylex.props(
                  styles.todayAnchor,
                  styles.at(offset(todayDate) / days),
                  styles.width(`${dayWidth}rem`),
                )}
              />
              <div {...stylex.props(styles.headerBand)}>
                {periods(dayList, scale).map((period) => (
                  <span
                    key={period.key}
                    {...stylex.props(styles.period, styles.width(`${period.days * dayWidth}rem`))}
                  >
                    {period.label}
                  </span>
                ))}
              </div>
              {scale === "day" ? (
                <div {...stylex.props(styles.headerBand)}>
                  {dayList.map((day) => (
                    <span
                      key={day.toString()}
                      {...stylex.props(
                        styles.dayCell,
                        styles.width(`${dayWidth}rem`),
                        isWeekend(day, appLocale) && styles.dayCellWeekend,
                        isSameDay(day, todayDate) && styles.dayCellToday,
                      )}
                    >
                      {day.day}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div ref={bodyRef} {...stylex.props(styles.body)}>
            <svg
              aria-hidden
              {...stylex.props(
                styles.layer,
                styles.layerBack,
                styles.layerLeft,
                styles.width(timelineWidth),
                styles.layerHeight(visible.length * rowHeight),
              )}
            >
              {dayList.map((day, index) =>
                isWeekend(day, appLocale) ? (
                  <rect
                    key={day.toString()}
                    x={`${(index / days) * 100}%`}
                    width={`${100 / days}%`}
                    y="0"
                    height="100%"
                    {...stylex.props(styles.weekend)}
                  />
                ) : null,
              )}
              <line
                x1={`${((offset(todayDate) + 0.5) / days) * 100}%`}
                x2={`${((offset(todayDate) + 0.5) / days) * 100}%`}
                y1="0"
                y2="100%"
                {...stylex.props(styles.today)}
              />
            </svg>
            <Tree
              aria-label={label}
              items={tasks}
              dependencies={[preview, rows.size, scale, first.toString()]}
              expandedKeys={expanded}
              onExpandedChange={setExpanded}
              selectionMode="single"
              selectionBehavior="replace"
              selectedKeys={selected === null ? [] : [selected]}
              onSelectionChange={(keys) => {
                const value = keys === "all" ? undefined : keys.values().next().value;
                const id = value === undefined ? null : String(value);
                if (selectedId === undefined) setLocalSelected(id);
                onSelectionChange?.(id);
              }}
              onAction={
                onTaskAction === undefined
                  ? undefined
                  : (key) => {
                      const row = rows.get(String(key));
                      if (row !== undefined) onTaskAction(row.task);
                    }
              }
              {...stylex.props(styles.tree)}
            >
              {function renderTask(task: GanttTask): ReactNode {
                const row = rows.get(task.id);
                if (row === undefined) return null;
                return (
                  <TreeItem
                    id={task.id}
                    textValue={task.title}
                    aria-label={taskLabel(row)}
                    {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean }>((state) => [
                      styles.row,
                      state.isSelected && styles.rowSelected,
                      state.isFocusVisible && styles.rowFocused,
                    ])}
                  >
                    <TreeItemContent>
                      {({ level, hasChildItems, isExpanded, isSelected }) => (
                        <div {...stylex.props(styles.rowInner)}>
                          <div
                            {...stylex.props(
                              styles.nameCell,
                              isSelected && styles.nameCellSelected,
                              styles.indent(level),
                            )}
                          >
                            {onReorder === undefined ? null : (
                              <span
                                aria-hidden
                                onPointerDown={(event) => startRowDrag(event, task.id)}
                                {...stylex.props(
                                  styles.rowGrip,
                                  rowDrop?.id === task.id && styles.rowGripActive,
                                )}
                              >
                                <GripVertical {...stylex.props(styles.rowGripIcon)} />
                              </span>
                            )}
                            {hasChildItems ? (
                              <Button slot="chevron" {...stylex.props(styles.chevronButton)}>
                                <ChevronRight
                                  aria-hidden
                                  {...stylex.props(
                                    styles.chevron,
                                    isExpanded && styles.chevronOpen,
                                  )}
                                />
                              </Button>
                            ) : (
                              <span aria-hidden {...stylex.props(styles.chevronSpacer)} />
                            )}
                            {task.milestone === true ? (
                              <Diamond aria-hidden {...stylex.props(styles.milestoneIcon)} />
                            ) : null}
                            <span {...stylex.props(styles.name, row.isGroup && styles.nameGroup)}>
                              {task.title}
                            </span>
                            <span {...stylex.props(styles.dates)}>
                              {rangeLabel(row.start, row.end)}
                            </span>
                          </div>
                          <div
                            ref={level === 1 && task.id === tasks[0]?.id ? timelineRef : undefined}
                            {...stylex.props(styles.timeline, styles.width(timelineWidth))}
                          >
                            <TaskBar
                              row={row}
                              left={offset(row.start) / days}
                              width={span(row.start, row.end) / days}
                              isDraggable={onTaskChange !== undefined && !row.isGroup}
                              onDragStart={startDrag}
                            />
                          </div>
                        </div>
                      )}
                    </TreeItemContent>
                    {task.children === undefined ? null : (
                      <Collection
                        items={task.children}
                        dependencies={[preview, rows.size, scale, first.toString()]}
                      >
                        {renderTask}
                      </Collection>
                    )}
                  </TreeItem>
                );
              }}
            </Tree>
            <svg
              aria-hidden
              {...stylex.props(
                styles.layer,
                styles.layerFront,
                styles.layerLeft,
                styles.width(timelineWidth),
                styles.layerHeight(visible.length * rowHeight),
              )}
              viewBox={`0 0 ${days * dayWidth * 16} ${visible.length * rowHeight * 16}`}
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id={markerId}
                  viewBox="0 0 6 6"
                  refX="5"
                  refY="3"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 z" {...stylex.props(styles.arrowHead)} />
                </marker>
              </defs>
              {visible.flatMap((task) =>
                (task.dependsOn ?? []).map((sourceId) => {
                  const source = rows.get(sourceId);
                  const target = rows.get(task.id);
                  const fromIndex = indexOf.get(sourceId);
                  const toIndex = indexOf.get(task.id);
                  if (
                    source === undefined ||
                    target === undefined ||
                    fromIndex === undefined ||
                    toIndex === undefined
                  )
                    return null;
                  const unit = dayWidth * 16;
                  const rowPx = rowHeight * 16;
                  return (
                    <path
                      key={`${sourceId}-${task.id}`}
                      d={dependencyPath(
                        exitPoint(source, offset, unit),
                        (fromIndex + 0.5) * rowPx,
                        entryPoint(target, offset, unit),
                        (toIndex + 0.5) * rowPx,
                        rowPx / 2,
                        barHalfHeight(source),
                      )}
                      markerEnd={`url(#${markerId})`}
                      vectorEffect="non-scaling-stroke"
                      {...stylex.props(styles.arrow)}
                    />
                  );
                }),
              )}
            </svg>
            {dropLine === undefined ? null : (
              <span aria-hidden {...stylex.props(styles.rowDrop, styles.rowDropAt(dropLine))} />
            )}
          </div>
          {load === undefined ? null : (
            <LoadLane
              rows={[...rows.values()]}
              load={load}
              dayList={dayList}
              dayWidth={dayWidth}
              timelineWidth={timelineWidth}
            />
          )}
        </div>
      </div>
      {onTaskChange === undefined && onReorder === undefined ? null : (
        <p {...stylex.props(styles.hint)}>
          {hintText(onTaskChange !== undefined, onReorder !== undefined)}
        </p>
      )}
      <span aria-live="polite" {...stylex.props(styles.srOnly)}>
        {announcement}
      </span>
    </div>
  );
}

function TaskBar({
  row,
  left,
  width,
  isDraggable,
  onDragStart,
}: {
  readonly row: Row;
  readonly left: number;
  readonly width: number;
  readonly isDraggable: boolean;
  readonly onDragStart: (
    event: PointerEvent<HTMLElement>,
    row: Row,
    mode: "move" | "start" | "end",
  ) => void;
}) {
  const intent = row.task.intent ?? "accent";
  if (row.task.milestone === true)
    return (
      <span
        onPointerDown={isDraggable ? (event) => onDragStart(event, row, "move") : undefined}
        {...stylex.props(
          styles.milestone,
          diamondColors[intent],
          styles.at(left + width / 2),
          isDraggable && styles.draggable,
        )}
      />
    );
  if (row.isGroup)
    return (
      <span {...stylex.props(styles.groupBar, styles.place(left, width))}>
        <span {...stylex.props(styles.groupFill, styles.fill(row.progress))} />
      </span>
    );
  return (
    <>
      <span
        onPointerDown={isDraggable ? (event) => onDragStart(event, row, "move") : undefined}
        {...stylex.props(
          styles.bar,
          barColors[intent],
          styles.place(left, width),
          isDraggable && styles.draggable,
        )}
      >
        <span {...stylex.props(styles.barFill, fillColors[intent], styles.fill(row.progress))} />
        {isDraggable ? (
          <>
            <span
              onPointerDown={(event) => onDragStart(event, row, "start")}
              {...stylex.props(styles.handle, styles.handleStart)}
            />
            <span
              onPointerDown={(event) => onDragStart(event, row, "end")}
              {...stylex.props(styles.handle, styles.handleEnd)}
            />
          </>
        ) : null}
      </span>
      {labelOf(row.task) === undefined ? null : (
        <span {...stylex.props(styles.barMeta, styles.after(left + width))}>
          {labelOf(row.task)}
        </span>
      )}
    </>
  );
}

/** Pixels a dependency line keeps from the end of its source bar. */
const exitInset = 6;
const turn = 8;

function labelOf(task: GanttTask): string | undefined {
  return task.meta ?? task.assignee;
}

/** The x where a dependency leaves its source: just inside the bar end, so the line clears the label after the bar. */
function exitPoint(row: Row, offset: (date: CalendarDate) => number, unit: number): number {
  if (row.task.milestone === true) return (offset(row.start) + 0.5) * unit;
  const left = offset(row.start) * unit + 2;
  const right = (offset(row.end) + 1) * unit - 2;
  return Math.max(left + 2, right - exitInset);
}

/** The x where a dependency reaches its target: the bar start, or the left tip of a milestone. */
function entryPoint(row: Row, offset: (date: CalendarDate) => number, unit: number): number {
  if (row.task.milestone === true) return (offset(row.start) + 0.5) * unit - 7;
  return offset(row.start) * unit + 1;
}

function barHalfHeight(row: Row): number {
  if (row.task.milestone === true) return 8;
  return row.isGroup ? 3 : 9;
}

/**
 * Line from a task to a task that waits for it. It leaves the source bar
 * through its bottom (or top) edge near the end, drops to the target row, and
 * enters the target from the left. Labels after the bars stay clear. When the
 * target starts before the exit, the line runs along the row border back to
 * a turn before the target.
 */
function dependencyPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  halfRow: number,
  halfBar: number,
): string {
  const down = y2 > y1;
  const exitY = down ? y1 + halfBar : y1 - halfBar;
  if (x2 - x1 >= turn) return `M${x1},${exitY} V${y2} H${x2}`;
  const between = down ? y2 - halfRow : y2 + halfRow;
  return `M${x1},${exitY} V${between} H${x2 - turn} V${y2} H${x2}`;
}

function hintText(canChangeDates: boolean, canReorder: boolean): string {
  const parts = [
    canChangeDates
      ? "Drag a bar or its edges to change dates. With a task selected, Alt and Left or Right move it, and Alt, Shift, and Left or Right change its end."
      : undefined,
    canReorder
      ? "Drag a row by its grip to change the order, or press Alt and Up or Down on the selected task."
      : undefined,
  ];
  return parts.filter((part) => part !== undefined).join(" ");
}

/** The siblings of a task and their parent, or undefined when the id is not in the tree. */
function siblingsOf(
  tasks: ReadonlyArray<GanttTask>,
  id: string,
  parentId: string | null,
): { readonly siblings: ReadonlyArray<GanttTask>; readonly parentId: string | null } | undefined {
  if (tasks.some((task) => task.id === id)) return { siblings: tasks, parentId };
  for (const task of tasks) {
    const found = task.children === undefined ? undefined : siblingsOf(task.children, id, task.id);
    if (found !== undefined) return found;
  }
  return undefined;
}

function moveTask(
  tasks: ReadonlyArray<GanttTask>,
  parentId: string | null,
  fromIndex: number,
  toIndex: number,
): ReadonlyArray<GanttTask> {
  const move = (list: ReadonlyArray<GanttTask>) => {
    const next = [...list];
    const [task] = next.splice(fromIndex, 1);
    if (task === undefined) throw new Error("Gantt: the moved task is missing.");
    next.splice(toIndex, 0, task);
    return next;
  };
  if (parentId === null) return move(tasks);
  return tasks.map((task) => {
    if (task.id === parentId && task.children !== undefined)
      return { ...task, children: move(task.children) };
    if (task.children === undefined) return task;
    return { ...task, children: moveTask(task.children, parentId, fromIndex, toIndex) };
  });
}

function subtreeRows(task: GanttTask, indexOf: ReadonlyMap<string, number>): number {
  return (task.children ?? []).reduce(
    (sum, child) => sum + (indexOf.has(child.id) ? subtreeRows(child, indexOf) : 0),
    1,
  );
}

/** The row border, in rows from the top, where a dragged row would land. */
function rowDropLine(
  drop: { readonly id: string; readonly toIndex: number } | null,
  tasks: ReadonlyArray<GanttTask>,
  visible: ReadonlyArray<GanttTask>,
  indexOf: ReadonlyMap<string, number>,
): number | undefined {
  if (drop === null) return undefined;
  const place = siblingsOf(tasks, drop.id, null);
  if (place === undefined) return undefined;
  const others = place.siblings.filter((task) => task.id !== drop.id);
  const before = others[drop.toIndex];
  if (before !== undefined) return indexOf.get(before.id);
  const last = others[others.length - 1];
  if (last === undefined) return undefined;
  const at = indexOf.get(last.id);
  return at === undefined ? visible.length : at + subtreeRows(last, indexOf);
}

/**
 * One row per assignee with the number of their tasks on each day. The cells
 * are drawn for scanning; each row also says in words which days go over the
 * limit, so the warning does not depend on color.
 */
function LoadLane({
  rows,
  load,
  dayList,
  dayWidth,
  timelineWidth,
}: {
  readonly rows: ReadonlyArray<Row>;
  readonly load: GanttLoad;
  readonly dayList: ReadonlyArray<CalendarDate>;
  readonly dayWidth: number;
  readonly timelineWidth: string;
}) {
  const work = rows.filter(
    (row) => !row.isGroup && row.task.milestone !== true && row.task.assignee !== undefined,
  );
  const assignees = [...new Set(work.map((row) => row.task.assignee ?? ""))].toSorted((a, b) =>
    a.localeCompare(b, appLocale),
  );
  if (assignees.length === 0) return null;
  return (
    <div role="list" aria-label="Load per assignee" {...stylex.props(styles.load)}>
      <div aria-hidden {...stylex.props(styles.loadHeader)}>
        <div {...stylex.props(styles.loadHeaderName)}>Load</div>
        <div {...stylex.props(styles.width(timelineWidth))} />
      </div>
      {assignees.map((assignee) => {
        const counts = dayList.map(
          (day) =>
            work.filter(
              (row) =>
                row.task.assignee === assignee &&
                row.start.compare(day) <= 0 &&
                row.end.compare(day) >= 0,
            ).length,
        );
        const over = dayList.filter((_, index) => (counts[index] ?? 0) > load.limit);
        return (
          <div role="listitem" key={assignee} {...stylex.props(styles.loadRow)}>
            <div {...stylex.props(styles.loadName)}>
              <span {...stylex.props(styles.name)}>{assignee}</span>
              <span {...stylex.props(styles.srOnly)}>
                {over.length === 0
                  ? `, within the limit of ${load.limit} every day`
                  : `, over the limit of ${load.limit} on ${dayRuns(over)}`}
              </span>
            </div>
            <div aria-hidden {...stylex.props(styles.loadDays, styles.width(timelineWidth))}>
              {counts.map((count, index) => (
                <span
                  key={dayList[index]?.toString() ?? index}
                  {...stylex.props(
                    styles.loadDay,
                    styles.width(`calc(${dayWidth}rem - 2px)`),
                    count > 0 && styles.loadDayBusy,
                    count > load.limit && styles.loadDayOver,
                  )}
                >
                  {count > 0 && dayWidth >= 1.5 ? count : null}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Joins days into runs, such as "19 Oct – 21 Oct, 27 Oct". */
function dayRuns(days: ReadonlyArray<CalendarDate>): string {
  const runs: Array<{ start: CalendarDate; end: CalendarDate }> = [];
  for (const day of days) {
    const last = runs[runs.length - 1];
    if (last !== undefined && last.end.add({ days: 1 }).compare(day) === 0) last.end = day;
    else runs.push({ start: day, end: day });
  }
  return runs.map((run) => rangeLabel(run.start, run.end)).join(", ");
}

function span(start: CalendarDate, end: CalendarDate): number {
  return end.compare(start) + 1;
}

function groupIds(tasks: ReadonlyArray<GanttTask>): Array<string> {
  return tasks.flatMap((task) =>
    task.children !== undefined && task.children.length > 0
      ? [task.id, ...groupIds(task.children)]
      : [],
  );
}

function visibleRows(
  tasks: ReadonlyArray<GanttTask>,
  expanded: ReadonlySet<Key>,
): ReadonlyArray<GanttTask> {
  return tasks.flatMap((task) => [
    task,
    ...(task.children !== undefined && expanded.has(task.id)
      ? visibleRows(task.children, expanded)
      : []),
  ]);
}

function formatDay(day: CalendarDate, options: Intl.DateTimeFormatOptions): string {
  return day
    .toDate(appTimeZone)
    .toLocaleDateString(appLocale, { ...options, timeZone: appTimeZone });
}

function rangeLabel(start: CalendarDate, end: CalendarDate): string {
  if (isSameDay(start, end)) return formatDay(start, { day: "numeric", month: "short" });
  return `${formatDay(start, { day: "numeric", month: "short" })} – ${formatDay(end, { day: "numeric", month: "short" })}`;
}

function taskLabel(row: Row): string {
  return [
    row.task.title,
    row.task.milestone === true ? "milestone" : undefined,
    rangeLabel(row.start, row.end),
    row.task.milestone === true ? undefined : `${Math.round(row.progress)}% done`,
    labelOf(row.task),
  ]
    .filter((part) => part !== undefined)
    .join(", ");
}

function periods(
  days: ReadonlyArray<CalendarDate>,
  scale: "day" | "week",
): ReadonlyArray<{ key: string; label: string; days: number }> {
  const result: Array<{ key: string; label: string; days: number }> = [];
  for (const day of days) {
    const key =
      scale === "day" ? `${day.year}-${day.month}` : startOfWeek(day, appLocale).toString();
    const current = result[result.length - 1];
    if (current !== undefined && current.key === key) {
      result[result.length - 1] = { ...current, days: current.days + 1 };
      continue;
    }
    const label =
      scale === "day"
        ? formatDay(day, { month: "long", year: "numeric" })
        : formatDay(day, { day: "numeric", month: "short" });
    result.push({ key, label, days: 1 });
  }
  return result;
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  scroller: {
    overflowX: "auto",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.raised,
  },
  canvas: { position: "relative", width: "max-content", minWidth: "100%" },
  width: (value: string) => ({ width: value }),
  header: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    fontSize: font.xs,
    color: color.textMuted,
  },
  headerName: {
    position: "sticky",
    left: 0,
    zIndex: 1,
    display: "flex",
    alignItems: "flex-end",
    flexShrink: 0,
    width: { default: nameWidthNarrow, [media.md]: nameWidth },
    paddingInline: space.md,
    paddingBottom: space.xs,
    backgroundColor: color.raised,
    borderInlineEndWidth: "1px",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.border,
    fontWeight: font.medium,
  },
  headerTimeline: { position: "relative", display: "flex", flexDirection: "column", flexShrink: 0 },
  todayAnchor: { position: "absolute", top: 0, height: "1px", pointerEvents: "none" },
  headerBand: { display: "flex" },
  period: {
    flexShrink: 0,
    overflow: "hidden",
    paddingBlock: "0.25rem",
    paddingInline: space.xs,
    whiteSpace: "nowrap",
    fontWeight: font.medium,
    color: color.text,
    borderInlineStartWidth: "1px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
  },
  dayCell: {
    flexShrink: 0,
    paddingBlock: "0.125rem",
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  dayCellWeekend: { color: color.textFaint },
  dayCellToday: { color: color.onAccent, backgroundColor: color.accent, borderRadius: radius.sm },
  body: { position: "relative" },
  layer: { position: "absolute", top: 0, overflow: "visible", pointerEvents: "none" },
  layerBack: { zIndex: 0 },
  layerFront: { zIndex: 1 },
  layerLeft: { left: { default: nameWidthNarrow, [media.md]: nameWidth } },
  layerHeight: (rows: number) => ({ height: `${rows}rem` }),
  weekend: { fill: color.subtle },
  today: { stroke: color.accent, strokeWidth: 2, strokeDasharray: "4 3" },
  arrow: { fill: "none", stroke: color.textMuted, strokeWidth: 1.25 },
  arrowHead: { fill: color.textMuted },
  tree: {
    position: "relative",
    // No z-index here: the sticky name cells must stack above the dependency layer.
    display: "flex",
    flexDirection: "column",
    outlineStyle: "none",
  },
  row: { outlineStyle: "none", cursor: "default" },
  rowSelected: {},
  rowFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  rowInner: {
    display: "flex",
    height: `${rowHeight}rem`,
  },
  nameCell: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
    position: "sticky",
    left: 0,
    zIndex: 3,
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    flexShrink: 0,
    width: { default: nameWidthNarrow, [media.md]: nameWidth },
    paddingInlineEnd: space.md,
    backgroundColor: { default: color.raised, ":hover": color.subtle },
    borderInlineEndWidth: "1px",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.border,
    fontSize: font.md,
  },
  nameCellSelected: { backgroundColor: { default: color.selected, ":hover": color.selected } },
  indent: (level: number) => ({ paddingInlineStart: `${0.5 + (level - 1) * 1}rem` }),
  chevronButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.25rem",
    height: "1.25rem",
    flexShrink: 0,
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.inset },
    color: color.textMuted,
    cursor: "pointer",
  },
  chevron: {
    width: size.iconSm,
    height: size.iconSm,
    transitionProperty: "transform",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
  },
  chevronOpen: { transform: "rotate(90deg)" },
  chevronSpacer: { width: "1.25rem", flexShrink: 0 },
  milestoneIcon: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.textMuted },
  name: {
    flex: "1",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nameGroup: { fontWeight: font.semibold },
  dates: {
    display: { default: "none", [media.md]: "inline" },
    flexShrink: 0,
    fontSize: font.xs,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  timeline: {
    position: "relative",
    flexShrink: 0,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  bar: {
    position: "absolute",
    top: "50%",
    height: "1.125rem",
    transform: "translateY(-50%)",
    overflow: "hidden",
    borderRadius: radius.sm,
    touchAction: "none",
  },
  draggable: { cursor: "grab" },
  place: (left: number, width: number) => ({
    left: `calc(${left * 100}% + 2px)`,
    width: `calc(${width * 100}% - 4px)`,
  }),
  fill: (progress: number) => ({ width: `${Math.max(0, Math.min(100, progress))}%` }),
  barFill: { position: "absolute", top: 0, bottom: 0, left: 0 },
  handle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "0.5rem",
    cursor: "ew-resize",
    backgroundColor: { default: "transparent", ":hover": color.focus },
    opacity: { default: 1, ":hover": 0.5 },
  },
  handleStart: { left: 0 },
  handleEnd: { right: 0 },
  // Lines leave and enter bars away from their own labels. A line that crosses the label of a
  // row in between passes behind it: the label stacks above the dependency layer on the row surface.
  barMeta: {
    position: "absolute",
    zIndex: 2,
    top: "50%",
    transform: "translateY(-50%)",
    paddingInline: "0.125rem",
    borderRadius: radius.sm,
    backgroundColor: color.raised,
    fontSize: font.xs,
    color: color.textMuted,
    whiteSpace: "nowrap",
    pointerEvents: "none",
  },
  after: (share: number) => ({ left: `calc(${share * 100}% + 0.25rem)` }),
  groupBar: {
    position: "absolute",
    top: "50%",
    height: "0.375rem",
    transform: "translateY(-50%)",
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: color.borderStrong,
  },
  groupFill: { position: "absolute", top: 0, bottom: 0, left: 0, backgroundColor: color.text },
  milestone: {
    position: "absolute",
    top: "50%",
    width: "0.75rem",
    height: "0.75rem",
    transform: "translate(-50%, -50%) rotate(45deg)",
    borderRadius: "2px",
    touchAction: "none",
  },
  at: (share: number) => ({ left: `${share * 100}%` }),
  hint: { margin: 0, fontSize: font.sm, color: color.textMuted },
  rowGrip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1rem",
    height: "1.5rem",
    flexShrink: 0,
    marginInlineStart: "-0.375rem",
    borderRadius: radius.sm,
    color: { default: color.textFaint, ":hover": color.textMuted },
    cursor: "grab",
    touchAction: "none",
  },
  rowGripActive: { color: color.accentText, cursor: "grabbing" },
  rowGripIcon: { width: size.iconSm, height: size.iconSm },
  rowDrop: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 4,
    height: "2px",
    marginTop: "-1px",
    backgroundColor: color.accent,
    pointerEvents: "none",
  },
  rowDropAt: (rows: number) => ({ top: `${rows * rowHeight}rem` }),
  load: {
    display: "flex",
    flexDirection: "column",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
  loadHeader: { display: "flex", fontSize: font.xs, color: color.textMuted },
  loadHeaderName: {
    position: "sticky",
    left: 0,
    zIndex: 1,
    flexShrink: 0,
    width: { default: nameWidthNarrow, [media.md]: nameWidth },
    paddingInline: space.md,
    paddingBlock: space.xs,
    backgroundColor: color.raised,
    borderInlineEndWidth: "1px",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.border,
    fontWeight: font.medium,
  },
  loadRow: { display: "flex", height: "1.75rem" },
  loadName: {
    position: "sticky",
    left: 0,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    width: { default: nameWidthNarrow, [media.md]: nameWidth },
    paddingInline: space.md,
    backgroundColor: color.raised,
    borderInlineEndWidth: "1px",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.border,
    fontSize: font.sm,
    color: color.textMuted,
  },
  loadDays: { display: "flex", flexShrink: 0, alignItems: "stretch", paddingBlock: "3px" },
  loadDay: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginInline: "1px",
    borderRadius: "2px",
    fontSize: font.xs,
    fontWeight: font.medium,
    fontVariantNumeric: "tabular-nums",
  },
  loadDayBusy: { backgroundColor: color.accentMuted, color: color.accentText },
  loadDayOver: {
    backgroundColor: color.warningMuted,
    color: color.warning,
    boxShadow: `inset 0 0 0 1px ${color.warningBorder}`,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});

const barColors = stylex.create({
  neutral: { backgroundColor: color.subtle, boxShadow: `inset 0 0 0 1px ${color.borderStrong}` },
  accent: {
    backgroundColor: color.accentMuted,
    boxShadow: `inset 0 0 0 1px ${color.accentBorder}`,
  },
  success: {
    backgroundColor: color.successMuted,
    boxShadow: `inset 0 0 0 1px ${color.successBorder}`,
  },
  warning: {
    backgroundColor: color.warningMuted,
    boxShadow: `inset 0 0 0 1px ${color.warningBorder}`,
  },
  danger: {
    backgroundColor: color.dangerMuted,
    boxShadow: `inset 0 0 0 1px ${color.dangerBorder}`,
  },
  info: { backgroundColor: color.infoMuted, boxShadow: `inset 0 0 0 1px ${color.infoBorder}` },
});

const fillColors = stylex.create({
  neutral: { backgroundColor: color.textMuted },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});

const diamondColors = stylex.create({
  neutral: { backgroundColor: color.textMuted },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});
