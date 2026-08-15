import { useEffect, useState } from 'react'
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import MinimizeIcon from '@mui/icons-material/Minimize'
import CropSquareIcon from '@mui/icons-material/CropSquare'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import CloseIcon from '@mui/icons-material/Close'
import type { ThemeName } from '../../../shared/types'
import { PLAIN_CHROME_THEMES } from '../themes'
// 64px WebP for a 22px render, imported so vite fingerprints and bundles it. The
// previous `BASE_URL + 'corvath.png'` pulled the 1254px/2.36 MB master out of the
// publicDir, which also meant a second copy of it in the packaged app.
import logoUrl from '../assets/corvath.webp'

// Interactive controls must opt out of the window-drag region.
const noDrag = { WebkitAppRegion: 'no-drag' } as const

interface TitleBarProps {
  /** Still needed: the plain-chrome themes repaint the bar's foreground. */
  themeName: ThemeName
}

export default function TitleBar({ themeName }: TitleBarProps) {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    void window.api.window.isMaximized().then(setMaximized)
    return window.api.window.onMaximizeChange(setMaximized)
  }, [])

  // The corporate themes paint a flat navy/charcoal bar. Mundanes is a light
  // theme, so its default input/text colors are dark and would vanish on the
  // navy bar — force a white chrome foreground when a plain-chrome theme is
  // active. The four stylized themes carry their own dark chrome and need no
  // override. (The theme Select that also needed this lives on the Settings
  // page now, on an ordinary Paper, so it needs no chrome override at all.)
  const plain = PLAIN_CHROME_THEMES.includes(themeName)
  const chromeFg = plain ? 'common.white' : undefined

  return (
    <AppBar position="static" elevation={0} sx={{ WebkitAppRegion: 'drag', userSelect: 'none' }}>
      <Toolbar data-testid="title-bar" variant="dense" sx={{ minHeight: 40, px: 1.5 }}>
        <Box
          component="img"
          src={logoUrl}
          alt=""
          sx={{ width: 22, height: 22, mr: 1.5, borderRadius: '4px', display: 'block' }}
        />
        <Typography
          variant="h6"
          sx={{ fontSize: '1rem', letterSpacing: '0.14em', color: chromeFg }}
        >
          Corvath
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Minimize">
          <IconButton
            size="small"
            sx={{ ...noDrag, color: chromeFg }}
            aria-label="minimize"
            onClick={() => window.api.window.minimize()}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={maximized ? 'Restore' : 'Maximize'}>
          <IconButton
            size="small"
            sx={{ ...noDrag, color: chromeFg }}
            aria-label="maximize"
            onClick={() => window.api.window.toggleMaximize()}
          >
            {maximized ? <FilterNoneIcon fontSize="small" /> : <CropSquareIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Close">
          <IconButton
            size="small"
            sx={{
              ...noDrag,
              color: chromeFg,
              '&:hover': { bgcolor: 'error.main', color: 'common.white' }
            }}
            aria-label="close"
            onClick={() => window.api.window.close()}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
