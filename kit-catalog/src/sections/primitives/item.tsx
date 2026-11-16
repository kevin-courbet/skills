import * as stylex from "@stylexjs/stylex";
import { Bike, Disc3, MoreHorizontal, Package, Wrench } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/primitives/avatar";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { IconTile } from "@/components/primitives/icon-tile";
import { Item, ItemList } from "@/components/primitives/item";
import { Card } from "@/components/primitives/layout";
import { Menu, MenuItem, MenuTrigger } from "@/components/primitives/menu";
import { Switch } from "@/components/primitives/switch";
import { formatInteger } from "@/lib/locale";
import { color, font } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled } from "../../specimen";

type Mechanic = {
  readonly id: string;
  readonly name: string;
  readonly skill: string;
  readonly openJobs: number;
};

const mechanics: ReadonlyArray<Mechanic> = [
  { id: "karim", name: "Karim Haddad", skill: "Hydraulic brakes and suspension", openJobs: 4 },
  { id: "sofia", name: "Sofia Marchetti", skill: "Wheel building and hubs", openJobs: 2 },
  { id: "jules", name: "Jules Lefèvre", skill: "E-bike motors and batteries", openJobs: 0 },
];

type WorkOrder = {
  readonly id: string;
  readonly title: string;
  readonly bike: string;
  readonly due: string;
};

const workOrders: ReadonlyArray<WorkOrder> = [
  { id: "WO-1042", title: "Brake bleed and pad swap", bike: "Trek Domane SL 5", due: "Today" },
  { id: "WO-1043", title: "Rear hub service", bike: "Brompton C Line", due: "Tomorrow" },
  { id: "WO-1044", title: "Motor firmware update", bike: "Specialized Turbo Vado", due: "18 Nov" },
];

function MechanicsOnShift() {
  const [onShift, setOnShift] = useState<ReadonlySet<string>>(new Set(["karim", "sofia"]));
  const toggle = (id: string, isOn: boolean) =>
    setOnShift((previous) => {
      const next = new Set(previous);
      if (isOn) next.add(id);
      else next.delete(id);
      return next;
    });
  return (
    <Column width="36rem">
      <ItemList label="Mechanics">
        {mechanics.map((mechanic) => (
          <Item
            key={mechanic.id}
            media={<Avatar name={mechanic.name} />}
            title={mechanic.name}
            description={mechanic.skill}
            meta={
              mechanic.openJobs === 0 ? (
                <Badge>No open jobs</Badge>
              ) : (
                `${formatInteger(mechanic.openJobs)} open jobs`
              )
            }
            actions={
              <Switch
                aria-label={`${mechanic.name} on shift`}
                isSelected={onShift.has(mechanic.id)}
                onChange={(isOn) => toggle(mechanic.id, isOn)}
              />
            }
          />
        ))}
      </ItemList>
    </Column>
  );
}

function OpenableOrders() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Column width="36rem">
      <ItemList label="Work orders due">
        {workOrders.map((order) => (
          <Item
            key={order.id}
            media={<IconTile icon={Wrench} tone="accent" />}
            title={order.title}
            description={`${order.id}, ${order.bike}`}
            meta={order.due}
            onAction={() => setOpened(order.id)}
          />
        ))}
      </ItemList>
      <span aria-live="polite" {...stylex.props(styles.status)}>
        {opened === null ? "Press a row to open the work order." : `Opened ${opened}.`}
      </span>
    </Column>
  );
}

function PartMenu({ part }: { readonly part: string }) {
  return (
    <MenuTrigger>
      <Button
        intent="ghost"
        size="sm"
        iconOnly
        icon={MoreHorizontal}
        aria-label={`Actions for ${part}`}
      />
      <Menu>
        <MenuItem id="reorder">Reorder part</MenuItem>
        <MenuItem id="edit">Edit stock level</MenuItem>
        <MenuItem id="archive" isDestructive>
          Archive part
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

export default defineSection({
  component: "Item",
  specimens: [
    {
      title: "Media, meta, and actions",
      note: "Put an Avatar or an IconTile in media, a count or a Badge in meta, and a Switch, a button, or a row menu in actions.",
      render: () => <MechanicsOnShift />,
    },
    {
      title: "Opens on action",
      note: "With onAction, the title is a button, a click on the row opens the item, and a chevron shows at the end.",
      render: () => <OpenableOrders />,
    },
    {
      title: "Sizes",
      render: () => (
        <Column width="24rem">
          <Labeled label="md">
            <ItemList label="Parts low in stock, md" style={styles.fill}>
              <Item
                media={<IconTile icon={Disc3} />}
                title="Shimano B05S resin pads"
                meta="3 left"
              />
              <Item
                media={<IconTile icon={Package} />}
                title="Continental GP5000 28 mm"
                meta="2 left"
              />
            </ItemList>
          </Labeled>
          <Labeled label="sm">
            <ItemList label="Parts low in stock, sm" style={styles.fill}>
              <Item
                size="sm"
                media={<IconTile icon={Disc3} size="sm" />}
                title="Shimano B05S resin pads"
                meta="3 left"
              />
              <Item
                size="sm"
                media={<IconTile icon={Package} size="sm" />}
                title="Continental GP5000 28 mm"
                meta="2 left"
              />
            </ItemList>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "In a Card with a row menu",
      note: "Inside a Card, set framed={false} on the ItemList.",
      render: () => (
        <Column width="36rem">
          <Card title="Parts to reorder" description="Stock is under the reorder level.">
            <ItemList label="Parts to reorder" framed={false}>
              <Item
                media={<IconTile icon={Disc3} tone="warning" />}
                title="Shimano B05S resin pads"
                description="Supplier: Cycles Europe"
                meta={<Badge intent="warning">3 left</Badge>}
                actions={<PartMenu part="Shimano B05S resin pads" />}
              />
              <Item
                media={<IconTile icon={Package} tone="danger" />}
                title="SRAM PC-1110 chain"
                description="Supplier: Velo Distribution"
                meta={<Badge intent="danger">Out of stock</Badge>}
                actions={<PartMenu part="SRAM PC-1110 chain" />}
              />
            </ItemList>
          </Card>
        </Column>
      ),
    },
    {
      title: "Long text",
      note: "The title and the description wrap. The media, the meta, and the actions keep their size.",
      render: () => (
        <Column width="24rem">
          <ItemList label="Bikes in the workshop">
            <Item
              media={<IconTile icon={Bike} />}
              title="Specialized Turbo Vado SL 4.0 Equipped step-through, size medium"
              description="Customer reports a rattle from the motor at speeds over 20 km/h and an intermittent display fault"
              meta="Bay 4"
            />
          </ItemList>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  status: { fontSize: font.sm, color: color.textMuted },
  // A Labeled caption shrinks its child, so each list takes the full width of the column.
  fill: { width: "100%" },
});
