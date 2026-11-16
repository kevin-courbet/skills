import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { Card, CardSection, DescriptionList } from "@/components/primitives/layout";
import {
  SegmentedProgress,
  type StatusStep,
  type StepStatus,
  Stepper,
  type StepperStep,
  stepStatusDisplay,
} from "@/components/primitives/stepper";
import { Column, defineSection, Labeled, Row } from "../../specimen";

type IntakeStep = "customer" | "bike" | "repairs" | "parts" | "review";

const intakeSteps: ReadonlyArray<StepperStep<IntakeStep>> = [
  { id: "customer", label: "Customer", description: "Name and contact" },
  { id: "bike", label: "Bike", description: "Make, model, frame number" },
  { id: "repairs", label: "Repairs", description: "Work to do" },
  { id: "parts", label: "Parts", description: "Parts to order" },
  { id: "review", label: "Review", description: "Estimate and signature" },
];

type ReorderStage = "stock" | "order" | "send" | "confirm";

const reorderRun: ReadonlyArray<StatusStep<ReorderStage>> = [
  { id: "stock", label: "Check stock", status: "success", duration: "4s" },
  { id: "order", label: "Build order", status: "success", duration: "2s" },
  { id: "send", label: "Send to supplier", status: "running", duration: "12s" },
  { id: "confirm", label: "Confirm delivery date", status: "pending" },
];

const stageDetail: Record<ReorderStage, string> = {
  stock:
    "14 parts are under their reorder level, such as 700x25c inner tubes and Shimano B05S brake pads.",
  order: "One order of 14 lines for 386.40 EUR, to the Shimano distributor.",
  send: "The order goes to the supplier portal. The portal answers in about 30 seconds.",
  confirm: "This stage starts when the supplier accepts the order.",
};

type InvoiceStage = "collect" | "price" | "tax" | "pdf" | "email" | "ledger";

const everyStatus: ReadonlyArray<StatusStep<InvoiceStage>> = [
  { id: "collect", label: "Collect work orders", status: "success", duration: "3s" },
  {
    id: "price",
    label: "Price the labor",
    status: "skipped",
    note: "Skipped: fixed-price service",
  },
  { id: "tax", label: "Apply VAT", status: "success", duration: "1s" },
  {
    id: "pdf",
    label: "Render the invoice PDF",
    description: "Invoice INV-2026-0418 for Camille Durand",
    status: "failed",
    duration: "6s",
    note: "Failed: the customer address has no postcode",
  },
  { id: "email", label: "Email the customer", status: "cancelled" },
  { id: "ledger", label: "Post to the ledger", status: "pending" },
];

const runningInvoice: ReadonlyArray<StatusStep<InvoiceStage>> = [
  { id: "collect", label: "Collect", status: "success", duration: "3s" },
  { id: "price", label: "Price", status: "success", duration: "2s" },
  { id: "tax", label: "VAT", status: "success", duration: "1s" },
  { id: "pdf", label: "PDF", status: "running", duration: "4s" },
  { id: "email", label: "Email", status: "pending" },
  { id: "ledger", label: "Ledger", status: "pending" },
];

const failedInvoice: ReadonlyArray<StatusStep<InvoiceStage>> = [
  { id: "collect", label: "Collect", status: "success", duration: "3s" },
  { id: "price", label: "Price", status: "skipped" },
  { id: "tax", label: "VAT", status: "success", duration: "1s" },
  { id: "pdf", label: "PDF", status: "failed", duration: "6s", note: "Failed: no postcode" },
  { id: "email", label: "Email", status: "cancelled" },
  { id: "ledger", label: "Ledger", status: "pending" },
];

const allStatuses: ReadonlyArray<StepStatus> = [
  "pending",
  "running",
  "success",
  "failed",
  "skipped",
  "cancelled",
];

function IntakeWizard() {
  const [current, setCurrent] = useState<IntakeStep>("repairs");
  return (
    <Stepper
      label="Work order steps"
      steps={intakeSteps}
      currentStep={current}
      onStepPress={setCurrent}
    />
  );
}

function ReorderRun() {
  const [selected, setSelected] = useState<ReorderStage | null>("send");
  const step = reorderRun.find((item) => item.id === selected);
  return (
    <Card title="Nightly parts reorder" description="Run of 16 Nov 2026, 02:00" layout="sections">
      <CardSection>
        <Stepper
          mode="status"
          label="Reorder stages"
          steps={reorderRun}
          selectedStep={selected}
          onSelectionChange={setSelected}
        />
      </CardSection>
      <CardSection>
        {step === undefined ? (
          "Select a stage to see its detail."
        ) : (
          <DescriptionList
            items={[
              { term: "Stage", detail: step.label },
              { term: "Status", detail: stepStatusDisplay[step.status].label },
              { term: "Detail", detail: stageDetail[step.id] },
            ]}
          />
        )}
      </CardSection>
    </Card>
  );
}

export default defineSection({
  component: "Stepper",
  specimens: [
    {
      title: "Wizard",
      note: "The steps before currentStep show as complete. With onStepPress, the complete steps are buttons that go back to them.",
      wide: true,
      render: () => <IntakeWizard />,
    },
    {
      title: "Wizard orientations",
      note: "The default orientation, responsive, is vertical below the md breakpoint.",
      wide: true,
      render: () => (
        <Column>
          <Labeled label="horizontal, first step">
            <div {...stylex.props(styles.fill)}>
              <Stepper
                label="Work order steps"
                steps={intakeSteps}
                currentStep="customer"
                orientation="horizontal"
              />
            </div>
          </Labeled>
          <Labeled label="vertical, last step">
            <Stepper
              label="Work order steps"
              steps={intakeSteps}
              currentStep="review"
              orientation="vertical"
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Status with selection",
      note: "With onSelectionChange, the stages are a radio group. Use the selected stage to drive the detail below it.",
      wide: true,
      render: () => <ReorderRun />,
    },
    {
      title: "Every status",
      note: "A note replaces the status word. A success step shows no status word unless it has a note.",
      render: () => (
        <Stepper mode="status" label="Invoice stages" steps={everyStatus} orientation="vertical" />
      ),
    },
    {
      title: "SegmentedProgress",
      note: "The read-only form for cards and rows. The caption names the running step. If no step runs, it names the step that stopped the run.",
      render: () => (
        <Column width="28rem">
          <Labeled label="running">
            <div {...stylex.props(styles.fill)}>
              <SegmentedProgress label="Invoice run for INV-2026-0419" steps={runningInvoice} />
            </div>
          </Labeled>
          <Labeled label="failed">
            <div {...stylex.props(styles.fill)}>
              <SegmentedProgress label="Invoice run for INV-2026-0418" steps={failedInvoice} />
            </div>
          </Labeled>
          <Labeled label="showStepLabels false">
            <div {...stylex.props(styles.fill)}>
              <SegmentedProgress
                label="Invoice run for INV-2026-0419"
                steps={runningInvoice}
                showStepLabels={false}
              />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "stepStatusDisplay",
      note: "Use stepStatusDisplay for a step status elsewhere, such as in a badge, so that one status always looks the same.",
      render: () => (
        <Row>
          {allStatuses.map((status) => {
            const display = stepStatusDisplay[status];
            return (
              <Badge key={status} intent={display.intent} icon={display.icon}>
                {display.label}
              </Badge>
            );
          })}
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  fill: { alignSelf: "stretch", minWidth: 0 },
});
