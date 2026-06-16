import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { Entry, Layout, Reading } from '../../../shared/types'
import EntryCard from './EntryCard'
import LayoutBoard from './layouts/LayoutBoard'

interface ReadingEditorProps {
  reading: Reading
  /** Deck names from the deck builder, used as Autocomplete options. */
  deckOptions: string[]
  /** Layouts from the layout builder, offered as spreads. */
  layouts: Layout[]
  onChange: (patch: Partial<Reading>) => void
  onApplyLayout: (layout: Layout | null) => void
  onAddEntry: () => void
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
}

export default function ReadingEditor({
  reading,
  deckOptions,
  layouts,
  onChange,
  onApplyLayout,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}: ReadingEditorProps) {
  const activeLayout = layouts.find((l) => l.id === reading.layoutId) ?? null

  const handleSelectLayout = (layoutId: string): void => {
    const layout = layouts.find((l) => l.id === layoutId) ?? null
    const hasContent = reading.entries.some(
      (e) => e.topic || e.question || e.meaning || e.card
    )
    if (
      hasContent &&
      !window.confirm('Applying a layout replaces the current cards. Continue?')
    ) {
      return
    }
    onApplyLayout(layout)
  }

  // For the board preview, show the drawn card under each position.
  const cardForPosition = (positionId: string): string | undefined =>
    reading.entries.find((e) => e.positionId === positionId)?.card || undefined

  const isCorvath = reading.source === 'corvath'

  return (
    <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto', p: 3 }}>
      <Stack spacing={2.5} sx={{ maxWidth: 760, mx: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Title"
            value={reading.title}
            onChange={(e) => onChange({ title: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
          <Chip
            label={isCorvath ? 'Corvath' : 'Manual'}
            color={isCorvath ? 'secondary' : 'default'}
            variant="outlined"
            size="small"
            title="How this reading was created"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Date"
            type="date"
            value={reading.date}
            onChange={(e) => onChange({ date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: '1 1 180px' }}
          />
          <Autocomplete
            freeSolo
            options={deckOptions}
            value={reading.deck}
            onInputChange={(_e, value) => onChange({ deck: value })}
            sx={{ flex: '1 1 180px' }}
            renderInput={(params) => <TextField {...params} label="Deck" />}
          />
          <FormControl sx={{ flex: '1 1 180px' }}>
            <InputLabel id="layout-label">Layout</InputLabel>
            <Select
              labelId="layout-label"
              label="Layout"
              value={reading.layoutId ?? ''}
              onChange={(e) => handleSelectLayout(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {layouts.map((layout) => (
                <MenuItem key={layout.id} value={layout.id}>
                  {layout.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {activeLayout && (
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {activeLayout.name} spread
            </Typography>
            <LayoutBoard
              positions={activeLayout.positions}
              height={300}
              sublabel={(position) => cardForPosition(position.id)}
            />
          </Box>
        )}

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
