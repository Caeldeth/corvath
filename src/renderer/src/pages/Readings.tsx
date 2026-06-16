import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { Deck, Layout } from '../../../shared/types'
import { useReadings } from '../hooks/useReadings'
import ReadingList from '../components/ReadingList'
import ReadingEditor from '../components/ReadingEditor'
import ImportDialog from '../components/ImportDialog'

interface ReadingsProps {
  /** Decks from the builder — for the deck field and card meanings. */
  decks: Deck[]
  /** Layouts from the builder, offered as spreads. */
  layouts: Layout[]
}

export default function Readings({ decks, layouts }: ReadingsProps) {
  const {
    readings,
    loaded,
    createReading,
    updateReading,
    deleteReading,
    addEntry,
    updateEntry,
    deleteEntry,
    applyLayout,
    importReadings
  } = useReadings()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    if (!loaded) return
    if (selectedId && !readings.some((r) => r.id === selectedId)) {
      setSelectedId(readings[0]?.id ?? null)
    } else if (!selectedId && readings.length > 0) {
      setSelectedId(readings[0].id)
    }
  }, [loaded, readings, selectedId])

  const selectedReading = useMemo(
    () => readings.find((r) => r.id === selectedId) ?? null,
    [readings, selectedId]
  )

  const handleCreate = (): void => {
    const reading = createReading()
    setSelectedId(reading.id)
  }

  const handleImport = (imported: Parameters<typeof importReadings>[0]): void => {
    importReadings(imported)
    setImportOpen(false)
    if (imported[0]) setSelectedId(imported[0].id)
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
      <ReadingList
        readings={readings}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onImport={() => setImportOpen(true)}
        onDelete={deleteReading}
      />
      {selectedReading ? (
        <ReadingEditor
          key={selectedReading.id}
          reading={selectedReading}
          decks={decks}
          layouts={layouts}
          onChange={(patch) => updateReading(selectedReading.id, patch)}
          onApplyLayout={(layout) => applyLayout(selectedReading.id, layout)}
          onAddEntry={() => addEntry(selectedReading.id)}
          onUpdateEntry={(entryId, patch) => updateEntry(selectedReading.id, entryId, patch)}
          onDeleteEntry={(entryId) => deleteEntry(selectedReading.id, entryId)}
        />
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Select a reading, or create a new one.
          </Typography>
        </Box>
      )}

      <ImportDialog
        open={importOpen}
        layouts={layouts}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </Box>
  )
}
