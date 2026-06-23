import { useCallback, useEffect, useState } from 'react'
import type { Deck, DeckCard } from '../../../shared/types'
import { nowIso, rebuildMinors, renumberMajors, uid } from '../lib/deck'

const STRUCTURAL_KEYS: (keyof Deck)[] = ['suits', 'pipRanks', 'courtRanks']

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
}

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

export function useDecks(): UseDecks {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    window.api.decks.getAll().then((d) => {
      if (!cancelled) {
        setDecks(d)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loaded) void window.api.decks.save(decks)
  }, [decks, loaded])

  const mutate = useCallback((id: string, fn: (deck: Deck) => Deck): void => {
    setDecks((prev) =>
      prev.map((deck) => (deck.id === id ? { ...fn(deck), updatedAt: nowIso() } : deck))
    )
  }, [])

  const createDeck = useCallback((): Deck => {
    const deck = newDeck()
    setDecks((prev) => [...prev, deck])
    return deck
  }, [])

  const updateDeck = useCallback(
    (id: string, patch: Partial<Deck>): void => {
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
    [mutate]
  )

  const deleteDeck = useCallback((id: string): void => {
    setDecks((prev) => prev.filter((deck) => deck.id !== id))
  }, [])

  const addMajor = useCallback(
    (deckId: string): void => {
      mutate(deckId, (deck) => {
        const major: DeckCard = { id: uid(), section: 'major', name: 'New Card' }
        const majors = renumberMajors([...deck.cards.filter((c) => c.section === 'major'), major])
        const minors = deck.cards.filter((c) => c.section === 'minor')
        return { ...deck, cards: [...majors, ...minors] }
      })
    },
    [mutate]
  )

  const updateCard = useCallback(
    (deckId: string, cardId: string, patch: Partial<DeckCard>): void => {
      mutate(deckId, (deck) => ({
        ...deck,
        cards: deck.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c))
      }))
    },
    [mutate]
  )

  const deleteCard = useCallback(
    (deckId: string, cardId: string): void => {
      mutate(deckId, (deck) => {
        const cards = deck.cards.filter((c) => c.id !== cardId)
        return { ...deck, cards: renumberMajors(cards) }
      })
    },
    [mutate]
  )

  const importCardImage = useCallback(
    async (deckId: string, cardId: string, file: File): Promise<void> => {
      const ext = file.name.split('.').pop() ?? 'png'
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { filename } = await window.api.decks.saveImage(deckId, cardId, ext, bytes)
      updateCard(deckId, cardId, { image: filename })
    },
    [updateCard]
  )

  const importDeckBack = useCallback(
    async (deckId: string, file: File): Promise<void> => {
      const ext = file.name.split('.').pop() ?? 'png'
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { filename } = await window.api.decks.saveImage(deckId, 'back', ext, bytes)
      updateDeck(deckId, { back: filename })
    },
    [updateDeck]
  )

  return {
    decks,
    loaded,
    createDeck,
    updateDeck,
    deleteDeck,
    addMajor,
    updateCard,
    deleteCard,
    importCardImage,
    importDeckBack
  }
}
