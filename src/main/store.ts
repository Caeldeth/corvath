import { promises as fs } from 'fs'
import { join, resolve, sep } from 'path'
import type { Deck, DeckCard, Layout, Reading, Settings } from '../shared/types'
import { createJsonStore } from './jsonStore'
import { buildSeedDecks } from './seedDecks'
import { buildSeedLayouts } from './seedLayouts'
import { decksSchema, layoutsSchema, readingsSchema, settingsSchema } from './schemas'

const DEFAULT_SETTINGS: Settings = { theme: 'hybrasyl' }

const READINGS_VERSION = 1
interface ReadingsFile {
  version: number
  readings: Reading[]
}
const DEFAULT_READINGS_FILE: ReadingsFile = { version: READINGS_VERSION, readings: [] }

const DECKS_VERSION = 1
interface DecksFile {
  version: number
  decks: Deck[]
}
const DEFAULT_DECKS_FILE: DecksFile = { version: DECKS_VERSION, decks: [] }

const LAYOUTS_VERSION = 1
interface LayoutsFile {
  version: number
  layouts: Layout[]
}
const DEFAULT_LAYOUTS_FILE: LayoutsFile = { version: LAYOUTS_VERSION, layouts: [] }

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

/** Keep only filesystem-safe characters so renderer-supplied ids can't escape the data dir. */
export function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '')
}

/**
 * Resolve `<root>/<deckId>/<filename>` and confirm the result stays strictly
 * inside `root`, returning null if it escapes. Both segments are
 * `safeSegment`-cleaned first, but that alone is not enough: `safeSegment`
 * preserves dots, so a segment like `..` survives and `resolve` could land on a
 * sibling that merely shares the root as a string prefix (e.g. root `.../decks`,
 * target `.../decks.json`). Comparing against `resolve(root) + sep` requires the
 * target to be a real child of the directory, closing that hole.
 */
export function resolveWithin(root: string, deckId: string, filename: string): string | null {
  const base = resolve(root)
  const target = resolve(base, safeSegment(deckId), safeSegment(filename))
  return target.startsWith(base + sep) ? target : null
}

const minorKey = (suit: string, rank: string): string => `${suit}|${rank}`

/** Prefer a seed's own non-empty string; otherwise fall back to the user's. */
const preferSeedString = (seedVal?: string, userVal?: string): string | undefined =>
  seedVal && seedVal.trim() ? seedVal : userVal

const preferSeedKeywords = (seedKw?: string[], userKw?: string[]): string[] | undefined =>
  seedKw && seedKw.length ? seedKw : userKw

/**
 * Merge an updated seed deck over the user's existing copy: take the seed's
 * structure and art, but preserve the user's meaning/meaningReversed/keywords
 * (matched by id for majors, suit+rank for minors) wherever the seed leaves that
 * field empty. This is used on a seedVersion bump so a content update never
 * discards notes the user typed.
 */
export function mergeSeedDeck(userDeck: Deck, seed: Deck): Deck {
  const byId = new Map(userDeck.cards.map((c) => [c.id, c]))
  const bySuitRank = new Map(
    userDeck.cards
      .filter((c) => c.section === 'minor' && c.suit && c.rank)
      .map((c) => [minorKey(c.suit!, c.rank!), c])
  )

  const cards: DeckCard[] = seed.cards.map((sc) => {
    const prior =
      sc.section === 'major'
        ? byId.get(sc.id)
        : sc.suit && sc.rank
          ? bySuitRank.get(minorKey(sc.suit, sc.rank))
          : undefined
    if (!prior) return sc
    return {
      ...sc,
      meaning: preferSeedString(sc.meaning, prior.meaning),
      meaningReversed: preferSeedString(sc.meaningReversed, prior.meaningReversed),
      keywords: preferSeedKeywords(sc.keywords, prior.keywords)
    }
  })

  return { ...seed, cards }
}

export interface Stores {
  loadSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  loadReadings(): Promise<Reading[]>
  saveReadings(readings: Reading[]): Promise<void>
  loadDecks(): Promise<Deck[]>
  saveDecks(decks: Deck[]): Promise<void>
  /** Seed built-in decks, merging in any that are missing (e.g. new built-ins). */
  ensureDecksSeeded(now: string): Promise<void>
  loadLayouts(): Promise<Layout[]>
  saveLayouts(layouts: Layout[]): Promise<void>
  /** Seed the built-in layouts on first run (when no layouts file exists yet). */
  ensureLayoutsSeeded(now: string): Promise<void>
  /** Copy raw image bytes into <dir>/decks/<deckId>/, replacing any prior image for the card. */
  saveCardImage(deckId: string, cardId: string, ext: string, data: Uint8Array): Promise<string>
  /** Best-effort delete of a single card's image file(s). Never throws. */
  deleteCardImage(deckId: string, cardId: string): Promise<void>
  /** Best-effort delete of an entire deck's image directory. Never throws. */
  deleteDeckImages(deckId: string): Promise<void>
  /** Absolute path to a user-imported deck image, or null if it escapes the data dir. */
  resolveImagePath(deckId: string, filename: string): string | null
  /** Absolute path to a bundled (shipped) deck image, or null if it escapes the bundle. */
  resolveBundledImagePath(deckId: string, filename: string): string | null
}

/**
 * Create the hardened settings/readings/decks stores rooted at `dir`
 * (the roaming app-data directory). All files are crash-safe and recover
 * from a backup if the primary is corrupted. Deck images live under
 * `<dir>/decks/<deckId>/`.
 */
export function createStores(dir: string, bundledDecksDir: string): Stores {
  const imagesRoot = join(dir, 'decks')

  const settings = createJsonStore<Settings>({
    dir,
    filename: 'settings.json',
    defaults: DEFAULT_SETTINGS,
    normalize: (data) => {
      const parsed = settingsSchema.safeParse(data)
      return parsed.success ? parsed.data : null
    }
  })

  const readings = createJsonStore<ReadingsFile>({
    dir,
    filename: 'readings.json',
    defaults: DEFAULT_READINGS_FILE,
    normalize: (data) => {
      if (!isObject(data)) return null
      const parsed = readingsSchema.safeParse(data.readings)
      return parsed.success ? { version: READINGS_VERSION, readings: parsed.data } : null
    }
  })

  const decks = createJsonStore<DecksFile>({
    dir,
    filename: 'decks.json',
    defaults: DEFAULT_DECKS_FILE,
    normalize: (data) => {
      if (!isObject(data)) return null
      const parsed = decksSchema.safeParse(data.decks)
      return parsed.success ? { version: DECKS_VERSION, decks: parsed.data } : null
    }
  })

  const layouts = createJsonStore<LayoutsFile>({
    dir,
    filename: 'layouts.json',
    defaults: DEFAULT_LAYOUTS_FILE,
    normalize: (data) => {
      if (!isObject(data)) return null
      const parsed = layoutsSchema.safeParse(data.layouts)
      return parsed.success ? { version: LAYOUTS_VERSION, layouts: parsed.data } : null
    }
  })

  /** Delete every file for a card id in a deck dir (bare name or any extension). */
  async function unlinkCardFiles(deckDir: string, safeCard: string): Promise<void> {
    try {
      const existing = await fs.readdir(deckDir)
      await Promise.all(
        existing
          .filter((f) => f === safeCard || f.startsWith(`${safeCard}.`))
          .map((f) => fs.unlink(join(deckDir, f)).catch(() => {}))
      )
    } catch {
      /* dir may not exist */
    }
  }

  async function saveCardImage(
    deckId: string,
    cardId: string,
    ext: string,
    data: Uint8Array
  ): Promise<string> {
    const safeDeck = safeSegment(deckId)
    const safeCard = safeSegment(cardId)
    const safeExt = safeSegment(ext).replace(/^\.+/, '').toLowerCase() || 'png'
    const deckDir = join(imagesRoot, safeDeck)
    await fs.mkdir(deckDir, { recursive: true })

    // Remove any prior image for this card (any extension/version) so we never
    // accumulate stale files or serve a cached image after a replacement.
    await unlinkCardFiles(deckDir, safeCard)

    const filename = `${safeCard}.${safeExt}`
    await fs.writeFile(join(deckDir, filename), data)
    return filename
  }

  async function deleteCardImage(deckId: string, cardId: string): Promise<void> {
    const deckDir = join(imagesRoot, safeSegment(deckId))
    await unlinkCardFiles(deckDir, safeSegment(cardId))
  }

  async function deleteDeckImages(deckId: string): Promise<void> {
    const deckDir = join(imagesRoot, safeSegment(deckId))
    await fs.rm(deckDir, { recursive: true, force: true }).catch(() => {})
  }

  const resolveImagePath = (deckId: string, filename: string): string | null =>
    resolveWithin(imagesRoot, deckId, filename)

  const resolveBundledImagePath = (deckId: string, filename: string): string | null =>
    resolveWithin(bundledDecksDir, deckId, filename)

  return {
    loadSettings: () => settings.load(),
    saveSettings: (value) => settings.save(value),
    loadReadings: () => readings.load().then((file) => file.readings),
    saveReadings: (value) => readings.save({ version: READINGS_VERSION, readings: value }),
    loadDecks: () => decks.load().then((file) => file.decks),
    saveDecks: (value) => decks.save({ version: DECKS_VERSION, decks: value }),
    ensureDecksSeeded: async (now) => {
      const seeds = buildSeedDecks(now)
      if (!(await decks.exists())) {
        await decks.save({ version: DECKS_VERSION, decks: seeds })
        return
      }
      // Merge built-ins: add any the user is missing, and update an existing
      // built-in when its seed has a newer seedVersion (a content update) —
      // preserving the user's per-card meanings/keywords via mergeSeedDeck.
      // User-created decks and customized decks at the current version are
      // left untouched.
      const next = [...(await decks.load()).decks]
      const indexById = new Map(next.map((d, i) => [d.id, i]))
      let changed = false
      for (const seed of seeds) {
        const i = indexById.get(seed.id)
        if (i === undefined) {
          next.push(seed)
          changed = true
        } else if (next[i].builtIn && (seed.seedVersion ?? 1) > (next[i].seedVersion ?? 1)) {
          next[i] = mergeSeedDeck(next[i], seed)
          changed = true
        }
      }
      if (changed) await decks.save({ version: DECKS_VERSION, decks: next })
    },
    loadLayouts: () => layouts.load().then((file) => file.layouts),
    saveLayouts: (value) => layouts.save({ version: LAYOUTS_VERSION, layouts: value }),
    ensureLayoutsSeeded: async (now) => {
      if (await layouts.exists()) return
      await layouts.save({ version: LAYOUTS_VERSION, layouts: buildSeedLayouts(now) })
    },
    saveCardImage,
    deleteCardImage,
    deleteDeckImages,
    resolveImagePath,
    resolveBundledImagePath
  }
}
