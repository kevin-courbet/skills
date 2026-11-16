import * as stylex from "@stylexjs/stylex";
import { FileTypeIcon, fileTypeOf } from "@/components/primitives/file-type-icon";
import { Item, ItemList } from "@/components/primitives/item";
import { space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const families: ReadonlyArray<string> = [
  "parts-inventory.csv",
  "supplier-feed.json",
  "sync-prices.py",
  "invoice-INV-2207.pdf",
  "service-checklist.docx",
  "frame-crack.jpg",
  "brake-test.mp4",
  "customer-voicemail.m4a",
  "invoices-2026.zip",
  "card-terminal.pem",
  "terminal-sync.log",
  "fitting-session.fit",
];

const fallbacks: ReadonlyArray<{ readonly name: string; readonly mimeType?: string }> = [
  { name: "Dockerfile" },
  { name: ".env.local" },
  { name: "receipt", mimeType: "application/pdf" },
  { name: "damage-photo", mimeType: "image/heic" },
  { name: "export", mimeType: "application/octet-stream" },
];

const attachments: ReadonlyArray<{ readonly name: string; readonly size: string }> = [
  { name: "estimate-WO-1048.pdf", size: "182 KB" },
  { name: "rear-wheel-before.jpg", size: "2.4 MB" },
  { name: "shimano-parts-order.xlsx", size: "36 KB" },
];

export default defineSection({
  component: "FileTypeIcon",
  specimens: [
    {
      title: "Families",
      note: "The extension decides the family. An unknown file is a neutral File.",
      render: () => (
        <div {...stylex.props(styles.grid)}>
          {families.map((name) => (
            <Labeled key={name} label={`${name}: ${fileTypeOf(name).kind}`}>
              <FileTypeIcon name={name} />
            </Labeled>
          ))}
        </div>
      ),
    },
    {
      title: "Names without an extension",
      note: "Names such as Dockerfile resolve by name. Otherwise the MIME type decides.",
      render: () => (
        <div {...stylex.props(styles.grid)}>
          {fallbacks.map(({ name, mimeType }) => (
            <Labeled
              key={name}
              label={`${name}${mimeType === undefined ? "" : ` (${mimeType})`}: ${fileTypeOf(name, mimeType).kind}`}
            >
              <FileTypeIcon name={name} mimeType={mimeType} />
            </Labeled>
          ))}
        </div>
      ),
    },
    {
      title: "Sizes",
      render: () => (
        <Row>
          <Labeled label="sm">
            <span {...stylex.props(styles.stage)}>
              <FileTypeIcon name="invoice-INV-2207.pdf" size="sm" />
            </span>
          </Labeled>
          <Labeled label="md">
            <span {...stylex.props(styles.stage)}>
              <FileTypeIcon name="invoice-INV-2207.pdf" size="md" />
            </span>
          </Labeled>
          <Labeled label="lg">
            <span {...stylex.props(styles.stage)}>
              <FileTypeIcon name="invoice-INV-2207.pdf" size="lg" />
            </span>
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Attachment rows",
      note: "Show the file name next to the icon. The icon is decorative.",
      render: () => (
        <Column width="32rem">
          <ItemList label="Attachments of WO-1048">
            {attachments.map(({ name, size }) => (
              <Item
                key={name}
                media={<FileTypeIcon name={name} />}
                title={name}
                description={fileTypeOf(name).kind}
                meta={size}
              />
            ))}
          </ItemList>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
    gap: space.lg,
  },
  // One height for each tile size, so that the captions line up.
  stage: { display: "flex", alignItems: "center", height: "2.5rem" },
});
