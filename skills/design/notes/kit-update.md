---
id: kit-update
topic: kit
summary: Update the kit files of an app to the kit of this skill with design sync, with the meaning of each sync status, the use of --force, the moves of kit files and the rewrite of their imports, the app files outside the kit, and the checks after the update.
keywords: [update the kit, kit update, sync, design sync, sync --write, force replace, kit lock, internal-app.kit.json, kit file, edit a kit file, modified, conflict, removed-modified, move, move-modified, moved kit files, old kit layout, kit-layout, kit-folder, app component, rewrite imports, import paths, unsafe import, older kit, outdated kit, kit version, contract rows]
related: [kit-adding-a-component, kit-migration-map, kit-check-rules]
---

# Update The Kit Of An App

This skill owns the kit files in `assets/kit/` that `assets/kit.json` lists. `design sync` copies them into an app and records the hash of each file in the kit lock of the app. The lock is `<use case>.kit.json` in the app root, such as `internal-app.kit.json`. It names the use case of the app. An app can have an older kit than this skill. Update the app when the skill changes a kit file. For an app that does not use the kit yet, follow the upgrade steps of its use-case skill.

In a folder without a kit lock, give the use case to `design sync`, `design check`, and `design doctor` with `--app <use case>`.

## Edits To Kit Files

Never edit a kit file in an app. `design sync` reports the edit as `modified`, and `design doctor` fails. Change the kit in this skill ([[kit-adding-a-component]]), then run `design sync --write` in each app. A change that only one app needs goes in an app file.

## App Files

`src/components/` holds only kit files. The folder of each kit file is its layer. An app component goes to `src/features/<name>/ui/` of the feature that uses it, not to `src/components/`.

`design check` fails with the rule `kit-folder` on a file in `src/components/` that is not a kit file. Move the file to the `ui/` folder of its feature, and update its imports.

## Sync Statuses

`design sync` without `--write` changes nothing. It gives one of these statuses to each kit file:

| Status | Meaning | `design sync --write` |
|---|---|---|
| `current` | The file agrees with the skill. | Does nothing. |
| `add` | The file is missing in the app. | Copies it. |
| `update` | The skill changed the file, and the app did not. | Replaces it. |
| `modified` | The app edited the file. | Replaces it only with `--force`. |
| `conflict` | The file is different from the skill, and the lock has no record of a previous sync. | Replaces it only with `--force`. |
| `remove` | The file is not part of the kit now, and the app did not change it. | Deletes it. |
| `removed-modified` | The file is not part of the kit now, and the app edited it. | Deletes it only with `--force`. |
| `move` | The kit moved the file to a new path, and the app did not change it. | Deletes the old file, writes the new file, and rewrites the imports. |
| `move-modified` | The kit moved the file, and the app edited the old file or has a different file at the new path. | Moves it only with `--force`. |

## Moved Kit Files

`moves` in `assets/kit.json` maps each old path of a kit file to its new path. `design sync` moves a file only when the lock records the old path. An app file at an old path that the lock does not record stays in place.

When the kit moves files, `design sync` also reads the source files of the app. It rewrites each quoted import specifier that points to a moved file: `import`, `export … from`, and `import()`. A rewrite keeps the form of the specifier, such as `@/` or `../`, and its extension. `design sync` prints one `rewrite` line for each change, with the file and the line.

A move is all or nothing. `design sync --write` writes nothing when one of these is true:

- A line names an old kit path that `design sync` cannot rewrite, such as a template literal in `import()` or a pattern in `import.meta.glob`. `design sync` prints an `unsafe` line with the file and the line. Change the line by hand, so that it names the new path, then run `design sync --write` again.
- A status needs `--force`, and the command does not have it.

Until the move is done, `design check` reports a `kit-layout` finding, and `design components` and `design docs` fail.

## Steps

1. On a branch, run `design sync` in the app root. Read each status that is not `current`.
2. For each `modified`, `conflict`, `removed-modified`, and `move-modified` file, read the difference. Move each change that the app needs into the skill or into an app file. Use `--force` only after that move. Change each `unsafe` line by hand.
3. Run `design sync --write`. Add `--force` if step 2 approved the replacement of files.
4. If `design sync` moved files, run `bun run format`, because a rewritten import line can be longer than the line width.
5. Commit the kit files, the rewritten app files, and the kit lock together.
6. Run `design doctor`. A `contract` row fails when a new kit file imports an export that an app module does not have. `appContract` in `assets/kit.json` lists the app modules that kit files import, with their exports.
7. Run `bun run build`, `bun run tsc`, `bun run lint`, and `design check`. A build error that names a missing kit file means that an app file imports a file that the kit removed. Remove that import, or delete the app file when it only showed the removed file, such as an old `/design-kit` route and its navigation item. Capture the pages that use the changed components in the two themes. Then do the review that the use-case skill of the app gives.
