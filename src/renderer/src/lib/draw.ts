import type {
  Deck,
  DeckCard,
  DrawMode,
  Entry,
  Layout,
  Orientation,
  Reading
} from '../../../shared/types'
import { nowIso, uid } from './deck'

/** A single card produced by a shuffle/deal. */
export interface DrawnCard {
  /** The deck card's display name (stored on the entry). */
  name: string
  /** The deck card's id — lets the UI look up art for the face. */
  cardId: string
  /** Present only when the deck supports reversals. */
  orientation?: Orientation
}

/** A random 32-bit seed suitable for `mulberry32`. */
export function makeSeed(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]
}

/**
 * Deterministic PRNG (mulberry32): the same seed always yields the same
 * sequence, so a stored `seed` reproduces a draw's shuffle exactly.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Cards eligible to be drawn — every named card in the deck. */
export function drawPool(deck: Deck): DeckCard[] {
  return deck.cards.filter((c) => c.name.trim())
}

/**
 * Shuffle the deck's cards with `seed` (Fisher-Yates) and pre-roll each card's
 * orientation when the deck supports reversals. Fully determined by `seed`, so
 * a card's face is fixed by its position in the shuffled deck — the same whether
 * it is later dealt or picked from a fan.
 */
export function shuffledDeck(deck: Deck, seed: number): DrawnCard[] {
  const rng = mulberry32(seed)
  const pool = drawPool(deck)
  const order = pool.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order.map((i) => {
    const card = pool[i]
    const orientation: Orientation | undefined = deck.supportsReversed
      ? rng() < 0.5
        ? 'reversed'
        : 'upright'
      : undefined
    return { name: card.name, cardId: card.id, orientation }
  })
}

/**
 * Deal one card per layout position, in position order. Positions marked
 * `source: 'bottom'` are dealt from the bottom of the shuffled deck; all others
 * from the top. Never deals the same card twice (callers ensure the spread fits
 * the deck).
 */
export function dealForLayout(deck: Deck, layout: Layout, seed: number): DrawnCard[] {
  const cards = shuffledDeck(deck, seed)
  let top = 0
  let bottom = cards.length - 1
  return layout.positions.map((pos) => (pos.source === 'bottom' ? cards[bottom--] : cards[top++]))
}

/** Deal `count` cards off the top of the shuffled deck. */
export function dealForCount(deck: Deck, count: number, seed: number): DrawnCard[] {
  return shuffledDeck(deck, seed).slice(0, count)
}

export interface FanPlan {
  /** The shuffled deck, in order: index 0 is the top, the last index the bottom. */
  fan: DrawnCard[]
  /** Slot index -> fan index, for slots pinned by `source`. Others are free picks. */
  pinned: Record<number, number>
}

/**
 * Plan a fan-and-pick session. A position marked `source: 'top' | 'bottom'` names
 * one specific card — the deck's top or bottom — so it cannot meaningfully be
 * picked; those slots are resolved here from the ends of the shuffled deck and
 * their cards are spent before the user chooses anything. Every other slot is
 * left for the user to pick from the fan.
 *
 * Unlike `dealForLayout`, an unset `source` does NOT default to the top: in a fan
 * draw an unpinned slot is precisely the one the user gets to choose.
 */
export function planFan(deck: Deck, layout: Layout | null, seed: number): FanPlan {
  const fan = shuffledDeck(deck, seed)
  const pinned: Record<number, number> = {}
  let top = 0
  let bottom = fan.length - 1
  layout?.positions.forEach((pos, i) => {
    if (pos.source === 'bottom') pinned[i] = bottom--
    else if (pos.source === 'top') pinned[i] = top++
  })
  return { fan, pinned }
}

export interface AssembleArgs {
  deck: Deck
  title: string
  /** 'YYYY-MM-DD'. */
  date: string
  drawMode: DrawMode
  seed: number
  /** Present for spread draws; absent for free N-card draws. */
  layout?: Layout | null
  /** One drawn card per slot, in slot order. */
  drawn: DrawnCard[]
}

/**
 * Build a finished `corvath` reading from a completed draw. For spread draws the
 * entry topics/positions come from the layout; for free draws they are numbered.
 */
export function assembleReading({
  deck,
  title,
  date,
  drawMode,
  seed,
  layout,
  drawn
}: AssembleArgs): Reading {
  const now = nowIso()
  const entries: Entry[] = drawn.map((card, i) => {
    const position = layout?.positions[i]
    return {
      id: uid(),
      topic: position?.name ?? `Card ${i + 1}`,
      question: '',
      card: card.name,
      orientation: card.orientation,
      positionId: position?.id
    }
  })
  return {
    id: uid(),
    title: title.trim() || 'Corvath Reading',
    date,
    deck: deck.name,
    source: 'corvath',
    seed,
    drawMode,
    layoutId: layout?.id ?? undefined,
    layoutName: layout?.name ?? undefined,
    entries,
    createdAt: now,
    updatedAt: now
  }
}
