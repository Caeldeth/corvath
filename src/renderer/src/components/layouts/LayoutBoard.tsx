import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { Box } from '@mui/material'
import type { LayoutPosition } from '../../../../shared/types'
import { clamp01 } from '../../lib/layout'

interface LayoutBoardProps {
  positions: LayoutPosition[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** When provided, cards are draggable and report new normalized coords. */
  onMove?: (id: string, x: number, y: number) => void
  /** Optional secondary label under the position name (e.g. the drawn card). */
  sublabel?: (position: LayoutPosition, index: number) => string | undefined
  height?: number
}

const CARD_W = 54
const CARD_H = 80

export default function LayoutBoard({
  positions,
  selectedId,
  onSelect,
  onMove,
  sublabel,
  height = 380
}: LayoutBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const dragId = useRef<string | null>(null)

  const handlePointerDown = (e: ReactPointerEvent, id: string): void => {
    onSelect?.(id)
    if (!onMove) return
    e.preventDefault()
    dragId.current = id
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent): void => {
    if (!dragId.current || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    onMove?.(
      dragId.current,
      clamp01((e.clientX - rect.left) / rect.width),
      clamp01((e.clientY - rect.top) / rect.height)
    )
  }

  const handlePointerUp = (e: ReactPointerEvent): void => {
    if (!dragId.current) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragId.current = null
  }

  return (
    <Box
      ref={boardRef}
      sx={{
        position: 'relative',
        width: '100%',
        height,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.default',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      {positions.map((position, index) => {
        const selected = position.id === selectedId
        const sub = sublabel?.(position, index)
        return (
          <Box
            key={position.id}
            onPointerDown={(e) => handlePointerDown(e, position.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            sx={{
              position: 'absolute',
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
              width: CARD_W,
              height: CARD_H,
              transform: `translate(-50%, -50%) rotate(${position.rotation ?? 0}deg)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.25,
              p: 0.5,
              borderRadius: 1,
              border: 2,
              borderColor: selected ? 'secondary.light' : 'divider',
              bgcolor: 'background.paper',
              cursor: onMove ? 'grab' : onSelect ? 'pointer' : 'default',
              boxShadow: selected ? 3 : 0,
              userSelect: 'none'
            }}
          >
            {position.source && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 3,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: 'secondary.light'
                }}
                title={position.source === 'top' ? 'Top of deck' : 'Bottom of deck'}
              >
                {position.source === 'top' ? '↑' : '↓'}
              </Box>
            )}
            <Box sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1 }}>{index + 1}</Box>
            <Box
              sx={{
                fontSize: '0.5rem',
                lineHeight: 1.05,
                textAlign: 'center',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {position.name}
            </Box>
            {sub && (
              <Box
                sx={{
                  fontSize: '0.48rem',
                  lineHeight: 1,
                  textAlign: 'center',
                  color: 'secondary.light',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {sub}
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
