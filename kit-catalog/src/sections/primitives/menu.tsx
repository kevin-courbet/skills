import * as stylex from "@stylexjs/stylex";
import {
  ArrowDownUp,
  Copy,
  Ellipsis,
  Eye,
  Pencil,
  Printer,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import {
  ContextMenu,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/primitives/menu";
import { Card } from "@/components/primitives/layout";
import { color, font } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const actionLabels: Readonly<Record<string, string>> = {
  edit: "Edit work order",
  duplicate: "Duplicate work order",
  print: "Print work order",
  delete: "Delete work order",
};

function LastAction({ action }: { readonly action: Key | undefined }) {
  return (
    <span {...stylex.props(styles.result)}>
      {action === undefined ? "No action yet" : `Last action: ${actionLabels[String(action)]}`}
    </span>
  );
}

function RowActions() {
  const [lastAction, setLastAction] = useState<Key | undefined>(undefined);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  return (
    <Row>
      <MenuTrigger>
        <Button intent="ghost" iconOnly icon={Ellipsis} aria-label="Actions for WO-1042" />
        <Menu
          onAction={(id) => {
            if (id === "delete") setDeleteOpen(true);
            else setLastAction(id);
          }}
        >
          <MenuItem id="edit" icon={Pencil}>
            Edit work order
          </MenuItem>
          <MenuItem id="duplicate" icon={Copy}>
            Duplicate work order
          </MenuItem>
          <MenuItem id="print" icon={Printer}>
            Print work order
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="delete" icon={Trash2} isDestructive>
            Delete work order
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <LastAction action={lastAction} />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete WO-1042?"
        description="The work order, its 3 photos, and its mechanic notes are deleted. You cannot undo this."
        confirmLabel="Delete work order"
        onConfirm={async () => {
          setLastAction("delete");
        }}
      />
    </Row>
  );
}

function WorkOrderCard() {
  const [lastAction, setLastAction] = useState<Key | undefined>(undefined);
  const items = (
    <>
      <MenuItem id="edit" icon={Pencil}>
        Edit work order
      </MenuItem>
      <MenuItem id="duplicate" icon={Copy}>
        Duplicate work order
      </MenuItem>
      <MenuItem id="print" icon={Printer}>
        Print work order
      </MenuItem>
    </>
  );
  return (
    <Column width="22rem">
      <ContextMenu label="Actions for WO-1041" menu={items} onAction={setLastAction}>
        <Card
          headingLevel={3}
          title="WO-1041: Flat tire and new tube"
          description="Chloé Dubois, Brompton C Line"
          actions={
            <MenuTrigger>
              <Button
                intent="ghost"
                size="sm"
                iconOnly
                icon={Ellipsis}
                aria-label="Actions for WO-1041"
              />
              <Menu onAction={setLastAction}>{items}</Menu>
            </MenuTrigger>
          }
        >
          <Badge intent="success">Ready for pickup</Badge>
        </Card>
      </ContextMenu>
      <LastAction action={lastAction} />
    </Column>
  );
}

export default defineSection({
  component: "Menu",
  specimens: [
    {
      title: "Row actions",
      note: "Separate groups with MenuSeparator. A destructive item opens a ConfirmDialog.",
      render: () => <RowActions />,
    },
    {
      title: "Shortcuts and disabled items",
      note: "A shortcut shows only as a hint. The key runs the action outside the menu.",
      render: () => (
        <Row>
          <MenuTrigger>
            <Button>Invoice actions</Button>
            <Menu placement="bottom start" disabledKeys={["refund"]}>
              <MenuItem id="send" icon={Send} shortcut="⌘↵">
                Send invoice
              </MenuItem>
              <MenuItem id="preview" icon={Eye} shortcut="⌘P">
                Preview invoice
              </MenuItem>
              <MenuItem id="duplicate" icon={Copy} shortcut="⌘D">
                Duplicate invoice
              </MenuItem>
              <MenuSeparator />
              <MenuItem id="refund">Refund payment</MenuItem>
            </Menu>
          </MenuTrigger>
        </Row>
      ),
    },
    {
      title: "Selection",
      note: "With selectionMode, each item shows a check mark when it is selected.",
      render: () => (
        <Row>
          <Labeled label="selectionMode single">
            <MenuTrigger>
              <Button icon={ArrowDownUp}>Sort</Button>
              <Menu
                aria-label="Sort work orders"
                placement="bottom start"
                selectionMode="single"
                defaultSelectedKeys={["due"]}
              >
                <MenuItem id="due">Due date</MenuItem>
                <MenuItem id="created">Date created</MenuItem>
                <MenuItem id="customer">Customer name</MenuItem>
              </Menu>
            </MenuTrigger>
          </Labeled>
          <Labeled label="selectionMode multiple">
            <MenuTrigger>
              <Button>Columns</Button>
              <Menu
                aria-label="Visible columns"
                placement="bottom start"
                selectionMode="multiple"
                defaultSelectedKeys={["customer", "mechanic", "status"]}
              >
                <MenuItem id="customer">Customer</MenuItem>
                <MenuItem id="bike">Bike</MenuItem>
                <MenuItem id="mechanic">Mechanic</MenuItem>
                <MenuItem id="status">Status</MenuItem>
                <MenuItem id="total">Total</MenuItem>
              </Menu>
            </MenuTrigger>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "People",
      note: "Use avatar only when the label names a person. Without src, the avatar shows the initials.",
      render: () => (
        <Row>
          <MenuTrigger>
            <Button icon={UserRound}>Assign mechanic</Button>
            <Menu aria-label="Assign mechanic" placement="bottom start">
              <MenuItem id="ines" avatar={{}}>
                Inès Garnier
              </MenuItem>
              <MenuItem id="lucas" avatar={{}}>
                Lucas Moreau
              </MenuItem>
              <MenuItem id="samir" avatar={{}}>
                Samir Haddad
              </MenuItem>
              <MenuItem id="long" avatar={{}}>
                Anne-Sophie Delacroix-Beaumont, apprentice mechanic on Saturdays
              </MenuItem>
            </Menu>
          </MenuTrigger>
        </Row>
      ),
    },
    {
      title: "ContextMenu",
      note: "Right-click the card, or press Shift+F10 on its menu button. Every action is also on the visible menu button.",
      render: () => <WorkOrderCard />,
    },
  ],
});

const styles = stylex.create({
  result: { fontSize: font.sm, color: color.textMuted },
});
