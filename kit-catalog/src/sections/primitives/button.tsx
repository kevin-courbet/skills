import * as stylex from "@stylexjs/stylex";
import { ChevronDown, ListFilter, Minus, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button, ButtonGroup, LinkButton } from "@/components/primitives/button";
import { Menu, MenuItem, MenuTrigger } from "@/components/primitives/menu";
import { space } from "@/styles/tokens.stylex";
import { defineSection, Labeled, Row } from "../../specimen";

/**
 * A row that aligns its items at the bottom. Items of different heights then keep their captions
 * on one line.
 */
function BottomRow({ children }: { readonly children: ReactNode }) {
  return <div {...stylex.props(styles.bottomRow)}>{children}</div>;
}

export default defineSection({
  component: "Button",
  specimens: [
    {
      title: "Intents",
      note: "Give one primary button to each view. Keep danger for the confirm button of a destructive step.",
      render: () => (
        <Row>
          <Labeled label="primary">
            <Button intent="primary">Save changes</Button>
          </Labeled>
          <Labeled label="secondary">
            <Button>Export</Button>
          </Labeled>
          <Labeled label="ghost">
            <Button intent="ghost">Cancel</Button>
          </Labeled>
          <Labeled label="danger">
            <Button intent="danger">Delete work order</Button>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Sizes",
      note: "The icon size follows the button size: 14 px for sm, 16 px for md, and 20 px for lg.",
      render: () => (
        <BottomRow>
          <Labeled label="sm">
            <Button size="sm" icon={ListFilter}>
              Filter
            </Button>
          </Labeled>
          <Labeled label="md">
            <Button size="md" icon={ListFilter}>
              Filter
            </Button>
          </Labeled>
          <Labeled label="lg">
            <Button size="lg" icon={ListFilter}>
              Filter
            </Button>
          </Labeled>
        </BottomRow>
      ),
    },
    {
      title: "Icons",
      render: () => (
        <Row>
          <Labeled label="icon and label">
            <Button intent="primary" icon={Plus}>
              Create work order
            </Button>
          </Labeled>
          <Labeled label="iconOnly">
            <Button iconOnly icon={Trash2} aria-label="Delete work order" />
          </Labeled>
          <Labeled label="iconOnly ghost">
            <Button intent="ghost" iconOnly icon={Trash2} aria-label="Delete work order" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Disabled and pending",
      note: "isPending shows a spinner and keeps the width. The button keeps the focus and ignores presses.",
      render: () => (
        <Row>
          <Labeled label="isDisabled">
            <Button intent="primary" isDisabled>
              Save changes
            </Button>
          </Labeled>
          <Labeled label="isDisabled secondary">
            <Button isDisabled>Export</Button>
          </Labeled>
          <Labeled label="isPending">
            <Button intent="primary" isPending>
              Save changes
            </Button>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "LinkButton",
      note: "A router link with the look of a button, for navigation that reads as an action.",
      render: () => (
        <Row>
          <LinkButton to="/" intent="primary">
            Create work order
          </LinkButton>
          <LinkButton to="/">View all work orders</LinkButton>
        </Row>
      ),
    },
    {
      title: "ButtonGroup",
      note: "Joins buttons into one control: a split button, or zoom out and in.",
      render: () => (
        <Row>
          <ButtonGroup label="Invoice actions">
            <Button intent="primary">Send invoice</Button>
            <MenuTrigger>
              <Button
                intent="primary"
                iconOnly
                icon={ChevronDown}
                aria-label="Other ways to send the invoice"
              />
              <Menu>
                <MenuItem id="text">Send by text message</MenuItem>
                <MenuItem id="print">Print invoice</MenuItem>
              </Menu>
            </MenuTrigger>
          </ButtonGroup>
          <ButtonGroup label="Zoom">
            <Button iconOnly icon={Minus} aria-label="Zoom out" />
            <Button iconOnly icon={Plus} aria-label="Zoom in" />
          </ButtonGroup>
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  bottomRow: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: space.lg },
});
