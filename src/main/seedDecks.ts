import type { Deck, DeckCard } from '../shared/types'

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

function buildMajors(names: string[], withImages = false): DeckCard[] {
  return names.map((name, number) => {
    const id = `maj-${number}`
    return {
      id,
      section: 'major' as const,
      name,
      number,
      ...(withImages ? { image: `${id}.webp` } : {})
    }
  })
}

function buildMinors(
  suits: string[],
  pipRanks: string[],
  courtRanks: string[],
  withImages = false
): DeckCard[] {
  const cards: DeckCard[] = []
  for (const suit of suits) {
    for (const rank of [...pipRanks, ...courtRanks]) {
      const id = `${slug(suit)}-${slug(rank)}`
      cards.push({
        id,
        section: 'minor',
        name: `${rank} of ${suit}`,
        suit,
        rank,
        ...(withImages ? { image: `${id}.webp` } : {})
      })
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
  /** Seed bundled art (<cardId>.webp) for every card in this deck. */
  bundledImages?: boolean
  /** Card-back image filename in the deck's bundled folder. */
  back?: string
  /** Bump to push an updated built-in over an older copy on startup. */
  seedVersion?: number
}

const SPECS: DeckSpec[] = [
  {
    id: 'thoth',
    name: 'Thoth',
    description: 'Crowley–Harris Thoth deck. 78 cards; reversals off by default.',
    suits: ['Wands', 'Cups', 'Swords', 'Disks'],
    pipRanks: PIPS,
    courtRanks: ['Knight', 'Queen', 'Prince', 'Princess'],
    supportsReversed: false,
    majors: THOTH_MAJORS
  },
  {
    id: 'rws',
    name: 'Rider-Waite-Smith',
    description: 'Standard Rider–Waite–Smith deck. 78 cards.',
    suits: ['Wands', 'Cups', 'Swords', 'Pentacles'],
    pipRanks: PIPS,
    courtRanks: ['Page', 'Knight', 'Queen', 'King'],
    supportsReversed: true,
    majors: RWS_MAJORS
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
    bundledImages: true,
    back: 'back.webp',
    seedVersion: 2
  },
  {
    id: 'hybrasyl',
    name: 'Hybrasyl',
    description: 'Custom Hybrasyl deck — define your own major arcana and suits.',
    suits: [],
    pipRanks: PIPS,
    courtRanks: ['Knight', 'Queen', 'Prince', 'Princess'],
    supportsReversed: true,
    majors: []
  }
]

/** Build the built-in decks. `now` is an ISO timestamp stamped on each deck. */
export function buildSeedDecks(now: string): Deck[] {
  return SPECS.map((spec) => ({
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
      ...buildMajors(spec.majors, spec.bundledImages),
      ...buildMinors(spec.suits, spec.pipRanks, spec.courtRanks, spec.bundledImages)
    ],
    createdAt: now,
    updatedAt: now
  }))
}
