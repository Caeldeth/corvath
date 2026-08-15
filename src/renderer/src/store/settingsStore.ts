import { create } from 'zustand'
import type { DrawMode, ThemeName } from '../../../shared/types'
import { createDebouncedSaver } from './persist'
import { parseDefaultId, parseDrawMode } from '../lib/settingsFields'

interface SettingsState {
  theme: ThemeName
  /** Draw-tab defaults; undefined means "no default, pick the first". */
  defaultDeckId?: string
  defaultLayoutId?: string
  defaultDrawMode?: DrawMode
  hydrated: boolean
  setTheme: (name: ThemeName) => void
  setDefaultDeckId: (id: string | undefined) => void
  setDefaultLayoutId: (id: string | undefined) => void
  setDefaultDrawMode: (mode: DrawMode | undefined) => void
  hydrate: () => Promise<void>
}

// Suppress the save that the hydrate() set() would otherwise trigger — loading
// from disk and immediately saving the identical bytes back would bounce
// settings.json on every launch (and, under HMR, persist defaults over real
// data). See mundanes/dubhaimid themes doc §6.
let suppressNextSave = false

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'hybrasyl',
  hydrated: false,

  setTheme: (name) => set({ theme: name }),

  // Every setter screens its value first, so only something that will survive
  // `settingsSchema` reaches the store. One field main rejects would reject the
  // WHOLE document — the theme with it — and the only symptom is a console line.
  setDefaultDeckId: (id) => {
    const parsed = parseDefaultId(id)
    if (parsed.ok) set({ defaultDeckId: parsed.value })
  },
  setDefaultLayoutId: (id) => {
    const parsed = parseDefaultId(id)
    if (parsed.ok) set({ defaultLayoutId: parsed.value })
  },
  setDefaultDrawMode: (mode) => {
    const parsed = parseDrawMode(mode)
    if (parsed.ok) set({ defaultDrawMode: parsed.value })
  },

  hydrate: async () => {
    if (useSettingsStore.getState().hydrated) return
    const loaded = await window.api.loadSettings()
    suppressNextSave = true
    // Screened on the way IN as well: settings.json is a file on disk that a
    // person can edit, so what it holds is input rather than state.
    const deck = parseDefaultId(loaded.defaultDeckId)
    const layout = parseDefaultId(loaded.defaultLayoutId)
    const mode = parseDrawMode(loaded.defaultDrawMode)
    set({
      theme: loaded.theme ?? 'hybrasyl',
      defaultDeckId: deck.ok ? deck.value : undefined,
      defaultLayoutId: layout.ok ? layout.value : undefined,
      defaultDrawMode: mode.ok ? mode.value : undefined,
      hydrated: true
    })
  }
}))

const saver = createDebouncedSaver(() => {
  if (typeof window === 'undefined' || !window.api) return
  const { theme, defaultDeckId, defaultLayoutId, defaultDrawMode } = useSettingsStore.getState()
  window.api
    .saveSettings({ theme, defaultDeckId, defaultLayoutId, defaultDrawMode })
    .catch((err) => console.error('[settings] save failed:', err))
})

useSettingsStore.subscribe((state) => {
  if (!state.hydrated) return
  if (suppressNextSave) {
    suppressNextSave = false
    return
  }
  saver.schedule()
})
