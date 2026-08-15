import { test, expect } from '@playwright/test'
import { createHash } from 'crypto'
import { mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { launchApp, getMainWindow, USERDATA_SUBPATH } from './helpers.js'

// HTOO-231, the case nothing else can reach.
//
// The provenance fix is covered by unit tests against synthetic decks, but the
// thing it actually has to survive is a REAL profile written by the app BEFORE
// stamps existed — where `decks.json` carries no `seedFingerprints` at all and
// the only evidence of what was seeded is that the text still matches.
//
// So the fixture is not hand-authored. Launch once to get a genuine first-run
// file, strip every `seedFingerprints` from it, and apply the four kinds of user
// work the old merge used to destroy. That is byte-for-byte what a pre-fix
// install held, because the pre-fix app wrote exactly this minus the stamps.
//
// Three launches:
//   1. fresh    -> a real seeded decks.json
//   2. legacy   -> backfill must stamp only what is provably unedited
//   3. bumped   -> the merge must deliver corrections and keep everything else
//
// Launch 3 fakes the next release by LOWERING the stored seedVersion rather than
// editing the seed, which is equivalent (`seed.seedVersion > stored`) and needs
// no rebuild.

// Must match `fingerprint` in src/main/store.ts. Deliberately reimplemented
// rather than imported: this asserts the on-disk contract, so computing it a
// second way is part of the test.
const fingerprint = (value) =>
  createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value ?? null))
    .digest('base64url')
    .slice(0, 12)

const decksPath = (localAppData) => join(localAppData, ...USERDATA_SUBPATH, 'decks.json')
const readDecks = (localAppData) => JSON.parse(readFileSync(decksPath(localAppData), 'utf8'))
const writeDecks = (localAppData, file) =>
  writeFileSync(decksPath(localAppData), JSON.stringify(file, null, 2))
const deck = (file, id) => file.decks.find((d) => d.id === id)
const card = (d, id) => d.cards.find((c) => c.id === id)

/** Boot the app against `localAppData`, wait until it is really up, close it. */
async function boot(localAppData) {
  const { electronApp } = await launchApp({ localAppData })
  await getMainWindow(electronApp)
  await electronApp.close()
}

test.describe('A profile written before provenance existed', () => {
  test('is migrated without losing a single thing the user authored', async () => {
    const localAppData = mkdtempSync(join(tmpdir(), 'hyb-e2e-legacy-'))

    // ---- 1. a genuine first-run profile -------------------------------------
    await boot(localAppData)
    const fresh = readDecks(localAppData)
    expect(deck(fresh, 'rws').cards.length).toBe(78)
    // First install stamps on the way in, so there is something to strip.
    expect(card(deck(fresh, 'rws'), 'maj-0').seedFingerprints).toBeTruthy()

    // ---- 2. rewind it to what a pre-fix install held ------------------------
    const legacy = structuredClone(fresh)
    for (const d of legacy.decks) {
      delete d.seedFingerprints
      for (const c of d.cards) delete c.seedFingerprints
    }

    const rws = deck(legacy, 'rws')
    const untouchedMeaning = card(rws, 'maj-0').meaning // still exactly as shipped
    rws.name = 'Rider-Waite-Smith (my copy)' // a deck rename
    card(rws, 'maj-1').meaning = 'MY OWN WORDS about the Magician' // an edit
    card(rws, 'maj-2').image = 'maj-2.png' // imported art
    card(rws, 'maj-2').imageVersion = 3
    rws.cards.push({ id: 'user-extra-1', section: 'major', name: 'My Own Card', meaning: 'mine' })
    writeDecks(localAppData, legacy)

    // ---- 3. boot: the backfill runs before any version gate -----------------
    await boot(localAppData)
    const filled = readDecks(localAppData)
    const rwsFilled = deck(filled, 'rws')

    // Provably unedited -> stamped, and so still eligible for corrections.
    expect(card(rwsFilled, 'maj-0').seedFingerprints?.meaning).toBe(fingerprint(untouchedMeaning))
    // Edited -> left unstamped, which is what makes it the user's for good.
    expect(card(rwsFilled, 'maj-1').meaning).toBe('MY OWN WORDS about the Magician')
    expect(card(rwsFilled, 'maj-1').seedFingerprints?.meaning).toBeUndefined()
    // The rename is the user's; the untouched description is still the seed's.
    expect(rwsFilled.name).toBe('Rider-Waite-Smith (my copy)')
    expect(rwsFilled.seedFingerprints?.name).toBeUndefined()
    expect(rwsFilled.seedFingerprints?.description).toBeTruthy()
    // Imported art and a card the user added survive a boot that rewrites the file.
    expect(card(rwsFilled, 'maj-2').image).toBe('maj-2.png')
    expect(card(rwsFilled, 'maj-2').imageVersion).toBe(3)
    expect(card(rwsFilled, 'user-extra-1')).toBeTruthy()
    // A card the seed has never heard of is never seed-owned.
    expect(card(rwsFilled, 'user-extra-1').seedFingerprints).toBeUndefined()

    // ---- 4. stage the next release's bump on argent -------------------------
    const bumped = structuredClone(filled)
    const argent = deck(bumped, 'argent')
    argent.seedVersion = 1 // the shipped seed is 2, so this is a bump
    argent.supportsReversed = true // structure the seed owns and must reclaim

    // Text we shipped and the user never touched -> the correction must land.
    card(argent, 'maj-0').meaning = 'OLD SHIPPED TEXT'
    card(argent, 'maj-0').seedFingerprints = { meaning: fingerprint('OLD SHIPPED TEXT') }
    // Text the user wrote over ours -> kept.
    card(argent, 'maj-1').meaning = 'MY OWN WORDS'
    card(argent, 'maj-1').seedFingerprints = { meaning: fingerprint('SOMETHING WE SHIPPED ONCE') }
    // Unstamped text -> kept, because absent provenance reads as authorship.
    card(argent, 'maj-2').meaning = 'MY UNSTAMPED WORDS'
    delete card(argent, 'maj-2').seedFingerprints
    // Imported art, an imported back, a rename, and an added card.
    card(argent, 'maj-3').image = 'maj-3.png'
    card(argent, 'maj-3').imageVersion = 7
    argent.back = 'mine.png'
    argent.backVersion = 2
    argent.name = 'Argent (mine)'
    delete argent.seedFingerprints
    argent.cards.push({ id: 'user-extra-2', section: 'major', name: 'Also Mine' })
    writeDecks(localAppData, bumped)

    // ---- 5. boot: the merge runs -------------------------------------------
    await boot(localAppData)
    const merged = readDecks(localAppData)
    const argentMerged = deck(merged, 'argent')

    // The whole point: a correction reaches the text we wrote...
    expect(argentMerged.seedVersion).toBe(2)
    expect(card(argentMerged, 'maj-0').meaning).not.toBe('OLD SHIPPED TEXT')
    expect(card(argentMerged, 'maj-0').meaning).toBeTruthy()
    // ...and never the text the user wrote.
    expect(card(argentMerged, 'maj-1').meaning).toBe('MY OWN WORDS')
    expect(card(argentMerged, 'maj-2').meaning).toBe('MY UNSTAMPED WORDS')
    // A field conceded to the user stays unstamped, or the next bump reclaims it.
    expect(card(argentMerged, 'maj-1').seedFingerprints?.meaning).toBeUndefined()
    expect(card(argentMerged, 'maj-2').seedFingerprints?.meaning).toBeUndefined()

    // The three losses that used to ride along with the text loss.
    expect(card(argentMerged, 'maj-3').image).toBe('maj-3.png')
    expect(card(argentMerged, 'maj-3').imageVersion).toBe(7)
    expect(argentMerged.back).toBe('mine.png')
    expect(argentMerged.backVersion).toBe(2)
    expect(argentMerged.name).toBe('Argent (mine)')
    expect(card(argentMerged, 'user-extra-2')).toBeTruthy()
    expect(argentMerged.cards.length).toBe(79) // 78 seeded + the user's own

    // Structure is the seed's outright.
    expect(argentMerged.supportsReversed).toBe(false)

    // The other decks were not collateral damage.
    expect(deck(merged, 'rws').name).toBe('Rider-Waite-Smith (my copy)')
    expect(card(deck(merged, 'rws'), 'maj-1').meaning).toBe('MY OWN WORDS about the Magician')
  })

  test('is not rewritten again once it has been migrated', async () => {
    // backfillSeedFingerprints returns the same reference when there is nothing
    // to do, so a settled profile must stop writing decks.json at boot. Unit
    // tests assert the reference; this asserts the consequence on disk.
    const localAppData = mkdtempSync(join(tmpdir(), 'hyb-e2e-settled-'))
    await boot(localAppData)
    await boot(localAppData)
    const before = readFileSync(decksPath(localAppData))
    await boot(localAppData)
    const after = readFileSync(decksPath(localAppData))
    expect(after.equals(before)).toBe(true)
  })
})
