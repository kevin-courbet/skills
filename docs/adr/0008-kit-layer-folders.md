# ADR 0008: Kit Layer Folders

## Status

Accepted. Extends ADR 0005 and ADR 0007.

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
- The showcases of the design-kit routes are in `src/components/showcase/`.
  They are kit files without a doc comment.
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

## Consequences

- The import specifier of a kit file shows its layer, for example
  `@/components/patterns/kanban`.
- No old path, re-export file, or alias remains. An app with the old layout
  must move its kit files when it updates the kit.
