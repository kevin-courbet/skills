// Reads the doc comment and the exported API of a kit file with plain text
// scanning. The kit ships to apps without a build step, so the docs command
// cannot depend on the TypeScript compiler or on npm packages.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

export const LAYERS = ["primitive", "pattern", "shell", "helper"] as const;
export type Layer = (typeof LAYERS)[number];

export const LAYER_TITLES: Record<Layer, string> = {
  primitive: "Primitives",
  pattern: "Patterns",
  shell: "Shell",
  helper: "Helpers",
};

export const LAYER_MEANINGS: Record<Layer, string> = {
  primitive: "One control or one display element. Pages compose them.",
  pattern: "A complete interaction for one kind of task, built from primitives.",
  shell: "The app frame, the document, and the router defaults. The layout route mounts them once.",
  helper: "Hooks, functions, providers, styles, and parts for kit code and for new collections.",
};

// The folder of a kit file is its layer, so that a builder sees the layer in
// the path and in the import specifier, not only in the doc comment.
export const LAYER_FOLDERS: Record<Layer, string> = {
  primitive: "src/components/primitives/",
  pattern: "src/components/patterns/",
  shell: "src/components/shell/",
  helper: "src/components/helpers/",
};

const KNOWN_TAGS = new Set(["layer", "keywords", "related", "notes"]);
const REQUIRED_SECTIONS = ["Example"] as const;

export interface DocSection {
  readonly title: string;
  readonly slug: string;
  readonly text: string;
}

export interface Member {
  readonly name: string;
  readonly optional: boolean;
  readonly type: string;
  readonly comment: string;
  readonly defaultValue?: string;
}

export interface PropsShape {
  // One entry per variant of a union. Most props have one variant.
  readonly variants: ReadonlyArray<{ readonly members: ReadonlyArray<Member>; readonly external: ReadonlyArray<string> }>;
}

export interface ComponentApi {
  readonly name: string;
  readonly propsType: string | null;
  readonly props: PropsShape | null;
}

// A hook or a function. For a hook, `inputs` are the local types that its
// parameters name, such as an options object, so that the docs print their
// fields. A function takes data types that the component props already name.
export interface Callable {
  readonly name: string;
  readonly signature: string;
  readonly inputs: ReadonlyArray<{ readonly name: string; readonly members: ReadonlyArray<Member> }>;
}

export interface Exports {
  readonly components: ReadonlyArray<ComponentApi>;
  readonly hooks: ReadonlyArray<Callable>;
  readonly functions: ReadonlyArray<Callable>;
  readonly types: ReadonlyArray<string>;
  readonly values: ReadonlyArray<string>;
}

export interface KitDoc {
  readonly id: string;
  readonly fileId: string;
  readonly file: string;
  readonly summary: string;
  readonly layer: Layer | null;
  readonly keywords: ReadonlyArray<string>;
  readonly related: ReadonlyArray<string>;
  readonly notes: ReadonlyArray<string>;
  readonly intro: string;
  readonly sections: ReadonlyArray<DocSection>;
  readonly exports: Exports;
  readonly hasComment: boolean;
  readonly problems: ReadonlyArray<string>;
  readonly source: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length;
}

function list(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

// ------------------------------------------------------------ doc comment

interface RawComment {
  readonly lines: ReadonlyArray<string>;
}

// The doc comment is the first block comment that opens with "/**". Line
// comments before it are permitted, so that a license notice stays the first
// line of the file.
function leadingComment(source: string): RawComment | null {
  const lines = source.split("\n");
  let index = 0;
  while (index < lines.length && (lines[index]!.trim() === "" || lines[index]!.trim().startsWith("//"))) index += 1;
  if (index >= lines.length || !lines[index]!.trim().startsWith("/**")) return null;
  const body: string[] = [];
  const first = lines[index]!.trim().slice(3);
  if (first.includes("*/")) return { lines: [first.slice(0, first.indexOf("*/")).trim()] };
  if (first.trim() !== "") body.push(first.trim());
  for (index += 1; index < lines.length; index += 1) {
    const line = lines[index]!;
    const end = line.indexOf("*/");
    const content = end === -1 ? line : line.slice(0, end);
    body.push(content.replace(/^\s*\* ?/, "").replace(/^\s*\*$/, "").trimEnd());
    if (end !== -1) return { lines: body };
  }
  return null;
}

function parseComment(comment: RawComment, problems: string[]) {
  const tags = new Map<string, string>();
  const text: string[] = [];
  let fence = false;
  for (const line of comment.lines) {
    if (/^\s*```/.test(line)) fence = !fence;
    const tag = fence ? null : /^@([a-z]+)\s*(.*)$/.exec(line);
    if (tag) {
      if (!KNOWN_TAGS.has(tag[1]!)) problems.push(`unknown tag @${tag[1]}; the tags are ${[...KNOWN_TAGS].map((name) => `@${name}`).join(", ")}`);
      if (tags.has(tag[1]!)) problems.push(`the tag @${tag[1]} appears twice`);
      tags.set(tag[1]!, tag[2]!.trim());
      continue;
    }
    text.push(line);
  }
  while (text.length > 0 && text[0]!.trim() === "") text.shift();
  const summaryEnd = text.findIndex((line) => line.trim() === "");
  const summaryLines = summaryEnd === -1 ? text : text.slice(0, summaryEnd);
  const summary = summaryLines.join(" ").replace(/\s+/g, " ").trim();
  const rest = summaryEnd === -1 ? [] : text.slice(summaryEnd + 1);

  const sections: DocSection[] = [];
  const intro: string[] = [];
  let current: { title: string; lines: string[] } | null = null;
  fence = false;
  for (const line of rest) {
    if (/^\s*```/.test(line)) fence = !fence;
    const heading = fence ? null : /^## (.+)$/.exec(line);
    if (heading) {
      if (current) sections.push(finishSection(current));
      current = { title: heading[1]!.trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
    else intro.push(line);
  }
  if (current) sections.push(finishSection(current));
  return { tags, summary, intro: intro.join("\n").trim(), sections };
}

function finishSection(section: { title: string; lines: string[] }): DocSection {
  return { title: section.title, slug: slugify(section.title), text: section.lines.join("\n").trim() };
}

// ------------------------------------------------------------ source scanning

// Returns the index after the bracket that closes the one at `open`. It skips
// strings, template literals, and comments, and it does not count the ">" of
// "=>" as a closing angle bracket.
function closeBracket(source: string, open: number): number {
  const pairs: Record<string, string> = { "(": ")", "{": "}", "[": "]", "<": ">" };
  const stack: string[] = [];
  for (let index = open; index < source.length; index += 1) {
    const char = source[index]!;
    if (char === '"' || char === "'" || char === "`") {
      index = skipString(source, index);
      continue;
    }
    if (char === "/" && source[index + 1] === "/") {
      index = source.indexOf("\n", index);
      if (index === -1) return source.length;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      index = source.indexOf("*/", index + 2) + 1;
      continue;
    }
    if (char === ">" && source[index - 1] === "=") continue;
    if (char in pairs) {
      stack.push(pairs[char]!);
      continue;
    }
    if (char === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return index + 1;
      continue;
    }
    // A "<" that opened a comparison, not a type argument, never closes.
    // Drop it when a bracket of another kind closes.
    if ((char === ")" || char === "}" || char === "]") && stack[stack.length - 1] === ">") {
      while (stack[stack.length - 1] === ">") stack.pop();
      if (char === stack[stack.length - 1]) {
        stack.pop();
        if (stack.length === 0) return index + 1;
      }
    }
  }
  return source.length;
}

function skipString(source: string, start: number): number {
  const quote = source[start]!;
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1;
      continue;
    }
    if (quote === "`" && source[index] === "$" && source[index + 1] === "{") {
      index = closeBracket(source, index + 1) - 1;
      continue;
    }
    if (source[index] === quote) return index;
  }
  return source.length;
}

// Splits at a separator that is not inside brackets, strings, or comments.
function splitTop(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (char === '"' || char === "'" || char === "`") {
      index = skipString(text, index);
      continue;
    }
    if (char === "/" && text[index + 1] === "*") {
      index = text.indexOf("*/", index + 2) + 1;
      if (index === 0) break;
      continue;
    }
    if (char === "/" && text[index + 1] === "/") {
      const end = text.indexOf("\n", index);
      if (end === -1) break;
      index = end;
      continue;
    }
    if (char === ">" && text[index - 1] === "=") continue;
    if ("({[<".includes(char)) depth += 1;
    else if (")}]>".includes(char)) depth -= 1;
    else if (depth === 0 && text.startsWith(separator, index)) {
      parts.push(text.slice(start, index));
      start = index + separator.length;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

// Squashes a type or a code fragment to one line. Comments inside an inline
// type are member docs, which the member lines print, so they go.
function squash(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1")
    .replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").replace(/<\s/g, "<").replace(/\s>/g, ">").trim();
}

function commentText(raw: string): string {
  return raw
    .replace(/^\/\*\*?/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, "").replace(/^\s*\/\/ ?/, "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Declaration {
  readonly kind: "interface" | "type";
  readonly name: string;
  readonly heritage: string;
  readonly body: string;
}

function declarations(source: string): Map<string, Declaration> {
  const found = new Map<string, Declaration>();
  const pattern = /^(?:export\s+)?(interface|type)\s+([A-Z][\w]*)\s*(<)?/gm;
  for (const match of source.matchAll(pattern)) {
    const kind = match[1] as "interface" | "type";
    const name = match[2]!;
    let index = match.index + match[0].length;
    if (match[3]) index = closeBracket(source, index - 1);
    if (kind === "interface") {
      const open = source.indexOf("{", index);
      const close = closeBracket(source, open);
      const heritage = source.slice(index, open).replace(/^\s*extends\s+/, "").trim();
      found.set(name, { kind, name, heritage, body: source.slice(open + 1, close - 1) });
    } else {
      const equals = source.indexOf("=", index);
      let end = equals + 1;
      let depth = 0;
      for (; end < source.length; end += 1) {
        const char = source[end]!;
        if (char === '"' || char === "'" || char === "`") {
          end = skipString(source, end);
          continue;
        }
        if (char === ">" && source[end - 1] === "=") continue;
        if ("({[<".includes(char)) depth += 1;
        else if (")}]>".includes(char)) depth -= 1;
        else if (char === ";" && depth === 0) break;
      }
      found.set(name, { kind, name, heritage: "", body: source.slice(equals + 1, end).trim() });
    }
  }
  return found;
}

function parseMembers(body: string): Member[] {
  const members: Member[] = [];
  for (const chunk of splitTop(body, ";")) {
    let rest = chunk.trim();
    const comments: string[] = [];
    for (;;) {
      if (rest.startsWith("/*")) {
        const end = rest.indexOf("*/");
        comments.push(commentText(rest.slice(0, end + 2)));
        rest = rest.slice(end + 2).trim();
      } else if (rest.startsWith("//")) {
        const end = rest.indexOf("\n");
        comments.push(commentText(end === -1 ? rest : rest.slice(0, end)));
        rest = end === -1 ? "" : rest.slice(end + 1).trim();
      } else break;
    }
    if (rest === "") continue;
    const property = /^(?:readonly\s+)?([A-Za-z_$][\w$]*|"[^"]+"|'[^']+')(\?)?\s*:\s*([\s\S]+)$/.exec(rest);
    if (property) {
      members.push({ name: property[1]!.replace(/["']/g, ""), optional: property[2] === "?", type: squash(property[3]!), comment: comments.join(" ") });
      continue;
    }
    const method = /^([A-Za-z_$][\w$]*)(\?)?\s*(\([\s\S]*)$/.exec(rest);
    if (method) {
      members.push({ name: method[1]!, optional: method[2] === "?", type: squash(method[3]!), comment: comments.join(" ") });
    }
  }
  return members;
}

function typeName(expression: string): { name: string; args: string } | null {
  const match = /^([A-Za-z_$][\w$.]*)\s*(<[\s\S]*>)?$/.exec(expression.trim());
  if (!match) return null;
  return { name: match[1]!, args: match[2] ? match[2].slice(1, -1) : "" };
}

function stringKeys(expression: string): string[] {
  return [...expression.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]!);
}

function resolveShape(expression: string, decls: Map<string, Declaration>, seen: Set<string>): PropsShape {
  const text = expression.trim().replace(/^\(([\s\S]*)\)$/, "$1").trim();
  const variants = splitTop(text, "|").map((part) => part.trim()).filter((part) => part !== "");
  if (variants.length > 1) {
    return { variants: variants.flatMap((variant) => resolveShape(variant, decls, seen).variants) };
  }
  const members: Member[] = [];
  const external: string[] = [];
  let nested: PropsShape | null = null;
  for (const raw of splitTop(text, "&")) {
    const part = raw.trim();
    if (part === "") continue;
    if (part.startsWith("{")) {
      members.push(...parseMembers(part.slice(1, closeBracket(part, 0) - 1)));
      continue;
    }
    const named = typeName(part);
    if (named && (named.name === "Omit" || named.name === "Pick")) {
      const [target = "", keys = ""] = splitTop(named.args, ",");
      const inner = resolveShape(target, decls, seen);
      const wanted = new Set(stringKeys(keys));
      const keep = (member: Member) => (named.name === "Omit" ? !wanted.has(member.name) : wanted.has(member.name));
      if (inner.variants.length === 1) {
        members.push(...inner.variants[0]!.members.filter(keep));
        external.push(...inner.variants[0]!.external.map((name) => (named.name === "Omit" ? `${name} without ${[...wanted].join(", ")}` : `${[...wanted].join(", ")} of ${name}`)));
      } else {
        external.push(squash(part));
      }
      continue;
    }
    const declaration = named ? decls.get(named.name) : undefined;
    if (named && declaration && !seen.has(named.name)) {
      const next = new Set(seen).add(named.name);
      if (declaration.kind === "interface") {
        if (declaration.heritage !== "") {
          for (const parent of splitTop(declaration.heritage, ",")) {
            const shape = resolveShape(parent, decls, next);
            members.push(...(shape.variants[0]?.members ?? []));
            external.push(...(shape.variants[0]?.external ?? []));
          }
        }
        members.push(...parseMembers(declaration.body));
      } else {
        const shape = resolveShape(declaration.body, decls, next);
        if (shape.variants.length > 1) nested = shape;
        else {
          members.push(...(shape.variants[0]?.members ?? []));
          external.push(...(shape.variants[0]?.external ?? []));
        }
      }
      continue;
    }
    external.push(squash(part));
  }
  if (nested) {
    return { variants: nested.variants.map((variant) => ({ members: [...members, ...variant.members], external: [...external, ...variant.external] })) };
  }
  // A later member overrides an inherited one with the same name.
  const byName = new Map<string, Member>();
  for (const member of members) byName.set(member.name, member);
  return { variants: [{ members: [...byName.values()], external }] };
}

function destructureDefaults(pattern: string): Map<string, string> {
  const defaults = new Map<string, string>();
  for (const raw of splitTop(pattern, ",")) {
    const part = raw.trim();
    const match = /^([A-Za-z_$][\w$]*)(?:\s*:\s*[A-Za-z_$][\w$]*)?\s*=\s*([\s\S]+)$/.exec(part);
    if (match) defaults.set(match[1]!, squash(match[2]!));
  }
  return defaults;
}

function componentApi(source: string, name: string, paramsStart: number, decls: Map<string, Declaration>): ComponentApi {
  const paramsEnd = closeBracket(source, paramsStart);
  const params = source.slice(paramsStart + 1, paramsEnd - 1).trim();
  if (params === "") return { name, propsType: null, props: null };
  let defaults = new Map<string, string>();
  let annotation = "";
  if (params.startsWith("{")) {
    const close = closeBracket(params, 0);
    defaults = destructureDefaults(params.slice(1, close - 1));
    annotation = params.slice(close).replace(/^\s*:\s*/, "");
  } else {
    annotation = params.replace(/^[A-Za-z_$][\w$]*\s*:\s*/, "");
  }
  annotation = splitTop(annotation, ",")[0]!.trim();
  if (annotation === "") return { name, propsType: null, props: null };
  const shape = resolveShape(annotation, decls, new Set());
  const withDefaults: PropsShape = {
    variants: shape.variants.map((variant) => ({
      external: variant.external,
      members: variant.members.map((member) =>
        defaults.has(member.name) ? { ...member, defaultValue: defaults.get(member.name)! } : member,
      ),
    })),
  };
  return { name, propsType: squash(annotation), props: withDefaults };
}

function signatureAt(source: string, name: string, paramsStart: number): string {
  const paramsEnd = closeBracket(source, paramsStart);
  const after = source.slice(paramsEnd);
  const returns = /^\s*:\s*/.exec(after);
  let signature = `${name}${squash(source.slice(paramsStart, paramsEnd))}`;
  if (returns) {
    const bodyStart = after.search(/\{\s*$|\{\n/m);
    const type = bodyStart === -1 ? "" : after.slice(returns[0].length, bodyStart);
    if (type.trim() !== "") signature += `: ${squash(type)}`;
  }
  return signature;
}

function callable(source: string, name: string, paramsStart: number, decls: Map<string, Declaration>): Callable {
  const params = source.slice(paramsStart, closeBracket(source, paramsStart));
  const inputs: Array<{ name: string; members: Member[] }> = [];
  for (const typeName of new Set(params.match(/\b[A-Z][\w$]*/g) ?? [])) {
    if (!decls.has(typeName)) continue;
    const shape = resolveShape(typeName, decls, new Set());
    const members = shape.variants.length === 1 ? shape.variants[0]!.members : [];
    if (members.length > 0) inputs.push({ name: typeName, members: [...members] });
  }
  return { name, signature: signatureAt(source, name, paramsStart), inputs };
}

function readExports(source: string): Exports {
  const decls = declarations(source);
  const components: ComponentApi[] = [];
  const hooks: Callable[] = [];
  const functions: Callable[] = [];
  const types: string[] = [];
  const values: string[] = [];

  for (const match of source.matchAll(/^export\s+(?:default\s+)?function\s+([A-Za-z_$][\w$]*)\s*(<)?/gm)) {
    const name = match[1]!;
    let index = match.index + match[0].length;
    if (match[2]) index = closeBracket(source, index - 1);
    const paramsStart = source.indexOf("(", index);
    if (/^[A-Z]/.test(name)) components.push(componentApi(source, name, paramsStart, decls));
    else if (/^use[A-Z]/.test(name)) hooks.push(callable(source, name, paramsStart, decls));
    else functions.push({ ...callable(source, name, paramsStart, decls), inputs: [] });
  }
  for (const match of source.matchAll(/^export\s+(?:interface|type)\s+([A-Z][\w$]*)/gm)) types.push(match[1]!);
  for (const match of source.matchAll(/^export\s+const\s+([A-Za-z_$][\w$]*)/gm)) values.push(match[1]!);
  for (const match of source.matchAll(/^export\s+(type\s+)?\{([^}]*)\}/gm)) {
    for (const raw of match[2]!.split(",")) {
      const item = raw.trim().replace(/^type\s+/, "");
      if (item === "") continue;
      const name = item.split(/\s+as\s+/).pop()!.trim();
      if (match[1] || /^type\s/.test(raw.trim())) types.push(name);
      else if (/^[A-Z]/.test(name)) components.push({ name, propsType: null, props: null });
      else values.push(name);
    }
  }
  return { components, hooks, functions, types, values };
}

// ------------------------------------------------------------ doc of one file

export function fileId(file: string): string {
  return basename(file).replace(/\.(tsx?|jsx?)$/, "");
}

// The doc id is the file name in PascalCase, such as Kanban for kanban.tsx.
// It cannot collide with a design note id, which is lowercase.
export function docId(file: string): string {
  return fileId(file)
    .split(/[^A-Za-z0-9]+/)
    .filter((part) => part !== "")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}

export function readKitDoc(root: string, file: string): KitDoc {
  const path = join(root, file);
  if (!existsSync(path)) {
    return {
      id: docId(file),
      fileId: fileId(file),
      file,
      summary: "",
      layer: null,
      keywords: [],
      related: [],
      notes: [],
      intro: "",
      sections: [],
      exports: { components: [], hooks: [], functions: [], types: [], values: [] },
      hasComment: false,
      problems: ["the kit lock lists this file, but the file is missing; run internal-app sync --write"],
      source: root,
    };
  }
  const source = readFileSync(path, "utf8").replace(/\r\n?/g, "\n");
  const problems: string[] = [];
  const raw = leadingComment(source);
  const exports = readExports(source);
  const id = docId(file);
  if (!raw) {
    return {
      id,
      fileId: fileId(file),
      file,
      summary: "",
      layer: null,
      keywords: [],
      related: [],
      notes: [],
      intro: "",
      sections: [],
      exports,
      hasComment: false,
      problems: ["the file does not start with a doc comment (/** ... */)"],
      source: root,
    };
  }
  const parsed = parseComment(raw, problems);
  const layerTag = parsed.tags.get("layer");
  const layer = layerTag !== undefined && (LAYERS as ReadonlyArray<string>).includes(layerTag) ? (layerTag as Layer) : null;
  if (layerTag === undefined) problems.push(`the doc comment has no @layer; give one of ${LAYERS.join(", ")}`);
  else if (layer === null) problems.push(`@layer ${layerTag} is not a layer; give one of ${LAYERS.join(", ")}`);
  else if (!file.startsWith(LAYER_FOLDERS[layer]) || file.slice(LAYER_FOLDERS[layer].length).includes("/"))
    problems.push(`@layer ${layer} does not agree with the folder of the file; put a ${layer} file in ${LAYER_FOLDERS[layer]}`);
  if (parsed.summary === "") problems.push("the doc comment has no summary sentence");
  else if (!parsed.summary.endsWith(".")) problems.push("the summary must be one sentence that ends with a period");
  const keywords = list(parsed.tags.get("keywords") ?? "");
  if (keywords.length < 3) problems.push("give at least 3 @keywords, including the words that a builder types");
  if (parsed.intro === "") problems.push("the doc comment needs an introduction: what the file is for and when not to use it");
  for (const required of REQUIRED_SECTIONS) {
    if (!parsed.sections.some((section) => section.title === required)) problems.push(`the doc comment needs a "## ${required}" section`);
  }
  const slugs = new Set<string>();
  for (const section of parsed.sections) {
    if (slugs.has(section.slug)) problems.push(`duplicate section "## ${section.title}"`);
    slugs.add(section.slug);
  }
  for (const component of exports.components) {
    const bare = new Set((component.props?.variants ?? []).flatMap((variant) => variant.members.filter((member) => member.comment === "").map((member) => member.name)));
    if (bare.size > 0) problems.push(`these props of ${component.name} have no comment: ${[...bare].join(", ")}`);
  }
  return {
    id,
    fileId: fileId(file),
    file,
    summary: parsed.summary,
    layer,
    keywords,
    related: list(parsed.tags.get("related") ?? ""),
    notes: list(parsed.tags.get("notes") ?? ""),
    intro: parsed.intro,
    sections: parsed.sections,
    exports,
    hasComment: true,
    problems,
    source: root,
  };
}

// ------------------------------------------------------------ the kit of an app

export interface DocsManifest {
  readonly files: ReadonlyArray<string>;
  readonly docs: ReadonlyArray<string>;
  // The old path and the new path of each kit file that the kit moved.
  readonly moves: Readonly<Record<string, string>>;
}

export interface KitSource {
  // The folder that holds the kit files: an app root or the skill template.
  readonly root: string;
  readonly isApp: boolean;
  // The kit files that need a doc comment, in the order of kit.json.
  readonly files: ReadonlyArray<string>;
  // The installed kit files that the kit moved, as [old path, new path]. The
  // app has the old layout until `sync --write` moves them, so its docs are
  // not complete.
  readonly moved: ReadonlyArray<readonly [string, string]>;
}

export const LOCK_NAME = "internal-app.kit.json";

// Finds the app from a folder: the nearest folder upward with the kit lock file.
export function findApp(start: string): string | null {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, LOCK_NAME))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function isDocumented(manifest: DocsManifest, file: string): boolean {
  return manifest.docs.some((prefix) => (prefix.endsWith("/") ? file.startsWith(prefix) : file === prefix));
}

export function documentedFiles(manifest: DocsManifest): string[] {
  return manifest.files.filter((file) => isDocumented(manifest, file));
}

function lockFiles(app: string): string[] {
  const value: unknown = JSON.parse(readFileSync(join(app, LOCK_NAME), "utf8"));
  const files = typeof value === "object" && value !== null ? (value as { files?: unknown }).files : undefined;
  if (typeof files !== "object" || files === null) throw new Error(`${join(app, LOCK_NAME)} has no "files" object.`);
  return Object.keys(files);
}

// The documented files of an app are its installed kit files: the files in its
// lock. A file that a newer kit adds is not in the app yet, so its docs do not
// show. The order follows kit.json, so that the catalog is stable.
export function appKitSource(app: string, manifest: DocsManifest): KitSource {
  const order = new Map(manifest.files.map((file, index) => [file, index]));
  const installed = lockFiles(app);
  const files = installed
    .filter((file) => isDocumented(manifest, file))
    .sort((left, right) => (order.get(left) ?? order.size) - (order.get(right) ?? order.size) || left.localeCompare(right));
  const moved = installed.flatMap((file) => (manifest.moves[file] === undefined ? [] : [[file, manifest.moves[file]] as const]));
  return { root: app, isApp: true, files, moved };
}

export function templateKitSource(templateDir: string, manifest: DocsManifest): KitSource {
  return { root: templateDir, isApp: false, files: documentedFiles(manifest), moved: [] };
}

// Tells that the app has kit files at old paths, or returns null.
export function movedKitMessage(source: KitSource): string | null {
  const [first] = source.moved;
  if (first === undefined) return null;
  return `the app has the old kit layout: the kit moved ${source.moved.length} of its files, such as ${first[0]} to ${first[1]}. Run internal-app sync --write to move them and to rewrite the imports of the app.`;
}

export function kitSource(start: string, templateDir: string, manifest: DocsManifest): KitSource {
  const app = findApp(start);
  return app === null ? templateKitSource(templateDir, manifest) : appKitSource(app, manifest);
}

export function readKit(source: KitSource): KitDoc[] {
  return source.files.map((file) => readKitDoc(source.root, file));
}

// Problems that cross files: duplicate ids and related ids that do not exist.
export function kitProblems(docs: ReadonlyArray<KitDoc>): Map<string, string[]> {
  const problems = new Map<string, string[]>(docs.map((doc) => [doc.file, [...doc.problems]]));
  const ids = new Map<string, string>();
  for (const doc of docs) {
    const other = ids.get(doc.id.toLowerCase());
    if (other) problems.get(doc.file)!.push(`the doc id ${doc.id} is also the id of ${other}`);
    ids.set(doc.id.toLowerCase(), doc.file);
  }
  for (const doc of docs) {
    for (const related of doc.related) {
      if ("error" in lookup(docs, related)) problems.get(doc.file)!.push(`@related ${related} is not a kit doc id or export`);
    }
  }
  return problems;
}

// ------------------------------------------------------------ lookup

export interface Lookup {
  readonly doc: KitDoc;
  // The export that the name matched, when it is not the file itself.
  readonly part: string | null;
  readonly section: string | null;
}

export function lookup(docs: ReadonlyArray<KitDoc>, target: string): Lookup | { readonly error: string } {
  const [name = "", section = null] = target.split("#", 2) as [string, string?];
  const wanted = name.toLowerCase();
  const byId = docs.find((doc) => doc.id.toLowerCase() === wanted || doc.fileId.toLowerCase() === wanted);
  if (byId) return { doc: byId, part: null, section };
  for (const doc of docs) {
    const names = exportNames(doc.exports);
    const match = names.find((item) => item.toLowerCase() === wanted);
    if (match) return { doc, part: match, section };
  }
  const near = docs
    .flatMap((doc) => [doc.id, ...exportNames(doc.exports)])
    .map((candidate) => ({ candidate, distance: distance(candidate.toLowerCase(), wanted) }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 3)
    .map((item) => item.candidate);
  return { error: `no kit doc or export is named "${name}". Nearest: ${near.join(", ")}.` };
}

function exportNames(exports: Exports): string[] {
  return [
    ...exports.components.map((item) => item.name),
    ...exports.hooks.map((item) => item.name),
    ...exports.functions.map((item) => item.name),
    ...exports.types,
    ...exports.values,
  ];
}

function distance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const saved = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[right.length]!;
}

// ------------------------------------------------------------ rendering

// Above this length, the docs command prints an outline, and the agent reads
// one section at a time.
export const DOC_WORD_LIMIT = 500;

function memberLine(member: Member): string {
  const name = `\`${member.name}${member.optional ? "?" : ""}\``;
  const parts = [`- ${name}: \`${member.type}\`.`];
  if (member.defaultValue !== undefined) parts.push(`Default \`${member.defaultValue}\`.`);
  if (member.comment !== "") parts.push(member.comment);
  return parts.join(" ");
}

export function renderProps(api: ComponentApi): string {
  const lines = [`### ${api.name}`];
  if (!api.props) {
    lines.push(api.propsType === null ? "No props of its own. See the doc comment." : `Takes \`${api.propsType}\`.`);
    return lines.join("\n");
  }
  if (api.propsType && !api.propsType.startsWith("{")) lines.push(`\`${api.propsType}\``);
  const variants = api.props.variants;
  const external = (items: ReadonlyArray<string>) => (items.length > 0 ? [`Also takes: ${items.map((item) => `\`${item}\``).join(", ")}.`] : []);
  if (variants.length === 1) {
    lines.push(...variants[0]!.members.map(memberLine), ...external(variants[0]!.external));
    return lines.join("\n");
  }
  // A union of props usually repeats most members in each variant. Print the
  // members that all variants share once, so that the docs stay short.
  const same = (left: Member, right: Member) => memberLine(left) === memberLine(right);
  const shared = variants[0]!.members.filter((member) => variants.every((variant) => variant.members.some((other) => same(member, other))));
  const sharedExternal = variants[0]!.external.filter((item) => variants.every((variant) => variant.external.includes(item)));
  if (shared.length > 0 || sharedExternal.length > 0) lines.push("In all variants:", ...shared.map(memberLine), ...external(sharedExternal));
  variants.forEach((variant, index) => {
    lines.push(`Variant ${index + 1} of ${variants.length}:`);
    lines.push(...variant.members.filter((member) => !shared.some((other) => same(member, other))).map(memberLine));
    lines.push(...external(variant.external.filter((item) => !sharedExternal.includes(item))));
  });
  return lines.join("\n");
}

export function renderApi(doc: KitDoc, only: string | null = null): string {
  const lines: string[] = [];
  const components = doc.exports.components.filter((item) => only === null || item.name === only);
  const hooks = doc.exports.hooks.filter((item) => only === null || item.name === only);
  const functions = doc.exports.functions.filter((item) => only === null || item.name === only);
  for (const component of components) lines.push(renderProps(component), "");
  const callableLines = (item: Callable) => [
    `- \`${item.signature}\``,
    ...item.inputs.flatMap((input) => [`  \`${input.name}\`:`, ...input.members.map((member) => `  ${memberLine(member)}`)]),
  ];
  if (hooks.length > 0) lines.push("### Hooks", ...hooks.flatMap(callableLines), "");
  if (functions.length > 0) lines.push("### Functions", ...functions.flatMap(callableLines), "");
  if (only === null) {
    if (doc.exports.types.length > 0) lines.push(`Types: ${doc.exports.types.map((item) => `\`${item}\``).join(", ")}.`);
    if (doc.exports.values.length > 0) lines.push(`Values: ${doc.exports.values.map((item) => `\`${item}\``).join(", ")}.`);
  } else if (doc.exports.types.includes(only) || doc.exports.values.includes(only)) {
    lines.push(`\`${only}\` is a type or a value. Its meaning is in the doc comment of ${doc.id}.`);
  }
  return lines.join("\n").trim();
}

export interface RenderContext {
  // The command that prints one doc, with {id} for the target.
  readonly docsCommand: string;
  // The command that prints one design note, with {id} for the note id.
  readonly noteCommand: string;
  readonly sourceLine: string;
}

function header(doc: KitDoc): string {
  return `${doc.id}  (${doc.layer ?? "no layer"})  ${doc.file}`;
}

function footer(doc: KitDoc, context: RenderContext): string[] {
  const lines: string[] = [];
  if (doc.related.length > 0) lines.push(`Related components: ${doc.related.join(", ")}. Read with: ${context.docsCommand.replace("{id}", "<id>")}`);
  if (doc.notes.length > 0) lines.push(`Design notes: ${doc.notes.join(", ")}. Read with: ${context.noteCommand.replace("{id}", "<id>")}`);
  lines.push(context.sourceLine);
  return lines;
}

function sectionBlock(section: DocSection): string {
  return `## ${section.title}\n${section.text}`;
}

function fullText(doc: KitDoc): string {
  const api = renderApi(doc);
  return [
    header(doc),
    doc.summary,
    doc.intro,
    ...doc.sections.map(sectionBlock),
    api === "" ? "" : `## Props\n${api}`,
  ]
    .filter((part) => part !== "")
    .join("\n\n");
}

function componentParts(doc: KitDoc): string[] {
  return [...doc.exports.components.map((item) => item.name), ...doc.exports.hooks.map((item) => item.name), ...doc.exports.functions.map((item) => item.name)];
}

// The props of all exports together can pass the limit, such as in a file
// with many layout parts. Then the agent prints the props of one export.
function propsTooLong(doc: KitDoc): boolean {
  return countWords(renderApi(doc)) > DOC_WORD_LIMIT && componentParts(doc).length > 1;
}

function outline(doc: KitDoc, context: RenderContext): string {
  const lines = [
    header(doc),
    "",
    doc.summary,
    "",
    doc.intro,
    "",
    `The docs are long, so this is the outline. Print one part with ${context.docsCommand.replace("{id}", `${doc.id}#<part>`)}:`,
  ];
  for (const section of doc.sections) lines.push(`  #${section.slug}  ${section.title} (${countWords(section.text)} words)`);
  const parts = componentParts(doc);
  if (propsTooLong(doc)) {
    lines.push(`The props are long too. Print the props of one export with ${context.docsCommand.replace("{id}", "<export>")}:`);
    for (const name of parts) lines.push(`  ${name}  (${countWords(renderApi(doc, name))} words)`);
    return lines.join("\n");
  }
  lines.push(`  #props  the props of every export (${countWords(renderApi(doc))} words)`);
  if (parts.length > 1) lines.push(`Or print one export with its props: ${context.docsCommand.replace("{id}", "<export>")}. Exports: ${parts.join(", ")}.`);
  return lines.join("\n");
}

export function renderDoc(found: Lookup, context: RenderContext): { text: string; error?: string } {
  const { doc, part, section } = found;
  const end = footer(doc, context);
  if (section !== null) {
    if (section === "props") {
      if (propsTooLong(doc)) {
        const parts = componentParts(doc).map((name) => `${name} (${countWords(renderApi(doc, name))} words)`);
        return { text: "", error: `the props of ${doc.id} are too long to print together. Print one export with ${context.docsCommand.replace("{id}", "<export>")}: ${parts.join(", ")}.` };
      }
      return { text: [header(doc), `## Props\n${renderApi(doc)}`, ...end].join("\n\n") };
    }
    const match = doc.sections.find((item) => item.slug === section);
    if (!match) {
      const known = [...doc.sections.map((item) => `#${item.slug}`), "#props"].join(", ");
      return { text: "", error: `${doc.id} has no part #${section}. Parts: ${known}.` };
    }
    return { text: [header(doc), sectionBlock(match), ...end].join("\n\n") };
  }
  if (part !== null) {
    const own = doc.sections.find((item) => item.slug === slugify(part));
    const api = renderApi(doc, part);
    const body = [header(doc), doc.summary, own ? sectionBlock(own) : "", api === "" ? "" : `## Props\n${api}`];
    return { text: [...body.filter((item) => item !== ""), ...end].join("\n\n") };
  }
  const text = fullText(doc);
  if (countWords(text) > DOC_WORD_LIMIT) return { text: [outline(doc, context), "", ...end].join("\n") };
  return { text: [text, ...end].join("\n\n") };
}

export function renderCatalog(docs: ReadonlyArray<KitDoc>, sourceLine: string, docsCommand: string): string {
  const lines: string[] = [];
  const width = Math.max(...docs.map((doc) => doc.id.length));
  for (const layer of LAYERS) {
    const group = docs.filter((doc) => doc.layer === layer);
    if (group.length === 0) continue;
    lines.push(`${LAYER_TITLES[layer]} (${group.length}): ${LAYER_MEANINGS[layer]}`);
    for (const doc of group) lines.push(`  ${doc.id.padEnd(width)}  ${doc.summary}`);
    lines.push("");
  }
  const undocumented = docs.filter((doc) => doc.layer === null);
  if (undocumented.length > 0) {
    lines.push(`No layer (${undocumented.length}): these kit files have no valid doc comment. Run internal-app check.`);
    for (const doc of undocumented) lines.push(`  ${doc.id.padEnd(width)}  ${doc.file}`);
    lines.push("");
  }
  lines.push(`Read one: ${docsCommand.replace("{id}", "<id>")}`, sourceLine);
  return lines.join("\n");
}
