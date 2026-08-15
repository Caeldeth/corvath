import { useEffect, useState, type ReactElement } from 'react'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import { cardHeadingSx } from '../lib/settingsCardSx'
// 128px WebP for a 48px render — 2x DPR with headroom, per R-002's rule of
// render size x DPR rather than a fixed number. The title bar's 64px asset is
// sized for its own 22px render and would be soft here.
import appIcon from '../assets/corvath-128.webp'
import { useReportStore } from '../store/reportStore'
import AboutDialog from './AboutDialog'
import WhatsNewDialog from './WhatsNewDialog'

/**
 * What corvath is, which build you are running, and where it keeps your files.
 *
 * About and What's New keep their open state LOCAL: each has exactly one opener.
 * **Report an issue is the exception**, and its flag lives on `reportStore`
 * because it has two — this button and the error boundary's fallback, which
 * renders after `App` is gone.
 *
 * There is still no "Reveal logs" button here. The house module doc is explicit
 * that reveal-logs belongs on the report dialog; epona shipped it in both places
 * and dropped the About-card copy. It is one click away, on the surface where a
 * person actually wants it.
 */
export default function AboutCard(): ReactElement {
  const [version, setVersion] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const openReport = useReportStore((s) => s.setOpen)

  useEffect(() => {
    let live = true
    void window.api.getAppVersion().then((v) => {
      if (live) setVersion(v)
    })
    return () => {
      live = false
    }
  }, [])

  return (
    <>
      <Typography sx={cardHeadingSx}>About</Typography>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, mb: 2, mt: 1 }}>
        <Box
          component="img"
          src={appIcon}
          alt=""
          sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '6px' }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Corvath
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} data-testid="about-version">
            {version ? `Version ${version}` : 'Version…'} — a desktop tarot companion. Every
            reading, deck and spread stays on this machine.
          </Typography>
          {/* Both go through setWindowOpenHandler -> isSafeExternalUrl ->
              shell.openExternal, so they open in the system browser rather than
              navigating the app. */}
          <Stack direction="row" sx={{ gap: 2, mt: 0.5 }}>
            <Link
              href="https://www.hybrasyl.com"
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              hybrasyl.com
            </Link>
            <Link
              href="https://github.com/hybrasyl"
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              github.com/hybrasyl
            </Link>
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<InfoOutlinedIcon />}
          onClick={() => setAboutOpen(true)}
        >
          About Corvath…
        </Button>
        <Button
          variant="outlined"
          startIcon={<NewReleasesOutlinedIcon />}
          onClick={() => setWhatsNewOpen(true)}
        >
          What&apos;s new…
        </Button>
        {/* "Open the data folder" is a button on this card, not a settings row of
            its own — Sabrael's call, 2026-08-14. */}
        <Button
          variant="outlined"
          startIcon={<FolderOpenOutlinedIcon />}
          onClick={() => window.api.revealSettings()}
          data-testid="reveal-settings"
        >
          Reveal data folder
        </Button>
        {/* Reports go to the shared public intake (hybrasyl/cernunnos), not to
            corvath's own repository: a prefilled issues/new URL needs the
            reporter to have access to the target repo, and this one is
            personal. The app: label is what makes it triageable. */}
        <Button
          variant="outlined"
          startIcon={<BugReportOutlinedIcon />}
          onClick={() => openReport(true)}
          data-testid="report-issue"
        >
          Report an issue…
        </Button>
      </Stack>

      <AboutDialog open={aboutOpen} version={version} onClose={() => setAboutOpen(false)} />
      <WhatsNewDialog open={whatsNewOpen} onClose={() => setWhatsNewOpen(false)} />
    </>
  )
}
