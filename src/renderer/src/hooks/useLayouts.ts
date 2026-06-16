import { useCallback, useEffect, useState } from 'react'
import type { Layout, LayoutPosition } from '../../../shared/types'
import { nowIso } from '../lib/deck'
import { newLayout, newPosition } from '../lib/layout'

export interface UseLayouts {
  layouts: Layout[]
  loaded: boolean
  createLayout: () => Layout
  updateLayout: (id: string, patch: Partial<Layout>) => void
  deleteLayout: (id: string) => void
  addPosition: (layoutId: string) => void
  updatePosition: (layoutId: string, positionId: string, patch: Partial<LayoutPosition>) => void
  deletePosition: (layoutId: string, positionId: string) => void
}

export function useLayouts(): UseLayouts {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    window.api.layouts.getAll().then((l) => {
      if (!cancelled) {
        setLayouts(l)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loaded) void window.api.layouts.save(layouts)
  }, [layouts, loaded])

  const mutate = useCallback((id: string, fn: (layout: Layout) => Layout): void => {
    setLayouts((prev) =>
      prev.map((layout) => (layout.id === id ? { ...fn(layout), updatedAt: nowIso() } : layout))
    )
  }, [])

  const createLayout = useCallback((): Layout => {
    const layout = newLayout()
    setLayouts((prev) => [...prev, layout])
    return layout
  }, [])

  const updateLayout = useCallback(
    (id: string, patch: Partial<Layout>): void => mutate(id, (layout) => ({ ...layout, ...patch })),
    [mutate]
  )

  const deleteLayout = useCallback((id: string): void => {
    setLayouts((prev) => prev.filter((layout) => layout.id !== id))
  }, [])

  const addPosition = useCallback(
    (layoutId: string): void => {
      mutate(layoutId, (layout) => ({
        ...layout,
        positions: [...layout.positions, newPosition(layout.positions.length)]
      }))
    },
    [mutate]
  )

  const updatePosition = useCallback(
    (layoutId: string, positionId: string, patch: Partial<LayoutPosition>): void => {
      mutate(layoutId, (layout) => ({
        ...layout,
        positions: layout.positions.map((p) => (p.id === positionId ? { ...p, ...patch } : p))
      }))
    },
    [mutate]
  )

  const deletePosition = useCallback(
    (layoutId: string, positionId: string): void => {
      mutate(layoutId, (layout) => ({
        ...layout,
        positions: layout.positions.filter((p) => p.id !== positionId)
      }))
    },
    [mutate]
  )

  return {
    layouts,
    loaded,
    createLayout,
    updateLayout,
    deleteLayout,
    addPosition,
    updatePosition,
    deletePosition
  }
}
