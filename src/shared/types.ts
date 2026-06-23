export type Orientation = 'upright' | 'reversed'

export type ThemeName = 'hybrasyl' | 'danaan' | 'chadul' | 'grinneal'

/** A single card / question within a reading. */
export interface Entry {
  id: string
  topic: string
  question: string
  /** Links this entry to a layout position, when a layout was applied. */
  positionId?: string
  /** Drawn-card name (e.g. "The Star", "Three of Disks"). */
  card?: string
  /** Optional — orientation is not always tracked (e.g. Thoth deck). */
  orientation?: Orientation
  /** Free-form per-card interpretation (distinct from the deck's meaning). */
  notes?: string
}

/**
 * How a reading was produced: `manual` (entered by hand via "New Reading")
 * or `corvath` (drawn within the app — a future feature).
 */
export type ReadingSource = 'manual' | 'corvath'

/** A reading session: one deck, a date, and a list of entries. */
export interface Reading {
  id: string
  title: string
  /** Calendar date of the reading, stored as 'YYYY-MM-DD'. */
  date: string
  /** Deck used for the whole reading (e.g. "Thoth"). */
  deck: string
  /** Where the reading came from; defaults to 'manual' for older readings. */
  source?: ReadingSource
  /** Layout/spread applied to this reading, if any. */
  layoutId?: string
  layoutName?: string
  /** Free-form overview / interpretation for the whole reading. */
  notes?: string
  entries: Entry[]
  createdAt: string
  updatedAt: string
}

/** Whether a position's card is drawn from the top or bottom of the deck. */
export type DeckSource = 'top' | 'bottom'

/** A single slot in a spread, placed on a normalized 0..1 board. */
export interface LayoutPosition {
  id: string
  name: string
  meaning?: string
  /** Card-center coordinates, normalized 0..1 across the board. */
  x: number
  y: number
  /** Rotation in degrees (e.g. 90 for a Celtic Cross "crossing" card). */
  rotation?: number
  /** Draw this card from the top or bottom of the deck (mutually exclusive). */
  source?: DeckSource
}

/** A reading layout / spread: an arrangement of named positions. */
export interface Layout {
  id: string
  name: string
  description?: string
  /** True for seeded spreads; still fully editable. */
  builtIn?: boolean
  positions: LayoutPosition[]
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: ThemeName
}

export type CardSection = 'major' | 'minor'

/** A single card definition within a deck. */
export interface DeckCard {
  id: string
  section: CardSection
  name: string
  /** Major-arcana ordinal (e.g. 0..N); unused for minors. */
  number?: number
  /** Minor-arcana suit name (matches one of the deck's `suits`). */
  suit?: string
  /** Minor-arcana rank (one of the deck's `pipRanks` or `courtRanks`). */
  rank?: string
  /** Imported image filename, relative to the deck's image folder. */
  image?: string
  keywords?: string[]
  meaning?: string
  meaningReversed?: string
}

/**
 * A tarot deck. Structure-agnostic: any number of majors, any suit/rank names —
 * "standard" is just one configuration. Minor cards are generated from
 * `suits` × (`pipRanks` + `courtRanks`) but stored explicitly so per-card
 * meanings and images persist across structure edits.
 */
export interface Deck {
  id: string
  name: string
  description?: string
  /** True for seeded decks (Thoth/RWS/Empyrean/Hybrasyl); still fully editable. */
  builtIn?: boolean
  /** Seed revision; a higher value replaces an older built-in copy on startup. */
  seedVersion?: number
  suits: string[]
  pipRanks: string[]
  courtRanks: string[]
  supportsReversed: boolean
  /** Optional card-back image filename (served like card images). */
  back?: string
  cards: DeckCard[]
  createdAt: string
  updatedAt: string
}

/** Custom frameless-window controls exposed to the renderer. */
export interface WindowControls {
  minimize(): void
  toggleMaximize(): void
  close(): void
  isMaximized(): Promise<boolean>
  /** Subscribe to maximize/restore changes; returns an unsubscribe function. */
  onMaximizeChange(callback: (maximized: boolean) => void): () => void
}

/** Result of importing an image file for a card. */
export interface SavedImage {
  /** Filename to store on the card and reference via `corvath-asset://`. */
  filename: string
}

/** The surface exposed to the renderer on `window.api`. */
export interface TarotApi {
  readings: {
    getAll(): Promise<Reading[]>
    save(readings: Reading[]): Promise<void>
  }
  decks: {
    getAll(): Promise<Deck[]>
    save(decks: Deck[]): Promise<void>
    /** Copy raw image bytes into the deck's image folder; returns the stored filename. */
    saveImage(deckId: string, cardId: string, ext: string, data: Uint8Array): Promise<SavedImage>
    /** Build the `corvath-asset://` URL for a stored image (cache-busted). */
    imageUrl(deckId: string, filename: string): string
  }
  layouts: {
    getAll(): Promise<Layout[]>
    save(layouts: Layout[]): Promise<void>
  }
  loadSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  window: WindowControls
}
