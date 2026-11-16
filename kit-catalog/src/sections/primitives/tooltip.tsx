import { Archive, Copy, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Tooltip, TooltipTrigger } from "@/components/primitives/tooltip";
import { defineSection, Labeled, Row } from "../../specimen";

export default defineSection({
  component: "Tooltip",
  specimens: [
    {
      title: "Icon buttons",
      note: "Hover one button for 600 ms. Then move along the row, and the next tooltips open at once. Each button keeps its own aria-label.",
      render: () => (
        <Row>
          <TooltipTrigger>
            <Button intent="ghost" iconOnly icon={Printer} aria-label="Print work order" />
            <Tooltip>Print work order</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <Button intent="ghost" iconOnly icon={Copy} aria-label="Duplicate work order" />
            <Tooltip>Duplicate work order</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <Button intent="ghost" iconOnly icon={Archive} aria-label="Archive work order" />
            <Tooltip>Archive work order</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <Button intent="ghost" iconOnly icon={RefreshCw} aria-label="Refresh queue" />
            <Tooltip>Refresh queue</Tooltip>
          </TooltipTrigger>
        </Row>
      ),
    },
    {
      title: "Placement",
      note: "Hover or focus a button. The tooltip opens on the side that placement names.",
      render: () => (
        <Row>
          <Labeled label="top">
            <TooltipTrigger>
              <Button iconOnly icon={Printer} aria-label="Print invoice" />
              <Tooltip placement="top">Print invoice</Tooltip>
            </TooltipTrigger>
          </Labeled>
          <Labeled label="bottom">
            <TooltipTrigger>
              <Button iconOnly icon={Printer} aria-label="Print invoice" />
              <Tooltip placement="bottom">Print invoice</Tooltip>
            </TooltipTrigger>
          </Labeled>
          <Labeled label="start">
            <TooltipTrigger>
              <Button iconOnly icon={Printer} aria-label="Print invoice" />
              <Tooltip placement="start">Print invoice</Tooltip>
            </TooltipTrigger>
          </Labeled>
          <Labeled label="end">
            <TooltipTrigger>
              <Button iconOnly icon={Printer} aria-label="Print invoice" />
              <Tooltip placement="end">Print invoice</Tooltip>
            </TooltipTrigger>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Long hint",
      note: "A long hint wraps. Keep a hint to a few words. Never put required information in it.",
      render: () => (
        <Row>
          <TooltipTrigger>
            <Button>Reorder parts</Button>
            <Tooltip>
              Orders the parts of all work orders that wait for parts from Cycles Lambert, the
              default supplier
            </Tooltip>
          </TooltipTrigger>
        </Row>
      ),
    },
  ],
});
