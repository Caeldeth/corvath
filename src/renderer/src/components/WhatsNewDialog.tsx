import { useEffect, useState, type ReactElement } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material'
import { latestChangelogSection } from '../lib/changelog'

interface WhatsNewDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * The newest CHANGELOG.md section, read from the app root at open time.
 *
 * `CHANGELOG.md` is named in `electron-builder.yml`'s `files` allowlist purely so
 * this can read it in a packaged build. That allowlist fails CLOSED — a runtime
 * file not named there simply is not there — which is the mechanism working, and
 * is why this handles an empty read rather than assuming the file exists.
 */
export default function WhatsNewDialog({ open, onClose }: WhatsNewDialogProps): ReactElement {
  const [state, setState] = useState<'loading' | 'ready' | 'empty'>('loading')
  const [heading, setHeading] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (!open) return
    let live = true
    setState('loading')
    void window.api.readChangelog().then((md) => {
      if (!live) return
      const section = latestChangelogSection(md)
      if (!section) {
        setState('empty')
        return
      }
      setHeading(section.heading)
      setBody(section.body)
      setState('ready')
    })
    return () => {
      live = false
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{state === 'ready' ? `What's new — ${heading}` : "What's new"}</DialogTitle>
      <DialogContent dividers>
        {state === 'loading' && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Reading the changelog…
          </Typography>
        )}
        {state === 'empty' && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No changelog shipped with this build.
          </Typography>
        )}
        {state === 'ready' && (
          // Shown as written. The changelog is authored as prose plus bullets,
          // and preserving its line structure reads better than flattening it.
          <Box
            component="pre"
            sx={{
              m: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            {body}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
