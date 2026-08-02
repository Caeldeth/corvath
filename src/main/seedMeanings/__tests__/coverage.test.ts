import { describe, it, expect } from 'vitest'
import { buildSeedDecks } from '../../seedDecks'
import { SEED_MEANINGS } from '..'

// The meanings are keyed by hand — a major name keyed with a typo, or a minor
// keyed off the id convention, silently seeds nothing at all. These assert the
// keys actually land on cards, and that a deck claiming to have text has it for
// every card rather than most of them.

const now = '2026-07-16T00:00:00.000Z'
const decks = buildSeedDecks(now)

describe('seeded meanings line up with the decks', () => {
  it.each(Object.keys(SEED_MEANINGS))('%s: every key matches a real card', (deckId) => {
    const deck = decks.find((d) => d.id === deckId)
    expect(deck, `SEED_MEANINGS has text for unknown deck "${deckId}"`).toBeDefined()

    const majorNames = new Set(deck!.cards.filter((c) => c.section === 'major').map((c) => c.name))
    const minorIds = new Set(deck!.cards.filter((c) => c.section === 'minor').map((c) => c.id))
    const text = SEED_MEANINGS[deckId]

    const strayMajors = Object.keys(text.majors ?? {}).filter((n) => !majorNames.has(n))
    const strayMinors = Object.keys(text.minors ?? {}).filter((id) => !minorIds.has(id))
    expect(strayMajors, 'major keys matching no card').toEqual([])
    expect(strayMinors, 'minor keys matching no card').toEqual([])
  })

  it.each(Object.keys(SEED_MEANINGS))('%s: every card has a meaning and keywords', (deckId) => {
    const deck = decks.find((d) => d.id === deckId)!
    const missingMeaning = deck.cards.filter((c) => !c.meaning?.trim()).map((c) => c.id)
    const missingKeywords = deck.cards.filter((c) => !c.keywords?.length).map((c) => c.id)
    expect(missingMeaning).toEqual([])
    expect(missingKeywords).toEqual([])
  })

  it.each(Object.keys(SEED_MEANINGS))('%s: reversals match the deck setting', (deckId) => {
    const deck = decks.find((d) => d.id === deckId)!
    const withReversed = deck.cards.filter((c) => c.meaningReversed?.trim())
    if (deck.supportsReversed) {
      // A reversible deck that only reverses some cards would show a blank
      // panel for the rest, which reads as a bug rather than a choice.
      expect(withReversed).toHaveLength(deck.cards.length)
    } else {
      // Text that can never be shown is text that will silently rot.
      expect(withReversed).toEqual([])
    }
  })
})
