import { afterEach, describe, expect, test } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { run, type RunResult } from "../scripts/lib/cli.ts";
import { loadGraph } from "../scripts/lib/graph.ts";
import { search } from "../scripts/lib/search.ts";

const SKILL_DIR = resolve(import.meta.dir, "..");
const SCRIPT = join(SKILL_DIR, "scripts", "design");

interface RankedQuery {
  readonly query: string;
  readonly expect: ReadonlyArray<string>;
}

// "queries" use the words of the notes and must give a strong match.
// "paraphrases" ask the same questions in other words, written without the
// notes, and check only the ranking. "weak" asks about topics that no note
// covers, and the search must say that it has no strong match.
const golden = JSON.parse(readFileSync(join(import.meta.dir, "golden.json"), "utf8")) as {
  queries: ReadonlyArray<RankedQuery>;
  paraphrases: ReadonlyArray<RankedQuery>;
  weak: ReadonlyArray<{ readonly query: string }>;
};

const temporary: string[] = [];
afterEach(() => {
  for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true });
});

// Copies the hub into a temporary skills folder, so that a test can break it.
function copyHub(): { root: string; hub: string } {
  const root = mkdtempSync(join(tmpdir(), "design-graph-"));
  temporary.push(root);
  const hub = join(root, "skills", "design");
  mkdirSync(join(root, "skills"), { recursive: true });
  cpSync(SKILL_DIR, hub, { recursive: true, filter: (source) => !source.includes(`${SKILL_DIR}/tests`) });
  return { root, hub };
}

function cli(skillDir: string, ...argv: string[]): RunResult {
  return run(argv, { skillDir });
}

function edit(file: string, change: (text: string) => string): void {
  writeFileSync(file, change(readFileSync(file, "utf8")));
}

function addMember(skillsDir: string, name: string, files: Record<string, string>): string {
  const dir = join(skillsDir, name);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

const memberSkill = (name: string, body: string) => `---\nname: ${name}\ndescription: A test skill.\n---\n\n# ${name}\n\n${body}\n`;

const memberNote = (id: string, extra = "") =>
  `---\nid: ${id}\ntopic: forms\nsummary: The forms of the demo product.\nkeywords: [demo forms, demo, product forms]\nspecializes: [forms]\n${extra}---\n\n# Demo Forms\n\nThe demo product uses one column.\n\n## One Column\n\nPut every field in one column. See [[form-layout]].\n`;

describe("golden queries", () => {
  const graph = loadGraph({ skillDir: SKILL_DIR });
  for (const entry of golden.queries) {
    test(`"${entry.query}" finds ${entry.expect.join(" or ")} in the top 3 with a strong match`, () => {
      const result = search(graph, entry.query, 3);
      expect(entry.expect.some((id) => result.hits.some((hit) => hit.note.id === id))).toBe(true);
      expect(result.strong).toBe(true);
    });
  }
  for (const entry of golden.paraphrases) {
    test(`paraphrase "${entry.query}" finds ${entry.expect.join(" or ")} in the top 3`, () => {
      const top = search(graph, entry.query, 3).hits.map((hit) => hit.note.id);
      expect(entry.expect.some((id) => top.includes(id))).toBe(true);
    });
  }
  for (const entry of golden.weak) {
    test(`"${entry.query}" has no strong match`, () => {
      expect(search(graph, entry.query, 3).strong).toBe(false);
    });
  }
});

describe("the real graph", () => {
  test("graph --check passes", () => {
    const result = cli(SKILL_DIR, "graph", "--check");
    expect(result.stdout).toStartWith("ok: ");
    expect(result.code).toBe(0);
  });

  test("every note is in the list", () => {
    const result = cli(SKILL_DIR, "list");
    const graph = loadGraph({ skillDir: SKILL_DIR });
    for (const note of graph.ordered) expect(result.stdout).toContain(`  ${note.id} `);
    expect(result.code).toBe(0);
  });
});

describe("read", () => {
  test("prints the note, the required notes with summaries, and the other ids on one line", () => {
    const result = cli(SKILL_DIR, "read", "form-errors");
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith("form-errors (topic forms,");
    expect(result.stdout).toContain("## Error Summary");
    expect(result.stdout).toMatch(/Read first:\n {2}requires {4}forms {2}The entry note for forms/);
    expect(result.stdout).toMatch(/\nSee also: form-fields, form-layout, accessibility, overlays, ux-writing\n$/);
    expect(result.stdout).not.toContain("Links:");
  });

  test("prints one section", () => {
    const result = cli(SKILL_DIR, "read", "form-errors#error-summary");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("## Error Summary");
    expect(result.stdout).not.toContain("## Field Errors");
    expect(result.stdout).toContain("Other sections: #field-errors");
  });

  test("prints an outline", () => {
    const result = cli(SKILL_DIR, "read", "dark-theme", "--outline");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("summary: ");
    expect(result.stdout).toContain("  #surface-hierarchy");
    expect(result.stdout).toContain("Links:");
    expect(result.stdout).toMatch(/Links:\n {2}requires {4}graphite +Graphite is[\s\S]*\n {2}related {5}color +Build color/);
    expect(result.stdout).not.toContain("See also:");
    expect(result.stdout).not.toContain("## Surface Hierarchy");
  });

  test("an unknown id fails with the nearest ids", () => {
    const result = cli(SKILL_DIR, "read", "form-error");
    expect(result.code).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain('no note has the id "form-error"');
    expect(result.stderr).toContain("Nearest: form-errors");
  });

  test("an unknown section fails with the sections of the note", () => {
    const result = cli(SKILL_DIR, "read", "form-errors#summary-of-errors");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('has no section "#summary-of-errors"');
    expect(result.stderr).toContain("#error-summary");
  });
});

describe("other commands", () => {
  test("search prints ids, summaries, and sections", () => {
    const result = cli(SKILL_DIR, "search", "error", "summary");
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith("form-errors  ");
    expect(result.stdout).toContain("#error-summary");
  });

  test("search warns before results that cover only part of the question", () => {
    const result = cli(SKILL_DIR, "search", "kanban board columns");
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith(
      '(no note contains: kanban, board)\nNo strong match for "kanban board columns". The best note contains 1 of 3 query words.',
    );
  });

  test("search does not warn for a strong match", () => {
    const result = cli(SKILL_DIR, "search", "popover transform origin");
    expect(result.stdout).toStartWith("component-feel  ");
    expect(result.stdout).not.toContain("No strong match");
  });

  test("search without a match fails", () => {
    const result = cli(SKILL_DIR, "search", "zzzz qqqq");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("No note matches");
  });

  test("search respects --limit", () => {
    const result = cli(SKILL_DIR, "search", "form", "--limit", "2");
    expect(result.stdout.split("\n").filter((line) => /^[a-z]/.test(line))).toHaveLength(2);
  });

  test("links prints both directions", () => {
    const result = cli(SKILL_DIR, "links", "forms");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Links from this note:\n  method");
    expect(result.stdout).toContain("SKILL.md of the design skill");
    expect(result.stdout).toMatch(/Links to this note:[\s\S]*form-layout +requires/);
  });

  test("usage errors exit with status 2", () => {
    expect(cli(SKILL_DIR).code).toBe(2);
    expect(cli(SKILL_DIR, "graph").code).toBe(2);
    expect(cli(SKILL_DIR, "fly").stderr).toContain('unknown command "fly"');
    expect(cli(SKILL_DIR, "help").code).toBe(0);
  });
});

describe("graph --check finds problems", () => {
  const failing = (hub: string, message: string) => {
    const result = cli(hub, "graph", "--check");
    expect(result.code).toBe(1);
    expect(result.stdout).toContain(message);
    return result.stdout;
  };

  test("a broken link", () => {
    const { hub } = copyHub();
    edit(join(hub, "notes", "tables.md"), (text) => text.replace("[[graphite]]", "[[graphit]]"));
    const output = failing(hub, 'broken link "graphit"');
    expect(output).toContain("nearest: graphite");
    expect(output).toMatch(/notes\/tables\.md:\d+: mentions/);
  });

  test("a broken section link", () => {
    const { hub } = copyHub();
    edit(join(hub, "notes", "tables.md"), (text) => text.replace("[[graphite]]", "[[graphite#colors]]"));
    failing(hub, "has no section #colors");
  });

  test("a duplicate id", () => {
    const { hub } = copyHub();
    edit(join(hub, "notes", "overlays.md"), (text) => text.replace("id: overlays", "id: navigation"));
    failing(hub, 'id "navigation" must match the file name');
    cpSync(join(hub, "notes", "overlays.md"), join(hub, "notes", "navigation-copy.md"));
    failing(hub, "duplicate id");
  });

  test("missing and wrong front matter", () => {
    const { hub } = copyHub();
    edit(join(hub, "notes", "overlays.md"), (text) => text.replace(/^summary: .*\n/m, "").replace("keywords: [", "keywords: [modal, "));
    const output = failing(hub, 'missing required key "summary"');
    expect(output).toContain('duplicate keyword "modal"');
    writeFileSync(join(hub, "notes", "loose.md"), "# Loose\n\nNo front matter.\n");
    failing(hub, "the file must start with front matter");
  });

  test("a note over the word limit", () => {
    const { hub } = copyHub();
    edit(join(hub, "notes", "overlays.md"), (text) => `${text}\n## Filler\n\n${"word ".repeat(1000)}\n`);
    failing(hub, "the limit is 1000");
  });

  test("an unreachable note", () => {
    const { hub } = copyHub();
    writeFileSync(
      join(hub, "notes", "orphan.md"),
      "---\nid: orphan\ntopic: layout\nsummary: A note that no link reaches.\nkeywords: [orphan, lost, alone]\nrelated: [hierarchy]\n---\n\n# Orphan\n\nText.\n",
    );
    failing(hub, 'the note "orphan" cannot be reached');
  });

  test("a missing asset", () => {
    const { hub } = copyHub();
    edit(join(hub, "notes", "graphite.md"), (text) => text.replace("`assets/themes/graphite.css` contains", "`assets/themes/graphite-v2.css` contains"));
    failing(hub, 'the asset path "assets/themes/graphite-v2.css" does not exist');
  });
});

describe("graph membership", () => {
  test("a sibling skill with design-graph.json joins the graph", () => {
    const { root, hub } = copyHub();
    addMember(join(root, "skills"), "demo-skill", {
      "design-graph.json": '{ "notes": "notes" }\n',
      "SKILL.md": memberSkill("demo-skill", "Before a form, run `design read demo-skill-forms`."),
      "notes/demo-skill-forms.md": memberNote("demo-skill-forms"),
    });
    addMember(join(root, "skills"), "plain-skill", { "SKILL.md": memberSkill("plain-skill", "No graph.") });

    const check = cli(hub, "graph", "--check");
    expect(check.stdout).toContain("2 skills (design, demo-skill)");
    expect(check.code).toBe(0);

    const forms = cli(hub, "read", "forms");
    expect(forms.stdout).toContain("Specialized by:\n  demo-skill-forms [demo-skill]");

    const member = cli(hub, "read", "demo-skill-forms");
    expect(member.stdout).toStartWith("demo-skill-forms [demo-skill]");
    expect(member.stdout).toContain("specializes forms");

    expect(cli(hub, "list").stdout).toContain("demo-skill-forms [demo-skill]");
    expect(cli(hub, "search", "demo forms").stdout).toStartWith("demo-skill-forms [demo-skill]");
  });

  test("the graph follows the install folder of a symbolic link", () => {
    const { root, hub } = copyHub();
    const install = join(root, "install", ".agents", "skills");
    mkdirSync(install, { recursive: true });
    symlinkSync(hub, join(install, "design"));
    addMember(install, "demo-skill", {
      "design-graph.json": '{ "notes": "notes" }\n',
      "SKILL.md": memberSkill("demo-skill", "Run `design read demo-skill-forms`."),
      "notes/demo-skill-forms.md": memberNote("demo-skill-forms"),
    });
    const result = run(["graph", "--check"], { skillDir: hub, invokedSkillDir: join(install, "design") });
    expect(result.stdout).toContain("2 skills (design, demo-skill)");
    expect(result.code).toBe(0);
  });

  test("a member note without the skill prefix fails", () => {
    const { root, hub } = copyHub();
    addMember(join(root, "skills"), "demo-skill", {
      "design-graph.json": '{ "notes": "notes" }\n',
      "SKILL.md": memberSkill("demo-skill", "Run `design read demo-forms`."),
      "notes/demo-forms.md": memberNote("demo-forms"),
    });
    const result = cli(hub, "graph", "--check");
    expect(result.code).toBe(1);
    expect(result.stdout).toContain('must have an id that starts with "demo-skill-"');
  });

  test("an unreachable member note fails", () => {
    const { root, hub } = copyHub();
    addMember(join(root, "skills"), "demo-skill", {
      "design-graph.json": '{ "notes": "notes" }\n',
      "SKILL.md": memberSkill("demo-skill", "No link to the notes."),
      "notes/demo-skill-forms.md": memberNote("demo-skill-forms"),
    });
    const result = cli(hub, "graph", "--check");
    expect(result.code).toBe(1);
    expect(result.stdout).toContain('the note "demo-skill-forms" cannot be reached');
  });

  test("a bad membership file fails", () => {
    const { root, hub } = copyHub();
    addMember(join(root, "skills"), "demo-skill", {
      "design-graph.json": "{ notes: notes }\n",
      "SKILL.md": memberSkill("demo-skill", "Nothing."),
    });
    const result = cli(hub, "graph", "--check");
    expect(result.code).toBe(1);
    expect(result.stdout).toContain("design-graph.json is not valid JSON");
    expect(cli(hub, "list").stderr).toContain("warning: the design graph has 1 load problem");
  });

  test("a hub note that links to a member note fails", () => {
    const { root, hub } = copyHub();
    addMember(join(root, "skills"), "demo-skill", {
      "design-graph.json": '{ "notes": "notes" }\n',
      "SKILL.md": memberSkill("demo-skill", "Run `design read demo-skill-forms`."),
      "notes/demo-skill-forms.md": memberNote("demo-skill-forms"),
    });
    edit(join(hub, "notes", "forms.md"), (text) => text.replace("related: [", "related: [demo-skill-forms, "));
    const result = cli(hub, "graph", "--check");
    expect(result.code).toBe(1);
    expect(result.stdout).toContain("the hub must work without its members");
  });
});

describe("the executable", () => {
  test("prints plain text and sets the exit status", () => {
    const ok = Bun.spawnSync(["bun", SCRIPT, "read", "forms", "--outline"], { env: { ...process.env, NO_COLOR: "" } });
    expect(ok.exitCode).toBe(0);
    expect(ok.stdout.toString()).not.toContain("\u001b[");
    const missing = Bun.spawnSync(["bun", SCRIPT, "read", "no-such-note"]);
    expect(missing.exitCode).toBe(1);
    expect(missing.stderr.toString()).toContain('no note has the id "no-such-note"');
  });
});
