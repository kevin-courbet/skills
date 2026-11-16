// The rules of `design check` and the types that a use case implements to add
// its own rules and doctor checks. The kit rules apply to every app on the kit.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { appKitSource, documentedFiles, kitProblems, movedKitMessage, readKitDocs, type KitSource } from "./docs.ts";
import { escapeRegExp, fileText, isRecord, KitError, majorOf, readJson, readJsonc, stringRecord, toPosix, walk } from "./files.ts";
import { lockName, type App, type Kit, type Manifest } from "./kit.ts";
import { labIndex, labIndexProblems, readRecipes, recipeProblems } from "./recipes.ts";

export interface Finding {
  readonly rule: string;
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

export interface LineRule {
  readonly id: string;
  readonly message: string;
  readonly applies: (file: string) => boolean;
  readonly test: (line: string, next: string) => boolean;
}

/** A rule that needs the context of several lines, such as the JSX element that encloses a line. */
export interface FileRule {
  readonly id: string;
  readonly message: string;
  readonly applies: (file: string) => boolean;
  /** Returns the 0-based indexes of the lines that break the rule. */
  readonly findings: (lines: ReadonlyArray<string>) => ReadonlyArray<number>;
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface DoctorCheck {
  readonly id: string;
  readonly status: CheckStatus;
  readonly message: string;
  readonly fix?: string;
}

export interface DoctorContext {
  readonly appDir: string;
  // The template of the use case, which the doctor checks compare with.
  readonly templateDir: string;
  // The package.json of the app.
  readonly pkg: Record<string, unknown>;
}

// What the rules module of a use case returns.
export interface UseCaseRules {
  readonly lineRules?: ReadonlyArray<LineRule>;
  readonly fileRules?: ReadonlyArray<FileRule>;
  readonly doctor?: (context: DoctorContext) => ReadonlyArray<DoctorCheck>;
}

// The file kinds of the kit layout, which the rules of a use case can reuse.
export const appFiles = {
  isUiFile: (file: string) => /^src\/(components|routes|features)\//.test(file) && /\.(tsx?|jsx?)$/.test(file) && !file.endsWith(".stylex.ts"),
  isSrcCode: (file: string) => /^src\//.test(file) && /\.(tsx?|jsx?)$/.test(file) && !file.endsWith("routeTree.gen.ts"),
  isClientModule: (file: string) => /^src\/(features|routes|components|lib)\//.test(file) && !/\.server\.(tsx?)$/.test(file),
  isAppScreen: (file: string) => /^src\/(routes|features)\//.test(file) && file.endsWith(".tsx"),
};

// The helpers that the hub gives to the rules module of a use case. The module
// imports only types from the hub, so that it has no runtime path to the hub.
export const ruleKit = {
  ...appFiles,
  escapeRegExp,
  fileText,
  isRecord,
  majorOf,
  readJson,
  readJsonc,
  stringRecord,
  walk,
};

export type RuleKit = typeof ruleKit;

// The default export of the rules module of a use case.
export type UseCaseRulesModule = (kit: RuleKit) => UseCaseRules;

const { isUiFile, isSrcCode, isAppScreen } = appFiles;

function isForbidden(manifest: Manifest, name: string): boolean {
  return manifest.forbiddenDependencies.includes(name) || manifest.forbiddenDependencyPrefixes.some((prefix) => name.startsWith(prefix));
}

export function forbiddenDependencies(manifest: Manifest, pkg: unknown): string[] {
  const deps = isRecord(pkg) ? { ...stringRecord(pkg.dependencies), ...stringRecord(pkg.devDependencies) } : {};
  return Object.keys(deps).filter((name) => isForbidden(manifest, name));
}

/** Matches imports of a forbidden package or any of its subpaths. */
function forbiddenImportPattern(manifest: Manifest): RegExp {
  const names = [
    ...manifest.forbiddenDependencies.map((name) => `${escapeRegExp(name)}(?:/[^"']*)?`),
    ...manifest.forbiddenDependencyPrefixes.map((prefix) => `${escapeRegExp(prefix)}[^"']*`),
  ].join("|");
  return new RegExp(`from ["'](?:${names})["']|import\\(["'](?:${names})["']\\)`);
}

const separatorEscape = /&middot;|&bull;|&#183;|&#8226;|&#x[bB]7;|&#x2022;|\\u00[bB]7|\\u2022|\\x[bB]7/g;
const dotGlyph = /(?<![·•∙⋅])[·•∙⋅](?![·•∙⋅])/g;
const joinWithSeparator = /\.join\(\s*(["'`])(?:[^"'`]*[·•∙⋅]|[^"'`]*\s\||\|\s)[^"'`]*\1\s*\)/;
const doubleQuotedOrTemplate = /"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
const barBetweenWords = /\s\|\s/;
const barInJsxText = />[^<>{}]*\s\|\s[^<>{}]*<\//;

/**
 * Finds a middle dot, a bullet, or a vertical bar that separates two facts in
 * UI text. A dot glyph counts when whitespace or a line end touches it, when
 * it is the only text of an element, or when it is the argument of `join`.
 * A dot glyph between quotes with no whitespace, such as a delta glyph, and a
 * run of dots, such as a masked secret, do not count. A vertical bar counts
 * only in a double-quoted string, a one-line template literal, or the JSX
 * text of an element that closes on the same line, because elsewhere it is a
 * union type or a bitwise operator. `join("|")` without whitespace builds a
 * pattern, so it does not count.
 */
function joinsWithSeparator(rawLine: string): boolean {
  const trimmed = rawLine.trim();
  if (/^(?:\/\/|\/\*|\*|\{\/\*)/.test(trimmed)) return false;
  const line = rawLine.replace(/(?:^|\s)\/\/\s.*$/, "").replace(separatorEscape, "·");
  if (joinWithSeparator.test(line)) return true;
  for (const match of line.matchAll(dotGlyph)) {
    const before = line[match.index - 1];
    const after = line[match.index + 1];
    const touchesSpace = (char: string | undefined) => char === undefined || /\s/.test(char);
    if (touchesSpace(before) || touchesSpace(after) || (before === ">" && after === "<")) return true;
  }
  if (barInJsxText.test(line)) return true;
  for (const match of line.matchAll(doubleQuotedOrTemplate)) {
    if (barBetweenWords.test(match[0].slice(1, -1))) return true;
  }
  return false;
}

function kitLineRules(manifest: Manifest): ReadonlyArray<LineRule> {
  const forbiddenImport = forbiddenImportPattern(manifest);
  return [
    {
      id: "forbidden-import",
      message: "Import from a library that the kit replaces. Run `design read kit-migration-map#libraries`.",
      applies: isSrcCode,
      test: (line) => forbiddenImport.test(line),
    },
    {
      id: "class-name-string",
      message: "className string. Style with stylex.create and stylex.props.",
      applies: isUiFile,
      test: (line) => /className="[^"]+"/.test(line),
    },
    {
      id: "inline-style-object",
      message: "Inline style object. Use stylex.create; dynamic values use a style function.",
      applies: isUiFile,
      test: (line) => /style=\{\{/.test(line),
    },
    {
      id: "raw-color",
      message: "Color literal in a component. Use a color token from tokens.stylex.ts.",
      applies: isUiFile,
      test: (line) =>
        /["'`(\s]#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?=["'`)\s;,])/.test(line) ||
        /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/.test(line),
    },
    {
      id: "font-size-literal",
      message: "Font size literal. Use a font token.",
      applies: isUiFile,
      test: (line) => /fontSize:\s*(?:["'`][\d.]+(?:px|rem|em)["'`]|\d)/.test(line),
    },
    {
      id: "stylex-shorthand",
      message: "border, background, or outline shorthand. StyleX does not reset native styles with it; use longhands.",
      applies: isUiFile,
      test: (line) => /^\s*(?:border|background|outline):\s/.test(line),
    },
    {
      id: "palette-import",
      message: "palette.stylex or brand.stylex imported outside tokens.stylex.ts and themes.ts. Components read tokens only.",
      applies: (file) => isSrcCode(file) && !/^src\/styles\/(tokens\.stylex|themes)\.ts$/.test(file),
      test: (line) => /from ["'][^"']*(?:palette|brand)\.stylex["']/.test(line),
    },
    {
      id: "left-edge-nav",
      message: "Left-edge marker on navigation. Mark the current item with a selected surface and aria-current.",
      applies: (file) => /^src\/components\/shell\//.test(file) || /nav/i.test(file.split("/").pop() ?? ""),
      test: (line) => /\b(?:borderLeft|borderInlineStart)\w*\s*:|boxShadow:\s*["'`]inset/.test(line),
    },
    {
      id: "theme-media-query",
      message: "prefers-color-scheme in a component. Themes are a token concern.",
      applies: (file) => isUiFile(file) && file !== "src/components/shell/app-document.tsx",
      test: (line) => /prefers-color-scheme/.test(line),
    },
    {
      id: "raw-element",
      message: "Native control or table in a screen. Use the kit primitive (Button, TextField, Select, DataTable).",
      applies: isAppScreen,
      test: (line) => /<(?:button|input|select|textarea|table)\b/.test(line),
    },
    {
      id: "intl-in-component",
      message: "Intl formatter created in a component. Use the formatters in src/lib/locale.ts.",
      applies: isUiFile,
      test: (line) => /new Intl\./.test(line),
    },
  ];
}

const sizedButtons = new Set(["Button", "LinkButton"]);

/**
 * Finds an explicit `size` on a Button or LinkButton inside a Toolbar,
 * including its `actions`. The scan follows JSX tags across lines: each
 * `size=` belongs to the last opened tag before it.
 */
function toolbarButtonSizes(lines: ReadonlyArray<string>): ReadonlyArray<number> {
  const found: Array<number> = [];
  let depth = 0;
  let lastTag = "";
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/<(\/?)([A-Za-z][\w.]*)|\bsize=/g)) {
      const tag = match[2];
      if (tag === undefined) {
        if (depth > 0 && sizedButtons.has(lastTag) && found.at(-1) !== index) found.push(index);
      } else if (match[1] === "/") {
        if (tag === "Toolbar") depth = Math.max(0, depth - 1);
      } else {
        if (tag === "Toolbar") depth += 1;
        lastTag = tag;
      }
    }
  });
  return found;
}

/**
 * Finds separator glyphs line by line. Lines inside a multi-line template
 * literal are skipped: such a literal holds a code sample or a file body, where
 * a bar is a shell pipe and a dot is data. On the line that opens the literal,
 * only the text before it is checked.
 */
function separatorGlyphs(lines: ReadonlyArray<string>): ReadonlyArray<number> {
  const found: Array<number> = [];
  let inTemplate = false;
  lines.forEach((line, index) => {
    const ticks = [...line.matchAll(/(?<!\\)`/g)].map((match) => match.index);
    const startsInside = inTemplate;
    if (ticks.length % 2 === 1) inTemplate = !inTemplate;
    if (startsInside) return;
    const checked = ticks.length % 2 === 1 ? line.slice(0, ticks.at(-1)) : line;
    if (joinsWithSeparator(checked)) found.push(index);
  });
  return found;
}

function kitFileRules(): ReadonlyArray<FileRule> {
  return [
    {
      id: "separator-glyph",
      message:
        "Middle dot, bullet, or vertical bar that joins separate facts. Give each fact its own element, such as a MetaLine item, or write a sentence. See `design read grouped-values`.",
      applies: isSrcCode,
      findings: separatorGlyphs,
    },
    {
      id: "toolbar-control-size",
      message: "Explicit size on a Button inside a Toolbar. Controls take the toolbar size, so the row keeps one height. Set size on the Toolbar.",
      applies: isUiFile,
      findings: toolbarButtonSizes,
    },
  ];
}

// The rules that need the whole app, not one line. check reports them under
// these ids.
const APP_RULE_MESSAGES: Readonly<Record<string, string>> = {
  "forbidden-dependency": "Dependency that the kit replaces. Migrate its usages (design read kit-migration-map#libraries), then bun remove it.",
  "kit-docs":
    "A kit component file has no valid doc comment. In an app, run design sync --write to install the documented kit. In the design skill, fix the comment in assets/kit: design read kit-adding-a-component.",
  recipes: "A lab page breaks the recipe contract. Fix the recipe in the lab of the use case: design read kit-recipes.",
  "kit-folder":
    "src/components/ holds only kit files. Move each app file to src/features/<name>/ui/ of the feature that uses it, and update its imports: design read kit-update#app-files.",
  "kit-layout": "The kit files of the app are at old paths. Run design sync --write to move them: design read kit-update#moved-kit-files.",
};

export interface RuleSet {
  readonly lineRules: ReadonlyArray<LineRule>;
  readonly fileRules: ReadonlyArray<FileRule>;
  readonly messages: Readonly<Record<string, string>>;
}

// The kit rules and the rules of the use case. A use case rule cannot take
// the id of a kit rule, because check groups the findings by id.
export function ruleSet(kit: Kit, useCase: UseCaseRules | null): RuleSet {
  const lineRules = [...kitLineRules(kit.manifest), ...(useCase?.lineRules ?? [])];
  const fileRules = [...kitFileRules(), ...(useCase?.fileRules ?? [])];
  const messages: Record<string, string> = { ...APP_RULE_MESSAGES };
  for (const rule of [...lineRules, ...fileRules]) {
    if (messages[rule.id] !== undefined) throw new KitError(`the check rule id "${rule.id}" appears twice; a use case rule needs its own id`);
    messages[rule.id] = rule.message;
  }
  return { lineRules, fileRules, messages };
}

// Loads the rules module of a use case. The module is TypeScript, and the
// runtime loads it without a build step. A synchronous load keeps the CLI
// synchronous.
const requireModule = createRequire(import.meta.url);

export function loadUseCaseRules(path: string | null, useCase: string): UseCaseRules | null {
  if (path === null) return null;
  const loaded: unknown = requireModule(path);
  const factory = isRecord(loaded) ? loaded.default : undefined;
  if (typeof factory !== "function") throw new KitError(`${path}: the rules module of ${useCase} must have a default export: (kit) => { lineRules?, fileRules?, doctor? }`);
  const rules: unknown = (factory as UseCaseRulesModule)(ruleKit);
  if (!isRecord(rules)) throw new KitError(`${path}: the default export of the rules module must return an object`);
  const valid = (list: unknown, test: string) =>
    list === undefined ||
    (Array.isArray(list) &&
      list.every((rule) => isRecord(rule) && typeof rule.id === "string" && typeof rule.message === "string" && typeof rule.applies === "function" && typeof rule[test] === "function"));
  if (!valid(rules.lineRules, "test") || !valid(rules.fileRules, "findings") || (rules.doctor !== undefined && typeof rules.doctor !== "function")) {
    throw new KitError(`${path}: each rule needs an id, a message, applies(file), and test(line, next) or findings(lines); doctor must be a function`);
  }
  return rules as UseCaseRules;
}

// ---------------------------------------------------------------- check

export function runCheck(app: App, kit: Kit, rules: RuleSet): Array<Finding> {
  const { manifest } = kit;
  const appDir = app.dir;
  const findings: Array<Finding> = [];
  const packagePath = join(appDir, "package.json");
  if (existsSync(packagePath)) {
    for (const name of forbiddenDependencies(manifest, readJson(packagePath))) findings.push({ rule: "forbidden-dependency", file: "package.json", line: 0, text: name });
  }
  for (const absolute of walk(join(appDir, "src"))) {
    const file = toPosix(relative(appDir, absolute));
    const applicable = rules.lineRules.filter((rule) => rule.applies(file));
    const applicableBlocks = rules.fileRules.filter((rule) => rule.applies(file));
    if (applicable.length === 0 && applicableBlocks.length === 0) continue;
    const lines = readFileSync(absolute, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const rule of applicable) {
        if (rule.test(line, lines[index + 1] ?? "")) findings.push({ rule: rule.id, file, line: index + 1, text: line.trim() });
      }
    });
    for (const rule of applicableBlocks) {
      for (const index of rule.findings(lines)) {
        findings.push({ rule: rule.id, file, line: index + 1, text: (lines[index] ?? "").trim() });
      }
    }
  }
  findings.push(...kitFolderFindings(app, manifest));
  findings.push(...kitDocFindings(app, manifest));
  const lab = app.useCase.app.lab;
  if (lab !== null && existsSync(join(appDir, labIndex(lab)))) findings.push(...recipeFindings(app, manifest));
  return findings;
}

// A scaffold with the lab is where the recipes build and type-check, so check
// also holds each recipe to the recipe contract there.
function recipeFindings(app: App, manifest: Manifest): Array<Finding> {
  const lab = app.useCase.app.lab!;
  const recipes = readRecipes(app.dir, lab, app.useCase.name);
  const findings: Array<Finding> = [];
  for (const [file, problems] of recipeProblems(recipes, readKitDocs(appDocSource(app, manifest)))) {
    for (const problem of problems) findings.push({ rule: "recipes", file, line: 1, text: problem });
  }
  for (const problem of labIndexProblems(app.dir, lab, recipes)) findings.push({ rule: "recipes", file: labIndex(lab), line: 1, text: problem });
  return findings;
}

// src/components/ is the catalog of the kit, so an app file there reads as a
// kit component to the next agent. The lock names the kit files of an app.
// Without a lock, the kit files are the files that kit.json lists.
function kitFolderFindings(app: App, manifest: Manifest): Array<Finding> {
  const kitFiles = new Set(app.lock === undefined ? manifest.files : Object.keys(app.lock.files));
  return walk(join(app.dir, "src/components"))
    .map((absolute) => toPosix(relative(app.dir, absolute)))
    .filter((file) => !kitFiles.has(file))
    .map((file) => ({ rule: "kit-folder", file, line: 1, text: "not a kit file; move it to src/features/<name>/ui/" }));
}

// The kit files of an app that need a doc comment. With a lock, they are the
// installed files. Without one, they are the documented files that the app has.
function appDocSource(app: App, manifest: Manifest): KitSource {
  if (app.lock !== undefined) return appKitSource(app.dir, Object.keys(app.lock.files), manifest);
  return { root: app.dir, isApp: true, files: documentedFiles(manifest).filter((file) => existsSync(join(app.dir, file))), moved: [] };
}

function kitDocFindings(app: App, manifest: Manifest): Array<Finding> {
  const findings: Array<Finding> = [];
  const source = appDocSource(app, manifest);
  const moved = movedKitMessage(source);
  if (moved !== null) findings.push({ rule: "kit-layout", file: lockName(app.useCase.name), line: 1, text: moved });
  for (const [file, problems] of kitProblems(readKitDocs(source))) {
    for (const problem of problems) findings.push({ rule: "kit-docs", file, line: 1, text: problem });
  }
  return findings;
}
