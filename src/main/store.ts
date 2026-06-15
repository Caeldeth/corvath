import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import type { Reading, Settings } from '../shared/types'

const READINGS_VERSION = 1

const readingsFile = (): string => join(app.getPath('userData'), 'readings.json')
const settingsFile = (): string => join(app.getPath('userData'), 'settings.json')

const DEFAULT_SETTINGS: Settings = { theme: 'hybrasyl' }

/** Write atomically: write a temp file, then rename over the target. */
async function atomicWrite(file: string, data: string): Promise<void> {
  const tmp = `${file}.tmp`
  await fs.writeFile(tmp, data, 'utf-8')
  await fs.rename(tmp, file)
}

function isMissing(err: unknown): boolean {
  return (err as NodeJS.ErrnoException)?.code === 'ENOENT'
}

export async function loadReadings(): Promise<Reading[]> {
  try {
    const raw = await fs.readFile(readingsFile(), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.readings) ? (parsed.readings as Reading[]) : []
  } catch (err) {
    if (isMissing(err)) return []
    throw err
  }
}

export async function saveReadings(readings: Reading[]): Promise<void> {
  await atomicWrite(readingsFile(), JSON.stringify({ version: READINGS_VERSION, readings }, null, 2))
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(settingsFile(), 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch (err) {
    if (isMissing(err)) return { ...DEFAULT_SETTINGS }
    throw err
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await atomicWrite(settingsFile(), JSON.stringify(settings, null, 2))
}
