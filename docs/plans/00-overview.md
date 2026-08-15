# Corvath — plans overview

Read this before any WP. It is the index, the conventions, the settled decisions, and the
milestone status. Milestones live here and never get a WP number.

## Layout

| Path             | What it is                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| `00-overview.md` | This file. Index, conventions, settled decisions, milestones.              |
| `00a-backlog.md` | The deferral register: owed-elsewhere, parked-behind-a-trigger, non-goals. |
| `NN-slug.md`     | One work package. Titled `# WPn — Title`, zero-padded to two digits.       |
| `complete/`      | Shipped WP docs, kept as a record.                                         |

## Conventions

- **One WP = one branch = one PR.** If two items would sensibly share a branch they are one
  WP; if a WP needs several PRs it is several WPs.
- Gate every commit on `npm run typecheck && npm run lint:check && npm run format:check &&
npm run test`. `npm run e2e` before anything touching boot, settings or themes.
- Consult the document repo's `docs/architecture/` before guessing at house standards —
  `electron-app-skeleton.md` is the spec, `ecosystem-rollout-checklist.md` tracks what each
  repo has accepted.

## Work packages

| WP                             | Title             | Status                                      |
| ------------------------------ | ----------------- | ------------------------------------------- |
| [WP1](01-hybrasyl-deck-art.md) | Hybrasyl deck art | **Open — the only thing blocking `v1.0.0`** |

Shipped: [review-remediation](complete/review-remediation.md) (the 2026-07-09 full-review
plan, Phases 0-7 — tooling baseline, theme parity, zustand state layer, boot UX, main-process
hardening, image cache-busting, dependency upgrades, cleanups).

## Settled decisions

Do not relitigate these without a reason; each was decided deliberately.

| Decision          | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branding / vendor | **Erisco**. `appId: co.eris.corvath`, all data under `%LOCALAPPDATA%/Erisco/Corvath` (local, never roaming).                                                                                                                                                                                                                                                                                                                             |
| Draw modes        | **Both** — deal-from-top and fan-and-pick — over layout-or-free-N-card. Seeded RNG (`mulberry32`); the seed is stored so a draw is reproducible.                                                                                                                                                                                                                                                                                         |
| Auto-update       | **Notification only.** `updateCheck.ts` polls the GitHub releases API and raises a Snackbar. No electron-updater, no auto-download.                                                                                                                                                                                                                                                                                                      |
| Reading export    | **JSON, round-trippable** — exports to exactly the shape `parseReadingsImport` accepts.                                                                                                                                                                                                                                                                                                                                                  |
| Custom decks      | Portable `.corvathdeck` zip (deck.json + `images/`) via `fflate`.                                                                                                                                                                                                                                                                                                                                                                        |
| Build targets     | Windows ships **both nsis and portable**, matching taliesin, creidhne and epona. The installer is assisted and **per-user** (`perMachine: false`), which is expensive to reverse once released. macOS dmg and Linux AppImage/deb build in CI; both are **unsigned** until certificates exist.                                                                                                                                            |
| App icon          | **Two unrelated pieces of art, not interchangeable.** Windows uses the raven + heptagram "argent" tile (`build/icon.png`), corvath's own. macOS **and Linux** use the document repo's `Corvath_fixed.png` (a Hyb-house variant) — via `build/icon-mac.png` (squircle + Apple's inset) and `build/icons/` (full-bleed, nothing cropped). Generating the Linux set from the Windows master passes every check and ships the wrong picture. |

## Milestone — v1.0.0

Everything is in place except the Hybrasyl deck art. `package.json` is at `1.0.0`.

**To cut the release once WP1 lands:** promote `## [Unreleased]` in `CHANGELOG.md` to
`## [1.0.0] - <date>`, then tag `v1.0.0` and push. `.github/workflows/release.yml` validates,
builds Windows/macOS/Linux, extracts the notes from the CHANGELOG and publishes. That first
release is also what makes `updateCheck.ts` resolve — today it 404s silently, because no
release exists yet.

Done for 1.0: branding and identity; the in-app reading engine (both draw modes, seeded and
reproducible, card art in recorded readings, the `CardPreview` lightbox, spread-board tiles);
card meanings and keywords for all four decks; custom deck export/import; notification-only
auto-update; first-run empty states; reading export; and the release plumbing (CHANGELOG
pipeline, CI gate, Playwright e2e, coverage floors).

House-standard compliance (2026-08-01): the rollout items R-001 through R-007 are all
accepted — dependency hygiene, the `files` allowlist, right-sized logo assets, renderer
boundary hardening plus Electron fuses, current Actions pins, artifact retention and the
portable extraction splash, and this docs layout.

### Open follow-ups, not blocking

- ~~**Draw-tab UI is not automated.**~~ **Fixed 2026-08-15 (HTOO-233).** `e2e/draw.spec.js`
  covers both modes, the fan row-fit measurement, the pinned-slot path and the save handoff
  onto disk. The same pass fixed two harness faults: `launchApp` was launching
  `out/main/index.js` rather than the project directory (so `app.getVersion()` reported
  Electron's own version), and it could seed only `settings.json`, which left `planFan`'s
  pinned-slot branch unreachable because no built-in layout sets a position `source`.
- ~~**Seed overwrites user edits.**~~ **Fixed 2026-08-14 (HTOO-231).** `mergeSeedDeck` now
  decides each field by provenance: a per-field fingerprint records what corvath itself
  shipped, so a `seedVersion` bump replaces only text that still matches what we wrote.
  Anything the user changed — and anything unstamped — is theirs. The same pass stopped the
  merge discarding imported card art, card backs, renames, and cards added to a built-in
  deck. **This unblocks WP1:** bumping `hybrasyl` from `seedVersion` 3 to 4 is now safe even
  if meanings change in the same release.
