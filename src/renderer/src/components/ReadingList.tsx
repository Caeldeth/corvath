import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { Reading } from '../../../shared/types'

interface ReadingListProps {
  readings: Reading[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export default function ReadingList({
  readings,
  selectedId,
  onSelect,
  onCreate,
  onDelete
}: ReadingListProps) {
  // Most recent reading date first.
  const sorted = [...readings].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          New Reading
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {sorted.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2, opacity: 0.6 }}>
            No readings yet. Create one to begin.
          </Typography>
        ) : (
          <List disablePadding>
            {sorted.map((reading) => (
              <ListItem
                key={reading.id}
                disablePadding
                secondaryAction={
                  <Tooltip title="Delete reading">
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label="delete reading"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(reading.id)
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemButton
                  selected={reading.id === selectedId}
                  onClick={() => onSelect(reading.id)}
                >
                  <ListItemText
                    primary={reading.title || 'Untitled Reading'}
                    secondary={`${reading.date} · ${reading.deck} · ${reading.entries.length} card${
                      reading.entries.length === 1 ? '' : 's'
                    }`}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: '0.7rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}
