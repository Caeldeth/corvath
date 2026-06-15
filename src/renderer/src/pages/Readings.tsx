import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useReadings } from '../hooks/useReadings'
import ReadingList from '../components/ReadingList'
import ReadingEditor from '../components/ReadingEditor'

interface ReadingsProps {
  /** Deck names from the builder, offered in the reading's deck field. */
  deckNames: string[]
}

export default function Readings({ deckNames }: ReadingsProps) {
  const {
    readings,
    loaded,
    createReading,
    updateReading,
    deleteReading,
    addEntry,
    updateEntry,
    deleteEntry
  } = useReadings()
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
      <ReadingList
        readings={readings}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onDelete={deleteReading}
      />
      {selectedReading ? (
        <ReadingEditor
          key={selectedReading.id}
          reading={selectedReading}
          deckOptions={deckNames}
          onChange={(patch) => updateReading(selectedReading.id, patch)}
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
    </Box>
  )
}
