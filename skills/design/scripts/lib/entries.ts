import { join } from "node:path";
import type { Graph, Problem, Section, SkillSource } from "./graph.ts";
import { kitProblems, movedKitMessage, readKitDocs, type KitDoc } from "./kit/docs.ts";
import { KitError } from "./kit/files.ts";
import { docsSource, hubDocsSource, readKit, useCases, type DocsSource, type UseCase } from "./kit/kit.ts";
import { labIndexProblems, readRecipes, recipeProblems, type Recipe } from "./kit/recipes.ts";
import { countWords, slugify } from "./text.ts";

// A search entry is a document outside the note graph: the docs of one kit
// component, or a recipe of the lab of a use case. Search ranks the entries
// with the notes, and each entry prints the command that reads it.
export interface Entry {
  readonly id: string;
  // What the entry is, such as "component".
  readonly kind: string;
  // A short qualifier that search prints after the kind, such as "pattern".
  readonly label: string;
  readonly title: string;
  readonly summary: string;
  readonly keywords: ReadonlyArray<string>;
  readonly intro: string;
  readonly sections: ReadonlyArray<Section>;
  // The ids of the design notes that the entry applies.
  readonly links: ReadonlyArray<string>;
  // The command that prints the full entry.
  readonly read: string;
  // The name of the group of the entry, such as "components".
  readonly group: string;
  // The skill that owns the entry: the hub for a kit component, the use case
  // for a recipe.
  readonly skill: SkillSource;
  // The file of the entry, for the location of a problem.
  readonly file: string;
}

// The entries come in groups. Each group has its own read command and its own
// source, because the components come from the kit of an app or the hub, and
// the recipes come from the lab of a use case.
export interface EntrySource {
  readonly skill: SkillSource;
  // A plural noun, such as "components" or "recipes".
  readonly group: string;
  // One phrase that tells where the entries come from, such as an app folder.
  readonly source: string;
  readonly count: number;
  // The command that prints one entry, with {id} for the entry id.
  readonly read: string;
}

export interface EntrySet {
  readonly entries: ReadonlyArray<Entry>;
  readonly sources: ReadonlyArray<EntrySource>;
  readonly problems: ReadonlyArray<Problem>;
}

// Where the entries come from. "folder" reads the kit of the app around the
// folder, or the hub kit outside an app, and the recipes of the use case of
// that app. "hub" reads the hub kit and every lab, for graph --check.
export type EntryScope = { readonly kind: "folder"; readonly dir: string } | { readonly kind: "hub" };

export const DOCS_COMMAND = "design docs {id}";
export const RECIPE_COMMAND = "design recipe {id}";

export function isEntry(value: object): value is Entry {
  return "read" in value && "kind" in value;
}

// "PageHeader" gives "page header", so that search finds an export by its words.
function nameWords(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}

function sections(items: ReadonlyArray<{ readonly title: string; readonly text: string }>): Section[] {
  return items.map((item) => ({ title: item.title, slug: slugify(item.title), text: item.text, words: countWords(item.text), line: 0 }));
}

function componentEntry(doc: KitDoc, hub: SkillSource, root: string): Entry {
  const exported = [...doc.exports.components.map((item) => item.name), ...doc.exports.hooks.map((item) => item.name)];
  const props = doc.exports.components.flatMap((item) => item.props?.variants.flatMap((variant) => variant.members) ?? []);
  return {
    id: doc.id,
    kind: "component",
    label: doc.layer ?? "no layer",
    title: doc.id,
    summary: doc.summary,
    keywords: [...new Set([...doc.keywords, ...exported.filter((name) => name !== doc.id).map(nameWords)])],
    intro: doc.intro,
    sections: sections([...doc.sections, { title: "Props", text: props.map((member) => `${member.name}: ${member.comment}`).join("\n") }]),
    links: doc.notes,
    read: DOCS_COMMAND.replaceAll("{id}", doc.id),
    group: "components",
    skill: hub,
    file: join(root, doc.file),
  };
}

function recipeEntry(recipe: Recipe, useCase: UseCase): Entry {
  return {
    id: recipe.id,
    kind: "recipe",
    label: "page",
    title: recipe.id,
    summary: recipe.summary,
    keywords: [...recipe.keywords, nameWords(recipe.id)],
    intro: recipe.intro,
    sections: sections([...recipe.sections, { title: "Components", text: recipe.components.join(", ") }]),
    links: recipe.notes,
    read: RECIPE_COMMAND.replaceAll("{id}", recipe.id),
    group: "recipes",
    skill: useCase.skill,
    file: join(useCase.app.lab!.dir, recipe.file),
  };
}

export function recipeSourcePhrase(useCase: UseCase): string {
  return `the recipes of the ${useCase.name} lab at ${useCase.app.lab!.dir}. They follow the newest kit; an app with an older kit can miss a component.`;
}

// The use cases whose recipes apply in a scope: the use case of the app, or
// every use case with a lab outside an app and for graph --check.
export function recipeUseCases(cases: ReadonlyArray<UseCase>, source: DocsSource): UseCase[] {
  const withLab = cases.filter((item) => item.app.lab !== null);
  return source.app === null ? withLab : withLab.filter((item) => item === source.app!.useCase);
}

const loaded = new WeakMap<Graph, Map<string, EntrySet>>();

export function loadEntries(graph: Graph, scope: EntryScope): EntrySet {
  const cache = loaded.get(graph) ?? new Map<string, EntrySet>();
  loaded.set(graph, cache);
  const key = scope.kind === "hub" ? "\u0000hub" : scope.dir;
  const cached = cache.get(key);
  if (cached) return cached;
  const set = buildEntries(graph, scope);
  cache.set(key, set);
  return set;
}

// A broken kit or lab does not stop search: the problems print as a warning,
// and graph --check fails on them.
function buildEntries(graph: Graph, scope: EntryScope): EntrySet {
  const entries: Entry[] = [];
  const sources: EntrySource[] = [];
  const problems: Problem[] = [];
  const hubDir = graph.hub.dir;
  let source: DocsSource;
  let cases: UseCase[];
  try {
    const kit = readKit(hubDir);
    cases = useCases(graph);
    source = scope.kind === "hub" ? hubDocsSource(kit) : docsSource(scope.dir, kit, cases);
  } catch (error) {
    if (!(error instanceof KitError)) throw error;
    problems.push({ file: join(hubDir, "assets", "kit.json"), message: error.message });
    return { entries, sources, problems };
  }

  const moved = movedKitMessage(source.kit);
  if (moved !== null) problems.push({ file: source.kit.root, message: moved });
  const docs = readKitDocs(source.kit);
  for (const [file, items] of kitProblems(docs)) {
    for (const message of items) problems.push({ file: join(source.kit.root, file), message: `kit doc: ${message}` });
  }
  const components = docs.filter((doc) => doc.hasComment).map((doc) => componentEntry(doc, graph.hub, source.kit.root));
  entries.push(...components);
  sources.push({ skill: graph.hub, group: "components", source: source.phrase, count: components.length, read: DOCS_COMMAND });

  for (const useCase of recipeUseCases(cases, source)) {
    const lab = useCase.app.lab!;
    let recipes: Recipe[];
    try {
      recipes = readRecipes(lab.dir, lab, useCase.name);
    } catch (error) {
      if (!(error instanceof KitError)) throw error;
      problems.push({ file: lab.dir, message: `${useCase.name} lab: ${error.message}` });
      continue;
    }
    // A recipe follows the newest kit, so only the hub kit can judge its
    // components. An app with an older kit gets a warning when it prints the
    // recipe instead.
    const recipeIssues = scope.kind === "hub" ? recipeProblems(recipes, docs) : new Map(recipes.map((recipe) => [recipe.file, [...recipe.problems]]));
    for (const [file, items] of recipeIssues) {
      for (const message of items) problems.push({ file: join(lab.dir, file), message: `${useCase.name} recipe: ${message}` });
    }
    if (scope.kind === "hub") {
      for (const message of labIndexProblems(lab.dir, lab, recipes)) problems.push({ file: join(lab.dir, lab.pages), message: `${useCase.name} lab: ${message}` });
    }
    const items = recipes.map((recipe) => recipeEntry(recipe, useCase));
    entries.push(...items);
    sources.push({ skill: useCase.skill, group: "recipes", source: recipeSourcePhrase(useCase), count: items.length, read: RECIPE_COMMAND });
  }

  const ids = new Map<string, Entry>();
  for (const entry of entries) {
    const key = entry.id.toLowerCase();
    const other = ids.get(key);
    if (other) problems.push({ file: entry.file, message: `the entry id "${entry.id}" is also the id of ${other.file}; search and the read commands need one id for one entry` });
    ids.set(key, entry);
  }
  return { entries, sources, problems };
}

export function findEntry(set: EntrySet, id: string): Entry | undefined {
  return set.entries.find((entry) => entry.id === id);
}

// The entries that apply a note, such as the components that implement a form rule.
export function entriesFor(set: EntrySet, noteId: string): Entry[] {
  return set.entries.filter((entry) => entry.links.includes(noteId));
}
