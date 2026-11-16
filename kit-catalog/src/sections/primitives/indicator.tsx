import * as stylex from "@stylexjs/stylex";
import { Bell, Inbox, MessageSquare, Wrench } from "lucide-react";
import { Avatar } from "@/components/primitives/avatar";
import type { BadgeIntent } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Indicator } from "@/components/primitives/indicator";
import { defineSection, Labeled, Row } from "../../specimen";

const intents: ReadonlyArray<BadgeIntent> = [
  "neutral",
  "accent",
  "info",
  "success",
  "warning",
  "danger",
];

export default defineSection({
  component: "Indicator",
  specimens: [
    {
      title: "Count on an icon button",
      note: "Give the name from children to the marked element. A count hides at zero unless showZero is set.",
      render: () => (
        <Row>
          <Labeled label="count 3">
            <Indicator label="Notifications" meaning="unread" count={3} intent="danger">
              {(name) => <Button intent="ghost" iconOnly icon={Bell} aria-label={name} />}
            </Indicator>
          </Labeled>
          <Labeled label="count 120, max 99">
            <Indicator label="Notifications" meaning="unread" count={120} intent="danger">
              {(name) => <Button intent="ghost" iconOnly icon={Bell} aria-label={name} />}
            </Indicator>
          </Labeled>
          <Labeled label="count 14, max 9">
            <Indicator
              label="Pickup requests"
              meaning="waiting for review"
              count={14}
              max={9}
              intent="danger"
            >
              {(name) => <Button iconOnly icon={Inbox} aria-label={name} />}
            </Indicator>
          </Labeled>
          <Labeled label="count 0">
            <Indicator label="Notifications" meaning="unread" count={0} intent="danger">
              {(name) => <Button intent="ghost" iconOnly icon={Bell} aria-label={name} />}
            </Indicator>
          </Labeled>
          <Labeled label="count 0, showZero">
            <Indicator label="Notifications" meaning="unread" count={0} showZero intent="neutral">
              {(name) => <Button intent="ghost" iconOnly icon={Bell} aria-label={name} />}
            </Indicator>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Dot",
      note: "Without count, the mark is a dot. isVisible hides it.",
      render: () => (
        <Row>
          <Labeled label="dot">
            <span {...stylex.props(styles.stage("2rem"))}>
              <Indicator label="Customer messages" meaning="new messages">
                {(name) => (
                  <Button intent="ghost" iconOnly icon={MessageSquare} aria-label={name} />
                )}
              </Indicator>
            </span>
          </Labeled>
          <Labeled label="isVisible false">
            <span {...stylex.props(styles.stage("2rem"))}>
              <Indicator label="Customer messages" meaning="new messages" isVisible={false}>
                {(name) => (
                  <Button intent="ghost" iconOnly icon={MessageSquare} aria-label={name} />
                )}
              </Indicator>
            </span>
          </Labeled>
          <Labeled label="on an icon">
            <span {...stylex.props(styles.stage("2rem"))}>
              <Indicator label="Repair bay 2" meaning="needs a tool check" intent="warning">
                {(name) => <Wrench role="img" aria-label={name} />}
              </Indicator>
            </span>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Presence on an avatar",
      note: "Use bottom-end and circle on an avatar, success for presence, and size md on a md or lg avatar.",
      render: () => (
        <Row>
          <Labeled label="sm on sm avatar">
            <span {...stylex.props(styles.stage("2.5rem"))}>
              <Indicator
                label="Bruno Costa"
                meaning="online"
                intent="success"
                placement="bottom-end"
                anchor="circle"
              >
                {(name) => <Avatar name="Bruno Costa" label={name} size="sm" />}
              </Indicator>
            </span>
          </Labeled>
          <Labeled label="md on md avatar">
            <span {...stylex.props(styles.stage("2.5rem"))}>
              <Indicator
                label="Lena Fischer"
                meaning="online"
                intent="success"
                placement="bottom-end"
                anchor="circle"
                size="md"
              >
                {(name) => <Avatar name="Lena Fischer" label={name} size="md" />}
              </Indicator>
            </span>
          </Labeled>
          <Labeled label="md on lg avatar">
            <span {...stylex.props(styles.stage("2.5rem"))}>
              <Indicator
                label="Amir Haddad"
                meaning="online"
                intent="success"
                placement="bottom-end"
                anchor="circle"
                size="md"
              >
                {(name) => <Avatar name="Amir Haddad" label={name} size="lg" />}
              </Indicator>
            </span>
          </Labeled>
          <Labeled label="offline, hidden">
            <span {...stylex.props(styles.stage("2.5rem"))}>
              <Indicator
                label="Chloé Martin"
                meaning="online"
                intent="success"
                placement="bottom-end"
                anchor="circle"
                size="md"
                isVisible={false}
              >
                {(name) => <Avatar name="Chloé Martin" label={name} size="lg" />}
              </Indicator>
            </span>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Count on an avatar",
      render: () => (
        <Row>
          <Labeled label="top-end circle, md">
            <Indicator
              label="Bruno Costa"
              meaning="work orders waiting for review"
              count={2}
              intent="danger"
              anchor="circle"
              size="md"
            >
              {(name) => <Avatar name="Bruno Costa" label={name} size="lg" />}
            </Indicator>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Intents",
      note: "Use danger for work that waits for people and success for presence.",
      render: () => (
        <Row>
          {intents.map((intent) => (
            <Labeled key={intent} label={intent}>
              <Indicator
                label="Open work orders"
                meaning="assigned to you"
                count={4}
                intent={intent}
              >
                {(name) => <Button iconOnly icon={Wrench} aria-label={name} />}
              </Indicator>
            </Labeled>
          ))}
        </Row>
      ),
    },
  ],
});

const styles = stylex.create({
  // One height for each item in a row, so that the captions line up under marks of other sizes.
  stage: (height: string) => ({ display: "flex", alignItems: "center", height }),
});
