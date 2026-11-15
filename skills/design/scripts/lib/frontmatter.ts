// A strict subset of YAML for note front matter: one `key: value` per line,
// lists as `[a, b, c]`, and `#` comment lines. A small parser keeps the CLI free
// of dependencies and gives an exact line number for each error.

export type FrontValue = string | ReadonlyArray<string>;

export interface FrontMatter {
  readonly values: ReadonlyMap<string, FrontValue>;
  readonly keyLines: ReadonlyMap<string, number>;
  readonly body: string;
  readonly bodyLine: number;
}

export interface FrontMatterError {
  readonly line: number;
  readonly message: string;
}

export type FrontMatterResult =
  | { readonly ok: true; readonly front: FrontMatter; readonly errors: ReadonlyArray<FrontMatterError> }
  | { readonly ok: false; readonly errors: ReadonlyArray<FrontMatterError> };

const plainStart = /^[-?:,[\]{}#&*!|>'"%@`]/;

function parseScalar(raw: string, line: number, errors: FrontMatterError[]): string {
  const value = raw.trim();
  if (value.startsWith('"')) {
    if (!/^"(?:[^"\\]|\\.)*"$/.test(value)) {
      errors.push({ line, message: `unterminated double-quoted value: ${value}` });
      return value;
    }
    return JSON.parse(value) as string;
  }
  if (value.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(value)) {
      errors.push({ line, message: `unterminated single-quoted value: ${value}` });
      return value;
    }
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (plainStart.test(value) || value.includes(": ") || value.includes(" #")) {
    errors.push({ line, message: `quote this value, because YAML reads its characters as syntax: ${value}` });
  }
  return value;
}

export function parseFrontMatter(source: string): FrontMatterResult {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] !== "---") {
    return { ok: false, errors: [{ line: 1, message: "the file must start with front matter: a line with only ---" }] };
  }
  const end = lines.indexOf("---", 1);
  if (end === -1) {
    return { ok: false, errors: [{ line: 1, message: "the front matter has no closing --- line" }] };
  }

  const errors: FrontMatterError[] = [];
  const values = new Map<string, FrontValue>();
  const keyLines = new Map<string, number>();

  for (let index = 1; index < end; index += 1) {
    const lineNumber = index + 1;
    const raw = lines[index]!;
    if (raw.trim() === "" || raw.trimStart().startsWith("#")) continue;
    if (/^\s/.test(raw)) {
      errors.push({ line: lineNumber, message: "indented lines are not supported; write a list on one line as [a, b]" });
      continue;
    }
    const match = /^([a-z][a-z0-9-]*):(?:[ \t]+(.*))?$/.exec(raw.trimEnd());
    if (!match) {
      errors.push({ line: lineNumber, message: `expected "key: value": ${raw}` });
      continue;
    }
    const key = match[1]!;
    const rawValue = (match[2] ?? "").trim();
    if (values.has(key)) {
      errors.push({ line: lineNumber, message: `duplicate key: ${key}` });
      continue;
    }
    if (rawValue === "") {
      errors.push({ line: lineNumber, message: `${key} has no value` });
      continue;
    }
    keyLines.set(key, lineNumber);
    if (rawValue.startsWith("[")) {
      if (!rawValue.endsWith("]")) {
        errors.push({ line: lineNumber, message: `${key}: a list must end with ] on the same line` });
        continue;
      }
      const inner = rawValue.slice(1, -1).trim();
      const items = inner === "" ? [] : inner.split(",").map((item) => item.trim());
      const parsed: string[] = [];
      for (const item of items) {
        if (item === "") {
          errors.push({ line: lineNumber, message: `${key}: the list has an empty item` });
          continue;
        }
        if (/[[\]{}]/.test(item) && !/^["']/.test(item)) {
          errors.push({ line: lineNumber, message: `${key}: a list item cannot contain brackets or braces: ${item}` });
          continue;
        }
        parsed.push(parseScalar(item, lineNumber, errors));
      }
      values.set(key, parsed);
    } else {
      values.set(key, parseScalar(rawValue, lineNumber, errors));
    }
  }

  return {
    ok: true,
    front: { values, keyLines, body: lines.slice(end + 1).join("\n"), bodyLine: end + 2 },
    errors,
  };
}

// Reads the `name` field of a SKILL.md file without a full YAML parse.
export function readSkillName(source: string): string | null {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] !== "---") return null;
  for (let index = 1; index < lines.length && lines[index] !== "---"; index += 1) {
    const match = /^name:\s*(.+)$/.exec(lines[index]!);
    if (match) return match[1]!.trim().replace(/^["']|["']$/g, "");
  }
  return null;
}
