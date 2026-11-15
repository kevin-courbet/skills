import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SKILL_WORD_LIMIT } from "../../design/scripts/lib/graph.ts";
import { countWords } from "../../design/scripts/lib/text.ts";

const SKILL_FILE = join(resolve(import.meta.dir, ".."), "SKILL.md");

// The agent reads SKILL.md in full before each task, so it keeps the limit of
// the hub SKILL.md and points to notes for the rest.
test("SKILL.md stays under the word limit of a SKILL.md in the design graph", () => {
  const body = readFileSync(SKILL_FILE, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
  expect(countWords(body)).toBeLessThanOrEqual(SKILL_WORD_LIMIT);
});
