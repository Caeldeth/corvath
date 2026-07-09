import type { Layout, LayoutPosition } from '../../../shared/types'
import { useLayoutsStore } from '../store/layoutsStore'

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

/** Thin selector over the layouts store (see useReadings for the rationale). */
export function useLayouts(): UseLayouts {
  const layouts = useLayoutsStore((s) => s.layouts)
  const hydrated = useLayoutsStore((s) => s.hydrated)
  const { createLayout, updateLayout, deleteLayout, addPosition, updatePosition, deletePosition } =
    useLayoutsStore.getState()

  return {
    layouts,
    loaded: hydrated,
    createLayout,
    updateLayout,
    deleteLayout,
    addPosition,
    updatePosition,
    deletePosition
  }
}
