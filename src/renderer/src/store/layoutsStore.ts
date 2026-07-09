import { create } from 'zustand'
import type { Layout, LayoutPosition } from '../../../shared/types'
import { nowIso } from '../lib/deck'
import { newLayout, newPosition } from '../lib/layout'
import { createDebouncedSaver } from './persist'

interface LayoutsState {
  layouts: Layout[]
  hydrated: boolean
  hydrate: () => Promise<void>
  createLayout: () => Layout
  updateLayout: (id: string, patch: Partial<Layout>) => void
  deleteLayout: (id: string) => void
  addPosition: (layoutId: string) => void
  updatePosition: (layoutId: string, positionId: string, patch: Partial<LayoutPosition>) => void
  deletePosition: (layoutId: string, positionId: string) => void
}

let suppressNextSave = false

export const useLayoutsStore = create<LayoutsState>((set, get) => {
  const mutate = (id: string, fn: (layout: Layout) => Layout): void =>
    set((s) => ({
      layouts: s.layouts.map((layout) =>
        layout.id === id ? { ...fn(layout), updatedAt: nowIso() } : layout
      )
    }))

  return {
    layouts: [],
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return
      const layouts = await window.api.layouts.getAll()
      suppressNextSave = true
      set({ layouts, hydrated: true })
    },

    createLayout: () => {
      const layout = newLayout()
      set((s) => ({ layouts: [...s.layouts, layout] }))
      return layout
    },

    updateLayout: (id, patch) => mutate(id, (layout) => ({ ...layout, ...patch })),

    deleteLayout: (id) => set((s) => ({ layouts: s.layouts.filter((layout) => layout.id !== id) })),

    addPosition: (layoutId) =>
      mutate(layoutId, (layout) => ({
        ...layout,
        positions: [...layout.positions, newPosition(layout.positions.length)]
      })),

    updatePosition: (layoutId, positionId, patch) =>
      mutate(layoutId, (layout) => ({
        ...layout,
        positions: layout.positions.map((p) => (p.id === positionId ? { ...p, ...patch } : p))
      })),

    deletePosition: (layoutId, positionId) =>
      mutate(layoutId, (layout) => ({
        ...layout,
        positions: layout.positions.filter((p) => p.id !== positionId)
      }))
  }
})

const saver = createDebouncedSaver(() => {
  if (typeof window === 'undefined' || !window.api?.layouts) return
  window.api.layouts
    .save(useLayoutsStore.getState().layouts)
    .catch((err) => console.error('[layouts] save failed:', err))
})

useLayoutsStore.subscribe((state) => {
  if (!state.hydrated) return
  if (suppressNextSave) {
    suppressNextSave = false
    return
  }
  saver.schedule()
})
