import { useEffect, useState } from 'react'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import type { ThemeName } from '../../shared/types'
import { hybrasylTheme, themes } from './themes'
import { useDecks } from './hooks/useDecks'
import { useLayouts } from './hooks/useLayouts'
import TitleBar from './components/TitleBar'
import NavBar, { type View } from './components/NavBar'
import Readings from './pages/Readings'
import DeckBuilder from './pages/DeckBuilder'
import Layouts from './pages/Layouts'

function App(): React.JSX.Element {
  const [themeName, setThemeName] = useState<ThemeName>('hybrasyl')
  const [view, setView] = useState<View>('readings')
  const decksApi = useDecks()
  const layoutsApi = useLayouts()

  // Load the persisted theme once on mount.
  useEffect(() => {
    window.api.loadSettings().then((s) => setThemeName(s.theme ?? 'hybrasyl'))
  }, [])

  const changeTheme = (name: ThemeName): void => {
    setThemeName(name)
    void window.api.saveSettings({ theme: name })
  }

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
