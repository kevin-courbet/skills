// The checks of graph --check for the kit and the use cases: the files of the
// kit, and the parts of each template that the kit depends on. A new app gets
// the template and the kit together, so a gap between them breaks every new app.
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import type { Graph, Problem } from "../graph.ts";
import { missingExports } from "./doctor.ts";
import { fileText, isRecord, KitError, readJson, stringRecord, toPosix, walk } from "./files.ts";
import { readKit, useCases, type Kit, type UseCase } from "./kit.ts";
import { loadUseCaseRules, ruleSet } from "./rules.ts";

const IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)["']([^"']+)["']/gm;

// The package of a bare import specifier, such as "@stylexjs/stylex" for
// "@stylexjs/stylex/lib" and "react" for "react/jsx-runtime". A relative path,
// the app alias "@/", and a module with a scheme, such as "node:fs" or a
// virtual module of a build plugin, have no package.
export function packageOf(specifier: string): string | null {
  if (specifier.startsWith(".") || specifier.startsWith("@/") || specifier.startsWith("/") || /^[a-z]+:/.test(specifier)) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

function kitPackages(kit: Kit): Map<string, string> {
  const packages = new Map<string, string>();
  for (const file of kit.manifest.files) {
    const text = fileText(join(kit.dir, file));
    if (text === undefined) continue;
    for (const match of text.matchAll(IMPORT)) {
      const name = packageOf(match[1]!);
      if (name !== null && !packages.has(name)) packages.set(name, file);
    }
  }
  return packages;
}

function checkFiles(kit: Kit, problems: Problem[]) {
  const listed = new Set(kit.manifest.files);
  for (const file of kit.manifest.files) {
    if (!existsSync(join(kit.dir, file))) problems.push({ file: kit.manifestPath, message: `kit.json lists ${file}, but the hub kit has no such file` });
  }
  for (const absolute of walk(kit.dir)) {
    const file = toPosix(relative(kit.dir, absolute));
    if (!listed.has(file)) problems.push({ file: absolute, message: `the file is in the hub kit folder, but kit.json does not list it; add it to "files" or move it out of assets/kit` });
  }
}

function checkUseCase(useCase: UseCase, kit: Kit, packages: ReadonlyMap<string, string>, problems: Problem[]) {
  const { template, lab } = useCase.app;
  const kitFiles = new Set(kit.manifest.files);
  const templateFiles = walk(template).map((absolute) => toPosix(relative(template, absolute)));
  for (const file of templateFiles.filter((item) => kitFiles.has(item))) {
    problems.push({ file: join(template, file), message: `the ${useCase.name} template has the kit file ${file}; kit files live only in the hub kit` });
  }
  if (lab !== null) {
    const templateSet = new Set(templateFiles);
    for (const absolute of walk(lab.dir)) {
      const file = toPosix(relative(lab.dir, absolute));
      if (templateSet.has(file) || kitFiles.has(file)) problems.push({ file: absolute, message: `the ${useCase.name} lab file ${file} is also a template file or a kit file; lab files only add pages` });
    }
  }
  for (const [path, names] of Object.entries(kit.manifest.appContract)) {
    const text = fileText(join(template, path));
    const absent = text === undefined ? names : missingExports(text, names);
    if (absent.length > 0) {
      problems.push({ file: join(template, path), message: `the ${useCase.name} template must export ${absent.join(", ")} from ${path}, because kit files import them (appContract in kit.json)` });
    }
  }
  if (useCase.app.rules !== null) {
    try {
      ruleSet(kit, loadUseCaseRules(useCase.app.rules, useCase.name));
    } catch (error) {
      if (!(error instanceof KitError)) throw error;
      problems.push({ file: useCase.app.rules, message: error.message });
    }
  }
  const pkgPath = join(template, "package.json");
  if (!existsSync(pkgPath)) {
    problems.push({ file: template, message: `the ${useCase.name} template has no package.json` });
    return;
  }
  let pkg: unknown;
  try {
    pkg = readJson(pkgPath);
  } catch (error) {
    if (!(error instanceof KitError)) throw error;
    problems.push({ file: pkgPath, message: error.message });
    return;
  }
  const declared = isRecord(pkg) ? { ...stringRecord(pkg.dependencies), ...stringRecord(pkg.devDependencies) } : {};
  for (const [name, file] of packages) {
    if (declared[name] === undefined) problems.push({ file: pkgPath, message: `the ${useCase.name} template does not declare ${name}, which the kit file ${file} imports` });
  }
}

export function checkKit(graph: Graph): Problem[] {
  const problems: Problem[] = [];
  let kit: Kit;
  try {
    kit = readKit(graph.hub.dir);
  } catch (error) {
    if (!(error instanceof KitError)) throw error;
    return [{ file: join(graph.hub.dir, "assets", "kit.json"), message: error.message }];
  }
  checkFiles(kit, problems);
  const packages = kitPackages(kit);
  for (const useCase of useCases(graph)) checkUseCase(useCase, kit, packages, problems);
  return problems;
}
