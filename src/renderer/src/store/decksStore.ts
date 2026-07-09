import { create } from 'zustand'
import type { Deck, DeckCard, DeckExportResult, DeckImportResult } from '../../../shared/types'
import { nowIso, rebuildMinors, renumberMajors, uid } from '../lib/deck'
import { createDebouncedSaver } from './persist'

const STRUCTURAL_KEYS: (keyof Deck)[] = ['suits', 'pipRanks', 'courtRanks']

function newDeck(): Deck {
  return {
    id: uid(),
    name: 'New Deck',
    description: '',
    suits: [],
    pipRanks: ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
    courtRanks: ['Page', 'Knight', 'Queen', 'King'],
    supportsReversed: true,
    cards: [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}

interface DecksState {
  decks: Deck[]
  hydrated: boolean
  hydrate: () => Promise<void>
  createDeck: () => Deck
  updateDeck: (id: string, patch: Partial<Deck>) => void
  deleteDeck: (id: string) => void
  addMajor: (deckId: string) => void
  updateCard: (deckId: string, cardId: string, patch: Partial<DeckCard>) => void
  deleteCard: (deckId: string, cardId: string) => void
  importCardImage: (deckId: string, cardId: string, file: File) => Promise<void>
  importDeckBack: (deckId: string, file: File) => Promise<void>
  /** Export a deck to a `.corvathdeck` file (native save dialog). */
  exportDeck: (deckId: string) => Promise<DeckExportResult>
  /** Import a `.corvathdeck` file (native open dialog); adds it on success. */
  importDeck: () => Promise<DeckImportResult>
}

let suppressNextSave = false

// Best-effort orphaned-image cleanup. Fire-and-forget: a failed unlink must
// never block the state change (the main handler is itself best-effort).
const cleanupCardImage = (deckId: string, cardId: string): void => {
  window.api?.decks?.deleteImage(deckId, cardId).catch(() => {})
}
const cleanupDeckImages = (deckId: string): void => {
  window.api?.decks?.deleteDeckImages(deckId).catch(() => {})
}

export const useDecksStore = create<DecksState>((set, get) => {
  // Structural mutations stamp updatedAt, matching the prior useDecks `mutate`.
  const mutate = (id: string, fn: (deck: Deck) => Deck): void =>
    set((s) => ({
      decks: s.decks.map((deck) => (deck.id === id ? { ...fn(deck), updatedAt: nowIso() } : deck))
    }))

  return {
    decks: [],
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return
      const decks = await window.api.decks.getAll()
      suppressNextSave = true
      set({ decks, hydrated: true })
    },

    createDeck: () => {
      const deck = newDeck()
      set((s) => ({ decks: [...s.decks, deck] }))
      return deck
    },

    updateDeck: (id, patch) => {
      // Clearing the back image (the "Remove" button) should also delete the file.
      if ('back' in patch && !patch.back) cleanupCardImage(id, 'back')
      mutate(id, (deck) => {
        const next = { ...deck, ...patch }
        // If the structure changed, regenerate minor cards (preserving data).
        if (STRUCTURAL_KEYS.some((key) => key in patch)) {
          const majors = next.cards.filter((c) => c.section === 'major')
          next.cards = [...majors, ...rebuildMinors(next)]
        }
        return next
      })
    },

    deleteDeck: (id) => {
      cleanupDeckImages(id)
      set((s) => ({ decks: s.decks.filter((deck) => deck.id !== id) }))
    },

    addMajor: (deckId) =>
      mutate(deckId, (deck) => {
        const major: DeckCard = { id: uid(), section: 'major', name: 'New Card' }
        const majors = renumberMajors([...deck.cards.filter((c) => c.section === 'major'), major])
        const minors = deck.cards.filter((c) => c.section === 'minor')
        return { ...deck, cards: [...majors, ...minors] }
      }),

    updateCard: (deckId, cardId, patch) => {
      // Clearing a card's image (the "Remove" button) should also delete the file.
      if ('image' in patch && !patch.image) cleanupCardImage(deckId, cardId)
      mutate(deckId, (deck) => ({
        ...deck,
        cards: deck.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c))
      }))
    },

    deleteCard: (deckId, cardId) => {
      cleanupCardImage(deckId, cardId)
      mutate(deckId, (deck) => {
        const cards = deck.cards.filter((c) => c.id !== cardId)
        return { ...deck, cards: renumberMajors(cards) }
      })
    },

    importCardImage: async (deckId, cardId, file) => {
      // Only treat the suffix as an extension when there actually is a dot.
      const ext = file.name.includes('.') ? file.name.split('.').pop()! : 'png'
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { filename } = await window.api.decks.saveImage(deckId, cardId, ext, bytes)
      // Bump only this card's version so its URL cache-busts without re-fetching
      // every other card's image (see CardThumb/CardEditor).
      const prev = get()
        .decks.find((d) => d.id === deckId)
        ?.cards.find((c) => c.id === cardId)
      get().updateCard(deckId, cardId, {
        image: filename,
        imageVersion: (prev?.imageVersion ?? 0) + 1
      })
    },

    importDeckBack: async (deckId, file) => {
      const ext = file.name.includes('.') ? file.name.split('.').pop()! : 'png'
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { filename } = await window.api.decks.saveImage(deckId, 'back', ext, bytes)
      const prev = get().decks.find((d) => d.id === deckId)
      get().updateDeck(deckId, { back: filename, backVersion: (prev?.backVersion ?? 0) + 1 })
    },

    exportDeck: (deckId) => {
      const deck = get().decks.find((d) => d.id === deckId)
      if (!deck) return Promise.resolve({ error: 'Deck not found.' })
      return window.api.decks.exportDeck(deck)
    },

    importDeck: async () => {
      const existingNames = get().decks.map((d) => d.name)
      const result = await window.api.decks.importDeck(existingNames)
      // Main writes the images and returns a ready-to-use deck; just add it. The
      // debounced saver then persists decks.json with the new entry.
      if (result.deck) set((s) => ({ decks: [...s.decks, result.deck!] }))
      return result
    }
  }
})

const saver = createDebouncedSaver(() => {
  if (typeof window === 'undefined' || !window.api?.decks) return
  window.api.decks
    .save(useDecksStore.getState().decks)
    .catch((err) => console.error('[decks] save failed:', err))
})

useDecksStore.subscribe((state) => {
  if (!state.hydrated) return
  if (suppressNextSave) {
    suppressNextSave = false
    return
  }
  saver.schedule()
})
