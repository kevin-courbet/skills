import { relative } from "node:path";
import { checkGraph } from "./check.ts";
import { entriesFor, findEntry, isEntry, loadEntries, type Entry, type EntrySet, type EntrySource } from "./entries.ts";
import { LookupError, UsageError } from "./errors.ts";
import { backlinks, findSection, loadGraph, NOTE_WORD_LIMIT, type Graph, type Link, type LoadOptions, type Note } from "./graph.ts";
import { KIT_COMMANDS, runKitCommand } from "./kit/commands.ts";
import { KitError } from "./kit/files.ts";
import { search } from "./search.ts";
import { nearest, unique } from "./text.ts";

export interface RunOptions extends LoadOptions {
  // The folder that the agent works in. The kit commands and the search
  // entries find the app, and so its installed kit, from this folder.
  readonly cwd: string;
  readonly color?: boolean;
}

export interface RunResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

export const USAGE = `design <command> [arguments]

Design notes:
  search <query> [--limit <n>]   Rank the notes, the kit components, and the recipes
                                 for a question. Default limit: 8.
                                 Warns when the best result has under half the words.
  read <id>                      Print a note, the notes to read first, and the
                                 ids of the other linked notes.
  read <id>#<section>            Print one section of a note.
  read <id> --outline            Print the summary, the sections, and the links.
  list                           Print every note, grouped by topic.
  links <id>                     Print the links to and from a note.
  graph --check                  Validate the notes, the kit, and the use cases.
                                 Exit status 1 on a problem.

Kit:
  components [dir]               List the kit components of the app around dir,
                                 or of the hub kit outside an app.
  docs <id>[#part] [dir]         Print the docs of one component or export.
                                 Parts: #props or #<section>.
  recipe [<id>[#files]] [dir]    List the page recipes, or print one recipe.

Apps:
  new <dir> --app <use case> [--name "App name"] [--lab]
                                 Create an app from the template of a use case
                                 and the hub kit. --lab adds the recipe pages.
  sync [dir] [--write] [--force] Compare the kit files of an app with the hub kit.
                                 --write applies the update.
  check [dir]                    Run the kit rules and the rules of the use case.
  doctor [dir]                   Check the stack, the kit, and the conventions.
  sync, check, and doctor take --app <use case> for an app without a kit lock.
  Each kit and app command takes --json.

  help                           Print this text.

[[id]] in a note is a link: run "design read <id>" to follow it.
A search result for a component or a recipe prints the command that reads it.`;


interface Style {
  readonly id: (text: string) => string;
  readonly heading: (text: string) => string;
}

function style(color: boolean): Style {
  if (!color) return { id: (text) => text, heading: (text) => text };
  return { id: (text) => `\u001b[1m${text}\u001b[22m`, heading: (text) => `\u001b[1m${text}\u001b[22m` };
}

function owner(note: Note): string {
  return note.skill.hub ? "" : ` [${note.skill.name}]`;
}

// Loads the entries only when a command needs them, because they parse the
// whole kit and the labs.
class Context {
  private set: EntrySet | null = null;
  constructor(
    readonly graph: Graph,
    private readonly cwd: string,
  ) {}
  entries(): EntrySet {
    this.set ??= loadEntries(this.graph, { kind: "folder", dir: this.cwd });
    return this.set;
  }
  // A warning for the problems of the entries, which the command prints on stderr.
  entryWarning(): string {
    if (this.set === null || this.set.problems.length === 0) return "";
    const shown = this.set.problems.slice(0, 3).map((problem) => `  ${problem.message}`);
    const more = this.set.problems.length > 3 ? [`  and ${this.set.problems.length - 3} more`] : [];
    return [`warning: the kit components and the recipes have ${this.set.problems.length} ${this.set.problems.length === 1 ? "problem" : "problems"}. Run "design graph --check".`, ...shown, ...more, ""].join("\n");
  }
}

// A kit component belongs to the hub, so it prints no skill name. A recipe
// belongs to a use case, such as [internal-app recipe, page].
function entryOwner(entry: Entry): string {
  const kind = `${entry.kind}${entry.label === "" ? "" : `, ${entry.label}`}`;
  return entry.skill.hub ? ` [${kind}]` : ` [${entry.skill.name} ${kind}]`;
}

function entryPhrase(entry: Entry): string {
  return entry.skill.hub ? `a kit ${entry.kind}` : `a ${entry.kind} of the ${entry.skill.name} use case`;
}

function lookup(context: Context, id: string): Note {
  const graph = context.graph;
  const duplicate = graph.duplicates.get(id);
  if (duplicate) {
    throw new LookupError(`the id "${id}" is not unique in the graph:\n${duplicate.map((file) => `  ${file}`).join("\n")}\nRun "design graph --check".`);
  }
  const note = graph.notes.get(id);
  if (note) return note;
  const entry = findEntry(context.entries(), id);
  if (entry) {
    throw new LookupError(`"${entry.id}" is not a note. It is ${entryPhrase(entry)}. Read it with:\n  ${entry.read}`);
  }
  const close = nearest(id, [...graph.notes.keys()], 5);
  const found = search(graph.ordered, id.replaceAll("-", " "), 5).hits.map((hit) => hit.doc.id);
  const suggestions = [...new Set([...close, ...found])].slice(0, 5);
  const hint = suggestions.length > 0 ? `\nNearest: ${suggestions.join(", ")}` : "";
  throw new LookupError(`no note has the id "${id}".${hint}\nRun "design search <words>" or "design list".`);
}

function linkTargetSummary(graph: Graph, link: Link): string {
  if (link.kind === "skill") return `the ${link.id} skill`;
  return graph.notes.get(link.id)?.summary ?? "(missing note)";
}

function linkName(link: Link): string {
  return link.kind === "skill" ? `skill:${link.id}` : link.raw;
}

function outgoingLinks(note: Note): Link[] {
  const seen = new Set<string>();
  const outgoing = note.links.filter((link) => {
    const key = `${link.type} ${link.raw}`;
    if (seen.has(key) || (link.kind === "note" && link.id === note.id)) return false;
    seen.add(key);
    return true;
  });
  const order = ["requires", "specializes", "related", "mentions"];
  return outgoing.sort((left, right) => order.indexOf(left.type) - order.indexOf(right.type));
}

function summaryLines(graph: Graph, links: ReadonlyArray<Link>, s: Style): string[] {
  const width = Math.max(...links.map((link) => linkName(link).length));
  return links.map((link) => `  ${link.type.padEnd(11)} ${s.id(linkName(link).padEnd(width))}  ${linkTargetSummary(graph, link)}`);
}

// The full read prints summaries only for the notes that the reader must read
// first. The body already names the sections of the other links, so their ids
// fit on one line. The outline keeps the summaries of every link.
function readLinkLines(context: Context, note: Note, s: Style): string[] {
  const graph = context.graph;
  const outgoing = outgoingLinks(note);
  const targetId = (link: Link) => (link.kind === "skill" ? `skill:${link.id}` : link.id);
  const required = outgoing.filter((link) => link.type === "requires");
  const specialized = outgoing.filter((link) => link.type === "specializes");
  const named = new Set([...required, ...specialized].map(targetId));
  const others = [...new Set(outgoing.map(targetId))].filter((id) => !named.has(id));
  const idLine = (label: string, ids: ReadonlyArray<string>) => `${label}: ${ids.map((id) => s.id(id)).join(", ")}`;
  const lines: string[] = [];
  if (required.length > 0) {
    const width = Math.max(...required.map((link) => targetId(link).length));
    lines.push("Read first:", ...required.map((link) => `  ${s.id(targetId(link).padEnd(width))}  ${linkTargetSummary(graph, link)}`));
  }
  if (specialized.length > 0) lines.push(idLine("Specializes", specialized.map(targetId)));
  if (others.length > 0) lines.push(idLine("See also", others));
  const specializations = specializationsOf(graph, note);
  if (specializations.length > 0) lines.push(idLine("Specialized by", specializations.map((from) => from.id)));
  const entries = entriesFor(context.entries(), note.id);
  for (const source of context.entries().sources) {
    const ids = entries.filter((entry) => inSource(entry, source)).map((entry) => entry.id);
    if (ids.length === 0) continue;
    lines.push(idLine(`Implemented by (${sourceName(source)})`, ids), `  Read one with: ${readCommand(source)}`);
  }
  return lines;
}

function linkLines(context: Context, note: Note, s: Style): string[] {
  const outgoing = outgoingLinks(note);
  const lines = outgoing.length > 0 ? ["Links:", ...summaryLines(context.graph, outgoing, s)] : [];
  return [...lines, ...specializationLines(context.graph, note, s), ...implementationLines(context, note, s)];
}

function readCommand(source: EntrySource): string {
  return source.read.replaceAll("{id}", "<id>");
}

function inSource(entry: Entry, source: EntrySource): boolean {
  return entry.skill === source.skill && entry.group === source.group;
}

// The group, such as "components", or "internal-app recipes" for the group of a use case.
function sourceName(source: EntrySource): string {
  return source.skill.hub ? source.group : `${source.skill.name} ${source.group}`;
}

// The entries that apply the note, such as the kit components that
// implement a form rule.
function implementationLines(context: Context, note: Note, s: Style): string[] {
  const entries = entriesFor(context.entries(), note.id);
  if (entries.length === 0) return [];
  const width = Math.max(...entries.map((entry) => (entry.id + entryOwner(entry)).length));
  const lines = ["Implemented by:"];
  for (const entry of entries) {
    const name = entry.id + entryOwner(entry);
    lines.push(`  ${s.id(entry.id)}${entryOwner(entry)}${" ".repeat(width - name.length)}  ${entry.summary}`);
  }
  for (const source of context.entries().sources.filter((candidate) => entries.some((entry) => inSource(entry, candidate)))) {
    lines.push(`  Read one of the ${sourceName(source)} with: ${readCommand(source)}`);
  }
  return lines;
}

function specializationsOf(graph: Graph, note: Note): Note[] {
  return backlinks(graph, note.id)
    .filter((entry) => entry.link.type === "specializes")
    .map((entry) => entry.from);
}

function specializationLines(graph: Graph, note: Note, s: Style): string[] {
  const specializations = specializationsOf(graph, note);
  if (specializations.length === 0) return [];
  return ["Specialized by:", ...specializations.map((from) => `  ${s.id(from.id)}${owner(from)}  ${from.summary}`)];
}

function header(note: Note, s: Style): string[] {
  const lines = [
    `${s.id(note.id)}${owner(note)} (topic ${note.topic}, ${note.words} words)`,
    `summary: ${note.summary}`,
  ];
  if (/(?<![\w/.-])assets\//.test(note.body)) lines.push(`Asset paths are relative to ${note.skill.dir}`);
  return lines;
}

function commandRead(context: Context, args: string[], s: Style): string {
  const outline = args.includes("--outline");
  const rest = args.filter((arg) => arg !== "--outline");
  const unknownFlag = rest.find((arg) => arg.startsWith("--"));
  if (unknownFlag) throw new UsageError(`read: unknown option ${unknownFlag}`);
  if (rest.length !== 1) throw new UsageError("read: give one note id, such as: design read forms");
  const [id, sectionName] = rest[0]!.split("#", 2) as [string, string | undefined];
  const note = lookup(context, id);

  if (sectionName !== undefined) {
    if (outline) throw new UsageError("read: use --outline with a note id, not with a section");
    const section = findSection(note, sectionName);
    if (!section) {
      const slugs = note.sections.map((candidate) => candidate.slug);
      const close = nearest(sectionName.toLowerCase(), slugs, 3);
      const hint = close.length > 0 ? `Nearest: ${close.map((slug) => `#${slug}`).join(" ")}\n` : "";
      throw new LookupError(`the note "${note.id}" has no section "#${sectionName}".\n${hint}Sections: ${slugs.map((slug) => `#${slug}`).join(" ")}`);
    }
    const others = note.sections.filter((candidate) => candidate !== section).map((candidate) => `#${candidate.slug}`);
    return [
      `${s.id(`${note.id}#${section.slug}`)}${owner(note)} (section of "${note.title}", ${section.words} words)`,
      "",
      section.text,
      "",
      others.length > 0 ? `Other sections: ${others.join(" ")}` : "No other sections.",
      `Links: design read ${note.id} --outline`,
    ].join("\n");
  }

  if (outline) {
    const lines = [...header(note, s), "", "Sections:"];
    if (note.sections.length === 0) lines.push("  (none)");
    const width = Math.max(0, ...note.sections.map((section) => section.slug.length + 1));
    for (const section of note.sections) lines.push(`  ${`#${section.slug}`.padEnd(width)}  ${section.words} words`);
    const links = linkLines(context, note, s);
    if (links.length > 0) lines.push("", ...links);
    return lines.join("\n");
  }

  const lines = [...header(note, s), "", note.body];
  const links = readLinkLines(context, note, s);
  if (links.length > 0) lines.push("", ...links);
  return lines.join("\n");
}

function commandSearch(context: Context, args: string[], s: Style): { text: string; found: boolean } {
  let limit = 8;
  const words: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === "--limit") {
      const value = Number(args[index + 1]);
      if (!Number.isInteger(value) || value < 1) throw new UsageError("search: --limit needs a positive whole number");
      limit = value;
      index += 1;
    } else if (arg.startsWith("--")) {
      throw new UsageError(`search: unknown option ${arg}`);
    } else {
      words.push(arg);
    }
  }
  const query = words.join(" ").trim();
  if (query === "") throw new UsageError('search: give a query, such as: design search "error summary"');
  const entries = context.entries();
  const result = search<Note | Entry>([...context.graph.ordered, ...entries.entries], query, limit);
  const lines: string[] = [];
  for (const correction of result.corrections) lines.push(`(searched "${correction.from}" as "${correction.to}")`);
  if (result.unmatched.length > 0) lines.push(`(no note or entry contains: ${result.unmatched.join(", ")})`);
  if (result.hits.length === 0) {
    return { text: [...lines, `Nothing matches "${query}". Run "design list" to see every note.`].join("\n"), found: false };
  }
  if (!result.strong) {
    lines.push(
      `No strong match for "${query}". The best result contains ${result.hits[0]!.matched} of ${result.words} query words. These results cover only part of the question:`,
      "",
    );
  }
  for (const hit of result.hits) {
    const doc = hit.doc;
    if (isEntry(doc)) {
      lines.push(`${s.id(doc.id)}${entryOwner(doc)}  ${doc.summary}`, `  read: ${doc.read}`);
      continue;
    }
    lines.push(`${s.id(doc.id)}${owner(doc)}  ${doc.summary}`);
    if (hit.sections.length > 0) lines.push(`  sections: ${hit.sections.map((section) => `#${section.slug}`).join(" ")}`);
  }
  const hitEntries = result.hits.map((hit) => hit.doc).filter(isEntry);
  const sources = entries.sources.filter((source) => hitEntries.some((entry) => inSource(entry, source)));
  lines.push("");
  for (const source of sources) lines.push(`${sourceName(source)}: ${source.source}`);
  lines.push("Next: design read <id> for a note, design read <id>#<section> for one section, or the read command of an entry.");
  return { text: lines.join("\n"), found: true };
}

function commandList(context: Context, s: Style): string {
  const graph = context.graph;
  const topics = new Map<string, Note[]>();
  for (const note of graph.ordered) topics.set(note.topic, [...(topics.get(note.topic) ?? []), note]);
  const width = Math.max(...graph.ordered.map((note) => (note.id + owner(note)).length));
  const lines = [`${graph.ordered.length} notes. Run "design read <id>" for a note.`];
  for (const topic of [...topics.keys()].sort()) {
    lines.push("", s.heading(topic));
    for (const note of topics.get(topic)!.sort((left, right) => left.id.localeCompare(right.id))) {
      const name = note.id + owner(note);
      lines.push(`  ${s.id(name)}${" ".repeat(width - name.length)}  ${note.summary}`);
    }
  }
  const sources = context.entries().sources;
  if (sources.length > 0) {
    lines.push("", s.heading("entries"), "  Search finds them with the notes:");
    for (const source of sources) lines.push(`  ${sourceName(source)}: ${source.count} entries from ${source.source}`);
  }
  return lines.join("\n");
}

function commandLinks(context: Context, args: string[], s: Style): string {
  const graph = context.graph;
  if (args.length !== 1 || args[0]!.startsWith("--")) throw new UsageError("links: give one note id, such as: design links forms");
  const note = lookup(context, args[0]!.split("#")[0]!);
  const lines = [`${s.id(note.id)}${owner(note)}  ${note.summary}`, "", "Links from this note:"];
  const outgoing = new Map<string, { types: Set<string>; summary: string }>();
  for (const link of note.links) {
    if (link.kind === "note" && link.id === note.id) continue;
    const name = link.kind === "skill" ? `skill:${link.id}` : link.raw;
    const entry = outgoing.get(name) ?? { types: new Set<string>(), summary: linkTargetSummary(graph, link) };
    entry.types.add(link.type);
    outgoing.set(name, entry);
  }
  if (outgoing.size === 0) lines.push("  (none)");
  const outWidth = Math.max(0, ...[...outgoing.keys()].map((name) => name.length));
  for (const [name, entry] of outgoing) {
    lines.push(`  ${s.id(name.padEnd(outWidth))}  ${[...entry.types].join(", ")}: ${entry.summary}`);
  }

  lines.push("", "Links to this note:");
  const incoming = new Map<string, { from: Note; types: Set<string> }>();
  for (const entry of backlinks(graph, note.id)) {
    const current = incoming.get(entry.from.id) ?? { from: entry.from, types: new Set<string>() };
    current.types.add(entry.link.raw.includes("#") ? `${entry.link.type} #${entry.link.section}` : entry.link.type);
    incoming.set(entry.from.id, current);
  }
  const skillFiles = unique(graph.roots.filter((root) => root.kind === "note" && root.id === note.id).map((root) => root.file));
  if (incoming.size === 0 && skillFiles.length === 0) lines.push("  (none)");
  const names = [...incoming.values()].map((entry) => entry.from.id + owner(entry.from));
  const inWidth = Math.max(0, ...names.map((name) => name.length));
  for (const entry of incoming.values()) {
    const name = entry.from.id + owner(entry.from);
    lines.push(`  ${s.id(name)}${" ".repeat(inWidth - name.length)}  ${[...entry.types].join(", ")}`);
  }
  for (const file of skillFiles) {
    const skill = graph.skills.find((candidate) => candidate.skillFile === file);
    lines.push(`  SKILL.md of the ${skill?.name ?? "unknown"} skill`);
  }
  return lines.join("\n");
}

function commandCheck(context: Context, args: string[]): { text: string; ok: boolean } {
  const graph = context.graph;
  if (args.length !== 1 || args[0] !== "--check") throw new UsageError("graph: use graph --check");
  const entries = loadEntries(graph, { kind: "hub" });
  const result = checkGraph(graph, entries);
  const base = graph.hub.dir;
  const where = (file: string, line?: number) => {
    const path = relative(base, file) || file;
    return line ? `${path}:${line}` : path;
  };
  const summary = `${graph.ordered.length} notes, ${entries.entries.length} entries, ${result.links} links, ${graph.skills.length} ${graph.skills.length === 1 ? "skill" : "skills"} (${graph.skills.map((skill) => skill.name).join(", ")}), word limit ${NOTE_WORD_LIMIT}`;
  if (result.problems.length === 0) return { text: `ok: ${summary}`, ok: true };
  const lines = result.problems.map((problem) => `${where(problem.file, problem.line)}: ${problem.message}`);
  lines.push("", `failed: ${result.problems.length} ${result.problems.length === 1 ? "problem" : "problems"} in ${summary}`);
  return { text: lines.join("\n"), ok: false };
}

export function run(argv: ReadonlyArray<string>, options: RunOptions): RunResult {
  const s = style(options.color ?? false);
  const [command, ...args] = argv;
  if (command === undefined) return { code: 2, stdout: "", stderr: `${USAGE}\n` };
  if (command === "help" || command === "--help" || command === "-h") return { code: 0, stdout: `${USAGE}\n`, stderr: "" };

  try {
    const graph = loadGraph(options);
    const context = new Context(graph, options.cwd);
    const graphWarning =
      command !== "graph" && graph.problems.length > 0
        ? `warning: the design graph has ${graph.problems.length} load ${graph.problems.length === 1 ? "problem" : "problems"}. Run "design graph --check".\n`
        : "";
    const warning = () => `${graphWarning}${context.entryWarning()}`;
    if (KIT_COMMANDS.has(command)) {
      const result = runKitCommand(command, args, graph, options.cwd);
      return { code: result.code, stdout: result.stdout, stderr: graphWarning };
    }
    switch (command) {
      case "search": {
        const result = commandSearch(context, args, s);
        return result.found
          ? { code: 0, stdout: `${result.text}\n`, stderr: warning() }
          : { code: 1, stdout: "", stderr: `${warning()}${result.text}\n` };
      }
      case "read": {
        const text = commandRead(context, args, s);
        return { code: 0, stdout: `${text}\n`, stderr: warning() };
      }
      case "list": {
        if (args.length > 0) throw new UsageError("list: takes no arguments");
        const text = commandList(context, s);
        return { code: 0, stdout: `${text}\n`, stderr: warning() };
      }
      case "links": {
        const text = commandLinks(context, args, s);
        return { code: 0, stdout: `${text}\n`, stderr: warning() };
      }
      case "graph": {
        const result = commandCheck(context, args);
        return { code: result.ok ? 0 : 1, stdout: `${result.text}\n`, stderr: "" };
      }
      default:
        throw new UsageError(`unknown command "${command}"`);
    }
  } catch (error) {
    if (error instanceof UsageError) return { code: 2, stdout: "", stderr: `design: ${error.message}\n\n${USAGE}\n` };
    if (error instanceof LookupError) return { code: 1, stdout: "", stderr: `design: ${error.message}\n` };
    if (error instanceof KitError) return { code: 2, stdout: "", stderr: `design: ${error.message}\n` };
    throw error;
  }
}
