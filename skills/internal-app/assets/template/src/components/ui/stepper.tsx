// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import {
  Check,
  CircleDashed,
  CircleSlash,
  LoaderCircle,
  type LucideIcon,
  Minus,
  X,
} from "lucide-react";
import { Button, ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, media, radius, size, space } from "@/styles/tokens.stylex";
import type { BadgeIntent } from "./badge";
import { field } from "./field";

/** Status of a step that runs on its own, such as a pipeline stage or a job phase. */
export type StepStatus = "pending" | "running" | "success" | "failed" | "skipped" | "cancelled";

export const stepStatusDisplay: Record<
  StepStatus,
  { readonly label: string; readonly intent: BadgeIntent; readonly icon: LucideIcon }
> = {
  pending: { label: "Waiting", intent: "neutral", icon: CircleDashed },
  running: { label: "Running", intent: "info", icon: LoaderCircle },
  success: { label: "Succeeded", intent: "success", icon: Check },
  failed: { label: "Failed", intent: "danger", icon: X },
  skipped: { label: "Skipped", intent: "neutral", icon: Minus },
  cancelled: { label: "Cancelled", intent: "neutral", icon: CircleSlash },
};

export interface StepperStep<Id extends string> {
  readonly id: Id;
  /** Short noun phrase, such as "Source" or "Build". */
  readonly label: string;
  readonly description?: string;
}

export interface StatusStep<Id extends string> extends StepperStep<Id> {
  readonly status: StepStatus;
  /** Formatted duration, such as "38s" or "Running 14s". */
  readonly duration?: string;
  /** Replaces the status word, such as "Staged: rollback holds production". */
  readonly note?: string;
}

/** `responsive` is vertical below the `md` breakpoint and horizontal above it. */
export type StepperOrientation = "horizontal" | "vertical" | "responsive";

export interface WizardStepperProps<Id extends string> {
  readonly mode?: "wizard";
  /** Names the process, such as "Import steps". */
  readonly label: string;
  readonly steps: ReadonlyArray<StepperStep<Id>>;
  readonly currentStep: Id;
  /** Makes completed steps buttons that go back to them. */
  readonly onStepPress?: (id: Id) => void;
  readonly orientation?: StepperOrientation;
}

export interface StatusStepperProps<Id extends string> {
  readonly mode: "status";
  /** Names the process, such as "Pipeline stages". */
  readonly label: string;
  readonly steps: ReadonlyArray<StatusStep<Id>>;
  /**
   * The step whose detail shows below, such as its logs. With
   * `onSelectionChange`, steps become a radio group: arrow keys move between
   * steps, and pressing the selected step again clears the selection.
   */
  readonly selectedStep?: Id | null;
  readonly onSelectionChange?: (id: Id | null) => void;
  readonly orientation?: StepperOrientation;
}

export type StepperProps<Id extends string> = WizardStepperProps<Id> | StatusStepperProps<Id>;

/**
 * Steps in order. `wizard` mode shows the position in a multi-step task:
 * steps before `currentStep` are complete. `status` mode shows steps that run
 * on their own, each with its own status and duration, such as pipeline stages.
 */
export function Stepper<Id extends string>(props: StepperProps<Id>) {
  return props.mode === "status" ? <StatusStepper {...props} /> : <WizardStepper {...props} />;
}

type WizardState = "complete" | "current" | "upcoming";

function wizardState(index: number, currentIndex: number): WizardState {
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}

function WizardStepper<Id extends string>({
  label,
  steps,
  currentStep,
  onStepPress,
  orientation = "responsive",
}: WizardStepperProps<Id>) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  if (currentIndex === -1)
    throw new Error(`Stepper currentStep "${currentStep}" is not one of its steps.`);
  return (
    <ol aria-label={label} {...stylex.props(styles.list, lists[orientation])}>
      {steps.map((step, index) => {
        const state = wizardState(index, currentIndex);
        const content = (
          <>
            <span aria-hidden {...stylex.props(styles.marker, wizardMarkers[state])}>
              {state === "complete" ? (
                <Check {...stylex.props(styles.markerIcon, styles.markerIconBold)} />
              ) : (
                (index + 1).toString()
              )}
            </span>
            <span {...stylex.props(styles.text, texts[orientation])}>
              <span {...stylex.props(styles.labelGroup)}>
                <span {...stylex.props(styles.label, state === "upcoming" && styles.labelQuiet)}>
                  {step.label}
                  {state === "complete" ? (
                    <span {...stylex.props(field.hiddenLabel)}>, complete</span>
                  ) : null}
                </span>
                {step.description ? (
                  <span {...stylex.props(styles.description)}>{step.description}</span>
                ) : null}
              </span>
            </span>
          </>
        );
        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            {...stylex.props(styles.item, items[orientation])}
          >
            {onStepPress !== undefined && state === "complete" ? (
              <Button
                onPress={() => onStepPress(step.id)}
                {...stylex.props(styles.control, controls[orientation], styles.pressable)}
              >
                {content}
              </Button>
            ) : (
              <span {...stylex.props(styles.control, controls[orientation])}>{content}</span>
            )}
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                {...stylex.props(
                  styles.connector,
                  connectors[orientation],
                  state === "complete" && styles.connectorAccent,
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function StatusStepper<Id extends string>({
  label,
  steps,
  selectedStep = null,
  onSelectionChange,
  orientation = "responsive",
}: StatusStepperProps<Id>) {
  const isSelectable = onSelectionChange !== undefined;
  const list = (
    <ol
      aria-label={isSelectable ? undefined : label}
      role={isSelectable ? "presentation" : undefined}
      {...stylex.props(styles.list, lists[orientation])}
    >
      {steps.map((step, index) => {
        const display = stepStatusDisplay[step.status];
        const statusText = step.note ?? display.label;
        const content = <StatusStepContent step={step} orientation={orientation} />;
        return (
          <li
            key={step.id}
            role={isSelectable ? "presentation" : undefined}
            aria-current={!isSelectable && step.status === "running" ? "step" : undefined}
            {...stylex.props(styles.item, items[orientation])}
          >
            {isSelectable ? (
              <ToggleButton
                id={step.id}
                aria-label={[step.label, statusText, step.duration].filter(Boolean).join(", ")}
                {...renderStyles<{ isSelected: boolean; isFocusVisible: boolean }>((state) => [
                  styles.control,
                  controls[orientation],
                  styles.pressable,
                  state.isSelected && styles.controlSelected,
                  state.isFocusVisible && styles.controlFocused,
                ])}
              >
                {content}
              </ToggleButton>
            ) : (
              <span {...stylex.props(styles.control, controls[orientation])}>{content}</span>
            )}
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                {...stylex.props(
                  styles.connector,
                  connectors[orientation],
                  step.status === "success" && styles.connectorSuccess,
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
  if (!isSelectable) return list;
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      selectedKeys={selectedStep === null ? [] : [selectedStep]}
      onSelectionChange={(keys) => {
        const next = steps.find((step) => keys.has(step.id));
        onSelectionChange(next === undefined ? null : next.id);
      }}
      {...stylex.props(styles.group)}
    >
      {list}
    </ToggleButtonGroup>
  );
}

function StatusStepContent<Id extends string>({
  step,
  orientation,
}: {
  readonly step: StatusStep<Id>;
  readonly orientation: StepperOrientation;
}) {
  const display = stepStatusDisplay[step.status];
  const Icon = display.icon;
  const showStatusWord = step.status !== "success" || step.note !== undefined;
  return (
    <>
      <span aria-hidden {...stylex.props(styles.marker, statusMarkers[step.status])}>
        <Icon
          {...stylex.props(
            styles.markerIcon,
            (step.status === "success" || step.status === "failed") && styles.markerIconBold,
            step.status === "running" && styles.spin,
          )}
        />
      </span>
      <span {...stylex.props(styles.text, texts[orientation])}>
        <span {...stylex.props(styles.labelGroup)}>
          <span
            {...stylex.props(
              styles.label,
              (step.status === "pending" || step.status === "skipped") && styles.labelQuiet,
            )}
          >
            {step.label}
          </span>
          {step.description ? (
            <span {...stylex.props(styles.description)}>{step.description}</span>
          ) : null}
        </span>
        <span {...stylex.props(styles.meta, metas[orientation])}>
          {showStatusWord ? (
            <span {...stylex.props(statusWords[step.status])}>{step.note ?? display.label}</span>
          ) : (
            <span {...stylex.props(field.hiddenLabel)}>{display.label}</span>
          )}
          {showStatusWord && step.duration !== undefined ? (
            <span aria-hidden {...stylex.props(styles.metaDot)}>
              ·
            </span>
          ) : null}
          {step.duration === undefined ? null : <span>{step.duration}</span>}
        </span>
      </span>
    </>
  );
}

export interface SegmentedProgressProps<Id extends string> {
  /** Names the process for screen readers, such as "Pipeline for dpl_6M91fxF8A". */
  readonly label: string;
  readonly steps: ReadonlyArray<StatusStep<Id>>;
  /** Lists the step names under the bar on wide screens. */
  readonly showStepLabels?: boolean;
}

/**
 * Compact read-only progress: one colored segment per step and the current
 * step in words, such as "Build · Running · 14s". Use it in cards and table
 * rows; use Stepper with `mode="status"` where people inspect each step.
 */
export function SegmentedProgress<Id extends string>({
  label,
  steps,
  showStepLabels = true,
}: SegmentedProgressProps<Id>) {
  const focus = focusStep(steps);
  return (
    <div {...stylex.props(styles.progress)}>
      <ol aria-label={label} {...stylex.props(field.hiddenLabel)}>
        {steps.map((step) => (
          <li key={step.id}>
            {[step.label, step.note ?? stepStatusDisplay[step.status].label, step.duration]
              .filter(Boolean)
              .join(", ")}
          </li>
        ))}
      </ol>
      <span aria-hidden {...stylex.props(styles.segments)}>
        {steps.map((step) => (
          <span
            key={step.id}
            {...stylex.props(
              styles.segment,
              segments[step.status],
              step.status === "running" && styles.segmentRunning,
            )}
          />
        ))}
      </span>
      <span aria-hidden {...stylex.props(styles.captionRow)}>
        {showStepLabels ? (
          <span {...stylex.props(styles.stepNames)}>
            {steps.map((step) => (
              <span
                key={step.id}
                {...stylex.props(step.id === focus?.id && styles.stepNameCurrent)}
              >
                {step.label}
              </span>
            ))}
          </span>
        ) : null}
        {focus === undefined ? null : (
          <span {...stylex.props(styles.caption)}>
            <span {...stylex.props(styles.stepNameCurrent)}>{focus.label}</span>
            {" · "}
            {focus.note ?? stepStatusDisplay[focus.status].label}
            {focus.duration === undefined ? null : ` · ${focus.duration}`}
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * The step the caption describes: the running one, else the one that stopped
 * the run, else a waiting step with a note (such as a held promotion), else
 * the last one that ran.
 */
function focusStep<Id extends string>(
  steps: ReadonlyArray<StatusStep<Id>>,
): StatusStep<Id> | undefined {
  return (
    steps.find((step) => step.status === "running") ??
    steps.find((step) => step.status === "failed" || step.status === "cancelled") ??
    steps.find((step) => step.status === "pending" && step.note !== undefined) ??
    steps.findLast((step) => step.status !== "pending")
  );
}

const spinFrames = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const pulseFrames = stylex.keyframes({
  "0%": { opacity: 1 },
  "50%": { opacity: 0.45 },
  "100%": { opacity: 1 },
});

const styles = stylex.create({
  group: { display: "block", minWidth: 0 },
  list: { margin: 0, padding: 0, listStyleType: "none", minWidth: 0 },
  item: { minWidth: 0 },
  control: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    minWidth: 0,
    padding: space.xs,
    margin: `calc(-1 * ${space.xs})`,
    borderRadius: radius.md,
    color: "inherit",
    textAlign: "start",
  },
  pressable: {
    borderStyle: "none",
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    fontFamily: "inherit",
    fontSize: "inherit",
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  controlSelected: { backgroundColor: { default: color.selected, ":hover": color.selected } },
  controlFocused: { outlineStyle: "solid", outlineWidth: "2px", outlineColor: color.focus },
  marker: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0,
    borderRadius: radius.full,
    borderWidth: "1px",
    borderStyle: "solid",
    fontSize: font.sm,
    fontWeight: font.medium,
    fontVariantNumeric: "tabular-nums",
  },
  markerIcon: { width: size.iconSm, height: size.iconSm },
  markerIconBold: { strokeWidth: "3" },
  spin: {
    animationName: spinFrames,
    animationDuration: { default: "1s", [media.reducedMotion]: "0s" },
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  text: { display: "flex", minWidth: 0, paddingTop: "0.125rem" },
  labelGroup: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  label: { fontSize: font.md, fontWeight: font.medium, color: color.text, whiteSpace: "nowrap" },
  labelQuiet: { color: color.textMuted, fontWeight: font.regular },
  description: { fontSize: font.sm, color: color.textMuted },
  meta: {
    display: "flex",
    alignItems: "baseline",
    gap: space.xs,
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  metaDot: { color: color.textFaint },
  connector: { backgroundColor: color.border },
  connectorAccent: { backgroundColor: color.accent },
  connectorSuccess: { backgroundColor: color.successBorder },
  progress: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  segments: { display: "flex", gap: space.xs },
  segment: { flex: "1", height: "0.375rem", borderRadius: radius.full },
  segmentRunning: {
    animationName: pulseFrames,
    animationDuration: { default: "1.6s", [media.reducedMotion]: "0s" },
    animationIterationCount: "infinite",
  },
  captionRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    columnGap: space.md,
    rowGap: space.xs,
    fontSize: font.sm,
    color: color.textMuted,
  },
  stepNames: {
    display: { default: "none", [media.sm]: "flex" },
    flexWrap: "wrap",
    columnGap: space.sm,
  },
  stepNameCurrent: { fontWeight: font.medium, color: color.text },
  caption: { fontVariantNumeric: "tabular-nums", marginInlineStart: "auto" },
});

const lists = stylex.create({
  horizontal: { display: "flex", alignItems: "flex-start", gap: space.sm },
  vertical: { display: "flex", flexDirection: "column" },
  responsive: {
    display: "flex",
    flexDirection: { default: "column", [media.md]: "row" },
    alignItems: { default: "stretch", [media.md]: "flex-start" },
    gap: { default: 0, [media.md]: space.sm },
  },
});

const items = stylex.create({
  horizontal: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    flex: { default: "1", ":last-child": "none" },
  },
  vertical: {
    position: "relative",
    paddingBottom: { default: space.lg, ":last-child": 0 },
  },
  responsive: {
    position: "relative",
    display: { default: "block", [media.md]: "flex" },
    alignItems: "flex-start",
    gap: space.sm,
    flex: { default: "none", [media.md]: { default: "1", ":last-child": "none" } },
    paddingBottom: { default: space.lg, ":last-child": 0, [media.md]: 0 },
  },
});

const controls = stylex.create({
  horizontal: { flexShrink: 0 },
  vertical: { width: `calc(100% + 2 * ${space.xs})` },
  responsive: {
    width: { default: `calc(100% + 2 * ${space.xs})`, [media.md]: "auto" },
    flexShrink: 0,
  },
});

const markerCenter = `calc(${space.xs} + 0.75rem - 0.5px)`;
const lineTop = `calc(${space.xs} + 1.5rem + 2px)`;
const lineBottom = `calc(2px - ${space.xs})`;

const connectors = stylex.create({
  horizontal: {
    flex: "1",
    minWidth: space.lg,
    height: "1px",
    // Centers the line on the 1.5rem marker.
    marginTop: "0.75rem",
  },
  vertical: {
    position: "absolute",
    left: markerCenter,
    top: lineTop,
    bottom: lineBottom,
    width: "1px",
  },
  responsive: {
    position: { default: "absolute", [media.md]: "static" },
    left: { default: markerCenter, [media.md]: "auto" },
    top: { default: lineTop, [media.md]: "auto" },
    bottom: { default: lineBottom, [media.md]: "auto" },
    width: { default: "1px", [media.md]: "auto" },
    height: { default: "auto", [media.md]: "1px" },
    flex: { default: "none", [media.md]: "1" },
    minWidth: { default: 0, [media.md]: space.lg },
    marginTop: { default: 0, [media.md]: "0.75rem" },
  },
});

const texts = stylex.create({
  horizontal: { flexDirection: "column", gap: "2px" },
  vertical: {
    flex: "1",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: space.md,
    rowGap: "2px",
  },
  responsive: {
    flex: { default: "1", [media.md]: "none" },
    flexDirection: { default: "row", [media.md]: "column" },
    flexWrap: { default: "wrap", [media.md]: "nowrap" },
    justifyContent: { default: "space-between", [media.md]: "flex-start" },
    columnGap: space.md,
    rowGap: "2px",
  },
});

const metas = stylex.create({
  horizontal: {},
  vertical: { paddingTop: "1px" },
  responsive: { paddingTop: { default: "1px", [media.md]: 0 } },
});

const wizardMarkers = stylex.create({
  complete: { backgroundColor: color.accent, borderColor: color.accent, color: color.onAccent },
  current: {
    backgroundColor: color.accentMuted,
    borderColor: color.accent,
    color: color.accentText,
  },
  upcoming: { backgroundColor: color.raised, borderColor: color.border, color: color.textMuted },
});

const statusMarkers = stylex.create({
  pending: { backgroundColor: color.raised, borderColor: color.border, color: color.textFaint },
  running: { backgroundColor: color.infoMuted, borderColor: color.infoBorder, color: color.info },
  success: { backgroundColor: color.success, borderColor: color.success, color: color.textInverse },
  failed: { backgroundColor: color.danger, borderColor: color.danger, color: color.textInverse },
  skipped: { backgroundColor: color.subtle, borderColor: color.border, color: color.textMuted },
  cancelled: { backgroundColor: color.subtle, borderColor: color.border, color: color.textMuted },
});

const statusWords = stylex.create({
  pending: { color: color.textMuted },
  running: { color: color.info, fontWeight: font.medium },
  success: { color: color.success, fontWeight: font.medium },
  failed: { color: color.danger, fontWeight: font.medium },
  skipped: { color: color.textMuted },
  cancelled: { color: color.textMuted },
});

const segments = stylex.create({
  pending: { backgroundColor: color.inset },
  running: { backgroundColor: color.info },
  success: { backgroundColor: color.success },
  failed: { backgroundColor: color.danger },
  skipped: { backgroundColor: color.inset },
  cancelled: { backgroundColor: color.borderStrong },
});
