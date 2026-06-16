import { useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined'
import type { Layout, Reading } from '../../../shared/types'
import { IMPORT_EXAMPLE, parseReadingsImport } from '../lib/importReadings'

interface ImportDialogProps {
  open: boolean
  layouts: Layout[]
  onClose: () => void
  onImport: (readings: Reading[]) => void
}

export default function ImportDialog({ open, layouts, onClose, onImport }: ImportDialogProps) {
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [showSpec, setShowSpec] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = (): void => {
    setText('')
    setErrors([])
  }

  const handleClose = (): void => {
    reset()
    onClose()
  }

  const handleImport = (): void => {
    const result = parseReadingsImport(text, layouts)
    if (result.errors.length) {
      setErrors(result.errors)
      return
    }
    onImport(result.readings)
    reset()
  }

  const handleFile = async (file: File): Promise<void> => {
    setText(await file.text())
    setErrors([])
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import readings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<FileOpenOutlinedIcon />}
              onClick={() => fileRef.current?.click()}
            >
              Load JSON file
            </Button>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              or paste below
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setShowSpec((s) => !s)}
            >
              {showSpec ? 'Hide format' : 'What can I import?'}
            </Link>
          </Box>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />

          <TextField
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (errors.length) setErrors([])
            }}
            placeholder="Paste reading JSON here…"
            multiline
            minRows={10}
            fullWidth
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
          />

          {errors.length > 0 && (
            <Alert severity="error">
              <Typography variant="subtitle2">Import failed — nothing was imported:</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </Box>
            </Alert>
          )}

          {showSpec && (
            <Box>
              <Divider sx={{ mb: 1.5 }}>Import format</Divider>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                Provide a single reading object or an array of them.
                <Box component="ul" sx={{ mt: 0.5, mb: 1, pl: 2 }}>
                  <li>
                    <strong>title</strong> (required), <strong>date</strong> (required,
                    YYYY-MM-DD).
                  </li>
                  <li>
                    <strong>entries</strong> (required, ≥ 1). Each entry needs{' '}
                    <strong>card</strong>; optional <strong>topic</strong>,{' '}
                    <strong>question</strong>, <strong>orientation</strong> (&quot;upright&quot; or
                    &quot;reversed&quot;), and <strong>notes</strong> (per-card interpretation).
                  </li>
                  <li>
                    Optional: <strong>deck</strong> (name), <strong>layout</strong> (name — must
                    match a layout; entries map to positions in order when counts match),{' '}
                    <strong>source</strong> (&quot;manual&quot; or &quot;corvath&quot;, default
                    manual), <strong>notes</strong>.
                  </li>
                  <li>
                    Card <em>meanings are not imported</em> — they come from the card&apos;s meaning
                    in the Deck builder.
                  </li>
                </Box>
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  overflowX: 'auto',
                  fontSize: '0.72rem'
                }}
              >
                {IMPORT_EXAMPLE}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleImport} disabled={!text.trim()}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  )
}
