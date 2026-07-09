import type { Entry, Layout, Reading } from '../../../shared/types'
import { useReadingsStore } from '../store/readingsStore'

export interface UseReadings {
  readings: Reading[]
  loaded: boolean
  createReading: () => Reading
  updateReading: (id: string, patch: Partial<Reading>) => void
  deleteReading: (id: string) => void
  addEntry: (readingId: string) => void
  updateEntry: (readingId: string, entryId: string, patch: Partial<Entry>) => void
  deleteEntry: (readingId: string, entryId: string) => void
  applyLayout: (readingId: string, layout: Layout | null) => void
  importReadings: (incoming: Reading[]) => void
}

/**
 * Thin selector over the readings store. State lives at module scope, so
 * remounting the Readings page (e.g. a tab switch) no longer reloads from disk;
 * persistence is debounced inside the store. Store actions are stable across
 * renders, so this keeps the previous hook's callback identity.
 */
export function useReadings(): UseReadings {
  const readings = useReadingsStore((s) => s.readings)
  const hydrated = useReadingsStore((s) => s.hydrated)
  const {
    createReading,
    updateReading,
    deleteReading,
    addEntry,
    updateEntry,
    deleteEntry,
    applyLayout,
    importReadings
  } = useReadingsStore.getState()

  return {
    readings,
    loaded: hydrated,
    createReading,
    updateReading,
    deleteReading,
    addEntry,
    updateEntry,
    deleteEntry,
    applyLayout,
    importReadings
  }
}
