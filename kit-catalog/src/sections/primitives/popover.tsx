import { Info, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { ChoiceOption } from "@/components/helpers/choice";
import { Button } from "@/components/primitives/button";
import { CheckboxGroup } from "@/components/primitives/checkbox";
import { DescriptionList } from "@/components/primitives/layout";
import { Popover, PopoverTrigger } from "@/components/primitives/popover";
import { defineSection, Labeled, Row } from "../../specimen";

type Status = "waiting" | "repair" | "ready" | "picked-up";

const statuses: ReadonlyArray<ChoiceOption<Status>> = [
  { id: "waiting", label: "Waiting for parts" },
  { id: "repair", label: "In repair" },
  { id: "ready", label: "Ready for pickup" },
  { id: "picked-up", label: "Picked up" },
];

function StatusFilter() {
  const [visible, setVisible] = useState<ReadonlyArray<Status>>(["waiting", "repair"]);
  return (
    <PopoverTrigger>
      <Button icon={SlidersHorizontal}>Filters</Button>
      <Popover title="Filter work orders" showTitle>
        <CheckboxGroup
          label="Status"
          appearance="list"
          options={statuses}
          value={visible}
          onChange={setVisible}
        />
        <Button size="sm" intent="ghost" onPress={() => setVisible([])}>
          Clear filters
        </Button>
      </Popover>
    </PopoverTrigger>
  );
}

const partsDetail = [
  { term: "Chain", detail: "Shimano CN-HG601, arrives 19 Nov" },
  { term: "Cassette", detail: "Shimano CS-HG500, 11-32, arrives 19 Nov" },
  { term: "Bearings", detail: "6001-2RS, 2 in stock" },
];

export default defineSection({
  component: "Popover",
  specimens: [
    {
      title: "Filter panel",
      note: "showTitle shows the title as a heading. The panel holds a few controls that belong to its trigger.",
      render: () => (
        <Row>
          <StatusFilter />
        </Row>
      ),
    },
    {
      title: "Quick details",
      note: "Without showTitle, the title is only the accessible name of the panel.",
      render: () => (
        <Row>
          <PopoverTrigger>
            <Button iconOnly icon={Info} intent="ghost" aria-label="Parts for WO-1042" />
            <Popover title="Parts for WO-1042">
              <DescriptionList items={partsDetail} />
            </Popover>
          </PopoverTrigger>
        </Row>
      ),
    },
    {
      title: "Placement",
      note: "The panel flips to stay on the screen.",
      render: () => (
        <Row>
          <Labeled label="bottom start">
            <PopoverTrigger>
              <Button>Pickup hours</Button>
              <Popover title="Pickup hours" showTitle>
                <p>Monday to Saturday, 09:00 to 18:30.</p>
              </Popover>
            </PopoverTrigger>
          </Labeled>
          <Labeled label="top">
            <PopoverTrigger>
              <Button>Pickup hours</Button>
              <Popover title="Pickup hours" showTitle placement="top">
                <p>Monday to Saturday, 09:00 to 18:30.</p>
              </Popover>
            </PopoverTrigger>
          </Labeled>
          <Labeled label="end">
            <PopoverTrigger>
              <Button>Pickup hours</Button>
              <Popover title="Pickup hours" showTitle placement="end">
                <p>Monday to Saturday, 09:00 to 18:30.</p>
              </Popover>
            </PopoverTrigger>
          </Labeled>
        </Row>
      ),
    },
  ],
});
