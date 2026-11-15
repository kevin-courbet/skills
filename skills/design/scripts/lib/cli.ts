import { relative } from "node:path";
import { checkGraph } from "./check.ts";
import { backlinks, findSection, loadGraph, NOTE_WORD_LIMIT, type Graph, type Link, type LoadOptions, type Note } from "./graph.ts";
import { search } from "./search.ts";
import { nearest, unique } from "./text.ts";

export interface RunOptions extends LoadOptions {
  readonly color?: boolean;
}

export interface RunResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

export const USAGE = `design <command> [arguments]

Commands:
  search <query> [--limit <n>]   Rank notes for a question. Default limit: 8.
                                 Warns when the best note has under half the words.
  read <id>                      Print a note, the notes to read first, and the
                                 ids of the other linked notes.
  read <id>#<section>            Print one section of a note.
  read <id> --outline            Print the summary, the sections, and the links.
  list                           Print every note, grouped by topic.
  links <id>                     Print the links to and from a note.
  graph --check                  Validate the note graph. Exit status 1 on a problem.
  help                           Print this text.

[[id]] in a note is a link: run "design read <id>" to follow it.`;

class UsageError extends Error {}
class LookupError extends Error {}

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

function lookup(graph: Graph, id: string): Note {
  const duplicate = graph.duplicates.get(id);
  if (duplicate) {
    throw new LookupError(`the id "${id}" is not unique in the graph:\n${duplicate.map((file) => `  ${file}`).join("\n")}\nRun "design graph --check".`);
  }
  const note = graph.notes.get(id);
  if (note) return note;
  const close = nearest(id, [...graph.notes.keys()], 5);
  const found = search(graph, id.replaceAll("-", " "), 5).hits.map((hit) => hit.note.id);
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
// fit on one line.
function readLinkLines(graph: Graph, note: Note, s: Style): string[] {
  const outgoing = outgoingLinks(note);
  const first = outgoing.filter((link) => link.type === "requires" || link.type === "specializes");
  const targetId = (link: Link) => (link.kind === "skill" ? `skill:${link.id}` : link.id);
  const firstIds = new Set(first.map(targetId));
  const others = [...new Set(outgoing.map(targetId))].filter((id) => !firstIds.has(id));
  const lines: string[] = [];
  if (first.length > 0) lines.push("Read first:", ...summaryLines(graph, first, s));
  if (others.length > 0) lines.push(`See also: ${others.map((id) => s.id(id)).join(", ")}`);
  return [...lines, ...specializationLines(graph, note, s)];
}

function linkLines(graph: Graph, note: Note, s: Style): string[] {
  const outgoing = outgoingLinks(note);
  const lines = outgoing.length > 0 ? ["Links:", ...summaryLines(graph, outgoing, s)] : [];
  return [...lines, ...specializationLines(graph, note, s)];
}

function specializationLines(graph: Graph, note: Note, s: Style): string[] {
  const lines: string[] = [];
  const specializations = backlinks(graph, note.id).filter((entry) => entry.link.type === "specializes");
  if (specializations.length > 0) {
    lines.push("Specialized by:");
    for (const entry of specializations) {
      lines.push(`  ${s.id(entry.from.id)}${owner(entry.from)}  ${entry.from.summary}`);
    }
  }
  return lines;
}

function header(note: Note, s: Style): string[] {
  const lines = [
    `${s.id(note.id)}${owner(note)} (topic ${note.topic}, ${note.words} words)`,
    `summary: ${note.summary}`,
  ];
  if (/(?<![\w/.-])assets\//.test(note.body)) lines.push(`Asset paths are relative to ${note.skill.dir}`);
  return lines;
}

function commandRead(graph: Graph, args: string[], s: Style): string {
  const outline = args.includes("--outline");
  const rest = args.filter((arg) => arg !== "--outline");
  const unknownFlag = rest.find((arg) => arg.startsWith("--"));
  if (unknownFlag) throw new UsageError(`read: unknown option ${unknownFlag}`);
  if (rest.length !== 1) throw new UsageError("read: give one note id, such as: design read forms");
  const [id, sectionName] = rest[0]!.split("#", 2) as [string, string | undefined];
  const note = lookup(graph, id);

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
    const links = linkLines(graph, note, s);
    if (links.length > 0) lines.push("", ...links);
    return lines.join("\n");
  }

  const lines = [...header(note, s), "", note.body];
  const links = readLinkLines(graph, note, s);
  if (links.length > 0) lines.push("", ...links);
  return lines.join("\n");
}

function commandSearch(graph: Graph, args: string[], s: Style): { text: string; found: boolean } {
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
  const result = search(graph, query, limit);
  const lines: string[] = [];
  for (const correction of result.corrections) lines.push(`(searched "${correction.from}" as "${correction.to}")`);
  if (result.unmatched.length > 0) lines.push(`(no note contains: ${result.unmatched.join(", ")})`);
  if (result.hits.length === 0) {
    return { text: [...lines, `No note matches "${query}". Run "design list" to see every note.`].join("\n"), found: false };
  }
  if (!result.strong) {
    lines.push(
      `No strong match for "${query}". The best note contains ${result.hits[0]!.matched} of ${result.words} query words. These notes cover only part of the question:`,
      "",
    );
  }
  for (const hit of result.hits) {
    lines.push(`${s.id(hit.note.id)}${owner(hit.note)}  ${hit.note.summary}`);
    if (hit.sections.length > 0) lines.push(`  sections: ${hit.sections.map((section) => `#${section.slug}`).join(" ")}`);
  }
  lines.push("", "Next: design read <id>, design read <id>#<section>, or design read <id> --outline");
  return { text: lines.join("\n"), found: true };
}

function commandList(graph: Graph, s: Style): string {
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
  return lines.join("\n");
}

function commandLinks(graph: Graph, args: string[], s: Style): string {
  if (args.length !== 1 || args[0]!.startsWith("--")) throw new UsageError("links: give one note id, such as: design links forms");
  const note = lookup(graph, args[0]!.split("#")[0]!);
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

function commandCheck(graph: Graph, args: string[]): { text: string; ok: boolean } {
  if (args.length !== 1 || args[0] !== "--check") throw new UsageError("graph: use graph --check");
  const result = checkGraph(graph);
  const base = graph.hub.dir;
  const where = (file: string, line?: number) => {
    const path = relative(base, file) || file;
    return line ? `${path}:${line}` : path;
  };
  const summary = `${graph.ordered.length} notes, ${result.links} links, ${graph.skills.length} ${graph.skills.length === 1 ? "skill" : "skills"} (${graph.skills.map((skill) => skill.name).join(", ")}), word limit ${NOTE_WORD_LIMIT}`;
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
    const warning =
      command !== "graph" && graph.problems.length > 0
        ? `warning: the design graph has ${graph.problems.length} load ${graph.problems.length === 1 ? "problem" : "problems"}. Run "design graph --check".\n`
        : "";
    switch (command) {
      case "search": {
        const result = commandSearch(graph, args, s);
        return result.found
          ? { code: 0, stdout: `${result.text}\n`, stderr: warning }
          : { code: 1, stdout: "", stderr: `${warning}${result.text}\n` };
      }
      case "read":
        return { code: 0, stdout: `${commandRead(graph, args, s)}\n`, stderr: warning };
      case "list":
        if (args.length > 0) throw new UsageError("list: takes no arguments");
        return { code: 0, stdout: `${commandList(graph, s)}\n`, stderr: warning };
      case "links":
        return { code: 0, stdout: `${commandLinks(graph, args, s)}\n`, stderr: warning };
      case "graph": {
        const result = commandCheck(graph, args);
        return { code: result.ok ? 0 : 1, stdout: `${result.text}\n`, stderr: "" };
      }
      default:
        throw new UsageError(`unknown command "${command}"`);
    }
  } catch (error) {
    if (error instanceof UsageError) return { code: 2, stdout: "", stderr: `design: ${error.message}\n\n${USAGE}\n` };
    if (error instanceof LookupError) return { code: 1, stdout: "", stderr: `design: ${error.message}\n` };
    throw error;
  }
}
