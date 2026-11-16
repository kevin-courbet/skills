// Installs and updates the kit files of an app from the hub kit. The kit lock
// records the hash of each installed file, so that sync can tell a file that
// the hub changed from a file that the app edited.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";
import { escapeRegExp, isRecord, KitError, readJsonc, sha256, toPosix } from "./files.ts";
import { lockName, writeLock, type App, type Kit, type Lock } from "./kit.ts";

export type SyncStatus =
  | "current"
  | "add"
  | "update"
  | "modified"
  | "conflict"
  | "remove"
  | "removed-modified"
  | "move"
  | "move-modified";

export interface SyncEntry {
  readonly path: string;
  // The old path of a kit file that the kit moved to `path`.
  readonly from?: string;
  readonly status: SyncStatus;
  readonly detail: string;
}

export const syncDetails: Record<SyncStatus, string> = {
  current: "Matches the hub kit.",
  add: "Missing in the app.",
  update: "The hub kit changed this file and the app did not.",
  modified: "Edited in the app. Kit files are not edited locally; move the change into the hub kit or an app file.",
  conflict: "Differs from the skill and has no record of a previous sync. Review it, then replace it with --force.",
  remove: "No longer part of the kit and unchanged in the app.",
  "removed-modified": "No longer part of the kit but edited in the app. Review it, then delete it with --force.",
  move: "The kit moved this file. sync deletes the old file, writes the new one, and rewrites the imports of the app.",
  "move-modified":
    "The kit moved this file, but the app edited the old file or has another file at the new path. Review it, then move it with --force.",
};

const forcedStatuses: ReadonlySet<SyncStatus> = new Set(["modified", "conflict", "removed-modified", "move-modified"]);

export function planSync(app: App, kit: Kit): { entries: Array<SyncEntry>; lock: Lock | undefined; moves: Map<string, string> } {
  const { manifest } = kit;
  const { dir: appDir, lock } = app;
  // Only a file that the lock records is a kit file. An app file at an old kit
  // path, such as the button of another UI library, does not move.
  const moves = new Map(Object.entries(manifest.moves).filter(([from]) => lock?.files[from] !== undefined));
  const movedFrom = new Map<string, string>();
  for (const [from, to] of moves) {
    const other = movedFrom.get(to);
    // A kit file that moved twice has two old paths. An app has only one of them.
    if (other !== undefined) throw new KitError(`${join(appDir, lockName(app.useCase.name))} records two old paths of ${to}: ${other} and ${from}. Remove the stale path from the lock.`);
    movedFrom.set(to, from);
  }
  const entries: Array<SyncEntry> = [];
  for (const path of manifest.files) {
    const kitHash = sha256(join(kit.dir, path));
    const target = join(appDir, path);
    const appHash = existsSync(target) ? sha256(target) : undefined;
    const from = movedFrom.get(path);
    if (from !== undefined) {
      const old = join(appDir, from);
      const oldEdited = existsSync(old) && sha256(old) !== lock?.files[from];
      const status: SyncStatus = oldEdited || (appHash !== undefined && appHash !== kitHash) ? "move-modified" : "move";
      entries.push({ path, from, status, detail: syncDetails[status] });
      continue;
    }
    const lockHash = lock?.files[path];
    let status: SyncStatus;
    if (appHash === undefined) status = "add";
    else if (appHash === kitHash) status = "current";
    else if (lockHash === undefined) status = "conflict";
    else if (lockHash === appHash) status = "update";
    else if (lockHash === kitHash) status = "modified";
    else status = "conflict";
    entries.push({ path, status, detail: syncDetails[status] });
  }
  for (const [path, lockHash] of Object.entries(lock?.files ?? {})) {
    if (manifest.files.includes(path) || moves.has(path)) continue;
    const target = join(appDir, path);
    if (!existsSync(target)) continue;
    const status: SyncStatus = sha256(target) === lockHash ? "remove" : "removed-modified";
    entries.push({ path, status, detail: syncDetails[status] });
  }
  return { entries, lock, moves };
}

export interface ImportRewrite {
  readonly file: string;
  readonly line: number;
  readonly from: string;
  readonly to: string;
}

export interface UnsafeImport {
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

// A tsconfig path alias with one trailing "*", such as "@/*" for "./src/*".
interface PathAlias {
  readonly prefix: string;
  readonly target: string;
}

const codeFilePattern = /\.[cm]?[jt]sx?$/;
const quotedLiteral = /(["'`])([^"'`\s]+)\1/g;
// Build output and caches hold copies of the old paths. They are not app code.
const skippedFolders = new Set(["node_modules", ".git", ".output", ".nitro", ".tanstack", ".vinxi", "dist"]);

function stripCodeExtension(path: string): { module: string; extension: string } {
  const match = codeFilePattern.exec(path);
  return match === null ? { module: path, extension: "" } : { module: path.slice(0, match.index), extension: match[0] };
}

function pathAliases(appDir: string): Array<PathAlias> {
  const path = join(appDir, "tsconfig.json");
  if (!existsSync(path)) return [];
  const config = readJsonc(path);
  const options = isRecord(config) ? config.compilerOptions : undefined;
  const paths = isRecord(options) ? options.paths : undefined;
  if (!isRecord(paths)) return [];
  const aliases: Array<PathAlias> = [];
  for (const [key, targets] of Object.entries(paths)) {
    const target = Array.isArray(targets) ? targets[0] : undefined;
    if (!key.endsWith("*") || typeof target !== "string" || !target.endsWith("*")) continue;
    const folder = posix.normalize(target.slice(0, -1) || ".").replace(/\/$/, "");
    aliases.push({ prefix: key.slice(0, -1), target: folder === "." ? "" : folder });
  }
  return aliases.sort((left, right) => right.prefix.length - left.prefix.length);
}

// The app path that a specifier names, relative to the app root, or null when
// the specifier is a package or has no known form.
function resolveSpecifier(file: string, specifier: string, aliases: ReadonlyArray<PathAlias>): { path: string; alias: PathAlias | null } | null {
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return { path: posix.normalize(posix.join(posix.dirname(file), specifier)), alias: null };
  }
  const alias = aliases.find((item) => specifier.startsWith(item.prefix));
  if (alias === undefined) return null;
  return { path: posix.normalize(posix.join(alias.target, specifier.slice(alias.prefix.length))), alias };
}

// The specifier for the new path, in the form of the old one: an alias stays an
// alias, and a relative specifier stays relative.
function formatSpecifier(file: string, path: string, alias: PathAlias | null): string {
  if (alias !== null && (alias.target === "" || path.startsWith(`${alias.target}/`))) {
    return `${alias.prefix}${alias.target === "" ? path : path.slice(alias.target.length + 1)}`;
  }
  const relativePath = posix.relative(posix.dirname(file), path);
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function appCodeFiles(appDir: string, kitPaths: ReadonlySet<string>): Array<string> {
  const out: Array<string> = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (skippedFolders.has(entry)) continue;
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) visit(path);
      else {
        const file = toPosix(relative(appDir, path));
        if (codeFilePattern.test(file) && !kitPaths.has(file)) out.push(file);
      }
    }
  };
  visit(appDir);
  return out.sort();
}

// A pattern that finds an old kit path in any form, such as
// "@/components/ui/button", "../components/ui/", or "lib/motion". A folder that
// no kit file uses now matches as a whole, so that a template literal or a glob
// that names the folder is found too.
function oldPathPattern(moves: ReadonlyMap<string, string>, kitFiles: ReadonlyArray<string>): RegExp {
  const liveFolders = new Set(kitFiles.map((file) => posix.dirname(file)));
  const texts = new Set<string>();
  for (const from of moves.keys()) {
    const folder = posix.dirname(from);
    const text = liveFolders.has(folder) ? stripCodeExtension(from).module : folder;
    texts.add(text.replace(/^src\//, ""));
  }
  const alternatives = [...texts].sort((left, right) => right.length - left.length).map(escapeRegExp);
  return new RegExp(`(?<![\\w-])(?:${alternatives.join("|")})(?![\\w-])`);
}

function isCommentLine(line: string): boolean {
  return /^\s*(?:\/\/|\/\*|\*)/.test(line);
}

// Rewrites each import specifier of the app that names a moved kit file. A
// line that still names an old kit path after the rewrite is unsafe: sync
// cannot know what it does, so a person must change it.
export function planRewrites(appDir: string, moves: ReadonlyMap<string, string>, kitFiles: ReadonlyArray<string>, lock: Lock | undefined) {
  const rewrites: Array<ImportRewrite> = [];
  const unsafe: Array<UnsafeImport> = [];
  const texts = new Map<string, string>();
  if (moves.size === 0) return { rewrites, unsafe, texts };
  const aliases = pathAliases(appDir);
  const modules = new Map([...moves].map(([from, to]) => [stripCodeExtension(from).module, stripCodeExtension(to).module]));
  const kitPaths = new Set([...kitFiles, ...Object.keys(lock?.files ?? {})]);
  const kitFileSet = new Set(kitFiles);
  const exists = (path: string) => kitFileSet.has(path) || (!moves.has(path) && existsSync(join(appDir, path)));
  const resolvesToFile = (path: string) =>
    exists(path) || ["ts", "tsx", "js", "jsx", "mts", "cts", "mjs", "cjs", "index.ts", "index.tsx", "index.js"].some((suffix) => exists(suffix.startsWith("index") ? `${path}/${suffix}` : `${path}.${suffix}`));
  const oldPath = oldPathPattern(moves, kitFiles);
  for (const file of appCodeFiles(appDir, kitPaths)) {
    const lines = readFileSync(join(appDir, file), "utf8").split("\n");
    let changed = false;
    lines.forEach((line, index) => {
      const next = line.replace(quotedLiteral, (whole, quote: string, specifier: string) => {
        const resolved = resolveSpecifier(file, specifier, aliases);
        if (resolved === null) return whole;
        const { module, extension } = stripCodeExtension(resolved.path);
        const target = modules.get(module);
        if (target === undefined) return whole;
        const replacement = formatSpecifier(file, `${target}${extension}`, resolved.alias);
        rewrites.push({ file, line: index + 1, from: specifier, to: replacement });
        return `${quote}${replacement}${quote}`;
      });
      if (next !== line) {
        lines[index] = next;
        changed = true;
      }
      if (isCommentLine(next)) return;
      const rest = next
        .replace(quotedLiteral, (whole, _quote: string, specifier: string) => {
          const resolved = resolveSpecifier(file, specifier, aliases);
          return resolved !== null && resolvesToFile(resolved.path) ? '""' : whole;
        })
        .replace(/(?:^|\s)\/\/.*$/, "");
      if (oldPath.test(rest)) unsafe.push({ file, line: index + 1, text: line.trim() });
    });
    if (changed) texts.set(file, lines.join("\n"));
  }
  return { rewrites, unsafe, texts };
}

function removeEmptyFolders(appDir: string, paths: Iterable<string>) {
  for (const path of paths) {
    let dir = posix.dirname(path);
    while (dir !== "." && dir !== "src") {
      const absolute = join(appDir, dir);
      if (!existsSync(absolute) || readdirSync(absolute).length > 0) break;
      rmdirSync(absolute);
      dir = posix.dirname(dir);
    }
  }
}

export interface SyncResult {
  readonly entries: ReadonlyArray<SyncEntry>;
  readonly applied: ReadonlyArray<SyncEntry>;
  readonly pending: ReadonlyArray<SyncEntry>;
  readonly rewrites: ReadonlyArray<ImportRewrite>;
  readonly unsafe: ReadonlyArray<UnsafeImport>;
  readonly written: boolean;
}

export function runSync(app: App, kit: Kit, write: boolean, force: boolean): SyncResult {
  const appDir = app.dir;
  if (!existsSync(join(appDir, "package.json"))) throw new KitError(`${appDir} has no package.json.`);
  const { manifest } = kit;
  const { entries, lock, moves } = planSync(app, kit);
  const { rewrites, unsafe, texts } = planRewrites(appDir, moves, manifest.files, lock);
  const changes = entries.filter((entry) => entry.status !== "current");
  // A move rewrites the imports of the app, so it is all or nothing: a part of
  // the moves leaves imports that point to files that do not exist.
  if (moves.size > 0 && (!write || unsafe.length > 0 || (!force && changes.some((entry) => forcedStatuses.has(entry.status))))) {
    return { entries, applied: [], pending: changes, rewrites, unsafe, written: false };
  }
  const nextLock: Record<string, string> = { ...lock?.files };
  const applied: Array<SyncEntry> = [];
  const pending: Array<SyncEntry> = [];
  const removed: Array<string> = [];
  for (const entry of entries) {
    if (entry.status === "current") {
      nextLock[entry.path] = sha256(join(appDir, entry.path));
      continue;
    }
    if (!write || (forcedStatuses.has(entry.status) && !force)) {
      pending.push(entry);
      continue;
    }
    const target = join(appDir, entry.path);
    if (entry.status === "remove" || entry.status === "removed-modified") {
      rmSync(target);
      delete nextLock[entry.path];
      removed.push(entry.path);
    } else {
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(kit.dir, entry.path), target);
      nextLock[entry.path] = sha256(target);
      if (entry.from !== undefined) {
        rmSync(join(appDir, entry.from), { force: true });
        delete nextLock[entry.from];
        removed.push(entry.from);
      }
    }
    applied.push(entry);
  }
  if (write) {
    for (const [file, text] of texts) writeFileSync(join(appDir, file), text);
    removeEmptyFolders(appDir, removed);
    writeLock(appDir, app.useCase.name, nextLock);
  }
  return { entries, applied, pending, rewrites, unsafe, written: write };
}
