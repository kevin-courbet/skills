import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { EntrySet } from "./entries.ts";
import { NOTE_WORD_LIMIT, SKILL_WORD_LIMIT, type Graph, type Note, type Problem, type Target } from "./graph.ts";
import { countWords, nearest } from "./text.ts";

export interface CheckResult {
  readonly problems: ReadonlyArray<Problem>;
  readonly links: number;
}

function resolveTarget(graph: Graph, target: Target, raw: string): string | null {
  if (target.kind === "skill") return null;
  const note = graph.notes.get(target.id);
  if (!note) {
    const hint = nearest(target.id, [...graph.notes.keys()], 3);
    return `broken link "${raw}": no note has the id "${target.id}"${hint.length > 0 ? `; nearest: ${hint.join(", ")}` : ""}`;
  }
  if (target.section && !note.sections.some((section) => section.slug === target.section)) {
    return `broken link "${raw}": the note "${note.id}" has no section #${target.section}; its sections: ${note.sections.map((section) => `#${section.slug}`).join(" ")}`;
  }
  return null;
}

function stripFrontMatter(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] !== "---") return source;
  const end = lines.indexOf("---", 1);
  return end === -1 ? source : lines.slice(end + 1).join("\n");
}

function checkAssets(note: Note, problems: Problem[]): void {
  const lines = readFileSync(note.file, "utf8").replace(/\r\n?/g, "\n").split("\n");
  for (const [index, line] of lines.entries()) {
    for (const match of line.matchAll(/(?<![\w/.-])assets\/[A-Za-z0-9._/-]*[A-Za-z0-9_/]/g)) {
      if (!existsSync(join(note.skill.dir, match[0]))) {
        problems.push({ file: note.file, line: index + 1, message: `the asset path "${match[0]}" does not exist in the skill "${note.skill.name}"` });
      }
    }
  }
}

export function checkGraph(graph: Graph, entries: EntrySet): CheckResult {
  const problems: Problem[] = [...graph.problems, ...entries.problems];
  let links = 0;

  for (const entry of entries.entries) {
    const file = join(entry.skill.dir, entry.skill.entries![0]!);
    for (const id of entry.links) {
      links += 1;
      const target = graph.notes.get(id);
      if (!target) {
        const hint = nearest(id, [...graph.notes.keys()], 3);
        problems.push({ file, message: `the entry ${entry.id} links to "${id}", but no note has that id${hint.length > 0 ? `; nearest: ${hint.join(", ")}` : ""}` });
      }
    }
  }

  for (const note of graph.ordered) {
    if (note.words > NOTE_WORD_LIMIT) {
      problems.push({ file: note.file, message: `the note has ${note.words} words; the limit is ${NOTE_WORD_LIMIT}. Split it into several notes` });
    }
    for (const link of note.links) {
      links += 1;
      if (link.kind === "note" && link.id === note.id && !link.section) {
        problems.push({ file: note.file, line: link.line, message: `the note links to itself: ${link.type} ${link.raw}` });
        continue;
      }
      const message = resolveTarget(graph, link, link.raw);
      if (message) {
        problems.push({ file: note.file, line: link.line, message: `${link.type}: ${message}` });
        continue;
      }
      if (note.skill.hub && link.type === "specializes") {
        problems.push({ file: note.file, line: link.line, message: `specializes: only a member note can specialize a hub note; "${note.id}" is a hub note` });
        continue;
      }
      const target = link.kind === "note" ? graph.notes.get(link.id) : undefined;
      if (note.skill.hub && target && !target.skill.hub) {
        problems.push({
          file: note.file,
          line: link.line,
          message: `${link.type}: the hub note links to "${target.id}" of the member skill "${target.skill.name}"; the hub must work without its members`,
        });
      }
    }
    checkAssets(note, problems);
  }

  for (const root of graph.roots) {
    const message = resolveTarget(graph, root, root.raw);
    if (message) problems.push({ file: root.file, line: root.line, message });
  }

  // An agent reads the SKILL.md of a member in full before each task, as it
  // reads the hub SKILL.md, so every SKILL.md in the graph has one limit. The
  // graph loader reports a missing SKILL.md.
  for (const skill of graph.skills) {
    if (!existsSync(skill.skillFile)) continue;
    const words = countWords(stripFrontMatter(readFileSync(skill.skillFile, "utf8")));
    if (words > SKILL_WORD_LIMIT) {
      problems.push({ file: skill.skillFile, message: `the SKILL.md of ${skill.name} has ${words} words; the limit is ${SKILL_WORD_LIMIT}` });
    }
  }

  const reached = new Set<string>();
  const queue = graph.roots.filter((root) => root.kind === "note").map((root) => root.id);
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (reached.has(id)) continue;
    const note = graph.notes.get(id);
    if (!note) continue;
    reached.add(id);
    for (const link of note.links) if (link.kind === "note" && !reached.has(link.id)) queue.push(link.id);
  }
  for (const note of graph.ordered) {
    if (!reached.has(note.id)) {
      problems.push({ file: note.file, message: `the note "${note.id}" cannot be reached through links from any SKILL.md in the graph; link to it from a note or a SKILL.md` });
    }
  }

  problems.sort((left, right) => left.file.localeCompare(right.file) || (left.line ?? 0) - (right.line ?? 0));
  return { problems, links };
}
