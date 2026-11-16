# ADR 0008: Kit Layer Folders

## Status

Accepted. Extends ADR 0005 and ADR 0007. ADR 0010 moves the kit files to
`skills/design/assets/kit/` and the commands to the `design` CLI.

## Context

ADR 0007 gave each kit file a layer in its doc comment, but the folders did
not show the layers. `src/components/ui/` held 68 files of all layers, the
helpers were in `ui/` and in `lib/`, and the charts had a folder of their
own. The catalog also had a domain component, `WorkQueue`, next to the app
code, so it was not clear if `src/components/` was the catalog of the design
system or of the app.

## Decision

### The folder is the layer

Each documented kit file is in the folder of its `@layer`:

| Folder | Layer |
| --- | --- |
| `src/components/primitives/` | `primitive` |
| `src/components/patterns/` | `pattern` |
| `src/components/shell/` | `shell` |
| `src/components/helpers/` | `helper` |

`LAYER_FOLDERS` in `scripts/lib/kit-docs.ts` holds this map.
`internal-app check` fails with a `kit-docs` finding when the `@layer` of a
file does not agree with its folder. There are no exceptions.

- The charts have no folder. `Sparkline` is a primitive, `TrendChart` is a
  pattern, and `chartHost` is a helper. An agent finds a topic with
  `design search`, not with a folder.
- `src/components/` holds only kit files. The components of an app are in
  `src/features/<name>/ui/`. Thus `src/components/` is the catalog of the
  design system, and `WorkQueue` is a kit pattern, not app code.

### Modules that stay in `src/lib/`

- The kit modules without a doc comment stay in `src/lib/` and
  `src/server/`: `rac.ts`, `router-defaults.tsx`, `server-result.ts`,
  `theme.ts`, `wire-errors.ts`, and `server-fn.server.ts`. They are
  infrastructure that a page does not import for its UI.
- The app contract modules stay in `src/lib/` and `src/styles/`:
  `brand.ts`, `locale.ts`, `error-presentation.ts`, and `brand.stylex.ts`.
  The app owns them, and the kit imports only the exports that `appContract`
  in `assets/kit.json` lists. A file has one owner, so these files are not
  split into a kit part and an app part.

### `sync` moves the kit files of an app

`moves` in `assets/kit.json` maps each old path of a kit file to its new
path. `internal-app sync` reads it:

- A move applies only when the lock of the app records the old path. An app
  file at an old path that the lock does not record is app code, and it stays.
- The status is `move`, or `move-modified` when the app edited the old file
  or has a different file at the new path. `move-modified` needs `--force`.
- `sync` rewrites each quoted import specifier in the app code that resolves
  to a moved module. It reads the `paths` of `tsconfig.json` for the aliases,
  and it keeps the form of each specifier. It prints each rewrite with the
  file and the line.
- After the rewrites, `sync` searches the app code for old kit paths that
  remain outside comments, such as a template literal or an
  `import.meta.glob` pattern. Each one is an `unsafe` line.
- A move is all or nothing. When there is an `unsafe` line, or a status that
  needs `--force` and the command does not have it, `sync --write` writes no
  file. An app is thus never half moved.
- Until the move is done, `check` reports a `kit-layout` finding,
  `components` and `docs` fail, and `design-entries` reports a problem.

`sync` does not format the rewritten files. The app runs `bun run format`
after the move. The entries of `moves` stay, because an app can be several
kit versions behind.

## Consequences

- The import specifier of a kit file shows its layer, for example
  `@/components/patterns/kanban`.
- No old path, re-export file, or alias remains. An app with the old layout
  moves its kit files with `sync --write` when it updates the kit.
