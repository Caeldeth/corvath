import { describe, expect, it } from 'vitest'
import { zipSync } from 'fflate'
import type { Deck } from '../../shared/types'
import { packDeck, unpackDeck, uniqueDeckName } from '../deckPackage'

function makeDeck(): Deck {
  return {
    id: 'src-id',
    name: 'My Deck',
    builtIn: true,
    seedVersion: 3,
    suits: ['Cups'],
    pipRanks: ['Ace'],
    courtRanks: ['King'],
    supportsReversed: true,
    back: 'back.webp',
    cards: [
      { id: 'the-star', section: 'major', name: 'The Star', number: 0, image: 'the-star.webp' },
      { id: 'cups-ace', section: 'minor', name: 'Ace of Cups', suit: 'Cups', rank: 'Ace' }
    ],
    createdAt: 'a',
    updatedAt: 'b'
  }
}

const bytes = (nums: number[]): Uint8Array => new Uint8Array(nums)

describe('packDeck / unpackDeck', () => {
  it('round-trips a deck and its images', () => {
    const deck = makeDeck()
    const images = [
      { filename: 'the-star.webp', data: bytes([1, 2, 3]) },
      { filename: 'back.webp', data: bytes([9, 8]) }
    ]
    const zip = packDeck(deck, images)
    const out = unpackDeck(zip)

    expect(out.deck).toEqual(deck)
    const byName = Object.fromEntries(out.images.map((i) => [i.filename, Array.from(i.data)]))
    expect(byName['the-star.webp']).toEqual([1, 2, 3])
    expect(byName['back.webp']).toEqual([9, 8])
    expect(out.images).toHaveLength(2)
  })

  it('throws on bytes that are not a zip', () => {
    expect(() => unpackDeck(bytes([0, 1, 2, 3]))).toThrow(/not a valid \.corvathdeck/i)
  })

  it('throws when deck.json is missing', () => {
    // A valid zip that has an image entry but no deck.json.
    const zip = zipSync({ 'images/x.webp': bytes([1]) })
    expect(() => unpackDeck(zip)).toThrow(/missing deck\.json/i)
  })

  it('rejects an invalid deck.json (schema failure)', () => {
    // Hand-build a package whose deck.json is structurally wrong.
    const bad = packDeck({ ...makeDeck(), suits: 'nope' as unknown as string[] }, [])
    expect(() => unpackDeck(bad)).toThrow()
  })
})

describe('uniqueDeckName', () => {
  it('keeps the name when free', () => {
    expect(uniqueDeckName('Thoth', ['Rider-Waite'])).toBe('Thoth')
  })

  it('tags a colliding name', () => {
    expect(uniqueDeckName('Thoth', ['Thoth'])).toBe('Thoth (imported)')
  })

  it('counts up when the tagged name also collides', () => {
    expect(uniqueDeckName('Thoth', ['Thoth', 'Thoth (imported)'])).toBe('Thoth (imported) 2')
    expect(uniqueDeckName('Thoth', ['Thoth', 'Thoth (imported)', 'Thoth (imported) 2'])).toBe(
      'Thoth (imported) 3'
    )
  })

  it('falls back for a blank name', () => {
    expect(uniqueDeckName('   ', [])).toBe('Imported Deck')
  })
})
