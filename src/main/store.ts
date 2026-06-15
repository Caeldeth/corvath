import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import type { Deck, Reading, Settings, ThemeName } from '../shared/types'
import { createJsonStore } from './jsonStore'
import { buildSeedDecks } from './seedDecks'

const THEME_NAMES: ThemeName[] = ['hybrasyl', 'danaan', 'chadul', 'grinneal']
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

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

/** Keep only filesystem-safe characters so renderer-supplied ids can't escape the data dir. */
function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '')
}

export interface Stores {
  loadSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  loadReadings(): Promise<Reading[]>
  saveReadings(readings: Reading[]): Promise<void>
  loadDecks(): Promise<Deck[]>
  saveDecks(decks: Deck[]): Promise<void>
  /** Seed the built-in decks on first run (when no decks file exists yet). */
  ensureDecksSeeded(now: string): Promise<void>
  /** Copy raw image bytes into <dir>/decks/<deckId>/, replacing any prior image for the card. */
  saveCardImage(deckId: string, cardId: string, ext: string, data: Uint8Array): Promise<string>
  /** Absolute path to a stored deck image, or null if it escapes the data dir. */
  resolveImagePath(deckId: string, filename: string): string | null
}

/**
 * Create the hardened settings/readings/decks stores rooted at `dir`
 * (the roaming app-data directory). All files are crash-safe and recover
 * from a backup if the primary is corrupted. Deck images live under
 * `<dir>/decks/<deckId>/`.
 */
export function createStores(dir: string): Stores {
  const imagesRoot = join(dir, 'decks')

  const settings = createJsonStore<Settings>({
    dir,
    filename: 'settings.json',
    defaults: DEFAULT_SETTINGS,
    normalize: (data) => {
      if (!isObject(data)) return null
      const theme = data.theme
      return {
        theme: THEME_NAMES.includes(theme as ThemeName)
          ? (theme as ThemeName)
          : DEFAULT_SETTINGS.theme
      }
    }
  })

  const readings = createJsonStore<ReadingsFile>({
    dir,
    filename: 'readings.json',
    defaults: DEFAULT_READINGS_FILE,
    normalize: (data) => {
      if (!isObject(data) || !Array.isArray(data.readings)) return null
      return { version: READINGS_VERSION, readings: data.readings as Reading[] }
    }
  })

  const decks = createJsonStore<DecksFile>({
    dir,
    filename: 'decks.json',
    defaults: DEFAULT_DECKS_FILE,
    normalize: (data) => {
      if (!isObject(data) || !Array.isArray(data.decks)) return null
      return { version: DECKS_VERSION, decks: data.decks as Deck[] }
    }
  })

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
    try {
      const existing = await fs.readdir(deckDir)
      await Promise.all(
        existing
          .filter((f) => f === `${safeCard}` || f.startsWith(`${safeCard}.`))
          .map((f) => fs.unlink(join(deckDir, f)).catch(() => {}))
      )
    } catch {
      /* dir may not exist yet */
    }

    const filename = `${safeCard}.${safeExt}`
    await fs.writeFile(join(deckDir, filename), data)
    return filename
  }

  function resolveImagePath(deckId: string, filename: string): string | null {
    const target = resolve(imagesRoot, safeSegment(deckId), safeSegment(filename))
    const base = resolve(imagesRoot)
    return target.startsWith(base) ? target : null
  }

  return {
    loadSettings: () => settings.load(),
    saveSettings: (value) => settings.save(value),
    loadReadings: () => readings.load().then((file) => file.readings),
    saveReadings: (value) => readings.save({ version: READINGS_VERSION, readings: value }),
    loadDecks: () => decks.load().then((file) => file.decks),
    saveDecks: (value) => decks.save({ version: DECKS_VERSION, decks: value }),
    ensureDecksSeeded: async (now) => {
      if (await decks.exists()) return
      await decks.save({ version: DECKS_VERSION, decks: buildSeedDecks(now) })
    },
    saveCardImage,
    resolveImagePath
  }
}
