// The kit commands of the design CLI: components, docs, recipe, new, sync,
// check, and doctor. Each one returns its output, and the CLI prints it.
import { relative, resolve } from "node:path";
import { DOCS_COMMAND, RECIPE_COMMAND, recipeSourcePhrase, recipeUseCases } from "../entries.ts";
import { LookupError, UsageError } from "../errors.ts";
import type { Graph } from "../graph.ts";
import { kitProblems, lookup as lookupDoc, movedKitMessage, readKitDocs, renderCatalog, renderDoc, type KitDoc } from "./docs.ts";
import { runDoctor } from "./doctor.ts";
import { KitError } from "./files.ts";
import { docsSource, findUseCase, readKit, resolveApp, useCases, type DocsSource, type Kit, type UseCase } from "./kit.ts";
import { findRecipe, missingComponents, readRecipes, renderRecipe, renderRecipeList, type Recipe, type RecipeContext } from "./recipes.ts";
import { loadUseCaseRules, ruleSet, runCheck } from "./rules.ts";
import { runNew } from "./scaffold.ts";
import { runSync, syncDetails, type SyncEntry } from "./sync.ts";

export const KIT_COMMANDS = new Set(["components", "docs", "recipe", "new", "sync", "check", "doctor"]);

const NOTE_COMMAND = "design read {id}";

export interface KitCommandResult {
  readonly code: number;
  readonly stdout: string;
}

interface Args {
  readonly positional: ReadonlyArray<string>;
  readonly flags: ReadonlySet<string>;
  readonly values: Readonly<Record<string, string>>;
}

// Parses the arguments of one command. An option that the command does not
// take is a usage error, so that a typo never runs the command without it.
function parseArgs(command: string, argv: ReadonlyArray<string>, flags: ReadonlyArray<string>, values: ReadonlyArray<string>): Args {
  const positional: string[] = [];
  const set = new Set<string>();
  const given: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const name = arg.slice(2);
    if (flags.includes(name)) set.add(name);
    else if (values.includes(name)) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) throw new UsageError(`${command}: --${name} needs a value`);
      given[name] = value;
      index += 1;
    } else {
      const accepted = [...flags.map((flag) => `--${flag}`), ...values.map((value) => `--${value} <value>`)];
      throw new UsageError(`${command}: unknown option ${arg}. ${command} takes ${accepted.length === 0 ? "no options" : accepted.join(", ")}`);
    }
  }
  return { positional, flags: set, values: given };
}

function maxPositional(command: string, args: Args, count: number, shape: string) {
  if (args.positional.length > count) throw new UsageError(`${command}: too many arguments. Use: design ${command} ${shape}`);
}

function output(json: boolean, value: unknown, human: () => string, code = 0): KitCommandResult {
  return { code, stdout: `${json ? JSON.stringify(value, null, 2) : human()}\n` };
}

// The catalog of an app with the old layout misses the moved files, so the
// commands that show docs stop instead of showing a part of the kit.
function requireCurrentLayout(source: DocsSource) {
  const moved = movedKitMessage(source.kit);
  if (moved !== null) throw new KitError(moved);
}

function sourceInfo(source: DocsSource) {
  return { root: source.kit.root, isApp: source.kit.isApp, useCase: source.app?.useCase.name ?? null };
}

function sourceLine(source: DocsSource): string {
  return `Source: ${source.phrase}`;
}

// The command that lists the doc problems of a source: check in an app, and
// graph --check for the hub kit.
function problemCommand(source: DocsSource): string {
  return source.app === null ? "design graph --check" : "design check";
}

class KitCommands {
  private kitValue: Kit | null = null;
  readonly cases: ReadonlyArray<UseCase>;

  constructor(
    private readonly graph: Graph,
    private readonly cwd: string,
  ) {
    this.cases = useCases(graph);
  }

  get kit(): Kit {
    this.kitValue ??= readKit(this.graph.hub.dir);
    return this.kitValue;
  }

  private dir(path: string | undefined): string {
    return resolve(this.cwd, path ?? ".");
  }

  private docs(path: string | undefined): { source: DocsSource; docs: KitDoc[] } {
    const source = docsSource(this.dir(path), this.kit, this.cases);
    return { source, docs: readKitDocs(source.kit) };
  }

  components(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("components", argv, ["json"], []);
    maxPositional("components", args, 1, "[dir]");
    const { source, docs } = this.docs(args.positional[0]);
    requireCurrentLayout(source);
    const problems = [...kitProblems(docs).values()].flat().length;
    const items = docs.map((doc) => ({ id: doc.id, layer: doc.layer, summary: doc.summary, file: doc.file }));
    return output(args.flags.has("json"), { source: sourceInfo(source), components: items }, () => {
      const text = renderCatalog(docs, sourceLine(source), DOCS_COMMAND);
      return problems === 0 ? text : `${text}\nwarning: ${problems} doc comment problems. Run ${problemCommand(source)}.`;
    });
  }

  docsCommand(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("docs", argv, ["json"], []);
    maxPositional("docs", args, 2, "<id>[#part] [dir]");
    const target = args.positional[0];
    if (target === undefined) throw new UsageError("docs: give a component id, such as: design docs PageHeader. List the ids with: design components");
    const { source, docs } = this.docs(args.positional[1]);
    requireCurrentLayout(source);
    const found = lookupDoc(docs, target);
    if ("error" in found) throw new LookupError(`${found.error}\nList the ids with: design components`);
    if (!found.doc.hasComment) {
      const fix = source.app === null ? "Fix the doc comment in the hub kit: design read kit-adding-a-component." : "Run design sync --write to install the documented kit.";
      throw new KitError(`${found.doc.file} has no doc comment: ${found.doc.problems.join("; ")}. ${fix}`);
    }
    const rendered = renderDoc(found, { docsCommand: DOCS_COMMAND, noteCommand: NOTE_COMMAND, sourceLine: sourceLine(source) });
    if (rendered.error !== undefined) throw new LookupError(rendered.error);
    return output(
      args.flags.has("json"),
      { source: sourceInfo(source), doc: found.doc, part: found.part, section: found.section, text: rendered.text },
      () => rendered.text,
    );
  }

  recipe(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("recipe", argv, ["json"], []);
    maxPositional("recipe", args, 2, "[<id>[#files]] [dir]");
    const { source, docs } = this.docs(args.positional[1]);
    const cases = recipeUseCases(this.cases, source);
    if (cases.length === 0) {
      throw new KitError(
        source.app === null
          ? `no use case of the design skill has a lab with recipes. The use cases: ${this.cases.map((item) => item.name).join(", ") || "none is installed"}`
          : `the ${source.app.useCase.name} use case has no lab with recipes`,
      );
    }
    const groups = cases.map((useCase) => ({ useCase, recipes: readRecipes(useCase.app.lab!.dir, useCase.app.lab!, useCase.name) }));
    const context = (useCase: UseCase): RecipeContext => ({
      recipeCommand: RECIPE_COMMAND,
      docsCommand: DOCS_COMMAND,
      noteCommand: NOTE_COMMAND,
      sourceLine: `Source: ${recipeSourcePhrase(useCase)}`,
    });
    const json = args.flags.has("json");
    const target = args.positional[0];
    if (target === undefined) {
      const listed = groups.map(({ useCase, recipes }) => ({
        useCase: useCase.name,
        recipes: recipes.map(({ id, summary, file, route, lines }) => ({ id, summary, file, route, lines })),
      }));
      return output(json, { groups: listed }, () => groups.map(({ useCase, recipes }) => renderRecipeList(recipes, context(useCase))).join("\n\n"));
    }
    const [name = "", part = null] = target.split("#", 2) as [string, string?];
    const all: Recipe[] = groups.flatMap((group) => group.recipes);
    const found = findRecipe(all, name);
    if ("error" in found) throw new LookupError(`${found.error}\nList the recipes with: design recipe`);
    const useCase = findUseCase(this.cases, found.useCase);
    const rendered = renderRecipe(found, part, useCase.app.lab!.dir, context(useCase), missingComponents(found, docs));
    if ("error" in rendered) throw new LookupError(rendered.error);
    return output(json, { useCase: useCase.name, recipe: found, part, text: rendered.text }, () => rendered.text);
  }

  newApp(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("new", argv, ["json", "lab"], ["app", "name"]);
    maxPositional("new", args, 1, '<dir> --app <use case> [--name "App name"] [--lab]');
    const target = args.positional[0];
    const appFlag = args.values.app;
    if (target === undefined || appFlag === undefined) {
      throw new UsageError(`new: use design new <dir> --app <use case> [--name "App name"] [--lab]. The use cases: ${this.cases.map((item) => item.name).join(", ") || "none is installed"}`);
    }
    const useCase = findUseCase(this.cases, appFlag);
    const dir = this.dir(target);
    const created = runNew(dir, useCase, this.kit, args.values.name, args.flags.has("lab"));
    const near = relative(this.cwd, dir);
    const shown = near === "" ? "." : near.startsWith("..") ? dir : near;
    return output(args.flags.has("json"), { ok: true, dir, useCase: useCase.name, name: created.name, lab: created.lab }, () =>
      [
        `Created ${dir} from the ${useCase.name} template and the hub kit.`,
        "Next:",
        `  cd ${shown}`,
        "  bun install",
        "  bun run build && bun run tsc && bun run lint",
        "  bun run dev",
        ...(created.lab ? [`Then open ${useCase.app.lab!.route} for the recipe pages.`] : []),
      ].join("\n"),
    );
  }

  sync(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("sync", argv, ["json", "write", "force"], ["app"]);
    maxPositional("sync", args, 1, "[dir] [--write] [--force] [--app <use case>]");
    const app = resolveApp(this.dir(args.positional[0]), args.values.app, this.cases);
    const write = args.flags.has("write");
    const result = runSync(app, this.kit, write, args.flags.has("force"));
    const { written, applied, pending, rewrites, unsafe } = result;
    const ok = pending.length === 0 && unsafe.length === 0;
    return output(
      args.flags.has("json"),
      { ok, useCase: app.useCase.name, written, applied, pending, rewrites, unsafe },
      () => {
        const entryLine = (label: string, entry: SyncEntry) =>
          `${label}  ${entry.status.padEnd(16)} ${entry.path}${entry.from === undefined ? "" : `  (from ${entry.from})`}`;
        const lines = [
          ...applied.map((entry) => entryLine("applied", entry)),
          ...pending.map((entry) => entryLine("pending", entry)),
          ...rewrites.map((item) => `${written ? "applied" : "pending"}  ${"rewrite".padEnd(16)} ${item.file}:${item.line}  ${item.from} -> ${item.to}`),
          ...unsafe.map((item) => `unsafe   ${"import".padEnd(16)} ${item.file}:${item.line}  ${item.text}`),
        ];
        if (lines.length === 0) lines.push(`All kit files match the hub kit (${result.entries.length} files).`);
        const statuses = [...new Set(pending.map((entry) => entry.status))];
        if (statuses.length > 0) lines.push("", ...statuses.map((status) => `${status}: ${syncDetails[status]}`));
        if (unsafe.length > 0) {
          lines.push(
            "\nsync cannot rewrite the unsafe lines: each one names an old kit path in a form that sync does not resolve. Change each line to the new path, then run sync again.",
          );
        }
        if (write && !written) lines.push("sync wrote nothing, because the kit moves files and a move is all or nothing.");
        else if (!ok && !write) lines.push("\nRun with --write to apply. Review modified and conflicting files before adding --force.");
        return lines.join("\n");
      },
      ok ? 0 : 1,
    );
  }

  private rules(app: ReturnType<typeof resolveApp>) {
    const useCaseRules = loadUseCaseRules(app.useCase.app.rules, app.useCase.name);
    return { useCaseRules, rules: ruleSet(this.kit, useCaseRules) };
  }

  check(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("check", argv, ["json"], ["app"]);
    maxPositional("check", args, 1, "[dir] [--app <use case>]");
    const app = resolveApp(this.dir(args.positional[0]), args.values.app, this.cases);
    const { rules } = this.rules(app);
    const findings = runCheck(app, this.kit, rules);
    return output(
      args.flags.has("json"),
      { ok: findings.length === 0, useCase: app.useCase.name, findings },
      () => {
        if (findings.length === 0) return "check: OK";
        const ids = [...new Set(findings.map((finding) => finding.rule))];
        return ids
          .map((rule) => {
            const items = findings.filter((finding) => finding.rule === rule);
            const message = rules.messages[rule];
            if (message === undefined) throw new Error(`the check rule ${rule} has no message`);
            return [`FAIL ${rule} (${items.length}): ${message}`, ...items.slice(0, 40).map((item) => `  ${item.file}:${item.line}  ${item.text}`)].join("\n");
          })
          .join("\n\n");
      },
      findings.length === 0 ? 0 : 1,
    );
  }

  doctor(argv: ReadonlyArray<string>): KitCommandResult {
    const args = parseArgs("doctor", argv, ["json"], ["app"]);
    maxPositional("doctor", args, 1, "[dir] [--app <use case>]");
    const app = resolveApp(this.dir(args.positional[0]), args.values.app, this.cases);
    const { useCaseRules, rules } = this.rules(app);
    const checks = runDoctor(app, this.kit, useCaseRules, rules);
    const ok = checks.every((check) => check.status !== "fail");
    return output(
      args.flags.has("json"),
      { ok, useCase: app.useCase.name, checks },
      () =>
        checks
          .map((check) => {
            const head = `${check.status.toUpperCase().padEnd(5)} ${check.id.padEnd(28)} ${check.message}`;
            return check.status === "pass" || check.fix === undefined
              ? head
              : `${head}\n${check.fix
                  .split("\n")
                  .map((line) => `      ${line}`)
                  .join("\n")}`;
          })
          .join("\n"),
      ok ? 0 : 1,
    );
  }
}

export function runKitCommand(command: string, argv: ReadonlyArray<string>, graph: Graph, cwd: string): KitCommandResult {
  const commands = new KitCommands(graph, cwd);
  switch (command) {
    case "components":
      return commands.components(argv);
    case "docs":
      return commands.docsCommand(argv);
    case "recipe":
      return commands.recipe(argv);
    case "new":
      return commands.newApp(argv);
    case "sync":
      return commands.sync(argv);
    case "check":
      return commands.check(argv);
    case "doctor":
      return commands.doctor(argv);
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}
