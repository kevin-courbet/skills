import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { readKit, templateKitSource } from "../scripts/lib/kit-docs.ts";
import { LAB_INDEX, labIndexProblems, RECIPE_LINE_LIMIT, readRecipes, recipeProblems } from "../scripts/lib/recipes.ts";

const SKILL = resolve(import.meta.dir, "..");
const LAB = join(SKILL, "assets/lab");
const TEMPLATE = join(SKILL, "assets/template");
const INTERNAL_APP = join(SKILL, "scripts/internal-app");
const DESIGN = join(SKILL, "../design/scripts/design");
const manifest = JSON.parse(readFileSync(join(SKILL, "assets/kit.json"), "utf8"));

function run(cli: string, args: ReadonlyArray<string>) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("the recipes of the lab", () => {
  const recipes = readRecipes(LAB);

  test("each recipe keeps the recipe contract against the kit of the template", () => {
    const problems = recipeProblems(recipes, readKit(templateKitSource(TEMPLATE, manifest)));
    const found = [...problems].flatMap(([file, list]) => list.map((problem) => `${file}: ${problem}`));
    expect(found).toEqual([]);
  });

  test("the lab index links to each recipe", () => {
    expect(labIndexProblems(LAB, recipes)).toEqual([]);
  });

  test("each recipe stays under the line limit and has an Adapt it section", () => {
    for (const recipe of recipes) {
      expect(recipe.lines).toBeLessThanOrEqual(RECIPE_LINE_LIMIT);
      expect(recipe.sections.map((section) => section.title)).toContain("Adapt it");
    }
  });

  test("the lab only adds files to the template", () => {
    const result = spawnSync("git", ["ls-files", "--", "."], { cwd: LAB, encoding: "utf8" });
    const labFiles = result.stdout.split("\n").filter((line) => line !== "");
    for (const file of labFiles) expect(Bun.file(join(TEMPLATE, file)).size).toBe(0);
  });
});

describe("the recipe command", () => {
  test("lists the recipes", () => {
    const result = run(INTERNAL_APP, ["recipe"]);
    expect(result.code).toBe(0);
    for (const recipe of readRecipes(LAB)) expect(result.stdout).toContain(`  ${recipe.id} `);
  });

  test("prints one recipe in full with its companion files", () => {
    const result = run(INTERNAL_APP, ["recipe", "ListPage"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toStartWith("ListPage  (recipe)");
    expect(result.stdout).toContain("## Adapt it");
    expect(result.stdout).toContain("recipe ListPage#files");
    const files = run(INTERNAL_APP, ["recipe", "ListPage#files"]);
    expect(files.code).toBe(0);
    expect(files.stdout).toContain("// src/features/lab/");
  });

  test("fails with the nearest ids for an unknown recipe", () => {
    const result = run(INTERNAL_APP, ["recipe", "ListPag"]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('no recipe is named "ListPag". Nearest: ListPage');
  });

  test("design search finds a recipe with its read command", () => {
    const result = run(DESIGN, ["search", "list page with filters"]);
    expect(result.code).toBe(0);
    expect(result.stdout.split("\n")[0]).toStartWith("ListPage ");
    expect(result.stdout).toContain("recipe ListPage");
  });
});

describe("check in a scaffold with the lab", () => {
  test("fails when the lab index does not link to a recipe", () => {
    const app = join(mkdtempSync(join(tmpdir(), "internal-app-lab-")), "app");
    expect(run(INTERNAL_APP, ["new", app, "--lab"]).code).toBe(0);
    const index = join(app, LAB_INDEX);
    writeFileSync(index, readFileSync(index, "utf8").replace('to="/lab/work-board"', 'to="/lab"'));
    const result = run(INTERNAL_APP, ["check", app]);
    expect(result.code).toBe(1);
    expect(result.stdout).toContain('the lab index has no link to="/lab/work-board" for the recipe WorkBoard');
  });

  test("does not run the recipe rule in an app without the lab", () => {
    const app = join(mkdtempSync(join(tmpdir(), "internal-app-plain-")), "app");
    expect(run(INTERNAL_APP, ["new", app]).code).toBe(0);
    cpSync(join(LAB, "src/routes/_app/lab/list-page.tsx"), join(app, "src/routes/_app/list-copy.tsx"));
    expect(run(INTERNAL_APP, ["check", app]).stdout).not.toContain("recipes");
  });
});
