import type { Deck, DeckCard, DeckExportResult, DeckImportResult } from '../../../shared/types'
import { useDecksStore } from '../store/decksStore'

export interface UseDecks {
  decks: Deck[]
  loaded: boolean
  createDeck: () => Deck
  updateDeck: (id: string, patch: Partial<Deck>) => void
  deleteDeck: (id: string) => void
  addMajor: (deckId: string) => void
  updateCard: (deckId: string, cardId: string, patch: Partial<DeckCard>) => void
  deleteCard: (deckId: string, cardId: string) => void
  importCardImage: (deckId: string, cardId: string, file: File) => Promise<void>
  importDeckBack: (deckId: string, file: File) => Promise<void>
  exportDeck: (deckId: string) => Promise<DeckExportResult>
  importDeck: () => Promise<DeckImportResult>
}

/** Thin selector over the decks store (see useReadings for the rationale). */
export function useDecks(): UseDecks {
  const decks = useDecksStore((s) => s.decks)
  const hydrated = useDecksStore((s) => s.hydrated)
  const {
    createDeck,
    updateDeck,
    deleteDeck,
    addMajor,
    updateCard,
    deleteCard,
    importCardImage,
    importDeckBack,
    exportDeck,
    importDeck
  } = useDecksStore.getState()

  return {
    decks,
    loaded: hydrated,
    createDeck,
    updateDeck,
    deleteDeck,
    addMajor,
    updateCard,
    deleteCard,
    importCardImage,
    importDeckBack,
    exportDeck,
    importDeck
  }
}
