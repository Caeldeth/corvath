import type { ReactElement } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import type { ThemeName } from '../../../shared/types'
import { cardDescSx, cardHeadingSx, cardSx } from '../lib/settingsCardSx'
import ThemePicker from '../components/ThemePicker'
import AboutCard from '../components/AboutCard'

interface SettingsPageProps {
  theme: ThemeName
  onThemeChange: (name: ThemeName) => void
}

/**
 * Settings, as a page reached from the nav tabs.
 *
 * The house shape (balor / taliesin / oghma) is a scrollable responsive grid of
 * `<Paper>` cards, one per concern — not a tab strip. A later WP adds cards to
 * this grid rather than rebuilding the shell.
 *
 * **It ships with Appearance and About only, and that is the whole roster for
 * now.** Three further candidates — a default deck, a default spread and a
 * default draw mode — are parked in `00a-backlog.md` behind the trigger that
 * would justify them. A setting that only ever takes its default is worse than
 * no setting: it is a control to render, a schema field to validate, a migration
 * to carry and a line of documentation, for nothing.
 */
export default function SettingsPage({ theme, onThemeChange }: SettingsPageProps): ReactElement {
  return (
    <Box data-testid="settings-page" sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Settings
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))',
          gap: 3,
          alignItems: 'stretch'
        }}
      >
        <Paper sx={cardSx}>
          <Typography sx={cardHeadingSx}>Appearance</Typography>
          <Typography variant="body2" sx={cardDescSx}>
            Choose a theme. It applies at once and is remembered between launches.
          </Typography>
          <ThemePicker value={theme} onChange={onThemeChange} />
        </Paper>

        <Paper sx={cardSx}>
          <AboutCard />
        </Paper>
      </Box>
    </Box>
  )
}
