import { create } from 'zustand'
import type { ThemeName } from '../../../shared/types'
import { createDebouncedSaver } from './persist'

interface SettingsState {
  theme: ThemeName
  hydrated: boolean
  setTheme: (name: ThemeName) => void
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

  hydrate: async () => {
    if (useSettingsStore.getState().hydrated) return
    const loaded = await window.api.loadSettings()
    suppressNextSave = true
    set({ theme: loaded.theme ?? 'hybrasyl', hydrated: true })
  }
}))

const saver = createDebouncedSaver(() => {
  if (typeof window === 'undefined' || !window.api) return
  const { theme } = useSettingsStore.getState()
  window.api.saveSettings({ theme }).catch((err) => console.error('[settings] save failed:', err))
})

useSettingsStore.subscribe((state) => {
  if (!state.hydrated) return
  if (suppressNextSave) {
    suppressNextSave = false
    return
  }
  saver.schedule()
})
