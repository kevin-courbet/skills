// Creates a new app: the template of a use case, the hub kit, and optionally
// the lab of the use case. The kit lock records the installed kit files, so
// that `design sync` can update them later.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { isRecord, KitError, readJson, sha256, toPosix, walk } from "./files.ts";
import { writeLock, type Kit, type UseCase } from "./kit.ts";

export interface NewApp {
  readonly dir: string;
  readonly name: string;
  readonly lab: boolean;
}

// A template stores each top-level dotfile with "_" in place of the dot, such
// as _gitignore, so that the skill repository does not apply the file to itself.
const STORED_DOTFILE = /^_[^_]/;

export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function runNew(target: string, useCase: UseCase, kit: Kit, name: string | undefined, lab: boolean): NewApp {
  const { app } = useCase;
  if (name !== undefined && app.name === null) {
    throw new KitError(`the ${useCase.name} template has no app name to replace, so --name does not apply. Add "name" to the "app" block of its design-graph.json`);
  }
  if (lab && app.lab === null) throw new KitError(`the ${useCase.name} use case has no lab, so --lab does not apply`);
  if (existsSync(target) && readdirSync(target).length > 0) throw new KitError(`${target} exists and is not empty.`);

  // The kit files come only from the hub. A template copy of a kit file would
  // install a second, older version of it.
  const kitFiles = new Set(kit.manifest.files);
  const templateFiles = walk(app.template).map((absolute) => toPosix(relative(app.template, absolute)));
  const shadowed = templateFiles.filter((file) => kitFiles.has(file));
  if (shadowed.length > 0) throw new KitError(`the ${useCase.name} template has kit files: ${shadowed.join(", ")}. Kit files live only in the hub kit; remove them from the template`);
  if (lab) {
    // The lab only adds pages. A lab file that replaced a template file or a
    // kit file would make the lab scaffold verify another app than the one
    // that ships.
    const templateSet = new Set(templateFiles);
    for (const absolute of walk(app.lab!.dir)) {
      const file = toPosix(relative(app.lab!.dir, absolute));
      if (templateSet.has(file) || kitFiles.has(file)) throw new KitError(`the lab file ${file} is also a template file or a kit file. Lab files only add pages.`);
    }
  }

  mkdirSync(target, { recursive: true });
  cpSync(app.template, target, { recursive: true });
  for (const file of kit.manifest.files) {
    const source = join(kit.dir, file);
    if (!existsSync(source)) throw new KitError(`the hub kit has no ${file}, which ${kit.manifestPath} lists`);
    mkdirSync(dirname(join(target, file)), { recursive: true });
    cpSync(source, join(target, file));
  }
  if (lab) cpSync(app.lab!.dir, target, { recursive: true });
  for (const entry of readdirSync(target)) {
    if (STORED_DOTFILE.test(entry)) renameSync(join(target, entry), join(target, `.${entry.slice(1)}`));
  }

  const appName = name ?? app.name?.placeholder ?? useCase.name;
  const pkgPath = join(target, "package.json");
  if (!existsSync(pkgPath)) throw new KitError(`the ${useCase.name} template has no package.json`);
  const pkg = readJson(pkgPath);
  if (!isRecord(pkg)) throw new KitError(`${join(app.template, "package.json")} does not hold a JSON object`);
  pkg.name = slug(appName) || useCase.name;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  if (name !== undefined) {
    for (const path of app.name!.files) {
      const file = join(target, path);
      writeFileSync(file, readFileSync(file, "utf8").replaceAll(app.name!.placeholder, name));
    }
  }

  const files: Record<string, string> = {};
  for (const path of kit.manifest.files) files[path] = sha256(join(target, path));
  writeLock(target, useCase.name, files);
  return { dir: target, name: appName, lab };
}
