// The checks of `design doctor`: the checks of the use case of the app, then
// the checks of the kit. Each failed check prints a fix.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileText, isRecord, readJson } from "./files.ts";
import type { App, Kit } from "./kit.ts";
import { forbiddenDependencies, runCheck, type DoctorCheck, type RuleSet, type UseCaseRules } from "./rules.ts";
import { planSync } from "./sync.ts";

export function runDoctor(app: App, kit: Kit, useCase: UseCaseRules | null, rules: RuleSet): Array<DoctorCheck> {
  const { dir: appDir } = app;
  const templateDir = app.useCase.app.template;
  const checks: Array<DoctorCheck> = [];
  const add = (check: DoctorCheck) => checks.push(check);
  const pkgPath = join(appDir, "package.json");
  if (!existsSync(pkgPath)) {
    add({ id: "package", status: "fail", message: "No package.json.", fix: `Run doctor in the app root, or create a new app with: design new <dir> --app ${app.useCase.name}` });
    return checks;
  }
  const pkg = readJson(pkgPath);
  if (!isRecord(pkg)) {
    add({ id: "package", status: "fail", message: "package.json does not hold a JSON object.", fix: `Compare with ${templateDir}/package.json.` });
    return checks;
  }
  if (useCase?.doctor !== undefined) checks.push(...useCase.doctor({ appDir, templateDir, pkg }));

  const { manifest } = kit;
  const forbidden = forbiddenDependencies(manifest, pkg);
  add(
    forbidden.length === 0
      ? { id: "forbidden-dependencies", status: "pass", message: "No replaced libraries are installed." }
      : {
          id: "forbidden-dependencies",
          status: "fail",
          message: `Replaced libraries: ${forbidden.join(", ")}.`,
          fix: `Replace their usages (design read kit-migration-map#libraries), then: bun remove ${forbidden.join(" ")}`,
        },
  );

  const { entries } = planSync(app, kit);
  const notCurrent = entries.filter((entry) => entry.status !== "current");
  const counts = notCurrent.reduce<Record<string, number>>((acc, entry) => ({ ...acc, [entry.status]: (acc[entry.status] ?? 0) + 1 }), {});
  add(
    notCurrent.length === 0
      ? { id: "kit", status: "pass", message: `All ${entries.length} kit files match the hub kit.` }
      : {
          id: "kit",
          status: "fail",
          message: `Kit files not current: ${Object.entries(counts)
            .map(([status, count]) => `${count} ${status}`)
            .join(", ")}.`,
          fix: "design sync --write   (add --force after reviewing modified or conflicting files: design read kit-update)",
        },
  );

  for (const [path, exportsNeeded] of Object.entries(manifest.appContract)) {
    const text = fileText(join(appDir, path));
    const absent = text === undefined ? exportsNeeded : missingExports(text, exportsNeeded);
    add(
      absent.length === 0
        ? { id: `contract:${path}`, status: "pass", message: `${path} exports ${exportsNeeded.join(", ")}.` }
        : { id: `contract:${path}`, status: "fail", message: `${path} must export ${absent.join(", ")}; kit files import them.`, fix: `Copy ${templateDir}/${path} and adapt it.` },
    );
  }

  const findings = runCheck(app, kit, rules);
  const byRule = findings.reduce<Record<string, number>>((acc, finding) => ({ ...acc, [finding.rule]: (acc[finding.rule] ?? 0) + 1 }), {});
  add(
    findings.length === 0
      ? { id: "conventions", status: "pass", message: "No convention findings." }
      : {
          id: "conventions",
          status: "fail",
          message: `${findings.length} findings: ${Object.entries(byRule)
            .map(([rule, count]) => `${rule} ${count}`)
            .join(", ")}.`,
          fix: "design check   (lists each finding with file and line)",
        },
  );
  return checks;
}

// The names of an app contract that a file does not export.
export function missingExports(text: string, names: ReadonlyArray<string>): string[] {
  return names.filter((name) => !new RegExp(`export\\s+(?:const|type|interface|function|class)\\s+${name}\\b`).test(text));
}
