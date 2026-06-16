import type { Layout, LayoutPosition } from '../../../shared/types'
import { nowIso, uid } from './deck'

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

export function newPosition(index: number): LayoutPosition {
  return { id: uid(), name: `Position ${index + 1}`, meaning: '', x: 0.5, y: 0.5 }
}

export function newLayout(): Layout {
  return {
    id: uid(),
    name: 'New Layout',
    description: '',
    positions: [newPosition(0)],
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
