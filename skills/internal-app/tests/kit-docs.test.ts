import { beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { countWords, DOC_WORD_LIMIT } from "../scripts/lib/kit-docs.ts";

const SKILLS = resolve(import.meta.dir, "../..");
const INTERNAL_APP = join(SKILLS, "internal-app/scripts/internal-app");
const DESIGN = join(SKILLS, "design/scripts/design");

// These docs are longer than the limit, so the docs command prints their
// outline and the agent reads one part at a time.
const OUTLINE_DOCS = ["AppShell", "DataTable", "EventCalendar", "FormLayout", "Gantt", "Layout", "WorkQueue"];

let app = "";

function run(cli: string, args: ReadonlyArray<string>) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: app, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

// The ids of the results of `design search`, in rank order. A result line
// starts with the id; the lines under it are indented.
function searchIds(query: string): string[] {
  const result = run(DESIGN, ["search", query]);
  expect(result.code).toBe(0);
  return result.stdout
    .split("\n")
    .filter((line) => /^[A-Za-z][\w-]*\s/.test(line) && !line.startsWith("No strong match") && !line.startsWith("Next:"))
    .map((line) => line.split(/\s/, 1)[0]!);
}

// The words of a printed doc without its footer. The footer names the
// related ids and the source folder, and the limit applies to the doc itself.
function bodyWords(text: string): number {
  const body = text.split("\n").filter((line) => !/^(Related components|Design notes|Source): /.test(line));
  return countWords(body.join("\n"));
}

beforeAll(() => {
  app = join(mkdtempSync(join(tmpdir(), "internal-app-docs-")), "app");
  const created = spawnSync(process.execPath, [INTERNAL_APP, "new", app], { encoding: "utf8" });
  if (created.status !== 0) throw new Error(`internal-app new failed: ${created.stderr}`);
});

describe("the kit docs of a new app", () => {
  test("check finds no doc comment problems", () => {
    const result = run(INTERNAL_APP, ["check", "--json"]);
    const report = JSON.parse(result.stdout) as { findings: ReadonlyArray<{ rule: string; file: string; text: string }> };
    const kitDocs = report.findings.filter((item) => item.rule === "kit-docs").map((item) => `${item.file}: ${item.text}`);
    expect(kitDocs).toEqual([]);
  });

  test("the catalog lists every component under its layer and reads the installed kit", () => {
    const result = run(INTERNAL_APP, ["components"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith("Primitives (");
    expect(result.stdout).toContain("\nPatterns (");
    expect(result.stdout).toContain("\nShell (");
    expect(result.stdout).not.toContain("No layer (");
    expect(result.stdout).not.toContain("warning:");
    expect(result.stdout).toContain(`the installed kit of the app at ${app}`);
  });

  test("each doc prints in full under the word limit, or as an outline whose parts are under it", { timeout: 120_000 }, () => {
    const listed = JSON.parse(run(INTERNAL_APP, ["components", "--json"]).stdout) as { components: ReadonlyArray<{ id: string }> };
    const outlines: string[] = [];
    const tooLong: string[] = [];
    for (const { id } of listed.components) {
      const result = run(INTERNAL_APP, ["docs", id]);
      expect(result.code).toBe(0);
      // An outline lists its sections as "  #<part>  ..." and, when the props
      // are long too, each export as "  <Export>  (N words)".
      const parts = [
        ...[...result.stdout.matchAll(/^ {2}#([\w-]+) {2}/gm)].map((match) => `${id}#${match[1]!}`),
        ...[...result.stdout.matchAll(/^ {2}([A-Za-z]\w*) {2}\(\d+ words\)$/gm)].map((match) => match[1]!),
      ];
      if (parts.length === 0) {
        if (bodyWords(result.stdout) > DOC_WORD_LIMIT) tooLong.push(`${id} (${bodyWords(result.stdout)} words)`);
        continue;
      }
      outlines.push(id);
      for (const part of parts) {
        const printed = run(INTERNAL_APP, ["docs", part]);
        expect(printed.code).toBe(0);
        if (bodyWords(printed.stdout) > DOC_WORD_LIMIT) tooLong.push(`${part} (${bodyWords(printed.stdout)} words)`);
      }
    }
    expect(tooLong).toEqual([]);
    expect(outlines.sort()).toEqual(OUTLINE_DOCS);
  });

  test("docs Kanban prints the doc comment and the props", () => {
    const result = run(INTERNAL_APP, ["docs", "Kanban"]);
    expect(result.stdout).toStartWith("Kanban  (pattern)  src/components/ui/kanban.tsx");
    expect(result.stdout).toContain("## Behavior");
    expect(result.stdout).toContain("## Example");
    expect(result.stdout).toContain("### Kanban");
    expect(result.stdout).toContain("Design notes: patterns, motion, internal-app-composition, internal-app-states.");
  });

  test("docs finds an export by name and errors on an unknown name", () => {
    expect(run(INTERNAL_APP, ["docs", "CheckboxGroup"]).stdout).toStartWith("Checkbox  (primitive)");
    const unknown = run(INTERNAL_APP, ["docs", "Kanbna"]);
    expect(unknown.code).toBe(2);
    expect(unknown.stderr).toContain('no kit doc or export is named "Kanbna". Nearest: Kanban');
  });
});

// Each query in the words of the docs and the notes, and the id that must rank
// in the top 3 of `design search` inside the app.
const GOLDEN: ReadonlyArray<readonly [string, string]> = [
  ["kanban", "Kanban"],
  ["drag cards between columns", "Kanban"],
  ["error summary", "form-errors"],
  ["date range", "DateRangePicker"],
  ["sortable table with filters", "DataTable"],
  ["confirm before delete", "ConfirmDialog"],
  ["file upload", "FileUpload"],
  ["toast after save", "Toaster"],
  ["status badge", "Badge"],
  ["work list for a tablet", "internal-app-touch-work-view"],
  ["split form section", "form-layout"],
  ["preview of a printed tag", "internal-app-form-preview"],
  ["timeline of events", "Timeline"],
  ["steps of a process", "Stepper"],
  ["log viewer", "LogViewer"],
  ["tree of folders", "Tree"],
  ["reorder a list by drag", "SortableList"],
  ["gantt chart", "Gantt"],
  ["week calendar of events", "EventCalendar"],
  ["trend chart", "TrendChart"],
  ["copy to clipboard", "CopyButton"],
  ["command palette", "CommandPalette"],
  ["side sheet", "Sheet"],
  ["on off switch", "Switch"],
  ["filters in the url", "internal-app-url-filters"],
  ["add a primitive to the kit", "internal-app-adding-a-primitive"],
  ["optimistic update", "internal-app-mutations"],
  ["server function", "internal-app-server-functions"],
  ["StyleX tokens", "internal-app-tokens"],
  ["dark theme tokens", "internal-app-themes"],
  ["chart in a card", "internal-app-charts"],
  ["update the kit in an old app", "internal-app-kit-update"],
  ["RPC error handling", "internal-app-rpc"],
  ["review before finishing", "internal-app-review"],
  ["brand colors", "internal-app-brand-colors"],
  ["touch density", "internal-app-density"],
  ["view transition", "internal-app-motion"],
  ["vite config", "internal-app-build-wiring"],
  ["separator glyph", "internal-app-check-rules"],
  ["review checklist", "internal-app-review-checklist"],
  ["upgrade an existing app", "internal-app-upgrade"],
  ["tailwind classes to tokens", "internal-app-migration-map"],
  ["port a next.js app", "internal-app-framework-port"],
  ["effect service layer", "internal-app-effect-services"],
  ["error tracker", "internal-app-error-reporting"],
  ["route loader", "internal-app-routes"],
  ["form submit", "internal-app-form-submit"],
  ["stylex render props", "internal-app-stylex"],
  ["stack packages", "internal-app-stack"],
  ["color picker", "internal-app-adding-a-primitive"],
  ["project layout", "internal-app-project-layout"],
];

// The same needs in other words, written after the docs, so that the docs do
// not copy them.
const PARAPHRASES: ReadonlyArray<readonly [string, string]> = [
  ["board with a column for each stage", "Kanban"],
  ["move a job card to the next status", "Kanban"],
  ["list of all field errors at the top of the form", "form-errors"],
  ["pick a start and end day", "DateRangePicker"],
  ["grid of records with column sorting", "DataTable"],
  ["ask are you sure before removing", "ConfirmDialog"],
  ["attach a photo", "FileUpload"],
  ["short message that the change was saved", "Toaster"],
  ["colored label for the state of an order", "Badge"],
  ["queue of jobs for a technician", "WorkQueue"],
  ["history of changes to a record", "Timeline"],
  ["wizard", "Stepper"],
  ["stream of build output", "LogViewer"],
  ["change the order of rows by dragging", "SortableList"],
  ["plan of tasks over weeks", "Gantt"],
  ["schedule of appointments", "EventCalendar"],
  ["small chart of a value over time", "Sparkline"],
  ["drawer that opens from the side", "Sheet"],
  ["jump to any page with the keyboard", "CommandPalette"],
  ["choose one of several options", "RadioGroup"],
];

function expectTop3(queries: ReadonlyArray<readonly [string, string]>) {
  const misses: string[] = [];
  for (const [query, id] of queries) {
    const top = searchIds(query).slice(0, 3);
    if (!top.includes(id)) misses.push(`"${query}" wants ${id}, got ${top.join(", ") || "nothing"}`);
  }
  expect(misses).toEqual([]);
}

describe("design search inside the app", () => {
  test("golden queries rank the expected id in the top 3", { timeout: 60_000 }, () => expectTop3(GOLDEN));

  test("paraphrases rank the expected id in the top 3", { timeout: 60_000 }, () => expectTop3(PARAPHRASES));

  test("a component hit tells how to read its docs", () => {
    const result = run(DESIGN, ["search", "drag cards between columns"]);
    expect(result.stdout).toStartWith("Kanban [internal-app component, pattern]");
    expect(result.stdout).toMatch(/read: bun ".*internal-app" docs Kanban/);
  });

  test("error summary finds the note and the kit component that implements it", () => {
    const top = searchIds("error summary").slice(0, 5);
    expect(top).toContain("form-errors");
    expect(top).toContain("FormLayout");
  });

  test("the graph check passes with the entries of the app", () => {
    const result = run(DESIGN, ["graph", "--check"]);
    expect(result.stdout).toStartWith("ok: ");
  });
});
