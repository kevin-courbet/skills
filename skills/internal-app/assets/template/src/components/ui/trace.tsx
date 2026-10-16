// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import { ChevronRight, Circle, type LucideIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  Button,
  Collection,
  Disclosure,
  DisclosurePanel,
  Tree,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { color, font, media, motion, radius, size, space } from "@/styles/tokens.stylex";
import { field } from "./field";

export type TraceStatus = "done" | "running" | "failed" | "pending" | "skipped";

export interface TraceStep {
  readonly id: string;
  /** What the step did, as a sentence fragment: "Searched 14 files", "Ran unit tests". */
  readonly title: ReactNode;
  /** Icon for the kind of step. Use the same icon for the same kind everywhere. */
  readonly icon?: LucideIcon;
  /**
   * `done` is the default. Screen readers hear the status word before the
   * title; sighted people see the color, the motion, and the title.
   */
  readonly status?: TraceStatus;
  /** Quiet trailing text, such as a duration or a count: "1.2 s", "3 files". */
  readonly meta?: ReactNode;
  /** A Badge after the meta, such as a share of the total time. */
  readonly badge?: ReactNode;
  /** Content that opens under the step, such as output, a diff, or attributes. */
  readonly detail?: ReactNode;
  /** Child steps that open under the step, after the detail. */
  readonly steps?: ReadonlyArray<TraceStep>;
}

export interface TraceProps {
  /** Names the list, such as "Agent steps" or "Deployment checks". */
  readonly label: string;
  readonly steps: ReadonlyArray<TraceStep>;
  /** Open steps. Pass it with `onExpandedChange` to control them, such as opening a running step. */
  readonly expandedIds?: ReadonlyArray<string>;
  readonly defaultExpandedIds?: ReadonlyArray<string>;
  readonly onExpandedChange?: (ids: ReadonlyArray<string>) => void;
}

const statusWord: Record<TraceStatus, string | undefined> = {
  done: undefined,
  running: "Running",
  failed: "Failed",
  pending: "Not started",
  skipped: "Skipped",
};

/**
 * A run as a column of quiet step lines: agent turns, CI jobs, checks, and
 * imports. A step with `detail` or `steps` opens in place to its output. A
 * failed step is red, a running step shimmers, and a pending step is faint.
 */
export function Trace({
  label,
  steps,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
}: TraceProps) {
  const [localExpanded, setLocalExpanded] = useState<ReadonlyArray<string>>(defaultExpandedIds);
  const expanded = expandedIds ?? localExpanded;
  const setExpanded = (id: string, isOpen: boolean) => {
    const next = isOpen ? [...expanded, id] : expanded.filter((candidate) => candidate !== id);
    if (expandedIds === undefined) setLocalExpanded(next);
    onExpandedChange?.(next);
  };
  return (
    <TraceList label={label} steps={steps} expanded={expanded} onToggle={setExpanded} level={1} />
  );
}

interface TraceListProps {
  readonly label: string;
  readonly steps: ReadonlyArray<TraceStep>;
  readonly expanded: ReadonlyArray<string>;
  readonly onToggle: (id: string, isOpen: boolean) => void;
  readonly level: number;
}

function TraceList({ label, steps, expanded, onToggle, level }: TraceListProps) {
  return (
    <ol aria-label={label} {...stylex.props(styles.list, level > 1 && styles.nestedList)}>
      {steps.map((step) => (
        <li key={step.id} {...stylex.props(styles.item)}>
          {step.detail === undefined && step.steps === undefined ? (
            <div {...stylex.props(styles.line, lineTones[step.status ?? "done"])}>
              <StepLine step={step} />
            </div>
          ) : (
            <Disclosure
              isExpanded={expanded.includes(step.id)}
              onExpandedChange={(isOpen) => onToggle(step.id, isOpen)}
              {...stylex.props(styles.disclosure)}
            >
              {({ isExpanded }) => (
                <>
                  <Button
                    slot="trigger"
                    {...stylex.props(styles.line, styles.trigger, lineTones[step.status ?? "done"])}
                  >
                    <StepLine step={step} />
                    <ChevronRight
                      aria-hidden
                      {...stylex.props(styles.chevron, isExpanded && styles.chevronOpen)}
                    />
                  </Button>
                  <DisclosurePanel {...stylex.props(styles.panel)}>
                    {step.detail === undefined ? null : (
                      <div {...stylex.props(styles.detail)}>{step.detail}</div>
                    )}
                    {step.steps === undefined ? null : (
                      <TraceList
                        label={`${label}, child steps`}
                        steps={step.steps}
                        expanded={expanded}
                        onToggle={onToggle}
                        level={level + 1}
                      />
                    )}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          )}
        </li>
      ))}
    </ol>
  );
}

function StepLine({ step }: { readonly step: TraceStep }) {
  const Icon = step.icon ?? Circle;
  const status = step.status ?? "done";
  const word = statusWord[status];
  return (
    <>
      <Icon aria-hidden {...stylex.props(styles.icon)} />
      <span {...stylex.props(styles.title, status === "running" && styles.shimmer)}>
        {word === undefined ? null : <span {...stylex.props(field.hiddenLabel)}>{word}: </span>}
        {step.title}
      </span>
      {step.meta === undefined ? null : <span {...stylex.props(styles.meta)}>{step.meta}</span>}
      {step.badge}
    </>
  );
}

export interface TraceSpan {
  readonly id: string;
  /** Operation name, such as "POST /api/checkout" or "SELECT cart_items". */
  readonly name: string;
  /** Service or component that recorded the span. */
  readonly service?: string;
  readonly icon?: LucideIcon;
  /** Start, in milliseconds after the start of the trace. */
  readonly startMs: number;
  readonly durationMs: number;
  readonly isError?: boolean;
  /** Span attributes in display order, such as `["http.response.status_code", "409"]`. */
  readonly attributes?: ReadonlyArray<readonly [string, string]>;
  readonly children?: ReadonlyArray<TraceSpan>;
}

export interface SpanWaterfallProps {
  /** Names the trace, such as "Trace 4bf92f35". */
  readonly label: string;
  /** The root span. Its start and duration set the time axis. */
  readonly span: TraceSpan;
  /** The span shown in the detail panel. It defaults to the span with the most self time. */
  readonly selectedId?: string | null;
  readonly onSelectionChange?: (id: string | null) => void;
  /** Open spans. Every span with children is open by default. */
  readonly defaultExpandedIds?: ReadonlyArray<string>;
}

/**
 * A distributed trace as a waterfall: spans nest under their parent, and each
 * row has a bar on a shared time axis. Arrow keys move between spans and open
 * or close them; the selected span shows its timing and attributes below. The
 * span with the most self time is marked with its share of the trace.
 */
export function SpanWaterfall({
  label,
  span,
  selectedId,
  onSelectionChange,
  defaultExpandedIds,
}: SpanWaterfallProps) {
  const total = span.startMs + span.durationMs;
  const hot = slowestSpan(span);
  const [localSelected, setLocalSelected] = useState<string | null>(hot.span.id);
  const selected = selectedId === undefined ? localSelected : selectedId;
  const selectedSpan = selected === null ? undefined : findSpan(span, selected);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div {...stylex.props(styles.waterfall)}>
      <div aria-hidden {...stylex.props(styles.axis)}>
        <span {...stylex.props(styles.axisName)}>Span</span>
        <span {...stylex.props(styles.labelRoom)}>
          <span {...stylex.props(styles.axisTrack)}>
            {ticks.map((share) => (
              <span
                key={share}
                {...stylex.props(
                  styles.tick,
                  share > 0 && styles.tickCentered,
                  styles.tickAt(share * 100),
                )}
              >
                {formatMs(total * share)}
              </span>
            ))}
          </span>
        </span>
      </div>
      <Tree
        aria-label={label}
        items={[span]}
        dependencies={[total, hot.span.id]}
        selectionMode="single"
        selectionBehavior="replace"
        selectedKeys={selected === null ? [] : [selected]}
        onSelectionChange={(keys) => {
          const next = keys === "all" ? null : (keys.values().next().value ?? null);
          const id = next === null ? null : String(next);
          if (selectedId === undefined) setLocalSelected(id);
          onSelectionChange?.(id);
        }}
        defaultExpandedKeys={defaultExpandedIds ?? branchIds(span)}
        {...stylex.props(styles.tree)}
      >
        {function renderSpan(item: TraceSpan): ReactNode {
          return (
            <TreeItem
              id={item.id}
              textValue={item.name}
              aria-label={spanLabel(item, hot.span.id === item.id ? hot.share : undefined)}
              {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean }>((state) => [
                styles.row,
                state.isSelected && styles.rowSelected,
                state.isFocusVisible && styles.rowFocused,
              ])}
            >
              <TreeItemContent>
                {({ level, hasChildItems, isExpanded }) => (
                  <SpanRow
                    span={item}
                    total={total}
                    level={level}
                    hasChildItems={hasChildItems}
                    isExpanded={isExpanded}
                    hotShare={hot.span.id === item.id ? hot.share : undefined}
                  />
                )}
              </TreeItemContent>
              {item.children === undefined ? null : (
                <Collection items={item.children} dependencies={[total, hot.span.id]}>
                  {renderSpan}
                </Collection>
              )}
            </TreeItem>
          );
        }}
      </Tree>
      {selectedSpan === undefined ? (
        <p {...stylex.props(styles.detailEmpty)}>Select a span to see its timing and attributes.</p>
      ) : (
        <SpanDetail span={selectedSpan} />
      )}
    </div>
  );
}

interface SpanRowProps {
  readonly span: TraceSpan;
  readonly total: number;
  readonly level: number;
  readonly hasChildItems: boolean;
  readonly isExpanded: boolean;
  readonly hotShare: number | undefined;
}

function SpanRow({ span, total, level, hasChildItems, isExpanded, hotShare }: SpanRowProps) {
  const Icon = span.icon ?? Circle;
  const start = total === 0 ? 0 : span.startMs / total;
  const width = total === 0 ? 0 : span.durationMs / total;
  const end = start + width;
  return (
    <div {...stylex.props(styles.rowGrid)}>
      <div {...stylex.props(styles.nameCell, styles.indent(level))}>
        {hasChildItems ? (
          <Button
            slot="chevron"
            aria-label="Show child spans"
            {...stylex.props(styles.chevronButton)}
          >
            <ChevronRight
              aria-hidden
              {...stylex.props(styles.chevron, isExpanded && styles.chevronOpen)}
            />
          </Button>
        ) : (
          <span aria-hidden {...stylex.props(styles.chevronSpacer)} />
        )}
        <Icon
          aria-hidden
          {...stylex.props(styles.spanIcon, span.isError === true && styles.spanIconError)}
        />
        <span {...stylex.props(styles.spanName)}>{span.name}</span>
        {span.service === undefined ? null : (
          <span {...stylex.props(styles.service)}>{span.service}</span>
        )}
        {hotShare === undefined ? null : (
          <span {...stylex.props(styles.hot)}>{Math.round(hotShare * 100)}%</span>
        )}
      </div>
      <div {...stylex.props(styles.labelRoom)}>
        <div {...stylex.props(styles.barTrack)}>
          <span
            {...stylex.props(
              styles.bar,
              span.isError === true && styles.barError,
              styles.barPosition(start * 100, width * 100),
            )}
          />
          <span {...stylex.props(styles.barLabel, styles.labelAfter(end * 100))}>
            {formatMs(span.durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SpanDetail({ span }: { readonly span: TraceSpan }) {
  const self = selfTime(span);
  const facts: ReadonlyArray<readonly [string, string]> = [
    ["Duration", formatMs(span.durationMs)],
    ["Self time", formatMs(self)],
    ["Starts at", `+${formatMs(span.startMs)}`],
    ["Status", span.isError === true ? "Error" : "OK"],
  ];
  return (
    <section aria-label={`Span ${span.name}`} {...stylex.props(styles.detailPanel)}>
      <div {...stylex.props(styles.detailHeading)}>
        <span {...stylex.props(styles.detailName)}>{span.name}</span>
        {span.service === undefined ? null : (
          <span {...stylex.props(styles.service)}>{span.service}</span>
        )}
      </div>
      <dl {...stylex.props(styles.facts)}>
        {facts.map(([term, value]) => (
          <div key={term} {...stylex.props(styles.fact)}>
            <dt {...stylex.props(styles.factTerm)}>{term}</dt>
            <dd
              {...stylex.props(
                styles.factValue,
                term === "Status" && span.isError === true && styles.factError,
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {span.attributes === undefined || span.attributes.length === 0 ? null : (
        <dl {...stylex.props(styles.attributes)}>
          {span.attributes.map(([key, value]) => (
            <div key={key} {...stylex.props(styles.attribute)}>
              <dt {...stylex.props(styles.attributeKey)}>{key}</dt>
              <dd {...stylex.props(styles.attributeValue)}>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function formatMs(ms: number): string {
  return ms < 1000
    ? `${ms.toLocaleString(appLocale, { maximumFractionDigits: 0 })} ms`
    : `${(ms / 1000).toLocaleString(appLocale, { maximumFractionDigits: 2 })} s`;
}

function selfTime(span: TraceSpan): number {
  const childTime = (span.children ?? []).reduce((sum, child) => sum + child.durationMs, 0);
  return Math.max(0, span.durationMs - childTime);
}

/** The span that spent the most time itself, not a parent that only waited on its children. */
function slowestSpan(root: TraceSpan): { readonly span: TraceSpan; readonly share: number } {
  const total = root.startMs + root.durationMs;
  let best = root;
  const visit = (span: TraceSpan) => {
    if (selfTime(span) > selfTime(best)) best = span;
    span.children?.forEach(visit);
  };
  visit(root);
  return { span: best, share: total === 0 ? 0 : selfTime(best) / total };
}

function findSpan(span: TraceSpan, id: string): TraceSpan | undefined {
  if (span.id === id) return span;
  for (const child of span.children ?? []) {
    const match = findSpan(child, id);
    if (match !== undefined) return match;
  }
  return undefined;
}

function branchIds(span: TraceSpan): Array<string> {
  if (span.children === undefined || span.children.length === 0) return [];
  return [span.id, ...span.children.flatMap(branchIds)];
}

function spanLabel(span: TraceSpan, hotShare: number | undefined): string {
  return [
    span.name,
    span.service,
    formatMs(span.durationMs),
    span.isError === true ? "error" : undefined,
    hotShare === undefined
      ? undefined
      : `slowest span, ${Math.round(hotShare * 100)}% of the trace time`,
  ]
    .filter((part) => part !== undefined)
    .join(", ");
}

const shimmer = stylex.keyframes({
  from: { backgroundPosition: "100% 0" },
  to: { backgroundPosition: "-100% 0" },
});

const styles = stylex.create({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    margin: 0,
    padding: 0,
    listStyleType: "none",
    minWidth: 0,
  },
  nestedList: { paddingInlineStart: `calc(${size.icon} + ${space.sm})` },
  item: { display: "flex", flexDirection: "column", minWidth: 0 },
  disclosure: { display: "flex", flexDirection: "column", minWidth: 0 },
  line: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: size.controlSm,
    fontSize: font.md,
    color: color.textMuted,
  },
  trigger: {
    paddingInline: space.xs,
    marginInline: `calc(-1 * ${space.xs})`,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: "transparent",
    textAlign: "start",
    cursor: "pointer",
    transitionProperty: "color",
    transitionDuration: motion.fast,
    color: { default: color.textMuted, ":hover": color.text },
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  icon: { width: size.icon, height: size.icon, flexShrink: 0 },
  title: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  shimmer: {
    color: { default: "transparent", [media.reducedMotion]: color.text },
    backgroundImage: `linear-gradient(90deg, ${color.textMuted} 0%, ${color.textMuted} 35%, ${color.text} 50%, ${color.textMuted} 65%, ${color.textMuted} 100%)`,
    backgroundSize: "200% 100%",
    backgroundClip: "text",
    animationName: { default: shimmer, [media.reducedMotion]: "none" },
    animationDuration: "2s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  meta: {
    flexShrink: 0,
    fontSize: font.sm,
    color: color.textFaint,
    fontVariantNumeric: "tabular-nums",
  },
  chevron: {
    width: size.iconSm,
    height: size.iconSm,
    flexShrink: 0,
    transitionProperty: "transform",
    transitionDuration: { default: motion.fast, [media.reducedMotion]: "0ms" },
    transitionTimingFunction: motion.ease,
  },
  chevronOpen: { transform: "rotate(90deg)" },
  panel: { minWidth: 0 },
  detail: {
    minWidth: 0,
    paddingTop: space.xs,
    paddingBottom: space.sm,
    paddingInlineStart: `calc(${size.icon} + ${space.sm})`,
    fontSize: font.md,
    color: color.textMuted,
    overflowWrap: "anywhere",
  },
  waterfall: { display: "flex", flexDirection: "column", minWidth: 0 },
  axis: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.md]: "minmax(14rem, 2fr) 3fr" },
    alignItems: "center",
    minHeight: size.controlSm,
    paddingInline: space.sm,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
    fontSize: font.xs,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  axisName: { display: { default: "none", [media.md]: "block" } },
  /** Leaves room after the time axis for the duration label of a bar that ends at the trace end. */
  labelRoom: { display: "block", minWidth: 0, paddingInlineEnd: "3.75rem" },
  axisTrack: { position: "relative", display: "block", height: "1rem" },
  tick: { position: "absolute", top: 0, whiteSpace: "nowrap" },
  tickCentered: { transform: "translateX(-50%)" },
  tickAt: (left: number) => ({ left: `${left}%` }),
  tree: {
    display: "flex",
    flexDirection: "column",
    paddingBlock: space.xs,
    outlineStyle: "none",
  },
  row: {
    borderRadius: radius.md,
    cursor: "default",
    outlineStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
  },
  rowSelected: { backgroundColor: { default: color.selected, ":hover": color.selected } },
  rowFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  rowGrid: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.md]: "minmax(14rem, 2fr) 3fr" },
    alignItems: "center",
    columnGap: space.sm,
    rowGap: "2px",
    minHeight: size.controlMd,
    paddingBlock: { default: space.xs, [media.md]: 0 },
    paddingInline: space.sm,
  },
  nameCell: { display: "flex", alignItems: "center", gap: space.xs, minWidth: 0 },
  indent: (level: number) => ({ paddingInlineStart: `${(level - 1) * 0.875}rem` }),
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
  chevronSpacer: { width: "1.25rem", flexShrink: 0 },
  spanIcon: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.textMuted },
  spanIconError: { color: color.danger },
  spanName: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: font.mono,
    fontSize: font.sm,
    color: color.text,
  },
  service: { flexShrink: 0, fontSize: font.sm, color: color.textMuted, whiteSpace: "nowrap" },
  barTrack: {
    position: "relative",
    height: "1.25rem",
    minWidth: 0,
    backgroundImage: `repeating-linear-gradient(to right, ${color.borderSubtle} 0 1px, transparent 1px 25%)`,
    borderInlineEndWidth: "1px",
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.borderSubtle,
  },
  bar: {
    position: "absolute",
    top: "50%",
    height: "0.625rem",
    minWidth: "2px",
    transform: "translateY(-50%)",
    borderRadius: "2px",
    backgroundColor: color.accent,
  },
  barError: { backgroundColor: color.danger },
  barPosition: (left: number, width: number) => ({ left: `${left}%`, width: `${width}%` }),
  barLabel: {
    position: "absolute",
    top: "50%",
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    transform: "translateY(-50%)",
    fontSize: font.xs,
    color: color.textMuted,
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },
  labelAfter: (left: number) => ({ left: `calc(${left}% + 0.375rem)` }),
  hot: {
    flexShrink: 0,
    fontSize: font.xs,
    fontVariantNumeric: "tabular-nums",
    paddingInline: "0.25rem",
    borderRadius: radius.sm,
    backgroundColor: color.warningMuted,
    color: color.warning,
    fontWeight: font.medium,
  },
  detailEmpty: {
    margin: 0,
    paddingBlock: space.md,
    paddingInline: space.sm,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    fontSize: font.md,
    color: color.textMuted,
  },
  detailPanel: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    paddingTop: space.md,
    paddingInline: space.sm,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    minWidth: 0,
  },
  detailHeading: { display: "flex", alignItems: "baseline", gap: space.sm, minWidth: 0 },
  detailName: {
    minWidth: 0,
    fontFamily: font.mono,
    fontSize: font.md,
    fontWeight: font.medium,
    color: color.text,
    overflowWrap: "anywhere",
  },
  facts: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(7rem, 1fr))",
    gap: space.md,
    margin: 0,
  },
  fact: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  factTerm: { fontSize: font.sm, color: color.textMuted },
  factValue: {
    margin: 0,
    fontSize: font.md,
    fontWeight: font.medium,
    color: color.text,
    fontVariantNumeric: "tabular-nums",
  },
  factError: { color: color.danger },
  attributes: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.xs,
  },
  attribute: {
    display: "flex",
    gap: space.md,
    justifyContent: "space-between",
    paddingBlock: "0.1875rem",
    borderBottomWidth: { default: "1px", ":last-child": 0 },
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
    minWidth: 0,
  },
  attributeKey: { color: color.textMuted, minWidth: 0, overflowWrap: "anywhere" },
  attributeValue: { margin: 0, color: color.text, textAlign: "end", overflowWrap: "anywhere" },
});

const lineTones = stylex.create({
  done: {},
  running: { color: color.text },
  failed: { color: color.danger },
  pending: { opacity: "0.6" },
  skipped: { color: color.textFaint },
});
