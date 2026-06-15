import type { Reading, Settings, ThemeName } from '../shared/types'
import { createJsonStore } from './jsonStore'

const THEME_NAMES: ThemeName[] = ['hybrasyl', 'danaan', 'chadul', 'grinneal']
const DEFAULT_SETTINGS: Settings = { theme: 'hybrasyl' }

const READINGS_VERSION = 1
interface ReadingsFile {
  version: number
  readings: Reading[]
}
const DEFAULT_READINGS_FILE: ReadingsFile = { version: READINGS_VERSION, readings: [] }

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

export interface Stores {
  loadSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  loadReadings(): Promise<Reading[]>
  saveReadings(readings: Reading[]): Promise<void>
}

/**
 * Create the hardened settings + readings stores rooted at `dir`
 * (the roaming app-data directory). Both files are crash-safe and recover
 * from a backup if the primary is corrupted.
 */
export function createStores(dir: string): Stores {
  const settings = createJsonStore<Settings>({
    dir,
    filename: 'settings.json',
    defaults: DEFAULT_SETTINGS,
    normalize: (data) => {
      if (!isObject(data)) return null
      const theme = data.theme
      return {
        theme: THEME_NAMES.includes(theme as ThemeName)
          ? (theme as ThemeName)
          : DEFAULT_SETTINGS.theme
      }
    }
  })

  const readings = createJsonStore<ReadingsFile>({
    dir,
    filename: 'readings.json',
    defaults: DEFAULT_READINGS_FILE,
    normalize: (data) => {
      if (!isObject(data) || !Array.isArray(data.readings)) return null
      return { version: READINGS_VERSION, readings: data.readings as Reading[] }
    }
  })

  return {
    loadSettings: () => settings.load(),
    saveSettings: (value) => settings.save(value),
    loadReadings: () => readings.load().then((file) => file.readings),
    saveReadings: (value) => readings.save({ version: READINGS_VERSION, readings: value })
  }
}
