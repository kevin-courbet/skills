// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
/**
 * The family icon of a file on an icon tile, found from the file name or the MIME type.
 *
 * @layer primitive
 * @keywords file icon, file type, file type icon, attachment icon, document icon, mime type icon, file extension
 * @related IconTile, FileUpload, Item, Tree
 * @notes icons, internal-app-icons
 *
 * Use it in an upload list, a file tree, or an attachment row. Do not use it
 * for other icons: use `IconTile`.
 *
 * ## Behavior
 * - The families are spreadsheet, data, code, document, image, video, audio,
 *   archive, key or certificate, log, and file.
 * - The extension of the name decides first, then the MIME type. Names without
 *   an extension, such as `Dockerfile` or `.env.local`, resolve by name. An
 *   unknown file is a neutral "File".
 * - The icon is decorative.
 *
 * ## Rules
 * - Show the file name next to the icon.
 * - Use `fileTypeOf` to get the family name, such as "Spreadsheet", for a
 *   tooltip or a column.
 *
 * ## Example
 * ```tsx
 * <Item media={<FileTypeIcon name="invoices-2026.csv" />} title="invoices-2026.csv" />
 * ```
 */
import {
  File,
  FileArchive,
  FileBraces,
  FileClock,
  FileCode,
  FileImage,
  FileKey,
  FileMusic,
  FileSpreadsheet,
  FileText,
  FileVideoCamera,
  type LucideIcon,
} from "lucide-react";
import type { BadgeIntent } from "./badge";
import { IconTile } from "./icon-tile";

export interface FileType {
  /** Family name for screen readers and tooltips, such as "Spreadsheet". */
  readonly kind: string;
  /** The lucide icon of the family. */
  readonly icon: LucideIcon;
  /** The tone of the tile for the family. */
  readonly tone: BadgeIntent;
}

const families: ReadonlyArray<{
  readonly type: FileType;
  readonly extensions: ReadonlyArray<string>;
  readonly mimePrefixes: ReadonlyArray<string>;
}> = [
  {
    type: { kind: "Spreadsheet", icon: FileSpreadsheet, tone: "success" },
    extensions: ["csv", "tsv", "xls", "xlsx", "ods", "parquet"],
    mimePrefixes: [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml",
    ],
  },
  {
    type: { kind: "Data", icon: FileBraces, tone: "warning" },
    extensions: ["json", "jsonl", "ndjson", "xml"],
    mimePrefixes: ["application/json", "application/xml", "text/xml"],
  },
  {
    type: { kind: "Code", icon: FileCode, tone: "info" },
    extensions: [
      "ts",
      "tsx",
      "js",
      "jsx",
      "py",
      "go",
      "rb",
      "rs",
      "java",
      "sh",
      "sql",
      "yaml",
      "yml",
      "toml",
      "ini",
      "env",
      "dockerfile",
      "makefile",
    ],
    mimePrefixes: ["text/x-", "application/x-sh", "application/yaml", "application/sql"],
  },
  {
    type: { kind: "Document", icon: FileText, tone: "danger" },
    extensions: ["pdf"],
    mimePrefixes: ["application/pdf"],
  },
  {
    type: { kind: "Document", icon: FileText, tone: "accent" },
    extensions: ["txt", "md", "doc", "docx", "rtf", "odt"],
    mimePrefixes: [
      "text/plain",
      "text/markdown",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml",
    ],
  },
  {
    type: { kind: "Image", icon: FileImage, tone: "accent" },
    extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"],
    mimePrefixes: ["image/"],
  },
  {
    type: { kind: "Video", icon: FileVideoCamera, tone: "neutral" },
    extensions: ["mp4", "mov", "webm", "mkv"],
    mimePrefixes: ["video/"],
  },
  {
    type: { kind: "Audio", icon: FileMusic, tone: "neutral" },
    extensions: ["mp3", "wav", "ogg", "flac", "m4a"],
    mimePrefixes: ["audio/"],
  },
  {
    type: { kind: "Archive", icon: FileArchive, tone: "warning" },
    extensions: ["zip", "gz", "tgz", "tar", "7z", "rar", "bz2", "zst"],
    mimePrefixes: ["application/zip", "application/gzip", "application/x-tar", "application/x-7z"],
  },
  {
    type: { kind: "Key or certificate", icon: FileKey, tone: "danger" },
    extensions: ["pem", "key", "crt", "cer", "p12", "pfx", "pub"],
    mimePrefixes: ["application/x-pem-file", "application/pkcs", "application/x-x509"],
  },
  {
    type: { kind: "Log", icon: FileClock, tone: "neutral" },
    extensions: ["log", "out"],
    mimePrefixes: [],
  },
];

const unknownType: FileType = { kind: "File", icon: File, tone: "neutral" };

export function fileTypeOf(name: string, mimeType?: string): FileType {
  const base = name.split(/[\\/]/).pop()?.split(/[?#]/)[0]?.toLowerCase() ?? "";
  const bare = base.startsWith(".") ? (base.slice(1).split(".")[0] ?? "") : base;
  const extension = bare.includes(".") ? (bare.split(".").pop() ?? "") : bare;
  const byName = families.find((family) => family.extensions.includes(extension));
  if (byName !== undefined) return byName.type;
  if (mimeType !== undefined) {
    const mime = mimeType.toLowerCase();
    const byMime = families.find((family) =>
      family.mimePrefixes.some((prefix) => mime.startsWith(prefix)),
    );
    if (byMime !== undefined) return byMime.type;
  }
  return unknownType;
}

export interface FileTypeIconProps {
  /** File name, path, or URL. */
  readonly name: string;
  /** MIME type, used when the name has no known extension. */
  readonly mimeType?: string;
  /** The size of the tile, as in IconTile. */
  readonly size?: "sm" | "md" | "lg";
}

export function FileTypeIcon({ name, mimeType, size = "md" }: FileTypeIconProps) {
  const type = fileTypeOf(name, mimeType);
  return <IconTile icon={type.icon} tone={type.tone} size={size} />;
}
