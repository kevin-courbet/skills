import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { parseFrontMatter, readSkillName, type FrontValue } from "./frontmatter.ts";
import { countWords, slugify, unique } from "./text.ts";

export const HUB_SKILL = "design";
export const MEMBERSHIP_FILE = "design-graph.json";
export const NOTE_WORD_LIMIT = 1000;
export const SKILL_WORD_LIMIT = 900;
export const FRONT_LINK_TYPES = ["requires", "related", "specializes"] as const;
export type FrontLinkType = (typeof FRONT_LINK_TYPES)[number];
export type LinkType = FrontLinkType | "mentions";

const ALLOWED_KEYS = new Set(["id", "topic", "summary", "keywords", ...FRONT_LINK_TYPES]);
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TARGET = /^(?:skill:([a-z0-9]+(?:-[a-z0-9]+)*)|([a-z0-9]+(?:-[a-z0-9]+)*)(?:#([a-z0-9]+(?:-[a-z0-9]+)*))?)$/;

export interface Target {
  readonly kind: "note" | "skill";
  readonly id: string;
  readonly section?: string;
}

export interface Link extends Target {
  readonly type: LinkType;
  readonly raw: string;
  readonly line: number;
}

export interface Section {
  readonly title: string;
  readonly slug: string;
  readonly text: string;
  readonly words: number;
  readonly line: number;
}

export interface Note {
  readonly id: string;
  readonly topic: string;
  readonly summary: string;
  readonly keywords: ReadonlyArray<string>;
  readonly links: ReadonlyArray<Link>;
  readonly title: string;
  readonly intro: string;
  readonly sections: ReadonlyArray<Section>;
  readonly body: string;
  readonly words: number;
  readonly file: string;
  readonly skill: SkillSource;
}

export interface SkillSource {
  readonly name: string;
  readonly dir: string;
  readonly notesDir: string;
  readonly hub: boolean;
  readonly skillFile: string;
  // The command that prints the search entries of a member, as an argument
  // list. The first item is a script in the skill folder.
  readonly entries: ReadonlyArray<string> | null;
}

export interface Reference extends Target {
  readonly raw: string;
  readonly file: string;
  readonly line: number;
}

export interface Problem {
  readonly file: string;
  readonly line?: number;
  readonly message: string;
}

export interface Graph {
  readonly hub: SkillSource;
  readonly skills: ReadonlyArray<SkillSource>;
  readonly notes: ReadonlyMap<string, Note>;
  readonly ordered: ReadonlyArray<Note>;
  readonly duplicates: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly roots: ReadonlyArray<Reference>;
  readonly problems: ReadonlyArray<Problem>;
}

export function parseTarget(raw: string): Target | null {
  const match = TARGET.exec(raw);
  if (!match) return null;
  if (match[1]) return { kind: "skill", id: match[1] };
  return match[3] ? { kind: "note", id: match[2]!, section: match[3] } : { kind: "note", id: match[2]! };
}

// Finds note references in Markdown. `design read <id>` and `design links <id>`
// count everywhere, also in code, because SKILL.md gives them as commands.
// `[[id]]` counts only outside code, so that a note can show the syntax.
export function findReferences(text: string, firstLine: number): Array<{ raw: string; line: number }> {
  const found: Array<{ raw: string; line: number }> = [];
  let fence: string | null = null;
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const lineNumber = firstLine + index;
    for (const match of line.matchAll(/\bdesign\s+(?:read|links)\s+([a-z0-9-]+(?:#[a-z0-9-]+)?)/g)) {
      found.push({ raw: match[1]!, line: lineNumber });
    }
    const fenceMatch = /^\s*(```|~~~)/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1]!;
      else if (fence === fenceMatch[1]) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const prose = line.replace(/`[^`]*`/g, "");
    for (const match of prose.matchAll(/\[\[([^\]\n]+)\]\]/g)) {
      found.push({ raw: match[1]!.trim(), line: lineNumber });
    }
  }
  return found;
}

interface ParsedBody {
  readonly title: string | null;
  readonly intro: string;
  readonly sections: Section[];
  readonly problems: Array<{ line: number; message: string }>;
}

function parseBody(body: string, bodyLine: number): ParsedBody {
  const lines = body.split("\n");
  const problems: Array<{ line: number; message: string }> = [];
  let title: string | null = null;
  let titleIndex = -1;
  const headings: Array<{ index: number; title: string }> = [];
  let fence: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const fenceMatch = /^\s*(```|~~~)/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1]!;
      else if (fence === fenceMatch[1]) fence = null;
      continue;
    }
    if (fence !== null) continue;
    if (title === null && line.trim() !== "") {
      const match = /^# (.+)$/.exec(line);
      if (match) {
        title = match[1]!.trim();
        titleIndex = index;
        continue;
      }
      problems.push({ line: bodyLine + index, message: "the body must start with a # title" });
      title = "";
      titleIndex = index - 1;
    }
    if (/^# /.test(line)) problems.push({ line: bodyLine + index, message: "a note has only one # title" });
    const heading = /^## (.+)$/.exec(line);
    if (heading) headings.push({ index, title: heading[1]!.trim() });
  }
  if (fence !== null) problems.push({ line: bodyLine + lines.length - 1, message: "a code fence is not closed" });

  const sections: Section[] = [];
  const slugs = new Set<string>();
  for (let position = 0; position < headings.length; position += 1) {
    const heading = headings[position]!;
    const endIndex = position + 1 < headings.length ? headings[position + 1]!.index : lines.length;
    const text = lines.slice(heading.index, endIndex).join("\n").trimEnd();
    const slug = slugify(heading.title);
    if (slug === "") problems.push({ line: bodyLine + heading.index, message: `the section title "${heading.title}" gives an empty slug` });
    if (slugs.has(slug)) problems.push({ line: bodyLine + heading.index, message: `duplicate section slug #${slug}` });
    slugs.add(slug);
    sections.push({ title: heading.title, slug, text, words: countWords(text), line: bodyLine + heading.index });
  }
  const introEnd = headings.length > 0 ? headings[0]!.index : lines.length;
  const intro = lines.slice(titleIndex + 1, introEnd).join("\n").trim();
  return { title, intro, sections, problems };
}

function list(value: FrontValue | undefined): ReadonlyArray<string> {
  if (value === undefined) return [];
  return typeof value === "string" ? [value] : value;
}

function loadNote(file: string, skill: SkillSource, problems: Problem[]): Note | null {
  const source = readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const result = parseFrontMatter(source);
  for (const error of result.errors) problems.push({ file, line: error.line, message: `front matter: ${error.message}` });
  if (!result.ok) return null;
  const { values, keyLines, body, bodyLine } = result.front;
  const report = (key: string, message: string) => problems.push({ file, line: keyLines.get(key) ?? 1, message: `front matter: ${message}` });

  for (const key of values.keys()) {
    if (!ALLOWED_KEYS.has(key)) report(key, `unknown key "${key}"; the keys are ${[...ALLOWED_KEYS].join(", ")}`);
  }
  const scalar = (key: string): string | null => {
    const value = values.get(key);
    if (value === undefined) {
      problems.push({ file, line: 1, message: `front matter: missing required key "${key}"` });
      return null;
    }
    if (typeof value !== "string") {
      report(key, `"${key}" must be a single value, not a list`);
      return null;
    }
    return value;
  };
  const listOf = (key: string, required: boolean): ReadonlyArray<string> => {
    const value = values.get(key);
    if (value === undefined) {
      if (required) problems.push({ file, line: 1, message: `front matter: missing required key "${key}"` });
      return [];
    }
    if (typeof value === "string") {
      report(key, `"${key}" must be a list: ${key}: [${value}]`);
      return [value];
    }
    return value;
  };

  const id = scalar("id");
  const topic = scalar("topic");
  const summary = scalar("summary");
  const keywords = listOf("keywords", true);
  if (id === null) return null;

  const expectedFile = `${id}.md`;
  if (!KEBAB.test(id)) report("id", `id "${id}" must be kebab-case: lowercase letters, digits, and single hyphens`);
  if (basename(file) !== expectedFile) report("id", `id "${id}" must match the file name; rename the file to ${expectedFile}`);
  if (!skill.hub && !id.startsWith(`${skill.name}-`)) {
    report("id", `a note of the member skill "${skill.name}" must have an id that starts with "${skill.name}-"`);
  }
  if (topic !== null && !KEBAB.test(topic)) report("topic", `topic "${topic}" must be kebab-case`);
  if (summary !== null) {
    if (!summary.endsWith(".")) report("summary", "the summary must be one sentence that ends with a period");
    else if (/[.!?]\s+[A-Z]/.test(summary.slice(0, -1))) report("summary", "the summary must be one sentence");
  }
  if (keywords.length < 3) report("keywords", "give at least 3 keywords, including synonyms and common wrong terms");
  const seenKeywords = new Set<string>();
  for (const keyword of keywords) {
    const normal = keyword.toLowerCase();
    if (seenKeywords.has(normal)) report("keywords", `duplicate keyword "${keyword}"`);
    seenKeywords.add(normal);
  }

  const links: Link[] = [];
  for (const type of FRONT_LINK_TYPES) {
    for (const raw of listOf(type, false)) {
      const target = parseTarget(raw);
      const line = keyLines.get(type) ?? 1;
      if (!target) {
        problems.push({ file, line, message: `front matter: ${type}: "${raw}" is not a link; use <id>, <id>#<section>, or skill:<name>` });
        continue;
      }
      if (type === "specializes" && target.kind === "skill") {
        problems.push({ file, line, message: `front matter: specializes: "${raw}" must name a note, not a skill` });
        continue;
      }
      links.push({ ...target, type, raw, line });
    }
  }

  const parsed = parseBody(body, bodyLine);
  for (const problem of parsed.problems) problems.push({ file, ...problem });
  for (const reference of findReferences(body, bodyLine)) {
    const target = parseTarget(reference.raw);
    if (!target) {
      problems.push({ file, line: reference.line, message: `"[[${reference.raw}]]" is not a link; use [[id]], [[id#section]], or [[skill:name]]` });
      continue;
    }
    links.push({ ...target, type: "mentions", raw: reference.raw, line: reference.line });
  }

  return {
    id,
    topic: topic ?? "unknown",
    summary: summary ?? "",
    keywords,
    links,
    title: parsed.title ?? id,
    intro: parsed.intro,
    sections: parsed.sections,
    body: body.trim(),
    words: countWords(body),
    file,
    skill,
  };
}

function readMember(dir: string, entry: string, problems: Problem[]): SkillSource | null {
  const membership = join(dir, MEMBERSHIP_FILE);
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(membership, "utf8"));
  } catch (error) {
    problems.push({ file: membership, message: `${MEMBERSHIP_FILE} is not valid JSON: ${(error as Error).message}` });
    return null;
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    problems.push({ file: membership, message: `${MEMBERSHIP_FILE} must be an object: { "notes": "notes" }` });
    return null;
  }
  const record = data as Record<string, unknown>;
  const notes = record["notes"];
  if (typeof notes !== "string" || notes.trim() === "") {
    problems.push({ file: membership, message: `${MEMBERSHIP_FILE} needs "notes": the note folder, relative to the skill folder` });
    return null;
  }
  const extra = Object.keys(record).filter((key) => !MEMBERSHIP_KEYS.has(key));
  if (extra.length > 0) {
    problems.push({ file: membership, message: `${MEMBERSHIP_FILE} has unknown keys: ${extra.join(", ")}; the keys are ${[...MEMBERSHIP_KEYS].join(", ")}` });
  }
  const notesDir = resolve(dir, notes);
  if (relative(dir, notesDir).startsWith("..")) {
    problems.push({ file: membership, message: `"notes" must stay inside the skill folder: ${notes}` });
    return null;
  }
  const entries = readEntriesCommand(dir, membership, record["entries"], problems);
  const skillFile = join(dir, "SKILL.md");
  let name = entry;
  if (existsSync(skillFile)) {
    name = readSkillName(readFileSync(skillFile, "utf8")) ?? entry;
  } else {
    problems.push({ file: skillFile, message: "a member skill must have a SKILL.md" });
  }
  return { name, dir, notesDir, hub: false, skillFile, entries };
}

const MEMBERSHIP_KEYS = new Set(["notes", "entries"]);

function readEntriesCommand(dir: string, membership: string, value: unknown, problems: Problem[]): ReadonlyArray<string> | null {
  if (value === undefined) return null;
  const usage = `"entries" must be a list of strings: a script in the skill folder and its arguments, such as ["scripts/tool", "design-entries"]`;
  if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === "string" && item !== "")) {
    problems.push({ file: membership, message: usage });
    return null;
  }
  const script = resolve(dir, value[0] as string);
  if (relative(dir, script).startsWith("..") || isAbsolute(value[0] as string)) {
    problems.push({ file: membership, message: `the "entries" script must be a relative path inside the skill folder: ${value[0]}` });
    return null;
  }
  if (!existsSync(script) || !statSync(script).isFile()) {
    problems.push({ file: membership, message: `the "entries" script does not exist: ${value[0]}` });
    return null;
  }
  return value as string[];
}

export interface LoadOptions {
  readonly skillDir: string;
  // The skill folder as the agent invoked it, before symbolic links resolve.
  readonly invokedSkillDir?: string;
}

function discoverSkills(options: LoadOptions, problems: Problem[]): { hub: SkillSource; skills: SkillSource[] } {
  const hubDir = resolve(options.skillDir);
  const hub: SkillSource = { name: HUB_SKILL, dir: hubDir, notesDir: join(hubDir, "notes"), hub: true, skillFile: join(hubDir, "SKILL.md"), entries: null };
  const skills: SkillSource[] = [hub];
  const seen = new Set<string>([realpathSync(hubDir)]);
  const hubPaths = [hubDir, realpathSync(hubDir), options.invokedSkillDir ? resolve(options.invokedSkillDir) : null];
  const parents = unique(hubPaths.filter((path): path is string => path !== null).map((path) => dirname(path)));

  for (const parent of parents) {
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent).sort()) {
      const dir = join(parent, entry);
      let real: string;
      try {
        real = realpathSync(dir);
        if (!statSync(real).isDirectory()) continue;
      } catch {
        continue;
      }
      if (seen.has(real) || !existsSync(join(dir, MEMBERSHIP_FILE))) continue;
      seen.add(real);
      const member = readMember(dir, entry, problems);
      if (member) skills.push(member);
    }
  }
  return { hub, skills };
}

export function loadGraph(options: LoadOptions): Graph {
  const problems: Problem[] = [];
  const { hub, skills } = discoverSkills(options, problems);
  const notes = new Map<string, Note>();
  const ordered: Note[] = [];
  const files = new Map<string, string[]>();

  for (const skill of skills) {
    if (!existsSync(skill.notesDir) || !statSync(skill.notesDir).isDirectory()) {
      problems.push({ file: skill.notesDir, message: `the note folder of the skill "${skill.name}" does not exist` });
      continue;
    }
    for (const entry of readdirSync(skill.notesDir).sort()) {
      const file = join(skill.notesDir, entry);
      if (statSync(file).isDirectory()) {
        problems.push({ file, message: "the note folder must be flat; move the notes out of this folder" });
        continue;
      }
      if (!entry.endsWith(".md")) {
        problems.push({ file, message: "the note folder holds only .md notes" });
        continue;
      }
      const note = loadNote(file, skill, problems);
      if (!note) continue;
      const previous = files.get(note.id) ?? [];
      files.set(note.id, [...previous, file]);
      if (notes.has(note.id)) {
        problems.push({ file, line: 2, message: `duplicate id "${note.id}"; ${notes.get(note.id)!.file} has the same id` });
        continue;
      }
      notes.set(note.id, note);
      ordered.push(note);
    }
  }

  const roots: Reference[] = [];
  for (const skill of skills) {
    if (!existsSync(skill.skillFile)) {
      if (skill.hub) problems.push({ file: skill.skillFile, message: "the design skill has no SKILL.md" });
      continue;
    }
    const text = readFileSync(skill.skillFile, "utf8").replace(/\r\n?/g, "\n");
    for (const reference of findReferences(text, 1)) {
      const target = parseTarget(reference.raw);
      if (!target) {
        problems.push({ file: skill.skillFile, line: reference.line, message: `"${reference.raw}" is not a link` });
        continue;
      }
      roots.push({ ...target, raw: reference.raw, file: skill.skillFile, line: reference.line });
    }
  }

  const duplicates = new Map<string, string[]>();
  for (const [id, paths] of files) if (paths.length > 1) duplicates.set(id, paths);
  return { hub, skills, notes, ordered, duplicates, roots, problems };
}

export function backlinks(graph: Graph, id: string): Array<{ from: Note; link: Link }> {
  const found: Array<{ from: Note; link: Link }> = [];
  for (const note of graph.ordered) {
    for (const link of note.links) {
      if (link.kind === "note" && link.id === id && note.id !== id) found.push({ from: note, link });
    }
  }
  return found;
}

export function findSection(note: Note, name: string): Section | null {
  const wanted = slugify(name);
  const exact = note.sections.find((section) => section.slug === wanted);
  if (exact) return exact;
  const prefixed = note.sections.filter((section) => section.slug.startsWith(wanted));
  return prefixed.length === 1 ? prefixed[0]! : null;
}
