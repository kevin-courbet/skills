import { Archive, Box, Folder, FolderOpen, User, Warehouse } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/feedback";
import { Tree, moveTreeNodes, type TreeNode } from "@/components/patterns/tree";
import { Column, defineSection, Row } from "../../specimen";

function category(id: string, label: string, children: ReadonlyArray<TreeNode>): TreeNode {
  return { id, label, icon: Folder, openIcon: FolderOpen, children };
}

function part(id: string, label: string, count: number): TreeNode {
  return { id, label, icon: Box, meta: `${count} parts` };
}

const partCategories: ReadonlyArray<TreeNode> = [
  category("drivetrain", "Drivetrain", [
    part("chains", "Chains", 34),
    part("cassettes", "Cassettes", 21),
    category("derailleurs", "Derailleurs", [
      part("rear-derailleurs", "Rear derailleurs", 12),
      part("front-derailleurs", "Front derailleurs", 5),
      part(
        "hangers",
        "Derailleur hangers for frames from Trek, Specialized, Cannondale, Giant, and Scott",
        48,
      ),
    ]),
  ]),
  category("brakes", "Brakes", [
    part("pads", "Disc brake pads", 26),
    part("rotors", "Rotors", 14),
    part("cables", "Cables and housing", 9),
  ]),
  category("wheels", "Wheels and tires", [
    part("tubes", "Inner tubes", 40),
    part("tires", "Tires", 31),
    part("spokes", "Spokes and nipples", 220),
  ]),
  {
    id: "discontinued",
    label: "Discontinued parts",
    icon: Archive,
    meta: <Badge size="sm">Read only</Badge>,
    isDisabled: true,
  },
];

const permissions: ReadonlyArray<TreeNode> = [
  {
    id: "work-orders",
    label: "Work orders",
    children: [
      { id: "wo-view", label: "View work orders" },
      { id: "wo-edit", label: "Edit work orders" },
      { id: "wo-close", label: "Close work orders" },
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    children: [
      { id: "inv-view", label: "View invoices" },
      { id: "inv-issue", label: "Issue invoices" },
      { id: "inv-refund", label: "Refund invoices", description: "Owner only", isDisabled: true },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    children: [
      { id: "stock-view", label: "View stock" },
      { id: "stock-adjust", label: "Adjust stock counts" },
    ],
  },
];

const storage: ReadonlyArray<TreeNode> = [
  {
    id: "workshop",
    label: "Workshop",
    icon: Warehouse,
    children: [
      {
        id: "rack-a",
        label: "Wall rack A",
        icon: Folder,
        openIcon: FolderOpen,
        children: [
          { id: "bin-a1", label: "Bin A1", icon: Box, description: "Brake pads" },
          { id: "bin-a2", label: "Bin A2", icon: Box, description: "Chains" },
        ],
      },
      {
        id: "rack-b",
        label: "Wall rack B",
        icon: Folder,
        openIcon: FolderOpen,
        children: [{ id: "bin-b1", label: "Bin B1", icon: Box, description: "Inner tubes" }],
      },
    ],
  },
  {
    id: "basement",
    label: "Basement store",
    icon: Warehouse,
    children: [{ id: "shelf-1", label: "Shelf 1", icon: Box, description: "Wheels for sale" }],
  },
];

const staff: ReadonlyArray<TreeNode> = [
  {
    id: "owner",
    label: "Nathalie Roux",
    icon: User,
    description: "Owner",
    children: [
      {
        id: "lead",
        label: "Inès Laurent",
        icon: User,
        description: "Lead mechanic",
        children: [
          { id: "marc", label: "Marc Dubois", icon: User, description: "Mechanic" },
          { id: "sofia", label: "Sofia Marin", icon: User, description: "Mechanic" },
          { id: "theo", label: "Théo Garnier", icon: User, description: "Apprentice" },
        ],
      },
      { id: "desk", label: "Camille Faure", icon: User, description: "Front desk" },
    ],
  },
];

const staffBranchIds = ["owner", "lead"];

function PartCategories() {
  const [selected, setSelected] = useState<string | null>("pads");
  return (
    <Tree
      label="Part categories"
      nodes={partCategories}
      selection={{ mode: "single", value: selected, onChange: setSelected }}
      defaultExpandedIds={["drivetrain", "derailleurs", "brakes"]}
    />
  );
}

function MechanicPermissions() {
  const [granted, setGranted] = useState<ReadonlyArray<string>>(["wo-view", "wo-edit", "inv-view"]);
  return (
    <Tree
      label="Permissions of Marc Dubois"
      nodes={permissions}
      selection={{ mode: "checkbox", value: granted, onChange: setGranted }}
      defaultExpandedIds={["work-orders", "invoices", "inventory"]}
    />
  );
}

function StorageLocations() {
  const [nodes, setNodes] = useState(storage);
  return (
    <Tree
      label="Storage locations"
      nodes={nodes}
      defaultExpandedIds={["workshop", "rack-a", "rack-b", "basement"]}
      onMove={(move) => setNodes((current) => moveTreeNodes(current, move))}
    />
  );
}

function StaffChart() {
  const [expanded, setExpanded] = useState<ReadonlyArray<string>>(["owner"]);
  return (
    <Column>
      <Row>
        <Button size="sm" onPress={() => setExpanded(staffBranchIds)}>
          Open all
        </Button>
        <Button size="sm" onPress={() => setExpanded([])}>
          Close all
        </Button>
      </Row>
      <Tree
        label="Shop staff"
        nodes={staff}
        guides={false}
        expandedIds={expanded}
        onExpandedChange={setExpanded}
      />
    </Column>
  );
}

export default defineSection({
  component: "Tree",
  specimens: [
    {
      title: "Single selection",
      note: "The selected row has a fill. A long label ends with an ellipsis, and the meta stays in view.",
      render: () => (
        <Column width="28rem">
          <PartCategories />
        </Column>
      ),
    },
    {
      title: "Checkbox selection",
      note: "A branch checkbox selects or clears every leaf under it and shows a dash when only some are selected.",
      render: () => (
        <Column width="28rem">
          <MechanicPermissions />
        </Column>
      ),
    },
    {
      title: "Drag to move",
      note: "Drag a row before, after, or into another row. The tree cancels a drop into the dragged node or a node under it.",
      render: () => (
        <Column width="28rem">
          <StorageLocations />
        </Column>
      ),
    },
    {
      title: "Controlled open branches without guides",
      note: "Pass expandedIds with onExpandedChange to keep the open branches in the URL.",
      render: () => (
        <Column width="28rem">
          <StaffChart />
        </Column>
      ),
    },
    {
      title: "Empty tree",
      render: () => (
        <Column width="28rem">
          <Tree
            label="Part categories"
            nodes={[]}
            emptyState={
              <EmptyState
                title="No part categories"
                description="Import a price list to create the categories."
              />
            }
          />
        </Column>
      ),
    },
  ],
});
