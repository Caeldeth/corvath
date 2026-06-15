import type { Deck, DeckCard } from '../../../shared/types'

export const uid = (): string => crypto.randomUUID()
export const nowIso = (): string => new Date().toISOString()

const minorKey = (suit: string, rank: string): string => `${suit}|${rank}`

/**
 * Rebuild a deck's minor cards from its current suits × (pipRanks + courtRanks),
 * preserving the meaning/image/keywords of any minor that still exists (matched
 * by suit+rank) and dropping ones whose suit or rank was removed.
 */
export function rebuildMinors(deck: Deck): DeckCard[] {
  const existing = new Map<string, DeckCard>()
  for (const card of deck.cards) {
    if (card.section === 'minor' && card.suit && card.rank) {
      existing.set(minorKey(card.suit, card.rank), card)
    }
  }

  const minors: DeckCard[] = []
  for (const suit of deck.suits) {
    for (const rank of [...deck.pipRanks, ...deck.courtRanks]) {
      const prior = existing.get(minorKey(suit, rank))
      minors.push(
        prior ?? {
          id: uid(),
          section: 'minor',
          name: `${rank} of ${suit}`,
          suit,
          rank
        }
      )
    }
  }
  return minors
}

/** Keep major-arcana `number` fields contiguous and in array order. */
export function renumberMajors(cards: DeckCard[]): DeckCard[] {
  let n = 0
  return cards.map((card) => (card.section === 'major' ? { ...card, number: n++ } : card))
}

export const majorsOf = (deck: Deck): DeckCard[] => deck.cards.filter((c) => c.section === 'major')

/** Minor cards grouped by suit, in the deck's suit order. */
export function minorsBySuit(deck: Deck): { suit: string; cards: DeckCard[] }[] {
  return deck.suits.map((suit) => ({
    suit,
    cards: deck.cards.filter((c) => c.section === 'minor' && c.suit === suit)
  }))
}
