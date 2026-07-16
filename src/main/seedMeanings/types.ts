/**
 * Seeded card text for a built-in deck.
 *
 * Kept apart from seedDecks.ts (which owns deck *structure*) because the text is
 * bulky and per-deck: a deck's voice belongs to its art, so the same card carries
 * different words in the Argent and the Empyrean.
 *
 * A seeded value wins over a user's own edit when a seedVersion bump merges
 * (see mergeSeedDeck / preferSeedString in store.ts). That's why every field is
 * optional — leaving one out is how you defer to whatever the user typed.
 */
export interface CardMeaning {
  keywords?: string[]
  meaning?: string
  /** Only meaningful on decks with supportsReversed. */
  meaningReversed?: string
}

export interface DeckMeanings {
  /** Keyed by major-arcana card name, exactly as it appears in the spec. */
  majors?: Record<string, CardMeaning>
  /** Keyed by minor card id — `<suit>-<rank>`, slugged (e.g. `swords-ace`). */
  minors?: Record<string, CardMeaning>
}
