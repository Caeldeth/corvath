import { useCallback, useEffect, useState } from 'react'
import type { Entry, Reading } from '../../../shared/types'

const uid = (): string => crypto.randomUUID()
const nowIso = (): string => new Date().toISOString()
const today = (): string => nowIso().slice(0, 10)

export interface UseReadings {
  readings: Reading[]
  loaded: boolean
  createReading: () => Reading
  updateReading: (id: string, patch: Partial<Reading>) => void
  deleteReading: (id: string) => void
  addEntry: (readingId: string) => void
  updateEntry: (readingId: string, entryId: string, patch: Partial<Entry>) => void
  deleteEntry: (readingId: string, entryId: string) => void
}

function newEntry(): Entry {
  return { id: uid(), topic: '', question: '', meaning: '' }
}

export function useReadings(): UseReadings {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load once on mount.
  useEffect(() => {
    let cancelled = false
    window.api.readings.getAll().then((r) => {
      if (!cancelled) {
        setReadings(r)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Persist on every change, but only after the initial load to avoid
  // overwriting the file with an empty array on startup.
  useEffect(() => {
    if (loaded) void window.api.readings.save(readings)
  }, [readings, loaded])

  const createReading = useCallback((): Reading => {
    const reading: Reading = {
      id: uid(),
      title: 'Untitled Reading',
      date: today(),
      deck: 'Thoth',
      entries: [newEntry()],
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
    setReadings((prev) => [reading, ...prev])
    return reading
  }, [])

  const updateReading = useCallback((id: string, patch: Partial<Reading>): void => {
    setReadings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r))
    )
  }, [])

  const deleteReading = useCallback((id: string): void => {
    setReadings((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addEntry = useCallback((readingId: string): void => {
    setReadings((prev) =>
      prev.map((r) =>
        r.id === readingId
          ? { ...r, entries: [...r.entries, newEntry()], updatedAt: nowIso() }
          : r
      )
    )
  }, [])

  const updateEntry = useCallback(
    (readingId: string, entryId: string, patch: Partial<Entry>): void => {
      setReadings((prev) =>
        prev.map((r) =>
          r.id === readingId
            ? {
                ...r,
                entries: r.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
                updatedAt: nowIso()
              }
            : r
        )
      )
    },
    []
  )

  const deleteEntry = useCallback((readingId: string, entryId: string): void => {
    setReadings((prev) =>
      prev.map((r) =>
        r.id === readingId
          ? { ...r, entries: r.entries.filter((e) => e.id !== entryId), updatedAt: nowIso() }
          : r
      )
    )
  }, [])

  return {
    readings,
    loaded,
    createReading,
    updateReading,
    deleteReading,
    addEntry,
    updateEntry,
    deleteEntry
  }
}
