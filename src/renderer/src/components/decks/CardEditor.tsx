import { useRef } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { Deck, DeckCard } from '../../../../shared/types'
import { cardPlaceholderDataUrl } from '../../lib/cardPlaceholder'

interface CardEditorProps {
  deck: Deck
  card: DeckCard | null
  onClose: () => void
  onChange: (patch: Partial<DeckCard>) => void
  onImportImage: (file: File) => void
  onDelete?: () => void
}

export default function CardEditor({
  deck,
  card,
  onClose,
  onChange,
  onImportImage,
  onDelete
}: CardEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  if (!card) return null

  const imageSrc = card.image
    ? `${window.api.decks.imageUrl(deck.id, card.image)}?v=${encodeURIComponent(deck.updatedAt)}`
    : cardPlaceholderDataUrl(card.name)

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          {card.section === 'major' ? 'Major Arcana' : `${card.suit ?? ''}`}
        </Box>
        {onDelete && (
          <Tooltip title="Delete card">
            <IconButton size="small" onClick={onDelete} aria-label="delete card">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 96,
                height: 150,
                flexShrink: 0,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: 'background.default'
              }}
            >
              <img
                src={imageSrc}
                alt={card.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <TextField
                label="Name"
                value={card.name}
                onChange={(e) => onChange({ name: e.target.value })}
                size="small"
                fullWidth
              />
              <TextField
                label="Keywords"
                value={(card.keywords ?? []).join(', ')}
                onChange={(e) =>
                  onChange({
                    keywords: e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean)
                  })
                }
                helperText="Comma-separated"
                size="small"
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<ImageOutlinedIcon />}
                  onClick={() => fileRef.current?.click()}
                >
                  {card.image ? 'Replace image' : 'Import image'}
                </Button>
                {card.image && (
                  <Button size="small" color="inherit" onClick={() => onChange({ image: undefined })}>
                    Remove
                  </Button>
                )}
              </Box>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImportImage(file)
                  e.target.value = ''
                }}
              />
            </Stack>
          </Box>

          <TextField
            label="Meaning"
            value={card.meaning ?? ''}
            onChange={(e) => onChange({ meaning: e.target.value })}
            multiline
            minRows={2}
            fullWidth
            size="small"
          />
          {deck.supportsReversed && (
            <TextField
              label="Reversed meaning"
              value={card.meaningReversed ?? ''}
              onChange={(e) => onChange({ meaningReversed: e.target.value })}
              multiline
              minRows={2}
              fullWidth
              size="small"
            />
          )}
          {!deck.supportsReversed && (
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Reversals are off for this deck (toggle in the deck settings to add reversed
              meanings).
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
