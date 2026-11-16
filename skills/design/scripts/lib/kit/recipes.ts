// Reads the recipes of a use case: complete, small pages that compose the kit
// for one common page type. The recipes live in the lab overlay of the use
// case, not in the kit, so that sync never writes demo pages into an app. An
// agent prints a recipe, copies it into the app, and adapts it.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LabConfig } from "../graph.ts";
import { levenshtein } from "../text.ts";
import { KitError } from "./files.ts";
import {
  docId,
  type DocSection,
  exportNames,
  type KitDoc,
  leadingComment,
  list,
  lookup,
  parseComment,
} from "./docs.ts";

// The lab config of a use case names three app folders. The recipe pages are
// routes in `pages`, so that a scaffold with the lab builds and type-checks
// each one in the real app shell. The companion files of the recipes are in
// `files`, where an app keeps the code of a feature, so that check applies the
// same rules to them as to app code. The lab index lists the recipes; it is a
// lab page, not a recipe.
export function labIndex(lab: LabConfig): string {
  return `${lab.pages}index.tsx`;
}

// A recipe that is longer than this teaches too many things at once. Split the
// page, or move the example data or an app component to a file in @files.
export const RECIPE_LINE_LIMIT = 250;

const RECIPE_TAGS: ReadonlySet<string> = new Set(["keywords", "components", "notes", "files"]);
const ADAPT_SECTION = "Adapt it";

export interface Recipe {
  readonly id: string;
  // The use case that owns the lab of the recipe.
  readonly useCase: string;
  // The path of the recipe page, relative to the lab folder and to an app root.
  readonly file: string;
  // The URL path of the recipe page in a scaffold with the lab.
  readonly route: string;
  readonly summary: string;
  readonly intro: string;
  readonly keywords: ReadonlyArray<string>;
  readonly components: ReadonlyArray<string>;
  readonly notes: ReadonlyArray<string>;
  // The other lab files that the page imports: its example data, and the app
  // components that it owns, in the files folder of the lab.
  readonly files: ReadonlyArray<string>;
  readonly sections: ReadonlyArray<DocSection>;
  readonly lines: number;
  readonly text: string;
  readonly problems: ReadonlyArray<string>;
}

// "detail-page.$ticketId.tsx" is the recipe DetailPage. The segments after the
// first dot are route params, which are not part of the id.
function recipeId(file: string): string {
  return docId(file.slice(file.lastIndexOf("/") + 1).split(".")[0]!);
}

function routePath(lab: LabConfig, file: string): string {
  const name = file.slice(lab.pages.length).replace(/\.tsx$/, "");
  return `${lab.route}${name.split(".").join("/")}`;
}

// The recipe pages of a lab. `root` is the lab folder of the skill, or an app
// that is a scaffold with the lab, because both have the same layout.
export function recipeFiles(root: string, lab: LabConfig): string[] {
  const folder = join(root, lab.pages);
  if (!existsSync(folder)) throw new KitError(`the lab has no recipe folder at ${folder}`);
  return readdirSync(folder)
    .filter((name) => name.endsWith(".tsx") && `${lab.pages}${name}` !== labIndex(lab))
    .sort()
    .map((name) => `${lab.pages}${name}`);
}

export function readRecipe(root: string, lab: LabConfig, useCase: string, file: string): Recipe {
  const text = readFileSync(join(root, file), "utf8").replace(/\r\n?/g, "\n");
  const lines = text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
  const problems: string[] = [];
  const raw = leadingComment(text);
  const base = { id: recipeId(file), useCase, file, route: routePath(lab, file), lines, text };
  if (raw === null) {
    return { ...base, summary: "", intro: "", keywords: [], components: [], notes: [], files: [], sections: [], problems: ["the recipe does not start with a doc comment (/** ... */)"] };
  }
  const parsed = parseComment(raw, RECIPE_TAGS, problems);
  const keywords = list(parsed.tags.get("keywords") ?? "");
  const components = list(parsed.tags.get("components") ?? "");
  const notes = list(parsed.tags.get("notes") ?? "");
  const files = list(parsed.tags.get("files") ?? "");
  if (parsed.summary === "") problems.push("the doc comment has no summary sentence that names the page type");
  else if (!parsed.summary.endsWith(".")) problems.push("the summary must be one sentence that ends with a period");
  if (parsed.intro === "") problems.push("the doc comment needs an introduction: when to use the page type and when not to");
  if (keywords.length < 3) problems.push("give at least 3 @keywords, including the words that a builder types");
  if (components.length === 0) problems.push("give the kit components that the recipe composes in @components");
  if (notes.length === 0) problems.push("give the design notes that the recipe applies in @notes");
  if (!parsed.sections.some((section) => section.title === ADAPT_SECTION)) {
    problems.push(`the doc comment needs a "## ${ADAPT_SECTION}" section: the decisions an agent makes when it adapts the recipe`);
  }
  for (const path of files) {
    if (!existsSync(join(root, path))) problems.push(`@files ${path} is not a file of the lab`);
    else if (!path.startsWith(lab.files)) problems.push(`@files ${path} must be in ${lab.files}, where an app keeps the code of a feature`);
  }
  if (lines > RECIPE_LINE_LIMIT) problems.push(`the recipe has ${lines} lines; the limit is ${RECIPE_LINE_LIMIT}. Move the example data or an app component to a file in @files, or split the page`);
  return { ...base, summary: parsed.summary, intro: parsed.intro, keywords, components, notes, files, sections: parsed.sections, problems };
}

export function readRecipes(root: string, lab: LabConfig, useCase: string): Recipe[] {
  return recipeFiles(root, lab).map((file) => readRecipe(root, lab, useCase, file));
}

// Problems that need the kit: components that the kit does not have, and ids
// that a kit doc or an export already uses, which would make a search result
// and a docs lookup ambiguous.
export function recipeProblems(recipes: ReadonlyArray<Recipe>, docs: ReadonlyArray<KitDoc>): Map<string, string[]> {
  const problems = new Map(recipes.map((recipe) => [recipe.file, [...recipe.problems]]));
  const kitNames = new Map<string, string>();
  for (const doc of docs) for (const name of [doc.id, ...exportNames(doc.exports)]) kitNames.set(name.toLowerCase(), doc.file);
  for (const recipe of recipes) {
    const own = problems.get(recipe.file)!;
    const taken = kitNames.get(recipe.id.toLowerCase());
    if (taken !== undefined) own.push(`the recipe id ${recipe.id} is also a kit doc id or an export of ${taken}; rename the recipe file`);
    for (const component of missingComponents(recipe, docs)) own.push(`@components ${component} is not a kit doc id or export`);
  }
  return problems;
}

// The lab index links to each recipe, so that each recipe stays one click away
// in a scaffold with the lab.
export function labIndexProblems(root: string, lab: LabConfig, recipes: ReadonlyArray<Recipe>): string[] {
  const index = join(root, labIndex(lab));
  if (!existsSync(index)) return [`the lab has no index page at ${labIndex(lab)}`];
  const text = readFileSync(index, "utf8");
  return recipes
    .filter((recipe) => !text.includes(`to="${recipe.route}"`))
    .map((recipe) => `the lab index has no link to="${recipe.route}" for the recipe ${recipe.id}`);
}

export function missingComponents(recipe: Recipe, docs: ReadonlyArray<KitDoc>): string[] {
  return recipe.components.filter((component) => "error" in lookup(docs, component));
}

export function findRecipe(recipes: ReadonlyArray<Recipe>, target: string): Recipe | { readonly error: string } {
  const wanted = target.toLowerCase();
  const found = recipes.find((recipe) => recipe.id.toLowerCase() === wanted);
  if (found) return found;
  const near = recipes
    .map((recipe) => ({ id: recipe.id, distance: levenshtein(recipe.id.toLowerCase(), wanted) }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 3)
    .map((item) => item.id);
  return { error: `no recipe is named "${target}". Nearest: ${near.join(", ")}.` };
}

export interface RecipeContext {
  // The command that prints one recipe, with {id} for the target.
  readonly recipeCommand: string;
  readonly docsCommand: string;
  readonly noteCommand: string;
  readonly sourceLine: string;
}

export function renderRecipeList(recipes: ReadonlyArray<Recipe>, context: RecipeContext): string {
  const width = Math.max(...recipes.map((recipe) => recipe.id.length));
  return [
    `Recipes (${recipes.length}): complete, small pages that compose the kit for one page type. Copy one into the app and adapt it.`,
    ...recipes.map((recipe) => `  ${recipe.id.padEnd(width)}  ${recipe.summary}`),
    "",
    `Read one: ${context.recipeCommand.replace("{id}", "<id>")}`,
    context.sourceLine,
  ].join("\n");
}

function recipeFooter(recipe: Recipe, context: RecipeContext, missing: ReadonlyArray<string>): string[] {
  const lines = [`Kit components: ${recipe.components.join(", ")}. Read with: ${context.docsCommand.replace("{id}", "<id>")}`];
  lines.push(`Design notes: ${recipe.notes.join(", ")}. Read with: ${context.noteCommand.replace("{id}", "<id>")}`);
  if (missing.length > 0) {
    lines.push(`warning: the kit of the app has no ${missing.join(", ")}. The recipes follow the newest kit; run design sync --write first.`);
  }
  lines.push(context.sourceLine);
  return lines;
}

// A recipe prints in full: an agent copies all of it. The companion files
// print on request, because the agent replaces the example data with its own.
export function renderRecipe(
  recipe: Recipe,
  part: string | null,
  labDir: string,
  context: RecipeContext,
  missing: ReadonlyArray<string>,
): { text: string } | { error: string } {
  if (part === "files") {
    if (recipe.files.length === 0) return { error: `${recipe.id} has no companion files.` };
    const files = recipe.files.flatMap((path) => [`// ${path}`, readFileSync(join(labDir, path), "utf8").trimEnd(), ""]);
    return { text: [`${recipe.id}  (recipe files)`, "", ...files, context.sourceLine].join("\n") };
  }
  if (part !== null) return { error: `${recipe.id} has no part #${part}. The only part is #files.` };
  const header = `${recipe.id}  (recipe)  ${recipe.file}  route ${recipe.route}  ${recipe.lines} lines`;
  const files =
    recipe.files.length === 0
      ? []
      : [`Companion files: ${recipe.files.join(", ")}. Print them with: ${context.recipeCommand.replace("{id}", `${recipe.id}#files`)}`];
  return { text: [header, "", recipe.text.trimEnd(), "", ...files, ...recipeFooter(recipe, context, missing)].join("\n") };
}
