import { beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DOC_WORD_LIMIT } from "../../design/scripts/lib/kit/docs.ts";
import { countWords } from "../../design/scripts/lib/text.ts";

const SKILLS = resolve(import.meta.dir, "../..");
const DESIGN = join(SKILLS, "design/scripts/design");

// These docs are longer than the limit, so the docs command prints their
// outline and the agent reads one part at a time.
const OUTLINE_DOCS = ["AppShell", "Calendar", "DataTable", "EventCalendar", "FormLayout", "Gantt", "Layout", "WorkQueue"];

let app = "";

function run(args: ReadonlyArray<string>) {
  const result = spawnSync(process.execPath, [DESIGN, ...args], { cwd: app, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

// The ids of the results of `design search`, in rank order. A result line
// starts with the id; the lines under it are indented.
function searchIds(query: string): string[] {
  const result = run(["search", query]);
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
  const created = spawnSync(process.execPath, [DESIGN, "new", app, "--app", "internal-app"], { encoding: "utf8" });
  if (created.status !== 0) throw new Error(`design new failed: ${created.stderr}`);
});

describe("the kit docs of a new app", () => {
  test("check finds no doc comment problems", () => {
    const result = run(["check", "--json"]);
    const report = JSON.parse(result.stdout) as { findings: ReadonlyArray<{ rule: string; file: string; text: string }> };
    const kitDocs = report.findings.filter((item) => item.rule === "kit-docs").map((item) => `${item.file}: ${item.text}`);
    expect(kitDocs).toEqual([]);
  });

  test("check fails when the @layer of a kit file does not agree with its folder", () => {
    const file = join(app, "src/components/patterns/kanban.tsx");
    const original = readFileSync(file, "utf8");
    writeFileSync(file, original.replace(" * @layer pattern\n", " * @layer primitive\n"));
    try {
      const result = run(["check", "--json"]);
      expect(result.code).toBe(1);
      const report = JSON.parse(result.stdout) as { findings: ReadonlyArray<{ rule: string; file: string; line: number; text: string }> };
      expect(report.findings).toContainEqual({
        rule: "kit-docs",
        file: "src/components/patterns/kanban.tsx",
        line: 1,
        text: "@layer primitive does not agree with the folder of the file; put a primitive file in src/components/primitives/",
      });
    } finally {
      writeFileSync(file, original);
    }
  });

  test("check fails on a file in src/components/ that is not a kit file", () => {
    const file = join(app, "src/components/patterns/visit-summary.tsx");
    writeFileSync(file, "export function VisitSummary() {\n  return null;\n}\n");
    try {
      const result = run(["check", "--json"]);
      expect(result.code).toBe(1);
      const report = JSON.parse(result.stdout) as { findings: ReadonlyArray<{ rule: string; file: string; line: number; text: string }> };
      expect(report.findings.filter((item) => item.rule === "kit-folder")).toEqual([
        {
          rule: "kit-folder",
          file: "src/components/patterns/visit-summary.tsx",
          line: 1,
          text: "not a kit file; move it to src/features/<name>/ui/",
        },
      ]);
      expect(run(["check"]).stdout).toContain("Move each app file to src/features/<name>/ui/");
    } finally {
      rmSync(file);
    }
  });

  test("the catalog lists every component under its layer and reads the installed kit", () => {
    const result = run(["components"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith("Primitives (");
    expect(result.stdout).toContain("\nPatterns (");
    expect(result.stdout).toContain("\nShell (");
    expect(result.stdout).not.toContain("No layer (");
    expect(result.stdout).not.toContain("warning:");
    expect(result.stdout).toContain(`the installed kit of the internal-app app at ${app}`);
  });

  test("each doc prints in full under the word limit, or as an outline whose parts are under it", { timeout: 120_000 }, () => {
    const listed = JSON.parse(run(["components", "--json"]).stdout) as { components: ReadonlyArray<{ id: string }> };
    const outlines: string[] = [];
    const tooLong: string[] = [];
    for (const { id } of listed.components) {
      const result = run(["docs", id]);
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
        const printed = run(["docs", part]);
        expect(printed.code).toBe(0);
        if (bodyWords(printed.stdout) > DOC_WORD_LIMIT) tooLong.push(`${part} (${bodyWords(printed.stdout)} words)`);
      }
    }
    expect(tooLong).toEqual([]);
    expect(outlines.sort()).toEqual(OUTLINE_DOCS);
  });

  test("docs Kanban prints the doc comment and the props", () => {
    const result = run(["docs", "Kanban"]);
    expect(result.stdout).toStartWith("Kanban  (pattern)  src/components/patterns/kanban.tsx");
    expect(result.stdout).toContain("## Behavior");
    expect(result.stdout).toContain("## Example");
    expect(result.stdout).toContain("### Kanban");
    expect(result.stdout).toContain("Design notes: patterns, motion, kit-composition, kit-states.");
  });

  test("docs prints no default for a prop that a variant does not take", () => {
    const result = run(["docs", "Indicator"]);
    expect(result.stdout).toContain("- `max?`: `number`. Default `99`.");
    expect(result.stdout).toContain("- `max?`: `undefined`. Only a count has a max.");
    expect(result.stdout).toContain("- `isVisible?`: `boolean`. Default `true`.");
    expect(result.stdout).not.toContain("`undefined`. Default");
  });

  test("docs finds an export by name and errors on an unknown name", () => {
    expect(run(["docs", "CheckboxGroup"]).stdout).toStartWith("Checkbox  (primitive)");
    const unknown = run(["docs", "Kanbna"]);
    expect(unknown.code).toBe(1);
    expect(unknown.stderr).toContain('no kit doc or export is named "Kanbna". Nearest: Kanban');
  });
});

// Each query in the words of the docs, the notes, and the recipes, and the id
// that must rank in the top 3 of `design search` inside the app.
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
  ["work list for a tablet", "kit-touch-work-view"],
  ["split form section", "form-layout"],
  ["preview of a printed tag", "kit-form-preview"],
  ["timeline of events", "Timeline"],
  ["steps of a process", "Stepper"],
  ["log viewer", "LogViewer"],
  ["tree of folders", "Tree"],
  ["reorder a list by drag", "SortableList"],
  ["gantt chart", "Gantt"],
  ["week calendar of events", "EventCalendar"],
  ["inline calendar", "Calendar"],
  ["range calendar", "Calendar"],
  ["calendar with unavailable dates", "Calendar"],
  ["jump to a month and a year", "Calendar"],
  ["color swatch", "ColorSwatch"],
  ["swatch picker", "ColorSwatch"],
  ["notification count on an icon", "Indicator"],
  ["online dot on an avatar", "Indicator"],
  ["unread count", "Indicator"],
  ["trend chart", "TrendChart"],
  ["copy to clipboard", "CopyButton"],
  ["command palette", "CommandPalette"],
  ["side sheet", "Sheet"],
  ["on off switch", "Switch"],
  ["filters in the url", "kit-url-filters"],
  ["add a primitive to the kit", "kit-adding-a-component"],
  ["optimistic update", "internal-app-mutations"],
  ["server function", "internal-app-server-functions"],
  ["StyleX tokens", "kit-tokens"],
  ["dark theme tokens", "kit-themes"],
  ["chart in a card", "kit-charts"],
  ["update the kit in an old app", "kit-update"],
  ["RPC error handling", "internal-app-rpc"],
  ["review before finishing", "internal-app-review"],
  ["brand colors", "kit-brand-colors"],
  ["touch density", "kit-density"],
  ["view transition", "kit-motion"],
  ["vite config", "internal-app-build-wiring"],
  ["separator glyph", "kit-check-rules"],
  ["review checklist", "internal-app-review-checklist"],
  ["upgrade an existing app", "internal-app-upgrade"],
  ["tailwind classes to tokens", "kit-migration-map"],
  ["port a next.js app", "internal-app-framework-port"],
  ["effect service layer", "internal-app-effect-services"],
  ["error tracker", "internal-app-error-reporting"],
  ["route loader", "internal-app-routes"],
  ["form submit", "internal-app-form-submit"],
  ["stylex render props", "kit-stylex"],
  ["stack packages", "internal-app-stack"],
  ["color picker", "kit-adding-a-component"],
  ["project layout", "internal-app-project-layout"],
  ["list page with filters", "ListPage"],
  ["detail page of one record", "DetailPage"],
  ["settings page", "SettingsPage"],
  ["long form with a live preview", "PreviewForm"],
  ["work board", "WorkBoard"],
  ["touch queue on a shared tablet", "TouchQueue"],
  ["overview page with kpi tiles", "OverviewPage"],
  ["approval list", "ApprovalList"],
  ["parts list with a total row", "Table"],
  ["small static table", "Table"],
  ["text link", "TextLink"],
  ["external link", "TextLink"],
  ["toggle button", "ToggleButton"],
  ["progress ring", "ProgressCircle"],
  ["scroll fade", "ScrollShadow"],
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
  ["pick a day from a month that stays on the page", "Calendar"],
  ["booking days shown as a month grid", "Calendar"],
  ["small colored circle before a team name", "ColorSwatch"],
  ["pick a color for a tag", "ColorSwatch"],
  ["label color for a project", "ColorSwatch"],
  ["small number in the corner of a button", "Indicator"],
  ["mark on a profile picture that the person is online", "Indicator"],
  ["how many messages wait, shown on the icon", "Indicator"],
  ["small chart of a value over time", "Sparkline"],
  ["drawer that opens from the side", "Sheet"],
  ["jump to any page with the keyboard", "CommandPalette"],
  ["choose one of several options", "RadioGroup"],
  ["show the change at once before the server answers", "internal-app-mutations"],
  ["call backend code from a page", "internal-app-server-functions"],
  ["which variable to use for a background color", "kit-tokens"],
  ["colors for night mode", "kit-themes"],
  ["put a graph inside a box on the dashboard", "kit-charts"],
  ["bring an app with an older kit up to date", "kit-update"],
  ["typed failures from a separate api service", "internal-app-rpc"],
  ["what to verify before handing off a change", "internal-app-review"],
  ["use the company colors", "kit-brand-colors"],
  ["bigger buttons for fingers on a tablet", "kit-density"],
  ["animate a card when it moves to another column", "kit-motion"],
  ["plugin order in the bundler config", "internal-app-build-wiring"],
  ["lint finding for a dot between values", "kit-check-rules"],
  ["questions to ask about a finished page", "internal-app-review-checklist"],
  ["move an old app onto the house stack", "internal-app-upgrade"],
  ["what replaces a shadcn component", "kit-migration-map"],
  ["rewrite a remix project", "internal-app-framework-port"],
  ["dependency injection on the server", "internal-app-effect-services"],
  ["send crashes to sentry", "internal-app-error-reporting"],
  ["load data before the page renders", "internal-app-routes"],
  ["save a form to the database", "internal-app-form-submit"],
  ["style a react aria button by state", "kit-stylex"],
  ["which libraries are allowed", "internal-app-stack"],
  ["control that the kit does not have", "kit-adding-a-component"],
  ["where do files go in the app", "internal-app-project-layout"],
  ["table of tickets with search and paging", "ListPage"],
  ["one ticket with its facts and actions", "DetailPage"],
  ["preferences that save on their own", "SettingsPage"],
  ["big form with a preview panel", "PreviewForm"],
  ["move tickets between stages", "WorkBoard"],
  ["my jobs on a kiosk tablet", "TouchQueue"],
  ["home page with key numbers and a trend", "OverviewPage"],
  ["inbox of requests to approve", "ApprovalList"],
  ["costs of a repair with a grand total", "Table"],
  ["link inside a paragraph", "TextLink"],
  ["open a website in a new tab", "TextLink"],
  ["button that stays down when clicked", "ToggleButton"],
  ["percent done in a narrow cell", "ProgressCircle"],
  ["hint that a box has more items past its edge", "ScrollShadow"],
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
    const result = run(["search", "drag cards between columns"]);
    expect(result.stdout).toStartWith("Kanban [component, pattern]");
    expect(result.stdout).toContain("read: design docs Kanban");
  });

  test("error summary finds the note and the kit component that implements it", () => {
    const top = searchIds("error summary").slice(0, 5);
    expect(top).toContain("form-errors");
    expect(top).toContain("FormLayout");
  });

  test("the graph check passes with the entries of the app", () => {
    const result = run(["graph", "--check"]);
    expect(result.stdout).toStartWith("ok: ");
  });
});
