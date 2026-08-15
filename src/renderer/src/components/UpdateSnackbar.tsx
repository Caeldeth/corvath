import { Alert, Button, IconButton, Snackbar, Stack } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { JSX } from 'react'
import type { UpdateInfo } from '../../../shared/types'

interface UpdateSnackbarProps {
  /** The available update, or null when there is nothing to say. */
  update: UpdateInfo | null
  onDismiss: () => void
}

/**
 * "Corvath <version> is available", with a link to the release.
 *
 * Named to match creidhne's and epona's `UpdateSnackbar`, which is the house
 * shape for this. It lived inline in `App.tsx` until HTOO-404, which is why
 * HTOO-65's roster could not find an update surface in corvath by searching for
 * the filename.
 *
 * **Extracted to make the dismissal path testable.** Reaching this from `App`
 * means standing up `window.api` and four store hydrations to assert one button
 * exists — and writing exactly that test is what found the same defect in epona.
 *
 * ## The two defects this component exists to have fixed
 *
 * Both were inherited from the shape creidhne and epona share, and each hid the
 * other.
 *
 * 1. **MUI's `Alert` renders its own close X only when `onClose` is set AND
 *    `action` is absent.** `action` REPLACES it. The old code passed both, so
 *    there was no X whenever `update.url` existed — the normal case — and an X
 *    only when it did not. Both controls now live inside `action`, so the
 *    affordance does not depend on the payload.
 * 2. **`clickaway` counted as a dismissal**, so a stray click anywhere closed
 *    the banner.
 *
 * With no X, a clickaway was the only way to dismiss the banner — so the missing
 * button never surfaced as a complaint. That is why they hid each other, and why
 * fixing one without the other would have looked like a regression.
 *
 * Corvath's dismissal is deliberately in-memory: there is no per-version key, so
 * the banner returns next launch. Creidhne persists one, which is what turns its
 * copy of defect 2 into a permanent loss of the notice.
 */
export default function UpdateSnackbar({ update, onDismiss }: UpdateSnackbarProps): JSX.Element {
  return (
    <Snackbar
      open={!!update}
      onClose={(_e, reason) => {
        if (reason !== 'clickaway') onDismiss()
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {update ? (
        <Alert
          severity="info"
          variant="filled"
          data-testid="update-alert"
          action={
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
              {update.url ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => window.open(update.url, '_blank')}
                >
                  View
                </Button>
              ) : null}
              <IconButton size="small" color="inherit" aria-label="Close" onClick={onDismiss}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
        >
          Corvath {update.version} is available.
        </Alert>
      ) : undefined}
    </Snackbar>
  )
}
