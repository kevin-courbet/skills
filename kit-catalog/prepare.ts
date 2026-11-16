/**
 * Prepares a scaffolded app for the kit catalog. It writes the component index
 * that the catalog page reads, and it checks that each kit component has a
 * section or an exclusion. `scripts/kit-catalog` runs it.
 *
 * Usage: bun kit-catalog/prepare.ts <app dir> [--partial]
 *
 * --partial reports the components without a section but does not fail. Only
 * the dev server uses it, so a section can be written while the page runs.
 */
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { catalogExclusions, excludedLayers } from "./src/exclusions";

type KitComponent = {
  readonly id: string;
  readonly layer: string;
  readonly summary: string;
  readonly file: string;
};

const catalogDir = import.meta.dir;
const repoDir = resolve(catalogDir, "..");
const designCli = join(repoDir, "skills/design/scripts/design");

const appArgument = process.argv[2];
const partial = process.argv.includes("--partial");
if (appArgument === undefined || appArgument.startsWith("--")) {
  console.error("Usage: bun kit-catalog/prepare.ts <app dir> [--partial]");
  process.exit(2);
}
const appDir = resolve(appArgument);

function readComponents(): ReadonlyArray<KitComponent> {
  const result = Bun.spawnSync(["bun", designCli, "components", appDir, "--json"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `"design components ${appDir} --json" failed with exit ${result.exitCode}:\n${result.stderr.toString()}`,
    );
  }
  const output = JSON.parse(result.stdout.toString()) as {
    readonly source: { readonly isApp: boolean };
    readonly components: ReadonlyArray<KitComponent>;
  };
  if (!output.source.isApp) {
    throw new Error(`${appDir} is not an app with a kit lock. Create it with "design new".`);
  }
  return output.components;
}

function sectionFiles(dir: string): ReadonlyArray<string> {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sectionFiles(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

const components = readComponents();
const sectionsDir = join(catalogDir, "src/sections");
const sectionsByFile = new Set(
  sectionFiles(sectionsDir).map((path) => `src/components/${relative(sectionsDir, path)}`),
);
const componentFiles = new Set(components.map((component) => component.file));

const problems: Array<string> = [];
const missing: Array<string> = [];
for (const file of sectionsByFile) {
  if (!componentFiles.has(file)) {
    problems.push(`The section for ${file} has no kit component. Rename or remove it.`);
  }
}
for (const id of Object.keys(catalogExclusions)) {
  const component = components.find((candidate) => candidate.id === id);
  if (component === undefined) {
    problems.push(`The exclusion "${id}" names no kit component. Remove it from exclusions.ts.`);
  } else if (sectionsByFile.has(component.file)) {
    problems.push(`"${id}" has a section and an exclusion. Remove one of them.`);
  }
}
for (const component of components) {
  if (excludedLayers.includes(component.layer)) {
    if (sectionsByFile.has(component.file)) {
      problems.push(`"${component.id}" is in the ${component.layer} layer, which has no sections. Remove its section.`);
    }
    continue;
  }
  if (!sectionsByFile.has(component.file) && catalogExclusions[component.id] === undefined) {
    missing.push(
      `"${component.id}" has no section. Add kit-catalog/src/sections/${component.file.replace(/^src\/components\//, "")}, or add an exclusion with the reason.`,
    );
  }
}

if (!partial) problems.push(...missing);
if (partial && missing.length > 0) {
  console.warn(`The kit catalog has no section for ${missing.length} components:\n${missing.map((line) => `  ${line}`).join("\n")}`);
}
if (problems.length > 0) {
  console.error(`The kit catalog does not cover the kit:\n${problems.map((line) => `  ${line}`).join("\n")}`);
  process.exit(1);
}

const index = `// scripts/kit-catalog writes this file from "design components --json". Do not edit it.
export type KitComponent = {
  readonly id: string;
  readonly layer: string;
  readonly summary: string;
  readonly file: string;
};

export const kitComponents: ReadonlyArray<KitComponent> = ${JSON.stringify(components, null, 2)};
`;
writeFileSync(join(appDir, "src/kit-catalog-index.ts"), index);
console.log(
  `Kit catalog: ${components.length} components, ${sectionsByFile.size} sections, ${Object.keys(catalogExclusions).length} exclusions.`,
);
