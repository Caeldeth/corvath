import {
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
import type { Entry, Orientation } from '../../../shared/types'

interface EntryCardProps {
  entry: Entry
  index: number
  onChange: (patch: Partial<Entry>) => void
  onDelete: () => void
}

export default function EntryCard({ entry, index, onChange, onDelete }: EntryCardProps) {
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
          <TextField
            label="Meaning"
            value={entry.meaning}
            onChange={(e) => onChange({ meaning: e.target.value })}
            fullWidth
            multiline
            minRows={2}
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Card drawn (optional)"
              value={entry.card ?? ''}
              onChange={(e) => onChange({ card: e.target.value || undefined })}
              size="small"
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
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
              <ToggleButton value="reversed" aria-label="reversed">
                Reversed
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
