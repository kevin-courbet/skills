// The kit of the design skill and the use cases that build apps on it. The kit
// files live in assets/kit of the hub. A use case is a member skill with an
// "app" block in its design-graph.json: the template that a new app starts
// from, an optional lab of recipe pages, and optional rules.
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { AppConfig, Graph, SkillSource } from "../graph.ts";
import { appKitSource, hubKitSource, type KitSource } from "./docs.ts";
import { isRecord, KitError, readJson, stringRecord } from "./files.ts";

export interface Manifest {
  readonly files: ReadonlyArray<string>;
  // Path prefixes of the kit files that must start with a doc comment.
  readonly docs: ReadonlyArray<string>;
  // The old path and the new path of each kit file that the kit moved. An app
  // can be several kit versions behind, so the entries stay.
  readonly moves: Readonly<Record<string, string>>;
  readonly forbiddenDependencies: ReadonlyArray<string>;
  readonly forbiddenDependencyPrefixes: ReadonlyArray<string>;
  // The app files that kit files import, and the names that each must export.
  // The template of each use case supplies them.
  readonly appContract: Readonly<Record<string, ReadonlyArray<string>>>;
}

export interface Kit {
  // The folder with the kit files, at their app paths.
  readonly dir: string;
  readonly manifestPath: string;
  readonly manifest: Manifest;
}

export interface UseCase {
  readonly name: string;
  readonly skill: SkillSource;
  readonly app: AppConfig;
}

const MANIFEST_KEYS = ["files", "docs", "moves", "forbiddenDependencies", "forbiddenDependencyPrefixes", "appContract"] as const;

function stringList(value: unknown): value is ReadonlyArray<string> {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function readKit(hubDir: string): Kit {
  const manifestPath = join(hubDir, "assets", "kit.json");
  const dir = join(hubDir, "assets", "kit");
  if (!existsSync(manifestPath)) throw new KitError(`the design skill has no kit manifest at ${manifestPath}`);
  const value = readJson(manifestPath);
  if (!isRecord(value)) throw new KitError(`${manifestPath} must hold a JSON object`);
  const missing = MANIFEST_KEYS.filter((key) => value[key] === undefined);
  if (missing.length > 0) throw new KitError(`${manifestPath} has no ${missing.join(", ")}`);
  if (!stringList(value.files) || !stringList(value.docs) || !stringList(value.forbiddenDependencies) || !stringList(value.forbiddenDependencyPrefixes)) {
    throw new KitError(`${manifestPath}: files, docs, forbiddenDependencies, and forbiddenDependencyPrefixes must be lists of strings`);
  }
  if (!isRecord(value.moves) || !Object.values(value.moves).every((item) => typeof item === "string")) {
    throw new KitError(`${manifestPath}: moves must map an old path to a new path`);
  }
  if (!isRecord(value.appContract) || !Object.values(value.appContract).every(stringList)) {
    throw new KitError(`${manifestPath}: appContract must map an app file to the names that it exports`);
  }
  const manifest = value as unknown as Manifest;
  const files = new Set(manifest.files);
  for (const [from, to] of Object.entries(manifest.moves)) {
    if (files.has(from) || !files.has(to)) {
      throw new KitError(`${manifestPath}: the move from ${from} to ${to} must start at a path that is not a kit file and end at a kit file`);
    }
  }
  return { dir, manifestPath, manifest };
}

export function useCases(graph: Graph): UseCase[] {
  return graph.skills.flatMap((skill) => (skill.app === null ? [] : [{ name: skill.name, skill, app: skill.app }]));
}

function useCaseNames(cases: ReadonlyArray<UseCase>): string {
  return cases.length === 0 ? "none is installed" : cases.map((item) => item.name).join(", ");
}

export function findUseCase(cases: ReadonlyArray<UseCase>, name: string): UseCase {
  const found = cases.find((item) => item.name === name);
  if (found) return found;
  throw new KitError(`"${name}" is not a use case of the design skill. The use cases: ${useCaseNames(cases)}. A use case is a skill next to design with an "app" block in its design-graph.json`);
}

// ------------------------------------------------------------ the kit lock

// The kit lock of an app records the hash of each installed kit file. Its name
// tells the use case of the app, such as internal-app.kit.json.
export function lockName(useCase: string): string {
  return `${useCase}.kit.json`;
}

const LOCK_FILE = /^([a-z][a-z0-9-]*)\.kit\.json$/;

export interface Lock {
  readonly useCase: string;
  readonly files: Readonly<Record<string, string>>;
}

export function readLock(appDir: string, useCase: string): Lock | undefined {
  const path = join(appDir, lockName(useCase));
  if (!existsSync(path)) return undefined;
  const value = readJson(path);
  if (!isRecord(value) || value.kit !== useCase || !isRecord(value.files)) {
    throw new KitError(`${path} is not a kit lock of the use case ${useCase}: it must hold { "kit": "${useCase}", "files": { ... } }`);
  }
  return { useCase, files: stringRecord(value.files) };
}

export function writeLock(appDir: string, useCase: string, files: Record<string, string>) {
  const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(appDir, lockName(useCase)), `${JSON.stringify({ kit: useCase, files: sorted }, null, 2)}\n`);
}

// The use cases of the kit locks in one folder.
function locksIn(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const match = LOCK_FILE.exec(name);
    return match ? [match[1]!] : [];
  });
}

export interface App {
  readonly dir: string;
  readonly useCase: UseCase;
  readonly lock: Lock | undefined;
}

// The use case of the kit lock in a folder. A folder with two locks, or with
// the lock of a use case that is not installed, is an error, because each
// command would then read the wrong rules or the wrong template.
function lockedUseCase(dir: string, cases: ReadonlyArray<UseCase>): UseCase | null {
  const names = locksIn(dir);
  if (names.length === 0) return null;
  if (names.length > 1) throw new KitError(`${dir} has the kit locks of several use cases: ${names.map(lockName).join(", ")}. Keep only the lock of the use case of the app`);
  const name = names[0]!;
  const found = cases.find((item) => item.name === name);
  if (!found) {
    throw new KitError(`${join(dir, lockName(name))} names the use case ${name}, but no installed skill has that use case (${useCaseNames(cases)}). Install the ${name} skill next to the design skill`);
  }
  return found;
}

// The app root for sync, check, and doctor: the folder itself, not a parent,
// because these commands write and audit one app. The use case comes from the
// kit lock, or from --app for an app that has no lock yet.
export function resolveApp(dir: string, appFlag: string | undefined, cases: ReadonlyArray<UseCase>): App {
  const locked = lockedUseCase(dir, cases);
  if (locked !== null && appFlag !== undefined && appFlag !== locked.name) {
    throw new KitError(`--app ${appFlag} does not agree with the kit lock ${lockName(locked.name)} of the app at ${dir}`);
  }
  const useCase = locked ?? (appFlag === undefined ? null : findUseCase(cases, appFlag));
  if (useCase === null) {
    throw new KitError(`${dir} has no kit lock, so the use case of the app is not known. Give it with --app <use case>. The use cases: ${useCaseNames(cases)}`);
  }
  return { dir, useCase, lock: readLock(dir, useCase.name) };
}

// The nearest app from a folder upward: the first folder with a kit lock.
export function findApp(start: string, cases: ReadonlyArray<UseCase>): App | null {
  let dir = resolve(start);
  for (;;) {
    const useCase = lockedUseCase(dir, cases);
    if (useCase !== null) return { dir, useCase, lock: readLock(dir, useCase.name) };
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// ------------------------------------------------------------ the docs source

export interface DocsSource {
  readonly kit: KitSource;
  readonly app: App | null;
  // Where the docs come from, as a phrase that follows "Source:".
  readonly phrase: string;
}

// The docs of the kit that an agent builds with: the installed kit of the app
// in the folder, or the hub kit outside an app.
export function docsSource(start: string, kit: Kit, cases: ReadonlyArray<UseCase>): DocsSource {
  const app = findApp(start, cases);
  if (app === null) {
    return {
      kit: hubKitSource(kit.dir, kit.manifest),
      app: null,
      phrase: `the hub kit at ${kit.dir}, because no folder from ${resolve(start)} upward has a kit lock (<use case>.kit.json). An app can have an older kit.`,
    };
  }
  if (app.lock === undefined) throw new KitError(`${app.dir} has no kit lock`);
  return {
    kit: appKitSource(app.dir, Object.keys(app.lock.files), kit.manifest),
    app,
    phrase: `the installed kit of the ${app.useCase.name} app at ${app.dir}.`,
  };
}

// The hub kit, which graph --check validates in any folder.
export function hubDocsSource(kit: Kit): DocsSource {
  return { kit: hubKitSource(kit.dir, kit.manifest), app: null, phrase: `the hub kit at ${kit.dir}.` };
}
