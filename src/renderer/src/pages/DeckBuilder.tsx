import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { UseDecks } from '../hooks/useDecks'
import DeckList from '../components/decks/DeckList'
import DeckEditor from '../components/decks/DeckEditor'

interface DeckBuilderProps {
  api: UseDecks
}

export default function DeckBuilder({ api }: DeckBuilderProps) {
  const { decks, loaded, createDeck, updateDeck, deleteDeck, addMajor, updateCard, deleteCard, importCardImage } = api
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Keep selection valid; default to the first deck once loaded.
  useEffect(() => {
    if (!loaded) return
    if (selectedId && !decks.some((d) => d.id === selectedId)) {
      setSelectedId(decks[0]?.id ?? null)
    } else if (!selectedId && decks.length > 0) {
      setSelectedId(decks[0].id)
    }
  }, [loaded, decks, selectedId])

  const selected = decks.find((d) => d.id === selectedId) ?? null

  const handleCreate = (): void => {
    const deck = createDeck()
    setSelectedId(deck.id)
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
      <DeckList
        decks={decks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onDelete={deleteDeck}
      />
      {selected ? (
        <DeckEditor
          key={selected.id}
          deck={selected}
          onUpdateDeck={(patch) => updateDeck(selected.id, patch)}
          onAddMajor={() => addMajor(selected.id)}
          onUpdateCard={(cardId, patch) => updateCard(selected.id, cardId, patch)}
          onDeleteCard={(cardId) => deleteCard(selected.id, cardId)}
          onImportImage={(cardId, file) => void importCardImage(selected.id, cardId, file)}
        />
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Select a deck, or create a new one.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
