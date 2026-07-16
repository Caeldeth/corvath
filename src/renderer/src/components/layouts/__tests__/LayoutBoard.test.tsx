import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LayoutBoard, { CARD_H, CARD_W, DEFAULT_HEIGHT } from '../LayoutBoard'
import type { LayoutPosition } from '../../../../../shared/types'

const positions: LayoutPosition[] = [
  { id: 'p1', name: 'Present', x: 0.5, y: 0.5 },
  // The Celtic Cross crossing card: the tile itself is rotated.
  { id: 'p2', name: 'Challenge', x: 0.5, y: 0.5, rotation: 90 }
]

// Positions are normalized, so tile size and board height are coupled: grow the
// tiles without growing the board and the seeded spreads silently overlap. jsdom
// does no layout, so assert the invariant on the numbers instead.
//
// The gaps below are the tightest the shipped spreads get — Celtic Cross, per
// src/main/seedLayouts.ts. They're restated rather than imported because the
// renderer's tsconfig project can't reach src/main; if you retune that spread,
// retune these too.
describe('tile size fits the seeded spreads', () => {
  const TIGHTEST_VERTICAL_GAP = 0.22 // the staff, y = 0.16 / 0.38 / 0.60 / 0.82
  const TIGHTEST_HORIZONTAL_GAP = 0.17 // the cross, x = 0.13 / 0.30 / 0.47
  /** Roughly the narrowest the fluid board gets in the app. */
  const NARROW_BOARD_W = 640

  it('a tile is shorter than the tightest vertical gap', () => {
    expect(CARD_H).toBeLessThanOrEqual(TIGHTEST_VERTICAL_GAP * DEFAULT_HEIGHT)
  })

  it('a tile is narrower than the tightest horizontal gap at a usable width', () => {
    expect(CARD_W).toBeLessThanOrEqual(TIGHTEST_HORIZONTAL_GAP * NARROW_BOARD_W)
  })
})

describe('LayoutBoard', () => {
  it('renders position names when no art accessor is passed (the layout editor)', () => {
    render(<LayoutBoard positions={positions} />)
    expect(screen.getByText('Present')).toBeInTheDocument()
    expect(screen.getByText('Challenge')).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
  })

  it('renders the sublabel under the name when there is no art', () => {
    render(<LayoutBoard positions={positions} sublabel={(p) => `card for ${p.name}`} />)
    expect(screen.getByText('card for Present')).toBeInTheDocument()
  })

  it('swaps the labels for art, keeping them in the tooltip', () => {
    render(
      <LayoutBoard
        positions={positions}
        sublabel={() => 'The Star'}
        art={(p) => (p.id === 'p1' ? { url: 'corvath-asset://img/rws/maj-17.jpg?v=0' } : undefined)}
      />
    )

    const img = document.querySelector('img')!
    expect(img).toHaveAttribute('src', 'corvath-asset://img/rws/maj-17.jpg?v=0')

    // The filled tile drops the text labels but keeps them reachable on hover…
    expect(screen.queryByText('Present')).not.toBeInTheDocument()
    expect(document.querySelector('[title="1. Present — The Star"]')).toBeTruthy()

    // …while the position with no art still shows its name.
    expect(screen.getByText('Challenge')).toBeInTheDocument()
  })

  it('rotates a reversed card 180deg within its tile', () => {
    render(
      <LayoutBoard
        positions={positions}
        art={(p) => ({ url: `img/${p.id}.jpg`, reversed: p.id === 'p2' })}
      />
    )

    const [upright, reversed] = Array.from(document.querySelectorAll('img'))
    expect(upright).toHaveStyle({ transform: 'none' })
    // The tile for p2 is itself rotated 90deg, so the reversal composes with it
    // rather than replacing it — a reversed crossing card reads as 270deg.
    expect(reversed).toHaveStyle({ transform: 'rotate(180deg)' })
    expect(reversed.parentElement).toHaveStyle({
      transform: 'translate(-50%, -50%) rotate(90deg)'
    })
  })
})
