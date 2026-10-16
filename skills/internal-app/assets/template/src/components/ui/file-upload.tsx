import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { CircleAlert, CircleCheck, FileText, Upload, X } from "lucide-react";
import { useId } from "react";
import { DropZone, FileTrigger, isFileDropItem, Text } from "react-aria-components";
import { appLocale } from "@/lib/locale";
import { renderStyles } from "@/lib/rac";
import { color, font, motion, radius, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { field } from "./field";
import { ProgressBar } from "./progress-bar";

export type UploadStatus = "queued" | "uploading" | "done" | "failed";

/** A file the app tracks after selection. The app owns the upload and updates this state. */
export interface UploadFile {
  readonly id: string;
  readonly name: string;
  /** Size in bytes. */
  readonly size: number;
  readonly status: UploadStatus;
  /** 0 to 100 while `status` is "uploading". */
  readonly progress?: number;
  /** Problem and next action, shown when `status` is "failed". */
  readonly error?: string;
}

export interface FileUploadProps {
  readonly label: string;
  /** Allowed types and size, such as "CSV or XLSX, up to 10 MB". */
  readonly description?: string;
  /** Exact MIME types. Drops of other types are refused, and the file dialog filters by them. */
  readonly acceptedFileTypes?: ReadonlyArray<string>;
  readonly allowsMultiple?: boolean;
  readonly files: ReadonlyArray<UploadFile>;
  readonly onSelect: (files: ReadonlyArray<File>) => void;
  /** Adds a remove button to each file row. */
  readonly onRemove?: (id: string) => void;
  readonly isDisabled?: boolean;
  /** Problem with the whole selection, such as a missing required file. */
  readonly errorMessage?: string;
  readonly style?: StyleXStyles;
}

/**
 * Drop zone with a file dialog button and the list of chosen files. It only
 * selects files: the app validates, uploads, and reports each file's status.
 */
export function FileUpload({
  label,
  description,
  acceptedFileTypes,
  allowsMultiple = false,
  files,
  onSelect,
  onRemove,
  isDisabled = false,
  errorMessage,
  style,
}: FileUploadProps) {
  const labelId = useId();
  const isAccepted = (type: string) =>
    acceptedFileTypes === undefined || acceptedFileTypes.includes(type);
  return (
    <div {...stylex.props(field.root, styles.root, style)}>
      <span id={labelId} {...stylex.props(field.label)}>
        {label}
      </span>
      <DropZone
        aria-labelledby={labelId}
        isDisabled={isDisabled}
        getDropOperation={(types) =>
          acceptedFileTypes === undefined || acceptedFileTypes.some((type) => types.has(type))
            ? "copy"
            : "cancel"
        }
        onDrop={(event) => {
          const items = event.items
            .filter(isFileDropItem)
            .filter((item) => isAccepted(item.type))
            .slice(0, allowsMultiple ? undefined : 1);
          void Promise.all(items.map((item) => item.getFile())).then(onSelect);
        }}
        {...renderStyles<{ isDropTarget: boolean; isFocusVisible: boolean; isDisabled: boolean }>(
          (state) => [
            styles.zone,
            errorMessage !== undefined && styles.zoneInvalid,
            state.isDropTarget && styles.zoneActive,
            state.isFocusVisible && styles.zoneFocused,
            state.isDisabled && styles.disabled,
          ],
        )}
      >
        <Upload aria-hidden {...stylex.props(styles.zoneIcon)} />
        <Text slot="label" {...stylex.props(styles.zoneText)}>
          Drop {allowsMultiple ? "files" : "a file"} here or
        </Text>
        <FileTrigger
          acceptedFileTypes={acceptedFileTypes === undefined ? undefined : [...acceptedFileTypes]}
          allowsMultiple={allowsMultiple}
          onSelect={(list) => {
            if (list !== null) onSelect(Array.from(list));
          }}
        >
          <Button size="sm" isDisabled={isDisabled}>
            {allowsMultiple ? "Choose files" : "Choose file"}
          </Button>
        </FileTrigger>
      </DropZone>
      {description ? <span {...stylex.props(field.description)}>{description}</span> : null}
      {errorMessage ? (
        <span role="alert" {...stylex.props(field.error)}>
          {errorMessage}
        </span>
      ) : null}
      {files.length > 0 ? (
        <ul aria-label={`${label} files`} {...stylex.props(styles.list)}>
          {files.map((file) => (
            <FileRow key={file.id} file={file} onRemove={onRemove} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FileRow({
  file,
  onRemove,
}: {
  readonly file: UploadFile;
  readonly onRemove?: (id: string) => void;
}) {
  return (
    <li {...stylex.props(styles.row)}>
      <FileText aria-hidden {...stylex.props(styles.fileIcon)} />
      <span {...stylex.props(styles.fileText)}>
        <span {...stylex.props(styles.fileName)}>{file.name}</span>
        <span {...stylex.props(styles.fileMeta)}>
          {formatBytes(file.size)}
          <FileStatus file={file} />
        </span>
        {file.status === "uploading" ? (
          <ProgressBar
            label={`Uploading ${file.name}`}
            hideLabel
            value={file.progress ?? 0}
            style={styles.progress}
          />
        ) : null}
      </span>
      {onRemove === undefined ? null : (
        <Button
          intent="ghost"
          size="sm"
          iconOnly
          aria-label={`Remove ${file.name}`}
          onPress={() => onRemove(file.id)}
        >
          <X aria-hidden {...stylex.props(styles.removeIcon)} />
        </Button>
      )}
    </li>
  );
}

function FileStatus({ file }: { readonly file: UploadFile }) {
  if (file.status === "failed")
    return (
      <span {...stylex.props(styles.status, styles.failed)}>
        <CircleAlert aria-hidden {...stylex.props(styles.statusIcon)} />
        {file.error ?? "Upload failed"}
      </span>
    );
  if (file.status === "done")
    return (
      <span {...stylex.props(styles.status, styles.done)}>
        <CircleCheck aria-hidden {...stylex.props(styles.statusIcon)} />
        Uploaded
      </span>
    );
  if (file.status === "uploading")
    return (
      <span {...stylex.props(styles.status)}>
        {Math.round(file.progress ?? 0).toLocaleString(appLocale)}%
      </span>
    );
  return <span {...stylex.props(styles.status)}>Queued</span>;
}

const byteUnits = ["B", "KB", "MB", "GB"] as const;

function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < byteUnits.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toLocaleString(appLocale, { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${byteUnits[unit]}`;
}

const styles = stylex.create({
  root: { gap: space.sm },
  zone: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    minHeight: "5.5rem",
    paddingBlock: space.lg,
    paddingInline: space.lg,
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: color.borderStrong,
    borderRadius: radius.lg,
    backgroundColor: color.subtle,
    color: color.textMuted,
    outlineStyle: "none",
    transitionProperty: "background-color, border-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  zoneInvalid: { borderColor: color.dangerBorder },
  zoneActive: {
    borderColor: color.accent,
    borderStyle: "solid",
    backgroundColor: color.accentMuted,
  },
  zoneFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  disabled: { opacity: "0.5" },
  zoneIcon: { width: size.icon, height: size.icon, flexShrink: 0 },
  zoneText: { fontSize: font.md },
  list: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    listStyleType: "none",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.raised,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderTopWidth: { default: "1px", ":first-child": 0 },
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
  fileIcon: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
  fileText: { display: "flex", flexDirection: "column", gap: "2px", flex: "1", minWidth: 0 },
  fileName: {
    fontSize: font.md,
    fontWeight: font.medium,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  status: { display: "inline-flex", alignItems: "center", gap: space.xs },
  statusIcon: { width: size.iconSm, height: size.iconSm, flexShrink: 0 },
  failed: { color: color.danger },
  done: { color: color.success },
  progress: { marginTop: space.xs },
  removeIcon: { width: size.iconSm, height: size.iconSm },
});
