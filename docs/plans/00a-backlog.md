# Backlog — the deferral register

Everything deliberately not being done now, and why. A register accrues for the life of the
project, so it lives here rather than inside any one WP's branch.

Three kinds of entry: **parked behind a trigger** (do it when X happens), **owed elsewhere**
(belongs to another repo), and **non-goals** (decided against; do not re-propose without a
new reason).

## Parked behind a trigger

| Item                         | Trigger                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Seed-vs-user-edit precedence | Any change to a built-in deck's meanings after 1.0       | `preferSeedString` (`src/main/store.ts`) makes a non-empty seed value win over a user's edit when `seedVersion` bumps. This was harmless while the seeds were empty; now that all four decks ship meanings, the next meanings update silently overwrites text a user wrote. The fix is a per-card merge that only fills fields the user left empty. Nothing is broken until someone edits a shipped deck's text, which is why it is parked rather than a WP. |
| macOS signing + notarization | An Apple Developer account exists                        | `electron-builder.yml` has `mac.notarize: false` and the CI job passes `CSC_LINK` / `APPLE_*` through as optional secrets. Flip `notarize` to true and add the secrets; the job already builds an unsigned dmg today, so nothing else changes.                                                                                                                                                                                                               |
| Windows code signing         | SSL.com eSigner credentials exist                        | The release job's signing step is already guarded: with no `ES_*` secrets it warns and ships an unsigned exe rather than failing. SmartScreen warns on first run until then.                                                                                                                                                                                                                                                                                 |
| nsis installer target        | A reason to ship an installer rather than a portable exe | The `nsis` block in `electron-builder.yml` is written and ready; it just is not in the `win.target` list. Portable was chosen deliberately for 1.0.                                                                                                                                                                                                                                                                                                          |
| Raising the coverage floors  | The zustand stores pick up unit tests                    | The floors in `vitest.config.mjs` are ratcheted just under actual so the suite guards against regression rather than stating an aspiration. The untested bulk is the UI layer, covered by `e2e/` instead.                                                                                                                                                                                                                                                    |
| Draw-tab e2e specs           | The draw UI stops changing shape                         | The engine is unit-tested; the tab's animation/fan-fit behaviour is still eyeballed by hand.                                                                                                                                                                                                                                                                                                                                                                 |

## Owed elsewhere

| Item                      | Where it belongs                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deck art pipeline scripts | Corvath keeps `scripts/build-argent-art.mjs` and `scripts/build-hybrasyl-art.mjs` locally because the source art is not in the repo. If a third deck needs the same treatment, generalise them rather than adding a third copy. |

## Non-goals

| Item                             | Why not                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Game-Icons title bar             | The house skeleton offers it; corvath uses its own branded logo in the title bar instead. Deferred at the 2026-07-09 review and still declined. |
| electron-updater / auto-download | Decided against — notification only. An unsigned personal app auto-replacing its own binary is worse than a link to the release page.           |
| Roaming (`%APPDATA%`) data       | All data is local by design. A tarot journal with bundled art is not something to sync onto a domain profile.                                   |
| A server / sync backend          | Corvath is local-only. Deck export/import is the sharing story.                                                                                 |
