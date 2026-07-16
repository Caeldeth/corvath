import { describe, it, expect } from 'vitest'
import { buildSeedDecks } from '../seedDecks'

const now = '2026-07-16T00:00:00.000Z'
const deck = (id: string) => buildSeedDecks(now).find((d) => d.id === id)!

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
