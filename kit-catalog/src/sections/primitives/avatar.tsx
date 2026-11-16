import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Avatar, AvatarGroup } from "@/components/primitives/avatar";
import { MetaLine } from "@/components/primitives/layout";
import { space } from "@/styles/tokens.stylex";
import { defineSection, Labeled, Row } from "../../specimen";

// An inline image keeps the specimen free of network calls.
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#5b7fa6"/><circle cx="20" cy="16" r="7" fill="#e9d3bf"/><path d="M6 40c1-9 7-14 14-14s13 5 14 14z" fill="#2f4a68"/></svg>',
)}`;

// A data URL that is not a valid image fails to load without a network call.
const brokenImage = "data:image/png;base64,AAAA";

/**
 * A row that aligns its items at the bottom. Items of different heights then keep their captions
 * on one line.
 */
function BottomRow({ children }: { readonly children: ReactNode }) {
  return <div {...stylex.props(styles.bottomRow)}>{children}</div>;
}

const mechanics = [
  { name: "Bruno Costa", src: portrait },
  { name: "Lena Fischer" },
  { name: "Amir Haddad" },
  { name: "Chloé Martin" },
  { name: "Tomás Rivera" },
  { name: "Yuki Tanaka" },
];

export default defineSection({
  component: "Avatar",
  specimens: [
    {
      title: "Sizes",
      render: () => (
        <BottomRow>
          <Labeled label="xs">
            <Avatar name="Bruno Costa" size="xs" />
          </Labeled>
          <Labeled label="sm">
            <Avatar name="Bruno Costa" size="sm" />
          </Labeled>
          <Labeled label="md">
            <Avatar name="Bruno Costa" size="md" />
          </Labeled>
          <Labeled label="lg">
            <Avatar name="Bruno Costa" size="lg" />
          </Labeled>
        </BottomRow>
      ),
    },
    {
      title: "Image and initials",
      note: "The initials come from the first and the last word of the name, and show when the image is missing or fails to load.",
      render: () => (
        <Row>
          <Labeled label="src">
            <Avatar name="Bruno Costa" src={portrait} size="lg" />
          </Labeled>
          <Labeled label="no src">
            <Avatar name="Lena Maria Fischer" size="lg" />
          </Labeled>
          <Labeled label="image fails">
            <Avatar name="Amir Haddad" src={brokenImage} size="lg" />
          </Labeled>
          <Labeled label="one word">
            <Avatar name="Mateo" size="lg" />
          </Labeled>
          <Labeled label="service account">
            <Avatar name="Inventory sync" size="lg" />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Inline in a metadata line",
      note: "Use size xs in a MetaLine, and show the name in text next to the avatar.",
      render: () => (
        <MetaLine
          items={[
            <>
              <Avatar name="Bruno Costa" src={portrait} size="xs" /> Bruno Costa
            </>,
            "Updated 2h ago",
            "WO-1048",
          ]}
        />
      ),
    },
    {
      title: "AvatarGroup",
      note: "The +N count names the other people for screen readers and on hover.",
      render: () => (
        <BottomRow>
          <Labeled label="max 4 (default)">
            <AvatarGroup label="Mechanics on shift" people={mechanics} />
          </Labeled>
          <Labeled label="max 3, size md">
            <AvatarGroup label="Mechanics on shift" people={mechanics} max={3} size="md" />
          </Labeled>
          <Labeled label="fewer than max">
            <AvatarGroup label="Assigned mechanics" people={mechanics.slice(0, 2)} />
          </Labeled>
        </BottomRow>
      ),
    },
  ],
});

const styles = stylex.create({
  bottomRow: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: space.lg },
});
