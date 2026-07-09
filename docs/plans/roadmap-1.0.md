# Corvath — Road to 1.0

Status snapshot: `v0.1.0`, `productName: "Tarot Reading Recorder"`. Branding decided:
**Eriscorp** (`co.eris.*`, data under `Eriscorp/`).

## A. Branding & identity — DECIDED: Eriscorp ✅ DONE

- [x] `appId: co.eris.corvath` in `electron-builder.yml`.
- [x] `setAppUserModelId('co.eris.corvath')` in `src/main/index.ts`.
- [x] `COMPANY = 'Eriscorp'` (roaming + userData both repointed).
- [x] ⚠️ **Migration**: `migrateLegacyDir()` moves `Themisco/Corvath → Eriscorp/Corvath` on
      first launch (both APPDATA + LOCALAPPDATA), only when the new dir is absent — never
      clobbers current data, no-op thereafter, best-effort on failure. Moves the whole tree
      (json files + `decks/` images + backups) via a single `renameSync`.
- [x] `productName` → "Corvath Tarot"; window title + in-app title + splash subtitle updated.
- [x] Bumped version to `1.0.0`.
- [x] README refreshed (React 19 / MUI v9, `Eriscorp/Corvath` paths, migration note).
- [ ] Follow-up: verify the migration on a real machine that has pre-1.0 `Themisco/Corvath`
      data (dev runs use dev userData, so this path isn't exercised by `npm run dev`).

## B. App icon

- [~] Master PNG — provisional art in `resources/corvath.png` (raven + septagram, 1254×1254).
  "Use until settled"; swap the file when final art is ready (same path, no code change).
- [x] `icon: resources/corvath.png` added to `electron-builder.yml`.
- [x] Wired into `BrowserWindow` via `import icon from '../../resources/corvath.png?asset'`.
      Typecheck + build green; asset path resolves in dev and packaged.
- [ ] Visually confirm taskbar + nsis installer shortcut render the icon (next `npm run dev`
      / `build:win`).
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
      fan row-fit (draw engine is unit-tested; the tab UI itself isn't automated).
- [ ] Optional: also render mini card art inside the spread board tiles in the reading view
      (they currently show position name + card-name label only).

## D. Deck art

- [ ] Finish Argent Tarot art (Thoth reskin, in progress).
- [ ] Finish Hybrasyl deck art.

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

## Ordering

1. A (branding) — unblocks a clean 1.0 build and avoids a painful data migration later.
2. C (reading engine) — the feature that makes it 1.0 rather than 0.x.
3. B + D — polish/art, parallelizable.
4. E — scope decisions.
