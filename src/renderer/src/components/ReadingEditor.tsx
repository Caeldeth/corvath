import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { Entry, Reading } from '../../../shared/types'
import EntryCard from './EntryCard'

interface ReadingEditorProps {
  reading: Reading
  /** Deck names from the deck builder, used as Autocomplete options. */
  deckOptions: string[]
  onChange: (patch: Partial<Reading>) => void
  onAddEntry: () => void
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
}

export default function ReadingEditor({
  reading,
  deckOptions,
  onChange,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}: ReadingEditorProps) {
  return (
    <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto', p: 3 }}>
      <Stack spacing={2.5} sx={{ maxWidth: 760, mx: 'auto' }}>
        <TextField
          label="Title"
          value={reading.title}
          onChange={(e) => onChange({ title: e.target.value })}
          fullWidth
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Date"
            type="date"
            value={reading.date}
            onChange={(e) => onChange({ date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <Autocomplete
            freeSolo
            options={deckOptions}
            value={reading.deck}
            onInputChange={(_e, value) => onChange({ deck: value })}
            sx={{ flexGrow: 1, minWidth: 220 }}
            renderInput={(params) => <TextField {...params} label="Deck" />}
          />
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cards
          </Typography>
          <Button startIcon={<AddIcon />} onClick={onAddEntry}>
            Add Card
          </Button>
        </Box>

        {reading.entries.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            No cards yet. Add one to record a topic, question, and meaning.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {reading.entries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onChange={(patch) => onUpdateEntry(entry.id, patch)}
                onDelete={() => onDeleteEntry(entry.id)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
