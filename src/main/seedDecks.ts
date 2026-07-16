import type { Deck, DeckCard } from '../shared/types'
import type { CardMeaning, DeckMeanings } from './seedMeanings/types'
import { SEED_MEANINGS } from './seedMeanings'

const PIPS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

const THOTH_MAJORS = [
  'The Fool',
  'The Magus',
  'The Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Adjustment',
  'The Hermit',
  'Fortune',
  'Lust',
  'The Hanged Man',
  'Death',
  'Art',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'The Aeon',
  'The Universe'
]

// The Empyrean deck — original, Thoth-adjacent major arcana (art bundled).
const EMPYREAN_MAJORS = [
  'The Fool',
  'The Magician',
  'The Seer',
  'The Diva',
  'The Sovereign',
  'The Druid',
  'The Lovers',
  'The Chariot',
  'The Covenant',
  'The Exile',
  'The Wheel',
  'Lust',
  'The Martyr',
  'Death',
  'The Alchemist',
  'The Jailer',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'The Cosmos',
  'Acceptance'
]

const RWS_MAJORS = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World'
]

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Fold seeded text onto a card. Empty/absent fields are omitted rather than set
 * to '' so the merge on a seedVersion bump keeps deferring to the user's own
 * text for anything the seed doesn't say (see preferSeedString in store.ts).
 */
function withMeaning(card: DeckCard, text: CardMeaning | undefined): DeckCard {
  if (!text) return card
  return {
    ...card,
    ...(text.meaning ? { meaning: text.meaning } : {}),
    ...(text.meaningReversed ? { meaningReversed: text.meaningReversed } : {}),
    ...(text.keywords?.length ? { keywords: text.keywords } : {})
  }
}

function buildMajors(names: string[], imageExt?: string, meanings?: DeckMeanings): DeckCard[] {
  return names.map((name, number) => {
    const id = `maj-${number}`
    return withMeaning(
      {
        id,
        section: 'major' as const,
        name,
        number,
        ...(imageExt ? { image: `${id}.${imageExt}` } : {})
      },
      meanings?.majors?.[name]
    )
  })
}

function buildMinors(
  suits: string[],
  pipRanks: string[],
  courtRanks: string[],
  imageExt?: string,
  meanings?: DeckMeanings
): DeckCard[] {
  const cards: DeckCard[] = []
  for (const suit of suits) {
    for (const rank of [...pipRanks, ...courtRanks]) {
      const id = `${slug(suit)}-${slug(rank)}`
      cards.push(
        withMeaning(
          {
            id,
            section: 'minor',
            name: `${rank} of ${suit}`,
            suit,
            rank,
            ...(imageExt ? { image: `${id}.${imageExt}` } : {})
          },
          meanings?.minors?.[id]
        )
      )
    }
  }
  return cards
}

interface DeckSpec {
  id: string
  name: string
  description: string
  suits: string[]
  pipRanks: string[]
  courtRanks: string[]
  supportsReversed: boolean
  majors: string[]
  /** When set, seed bundled art (<cardId>.<ext>) for every card in this deck. */
  imageExt?: string
  /** Card-back image filename in the deck's bundled folder. */
  back?: string
  /** Bump to push an updated built-in over an older copy on startup. */
  seedVersion?: number
}

const SPECS: DeckSpec[] = [
  {
    id: 'argent',
    name: 'Argent Tarot',
    description: 'Original-art deck on the Thoth structure. 78 cards; reversals off by default.',
    suits: ['Wands', 'Cups', 'Swords', 'Disks'],
    pipRanks: PIPS,
    courtRanks: ['Knight', 'Queen', 'Prince', 'Princess'],
    supportsReversed: false,
    majors: THOTH_MAJORS,
    imageExt: 'webp',
    back: 'back.webp',
    // 2: seeded card meanings + keywords.
    seedVersion: 2
  },
  {
    id: 'rws',
    name: 'Rider-Waite-Smith',
    description: 'Standard Rider–Waite–Smith deck (public-domain art). 78 cards.',
    suits: ['Wands', 'Cups', 'Swords', 'Pentacles'],
    pipRanks: PIPS,
    courtRanks: ['Page', 'Knight', 'Queen', 'King'],
    supportsReversed: true,
    majors: RWS_MAJORS,
    imageExt: 'jpg',
    back: 'back.png',
    // 3: seeded card meanings + keywords.
    seedVersion: 3
  },
  {
    id: 'empyrean',
    name: 'Empyrean',
    description: 'An original, Thoth-adjacent deck with full art and custom court ranks.',
    suits: ['Wands', 'Cups', 'Swords', 'Disks'],
    pipRanks: PIPS,
    // Custom court ranks (Thoth equivalents): Guardian=Knight, Muse=Queen,
    // Seeker=Prince, Beloved=Princess.
    courtRanks: ['Guardian', 'Muse', 'Seeker', 'Beloved'],
    supportsReversed: false,
    majors: EMPYREAN_MAJORS,
    imageExt: 'webp',
    back: 'back.webp',
    // 3: seeded card meanings + keywords.
    seedVersion: 3
  },
  {
    id: 'hybrasyl',
    name: 'Hybrasyl',
    description:
      'The Temuairan pantheon as the Octagram: four pantheons of eight, each running the ' +
      'same compass, plus the three primordials who stand outside it. 35 majors over four ' +
      'suits of eight, with mentors, guides, speakers and dreamers for courts.',
    suits: ['Swords', 'Staves', 'Coins', 'Cups'],
    // A short suit: eight pips rather than ten.
    pipRanks: ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'],
    courtRanks: ['Mentor', 'Guide', 'Speaker', 'Dreamer'],
    // Like the Argent and the Empyrean, this deck is read upright only.
    supportsReversed: false,
    // The order is the Octagram, not a list: four pantheons of eight, each in the
    // same compass order — N/Fire, NW/Life, W/Earth, SW/Arcane, S/Water,
    // SE/Metal, E/Wind, NE/Void — then the three primordials. So maj-0, maj-8,
    // maj-16 and maj-24 are all North: the same fire expressed, in truth,
    // inverted, and corrupted. Reordering this breaks that reading (and the
    // meanings in seedMeanings/hybrasyl.ts, which name each card's direction).
    majors: [
      // Tuathair — Expression
      'Deoch',
      'Glioca',
      'Cail',
      'Luathas',
      'Gramail',
      'Fiosachd',
      'Ceannlaidir',
      'Sgrios',
      // Aosdair — Truth
      'Grannos',
      'Saothra',
      'Céithe',
      'Eolathe',
      'Marcan',
      'Lir',
      'Leothne',
      'Cairde',
      // Cráidhros — Inversion
      'Oraithe Ridire',
      'Neamhghlan',
      'Codlaim',
      'Dubh-Gabhar',
      'Duibheagan',
      'Fhala',
      'Adhnann',
      'Cin-Mhare',
      // Gháelros — Corruption
      'Diorradh',
      'Bhàrnadh',
      'Bodhrag',
      'Cnortha',
      'Duairce',
      'Anaman',
      'Cairrthir',
      'Basnuall',
      // Athríd — the primordial trinity, outside the seal
      'Chadul',
      'Danaan',
      'Grinneal'
    ],
    // 2: the structure, over the older empty copy. 3: card meanings.
    // Art is still in progress: leave imageExt/back unset until it lands, or
    // every card would claim an image file that doesn't exist.
    seedVersion: 3
  }
]

/**
 * Build the built-in decks. `now` is an ISO timestamp stamped on each deck.
 * Card text is looked up per deck from SEED_MEANINGS.
 */
export function buildSeedDecks(now: string): Deck[] {
  return SPECS.map((spec) => {
    const meanings = SEED_MEANINGS[spec.id]
    return {
      id: spec.id,
      name: spec.name,
      description: spec.description,
      builtIn: true,
      suits: spec.suits,
      pipRanks: spec.pipRanks,
      courtRanks: spec.courtRanks,
      supportsReversed: spec.supportsReversed,
      back: spec.back,
      seedVersion: spec.seedVersion ?? 1,
      cards: [
        ...buildMajors(spec.majors, spec.imageExt, meanings),
        ...buildMinors(spec.suits, spec.pipRanks, spec.courtRanks, spec.imageExt, meanings)
      ],
      createdAt: now,
      updatedAt: now
    }
  })
}
