// The check rules and doctor checks of the internal-app use case. They hold
// the app to its stack: TanStack Start, Effect, StyleX, oxlint, and bun. The
// design CLI loads this module for an app with the internal-app.kit.json lock.
// The kit rules, which apply to every app on the kit, live in the design skill.
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DoctorCheck, DoctorContext, LineRule, RuleKit, UseCaseRules } from "../../design/scripts/lib/kit/rules.ts";

function lineRules(kit: RuleKit): ReadonlyArray<LineRule> {
  const { isClientModule, isSrcCode } = kit;
  return [
    {
      id: "server-import-in-client",
      message: "Top-level import from src/server in a client module. Import it dynamically inside the server-function handler.",
      applies: isClientModule,
      test: (line) => /^import\s(?!type\s).*from\s["']@\/server\//.test(line),
    },
    {
      id: "static-server-module-import",
      message: "Static import of a .server module. Import it dynamically inside the handler.",
      applies: (file) => isSrcCode(file) && file !== "src/server.ts" && !/\.server\.tsx?$/.test(file) && !file.startsWith("src/server/"),
      test: (line) => /^import\s(?!type\s).*from\s["'][^"']*\.server["']/.test(line),
    },
    {
      id: "hand-written-search-validation",
      message: "validateSearch without an Effect Schema. Use Schema.toStandardSchemaV1(schema).",
      applies: (file) => file.startsWith("src/routes/"),
      test: (line, next) => /validateSearch:/.test(line) && !/toStandardSchemaV1/.test(line) && !/toStandardSchemaV1/.test(next),
    },
    {
      id: "legacy-api",
      message: "Legacy API. Use Context.Service, useTable (Table v9), and .validator().",
      applies: isSrcCode,
      test: (line) => /\bContext\.Tag\b|\bEffect\.Service\b|\bServiceMap\b|\buseReactTable\b|\.inputValidator\(/.test(line),
    },
    {
      id: "explicit-any",
      message: "Explicit any. Use unknown with a schema or a type guard.",
      applies: isSrcCode,
      test: (line) => /:\s*any\b|\bas any\b|<any>/.test(line),
    },
  ];
}

function doctor(kit: RuleKit, { appDir, templateDir, pkg }: DoctorContext): ReadonlyArray<DoctorCheck> {
  const { fileText, majorOf, readJson, readJsonc, isRecord, stringRecord, walk } = kit;
  const checks: Array<DoctorCheck> = [];
  const add = (check: DoctorCheck) => checks.push(check);
  const template = readJson(join(templateDir, "package.json"));
  const deps = stringRecord(pkg.dependencies);
  const devDeps = stringRecord(pkg.devDependencies);
  const all = { ...deps, ...devDeps };
  const templateDeps = isRecord(template) ? stringRecord(template.dependencies) : {};
  const templateDevDeps = isRecord(template) ? stringRecord(template.devDependencies) : {};

  const otherLocks = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"].filter((name) => existsSync(join(appDir, name)));
  add(
    otherLocks.length === 0 && existsSync(join(appDir, "bun.lock"))
      ? { id: "package-manager", status: "pass", message: "bun.lock is the only lockfile." }
      : {
          id: "package-manager",
          status: "warn",
          message: otherLocks.length > 0 ? `Other lockfiles: ${otherLocks.join(", ")}.` : "No bun.lock.",
          fix: `${otherLocks.map((name) => `rm ${name} && `).join("")}bun install`,
        },
  );

  add(
    "@tanstack/react-start" in all
      ? { id: "framework", status: "pass", message: "TanStack Start app." }
      : {
          id: "framework",
          status: "fail",
          message: "Not a TanStack Start app.",
          fix: "Port the app to a new app: design read internal-app-framework-port.",
        },
  );

  const missing = (source: Record<string, string>) =>
    Object.entries(source)
      .filter(([name]) => !(name in all))
      .map(([name, range]) => `${name}@${range}`);
  const missingDeps = missing(templateDeps);
  const missingDevDeps = missing(templateDevDeps);
  const fixes = [
    missingDeps.length > 0 ? `bun add ${missingDeps.join(" ")}` : undefined,
    missingDevDeps.length > 0 ? `bun add -d ${missingDevDeps.join(" ")}` : undefined,
  ].filter((line): line is string => line !== undefined);
  add(
    fixes.length === 0
      ? { id: "dependencies", status: "pass", message: "Every stack dependency is declared." }
      : { id: "dependencies", status: "fail", message: `${missingDeps.length + missingDevDeps.length} stack dependencies are missing.`, fix: fixes.join("\n") },
  );

  const drift = Object.entries({ ...templateDeps, ...templateDevDeps })
    .filter(([name, range]) => name in all && majorOf(all[name] ?? "") !== majorOf(range))
    .map(([name, range]) => `${name}@${range}`);
  add(
    drift.length === 0
      ? { id: "versions", status: "pass", message: "Stack dependencies match the template major versions." }
      : { id: "versions", status: "warn", message: `${drift.length} dependencies differ from the template major version.`, fix: `bun add ${drift.join(" ")}` },
  );

  const scripts = stringRecord(pkg.scripts);
  const templateScripts = isRecord(template) ? stringRecord(template.scripts) : {};
  const scriptDrift = Object.entries(templateScripts).filter(([name, command]) => scripts[name] !== command);
  add(
    scriptDrift.length === 0
      ? { id: "scripts", status: "pass", message: "package.json scripts match the template." }
      : {
          id: "scripts",
          status: "warn",
          message: `Scripts differ: ${scriptDrift.map(([name]) => name).join(", ")}.`,
          fix: scriptDrift.map(([name, command]) => `"${name}": "${command}"`).join("\n"),
        },
  );

  const viteName = ["vite.config.ts", "vite.config.mts", "vite.config.js"].find((name) => existsSync(join(appDir, name)));
  const vite = viteName === undefined ? undefined : fileText(join(appDir, viteName));
  if (vite === undefined) {
    add({ id: "vite-config", status: "fail", message: "No vite.config.ts.", fix: `Copy ${templateDir}/vite.config.ts.` });
  } else {
    const problems: Array<string> = [];
    if (!vite.includes("@stylexjs/unplugin")) problems.push("StyleX plugin is missing");
    const stylexAt = vite.indexOf("stylex.vite(");
    const reactAt = Math.max(vite.indexOf("viteReact("), vite.indexOf("react("));
    if (stylexAt === -1 || (reactAt !== -1 && stylexAt > reactAt)) problems.push("stylex.vite() must come before the React plugin");
    if (!vite.includes("unstable_moduleResolution")) problems.push("unstable_moduleResolution is missing");
    if (!vite.includes("aliases")) problems.push("StyleX aliases for @/* are missing");
    if (!vite.includes("tanstackStart(")) problems.push("tanstackStart() is missing");
    add(
      problems.length === 0
        ? { id: "vite-config", status: "pass", message: "Vite config has StyleX before React and TanStack Start." }
        : { id: "vite-config", status: "fail", message: `${problems.join("; ")}.`, fix: `Compare with ${templateDir}/vite.config.ts (design read internal-app-build-wiring).` },
    );
  }

  const tsconfigPath = join(appDir, "tsconfig.json");
  if (!existsSync(tsconfigPath)) {
    add({ id: "tsconfig", status: "fail", message: "No tsconfig.json.", fix: `Copy ${templateDir}/tsconfig.json.` });
  } else {
    // An unreadable tsconfig is a finding of its own, so that doctor still
    // reports the other checks.
    let options: Record<string, unknown> | null = null;
    try {
      const parsed = readJsonc(tsconfigPath);
      options = isRecord(parsed) && isRecord(parsed.compilerOptions) ? parsed.compilerOptions : {};
    } catch (error) {
      add({ id: "tsconfig", status: "fail", message: `${(error as Error).message}.`, fix: `Fix the syntax, then compare with ${templateDir}/tsconfig.json.` });
    }
    if (options !== null) {
      const problems: Array<string> = [];
      if (options.strict !== true) problems.push("strict is off");
      if ("baseUrl" in options) problems.push("baseUrl was removed in TypeScript 7; use explicit relative paths");
      if (!isRecord(options.paths) || !("@/*" in options.paths)) problems.push("paths has no @/*");
      if (options.verbatimModuleSyntax === true) problems.push("verbatimModuleSyntax is on (it can leak server code into the client)");
      add(
        problems.length === 0
          ? { id: "tsconfig", status: "pass", message: "tsconfig is strict with the @/* alias." }
          : { id: "tsconfig", status: "fail", message: `${problems.join("; ")}.`, fix: `Compare with ${templateDir}/tsconfig.json.` },
      );
    }
  }

  const lintConfigs = [".oxlintrc.json", ".oxfmtrc.json"].filter((name) => !existsSync(join(appDir, name)));
  add(
    lintConfigs.length === 0
      ? { id: "lint-config", status: "pass", message: "oxlint and oxfmt configs exist." }
      : {
          id: "lint-config",
          status: "warn",
          message: `Missing ${lintConfigs.join(", ")}.`,
          fix: lintConfigs.map((name) => `cp "${join(templateDir, `_${name.slice(1)}`)}" ${name}`).join("\n"),
        },
  );

  const root = fileText(join(appDir, "src/routes/__root.tsx"));
  add(
    root !== undefined && root.includes("AppDocument") && root.includes("getThemeChoice")
      ? { id: "root-route", status: "pass", message: "Root route renders AppDocument with the theme choice." }
      : {
          id: "root-route",
          status: "fail",
          message: "Root route does not use AppDocument and getThemeChoice.",
          fix: `Replace its document markup as in ${templateDir}/src/routes/__root.tsx (design read internal-app-upgrade#wire-the-root-the-router-and-the-shell).`,
        },
  );

  add(
    root !== undefined && /rel:\s*["']icon["']/.test(root)
      ? { id: "app-icon", status: "pass", message: "Root route links an app icon." }
      : {
          id: "app-icon",
          status: "warn",
          message: "Root route links no icon, so browsers request /favicon.ico and log a 404 on every page.",
          fix: `Add public/favicon.svg and links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }] to the root route head, as in ${templateDir}/src/routes/__root.tsx.`,
        },
  );

  const router = fileText(join(appDir, "src/router.tsx"));
  add(
    router !== undefined && router.includes("routerDefaults") && router.includes("setupRouterSsrQueryIntegration")
      ? { id: "router", status: "pass", message: "Router spreads routerDefaults and wires the SSR query integration." }
      : { id: "router", status: "fail", message: "Router does not use routerDefaults and setupRouterSsrQueryIntegration.", fix: `Rewrite src/router.tsx as in ${templateDir}/src/router.tsx.` },
  );

  const routeSources = walk(join(appDir, "src/routes")).map((path) => fileText(path) ?? "");
  add(
    routeSources.some((source) => source.includes("<AppShell"))
      ? { id: "app-shell", status: "pass", message: "A layout route renders AppShell." }
      : { id: "app-shell", status: "warn", message: "No route renders AppShell.", fix: `Add a pathless layout as in ${templateDir}/src/routes/_app.tsx.` },
  );
  add(
    routeSources.some((source) => source.includes("<ChartProvider"))
      ? { id: "chart-provider", status: "pass", message: "ChartProvider wraps the app layout." }
      : { id: "chart-provider", status: "warn", message: "No ChartProvider in the routes.", fix: "Wrap AppShell in <ChartProvider locale={appLocale} timeZone={appTimeZone}>." },
  );
  return checks;
}

export default function rules(kit: RuleKit): UseCaseRules {
  return { lineRules: lineRules(kit), doctor: (context) => doctor(kit, context) };
}
