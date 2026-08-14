/**
 * Seeded card text for a built-in deck.
 *
 * Kept apart from seedDecks.ts (which owns deck *structure*) because the text is
 * bulky and per-deck: a deck's voice belongs to its art, so the same card carries
 * different words in the Argent and the Empyrean.
 *
 * **A seeded value never overwrites a user's own edit** (see `mergeSeedDeck` in
 * store.ts). A bump replaces only the text corvath itself last wrote, proved by
 * a per-field fingerprint stored beside the card; anything the user has since
 * changed is theirs and stays.
 *
 * This is the reverse of the rule that used to be documented here — a non-empty
 * seed value winning outright. That was harmless only while the seeds were
 * empty, and every deck now ships full text, so the old rule meant the next
 * meanings correction would silently destroy whatever a user had written over
 * it (HTOO-231).
 *
 * Every field stays optional, but the reason changed: an absent field is one
 * this deck simply does not specify, not a way of deferring to the user.
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
