import { spawnSync } from "node:child_process";
import { join } from "node:path";
import type { Graph, Problem, Section, SkillSource } from "./graph.ts";
import { countWords, slugify } from "./text.ts";

// A search entry is a document that a member skill owns outside the note
// graph, such as the docs of one component of a kit. The member prints its
// entries on request, so that they match the project in the working folder.
export interface Entry {
  readonly id: string;
  // What the entry is, such as "component".
  readonly kind: string;
  // A short qualifier that search prints after the kind, such as "pattern".
  readonly label: string;
  readonly title: string;
  readonly summary: string;
  readonly keywords: ReadonlyArray<string>;
  readonly intro: string;
  readonly sections: ReadonlyArray<Section>;
  // The ids of the design notes that the entry applies.
  readonly links: ReadonlyArray<string>;
  // The command that prints the full entry.
  readonly read: string;
  readonly skill: SkillSource;
}

export interface EntrySource {
  readonly skill: SkillSource;
  // One line that tells where the entries come from, such as an app folder.
  readonly source: string;
  readonly count: number;
  // The command that prints one entry, with {id} for the entry id.
  readonly read: string;
}

export interface EntrySet {
  readonly entries: ReadonlyArray<Entry>;
  readonly sources: ReadonlyArray<EntrySource>;
  readonly problems: ReadonlyArray<Problem>;
}

export function isEntry(value: object): value is Entry {
  return "read" in value && "kind" in value;
}

// An entry id starts with a capital letter, so that it never equals a note
// id, which is lowercase.
const ENTRY_ID = /^[A-Z][A-Za-z0-9]*$/;

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function strings(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? (value as string[]) : null;
}

function parseOutput(skill: SkillSource, file: string, stdout: string, problems: Problem[]): { entries: Entry[]; source: string; read: string } {
  let data: unknown;
  try {
    data = JSON.parse(stdout);
  } catch (error) {
    problems.push({ file, message: `the entries command of "${skill.name}" did not print JSON: ${(error as Error).message}` });
    return { entries: [], source: "", read: "" };
  }
  const record = typeof data === "object" && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  const read = text(record?.["read"]);
  const source = text(record?.["source"]);
  const items = record?.["entries"];
  if (!record || read === null || !read.includes("{id}") || source === null || !Array.isArray(items)) {
    problems.push({
      file,
      message: `the entries command of "${skill.name}" must print { "read": "<command with {id}>", "source": "<line>", "entries": [...], "problems": [...] }`,
    });
    return { entries: [], source: "", read: "" };
  }
  for (const item of strings(record["problems"]) ?? []) problems.push({ file, message: `${skill.name}: ${item}` });

  const entries: Entry[] = [];
  items.forEach((raw, index) => {
    const item = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    const id = text(item["id"]);
    const kind = text(item["kind"]);
    const summary = text(item["summary"]);
    const keywords = strings(item["keywords"]);
    const links = strings(item["links"]) ?? [];
    const rawSections = Array.isArray(item["sections"]) ? item["sections"] : [];
    if (id === null || !ENTRY_ID.test(id) || kind === null || summary === null || keywords === null) {
      problems.push({ file, message: `${skill.name}: entry ${index + 1} needs an "id" in PascalCase, a "kind", a "summary", and "keywords"` });
      return;
    }
    const sections: Section[] = [];
    for (const section of rawSections) {
      const title = text((section as Record<string, unknown>)?.["title"]);
      const body = text((section as Record<string, unknown>)?.["text"]);
      if (title === null || body === null) {
        problems.push({ file, message: `${skill.name}: a section of the entry ${id} needs a "title" and a "text"` });
        continue;
      }
      sections.push({ title, slug: slugify(title), text: body, words: countWords(body), line: 0 });
    }
    entries.push({
      id,
      kind,
      label: text(item["label"]) ?? "",
      title: text(item["title"]) ?? id,
      summary,
      keywords,
      intro: text(item["intro"]) ?? "",
      sections,
      links,
      read: read.replaceAll("{id}", id),
      skill,
    });
  });
  return { entries, source, read };
}

function runCommand(skill: SkillSource, command: ReadonlyArray<string>, cwd: string, problems: Problem[]) {
  const file = join(skill.dir, command[0]!);
  // The member script runs with the runtime that runs this CLI, so that a
  // member needs no executable bit and no shell.
  const result = spawnSync(process.execPath, [file, ...command.slice(1)], { cwd, encoding: "utf8", timeout: 20_000 });
  if (result.error) {
    problems.push({ file, message: `the entries command of "${skill.name}" did not run: ${result.error.message}` });
    return null;
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout).trim().split("\n").slice(0, 5).join("\n");
    problems.push({ file, message: `the entries command of "${skill.name}" failed with exit status ${result.status}: ${detail}` });
    return null;
  }
  return { file, stdout: result.stdout };
}

const loaded = new WeakMap<Graph, Map<string, EntrySet>>();

// Runs the entries command of each member in the folder `cwd`. A member finds
// its project from that folder.
export function loadEntries(graph: Graph, cwd: string): EntrySet {
  const cache = loaded.get(graph) ?? new Map<string, EntrySet>();
  loaded.set(graph, cache);
  const cached = cache.get(cwd);
  if (cached) return cached;

  const entries: Entry[] = [];
  const sources: EntrySource[] = [];
  const problems: Problem[] = [];
  for (const skill of graph.skills) {
    if (skill.entries === null) continue;
    const output = runCommand(skill, skill.entries, cwd, problems);
    if (!output) continue;
    const parsed = parseOutput(skill, output.file, output.stdout, problems);
    sources.push({ skill, source: parsed.source, count: parsed.entries.length, read: parsed.read });
    entries.push(...parsed.entries);
  }

  const ids = new Map<string, Entry>();
  for (const entry of entries) {
    const key = entry.id.toLowerCase();
    const other = ids.get(key);
    if (other) problems.push({ file: join(entry.skill.dir, entry.skill.entries![0]!), message: `the entry id "${entry.id}" of "${entry.skill.name}" is also an entry of "${other.skill.name}"` });
    ids.set(key, entry);
  }
  const set = { entries, sources, problems };
  cache.set(cwd, set);
  return set;
}

export function findEntry(set: EntrySet, id: string): Entry | undefined {
  return set.entries.find((entry) => entry.id === id);
}

// The entries that apply a note, such as the components that implement a form rule.
export function entriesFor(set: EntrySet, noteId: string): Entry[] {
  return set.entries.filter((entry) => entry.links.includes(noteId));
}
