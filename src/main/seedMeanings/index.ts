import type { DeckMeanings } from './types'
import { RWS_MEANINGS } from './rws'
import { ARGENT_MEANINGS } from './argent'
import { EMPYREAN_MEANINGS } from './empyrean'
import { HYBRASYL_MEANINGS } from './hybrasyl'

/**
 * Seeded card text, per built-in deck id. A deck with no entry here ships with
 * card names only and empty meanings — which is what every deck did before.
 *
 * Adding or changing text here requires bumping that deck's `seedVersion` in
 * seedDecks.ts, or existing installs keep the copy they already have.
 */
export const SEED_MEANINGS: Record<string, DeckMeanings> = {
  rws: RWS_MEANINGS,
  argent: ARGENT_MEANINGS,
  empyrean: EMPYREAN_MEANINGS,
  hybrasyl: HYBRASYL_MEANINGS
}

export type { CardMeaning, DeckMeanings } from './types'
