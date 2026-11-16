import * as stylex from "@stylexjs/stylex";
import { Clock, PackageCheck, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, StatusDot } from "@/components/primitives/badge";
import { MetaLine } from "@/components/primitives/layout";
import { space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

/**
 * A row that aligns its items at the bottom. Items of different heights then keep their captions
 * on one line.
 */
function BottomRow({ children }: { readonly children: ReactNode }) {
  return <div {...stylex.props(styles.bottomRow)}>{children}</div>;
}

export default defineSection({
  component: "Badge",
  specimens: [
    {
      title: "Intents",
      note: "Write the status in text, and use the same intent for the same status across the app.",
      render: () => (
        <Row>
          <Labeled label="neutral">
            <Badge intent="neutral">Draft</Badge>
          </Labeled>
          <Labeled label="accent">
            <Badge intent="accent">Scheduled</Badge>
          </Labeled>
          <Labeled label="info">
            <Badge intent="info">In repair</Badge>
          </Labeled>
          <Labeled label="warning">
            <Badge intent="warning">Waiting for parts</Badge>
          </Labeled>
          <Labeled label="success">
            <Badge intent="success">Ready for pickup</Badge>
          </Labeled>
          <Labeled label="danger">
            <Badge intent="danger">Overdue</Badge>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Appearances",
      note: "Use solid for a count and outline for a quiet tag. Outline adds a dot when the intent is not neutral.",
      render: () => (
        <Column>
          <Row>
            <Labeled label="subtle">
              <Badge intent="success">Paid</Badge>
            </Labeled>
            <Labeled label="subtle danger">
              <Badge intent="danger">Unpaid</Badge>
            </Labeled>
          </Row>
          <Row>
            <Labeled label="solid danger pill">
              <Badge intent="danger" appearance="solid" shape="pill">
                3
              </Badge>
            </Labeled>
            <Labeled label="solid accent pill">
              <Badge intent="accent" appearance="solid" shape="pill">
                12
              </Badge>
            </Labeled>
            <Labeled label="solid neutral pill">
              <Badge appearance="solid" shape="pill">
                148
              </Badge>
            </Labeled>
          </Row>
          <Row>
            <Labeled label="outline neutral">
              <Badge appearance="outline">Road bike</Badge>
            </Labeled>
            <Labeled label="outline success">
              <Badge intent="success" appearance="outline">
                Under warranty
              </Badge>
            </Labeled>
            <Labeled label="outline warning">
              <Badge intent="warning" appearance="outline">
                Rush job
              </Badge>
            </Labeled>
            <Labeled label="outline info">
              <Badge intent="info" appearance="outline">
                E-bike
              </Badge>
            </Labeled>
          </Row>
        </Column>
      ),
    },
    {
      title: "Sizes and shapes",
      note: "On a touch page, use size lg so the badge stays legible next to the larger text.",
      render: () => (
        <BottomRow>
          <Labeled label="sm">
            <Badge intent="info" size="sm">
              In repair
            </Badge>
          </Labeled>
          <Labeled label="md">
            <Badge intent="info" size="md">
              In repair
            </Badge>
          </Labeled>
          <Labeled label="lg">
            <Badge intent="info" size="lg">
              In repair
            </Badge>
          </Labeled>
          <Labeled label="pill">
            <Badge intent="accent" shape="pill">
              Current
            </Badge>
          </Labeled>
          <Labeled label="lg pill">
            <Badge intent="accent" size="lg" shape="pill">
              Current
            </Badge>
          </Labeled>
        </BottomRow>
      ),
    },
    {
      title: "With an icon",
      note: "The icon is decorative and replaces the outline dot. The text carries the meaning.",
      render: () => (
        <BottomRow>
          <Labeled label="subtle">
            <Badge intent="warning" icon={Clock}>
              Due today
            </Badge>
          </Labeled>
          <Labeled label="solid">
            <Badge intent="info" appearance="solid" icon={Wrench}>
              In repair
            </Badge>
          </Labeled>
          <Labeled label="outline">
            <Badge intent="success" appearance="outline" icon={PackageCheck}>
              Parts arrived
            </Badge>
          </Labeled>
          <Labeled label="lg">
            <Badge intent="warning" size="lg" icon={Clock}>
              Due today
            </Badge>
          </Labeled>
        </BottomRow>
      ),
    },
    {
      title: "StatusDot",
      note: "For table cells, dense lists, and detail headers. The pulse marks work in progress.",
      render: () => (
        <Column>
          <Row>
            <StatusDot intent="neutral">Draft</StatusDot>
            <StatusDot intent="accent">Scheduled</StatusDot>
            <StatusDot intent="info" isActive>
              In repair
            </StatusDot>
            <StatusDot intent="warning">Waiting for parts</StatusDot>
            <StatusDot intent="success">Ready for pickup</StatusDot>
            <StatusDot intent="danger">Overdue</StatusDot>
          </Row>
          <Row>
            <Labeled label="detail, isActive">
              <StatusDot
                intent="info"
                isActive
                detail={<MetaLine items={["Wheel truing", "35 min"]} />}
              >
                In repair
              </StatusDot>
            </Labeled>
            <Labeled label="detail">
              <StatusDot
                intent="danger"
                detail={<MetaLine items={["Due 14 Nov", "2 days late"]} />}
              >
                Overdue
              </StatusDot>
            </Labeled>
          </Row>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  bottomRow: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: space.lg },
});
