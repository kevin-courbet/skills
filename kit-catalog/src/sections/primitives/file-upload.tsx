import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { FileUpload, type UploadFile } from "@/components/primitives/file-upload";
import { Column, defineSection, Labeled } from "../../specimen";

const signatureTypes = ["application/pdf", "image/png"];
const photoTypes = ["image/jpeg", "image/png", "image/heic"];

const repairPhotos: ReadonlyArray<UploadFile> = [
  { id: "photo-1", name: "wo-4821-frame-front.jpg", size: 2_480_000, status: "done" },
  {
    id: "photo-2",
    name: "wo-4821-rear-derailleur.jpg",
    size: 3_120_000,
    status: "uploading",
    progress: 45,
  },
  { id: "photo-3", name: "wo-4821-chainring-wear.png", size: 1_870_000, status: "queued" },
  {
    id: "photo-4",
    name: "wo-4821-carbon-frame-crack-inspection-rear-dropout-left-side-close-up-under-workshop-light.heic",
    size: 14_600_000,
    status: "failed",
    error: "The file is larger than 10 MB. Export a smaller copy of the photo and try again.",
  },
];

function toQueued(files: ReadonlyArray<File>): ReadonlyArray<UploadFile> {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    status: "queued",
  }));
}

function UploadField({
  initialFiles,
  ...props
}: {
  readonly label: string;
  readonly description?: string;
  readonly acceptedFileTypes?: ReadonlyArray<string>;
  readonly allowsMultiple?: boolean;
  readonly isDisabled?: boolean;
  readonly errorMessage?: string;
  readonly isOptional?: boolean;
  readonly initialFiles: ReadonlyArray<UploadFile>;
  readonly style?: stylex.StyleXStyles;
}) {
  const [files, setFiles] = useState<ReadonlyArray<UploadFile>>(initialFiles);
  return (
    <FileUpload
      {...props}
      files={files}
      onSelect={(chosen) =>
        setFiles((current) =>
          props.allowsMultiple === true ? [...current, ...toQueued(chosen)] : toQueued(chosen),
        )
      }
      onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
    />
  );
}

export default defineSection({
  component: "FileUpload",
  specimens: [
    {
      title: "One file",
      note: "The field only selects files. The app uploads each file and updates its status, so a chosen file stays queued here.",
      render: () => (
        <Column width="32rem">
          <UploadField
            label="Signed estimate"
            description="PDF or PNG, up to 5 MB."
            acceptedFileTypes={signatureTypes}
            initialFiles={[]}
          />
        </Column>
      ),
    },
    {
      title: "Many files with upload status",
      note: "Write the error of a failed file as the problem and the next action.",
      render: () => (
        <Column width="32rem">
          <UploadField
            label="Repair photos"
            description="JPEG, PNG, or HEIC, up to 10 MB each."
            acceptedFileTypes={photoTypes}
            allowsMultiple
            initialFiles={repairPhotos}
          />
        </Column>
      ),
    },
    {
      title: "States",
      render: () => (
        <Column width="32rem">
          <Labeled label="isOptional">
            <UploadField
              style={styles.fill}
              label="Purchase receipt"
              description="PDF or PNG, up to 5 MB. Add it for a warranty repair."
              acceptedFileTypes={signatureTypes}
              isOptional
              initialFiles={[]}
            />
          </Labeled>
          <Labeled label="errorMessage">
            <UploadField
              style={styles.fill}
              label="Signed estimate"
              description="PDF or PNG, up to 5 MB."
              acceptedFileTypes={signatureTypes}
              errorMessage="Attach the signed estimate before you start the repair."
              initialFiles={[]}
            />
          </Labeled>
          <Labeled label="isDisabled">
            <UploadField
              style={styles.fill}
              label="Signed estimate"
              description="PDF or PNG, up to 5 MB."
              acceptedFileTypes={signatureTypes}
              isDisabled
              initialFiles={[
                {
                  id: "estimate-1",
                  name: "estimate-wo-4821-signed.pdf",
                  size: 184_000,
                  status: "done",
                },
              ]}
            />
          </Labeled>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  // A Labeled caption shrinks its child, so each field takes the full width of the column.
  fill: { width: "100%" },
});
