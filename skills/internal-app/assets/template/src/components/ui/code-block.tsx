// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { ChevronDown, WrapText } from "lucide-react";
import { Fragment, type ReactNode, useId, useState } from "react";
import { Button, ToggleButton } from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { CopyButton } from "./copy-button";
import { field } from "./field";

export type CodeLanguage = "ts" | "tsx" | "js" | "json" | "sh" | "sql" | "yaml" | "diff" | "text";

/** Line numbers and inclusive ranges, 1-based: `[3, [7, 9]]`. */
export type CodeLineSpec = ReadonlyArray<number | readonly [number, number]>;

export interface CodeDiagnostic {
  readonly line: number;
  readonly level: "error" | "warning";
  readonly message: string;
}

export interface CodeBlockProps {
  readonly code: string;
  /** Highlighting grammar. `text` shows plain output, such as terminal logs. */
  readonly language?: CodeLanguage;
  /** File name or command in the header, such as "billing.yaml". */
  readonly title?: string;
  /** Names the code region for screen readers. It defaults to the title. */
  readonly label?: string;
  /** Shows line numbers. On by default for more than one line. */
  readonly showLineNumbers?: boolean;
  /** Number of the first line, for an excerpt of a longer file. */
  readonly startLine?: number;
  readonly highlightedLines?: CodeLineSpec;
  /** Added and removed lines. With `language="diff"`, the +/- prefixes mark them instead. */
  readonly diff?: { readonly added?: CodeLineSpec; readonly removed?: CodeLineSpec };
  /** Error and warning lines with their message under the line, such as config validation. */
  readonly diagnostics?: ReadonlyArray<CodeDiagnostic>;
  /** Wraps long lines instead of scrolling. The header has a toggle. */
  readonly defaultWrap?: boolean;
  /** Collapses longer code to this many lines with a "Show all" button. */
  readonly maxLines?: number;
  /** Header content before the wrap and copy buttons, such as diagnostic counts. */
  readonly headerActions?: ReactNode;
  /**
   * `standalone` frames the code on a page. `embedded` drops the border for a
   * CardSection with `padding="flush"` or a Trace step.
   */
  readonly variant?: "standalone" | "embedded";
  readonly style?: StyleXStyles;
}

/**
 * Read-only code, config, or command output with syntax colors, line numbers,
 * a copy button, and a wrap toggle. Marks added, removed, highlighted, and
 * failing lines. Use LogViewer for long or streaming logs.
 */
export function CodeBlock({
  code,
  language = "text",
  title,
  label,
  showLineNumbers,
  startLine = 1,
  highlightedLines,
  diff,
  diagnostics = [],
  defaultWrap = false,
  maxLines,
  headerActions,
  variant = "standalone",
  style,
}: CodeBlockProps) {
  const [wrap, setWrap] = useState(defaultWrap);
  const [isExpanded, setExpanded] = useState(false);
  const regionId = useId();
  const lines = tokenize(code, language);
  const withNumbers = showLineNumbers ?? lines.length > 1;
  const isCollapsible = maxLines !== undefined && lines.length > maxLines;
  const visible = isCollapsible && !isExpanded ? lines.slice(0, maxLines) : lines;
  const highlighted = expandSpec(highlightedLines);
  const added = expandSpec(diff?.added);
  const removed = expandSpec(diff?.removed);
  const digits = String(startLine + lines.length - 1).length;
  const regionLabel = label ?? title ?? "Code";
  // Without a title or header actions, the buttons pin to the top corner instead of taking a row.
  const hasHeader = title !== undefined || headerActions !== undefined;

  return (
    <div {...stylex.props(styles.root, variant === "standalone" && styles.standalone, style)}>
      <div {...stylex.props(hasHeader ? styles.header : styles.pinned)}>
        {title === undefined ? null : <span {...stylex.props(styles.title)}>{title}</span>}
        {!hasHeader || language === "text" || language === "diff" ? null : (
          <span {...stylex.props(styles.language)}>{languageLabel[language]}</span>
        )}
        <div {...stylex.props(styles.headerActions)}>
          {headerActions}
          <ToggleButton
            isSelected={wrap}
            onChange={setWrap}
            aria-label="Wrap long lines"
            {...renderStyles<{ isSelected: boolean }>((state) => [
              styles.iconButton,
              state.isSelected && styles.iconButtonOn,
            ])}
          >
            <WrapText aria-hidden {...stylex.props(styles.icon)} />
          </ToggleButton>
          <CopyButton value={code} label={`Copy ${title ?? "code"}`} />
        </div>
      </div>
      <pre
        id={regionId}
        role="region"
        aria-label={regionLabel}
        tabIndex={0}
        {...stylex.props(styles.pre, wrap && styles.preWrap)}
      >
        <code {...stylex.props(styles.code, !wrap && styles.codeNoWrap)}>
          {visible.map((tokens, index) => {
            const number = startLine + index;
            const prefix = language === "diff" ? lineText(tokens).charAt(0) : "";
            const kind = lineKind(number, prefix, added, removed, highlighted);
            const lineDiagnostics = diagnostics.filter((item) => item.line === number);
            const level = lineDiagnostics.some((item) => item.level === "error")
              ? "error"
              : lineDiagnostics[0]?.level;
            return (
              <Fragment key={number}>
                <span
                  {...stylex.props(
                    styles.line,
                    !hasHeader && index === 0 && styles.linePinned,
                    kind !== undefined && lineKinds[kind],
                    level !== undefined && lineKinds[level],
                  )}
                >
                  {withNumbers ? (
                    <span aria-hidden {...stylex.props(styles.number, styles.digits(digits))}>
                      {number}
                    </span>
                  ) : null}
                  {kind === "added" || kind === "removed" ? (
                    <span {...stylex.props(field.hiddenLabel)}>
                      {kind === "added" ? "Added: " : "Removed: "}
                    </span>
                  ) : null}
                  <span {...stylex.props(styles.text)}>
                    {tokens.length === 0
                      ? " "
                      : tokens.map((token, tokenIndex) => (
                          <span
                            key={tokenIndex}
                            {...stylex.props(
                              token.kind === "plain" ? null : tokenColors[token.kind],
                            )}
                          >
                            {token.text}
                          </span>
                        ))}
                  </span>
                </span>
                {lineDiagnostics.map((item) => (
                  <span
                    key={item.message}
                    {...stylex.props(styles.diagnostic, diagnosticTones[item.level])}
                  >
                    {withNumbers ? (
                      <span aria-hidden {...stylex.props(styles.number, styles.digits(digits))} />
                    ) : null}
                    <span {...stylex.props(styles.diagnosticText)}>
                      {item.level === "error" ? "Error" : "Warning"}: {item.message}
                    </span>
                  </span>
                ))}
              </Fragment>
            );
          })}
        </code>
      </pre>
      {isCollapsible ? (
        <Button
          aria-controls={regionId}
          aria-expanded={isExpanded}
          onPress={() => setExpanded(!isExpanded)}
          {...stylex.props(styles.expand)}
        >
          <ChevronDown aria-hidden {...stylex.props(styles.icon, isExpanded && styles.flip)} />
          {isExpanded ? "Show fewer lines" : `Show all ${lines.length} lines`}
        </Button>
      ) : null}
    </div>
  );
}

const languageLabel: Record<Exclude<CodeLanguage, "text" | "diff">, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  json: "JSON",
  sh: "Shell",
  sql: "SQL",
  yaml: "YAML",
};

type LineKind = "added" | "removed" | "highlight" | "hunk";

function lineKind(
  number: number,
  prefix: string,
  added: ReadonlySet<number>,
  removed: ReadonlySet<number>,
  highlighted: ReadonlySet<number>,
): LineKind | undefined {
  if (prefix === "+" || added.has(number)) return "added";
  if (prefix === "-" || removed.has(number)) return "removed";
  if (prefix === "@") return "hunk";
  if (highlighted.has(number)) return "highlight";
  return undefined;
}

function expandSpec(spec: CodeLineSpec | undefined): ReadonlySet<number> {
  const set = new Set<number>();
  for (const entry of spec ?? []) {
    if (typeof entry === "number") set.add(entry);
    else for (let line = entry[0]; line <= entry[1]; line += 1) set.add(line);
  }
  return set;
}

type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "key"
  | "function"
  | "variable"
  | "punctuation";

interface Token {
  readonly kind: TokenKind;
  readonly text: string;
}

interface Grammar {
  readonly pattern: RegExp;
  readonly kinds: ReadonlyArray<TokenKind>;
}

const jsKeywords =
  "abstract|as|async|await|break|case|catch|class|const|continue|default|delete|do|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|null|of|private|protected|public|readonly|return|satisfies|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|yield";

const sqlKeywords =
  "add|all|alter|and|as|asc|begin|between|by|case|commit|create|delete|desc|distinct|drop|else|end|exists|explain|false|from|group|having|if|in|index|inner|insert|into|is|join|left|like|limit|not|null|offset|on|or|order|outer|primary|references|returning|right|rollback|select|set|table|then|true|union|unique|update|using|values|when|where|with";

const shKeywords =
  "case|do|done|elif|else|esac|export|fi|for|function|if|in|local|return|then|until|while";

/**
 * One alternation per grammar, tried in order at each position. The capture
 * group that matched names the token kind; unmatched text stays plain.
 */
const grammars: Record<"ts" | "json" | "sh" | "sql" | "yaml", Grammar> = {
  ts: {
    pattern: new RegExp(
      `(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\`)|(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)|\\b(${jsKeywords})\\b|([A-Za-z_$][\\w$]*)(?=\\s*\\()|([{}()[\\];,.<>=:+\\-*/!?&|])`,
      "gy",
    ),
    kinds: ["comment", "string", "number", "keyword", "function", "punctuation"],
  },
  json: {
    pattern:
      /("(?:\\.|[^"\\\n])*")(?=\s*:)|("(?:\\.|[^"\\\n])*")|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b|([{}[\],:])/gy,
    kinds: ["key", "string", "number", "keyword", "punctuation"],
  },
  sh: {
    pattern: new RegExp(
      `(#[^\\n]*)|("(?:\\\\.|[^"\\\\])*"|'[^']*')|(\\$\\{?[\\w@#?*!-]+\\}?)|(\\s--?[\\w-]+)|\\b(${shKeywords})\\b|([|&;<>()])`,
      "gy",
    ),
    kinds: ["comment", "string", "variable", "key", "keyword", "punctuation"],
  },
  sql: {
    pattern: new RegExp(
      `(--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|('(?:''|[^'])*')|(\\b\\d+(?:\\.\\d+)?\\b)|\\b(${sqlKeywords})\\b|([A-Za-z_][\\w]*)(?=\\s*\\()|([(),;.*=<>])`,
      "giy",
    ),
    kinds: ["comment", "string", "number", "keyword", "function", "punctuation"],
  },
  yaml: {
    pattern:
      /(#[^\n]*)|^(\s*-?\s*[\w.-]+)(?=\s*:)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(\b\d+(?:\.\d+)?\b)|\b(true|false|null|yes|no)\b|([:\-|>[\]{},])/gmy,
    kinds: ["comment", "key", "string", "number", "keyword", "punctuation"],
  },
};

function grammarFor(language: CodeLanguage): Grammar | undefined {
  if (language === "text" || language === "diff") return undefined;
  if (language === "tsx" || language === "js") return grammars.ts;
  return grammars[language];
}

/** Splits code into lines of colored tokens. Unknown text stays plain. */
function tokenize(code: string, language: CodeLanguage): ReadonlyArray<ReadonlyArray<Token>> {
  const grammar = grammarFor(language);
  const tokens: Array<Token> = [];
  if (grammar === undefined) tokens.push({ kind: "plain", text: code });
  else {
    const pattern = new RegExp(grammar.pattern.source, grammar.pattern.flags);
    let plain = "";
    let at = 0;
    while (at < code.length) {
      pattern.lastIndex = at;
      const match = pattern.exec(code);
      if (match === null || match[0] === "") {
        plain += code.charAt(at);
        at += 1;
        continue;
      }
      if (plain !== "") tokens.push({ kind: "plain", text: plain });
      plain = "";
      const group = match.slice(1).findIndex((value) => value !== undefined);
      tokens.push({ kind: grammar.kinds[group] ?? "plain", text: match[0] });
      at += match[0].length;
    }
    if (plain !== "") tokens.push({ kind: "plain", text: plain });
  }
  const lines: Array<Array<Token>> = [[]];
  for (const token of tokens) {
    token.text.split("\n").forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part !== "") lines[lines.length - 1]?.push({ kind: token.kind, text: part });
    });
  }
  return lines;
}

function lineText(tokens: ReadonlyArray<Token>): string {
  return tokens.map((token) => token.text).join("");
}

const styles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: color.inset,
    borderRadius: radius.md,
  },
  standalone: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: "2.25rem",
    paddingInlineStart: space.md,
    paddingInlineEnd: space.xs,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  pinned: {
    position: "absolute",
    top: space.xs,
    insetInlineEnd: space.xs,
    zIndex: 1,
    display: "flex",
    padding: "2px",
    borderRadius: radius.md,
    backgroundColor: color.inset,
  },
  title: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: font.mono,
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.text,
  },
  language: { flexShrink: 0, fontSize: font.xs, color: color.textMuted },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    marginInlineStart: "auto",
    flexShrink: 0,
  },
  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    padding: 0,
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: { default: color.textMuted, ":hover": color.text },
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  iconButtonOn: { backgroundColor: color.selected, color: color.accentText },
  icon: { width: size.iconSm, height: size.iconSm, flexShrink: 0 },
  flip: { transform: "rotate(180deg)" },
  pre: {
    margin: 0,
    paddingBlock: space.sm,
    overflowX: "auto",
    fontFamily: font.mono,
    fontSize: font.sm,
    lineHeight: "1.7",
    color: color.text,
    tabSize: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  linePinned: { paddingInlineEnd: "3.75rem" },
  preWrap: { overflowX: "hidden", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  code: { display: "grid", minWidth: "100%", fontFamily: "inherit" },
  codeNoWrap: { width: "max-content" },
  line: {
    display: "flex",
    paddingInline: space.md,
    borderInlineStartWidth: "2px",
    borderInlineStartStyle: "solid",
    borderInlineStartColor: "transparent",
  },
  number: {
    flexShrink: 0,
    marginInlineEnd: space.md,
    textAlign: "end",
    color: color.textFaint,
    userSelect: "none",
    fontVariantNumeric: "tabular-nums",
  },
  digits: (digits: number) => ({ minWidth: `${digits}ch` }),
  text: { flex: "1", minWidth: 0, whiteSpace: "inherit" },
  diagnostic: {
    display: "flex",
    paddingInline: space.md,
    paddingBlock: "2px",
    fontFamily: font.sans,
    fontSize: font.sm,
    borderInlineStartWidth: "2px",
    borderInlineStartStyle: "solid",
  },
  diagnosticText: { flex: "1", minWidth: 0, whiteSpace: "normal" },
  expand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    width: "100%",
    minHeight: "2rem",
    borderStyle: "none",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.textMuted,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
});

const lineKinds = stylex.create({
  added: { backgroundColor: color.successMuted, borderInlineStartColor: color.success },
  removed: { backgroundColor: color.dangerMuted, borderInlineStartColor: color.danger },
  highlight: { backgroundColor: color.selected, borderInlineStartColor: color.accent },
  hunk: { color: color.info },
  error: { backgroundColor: color.dangerMuted, borderInlineStartColor: color.danger },
  warning: { backgroundColor: color.warningMuted, borderInlineStartColor: color.warning },
});

const diagnosticTones = stylex.create({
  error: {
    color: color.danger,
    backgroundColor: color.dangerMuted,
    borderInlineStartColor: color.danger,
  },
  warning: {
    color: color.warning,
    backgroundColor: color.warningMuted,
    borderInlineStartColor: color.warning,
  },
});

const tokenColors = stylex.create({
  comment: { color: color.textFaint, fontStyle: "italic" },
  string: { color: color.success },
  number: { color: color.warning },
  keyword: { color: color.accentText },
  key: { color: color.info },
  function: { color: color.info },
  variable: { color: color.info },
  punctuation: { color: color.textMuted },
});
