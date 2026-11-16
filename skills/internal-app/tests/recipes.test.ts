import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadGraph } from "../../design/scripts/lib/graph.ts";
import { hubKitSource, readKitDocs } from "../../design/scripts/lib/kit/docs.ts";
import { findUseCase, readKit, useCases } from "../../design/scripts/lib/kit/kit.ts";
import { labIndex, labIndexProblems, RECIPE_LINE_LIMIT, readRecipes, recipeProblems } from "../../design/scripts/lib/kit/recipes.ts";

const SKILLS = resolve(import.meta.dir, "../..");
const HUB = join(SKILLS, "design");
const DESIGN = join(HUB, "scripts/design");
const graph = loadGraph({ skillDir: HUB, invokedSkillDir: undefined });
const kit = readKit(HUB);
const useCase = findUseCase(useCases(graph), "internal-app");
const lab = useCase.app.lab!;

function run(args: ReadonlyArray<string>, cwd = SKILLS) {
  const result = spawnSync(process.execPath, [DESIGN, ...args], { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("the recipes of the internal-app lab", () => {
  const recipes = readRecipes(lab.dir, lab, useCase.name);

  test("each recipe keeps the recipe contract against the hub kit", () => {
    const problems = recipeProblems(recipes, readKitDocs(hubKitSource(kit.dir, kit.manifest)));
    const found = [...problems].flatMap(([file, list]) => list.map((problem) => `${file}: ${problem}`));
    expect(found).toEqual([]);
  });

  test("the lab index links to each recipe", () => {
    expect(labIndexProblems(lab.dir, lab, recipes)).toEqual([]);
  });

  test("each recipe stays under the line limit and has an Adapt it section", () => {
    for (const recipe of recipes) {
      expect(recipe.lines).toBeLessThanOrEqual(RECIPE_LINE_LIMIT);
      expect(recipe.sections.map((section) => section.title)).toContain("Adapt it");
    }
  });

  test("each recipe names its use case", () => {
    for (const recipe of recipes) expect(recipe.useCase).toBe("internal-app");
  });
});

describe("design recipe", () => {
  test("lists the recipes", () => {
    const result = run(["recipe"]);
    expect(result.code).toBe(0);
    for (const recipe of readRecipes(lab.dir, lab, useCase.name)) expect(result.stdout).toContain(`  ${recipe.id} `);
  });

  test("prints one recipe in full with its companion files", () => {
    const result = run(["recipe", "ListPage"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith("ListPage  (recipe)");
    expect(result.stdout).toContain("## Adapt it");
    expect(result.stdout).toContain("design recipe ListPage#files");
    const files = run(["recipe", "ListPage#files"]);
    expect(files.code).toBe(0);
    expect(files.stdout).toContain(`// ${lab.files}`);
  });

  test("fails with the nearest ids for an unknown recipe", () => {
    const result = run(["recipe", "ListPag"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('no recipe is named "ListPag". Nearest: ListPage');
  });

  test("design search finds a recipe with its read command", () => {
    const result = run(["search", "list page with filters"]);
    expect(result.code).toBe(0);
    expect(result.stdout.split("\n")[0]).toStartWith("ListPage [internal-app recipe, page]");
    expect(result.stdout).toContain("read: design recipe ListPage");
  });
});

describe("design check in a scaffold with the lab", () => {
  test("fails when the lab index does not link to a recipe", () => {
    const app = join(mkdtempSync(join(tmpdir(), "internal-app-lab-")), "app");
    expect(run(["new", app, "--app", "internal-app", "--lab"]).code).toBe(0);
    const index = join(app, labIndex(lab));
    writeFileSync(index, readFileSync(index, "utf8").replace('to="/lab/work-board"', 'to="/lab"'));
    const result = run(["check", app]);
    expect(result.code).toBe(1);
    expect(result.stdout).toContain('the lab index has no link to="/lab/work-board" for the recipe WorkBoard');
  });

  test("does not run the recipe rule in an app without the lab", () => {
    const app = join(mkdtempSync(join(tmpdir(), "internal-app-plain-")), "app");
    expect(run(["new", app, "--app", "internal-app"]).code).toBe(0);
    cpSync(join(lab.dir, lab.pages, "list-page.tsx"), join(app, "src/routes/_app/list-copy.tsx"));
    expect(run(["check", app]).stdout).not.toContain("recipes");
  });
});
