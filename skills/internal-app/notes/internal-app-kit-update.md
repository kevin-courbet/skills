---
id: internal-app-kit-update
topic: internal-app
summary: Update the kit files of an app to the kit of this skill with sync, with the meaning of each sync status, the use of --force, and the checks after the update.
keywords: [update the kit, kit update, sync, sync --write, force replace, internal-app.kit.json, kit lock, kit file, edit a kit file, modified, conflict, removed-modified, older kit, outdated kit, kit version, contract rows]
related: [internal-app-project-layout, internal-app-adding-a-primitive, internal-app-upgrade, internal-app-review]
---

# Update The Kit Of An Internal App

This skill owns the kit files that `assets/kit.json` lists. `sync` copies them into an app and records the hash of each file in `internal-app.kit.json`. An app can have an older kit than this skill. Update the app when the skill changes a kit file. For an app that does not use the kit yet, run `design read internal-app-upgrade`.

## Edits To Kit Files

Never edit a kit file in an app. `sync` reports the edit as `modified`, and `doctor` fails. Change the kit in this skill ([[internal-app-adding-a-primitive]]), then run `sync --write` in each app. A change that only one app needs goes in an app file.

## Sync Statuses

`sync` without `--write` changes nothing. It gives one of these statuses to each kit file:

| Status | Meaning | `sync --write` |
|---|---|---|
| `current` | The file agrees with the skill. | Does nothing. |
| `add` | The file is missing in the app. | Copies it. |
| `update` | The skill changed the file, and the app did not. | Replaces it. |
| `modified` | The app edited the file. | Replaces it only with `--force`. |
| `conflict` | The file is different from the skill, and the lock has no record of a previous sync. | Replaces it only with `--force`. |
| `remove` | The file is not part of the kit now, and the app did not change it. | Deletes it. |
| `removed-modified` | The file is not part of the kit now, and the app edited it. | Deletes it only with `--force`. |

## Steps

1. On a branch, run `sync` in the app root. Read each status that is not `current`.
2. For each `modified`, `conflict`, and `removed-modified` file, read the difference. Move each change that the app needs into the skill or into an app file. Use `--force` only after that move.
3. Run `sync --write`. Add `--force` if step 2 approved the replacement of files.
4. Commit the kit files and `internal-app.kit.json` together.
5. Run `doctor`. A `contract` row fails when a new kit file imports an export that an app module does not have. [[internal-app-project-layout#app-modules-that-the-kit-imports]] lists the exports.
6. Run `bun run build`, `bun run tsc`, `bun run lint`, and `check`. Capture `/design-kit` and the pages that use the changed components in the two themes. Then do the gates of [[internal-app-review]].
