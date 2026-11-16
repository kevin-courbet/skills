import * as stylex from "@stylexjs/stylex";
import { CircleCheck, CircleDashed, PackageSearch, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { Kanban, type KanbanColumn } from "@/components/patterns/kanban";
import { Avatar } from "@/components/primitives/avatar";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Code, DescriptionList } from "@/components/primitives/layout";
import { Sheet } from "@/components/primitives/sheet";
import { color, font, space } from "@/styles/tokens.stylex";
import { defineSection } from "../../specimen";

type WorkOrder = {
  readonly id: string;
  readonly bike: string;
  readonly customer: string;
  readonly mechanic: string | null;
  readonly due: string;
  readonly isRush?: boolean;
};

type Board = Readonly<Record<string, ReadonlyArray<WorkOrder>>>;

const stages: ReadonlyArray<KanbanColumn> = [
  { id: "checked-in", title: "Checked in", icon: CircleDashed },
  { id: "parts", title: "Waiting for parts", icon: PackageSearch },
  { id: "repair", title: "In repair", icon: Wrench, limit: 3 },
  { id: "ready", title: "Ready for pickup", icon: CircleCheck },
];

const repairBoard: Board = {
  "checked-in": [
    {
      id: "WO-2052",
      bike: "Cannondale Topstone 105",
      customer: "Marc Laurent",
      mechanic: null,
      due: "Thu 19 Nov",
    },
    {
      id: "WO-2053",
      bike: "Gazelle Ultimate C380",
      customer: "Hanna de Vries",
      mechanic: null,
      due: "Fri 20 Nov",
    },
  ],
  parts: [
    {
      id: "WO-2047",
      bike: "Surly Long Haul Trucker",
      customer: "Sade Okafor",
      mechanic: "Ines Duarte",
      due: "Tue 24 Nov",
    },
  ],
  repair: [
    {
      id: "WO-2044",
      bike: "Brompton C Line Explore",
      customer: "Jin Park",
      mechanic: "Ana Reyes",
      due: "Today",
      isRush: true,
    },
    {
      id: "WO-2045",
      bike: "Canyon Grail CF SL",
      customer: "Alice Moreau",
      mechanic: "Ines Duarte",
      due: "Today",
    },
    {
      id: "WO-2048",
      bike: "Riese & Müller Load 75",
      customer: "Riverside Couriers",
      mechanic: "Tomas Berg",
      due: "Fri 20 Nov",
    },
  ],
  ready: [
    {
      id: "WO-2039",
      bike: "Specialized Turbo Vado 4.0",
      customer: "Paul Girard",
      mechanic: "Tomas Berg",
      due: "Sat 14 Nov, overdue",
    },
  ],
};

const overLimitBoard: Board = {
  ...repairBoard,
  repair: [
    ...(repairBoard.repair ?? []),
    {
      id: "WO-2049",
      bike: "Trek FX 3 Disc",
      customer: "Omar Haddad",
      mechanic: "Ana Reyes",
      due: "Sat 21 Nov",
    },
    {
      id: "WO-2050",
      bike: "Tern GSD S10",
      customer: "Lena Novak",
      mechanic: "Tomas Berg",
      due: "Sat 21 Nov",
    },
  ],
};

const quietBoard: Board = {
  "checked-in": [],
  parts: [],
  repair: [
    {
      id: "WO-2051",
      bike: "Kona Rove DL",
      customer: "Kenji Ito",
      mechanic: "Ines Duarte",
      due: "Today",
    },
  ],
  ready: [],
};

const longTextBoard: Board = {
  "checked-in": [
    {
      id: "WO-2060",
      bike: "Custom steel randonneur with dynamo hub, front rack, hammered fenders, and a leather saddle",
      customer: "Bernadette Lefebvre-Montgomery",
      mechanic: null,
      due: "Mon 30 Nov",
    },
  ],
  parts: [],
  repair: [
    {
      id: "WO-2061",
      bike: "Electric cargo trike with a child seat and a rain cover",
      customer: "Riverside Couriers, depot north, attention Maximilian Oberhauser",
      mechanic: "Tomas Berg",
      due: "Wed 25 Nov",
      isRush: true,
    },
  ],
  ready: [],
};

function WorkOrderCard({ order }: { readonly order: WorkOrder }) {
  return (
    <>
      <span {...stylex.props(styles.title)}>{order.bike}</span>
      <span {...stylex.props(styles.meta)}>
        <Code>{order.id}</Code>
        <span>{order.customer}</span>
      </span>
      <span {...stylex.props(styles.meta)}>
        {order.mechanic === null ? (
          <span>Not assigned</span>
        ) : (
          <>
            <Avatar name={order.mechanic} size="xs" />
            <span>{order.mechanic}</span>
          </>
        )}
        <span>Due {order.due}</span>
        {order.isRush === true ? (
          <Badge intent="danger" size="sm">
            Rush
          </Badge>
        ) : null}
      </span>
    </>
  );
}

function RepairBoard({
  initial,
  emptyLabel,
  canAddOrders = false,
  canReorderColumns = false,
}: {
  readonly initial: Board;
  readonly emptyLabel?: string;
  readonly canAddOrders?: boolean;
  readonly canReorderColumns?: boolean;
}) {
  const [board, setBoard] = useState(initial);
  const [columns, setColumns] = useState(stages);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = Object.values(board)
    .flat()
    .find((order) => order.id === openId);
  const openStage = columns.find((column) =>
    board[column.id]?.some((order) => order.id === openId),
  );

  return (
    <>
      <Kanban
        label="Repair board"
        columns={columns}
        value={board}
        onChange={(next) => setBoard(next)}
        getItemId={(order) => order.id}
        getItemLabel={(order) => `${order.id} ${order.bike}`}
        renderItem={(order) => <WorkOrderCard order={order} />}
        onItemAction={(order) => setOpenId(order.id)}
        emptyLabel={emptyLabel}
        columnActions={
          canAddOrders
            ? (column) => (
                <Button
                  intent="ghost"
                  size="sm"
                  iconOnly
                  icon={Plus}
                  aria-label={`Add work order to ${column.title}`}
                />
              )
            : undefined
        }
        onColumnsChange={canReorderColumns ? (next) => setColumns(next) : undefined}
      />
      {open === undefined ? null : (
        <Sheet
          size="peek"
          isOpen
          onOpenChange={(isOpen) => isOpen || setOpenId(null)}
          title={open.bike}
          meta={<Code>{open.id}</Code>}
        >
          <DescriptionList
            items={[
              { term: "Stage", detail: openStage?.title ?? "Unknown" },
              { term: "Customer", detail: open.customer },
              { term: "Mechanic", detail: open.mechanic ?? "Not assigned" },
              { term: "Due", detail: open.due },
            ]}
          />
        </Sheet>
      )}
    </>
  );
}

export default defineSection({
  component: "Kanban",
  specimens: [
    {
      title: "Repair board",
      wide: true,
      note: "Drag a card. Or focus its grip, press Enter, move it with Tab and the arrow keys, and press Enter again. A click or Enter on a card opens it in a peek sheet.",
      render: () => <RepairBoard initial={repairBoard} />,
    },
    {
      title: "Column above its limit",
      wide: true,
      note: "In repair has five work orders and a limit of 3, so its count shows as a warning.",
      render: () => <RepairBoard initial={overLimitBoard} />,
    },
    {
      title: "Column actions and column order",
      wide: true,
      note: "`columnActions` puts an add button in each header. With `onColumnsChange`, the grip in a header moves the column.",
      render: () => <RepairBoard initial={repairBoard} canAddOrders canReorderColumns />,
    },
    {
      title: "Empty columns",
      wide: true,
      note: "`emptyLabel` names the missing items in each empty column.",
      render: () => <RepairBoard initial={quietBoard} emptyLabel="No work orders" />,
    },
    {
      title: "Long text",
      wide: true,
      render: () => <RepairBoard initial={longTextBoard} emptyLabel="No work orders" />,
    },
  ],
});

const styles = stylex.create({
  title: { fontWeight: font.medium },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
    fontSize: font.sm,
    color: color.textMuted,
  },
});
