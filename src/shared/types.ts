export type Orientation = 'upright' | 'reversed'

export type ThemeName = 'hybrasyl' | 'danaan' | 'chadul' | 'grinneal'

/** A single card / question within a reading. */
export interface Entry {
  id: string
  topic: string
  question: string
  meaning: string
  /** Optional drawn-card name (e.g. "The Star", "Three of Disks"). */
  card?: string
  /** Optional — orientation is not always tracked (e.g. Thoth deck). */
  orientation?: Orientation
}

/** A reading session: one deck, a date, and a list of entries. */
export interface Reading {
  id: string
  title: string
  /** Calendar date of the reading, stored as 'YYYY-MM-DD'. */
  date: string
  /** Deck used for the whole reading (e.g. "Thoth"). */
  deck: string
  entries: Entry[]
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: ThemeName
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

/** The surface exposed to the renderer on `window.api`. */
export interface TarotApi {
  readings: {
    getAll(): Promise<Reading[]>
    save(readings: Reading[]): Promise<void>
  }
  loadSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  window: WindowControls
}
