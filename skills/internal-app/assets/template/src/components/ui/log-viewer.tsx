import * as stylex from "@stylexjs/stylex";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDownToLine, Download } from "lucide-react";
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { appLocale, appTimeZone } from "@/lib/locale";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { EmptyState } from "./feedback";
import { field } from "./field";
import { SearchField } from "./search-field";
import { SegmentedControl } from "./segmented-control";

export type LogLevel = "debug" | "info" | "warn" | "error";
/** `problems` keeps only warning and error lines. */
export type LogLevelFilter = "all" | "problems";

export interface LogLine {
  readonly id: string;
  /** ISO timestamp. Shown as a time in the app time zone. */
  readonly at?: string;
  readonly level?: LogLevel;
  /** Short origin, such as a stage, service, or pod name. Shown in its own column. */
  readonly source?: string;
  readonly text: string;
}

export interface LogViewerProps {
  /** Names the output region, such as "Build output". */
  readonly label: string;
  readonly lines: ReadonlyArray<LogLine>;
  /** Shown while there are no lines at all, such as "Waiting for a runner". */
  readonly emptyState: ReactNode;
  /** Heading content at the start of the header row, such as "Build logs" and a "Show all stages" link. */
  readonly title?: ReactNode;
  /** Search text. Pass it with `onQueryChange` to keep the search in the URL. */
  readonly query?: string;
  readonly onQueryChange?: (query: string) => void;
  /**
   * Level filter. The "All" and "Warnings and errors" switch shows when the
   * output has warnings or errors. Pass it with `onLevelChange` to keep it in the URL.
   */
  readonly level?: LogLevelFilter;
  readonly onLevelChange?: (level: LogLevelFilter) => void;
  /** More filters before the search, such as a stage Select. */
  readonly filters?: ReactNode;
  /** Adds a download button for all lines, saved under this file name. */
  readonly downloadName?: string;
  /** Keeps the newest line in view while lines stream in, unless people scroll up. */
  readonly follow?: boolean;
  /** Lines visible before the output scrolls. */
  readonly visibleLines?: number;
  /** Source qualifier after the line count, such as "Runner logs · retained 30 days". */
  readonly footnote?: string;
  /** Content at the end of the footer, such as the run and attempt in a Code. */
  readonly footerEnd?: ReactNode;
  /**
   * `standalone` frames the output on a page. `embedded` fills a CardSection
   * with `padding="flush"`: the header, output, and footer are divided by lines
   * and the output sits on the inset surface without a second border.
   */
  readonly variant?: "standalone" | "embedded";
}

/** Matches font.sm at the 1.8 line height used below. */
const lineHeightPx = 22;

/**
 * Monospaced log output with line numbers, a source column, a level filter,
 * search with match highlights, and a line count. It renders only the lines
 * in view, opens at the first error, and can follow a live stream.
 */
export function LogViewer({
  label,
  lines,
  emptyState,
  title,
  query: controlledQuery,
  onQueryChange,
  level: controlledLevel,
  onLevelChange,
  filters,
  downloadName,
  follow = false,
  visibleLines = 24,
  footnote,
  footerEnd,
  variant = "standalone",
}: LogViewerProps) {
  const [localQuery, setLocalQuery] = useState("");
  const query = controlledQuery ?? localQuery;
  const setQuery = onQueryChange ?? setLocalQuery;
  const [localLevel, setLocalLevel] = useState<LogLevelFilter>("all");
  const level = controlledLevel ?? localLevel;
  const setLevel = onLevelChange ?? setLocalLevel;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isAtEnd, setAtEnd] = useState(true);
  const needle = query.trim().toLowerCase();
  const hasProblems = lines.some((line) => isProblem(line.level));
  const isFiltered = needle !== "" || (hasProblems && level === "problems");
  const matches = lines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(
      ({ line }) =>
        (!hasProblems || level === "all" || isProblem(line.level)) &&
        (needle === "" || line.text.toLowerCase().includes(needle)),
    );
  const virtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => lineHeightPx,
    overscan: 20,
    initialRect: { width: 0, height: visibleLines * lineHeightPx },
  });
  const digits = Math.max(3, String(lines.length).length);
  const sourceWidth = Math.max(0, ...lines.map((line) => line.source?.length ?? 0));
  const firstError = matches.findIndex(({ line }) => line.level === "error");
  const isEmbedded = variant === "embedded";

  // Open failed output at the error line, inside the log box, without moving the page.
  useEffect(() => {
    if (firstError !== -1 && !follow) virtualizer.scrollToIndex(firstError, { align: "center" });
  }, [firstError, follow, virtualizer]);

  useEffect(() => {
    if (follow && isAtEnd && matches.length > 0)
      virtualizer.scrollToIndex(matches.length - 1, { align: "end" });
  }, [follow, isAtEnd, matches.length, virtualizer]);

  if (lines.length === 0)
    return (
      <div {...stylex.props(isEmbedded ? styles.embeddedEmpty : styles.frame)}>{emptyState}</div>
    );

  const countText = isFiltered
    ? `${matches.length.toLocaleString(appLocale)} of ${lines.length.toLocaleString(appLocale)} lines`
    : `${lines.length.toLocaleString(appLocale)} lines`;

  return (
    <div {...stylex.props(styles.root, isEmbedded && styles.rootEmbedded)}>
      <div {...stylex.props(styles.header, isEmbedded && styles.headerEmbedded)}>
        {title === undefined ? null : <div {...stylex.props(styles.title)}>{title}</div>}
        <div {...stylex.props(styles.controls)}>
          {filters}
          {hasProblems ? (
            <SegmentedControl
              size="sm"
              label="Lines"
              value={level}
              onChange={setLevel}
              options={[
                { id: "all", label: "All" },
                { id: "problems", label: "Warnings and errors" },
              ]}
            />
          ) : null}
          <SearchField
            label={`Search ${label.toLowerCase()}`}
            hideLabel
            size="sm"
            placeholder="Find in output"
            value={query}
            onChange={setQuery}
            style={styles.search}
          />
          {follow && !isAtEnd ? (
            <Button
              size="sm"
              intent="ghost"
              onPress={() => {
                setAtEnd(true);
                virtualizer.scrollToIndex(matches.length - 1, { align: "end" });
              }}
            >
              <ArrowDownToLine aria-hidden {...stylex.props(styles.buttonIcon)} />
              Follow output
            </Button>
          ) : null}
          {downloadName === undefined ? null : (
            <Button size="sm" onPress={() => download(lines, downloadName)}>
              <Download aria-hidden {...stylex.props(styles.buttonIcon)} />
              Download
            </Button>
          )}
        </div>
      </div>
      {matches.length === 0 ? (
        <div {...stylex.props(isEmbedded ? styles.embeddedEmpty : styles.frame)}>
          <EmptyState
            title="No lines match"
            description="Change the search or show all lines."
            action={
              <Button
                onPress={() => {
                  setQuery("");
                  setLevel("all");
                }}
              >
                Show all lines
              </Button>
            }
          />
        </div>
      ) : (
        <div
          ref={scrollerRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          onScroll={(event) => {
            const box = event.currentTarget;
            setAtEnd(box.scrollHeight - box.scrollTop - box.clientHeight < lineHeightPx * 2);
          }}
          {...stylex.props(
            isEmbedded ? styles.embeddedOutput : styles.frame,
            styles.scroller,
            styles.scrollerHeight(visibleLines),
          )}
        >
          <div {...stylex.props(styles.canvas(virtualizer.getTotalSize()))}>
            {virtualizer.getVirtualItems().map((item) => {
              const match = matches[item.index];
              if (match === undefined) return null;
              const { line, number } = match;
              return (
                <div
                  key={line.id}
                  ref={virtualizer.measureElement}
                  data-index={item.index}
                  {...stylex.props(
                    styles.line,
                    styles.offset(item.start),
                    line.level === "error" && styles.errorLine,
                    line.level === "warn" && styles.warnLine,
                    line.level === "debug" && styles.debugLine,
                  )}
                >
                  <span aria-hidden {...stylex.props(styles.number, styles.chWidth(digits))}>
                    {number}
                  </span>
                  {line.at === undefined ? null : (
                    <time dateTime={line.at} {...stylex.props(styles.time)}>
                      {formatLogTime(line.at)}
                    </time>
                  )}
                  {sourceWidth === 0 ? null : (
                    <span {...stylex.props(styles.source, styles.chWidth(sourceWidth))}>
                      {line.source}
                    </span>
                  )}
                  <span {...stylex.props(styles.text)}>
                    {line.level === "error" || line.level === "warn" ? (
                      <span {...stylex.props(styles.levelTag)}>
                        {levelLabel[line.level]}
                        <span {...stylex.props(field.hiddenLabel)}>:</span>{" "}
                      </span>
                    ) : null}
                    <Highlight text={line.text} needle={needle} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div aria-live="polite" {...stylex.props(styles.footer, isEmbedded && styles.footerEmbedded)}>
        <span>
          {countText}
          {footnote ? ` · ${footnote}` : null}
        </span>
        {footerEnd === undefined ? null : (
          <span {...stylex.props(styles.footerEnd)}>{footerEnd}</span>
        )}
      </div>
    </div>
  );
}

const levelLabel = { error: "Error", warn: "Warn" } as const;

function isProblem(level: LogLevel | undefined): boolean {
  return level === "warn" || level === "error";
}

function Highlight({ text, needle }: { readonly text: string; readonly needle: string }) {
  if (needle === "") return text;
  const lower = text.toLowerCase();
  const parts: Array<ReactNode> = [];
  let from = 0;
  let at = lower.indexOf(needle);
  while (at !== -1) {
    parts.push(
      <Fragment key={at}>
        {text.slice(from, at)}
        <mark {...stylex.props(styles.mark)}>{text.slice(at, at + needle.length)}</mark>
      </Fragment>,
    );
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  parts.push(text.slice(from));
  return parts;
}

function formatLogTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(appLocale, { timeZone: appTimeZone, hour12: false });
}

function download(lines: ReadonlyArray<LogLine>, fileName: string) {
  const text = lines
    .map((line) =>
      [
        line.at,
        line.level?.toUpperCase(),
        line.source === undefined ? undefined : `[${line.source}]`,
        line.text,
      ]
        .filter((part) => part !== undefined)
        .join(" "),
    )
    .join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  rootEmbedded: { gap: 0 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    flexWrap: "wrap",
  },
  headerEmbedded: {
    paddingBlock: space.sm,
    paddingInline: space.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minWidth: 0,
    fontSize: font.md,
    fontWeight: font.medium,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    flexWrap: "wrap",
    flex: "1",
    justifyContent: "flex-end",
    minWidth: 0,
  },
  search: { flex: "1", minWidth: "12rem", maxWidth: "20rem" },
  buttonIcon: { width: size.iconSm, height: size.iconSm },
  frame: {
    position: "relative",
    backgroundColor: color.inset,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  embeddedOutput: { position: "relative", backgroundColor: color.inset },
  embeddedEmpty: { backgroundColor: color.inset },
  scroller: {
    overflow: "auto",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  scrollerHeight: (lines: number) => ({ height: `${lines * lineHeightPx + 16}px` }),
  canvas: (height: number) => ({
    position: "relative",
    height: `${height + 16}px`,
    minWidth: "32rem",
  }),
  line: {
    position: "absolute",
    top: space.sm,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "baseline",
    gap: space.md,
    paddingInline: space.md,
    fontFamily: font.mono,
    fontSize: font.sm,
    lineHeight: "1.8",
    color: color.text,
  },
  offset: (start: number) => ({ transform: `translateY(${start}px)` }),
  errorLine: { color: color.danger, backgroundColor: color.dangerMuted },
  warnLine: { color: color.warning, backgroundColor: color.warningMuted },
  debugLine: { color: color.textMuted },
  number: {
    flexShrink: 0,
    textAlign: "end",
    color: color.textFaint,
    userSelect: "none",
    fontVariantNumeric: "tabular-nums",
  },
  chWidth: (chars: number) => ({ minWidth: `${chars}ch` }),
  time: {
    flexShrink: 0,
    color: color.textMuted,
    userSelect: "none",
    fontVariantNumeric: "tabular-nums",
  },
  source: { flexShrink: 0, color: color.textMuted, whiteSpace: "nowrap" },
  text: { flex: "1", minWidth: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  levelTag: { fontWeight: font.semibold, textTransform: "uppercase" },
  mark: {
    backgroundColor: color.warningMuted,
    color: "inherit",
    borderRadius: "2px",
    boxShadow: `0 0 0 1px ${color.warningBorder}`,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space.sm,
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  footerEmbedded: {
    minHeight: "2.5rem",
    paddingBlock: space.sm,
    paddingInline: space.lg,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
  footerEnd: { display: "inline-flex", alignItems: "center", gap: space.sm },
});
