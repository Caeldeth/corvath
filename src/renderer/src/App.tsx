import { useEffect, useMemo, useState } from 'react'
import { Box, CssBaseline, ThemeProvider, Typography } from '@mui/material'
import type { ThemeName } from '../../shared/types'
import { hybrasylTheme, themes } from './themes'
import { useReadings } from './hooks/useReadings'
import TitleBar from './components/TitleBar'
import ReadingList from './components/ReadingList'
import ReadingEditor from './components/ReadingEditor'

function App(): React.JSX.Element {
  const [themeName, setThemeName] = useState<ThemeName>('hybrasyl')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const {
    readings,
    loaded,
    createReading,
    updateReading,
    deleteReading,
    addEntry,
    updateEntry,
    deleteEntry
  } = useReadings()

  // Load the persisted theme once on mount.
  useEffect(() => {
    window.api.loadSettings().then((s) => setThemeName(s.theme ?? 'hybrasyl'))
  }, [])

  const changeTheme = (name: ThemeName): void => {
    setThemeName(name)
    void window.api.saveSettings({ theme: name })
  }

  const theme = themes[themeName] ?? hybrasylTheme

  // Keep selection valid; default to the first reading once loaded.
  useEffect(() => {
    if (!loaded) return
    if (selectedId && !readings.some((r) => r.id === selectedId)) {
      setSelectedId(readings[0]?.id ?? null)
    } else if (!selectedId && readings.length > 0) {
      setSelectedId(readings[0].id)
    }
  }, [loaded, readings, selectedId])

  const selectedReading = useMemo(
    () => readings.find((r) => r.id === selectedId) ?? null,
    [readings, selectedId]
  )

  const handleCreate = (): void => {
    const reading = createReading()
    setSelectedId(reading.id)
  }

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

        <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
          <ReadingList
            readings={readings}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={handleCreate}
            onDelete={deleteReading}
          />

          {selectedReading ? (
            <ReadingEditor
              key={selectedReading.id}
              reading={selectedReading}
              onChange={(patch) => updateReading(selectedReading.id, patch)}
              onAddEntry={() => addEntry(selectedReading.id)}
              onUpdateEntry={(entryId, patch) => updateEntry(selectedReading.id, entryId, patch)}
              onDeleteEntry={(entryId) => deleteEntry(selectedReading.id, entryId)}
            />
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1" sx={{ opacity: 0.6 }}>
                Select a reading, or create a new one.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
