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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { Deck } from '../../../../shared/types'

interface DeckListProps {
  decks: Deck[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export default function DeckList({ decks, selectedId, onSelect, onCreate, onDelete }: DeckListProps) {
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
      <Box sx={{ p: 1.5 }}>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          New Deck
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {decks.map((deck) => (
            <ListItem
              key={deck.id}
              disablePadding
              secondaryAction={
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
              }
            >
              <ListItemButton selected={deck.id === selectedId} onClick={() => onSelect(deck.id)}>
                <ListItemText
                  primary={deck.name || 'Untitled Deck'}
                  secondary={`${deck.cards.length} card${deck.cards.length === 1 ? '' : 's'}`}
                  primaryTypographyProps={{ noWrap: true }}
                  secondaryTypographyProps={{ noWrap: true, fontSize: '0.7rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}
