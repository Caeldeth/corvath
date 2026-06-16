import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { Deck, Entry, Orientation } from '../../../shared/types'

interface EntryCardProps {
  entry: Entry
  index: number
  /** The reading's deck, resolved from the deck builder (null if no match). */
  deck: Deck | null
  onChange: (patch: Partial<Entry>) => void
  onDelete: () => void
}

export default function EntryCard({ entry, index, deck, onChange, onDelete }: EntryCardProps) {
  const cardNames = deck ? deck.cards.map((c) => c.name) : []
  const deckCard = deck?.cards.find((c) => c.name === entry.card) ?? null
  const reversedDisabled = !!deck && !deck.supportsReversed
  const isReversed = entry.orientation === 'reversed' && !reversedDisabled

  const meaning = deckCard
    ? (isReversed ? deckCard.meaningReversed || deckCard.meaning : deckCard.meaning) ?? ''
    : ''

  const cardMissing = !entry.card?.trim()

  const meaningHelp = !deck
    ? 'Set the reading’s deck to one from the Deck builder to show meanings.'
    : !deckCard
      ? 'No matching card in this deck.'
      : !meaning
        ? 'No meaning set for this card in the deck.'
        : ' '

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="overline" sx={{ flexGrow: 1, opacity: 0.8 }}>
            Card {index + 1}
          </Typography>
          <Tooltip title="Remove card">
            <IconButton size="small" onClick={onDelete} aria-label="remove card">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Topic"
            value={entry.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Question"
            value={entry.question}
            onChange={(e) => onChange({ question: e.target.value })}
            fullWidth
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {deck ? (
              <Autocomplete
                freeSolo
                options={cardNames}
                value={entry.card ?? ''}
                onInputChange={(_e, value) => onChange({ card: value })}
                sx={{ flexGrow: 1, minWidth: 220 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Card drawn"
                    required
                    size="small"
                    error={cardMissing}
                    helperText={cardMissing ? 'Required' : ' '}
                  />
                )}
              />
            ) : (
              <TextField
                label="Card drawn"
                value={entry.card ?? ''}
                onChange={(e) => onChange({ card: e.target.value })}
                required
                size="small"
                error={cardMissing}
                helperText={cardMissing ? 'Required' : ' '}
                sx={{ flexGrow: 1, minWidth: 220 }}
              />
            )}

            <ToggleButtonGroup
              exclusive
              size="small"
              value={entry.orientation ?? null}
              onChange={(_e, value: Orientation | null) =>
                onChange({ orientation: value ?? undefined })
              }
              aria-label="orientation"
            >
              <ToggleButton value="upright" aria-label="upright">
                Upright
              </ToggleButton>
              <Tooltip title={reversedDisabled ? 'This deck does not track reversed cards' : ''}>
                <span>
                  <ToggleButton value="reversed" aria-label="reversed" disabled={reversedDisabled}>
                    Reversed
                  </ToggleButton>
                </span>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="Meaning (from deck)"
            value={meaning}
            InputProps={{ readOnly: true }}
            fullWidth
            multiline
            minRows={2}
            size="small"
            helperText={meaningHelp}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
