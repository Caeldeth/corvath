/**
 * Pure pack/unpack for the portable `.corvathdeck` format — a zip holding the
 * deck's JSON plus its image files. No filesystem or Electron access here, so it
 * is unit-testable in isolation; the handler layer supplies the bytes and the
 * store reads/writes the actual files.
 */
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import type { Deck } from '../shared/types'
import { deckSchema } from './schemas'

export const CORVATHDECK_EXT = 'corvathdeck'

const DECK_ENTRY = 'deck.json'
const IMAGE_PREFIX = 'images/'

export interface DeckImage {
  filename: string
  data: Uint8Array
}

export interface DeckPackage {
  deck: Deck
  images: DeckImage[]
}

/** Build `.corvathdeck` zip bytes from a deck and its image files. */
export function packDeck(deck: Deck, images: DeckImage[]): Uint8Array {
  const files: Record<string, Uint8Array> = {
    [DECK_ENTRY]: strToU8(JSON.stringify(deck, null, 2))
  }
  for (const { filename, data } of images) {
    // Guard against a stray path separator smuggling images out of the folder.
    const safe = filename.replace(/[/\\]/g, '_')
    files[`${IMAGE_PREFIX}${safe}`] = data
  }
  return zipSync(files)
}

/**
 * Parse and validate a `.corvathdeck` archive. Throws if it isn't a valid
 * package (missing/invalid `deck.json`), so callers can surface the message.
 */
export function unpackDeck(bytes: Uint8Array): DeckPackage {
  let entries: Record<string, Uint8Array>
  try {
    entries = unzipSync(bytes)
  } catch {
    throw new Error('This file is not a valid .corvathdeck archive.')
  }

  const deckJson = entries[DECK_ENTRY]
  if (!deckJson) throw new Error('Not a valid .corvathdeck — missing deck.json.')

  let parsed: unknown
  try {
    parsed = JSON.parse(strFromU8(deckJson))
  } catch {
    throw new Error('The deck.json inside this .corvathdeck is not valid JSON.')
  }
  const deck = deckSchema.parse(parsed)

  const images: DeckImage[] = []
  for (const [path, data] of Object.entries(entries)) {
    if (path.startsWith(IMAGE_PREFIX) && path.length > IMAGE_PREFIX.length) {
      images.push({ filename: path.slice(IMAGE_PREFIX.length), data })
    }
  }
  return { deck, images }
}

/**
 * A deck name not already in `taken`. Appends " (imported)" and then a counter
 * so an imported deck never silently shadows an existing one by name.
 */
export function uniqueDeckName(name: string, taken: string[]): string {
  const base = name.trim() || 'Imported Deck'
  const set = new Set(taken)
  if (!set.has(base)) return base
  const withTag = `${base} (imported)`
  if (!set.has(withTag)) return withTag
  let n = 2
  while (set.has(`${withTag} ${n}`)) n++
  return `${withTag} ${n}`
}
