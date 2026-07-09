import { promises as fs } from 'fs'
import { join, resolve, sep } from 'path'
import { tmpdir } from 'os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Deck } from '../../shared/types'
import { createStores, mergeSeedDeck, resolveWithin, safeSegment } from '../store'

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

  it('rejects a sibling that merely shares the root as a string prefix (Phase 4 fix)', () => {
    // root `.../decks`, deckId `..`, filename `decks.json` → resolves to the
    // real `.../decks.json`, which the old `startsWith(root)` check wrongly
    // admitted. The `root + sep` comparison rejects it.
    const root = resolve(dir, 'decks')
    expect(resolveWithin(root, '..', 'decks.json')).toBeNull()
  })

  it('accepts a genuine child and yields a path under the root', () => {
    const root = resolve(dir, 'decks')
    const out = resolveWithin(root, 'thoth', 'maj-0.png')
    expect(out).not.toBeNull()
    expect(out!.startsWith(root + sep)).toBe(true)
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

  it('preserves user meanings when a seedVersion bump merges (mergeSeedDeck)', async () => {
    const s = stores()
    await s.ensureDecksSeeded(now)
    const decks = await s.loadDecks()
    // Take the current rws, add a user meaning to its first major, and roll the
    // stored seedVersion back so the next seed pass counts as an upgrade.
    const rws = decks.find((d) => d.id === 'rws')!
    const foolId = rws.cards[0].id
    const withMeaning: Deck = {
      ...rws,
      seedVersion: 1,
      cards: rws.cards.map((c) =>
        c.id === foolId ? { ...c, meaning: 'my note', keywords: ['mine'] } : c
      )
    }
    await s.saveDecks(decks.map((d) => (d.id === 'rws' ? withMeaning : d)))
    await s.ensureDecksSeeded(now)
    const merged = (await s.loadDecks()).find((d) => d.id === 'rws')!
    expect(merged.seedVersion).toBe(2) // structure updated
    const fool = merged.cards.find((c) => c.id === foolId)!
    expect(fool.meaning).toBe('my note') // user note preserved (seed leaves it empty)
    expect(fool.keywords).toEqual(['mine'])
  })
})

describe('mergeSeedDeck', () => {
  const base = (over: Partial<Deck>): Deck => ({
    id: 'd',
    name: 'D',
    suits: ['Wands'],
    pipRanks: ['Ace'],
    courtRanks: [],
    supportsReversed: false,
    cards: [],
    createdAt: 'now',
    updatedAt: 'now',
    ...over
  })

  it('prefers the seed field when the seed provides one', () => {
    const user = base({ cards: [{ id: 'maj-0', section: 'major', name: 'Fool', meaning: 'user' }] })
    const seed = base({
      name: 'D2',
      cards: [{ id: 'maj-0', section: 'major', name: 'Fool', meaning: 'seed' }]
    })
    const out = mergeSeedDeck(user, seed)
    expect(out.name).toBe('D2')
    expect(out.cards[0].meaning).toBe('seed')
  })

  it('falls back to the user field when the seed leaves it empty, matched by suit+rank', () => {
    const user = base({
      cards: [
        {
          id: 'u1',
          section: 'minor',
          name: 'Ace of Wands',
          suit: 'Wands',
          rank: 'Ace',
          meaning: 'u'
        }
      ]
    })
    const seed = base({
      cards: [{ id: 's1', section: 'minor', name: 'Ace of Wands', suit: 'Wands', rank: 'Ace' }]
    })
    const out = mergeSeedDeck(user, seed)
    // Seed structure (its id/name) wins, but the user's meaning is carried over.
    expect(out.cards[0].id).toBe('s1')
    expect(out.cards[0].meaning).toBe('u')
  })
})

describe('image cleanup', () => {
  const writeImg = async (deckId: string, name: string): Promise<string> => {
    const p = join(dir, 'decks', deckId, name)
    await fs.mkdir(join(dir, 'decks', deckId), { recursive: true })
    await fs.writeFile(p, new Uint8Array([1, 2, 3]))
    return p
  }
  const exists = async (p: string): Promise<boolean> =>
    fs.access(p).then(
      () => true,
      () => false
    )

  it('deleteCardImage removes only the target card files', async () => {
    const s = stores()
    const a = await writeImg('thoth', 'maj-0.png')
    const b = await writeImg('thoth', 'maj-1.png')
    await s.deleteCardImage('thoth', 'maj-0')
    expect(await exists(a)).toBe(false)
    expect(await exists(b)).toBe(true)
  })

  it('deleteDeckImages removes the whole deck directory', async () => {
    const s = stores()
    await writeImg('thoth', 'maj-0.png')
    await s.deleteDeckImages('thoth')
    expect(await exists(join(dir, 'decks', 'thoth'))).toBe(false)
  })

  it('image deletes never throw for a missing deck/card', async () => {
    const s = stores()
    await expect(s.deleteCardImage('nope', 'nope')).resolves.toBeUndefined()
    await expect(s.deleteDeckImages('nope')).resolves.toBeUndefined()
  })
})
