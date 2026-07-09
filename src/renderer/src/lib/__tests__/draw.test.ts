import { describe, expect, it } from 'vitest'
import type { Deck, DeckCard, Layout } from '../../../../shared/types'
import {
  assembleReading,
  dealForCount,
  dealForLayout,
  drawPool,
  makeSeed,
  mulberry32,
  shuffledDeck
} from '../draw'

function card(id: string, name: string): DeckCard {
  return { id, section: 'major', name }
}

function makeDeck(overrides: Partial<Deck> = {}): Deck {
  const cards: DeckCard[] = Array.from({ length: 12 }, (_, i) => card(`c${i}`, `Card ${i}`))
  return {
    id: 'test',
    name: 'Test Deck',
    suits: [],
    pipRanks: [],
    courtRanks: [],
    supportsReversed: false,
    cards,
    createdAt: 'x',
    updatedAt: 'x',
    ...overrides
  }
}

function makeLayout(sources: Array<'top' | 'bottom' | undefined>): Layout {
  return {
    id: 'L',
    name: 'Test Spread',
    positions: sources.map((source, i) => ({
      id: `p${i}`,
      name: `Slot ${i}`,
      x: 0.5,
      y: 0.5,
      source
    })),
    createdAt: 'x',
    updatedAt: 'x'
  }
}

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(12345)
    const b = mulberry32(12345)
    const seqA = [a(), a(), a()]
    const seqB = [b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    expect(a()).not.toEqual(b())
  })

  it('stays within [0, 1)', () => {
    const rng = mulberry32(99)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('drawPool', () => {
  it('excludes cards with blank names', () => {
    const deck = makeDeck({
      cards: [card('a', 'The Star'), card('b', '   '), card('c', 'The Sun')]
    })
    expect(drawPool(deck).map((c) => c.name)).toEqual(['The Star', 'The Sun'])
  })
})

describe('shuffledDeck', () => {
  it('is a permutation of the pool (same seed → identical result)', () => {
    const deck = makeDeck()
    const a = shuffledDeck(deck, 777)
    const b = shuffledDeck(deck, 777)
    expect(a).toEqual(b)
    expect(a.map((c) => c.name).sort()).toEqual(deck.cards.map((c) => c.name).sort())
    expect(a).toHaveLength(deck.cards.length)
  })

  it('reorders the deck (not the identity for a typical seed)', () => {
    const deck = makeDeck()
    const shuffled = shuffledDeck(deck, 42).map((c) => c.name)
    const original = deck.cards.map((c) => c.name)
    expect(shuffled).not.toEqual(original)
  })

  it('omits orientation when the deck does not support reversals', () => {
    const deck = makeDeck({ supportsReversed: false })
    expect(shuffledDeck(deck, 5).every((c) => c.orientation === undefined)).toBe(true)
  })

  it('assigns an orientation to every card when reversals are supported', () => {
    const deck = makeDeck({ supportsReversed: true })
    const drawn = shuffledDeck(deck, 5)
    expect(drawn.every((c) => c.orientation === 'upright' || c.orientation === 'reversed')).toBe(
      true
    )
    // With 12 cards and a fair coin, expect at least one of each (guards against a stuck roll).
    expect(drawn.some((c) => c.orientation === 'reversed')).toBe(true)
  })
})

describe('dealForCount', () => {
  it('returns the top N distinct cards, deterministically', () => {
    const deck = makeDeck()
    const drawn = dealForCount(deck, 3, 2024)
    expect(drawn).toHaveLength(3)
    expect(new Set(drawn.map((c) => c.cardId)).size).toBe(3)
    expect(dealForCount(deck, 3, 2024)).toEqual(drawn)
    // First N of the full shuffle.
    expect(drawn).toEqual(shuffledDeck(deck, 2024).slice(0, 3))
  })
})

describe('dealForLayout', () => {
  it('deals top-source slots from the top and bottom-source slots from the bottom', () => {
    const deck = makeDeck()
    const seed = 314
    const full = shuffledDeck(deck, seed)
    const layout = makeLayout(['top', undefined, 'bottom'])
    const drawn = dealForLayout(deck, layout, seed)

    expect(drawn[0]).toEqual(full[0]) // first top
    expect(drawn[1]).toEqual(full[1]) // undefined defaults to top
    expect(drawn[2]).toEqual(full[full.length - 1]) // bottom
    expect(new Set(drawn.map((c) => c.cardId)).size).toBe(3) // no dupes
  })
})

describe('assembleReading', () => {
  const deck = makeDeck({ supportsReversed: true })

  it('maps drawn cards onto layout positions', () => {
    const layout = makeLayout(['top', 'top'])
    const drawn = dealForLayout(deck, layout, 88)
    const reading = assembleReading({
      deck,
      title: 'My Reading',
      date: '2026-07-09',
      drawMode: 'deal',
      seed: 88,
      layout,
      drawn
    })

    expect(reading.source).toBe('corvath')
    expect(reading.seed).toBe(88)
    expect(reading.drawMode).toBe('deal')
    expect(reading.layoutId).toBe('L')
    expect(reading.layoutName).toBe('Test Spread')
    expect(reading.entries).toHaveLength(2)
    expect(reading.entries[0].topic).toBe('Slot 0')
    expect(reading.entries[0].positionId).toBe('p0')
    expect(reading.entries[0].card).toBe(drawn[0].name)
    expect(reading.entries[0].orientation).toBe(drawn[0].orientation)
  })

  it('numbers entries and omits layout fields for a free draw', () => {
    const drawn = dealForCount(deck, 3, 11)
    const reading = assembleReading({
      deck,
      title: '',
      date: '2026-07-09',
      drawMode: 'fan',
      seed: 11,
      layout: null,
      drawn
    })

    expect(reading.title).toBe('Corvath Reading') // blank title falls back
    expect(reading.layoutId).toBeUndefined()
    expect(reading.layoutName).toBeUndefined()
    expect(reading.entries.map((e) => e.topic)).toEqual(['Card 1', 'Card 2', 'Card 3'])
    expect(reading.entries.every((e) => e.positionId === undefined)).toBe(true)
  })
})

describe('makeSeed', () => {
  it('returns a 32-bit unsigned integer', () => {
    const seed = makeSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThanOrEqual(0xffffffff)
  })
})
