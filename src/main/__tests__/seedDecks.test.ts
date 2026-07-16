import { describe, it, expect, vi } from 'vitest'
import { buildSeedDecks } from '../seedDecks'

vi.mock('../seedMeanings', () => ({
  SEED_MEANINGS: {
    rws: {
      majors: {
        'The Fool': {
          keywords: ['beginnings'],
          meaning: 'A step taken before the ground is proven.',
          meaningReversed: 'The same step, taken carelessly.'
        },
        // Text may be partial — an absent field must not be written.
        'The Magician': { keywords: ['will'] }
      },
      minors: {
        'swords-ace': { meaning: 'A clean cut.' }
      }
    }
  }
}))

const now = '2026-07-16T00:00:00.000Z'
const deck = (id: string) => buildSeedDecks(now).find((d) => d.id === id)!
const card = (id: string, cardId: string) => deck(id).cards.find((c) => c.id === cardId)!

describe('buildSeedDecks — seeded card text', () => {
  it('folds meanings and keywords onto majors by name', () => {
    expect(card('rws', 'maj-0')).toMatchObject({
      name: 'The Fool',
      keywords: ['beginnings'],
      meaning: 'A step taken before the ground is proven.',
      meaningReversed: 'The same step, taken carelessly.'
    })
  })

  it('folds meanings onto minors by card id', () => {
    expect(card('rws', 'swords-ace').meaning).toBe('A clean cut.')
  })

  it('omits fields the text does not supply rather than writing empties', () => {
    // preferSeedString treats '' as "seed says nothing" and keeps the user's
    // text — but only if the key is absent/blank. Writing '' would be fine;
    // writing a stray key would not. Keep the shape clean either way.
    const magician = card('rws', 'maj-1')
    expect(magician.keywords).toEqual(['will'])
    expect(magician.meaning).toBeUndefined()
    expect(magician.meaningReversed).toBeUndefined()
  })

  it('leaves cards with no seeded text untouched', () => {
    const untouched = card('rws', 'cups-two')
    expect(untouched.meaning).toBeUndefined()
    expect(untouched.keywords).toBeUndefined()
    // A deck absent from SEED_MEANINGS entirely still builds.
    expect(card('empyrean', 'maj-0').meaning).toBeUndefined()
  })

  it('does not disturb structure', () => {
    expect(deck('rws').cards).toHaveLength(78)
  })
})

describe('buildSeedDecks — hybrasyl', () => {
  it('builds the pantheon majors over four short suits', () => {
    const d = deck('hybrasyl')
    const majors = d.cards.filter((c) => c.section === 'major')
    const minors = d.cards.filter((c) => c.section === 'minor')

    // 35 majors + 4 suits x (8 pips + 4 courts).
    expect(majors).toHaveLength(35)
    expect(minors).toHaveLength(48)
    expect(d.supportsReversed).toBe(true)
  })

  it('numbers the majors in pantheon order', () => {
    const majors = deck('hybrasyl')
      .cards.filter((c) => c.section === 'major')
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))

    expect(majors[0]).toMatchObject({ id: 'maj-0', name: 'Deoch', number: 0 })
    expect(majors.at(-1)).toMatchObject({ id: 'maj-34', name: 'Grinneal', number: 34 })
    // Contiguous ids — dealForLayout and the art script both index off these.
    expect(majors.map((c) => c.id)).toEqual(majors.map((_, i) => `maj-${i}`))
  })

  it('names minors by rank and suit, including the custom courts', () => {
    const cards = deck('hybrasyl').cards
    expect(cards.find((c) => c.id === 'swords-ace')).toMatchObject({
      name: 'Ace of Swords',
      suit: 'Swords',
      rank: 'Ace'
    })
    expect(cards.find((c) => c.id === 'cups-dreamer')).toMatchObject({ name: 'Dreamer of Cups' })
    // A short suit: no nine or ten.
    expect(cards.find((c) => c.id === 'coins-nine')).toBeUndefined()
  })

  it('claims no art while the deck is undrawn', () => {
    // The spec deliberately omits imageExt/back until the art lands — otherwise
    // every card would reference an image file that doesn't exist and the
    // renderer would fall back through a failed request per card.
    const d = deck('hybrasyl')
    expect(d.back).toBeUndefined()
    expect(d.cards.every((c) => c.image === undefined)).toBe(true)
  })
})
