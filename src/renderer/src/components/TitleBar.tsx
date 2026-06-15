import { useEffect, useState } from 'react'
import { AppBar, Box, IconButton, MenuItem, Select, Toolbar, Tooltip, Typography } from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import MinimizeIcon from '@mui/icons-material/Minimize'
import CropSquareIcon from '@mui/icons-material/CropSquare'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import CloseIcon from '@mui/icons-material/Close'
import type { ThemeName } from '../../../shared/types'
import { THEME_OPTIONS } from '../themes'

// Interactive controls must opt out of the window-drag region.
const noDrag = { WebkitAppRegion: 'no-drag' } as const

interface TitleBarProps {
  themeName: ThemeName
  onThemeChange: (name: ThemeName) => void
}

export default function TitleBar({ themeName, onThemeChange }: TitleBarProps) {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    void window.api.window.isMaximized().then(setMaximized)
    return window.api.window.onMaximizeChange(setMaximized)
  }, [])

  return (
    <AppBar position="static" elevation={0} sx={{ WebkitAppRegion: 'drag', userSelect: 'none' }}>
      <Toolbar variant="dense" sx={{ minHeight: 40, px: 1.5 }}>
        <AutoStoriesIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ fontSize: '1rem', letterSpacing: '0.14em' }}>
          Tarot Reading Recorder
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Select
          size="small"
          value={themeName}
          onChange={(e) => onThemeChange(e.target.value as ThemeName)}
          aria-label="theme"
          sx={{ ...noDrag, minWidth: 130, mr: 1 }}
        >
          {THEME_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <Tooltip title="Minimize">
          <IconButton
            size="small"
            sx={noDrag}
            aria-label="minimize"
            onClick={() => window.api.window.minimize()}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={maximized ? 'Restore' : 'Maximize'}>
          <IconButton
            size="small"
            sx={noDrag}
            aria-label="maximize"
            onClick={() => window.api.window.toggleMaximize()}
          >
            {maximized ? <FilterNoneIcon fontSize="small" /> : <CropSquareIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Close">
          <IconButton
            size="small"
            sx={{ ...noDrag, '&:hover': { bgcolor: 'error.main', color: 'common.white' } }}
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
