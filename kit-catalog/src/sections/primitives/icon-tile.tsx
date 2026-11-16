import * as stylex from "@stylexjs/stylex";
import {
  BadgeCheck,
  Bike,
  CreditCard,
  MessageSquare,
  PackageSearch,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge, type BadgeIntent } from "@/components/primitives/badge";
import { IconTile, type IconTileProps } from "@/components/primitives/icon-tile";
import { Item, ItemList } from "@/components/primitives/item";
import { color, font, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const tones: ReadonlyArray<{ readonly tone: BadgeIntent; readonly icon: LucideIcon }> = [
  { tone: "neutral", icon: Bike },
  { tone: "accent", icon: Wrench },
  { tone: "info", icon: Truck },
  { tone: "success", icon: BadgeCheck },
  { tone: "warning", icon: PackageSearch },
  { tone: "danger", icon: CreditCard },
];

const variants: ReadonlyArray<NonNullable<IconTileProps["variant"]>> = ["soft", "solid", "outline"];

export default defineSection({
  component: "IconTile",
  specimens: [
    {
      title: "Variants",
      render: () => (
        <Row>
          <Labeled label="soft">
            <IconTile icon={Wrench} variant="soft" />
          </Labeled>
          <Labeled label="solid">
            <IconTile icon={Wrench} variant="solid" />
          </Labeled>
          <Labeled label="outline">
            <IconTile icon={Wrench} variant="outline" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Tones",
      note: "Keep the tone neutral unless the tone supports the text next to the tile.",
      render: () => (
        <div {...stylex.props(styles.matrix)}>
          <span />
          {tones.map(({ tone }) => (
            <span key={tone} {...stylex.props(styles.caption)}>
              {tone}
            </span>
          ))}
          {variants.map((variant) => [
            <span key={variant} {...stylex.props(styles.caption)}>
              {variant}
            </span>,
            ...tones.map(({ tone, icon }) => (
              <IconTile key={`${variant}-${tone}`} icon={icon} tone={tone} variant={variant} />
            )),
          ])}
        </div>
      ),
    },
    {
      title: "Sizes and shapes",
      render: () => (
        <Row>
          <Labeled label="sm">
            <span {...stylex.props(styles.stage)}>
              <IconTile icon={Bike} size="sm" />
            </span>
          </Labeled>
          <Labeled label="md">
            <span {...stylex.props(styles.stage)}>
              <IconTile icon={Bike} size="md" />
            </span>
          </Labeled>
          <Labeled label="lg">
            <span {...stylex.props(styles.stage)}>
              <IconTile icon={Bike} size="lg" />
            </span>
          </Labeled>
          <Labeled label="sm circle">
            <span {...stylex.props(styles.stage)}>
              <IconTile icon={Bike} size="sm" shape="circle" />
            </span>
          </Labeled>
          <Labeled label="md circle">
            <span {...stylex.props(styles.stage)}>
              <IconTile icon={Bike} size="md" shape="circle" />
            </span>
          </Labeled>
          <Labeled label="lg circle">
            <span {...stylex.props(styles.stage)}>
              <IconTile icon={Bike} size="lg" shape="circle" />
            </span>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Media of an item",
      note: "The tile is hidden from screen readers: the row text carries the meaning, such as the failure that a danger tone supports.",
      render: () => (
        <Column width="32rem">
          <ItemList label="Integrations">
            <Item
              media={<IconTile icon={Truck} />}
              title="Parts supplier feed"
              description="Prices and stock from Velotech, every 6 hours"
              meta={<Badge intent="success">Connected</Badge>}
            />
            <Item
              media={<IconTile icon={MessageSquare} />}
              title="Pickup text messages"
              description="Texts the customer when the bike is ready"
              meta={<Badge intent="success">Connected</Badge>}
            />
            <Item
              media={<IconTile icon={CreditCard} tone="danger" />}
              title="Card terminal"
              description="The last payment sync failed at 09:12"
              meta={<Badge intent="danger">Sync failed</Badge>}
            />
          </ItemList>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  // One column for each of the six tones and one row for each variant, so that each tile sits under
  // its tone.
  matrix: {
    display: "grid",
    gridTemplateColumns: "auto repeat(6, max-content)",
    alignItems: "center",
    justifyItems: "start",
    gap: space.lg,
  },
  caption: { fontSize: font.sm, color: color.textFaint },
  // The height of the lg tile, so that the captions of all sizes line up.
  stage: { display: "flex", alignItems: "center", height: "2.5rem" },
});
