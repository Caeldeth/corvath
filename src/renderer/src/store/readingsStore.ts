import { create } from 'zustand'
import type { Entry, Layout, Reading } from '../../../shared/types'
import { nowIso, uid } from '../lib/deck'
import { createDebouncedSaver } from './persist'

const today = (): string => nowIso().slice(0, 10)

function newEntry(): Entry {
  return { id: uid(), topic: '', question: '', card: '' }
}

interface ReadingsState {
  readings: Reading[]
  hydrated: boolean
  hydrate: () => Promise<void>
  createReading: () => Reading
  addReading: (reading: Reading) => void
  updateReading: (id: string, patch: Partial<Reading>) => void
  deleteReading: (id: string) => void
  addEntry: (readingId: string) => void
  updateEntry: (readingId: string, entryId: string, patch: Partial<Entry>) => void
  deleteEntry: (readingId: string, entryId: string) => void
  applyLayout: (readingId: string, layout: Layout | null) => void
  importReadings: (incoming: Reading[]) => void
}

let suppressNextSave = false

export const useReadingsStore = create<ReadingsState>((set, get) => ({
  readings: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    const readings = await window.api.readings.getAll()
    suppressNextSave = true
    set({ readings, hydrated: true })
  },

  createReading: () => {
    const reading: Reading = {
      id: uid(),
      title: 'Untitled Reading',
      date: today(),
      deck: 'Argent Tarot',
      source: 'manual',
      entries: [newEntry()],
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
    set((s) => ({ readings: [reading, ...s.readings] }))
    return reading
  },

  // Prepend a fully-formed reading (e.g. one built by the draw flow).
  addReading: (reading) => set((s) => ({ readings: [reading, ...s.readings] })),

  updateReading: (id, patch) =>
    set((s) => ({
      readings: s.readings.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r))
    })),

  deleteReading: (id) => set((s) => ({ readings: s.readings.filter((r) => r.id !== id) })),

  addEntry: (readingId) =>
    set((s) => ({
      readings: s.readings.map((r) =>
        r.id === readingId ? { ...r, entries: [...r.entries, newEntry()], updatedAt: nowIso() } : r
      )
    })),

  updateEntry: (readingId, entryId, patch) =>
    set((s) => ({
      readings: s.readings.map((r) =>
        r.id === readingId
          ? {
              ...r,
              entries: r.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
              updatedAt: nowIso()
            }
          : r
      )
    })),

  deleteEntry: (readingId, entryId) =>
    set((s) => ({
      readings: s.readings.map((r) =>
        r.id === readingId
          ? { ...r, entries: r.entries.filter((e) => e.id !== entryId), updatedAt: nowIso() }
          : r
      )
    })),

  // Apply a layout: replace entries with one per position (topic = position
  // name), and record which layout was used. Passing null clears the layout
  // while leaving the entries intact.
  applyLayout: (readingId, layout) =>
    set((s) => ({
      readings: s.readings.map((r) => {
        if (r.id !== readingId) return r
        if (!layout) {
          return { ...r, layoutId: undefined, layoutName: undefined, updatedAt: nowIso() }
        }
        const entries: Entry[] = layout.positions.map((position) => ({
          id: uid(),
          topic: position.name,
          question: '',
          card: '',
          positionId: position.id
        }))
        return { ...r, layoutId: layout.id, layoutName: layout.name, entries, updatedAt: nowIso() }
      })
    })),

  // Prepend imported readings (most recent first).
  importReadings: (incoming) => set((s) => ({ readings: [...incoming, ...s.readings] }))
}))

const saver = createDebouncedSaver(() => {
  if (typeof window === 'undefined' || !window.api?.readings) return
  window.api.readings
    .save(useReadingsStore.getState().readings)
    .catch((err) => console.error('[readings] save failed:', err))
})

useReadingsStore.subscribe((state) => {
  if (!state.hydrated) return
  if (suppressNextSave) {
    suppressNextSave = false
    return
  }
  saver.schedule()
})
