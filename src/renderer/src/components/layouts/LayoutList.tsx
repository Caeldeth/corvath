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
import type { Layout } from '../../../../shared/types'

interface LayoutListProps {
  layouts: Layout[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export default function LayoutList({
  layouts,
  selectedId,
  onSelect,
  onCreate,
  onDelete
}: LayoutListProps) {
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
          New Layout
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {layouts.map((layout) => (
            <ListItem
              key={layout.id}
              disablePadding
              secondaryAction={
                <Tooltip title="Delete layout">
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="delete layout"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(layout.id)
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemButton
                selected={layout.id === selectedId}
                onClick={() => onSelect(layout.id)}
              >
                <ListItemText
                  primary={layout.name || 'Untitled Layout'}
                  secondary={`${layout.positions.length} position${
                    layout.positions.length === 1 ? '' : 's'
                  }`}
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
