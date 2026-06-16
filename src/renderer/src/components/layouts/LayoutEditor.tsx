import { useState } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { DeckSource, Layout, LayoutPosition } from '../../../../shared/types'
import LayoutBoard from './LayoutBoard'

interface LayoutEditorProps {
  layout: Layout
  onUpdateLayout: (patch: Partial<Layout>) => void
  onAddPosition: () => void
  onUpdatePosition: (positionId: string, patch: Partial<LayoutPosition>) => void
  onDeletePosition: (positionId: string) => void
}

export default function LayoutEditor({
  layout,
  onUpdateLayout,
  onAddPosition,
  onUpdatePosition,
  onDeletePosition
}: LayoutEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = layout.positions.find((p) => p.id === selectedId) ?? null
  const selectedIndex = layout.positions.findIndex((p) => p.id === selectedId)

  return (
    <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto', p: 3 }}>
      <Stack spacing={2.5} sx={{ maxWidth: 900, mx: 'auto' }}>
        <TextField
          label="Layout name"
          value={layout.name}
          onChange={(e) => onUpdateLayout({ name: e.target.value })}
          fullWidth
        />
        <TextField
          label="Description"
          value={layout.description ?? ''}
          onChange={(e) => onUpdateLayout({ description: e.target.value })}
          fullWidth
          size="small"
        />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Board
          </Typography>
          <Button startIcon={<AddIcon />} onClick={onAddPosition}>
            Add Position
          </Button>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.7, mt: -1.5 }}>
          Drag cards to arrange the spread. Click a card to edit its name and meaning.
        </Typography>

        <LayoutBoard
          positions={layout.positions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={(id, x, y) => onUpdatePosition(id, { x, y })}
        />

        <Divider>Position</Divider>
        {selected ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  Position {selectedIndex + 1}
                </Typography>
                <Tooltip title="Delete position">
                  <IconButton
                    size="small"
                    aria-label="delete position"
                    onClick={() => {
                      onDeletePosition(selected.id)
                      setSelectedId(null)
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                label="Name"
                value={selected.name}
                onChange={(e) => onUpdatePosition(selected.id, { name: e.target.value })}
                size="small"
                fullWidth
              />
              <TextField
                label="Meaning"
                value={selected.meaning ?? ''}
                onChange={(e) => onUpdatePosition(selected.id, { meaning: e.target.value })}
                size="small"
                fullWidth
                multiline
                minRows={2}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={(selected.rotation ?? 0) !== 0}
                    onChange={(e) =>
                      onUpdatePosition(selected.id, { rotation: e.target.checked ? 90 : 0 })
                    }
                  />
                }
                label="Rotate 90° (crossing card)"
              />
              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                  Draw from deck
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={selected.source ?? null}
                  onChange={(_e, value: DeckSource | null) =>
                    onUpdatePosition(selected.id, { source: value ?? undefined })
                  }
                  aria-label="draw from deck"
                >
                  <ToggleButton value="top">Top of deck</ToggleButton>
                  <ToggleButton value="bottom">Bottom of deck</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </Paper>
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Select a card on the board to edit its name and meaning.
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
