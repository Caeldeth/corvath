import type { ReactElement } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import appIcon from '../assets/corvath-128.webp'

interface AboutDialogProps {
  open: boolean
  version: string
  onClose: () => void
}

/**
 * The long form of the About card — what corvath is, and the one fact about it
 * that matters most to a person deciding whether to trust it with a journal.
 */
export default function AboutDialog({ open, version, onClose }: AboutDialogProps): ReactElement {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            component="img"
            src={appIcon}
            alt=""
            sx={{ width: 64, height: 64, flexShrink: 0, borderRadius: '8px' }}
          />
          <Box>
            <Typography variant="h6">Corvath</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {version ? `Version ${version}` : 'Version…'}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          A desktop tarot companion. Draw a reading against any deck, record it with your own
          interpretation, and build the decks and spreads it draws from.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Every reading, deck and image stays on this machine. Corvath has no account, no server and
          no sync — decks travel as `.corvathdeck` files if you want to share one.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
