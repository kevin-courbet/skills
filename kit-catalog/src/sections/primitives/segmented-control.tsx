import { CalendarDays, Columns3, List } from "lucide-react";
import { useState } from "react";
import { ControlSizeProvider } from "@/components/helpers/control-size";
import { Button } from "@/components/primitives/button";
import { SegmentedControl, type SegmentOption } from "@/components/primitives/segmented-control";
import { defineSection, Labeled, Row } from "../../specimen";

type ViewId = "list" | "board" | "calendar";
type PeriodId = "day" | "week" | "month" | "quarter" | "year";
type ScopeId = "mine" | "all";

const views: ReadonlyArray<SegmentOption<ViewId>> = [
  { id: "list", label: "List", icon: List },
  { id: "board", label: "Board", icon: Columns3 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

const periods: ReadonlyArray<SegmentOption<PeriodId>> = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];

const scopes: ReadonlyArray<SegmentOption<ScopeId>> = [
  { id: "mine", label: "My work orders" },
  { id: "all", label: "All work orders" },
];

function Segmented<Value extends string>({
  label,
  options,
  initial,
}: {
  readonly label: string;
  readonly options: ReadonlyArray<SegmentOption<Value>>;
  readonly initial: Value;
}) {
  const [value, setValue] = useState(initial);
  return <SegmentedControl label={label} options={options} value={value} onChange={setValue} />;
}

export default defineSection({
  component: "SegmentedControl",
  specimens: [
    {
      title: "Views with icons",
      note: "Switch between views of the same work orders. An icon adds to a label and never replaces it.",
      render: () => (
        <Row>
          <Segmented label="View" options={views} initial="board" />
        </Row>
      ),
    },
    {
      title: "Text segments",
      render: () => (
        <Row align="start">
          <Labeled label="two segments">
            <Segmented label="Scope" options={scopes} initial="mine" />
          </Labeled>
          <Labeled label="five segments, the maximum">
            <Segmented label="Period" options={periods} initial="week" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Control sizes",
      note: "The height follows the control size of its row, so it matches the buttons next to it.",
      render: () => (
        <Row align="start">
          <Labeled label="md">
            <Row>
              <Segmented label="Period" options={periods} initial="month" />
              <Button>Export</Button>
            </Row>
          </Labeled>
          <Labeled label="sm">
            <ControlSizeProvider size="sm">
              <Row>
                <Segmented label="Period" options={periods} initial="month" />
                <Button>Export</Button>
              </Row>
            </ControlSizeProvider>
          </Labeled>
        </Row>
      ),
    },
  ],
});
