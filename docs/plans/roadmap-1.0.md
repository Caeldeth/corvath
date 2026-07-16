# Corvath — Road to 1.0

Status snapshot: `package.json` is at `1.0.0` with `productName: "Corvath Tarot"`; branding is
**Erisco** (`co.eris.*`, data under `Erisco/`). Code, tooling, and release plumbing are all in
place — **the only thing holding the `v1.0.0` tag is the Hybrasyl deck art** (section D).

To cut the release once the art lands: promote `## [Unreleased]` in `CHANGELOG.md` to
`## [1.0.0] - <date>`, then tag `v1.0.0` and push. `.github/workflows/release.yml` validates,
builds the portable exe, extracts the notes, and publishes. That first release is also what makes
`updateCheck.ts` resolve — it 404s silently today, because no release exists yet.

## A. Branding & identity — DECIDED: Erisco ✅ DONE

- [x] `appId: co.eris.corvath` in `electron-builder.yml`.
- [x] `setAppUserModelId('co.eris.corvath')` in `src/main/index.ts`.
- [x] `COMPANY = 'Erisco'` — all data (readings/decks/settings + Electron cache) under a
      single `%LOCALAPPDATA%/Erisco/Corvath`; nothing in roaming (`%APPDATA%`).
- [x] `productName` → "Corvath Tarot"; window title + in-app title + splash subtitle updated.
- [x] Bumped version to `1.0.0`.
- [x] README refreshed (React 19 / MUI v9, `Erisco/Corvath` local paths).

## B. App icon

- [x] Art lives at `resources/corvath.png` (raven + septagram, 1254×1254). Swapping the file
      later needs no code change.
- [x] `icon: resources/corvath.png` added to `electron-builder.yml`.
- [x] Wired into `BrowserWindow` via `import icon from '../../resources/corvath.png?asset'`.
      Typecheck + build green; asset path resolves in dev and packaged.
- [x] Master PNG — DECIDED: the provisional raven + septagram art **is** the icon for 1.0.
- [ ] Visually confirm the taskbar icon renders (next `npm run dev` / `build:win`). The nsis
      installer-shortcut half of this is moot: 1.0 ships portable-only (see E).
- [x] Replaced the in-app title-bar book glyph (`AutoStoriesIcon`) with the corvath image.
- [x] Splash window now shows the corvath logo (replaced the inline SVG star motif).

## C. In-app reading engine (headline 1.0 feature) ✅ DONE

Decided: **both draw modes**, and **layout-or-free-N-card**.

- [x] "Draw a Reading" button on the Readings page → `DrawDialog` → creates a `Reading` with
      `source: 'corvath'`.
- [x] Seeded RNG (`mulberry32`) in `lib/draw.ts`; the `seed` is stored on the reading so a draw
      is reproducible. `Reading` gained `seed` + `drawMode` (added to the zod schema too, since
      it strips unknown keys).
- [x] Draw mode 1: **deal from top** — `dealForLayout` honors each position's `source: top|bottom`;
      auto-reveals slot by slot with a flip animation.
- [x] Draw mode 2: **fan & pick** — shuffled deck fanned face-down; click one card per slot.
- [x] Reversal rolled only when `deck.supportsReversed`; orientation fixed by (seed, position).
- [x] No duplicate draws — deal pulls from distinct top/bottom ends; fan marks picked cards spent.
- [x] Card-flip (`DrawCard`, CSS 3D flip) with deck art faces / card-back (deck `back` or CSS
      fallback); layout positions populated and shown on the board in the editor.
- [x] Setup supports a saved spread OR a free "just draw N cards" (numbered slots, no board).
- [x] 13 unit tests for the draw engine (determinism, permutation, top/bottom, reversal, assemble).
- [x] UX iteration: promoted the draw from a modal to a **dedicated top-level "Draw" tab**
      (Readings | Draw | Decks | Layouts) using the full area below the nav bar; enlarged the
      cards; the fan now wraps into 1–3 overlapping rows sized to the board width (no h-scroll).
      Selection lifted to `App` so a finished draw hands off to the Readings tab pre-selected.
- [x] Art in recorded readings: each entry shows a face-up card thumbnail (reversed rotated).
- [x] Click any face-up card (draw tray or a recorded reading) → `CardPreview` lightbox with
      large art, name, orientation, keywords, and the deck meaning.
- [x] Card art uses `objectFit: contain` (was `cover`) so no scan is clipped — e.g. RWS, which
      is narrower than the 5:8 card box. Face has a paper background for clean letterboxing.
- [ ] Follow-up: click-through the two modes in `npm run dev` to eyeball animations/art & the
      fan row-fit. The draw engine is unit-tested and the boot/settings/theme paths now have
      Playwright specs (`e2e/`), but the Draw tab UI itself still isn't automated.
- [x] Mini card art now renders inside the spread board tiles in the reading view, with the
      slot + card name on hover. Tiles are 2x their old size; note that tile size and board
      height are coupled (see the comment in `LayoutBoard.tsx` and its invariant test).
      Each entry in the card list below the board also names its slot and shows the slot's
      meaning.

## D. Deck art — **the only thing blocking the tag**

- [x] Argent Tarot art — done. All 79 files (78 cards + back) are bundled under
      `bundled/decks/argent/`; re-run `node scripts/build-argent-art.mjs` to rebuild from the
      PNG originals.
- [ ] **Hybrasyl deck art.** The deck's _structure_ now ships (35 pantheon majors over four
      short suits, 83 cards — `src/main/seedDecks.ts`), and every card has a meaning, but no art
      is drawn yet, so cards fall back to the name placeholder.
      To land it: drop the PNGs in `F:\Downloads\Tarot Images\Hybrasyl Tarot` (or set
      `HYBRASYL_SRC`), run `node scripts/build-hybrasyl-art.mjs`, then add
      `imageExt: 'webp'` + `back: 'back.webp'` to the `hybrasyl` spec and bump its `seedVersion`.
      Those two fields are deliberately unset until the art exists — with them, every card
      claims an image file that isn't there.

## D2. Card meanings ✅ DONE

- [x] All four shipped decks carry a meaning + keywords for every card, seeded via
      `src/main/seedMeanings/` and folded on by `buildMajors`/`buildMinors`. Each deck is
      written in its own register (RWS traditional, Argent in the Thoth decan idiom, Empyrean
      per its art direction, Hybrasyl from the pantheon). RWS also has reversed meanings; the
      other three are upright-only decks.
- Note for later: `preferSeedString` (`store.ts`) makes a **non-empty seed value win over a
  user's edit** on a `seedVersion` bump. Now that the decks ship text, any future meanings
  update will overwrite edits a user made to a built-in card. That was harmless while the seeds
  were empty; it isn't now. Worth revisiting if built-in meanings are ever changed post-1.0.

## E. Nice-to-haves / decide in/out for 1.0

- [x] **Custom deck export/import** — portable `.corvathdeck` zip (deck.json + `images/`), via
      `fflate`. Export reads user art (bundled fallback) and writes a native save dialog; import
      validates with the deck schema, mints a new id + unique name (`uniqueDeckName`), writes the
      images, and adds the deck. Pure `deckPackage.ts` (pack/unpack) + `store.readDeckImages`/
      `writeDeckImages` (path-safe via `resolveWithin`), `dialog` injected into handlers to keep
      them test-friendly. UI: Import button + per-deck Export icon + result snackbar. 11 new tests.
- [x] **Build targets** — DECIDED: **Windows portable only** for 1.0. `electron-builder.yml`
      win target switched `nsis` → `portable` (`${name}-${version}-portable.${ext}`); the nsis
      block is left in place, commented, so nsis/mac/linux can be re-enabled later by adding
      target entries. Signing/notarization skipped (personal app).
- [x] **Auto-update** — DECIDED: **notification only** (no electron-updater/auto-download).
      `src/main/updateCheck.ts` queries the GitHub `releases/latest` API on launch, compares the
      tag to `app.getVersion()` (pure `isNewerVersion`, unit-tested), and — for a newer stable
      release — sends `update:available` to the renderer after `did-finish-load`. Best-effort:
      offline/rate-limit/no-releases all no-op. `App.tsx` shows an info Snackbar with a "View"
      button that opens the release page. Preload adds `onUpdateAvailable(cb)`.
- [x] **First-run onboarding / empty states** — light polish on the Readings hook: empty
      reading list shows a "Draw a Reading" CTA; the empty right pane shows a "Welcome to
      Corvath" state (Draw CTA) when there are zero readings, else the select prompt.
- [x] **Export a reading** — DECIDED: **JSON, round-trippable**. `lib/exportReadings.ts` maps a
      `Reading` back to the exact shape `parseReadingsImport` accepts (drops ids/timestamps/
      seed/drawMode/positionId; layout by name; entries map to positions by order). Per-reading
      Export icon + "Export all" button in `ReadingList`; `readings:export` handler shows a save
      dialog and writes the JSON (main only picks the path + writes — mapping/validation live in
      the renderer). Result Snackbar. Round-trip unit-tested (export → import equivalence).

## F. Release plumbing ✅ DONE

The house architecture doc listed corvath as having no CI, no CHANGELOG pipeline, and no e2e.
All three are in now:

- [x] **CHANGELOG flow** — `CHANGELOG.md` (Keep a Changelog, oghma's model) +
      `scripts/changelog-extract.mjs`, copied verbatim from the template and unit-tested.
- [x] **`.github/workflows/release.yml`** — `validate` (typecheck / lint / format / coverage) on
      every PR, `build-windows`, and a tag-gated `release`. Trimmed to this app's shape: no
      linux/mac jobs, since `electron-builder.yml` declares no such targets. `workflow_dispatch`
      builds without publishing — use it as a dry run.
      The Windows signing step is **guarded**, unlike every sibling's: with no SSL.com `ES_*`
      secrets it warns and ships an unsigned exe rather than failing the release. SmartScreen
      will warn on first run; accepted.
- [x] **Playwright e2e** (`e2e/`) — the house harness, local-only per the e2e architecture doc
      (CI would need a display). Specs: app boot + seeding, settings persistence across a
      relaunch, and all six themes. Needs the `app-root` / `app-hydrating` / `title-bar` /
      `theme-select` testids to stay put.
- [x] **Coverage floors** in `vitest.config.mjs`, ratcheted just under actual so
      `test:coverage` gates rather than merely reports. The UI layer is deliberately not
      thresholded; raise the floors as the zustand stores pick up tests.

## Ordering

1. A (branding) — unblocks a clean 1.0 build and avoids a painful data migration later. ✅
2. C (reading engine) — the feature that makes it 1.0 rather than 0.x. ✅
3. B + D — polish/art, parallelizable. **D (Hybrasyl art) is what remains.**
4. E — scope decisions. ✅
