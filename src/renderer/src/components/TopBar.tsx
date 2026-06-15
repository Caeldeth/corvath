import { AppBar, MenuItem, Select, Toolbar, Typography } from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import type { ThemeName } from '../../../shared/types'
import { THEME_OPTIONS } from '../themes'

interface TopBarProps {
  themeName: ThemeName
  onThemeChange: (name: ThemeName) => void
}

export default function TopBar({ themeName, onThemeChange }: TopBarProps) {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar variant="dense">
        <AutoStoriesIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1rem', letterSpacing: '0.14em' }}>
          Tarot Reading Recorder
        </Typography>
        <Select
          size="small"
          value={themeName}
          onChange={(e) => onThemeChange(e.target.value as ThemeName)}
          aria-label="theme"
          sx={{ minWidth: 130 }}
        >
          {THEME_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Toolbar>
    </AppBar>
  )
}
