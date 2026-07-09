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
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import type { Reading } from '../../../shared/types'

interface ReadingListProps {
  readings: Reading[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDraw: () => void
  onImport: () => void
  onExport: (id: string) => void
  onExportAll: () => void
  onDelete: (id: string) => void
}

export default function ReadingList({
  readings,
  selectedId,
  onSelect,
  onCreate,
  onDraw,
  onImport,
  onExport,
  onExportAll,
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
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button fullWidth variant="contained" startIcon={<CasinoOutlinedIcon />} onClick={onDraw}>
          Draw a Reading
        </Button>
        <Button fullWidth startIcon={<AddIcon />} onClick={onCreate}>
          New Reading
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            startIcon={<FileUploadOutlinedIcon />}
            onClick={onImport}
            sx={{ flex: 1 }}
          >
            Import
          </Button>
          <Button
            fullWidth
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={onExportAll}
            disabled={readings.length === 0}
            sx={{ flex: 1 }}
          >
            Export all
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {sorted.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
              No readings yet. Draw your first reading to begin.
            </Typography>
            <Button variant="contained" startIcon={<CasinoOutlinedIcon />} onClick={onDraw}>
              Draw a Reading
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {sorted.map((reading) => (
              <ListItem
                key={reading.id}
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Export reading">
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="export reading"
                        onClick={(e) => {
                          e.stopPropagation()
                          onExport(reading.id)
                        }}
                      >
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                  </Box>
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
                    slotProps={{
                      primary: { noWrap: true },
                      secondary: { noWrap: true, sx: { fontSize: '0.7rem' } }
                    }}
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
