import { useEffect, useState } from 'react'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import type { ThemeName } from '../../shared/types'
import { hybrasylTheme, themes } from './themes'
import { useSettingsStore } from './store/settingsStore'
import { useReadingsStore } from './store/readingsStore'
import { useDecksStore } from './store/decksStore'
import { useLayoutsStore } from './store/layoutsStore'
import { useDecks } from './hooks/useDecks'
import { useLayouts } from './hooks/useLayouts'
import TitleBar from './components/TitleBar'
import NavBar, { type View } from './components/NavBar'
import Readings from './pages/Readings'
import DeckBuilder from './pages/DeckBuilder'
import Layouts from './pages/Layouts'

function App(): React.JSX.Element {
  const themeName = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const [view, setView] = useState<View>('readings')
  const decksApi = useDecks()
  const layoutsApi = useLayouts()

  // Hydrate every store once at startup, so pages no longer reload from disk
  // when they remount on a tab switch.
  useEffect(() => {
    void useSettingsStore.getState().hydrate()
    void useReadingsStore.getState().hydrate()
    void useDecksStore.getState().hydrate()
    void useLayoutsStore.getState().hydrate()
  }, [])

  const changeTheme = (name: ThemeName): void => setTheme(name)

  const theme = themes[themeName] ?? hybrasylTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
      >
        <TitleBar themeName={themeName} onThemeChange={changeTheme} />
        <NavBar view={view} onChange={setView} />

        {view === 'readings' && <Readings decks={decksApi.decks} layouts={layoutsApi.layouts} />}
        {view === 'decks' && <DeckBuilder api={decksApi} />}
        {view === 'layouts' && <Layouts api={layoutsApi} />}
      </Box>
    </ThemeProvider>
  )
}

export default App
