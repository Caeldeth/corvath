import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import type { Deck } from '../../../../shared/types'

interface DeckListProps {
  decks: Deck[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onImport: () => void
  onExport: (id: string) => void
  onDelete: (id: string) => void
}

export default function DeckList({
  decks,
  selectedId,
  onSelect,
  onCreate,
  onImport,
  onExport,
  onDelete
}: DeckListProps) {
  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          New Deck
        </Button>
        <Button fullWidth startIcon={<FileUploadOutlinedIcon />} onClick={onImport}>
          Import Deck
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {decks.map((deck) => (
            <ListItem
              key={deck.id}
              disablePadding
              secondaryAction={
                <Box sx={{ display: 'flex' }}>
                  <Tooltip title="Export deck">
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label="export deck"
                      onClick={(e) => {
                        e.stopPropagation()
                        onExport(deck.id)
                      }}
                    >
                      <FileDownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete deck">
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label="delete deck"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(deck.id)
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemButton selected={deck.id === selectedId} onClick={() => onSelect(deck.id)}>
                <ListItemText
                  primary={deck.name || 'Untitled Deck'}
                  secondary={`${deck.cards.length} card${deck.cards.length === 1 ? '' : 's'}`}
                  slotProps={{
                    primary: { noWrap: true },
                    secondary: { noWrap: true, sx: { fontSize: '0.7rem' } }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}
