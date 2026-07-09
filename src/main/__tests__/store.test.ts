import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { tmpdir } from 'os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Deck } from '../../shared/types'
import { createStores, resolveWithin, safeSegment } from '../store'

let dir: string
let bundled: string
let counter = 0

beforeEach(async () => {
  dir = join(tmpdir(), `corvath-store-${process.pid}-${counter++}`)
  bundled = join(dir, 'bundled')
  await fs.mkdir(bundled, { recursive: true })
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true })
})

const stores = (): ReturnType<typeof createStores> => createStores(dir, bundled)

describe('safeSegment', () => {
  it('strips path separators and traversal characters', () => {
    expect(safeSegment('../../etc/passwd')).toBe('....etcpasswd')
    expect(safeSegment('a/b\\c')).toBe('abc')
    expect(safeSegment('deck-1_v2.png')).toBe('deck-1_v2.png')
  })
})

describe('resolveWithin', () => {
  it('resolves a clean segment inside the root', () => {
    const root = resolve(dir, 'decks')
    expect(resolveWithin(root, 'thoth', 'maj-0.png')).toBe(join(root, 'thoth', 'maj-0.png'))
  })

  it('rejects a segment that escapes the root to a non-prefix sibling', () => {
    const root = resolve(dir, 'decks')
    // safeSegment keeps dots, so `..` resolves to the parent — which does not
    // start with the root string and is rejected.
    expect(resolveWithin(root, '..', 'x.png')).toBeNull()
  })
})

describe('settings normalize', () => {
  it('coerces an unknown theme back to the default', async () => {
    await fs.writeFile(join(dir, 'settings.json'), JSON.stringify({ theme: 'bogus' }), 'utf-8')
    expect(await stores().loadSettings()).toEqual({ theme: 'hybrasyl' })
  })

  it('keeps a valid theme', async () => {
    await fs.writeFile(join(dir, 'settings.json'), JSON.stringify({ theme: 'danaan' }), 'utf-8')
    expect(await stores().loadSettings()).toEqual({ theme: 'danaan' })
  })

  it('rejects a non-object file and returns defaults', async () => {
    await fs.writeFile(join(dir, 'settings.json'), JSON.stringify([1, 2, 3]), 'utf-8')
    expect(await stores().loadSettings()).toEqual({ theme: 'hybrasyl' })
  })
})

describe('readings/decks/layouts normalize', () => {
  it('rejects a payload whose array field is missing', async () => {
    await fs.writeFile(join(dir, 'readings.json'), JSON.stringify({ readings: 'nope' }), 'utf-8')
    expect(await stores().loadReadings()).toEqual([])
    await fs.writeFile(join(dir, 'decks.json'), JSON.stringify({ nope: [] }), 'utf-8')
    expect(await stores().loadDecks()).toEqual([])
  })
})

describe('ensureDecksSeeded', () => {
  const now = '2026-07-09T00:00:00.000Z'

  it('seeds all built-ins on first run', async () => {
    const s = stores()
    await s.ensureDecksSeeded(now)
    const decks = await s.loadDecks()
    expect(decks.map((d) => d.id).sort()).toEqual(
      ['argent', 'empyrean', 'hybrasyl', 'rws', 'thoth'].sort()
    )
  })

  it('adds a missing built-in without disturbing user decks', async () => {
    const userDeck: Deck = {
      id: 'my-deck',
      name: 'Mine',
      suits: [],
      pipRanks: [],
      courtRanks: [],
      supportsReversed: false,
      cards: [],
      createdAt: now,
      updatedAt: now
    }
    // Persist only the user deck (no built-ins), then seed.
    const s = stores()
    await s.saveDecks([userDeck])
    await s.ensureDecksSeeded(now)
    const decks = await s.loadDecks()
    expect(decks.find((d) => d.id === 'my-deck')).toEqual(userDeck)
    expect(decks.find((d) => d.id === 'thoth')).toBeTruthy()
  })

  it('replaces an older built-in when the seedVersion bumps', async () => {
    const s = stores()
    // A stale built-in rws at seedVersion 1 (current seed is 2).
    const stale: Deck = {
      id: 'rws',
      name: 'Old RWS',
      builtIn: true,
      seedVersion: 1,
      suits: [],
      pipRanks: [],
      courtRanks: [],
      supportsReversed: false,
      cards: [],
      createdAt: now,
      updatedAt: now
    }
    await s.saveDecks([stale])
    await s.ensureDecksSeeded(now)
    const rws = (await s.loadDecks()).find((d) => d.id === 'rws')!
    expect(rws.seedVersion).toBe(2)
    expect(rws.name).toBe('Rider-Waite-Smith')
  })

  it('leaves a customized built-in at the current seedVersion untouched', async () => {
    const s = stores()
    await s.ensureDecksSeeded(now)
    const decks = await s.loadDecks()
    const thoth = decks.find((d) => d.id === 'thoth')!
    const customized = { ...thoth, name: 'My Thoth' }
    await s.saveDecks(decks.map((d) => (d.id === 'thoth' ? customized : d)))
    await s.ensureDecksSeeded(now)
    expect((await s.loadDecks()).find((d) => d.id === 'thoth')!.name).toBe('My Thoth')
  })
})
