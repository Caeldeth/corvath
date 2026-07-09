import { useEffect, useState } from 'react'
import {
  AppBar,
  Box,
  IconButton,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import MinimizeIcon from '@mui/icons-material/Minimize'
import CropSquareIcon from '@mui/icons-material/CropSquare'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import CloseIcon from '@mui/icons-material/Close'
import type { ThemeName } from '../../../shared/types'
import { PLAIN_CHROME_THEMES, THEME_OPTIONS } from '../themes'

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

  // The corporate themes paint a flat navy/charcoal bar. Mundanes is a light
  // theme, so its default input/text colors are dark and would vanish on the
  // navy bar — force white chrome foreground and a translucent-white Select
  // outline when a plain-chrome theme is active. The four stylized themes carry
  // their own dark chrome and need no override.
  const plain = PLAIN_CHROME_THEMES.includes(themeName)
  const chromeFg = plain ? 'common.white' : undefined
  const selectSx = plain
    ? {
        ...noDrag,
        minWidth: 130,
        mr: 1,
        color: 'common.white',
        '& .MuiSvgIcon-root': { color: 'common.white' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.9)' }
      }
    : { ...noDrag, minWidth: 130, mr: 1 }

  return (
    <AppBar position="static" elevation={0} sx={{ WebkitAppRegion: 'drag', userSelect: 'none' }}>
      <Toolbar variant="dense" sx={{ minHeight: 40, px: 1.5 }}>
        <AutoStoriesIcon sx={{ mr: 1.5, color: chromeFg }} />
        <Typography
          variant="h6"
          sx={{ fontSize: '1rem', letterSpacing: '0.14em', color: chromeFg }}
        >
          Tarot Reading Recorder
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Select
          size="small"
          value={themeName}
          onChange={(e) => onThemeChange(e.target.value as ThemeName)}
          aria-label="theme"
          sx={selectSx}
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
