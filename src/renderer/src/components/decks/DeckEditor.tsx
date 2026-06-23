import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import type { Deck, DeckCard } from '../../../../shared/types'
import { majorsOf, minorsBySuit } from '../../lib/deck'
import LinesEditor from './LinesEditor'
import CardThumb from './CardThumb'
import CardEditor from './CardEditor'

interface DeckEditorProps {
  deck: Deck
  onUpdateDeck: (patch: Partial<Deck>) => void
  onAddMajor: () => void
  onUpdateCard: (cardId: string, patch: Partial<DeckCard>) => void
  onDeleteCard: (cardId: string) => void
  onImportImage: (cardId: string, file: File) => void
  onImportBack: (file: File) => void
}

const gridSx = { display: 'flex', flexWrap: 'wrap', gap: 1.5 } as const

export default function DeckEditor({
  deck,
  onUpdateDeck,
  onAddMajor,
  onUpdateCard,
  onDeleteCard,
  onImportImage,
  onImportBack
}: DeckEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const backFileRef = useRef<HTMLInputElement>(null)
  const backSrc = deck.back
    ? `${window.api.decks.imageUrl(deck.id, deck.back)}?v=${encodeURIComponent(deck.updatedAt)}`
    : null
  const selected = deck.cards.find((c) => c.id === selectedId) ?? null
  const majors = majorsOf(deck)
  const suits = minorsBySuit(deck)

  return (
    <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto', p: 3 }}>
      <Stack spacing={2.5} sx={{ maxWidth: 900, mx: 'auto' }}>
        <TextField
          label="Deck name"
          value={deck.name}
          onChange={(e) => onUpdateDeck({ name: e.target.value })}
          fullWidth
        />
        <TextField
          label="Description"
          value={deck.description ?? ''}
          onChange={(e) => onUpdateDeck({ description: e.target.value })}
          fullWidth
          size="small"
        />
        <FormControlLabel
          control={
            <Switch
              checked={deck.supportsReversed}
              onChange={(e) => onUpdateDeck({ supportsReversed: e.target.checked })}
            />
          }
          label="Supports reversed cards"
        />

        <Divider>Card back</Divider>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            {backSrc ? (
              <img
                src={backSrc}
                alt="Card back"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ImageOutlinedIcon sx={{ opacity: 0.4 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<ImageOutlinedIcon />}
              onClick={() => backFileRef.current?.click()}
            >
              {deck.back ? 'Replace back' : 'Set card back'}
            </Button>
            {deck.back && (
              <Button size="small" color="inherit" onClick={() => onUpdateDeck({ back: undefined })}>
                Remove
              </Button>
            )}
          </Box>
          <input
            ref={backFileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportBack(file)
              e.target.value = ''
            }}
          />
        </Box>

        <Divider>Structure</Divider>
        <Typography variant="caption" sx={{ opacity: 0.7, mt: -1 }}>
          Minor cards are generated from suits × (pip ranks + court ranks). Editing these
          regenerates the minors; renaming a suit or rank starts that card fresh.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 220px' }}>
            <LinesEditor
              label="Suits"
              values={deck.suits}
              onChange={(suits) => onUpdateDeck({ suits })}
            />
          </Box>
          <Box sx={{ flex: '1 1 220px' }}>
            <LinesEditor
              label="Pip ranks"
              values={deck.pipRanks}
              onChange={(pipRanks) => onUpdateDeck({ pipRanks })}
            />
          </Box>
          <Box sx={{ flex: '1 1 220px' }}>
            <LinesEditor
              label="Court ranks"
              values={deck.courtRanks}
              onChange={(courtRanks) => onUpdateDeck({ courtRanks })}
            />
          </Box>
        </Box>

        <Divider>Major Arcana ({majors.length})</Divider>
        <Box sx={gridSx}>
          {majors.map((card) => (
            <CardThumb key={card.id} deck={deck} card={card} onClick={() => setSelectedId(card.id)} />
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddMajor}
            sx={{ width: 104, height: 178, flexDirection: 'column' }}
          >
            Add
          </Button>
        </Box>

        {suits.map(({ suit, cards }) => (
          <Box key={suit}>
            <Divider sx={{ mb: 2 }}>{suit}</Divider>
            <Box sx={gridSx}>
              {cards.map((card) => (
                <CardThumb
                  key={card.id}
                  deck={deck}
                  card={card}
                  onClick={() => setSelectedId(card.id)}
                />
              ))}
            </Box>
          </Box>
        ))}
        {deck.suits.length === 0 && (
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            No suits defined yet — add suit names above to generate the minor arcana.
          </Typography>
        )}
      </Stack>

      <CardEditor
        deck={deck}
        card={selected}
        onClose={() => setSelectedId(null)}
        onChange={(patch) => selected && onUpdateCard(selected.id, patch)}
        onImportImage={(file) => selected && onImportImage(selected.id, file)}
        onDelete={
          selected?.section === 'major'
            ? () => {
                onDeleteCard(selected.id)
                setSelectedId(null)
              }
            : undefined
        }
      />
    </Box>
  )
}
