import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";

const HUB = resolve(import.meta.dir, "../../design");
const DESIGN = join(HUB, "scripts/design");
const MANIFEST = JSON.parse(readFileSync(join(HUB, "assets/kit.json"), "utf8")) as {
  files: ReadonlyArray<string>;
  moves: Readonly<Record<string, string>>;
};
const LOCK = "internal-app.kit.json";

interface SyncReport {
  ok: boolean;
  written: boolean;
  applied: ReadonlyArray<{ path: string; from?: string; status: string }>;
  pending: ReadonlyArray<{ path: string; from?: string; status: string }>;
  rewrites: ReadonlyArray<{ file: string; line: number; from: string; to: string }>;
  unsafe: ReadonlyArray<{ file: string; line: number; text: string }>;
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sync(app: string, ...flags: ReadonlyArray<string>): { code: number | null; report: SyncReport } {
  const result = spawnSync(process.execPath, [DESIGN, "sync", app, "--json", ...flags], { encoding: "utf8" });
  if (result.stderr !== "") throw new Error(result.stderr);
  return { code: result.status, report: JSON.parse(result.stdout) as SyncReport };
}

// Every file of the app with its hash, to show that a refused sync wrote nothing.
function snapshot(app: string): Record<string, string> {
  const out: Record<string, string> = {};
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) visit(path);
      else out[relative(app, path)] = sha256(path);
    }
  };
  visit(app);
  return out;
}

function write(app: string, file: string, text: string) {
  mkdirSync(dirname(join(app, file)), { recursive: true });
  writeFileSync(join(app, file), text);
}

// A kit file that moved twice has two old paths, and an app has one of them.
// The old layout puts each kit file at the first old path in kit.json.
const OLD_PATHS: ReadonlyMap<string, string> = new Map(
  Object.entries(MANIFEST.moves)
    .reverse()
    .map(([from, to]) => [to, from]),
);

function readLock(app: string): { kit: string; files: Record<string, string> } {
  return JSON.parse(readFileSync(join(app, LOCK), "utf8")) as { kit: string; files: Record<string, string> };
}

// Moves a kit file of the app from one path to another and records the new path in the lock.
function moveKitFile(app: string, lock: { files: Record<string, string> }, from: string, to: string) {
  mkdirSync(dirname(join(app, to)), { recursive: true });
  renameSync(join(app, from), join(app, to));
  delete lock.files[from];
  lock.files[to] = sha256(join(app, to));
}

// A new app with the kit files at their old paths and a lock that records
// them there, as an app that synced an older kit has.
function oldLayoutApp(): string {
  const app = join(mkdtempSync(join(tmpdir(), "internal-app-sync-")), "app");
  const created = spawnSync(process.execPath, [DESIGN, "new", app, "--app", "internal-app"], { encoding: "utf8" });
  if (created.status !== 0) throw new Error(created.stderr);
  const lock = readLock(app);
  for (const [to, from] of OLD_PATHS) moveKitFile(app, lock, to, from);
  writeFileSync(join(app, LOCK), `${JSON.stringify(lock, null, 2)}\n`);
  write(
    app,
    "src/features/reports/ui/report-status.tsx",
    [
      'import { Badge } from "@/components/ui/badge";',
      'import { Button } from "../../../components/ui/button.tsx";',
      'import { withViewTransition } from "../../../lib/motion";',
      "// The old kit had src/components/ui/badge.tsx.",
      "export const load = () => import('@/components/ui/toaster');",
      'export { formErrors } from "@/lib/form";',
      "",
    ].join("\n"),
  );
  return app;
}

describe("kit.json moves", () => {
  test("each move starts at a path that is not a kit file and ends at a kit file", () => {
    const files = new Set(MANIFEST.files);
    for (const [from, to] of Object.entries(MANIFEST.moves)) {
      expect(files.has(from)).toBe(false);
      expect(files.has(to)).toBe(true);
    }
  });
});

describe("sync of an app with the old kit layout", () => {
  test("without --write, it lists the moves and the rewrites and changes nothing", () => {
    const app = oldLayoutApp();
    const before = snapshot(app);
    const { code, report } = sync(app);
    expect(code).toBe(1);
    expect(report.written).toBe(false);
    expect(report.pending).toContainEqual(expect.objectContaining({ status: "move", path: "src/components/primitives/badge.tsx", from: "src/components/ui/badge.tsx" }));
    expect(report.rewrites).toContainEqual({ file: "src/features/reports/ui/report-status.tsx", line: 1, from: "@/components/ui/badge", to: "@/components/primitives/badge" });
    expect(snapshot(app)).toEqual(before);
  });

  test("with --write, it moves the files, rewrites the imports, and updates the lock", () => {
    const app = oldLayoutApp();
    const { code, report } = sync(app, "--write");
    expect(code).toBe(0);
    expect(report.written).toBe(true);
    expect(report.unsafe).toEqual([]);
    expect(readFileSync(join(app, "src/features/reports/ui/report-status.tsx"), "utf8")).toBe(
      [
        'import { Badge } from "@/components/primitives/badge";',
        'import { Button } from "../../../components/primitives/button.tsx";',
        'import { withViewTransition } from "../../../components/helpers/motion";',
        "// The old kit had src/components/ui/badge.tsx.",
        "export const load = () => import('@/components/primitives/toaster');",
        'export { formErrors } from "@/components/helpers/form";',
        "",
      ].join("\n"),
    );
    for (const [from, to] of Object.entries(MANIFEST.moves)) {
      expect(existsSync(join(app, from))).toBe(false);
      expect(existsSync(join(app, to))).toBe(true);
    }
    for (const folder of ["src/components/ui", "src/components/charts", "src/components/kit"]) expect(existsSync(join(app, folder))).toBe(false);
    const lock = JSON.parse(readFileSync(join(app, LOCK), "utf8")) as { files: Record<string, string> };
    expect(Object.keys(lock.files).sort()).toEqual([...MANIFEST.files].sort());
    expect(sync(app).report.pending).toEqual([]);
  });

  test("a kit file that moved twice moves from each of its old paths", () => {
    const twice = [...new Set(Object.values(MANIFEST.moves))].filter(
      (to) => Object.values(MANIFEST.moves).filter((target) => target === to).length > 1,
    );
    expect(twice.length).toBeGreaterThan(0);
    for (const to of twice) {
      const firstPath = OLD_PATHS.get(to)!;
      for (const [from] of Object.entries(MANIFEST.moves).filter(([, target]) => target === to)) {
        if (from === firstPath) continue;
        const app = oldLayoutApp();
        const lock = readLock(app);
        moveKitFile(app, lock, firstPath, from);
        writeFileSync(join(app, LOCK), `${JSON.stringify(lock, null, 2)}\n`);
        const { code, report } = sync(app, "--write");
        expect(code).toBe(0);
        expect(report.applied).toContainEqual(expect.objectContaining({ status: "move", path: to, from }));
        expect(existsSync(join(app, from))).toBe(false);
        expect(existsSync(join(app, to))).toBe(true);
      }
    }
  });

  test("it fails when the lock records two old paths of one kit file", () => {
    const app = oldLayoutApp();
    const lock = readLock(app);
    const [to, firstPath] = [...OLD_PATHS].find(([target]) => Object.values(MANIFEST.moves).filter((value) => value === target).length > 1)!;
    const other = Object.entries(MANIFEST.moves).find(([from, target]) => target === to && from !== firstPath)![0];
    lock.files[other] = lock.files[firstPath]!;
    writeFileSync(join(app, LOCK), `${JSON.stringify(lock, null, 2)}\n`);
    const result = spawnSync(process.execPath, [DESIGN, "sync", app, "--json"], { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`records two old paths of ${to}`);
  });

  test("it fails on an import that it cannot rewrite, with the file and the line, and writes nothing", () => {
    const app = oldLayoutApp();
    write(app, "src/features/reports/load.ts", ["export const load = (name: string) =>", "  import(`@/components/ui/${name}`);", ""].join("\n"));
    const before = snapshot(app);
    const { code, report } = sync(app, "--write");
    expect(code).toBe(1);
    expect(report.written).toBe(false);
    expect(report.unsafe).toEqual([{ file: "src/features/reports/load.ts", line: 2, text: "import(`@/components/ui/${name}`);" }]);
    expect(snapshot(app)).toEqual(before);
  });

  test("an edited old file needs --force, and without it sync writes nothing", () => {
    const app = oldLayoutApp();
    const old = join(app, "src/components/ui/badge.tsx");
    writeFileSync(old, `${readFileSync(old, "utf8")}\n// A local edit.\n`);
    const before = snapshot(app);
    const refused = sync(app, "--write");
    expect(refused.code).toBe(1);
    expect(refused.report.pending).toContainEqual(expect.objectContaining({ status: "move-modified", from: "src/components/ui/badge.tsx" }));
    expect(snapshot(app)).toEqual(before);
    const forced = sync(app, "--write", "--force");
    expect(forced.code).toBe(0);
    expect(existsSync(old)).toBe(false);
  });

  test("it reads the aliases of a tsconfig with comments and trailing commas", () => {
    const app = oldLayoutApp();
    const tsconfig = join(app, "tsconfig.json");
    const text = readFileSync(tsconfig, "utf8").replace('"paths": { "@/*": ["./src/*"] }', '// The aliases of the app.\n    "paths": { "@/*": ["./src/*"], "~/*": ["./src/*",], /* A second alias. */ },');
    writeFileSync(tsconfig, text);
    write(app, "src/features/reports/tilde.ts", 'export { Badge } from "~/components/ui/badge";\n');
    const { code, report } = sync(app, "--write");
    expect(code).toBe(0);
    expect(report.rewrites).toContainEqual({ file: "src/features/reports/tilde.ts", line: 1, from: "~/components/ui/badge", to: "~/components/primitives/badge" });
  });

  test("check reports the old layout as a kit-layout finding, and components fails", () => {
    const app = oldLayoutApp();
    const checked = spawnSync(process.execPath, [DESIGN, "check", "--json"], { cwd: app, encoding: "utf8" });
    expect(checked.status).toBe(1);
    const findings = (JSON.parse(checked.stdout) as { findings: ReadonlyArray<{ rule: string; file: string }> }).findings;
    expect(findings).toContainEqual(expect.objectContaining({ rule: "kit-layout", file: LOCK }));
    const listed = spawnSync(process.execPath, [DESIGN, "components"], { cwd: app, encoding: "utf8" });
    expect(listed.status).toBe(2);
    expect(listed.stderr).toContain("Run design sync --write");
  });

  test("an app file at an old kit path that the lock does not record stays, and its imports stay", () => {
    const app = oldLayoutApp();
    const lockPath = join(app, LOCK);
    const lock = JSON.parse(readFileSync(lockPath, "utf8")) as { files: Record<string, string> };
    delete lock.files["src/components/ui/badge.tsx"];
    writeFileSync(lockPath, JSON.stringify(lock));
    const { code, report } = sync(app, "--write");
    expect(code).toBe(0);
    expect(existsSync(join(app, "src/components/ui/badge.tsx"))).toBe(true);
    expect(report.rewrites.map((item) => item.from)).not.toContain("@/components/ui/badge");
    expect(readFileSync(join(app, "src/features/reports/ui/report-status.tsx"), "utf8")).toStartWith('import { Badge } from "@/components/ui/badge";');
  });
});
