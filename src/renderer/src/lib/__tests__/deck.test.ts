import { describe, expect, it } from 'vitest'
import type { Deck, DeckCard } from '../../../../shared/types'
import { rebuildMinors, renumberMajors } from '../deck'

const baseDeck = (over: Partial<Deck> = {}): Deck => ({
  id: 'd',
  name: 'D',
  suits: ['Wands', 'Cups'],
  pipRanks: ['Ace', 'Two'],
  courtRanks: ['Knight'],
  supportsReversed: false,
  cards: [],
  createdAt: 'now',
  updatedAt: 'now',
  ...over
})

describe('rebuildMinors', () => {
  it('generates suits × (pipRanks + courtRanks) minors', () => {
    const minors = rebuildMinors(baseDeck())
    // 2 suits × (2 pips + 1 court) = 6
    expect(minors).toHaveLength(6)
    expect(minors.map((c) => c.name)).toContain('Ace of Wands')
    expect(minors.map((c) => c.name)).toContain('Knight of Cups')
    expect(minors.every((c) => c.section === 'minor')).toBe(true)
  })

  it('preserves meaning/image/keywords/id of a minor that still exists', () => {
    const existing: DeckCard = {
      id: 'keep-me',
      section: 'minor',
      name: 'Ace of Wands',
      suit: 'Wands',
      rank: 'Ace',
      meaning: 'beginnings',
      image: 'ace.png',
      keywords: ['spark']
    }
    const minors = rebuildMinors(baseDeck({ cards: [existing] }))
    const ace = minors.find((c) => c.suit === 'Wands' && c.rank === 'Ace')!
    expect(ace).toEqual(existing)
  })

  it('drops minors whose suit or rank was removed', () => {
    const orphan: DeckCard = {
      id: 'orphan',
      section: 'minor',
      name: 'Ace of Swords',
      suit: 'Swords', // no longer in deck.suits
      rank: 'Ace'
    }
    const minors = rebuildMinors(baseDeck({ cards: [orphan] }))
    expect(minors.find((c) => c.id === 'orphan')).toBeUndefined()
  })
})

describe('renumberMajors', () => {
  it('numbers majors contiguously in array order, leaving minors alone', () => {
    const cards: DeckCard[] = [
      { id: 'a', section: 'major', name: 'The Fool', number: 5 },
      { id: 'm', section: 'minor', name: 'Ace of Wands', suit: 'Wands', rank: 'Ace' },
      { id: 'b', section: 'major', name: 'The Magus', number: 99 }
    ]
    const out = renumberMajors(cards)
    expect(out[0].number).toBe(0)
    expect(out[1].number).toBeUndefined() // minor unchanged
    expect(out[2].number).toBe(1)
  })
})
