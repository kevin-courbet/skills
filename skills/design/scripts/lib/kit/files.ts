// File helpers for the kit commands. They use only the runtime, because the
// CLI runs in any app without an install step.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

// An error that stops a kit command, such as an app folder without a
// package.json. The CLI prints it with exit status 2.
export class KitError extends Error {}

export function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new KitError(`${path} is not valid JSON: ${(error as Error).message}`);
  }
}

// Removes the comments and the trailing commas of a JSONC text. It skips the
// strings, because a tsconfig path such as "@/*" or "src/**/*" holds the
// characters of a comment.
export function readJsonc(path: string): unknown {
  const source = readFileSync(path, "utf8");
  let out = "";
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!;
    if (char === '"') {
      const start = index;
      for (index++; index < source.length && source[index] !== '"'; index++) if (source[index] === "\\") index++;
      out += source.slice(start, index + 1);
    } else if (char === "/" && source[index + 1] === "/") {
      while (index + 1 < source.length && source[index + 1] !== "\n") index++;
    } else if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      if (end === -1) throw new KitError(`${path} has a comment that does not end.`);
      index = end + 1;
    } else out += char;
  }
  try {
    return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
  } catch (error) {
    throw new KitError(`${path} is not valid JSONC: ${(error as Error).message}`);
  }
}

export function fileText(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) if (typeof entry === "string") out[key] = entry;
  return out;
}

// The files under a folder, without node_modules and without dotfiles.
export function walk(dir: string): Array<string> {
  if (!existsSync(dir)) return [];
  const out: Array<string> = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

export function toPosix(path: string): string {
  return path.split(sep).join("/");
}

// The major version of a range, such as "19" for "^19.2.0" and "0.17" for "~0.17.3".
export function majorOf(range: string): string | undefined {
  const match = /(\d+)\.(\d+)/.exec(range);
  if (!match) return undefined;
  return match[1] === "0" ? `0.${match[2]}` : match[1];
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}
