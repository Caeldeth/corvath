import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Reading } from '../../shared/types'
import { createStores } from '../store'
import { getReadings, saveDecks, saveReadings, saveSettings } from '../handlers'
import type { HandlerContext } from '../handlers'

let dir: string
let bundled: string
let counter = 0
let ctx: HandlerContext

beforeEach(async () => {
  dir = join(tmpdir(), `corvath-handlers-${process.pid}-${counter++}`)
  bundled = join(dir, 'bundled')
  await fs.mkdir(bundled, { recursive: true })
  ctx = { store: createStores(dir, bundled) }
})

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true })
})

const reading = (): Reading => ({
  id: 'r1',
  title: 'T',
  date: '2026-07-09',
  deck: 'Thoth',
  entries: [{ id: 'e1', topic: '', question: '', card: 'The Star' }],
  createdAt: 'now',
  updatedAt: 'now'
})

const fileContents = (name: string): Promise<string> => fs.readFile(join(dir, name), 'utf-8')

describe('handlers — valid payloads persist', () => {
  it('saveReadings writes and getReadings reads back', async () => {
    await saveReadings(ctx, [reading()])
    expect(await getReadings(ctx)).toEqual([reading()])
  })
})

describe('handlers — invalid payloads reject without touching disk', () => {
  it('saveReadings rejects a malformed reading and leaves no file', async () => {
    // Missing required fields (title/date/entries).
    await expect(saveReadings(ctx, [{ id: 'x' }])).rejects.toBeInstanceOf(Error)
    await expect(fs.access(join(dir, 'readings.json'))).rejects.toBeTruthy()
  })

  it('saveReadings rejecting does not overwrite an existing good file', async () => {
    await saveReadings(ctx, [reading()])
    const before = await fileContents('readings.json')
    await expect(saveReadings(ctx, 'not an array')).rejects.toBeInstanceOf(Error)
    expect(await fileContents('readings.json')).toBe(before)
  })

  it('saveDecks rejects a non-array payload', async () => {
    await expect(saveDecks(ctx, { decks: [] })).rejects.toBeInstanceOf(Error)
    await expect(fs.access(join(dir, 'decks.json'))).rejects.toBeTruthy()
  })

  it('saveSettings rejects an unknown theme', async () => {
    await expect(saveSettings(ctx, { theme: 'neon' })).rejects.toBeInstanceOf(Error)
    await expect(fs.access(join(dir, 'settings.json'))).rejects.toBeTruthy()
  })
})
